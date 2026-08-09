// SCH-4 — self-serve one-off 1:1 booking (spec 03), gated by the
// self_serve_booking_enabled knob. A request is a PENDING one-off class +
// enrollment + TTL'd slot hold (origin self_serve_booking); the session is
// created only when the instructor accepts. Cost = the
// default_one_on_one_credit_cost knob (per-instructor/subject rates arrive
// with the Top-Up spec). The credit gate runs BEFORE the hold — never a hold
// on unfunded requests. Room availability is validated here at booking time,
// AND open-slots now subtracts intervals where every fittable room is busy
// (slotFinder.allRoomsBusyIntervals) so a slot with no free room is never
// advertised — the booking-time check remains the backstop.
import express from 'express';
import { DateTime } from 'luxon';
import { authenticateToken } from '../middleware/auth.js';
import { getSettings } from '../helpers/institutionSettings.js';
import { canActForStudent } from '../helpers/authz.js';
import { instructorFree, bestFitRoom, studentCollision } from '../helpers/slotFinder.js';
import { logNotifications, notifyFamily } from '../helpers/notify.js';
import { assertUtcIso } from 'mobius-lms';
import { withTransaction } from '../helpers/withTransaction.js';
import { HttpError } from '../helpers/httpError.js';
import { isCalendarConflict } from '../helpers/pgErrors.js';

const router = express.Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// POST / — request a one-off 1:1 slot
// ---------------------------------------------------------------------------
router.post('/', authenticateToken, async (req, res) => {
  const settings = await getSettings(req.db);
  if (!settings.self_serve_booking_enabled) {
    return res.status(403).json({ message: 'Self-serve booking is not enabled for this academy' });
  }

  const { instructor_id, subject_id, starts_at, ends_at, tz } = req.body;
  try {
    assertUtcIso(starts_at);
    assertUtcIso(ends_at);
  } catch {
    return res.status(400).json({ message: 'starts_at/ends_at must be UTC ISO strings with Z suffix' });
  }
  if (DateTime.fromISO(ends_at) <= DateTime.fromISO(starts_at)) {
    return res.status(400).json({ message: 'ends_at must be after starts_at' });
  }
  if (DateTime.fromISO(starts_at) <= DateTime.utc()) {
    return res.status(400).json({ message: 'the requested time must be in the future' });
  }
  if (!tz || !DateTime.now().setZone(tz).isValid) {
    return res.status(400).json({ message: 'a valid tz (academy wall-clock zone) is required' });
  }

  const studentId = Number(req.body.student_id ?? (req.user.role === 'student' ? req.user.user_id : NaN));
  if (!studentId) return res.status(400).json({ message: 'student_id is required' });
  if (!await canActForStudent(req.db, req.user, studentId)) {
    return res.status(403).json({ message: 'Not authorized to act for this student' });
  }
  const { rows: [stu] } = await req.db.query(
    `SELECT u.is_active FROM students s JOIN users u ON u.user_id = s.student_id WHERE s.student_id = $1`,
    [studentId]);
  if (!stu) return res.status(404).json({ message: 'Student not found' });
  if (!stu.is_active) return res.status(400).json({ message: 'Student account is inactive' });

  const { rows: [instr] } = await req.db.query(
    `SELECT u.is_active,
            EXISTS (SELECT 1 FROM instructor_specialties
                     WHERE instructor_id = $1 AND subject_id = $2) AS qualified
       FROM instructors i JOIN users u ON u.user_id = i.instructor_id
      WHERE i.instructor_id = $1`,
    [instructor_id, subject_id]);
  if (!instr) return res.status(400).json({ message: 'Instructor not found' });
  if (!instr.is_active) return res.status(400).json({ message: 'Instructor account is inactive' });
  if (!instr.qualified) return res.status(400).json({ message: 'Instructor is not qualified to teach this subject' });

  if (!await instructorFree(req.db, instructor_id, starts_at, ends_at)) {
    return res.status(409).json({ message: 'The instructor is not free at that time' });
  }
  if (!await bestFitRoom(req.db, starts_at, ends_at, 1)) {
    return res.status(400).json({ message: 'No room is available at that time' });
  }
  const collision = await studentCollision(req.db, studentId, starts_at, ends_at);
  if (collision) {
    return res.status(400).json({ message: `The requested time overlaps the student's ${collision.subject} session` });
  }

  // credit gate BEFORE the hold — unfunded requests never reserve anything
  const cost = settings.default_one_on_one_credit_cost;
  const { rows: w } = await req.db.query(`SELECT balance FROM wallets WHERE student_id = $1`, [studentId]);
  const balance = w.length ? w[0].balance : 0;
  if (balance < cost) {
    return res.status(400).json({
      code: 'INSUFFICIENT_CREDITS',
      message: `Student is ${cost - balance} credits short (${balance}/${cost}) — top up, then retry`,
      required: cost, balance, shortfall: cost - balance
    });
  }

  const expiresAt = DateTime.utc().plus({ hours: settings.instructor_response_window_hours }).toISO();
  const startsOn = DateTime.fromISO(starts_at).setZone(tz).toISODate();
  try {
    const created = await withTransaction(req.db, async (client) => {
    const { rows: [hold] } = await client.query(
      `INSERT INTO slot_holds (instructor_id, starts_at, ends_at, origin, held_for_student_id, expires_at, created_by)
       VALUES ($1,$2,$3,'self_serve_booking',$4,$5,$6) RETURNING hold_id, expires_at`,
      [instructor_id, starts_at, ends_at, studentId, expiresAt, req.user.user_id]);
    const { rows: [cls] } = await client.query(
      `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit, session_credit_cost,
                            recurrence, starts_on, status, booking_hold_id, created_by)
       VALUES ('one_on_one',$1,$2,1,$3,'none',$4,'pending',$5,$6) RETURNING class_id`,
      [subject_id, instructor_id, cost, startsOn, hold.hold_id, req.user.user_id]);
    await client.query(
      `INSERT INTO enrollments (class_id, student_id, joined_by) VALUES ($1,$2,$3)`,
      [cls.class_id, studentId, req.user.user_id]);
    await logNotifications(client, {
      eventType: 'booking_requested', recipientUserIds: [instructor_id],
      subjectType: 'class', subjectId: cls.class_id,
      payload: { student_id: studentId, starts_at, ends_at, subject_id }
    });
    return { class_id: cls.class_id, hold_expires_at: hold.expires_at, cost };
    });
    res.status(201).json(created);
  } catch (err) {
    if (isCalendarConflict(err)) {
      // INV-3: a racing family already holds or booked that slot
      return res.status(409).json({ message: 'That slot was just taken — refresh the calendar and pick another time' });
    }
    throw err;
  }
});

