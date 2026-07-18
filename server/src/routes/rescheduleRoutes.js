// Reschedule request resolution (spec 07 RSC-1 step 4): the session's
// instructor (or staff, esp. on escalated requests) accepts or rejects.
// Accept = the atomic swap: original -> 'moved' (terminal), successor row in
// the same class carrying rescheduled_from + the appended reschedule_chain.
// Billing never moves here (INV-1) — the one deduction fires on attendance.
import express from 'express';
import { DateTime } from 'luxon';
import { authenticateToken } from '../middleware/auth.js';
import { getSettings } from '../helpers/institutionSettings.js';
import { insideWindow } from '../helpers/scheduleWindow.js';
import { bestFitRoom } from '../helpers/slotFinder.js';
import { notifyFamily } from '../helpers/notify.js';
import { withTransaction } from '../helpers/withTransaction.js';
import { HttpError } from '../helpers/httpError.js';
import { isCalendarConflict } from '../helpers/pgErrors.js';

const router = express.Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The inbox list: what needs a response. Instructors see their own sessions'
// requests; staff see all (they act on escalations).
router.get('/', authenticateToken, async (req, res) => {
  const isStaff = req.user.role === 'staff';
  if (!isStaff && req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Staff or instructors only' });
  }
  const statuses = String(req.query.status ?? 'pending,escalated').split(',');
  const { rows } = await req.db.query(
    `SELECT r.request_id, r.status, r.proposed_starts_at, r.proposed_ends_at, r.created_at,
            cs.session_id, cs.starts_at AS original_starts_at, cs.instructor_id,
            sub.name AS subject, h.held_for_student_id, u.name AS student_name
       FROM reschedule_requests r
       JOIN class_sessions cs ON cs.session_id = r.session_id
       JOIN classes c ON c.class_id = cs.class_id
       JOIN subjects sub ON sub.subject_id = c.subject_id
       LEFT JOIN slot_holds h ON h.hold_id = r.hold_id
       LEFT JOIN users u ON u.user_id = h.held_for_student_id
      WHERE r.status = ANY($1) AND ($2 OR cs.instructor_id = $3)
      ORDER BY r.created_at`,
    [statuses, isStaff, req.user.user_id]);
  res.json(rows);
});

router.post('/:id/respond', authenticateToken, async (req, res) => {
  const { action, reason } = req.body;
  if (!['accept', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'action must be accept or reject' });
  }
  if (!UUID_RE.test(req.params.id)) return res.status(404).json({ message: 'Request not found' });

  const { rows: [request] } = await req.db.query(
    `SELECT r.*, cs.class_id, cs.instructor_id, cs.starts_at AS original_starts_at,
            cs.reschedule_chain, h.held_for_student_id, h.status AS hold_status
       FROM reschedule_requests r
       JOIN class_sessions cs ON cs.session_id = r.session_id
       LEFT JOIN slot_holds h ON h.hold_id = r.hold_id
      WHERE r.request_id = $1`, [req.params.id]);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (!['pending', 'escalated'].includes(request.status)) {
    return res.status(400).json({ message: `Request already ${request.status}` });
  }

  const isStaff = req.user.role === 'staff';
  if (!isStaff && !(req.user.role === 'instructor' && req.user.user_id === request.instructor_id)) {
    return res.status(403).json({ message: 'Only this session\'s instructor or staff can respond' });
  }

  const settings = await getSettings(req.db);
  const studentId = request.held_for_student_id;
  const nowIso = DateTime.utc().toISO();

  // Hard stop (lazy — the deadline job also enforces it): once the Window
  // before the ORIGINAL session closes, the request expires and the original
  // stands. Applies to accepts and rejects alike.
  if (insideWindow(request.original_starts_at, settings)) {
    await withTransaction(req.db, async (client) => {
      await client.query(
        `UPDATE reschedule_requests SET status = 'expired' WHERE request_id = $1`, [request.request_id]);
      if (request.hold_id) {
        await client.query(
          `UPDATE slot_holds SET status = 'expired' WHERE hold_id = $1 AND status = 'active'`, [request.hold_id]);
      }
      await client.query(
        `UPDATE class_sessions SET status = 'scheduled' WHERE session_id = $1 AND status = 'reschedule_requested'`,
        [request.session_id]);
      if (studentId) {
        await notifyFamily(client, {
          studentId: studentId, eventType: 'reschedule_expired', subjectType: 'reschedule_request', subjectId: request.request_id,
          payload: { session_id: request.session_id, original_starts_at: request.original_starts_at }
        });
      }
    });
    return res.status(400).json({
      message: 'The reschedule window has closed — the original session stands',
      request_status: 'expired'
    });
  }

  if (action === 'reject') {
    await withTransaction(req.db, async (client) => {
      await client.query(
        `UPDATE reschedule_requests SET status = 'rejected', responded_by = $1, responded_at = CURRENT_TIMESTAMP
          WHERE request_id = $2`, [req.user.user_id, request.request_id]);
      if (request.hold_id) {
        await client.query(
          `UPDATE slot_holds SET status = 'released' WHERE hold_id = $1 AND status = 'active'`, [request.hold_id]);
      }
      await client.query(
        `UPDATE class_sessions SET status = 'scheduled' WHERE session_id = $1 AND status = 'reschedule_requested'`,
        [request.session_id]);
      if (studentId) {
        await notifyFamily(client, {
          studentId: studentId, eventType: 'reschedule_rejected', subjectType: 'reschedule_request', subjectId: request.request_id,
          payload: { reason: reason ?? null, session_id: request.session_id, offer_other_times: true }
        });
      }
    });
    return res.json({ request_id: request.request_id, status: 'rejected' });
  }

  // accept — the atomic swap
  const { rows: [{ roster }] } = await req.db.query(
    `SELECT count(*)::int AS roster FROM enrollments WHERE class_id = $1 AND status = 'active'`,
    [request.class_id]);

  try {
    const successor = await withTransaction(req.db, async (client) => {
    await client.query(
      `UPDATE reschedule_requests SET status = 'accepted', responded_by = $1, responded_at = CURRENT_TIMESTAMP
        WHERE request_id = $2`, [req.user.user_id, request.request_id]);
    if (request.hold_id) {
      await client.query(
        `UPDATE slot_holds SET status = 'confirmed' WHERE hold_id = $1 AND status IN ('active','expired')`,
        [request.hold_id]);
    }
    await client.query(
      `UPDATE class_sessions SET status = 'moved' WHERE session_id = $1`, [request.session_id]);

    // room auto-assign, capacity-fit, re-resolved inside the swap
    const room = await bestFitRoom(client, request.proposed_starts_at, request.proposed_ends_at, Math.max(roster, 1));
    if (!room) {
      throw new HttpError(409, { message: 'No room is available at that time anymore — pick another slot' });
    }

    const chain = [...(request.reschedule_chain ?? []), {
      from: request.original_starts_at, to: request.proposed_starts_at,
      requested_by: request.requested_by, responded_by: req.user.user_id, responded_at: nowIso
    }];
    const { rows: [row] } = await client.query(
      `INSERT INTO class_sessions (class_id, instructor_id, room_id, starts_at, ends_at,
                                   rescheduled_from, reschedule_chain)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [request.class_id, request.instructor_id, room.room_id,
       request.proposed_starts_at, request.proposed_ends_at,
       request.original_starts_at, JSON.stringify(chain)]);

    if (studentId) {
      await notifyFamily(client, {
        studentId: studentId, eventType: 'reschedule_accepted', subjectType: 'reschedule_request', subjectId: request.request_id,
        payload: {
          from: request.original_starts_at, to: request.proposed_starts_at,
          new_session_id: row.session_id, room: room.name
        }
      });
    }
    return row;
    });
    res.json({ request_id: request.request_id, status: 'accepted', new_session: successor });
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