// ---------------------------------------------------------------------------
// GET / — pending bookings inbox: instructors see their own, staff see all
// ---------------------------------------------------------------------------
router.get('/', authenticateToken, async (req, res) => {
  const isStaff = req.user.role === 'staff';
  if (!isStaff && req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Staff or instructors only' });
  }
  const { rows } = await req.db.query(
    `SELECT c.class_id, c.instructor_id, c.session_credit_cost, c.created_at,
            sub.name AS subject, h.starts_at, h.ends_at, h.expires_at,
            h.status AS hold_status, h.held_for_student_id, u.name AS student_name
       FROM classes c
       JOIN slot_holds h ON h.hold_id = c.booking_hold_id
       JOIN subjects sub ON sub.subject_id = c.subject_id
       LEFT JOIN users u ON u.user_id = h.held_for_student_id
      WHERE c.status = 'pending' AND ($1 OR c.instructor_id = $2)
      ORDER BY h.starts_at`,
    [isStaff, req.user.user_id]);
  res.json(rows);
});

// ---------------------------------------------------------------------------
// POST /:classId/respond — the instructor (or staff, after escalation)
// accepts or rejects the pending booking
// ---------------------------------------------------------------------------
router.post('/:classId/respond', authenticateToken, async (req, res) => {
  const { action, reason } = req.body;
  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'action must be accept or reject' });
  }
  if (!UUID_RE.test(req.params.classId)) return res.status(404).json({ message: 'Booking not found' });

  const { rows: [booking] } = await req.db.query(
    `SELECT c.*, h.starts_at AS held_starts_at, h.ends_at AS held_ends_at,
            h.held_for_student_id, h.status AS hold_status
       FROM classes c JOIN slot_holds h ON h.hold_id = c.booking_hold_id
      WHERE c.class_id = $1 AND c.recurrence = 'none'`,
    [req.params.classId]);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (booking.status !== 'pending') return res.status(400).json({ message: `Booking is ${booking.status}` });

  const isStaff = req.user.role === 'staff';
  if (!isStaff && !(req.user.role === 'instructor' && req.user.user_id === booking.instructor_id)) {
    return res.status(403).json({ message: 'Only this booking\'s instructor or staff can respond' });
  }

  const studentId = booking.held_for_student_id;
  try {
    const outcome = await withTransaction(req.db, async (client) => {
    if (action === 'accept') {
      await client.query(`UPDATE classes SET status = 'active' WHERE class_id = $1`, [booking.class_id]);
      await client.query(
        `UPDATE slot_holds SET status = 'confirmed' WHERE hold_id = $1 AND status IN ('active','expired')`,
        [booking.booking_hold_id]);
      // room auto-assign, capacity-fit, resolved inside the tx
      const room = await bestFitRoom(client, booking.held_starts_at, booking.held_ends_at, 1);
      if (!room) {
        throw new HttpError(409, { message: 'No room is available at that time anymore' });
      }
      const { rows: [session] } = await client.query(
        `INSERT INTO class_sessions (class_id, instructor_id, room_id, starts_at, ends_at)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [booking.class_id, booking.instructor_id, room.room_id, booking.held_starts_at, booking.held_ends_at]);
      await notifyFamily(client, {
        studentId: studentId, eventType: 'booking_accepted', subjectType: 'class', subjectId: booking.class_id,
        payload: { session_id: session.session_id, starts_at: booking.held_starts_at, room: room.name }
      });
      return { class_id: booking.class_id, status: 'active', session };
    }

    // reject: release the slot, drop the never-active pending class
    await client.query(
      `UPDATE slot_holds SET status = 'released' WHERE hold_id = $1 AND status = 'active'`,
      [booking.booking_hold_id]);
    await client.query(`DELETE FROM classes WHERE class_id = $1`, [booking.class_id]);
    await notifyFamily(client, {
      studentId: studentId, eventType: 'booking_rejected', subjectType: 'class', subjectId: booking.class_id,
      payload: { reason: reason ?? null, starts_at: booking.held_starts_at, offer_alternatives: true }
    });
    return { class_id: booking.class_id, status: 'rejected' };
    });
    res.json(outcome);
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json(err.body);
    if (isCalendarConflict(err)) {
      return res.status(409).json({
        message: 'Scheduling conflict — the instructor or room is already booked in that window',
        detail: err.detail ?? null
      });
    }
    throw err;
  }
});

export default router;
