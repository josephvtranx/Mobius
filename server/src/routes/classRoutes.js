// Classes domain (schema v2) — spec 03: SCH-1 create, SCH-2 roster gates,
// SCH-3 catalog + membership requests, SCH-6 end/terminate.
// Deferred to later slices: SCH-4 self-serve booking (needs holds, spec 07),
// SCH-5 recurrence edits, ranked instructor picker, part-time time requests.
import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getSettings } from '../helpers/institutionSettings.js';
import { materializeOccurrences, RecurrenceError } from '../helpers/recurrence.js';
import { seatCheck, roomCheck, creditGate } from '../helpers/classGates.js';
import { logNotifications, familyRecipients } from '../helpers/notify.js';
import { assertUtcIso } from '../lib/time.js';
import { DateTime } from 'luxon';

const router = express.Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Postgres 23505 (unique) / 23P01 (exclusion) on the calendar constraints = a
// racing writer won (INV-3). 409 tells the UI to refresh and re-offer.
function isCalendarConflict(err) {
  return err?.code === '23P01' || err?.code === '23505';
}

async function loadClass(db, classId) {
  if (!UUID_RE.test(classId)) return null;
  const { rows } = await db.query('SELECT * FROM classes WHERE class_id = $1', [classId]);
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// SCH-1 — staff creates a class (1:1 or group; recurring or one-off)
// ---------------------------------------------------------------------------
router.post('/', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const {
    class_type, subject_id, instructor_id, student_limit,
    session_credit_cost, recurrence = 'weekly', recurrence_rule,
    starts_on, ends_on = null, default_room_id = null,
    sessions // one-off only: [{ starts_at, ends_at }] as UTC ISO-Z
  } = req.body;

  const fail = (status, message, extra) => res.status(status).json({ message, ...extra });

  if (!['one_on_one', 'group'].includes(class_type)) return fail(400, 'class_type must be one_on_one or group');
  if (class_type === 'one_on_one' && Number(student_limit) !== 1) return fail(400, 'one_on_one classes must have student_limit = 1');
  if (class_type === 'group' && !(Number(student_limit) > 1)) return fail(400, 'group classes need student_limit > 1');
  if (!starts_on) return fail(400, 'starts_on is required');
  if (recurrence === 'none') {
    if (class_type !== 'one_on_one') return fail(400, 'one-off classes are 1:1 only');
    if (!Array.isArray(sessions) || sessions.length !== 1) return fail(400, 'one-off classes take exactly one session {starts_at, ends_at}');
    try {
      assertUtcIso(sessions[0].starts_at);
      assertUtcIso(sessions[0].ends_at);
    } catch {
      return fail(400, 'one-off session timestamps must be UTC ISO strings with Z suffix');
    }
    if (DateTime.fromISO(sessions[0].starts_at) >= DateTime.fromISO(sessions[0].ends_at)) {
      return fail(400, 'one-off session end must be after its start');
    }
  }

  // Instructor must exist, be active, and be qualified for the subject — the FK alone
  // would let an inactive or unqualified instructor through (parity with the legacy guard).
  const { rows: [instr] } = await req.db.query(
    `SELECT u.is_active,
            EXISTS (SELECT 1 FROM instructor_specialties
                     WHERE instructor_id = $1 AND subject_id = $2) AS qualified
       FROM instructors i JOIN users u ON u.user_id = i.instructor_id
      WHERE i.instructor_id = $1`,
    [instructor_id, subject_id]
  );
  if (!instr) return fail(400, 'Instructor not found');
  if (!instr.is_active) return fail(400, 'Instructor account is inactive');
  if (!instr.qualified) return fail(400, 'Instructor is not qualified to teach this subject');

  let occurrences;
  try {
    const settings = await getSettings(req.db);
    occurrences = recurrence === 'none'
      ? [{ startsAt: sessions[0].starts_at, endsAt: sessions[0].ends_at }]
      : materializeOccurrences({
          recurrence, recurrenceRule: recurrence_rule, startsOn: starts_on, endsOn: ends_on,
          horizonWeeks: settings.session_generation_horizon_weeks
        });
  } catch (err) {
    if (err instanceof RecurrenceError) return fail(400, err.message);
    throw err;
  }
  if (occurrences.length === 0) return fail(400, 'recurrence produces no sessions in the window');

  const client = await req.db.connect();
  try {
    await client.query('BEGIN');

    const { rows: [cls] } = await client.query(
      `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit,
                            session_credit_cost, recurrence, recurrence_rule,
                            starts_on, ends_on, default_room_id, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [class_type, subject_id, instructor_id, student_limit, session_credit_cost,
       recurrence, recurrence_rule ?? null, starts_on,
       ends_on, default_room_id, req.user.user_id]
    );

    for (const occ of occurrences) {
      await client.query(
        `INSERT INTO class_sessions (class_id, instructor_id, room_id, starts_at, ends_at)
         VALUES ($1,$2,$3,$4,$5)`,
        [cls.class_id, instructor_id, default_room_id, occ.startsAt, occ.endsAt]
      );
    }

    await client.query(
      `INSERT INTO class_price_history (class_id, session_credit_cost, effective_from, set_by)
       VALUES ($1,$2,CURRENT_TIMESTAMP,$3)`,
      [cls.class_id, session_credit_cost, req.user.user_id]
    );

    // SCH-1 AC: student_limit above room capacity warns, never blocks
    const warnings = [];
    if (default_room_id !== null) {
      const { rows: [room] } = await client.query('SELECT name, capacity FROM rooms WHERE room_id = $1', [default_room_id]);
      if (room && class_type === 'group' && room.capacity < student_limit) {
        warnings.push(`Room "${room.name}" seats ${room.capacity} of ${student_limit}`);
      }
    }

    await logNotifications(client, {
      eventType: 'class_created', recipientUserIds: [instructor_id],
      subjectType: 'class', subjectId: cls.class_id,
      payload: { sessions: occurrences.length, warnings }
    });

    await client.query('COMMIT');
    res.status(201).json({ class: cls, sessions_created: occurrences.length, warnings });
  } catch (err) {
    await client.query('ROLLBACK');
    if (isCalendarConflict(err)) {
      return res.status(409).json({
        message: 'Scheduling conflict — the instructor or room is already booked in that window',
        detail: err.detail ?? null
      });
    }
    throw err;
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// SCH-3 (read) — group catalog. Before /:id so "catalog" isn't taken as an id.
// ---------------------------------------------------------------------------
router.get('/catalog', authenticateToken, async (req, res) => {
  const settings = await getSettings(req.db);
  if (!settings.group_catalog_visible) {
    return res.status(403).json({ message: 'The class catalog is not enabled for this academy' });
  }
  const { rows } = await req.db.query(
    `SELECT c.class_id, c.class_type, c.student_limit, c.session_credit_cost,
            c.recurrence, c.recurrence_rule, c.starts_on, c.ends_on,
            s.name AS subject, u.name AS instructor,
            c.student_limit - count(e.enrollment_id) FILTER (WHERE e.status = 'active') AS seats_left
       FROM classes c
       JOIN subjects s ON s.subject_id = c.subject_id
       JOIN users u    ON u.user_id = c.instructor_id
       LEFT JOIN enrollments e ON e.class_id = c.class_id
      WHERE c.class_type = 'group' AND c.status = 'active'
      GROUP BY c.class_id, s.name, u.name
      ORDER BY c.starts_on`
  );
  res.json(rows.map(r => ({ ...r, seats_left: Number(r.seats_left), full: Number(r.seats_left) <= 0 })));
});

router.get('/', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { rows } = await req.db.query(
    `SELECT c.*, s.name AS subject, u.name AS instructor,
            count(e.enrollment_id) FILTER (WHERE e.status = 'active')::int AS enrolled
       FROM classes c
       JOIN subjects s ON s.subject_id = c.subject_id
       JOIN users u    ON u.user_id = c.instructor_id
       LEFT JOIN enrollments e ON e.class_id = c.class_id
      GROUP BY c.class_id, s.name, u.name
      ORDER BY c.created_at DESC`
  );
  res.json(rows);
});

router.get('/:id', authenticateToken, async (req, res) => {
  const cls = await loadClass(req.db, req.params.id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  // sequential, not Promise.all: the tenant pool serves one connection at a time (PGlite),
  // so two concurrent req.db.query calls would contend for a single connection.
  const { rows: sessions } = await req.db.query(
    `SELECT session_id, starts_at, ends_at, status, room_id FROM class_sessions
      WHERE class_id = $1 ORDER BY starts_at`, [cls.class_id]);
  const { rows: roster } = await req.db.query(
    `SELECT e.enrollment_id, e.student_id, e.status, u.name FROM enrollments e
      JOIN users u ON u.user_id = e.student_id
      WHERE e.class_id = $1 ORDER BY e.joined_at`, [cls.class_id]);
  res.json({ ...cls, sessions, roster });
});

// ---------------------------------------------------------------------------
// SCH-2 — staff adds a student (rolling roster). Gate sequence in ONE tx:
// seat → room → credit → insert. Also reused by join-request approval.
// ---------------------------------------------------------------------------
// SCH-2 gate sequence + insert, run inside the CALLER's transaction so the enrollment
// commits atomically with whatever surrounds it (e.g. resolving a membership request).
// Returns { ok:true, enrollment } or { ok:false, status, body }; the caller owns COMMIT/ROLLBACK.
async function enrollWithinTx(client, cls, studentId, actingUserId, settings) {
  const { rows: [stu] } = await client.query(
    `SELECT u.is_active FROM students s JOIN users u ON u.user_id = s.student_id WHERE s.student_id = $1`,
    [studentId]
  );
  if (!stu) return { ok: false, status: 404, body: { message: 'Student not found' } };
  if (!stu.is_active) return { ok: false, status: 400, body: { message: 'Student account is inactive' } };

  // lock the class row so two concurrent adds can't both pass the seat cap (spec: hard block always)
  await client.query('SELECT 1 FROM classes WHERE class_id = $1 FOR UPDATE', [cls.class_id]);

  const seat = await seatCheck(client, cls);
  if (!seat.ok) {
    return { ok: false, status: 409, body: { code: 'CLASS_FULL', message: `Class is full (${seat.active}/${seat.limit}) — raise the limit?` } };
  }
  const room = await roomCheck(client, cls);
  if (!room.ok) {
    const first = room.conflicts[0];
    return { ok: false, status: 409, body: {
      code: 'ROOM_CAPACITY',
      message: `Room "${first.room_name}" caps at ${first.capacity}; roster would be ${room.needed}. Swap to a larger room first.`,
      conflicts: room.conflicts
    } };
  }
  const credit = await creditGate(client, cls, studentId, settings);
  if (!credit.ok) {
    return { ok: false, status: 400, body: {
      code: 'INSUFFICIENT_CREDITS',
      message: `Student is ${credit.shortfall} credits short (${credit.balance}/${credit.required}) — collect a top-up, then retry`,
      required: credit.required, balance: credit.balance, shortfall: credit.shortfall
    } };
  }

  const { rows: [enrollment] } = await client.query(
    `INSERT INTO enrollments (class_id, student_id, joined_by) VALUES ($1,$2,$3) RETURNING *`,
    [cls.class_id, studentId, actingUserId]
  );
  const recipients = await familyRecipients(client, studentId);
  await logNotifications(client, {
    eventType: 'student_enrolled', recipientUserIds: [...recipients, cls.instructor_id],
    subjectType: 'class', subjectId: cls.class_id, payload: { student_id: studentId }
  });
  return { ok: true, enrollment };
}

// Direct add (SCH-2): owns its own transaction around enrollWithinTx.
async function enrollStudent(db, cls, studentId, actingUserId) {
  const settings = await getSettings(db);
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await enrollWithinTx(client, cls, studentId, actingUserId, settings);
    if (!result.ok) {
      await client.query('ROLLBACK');
      return { status: result.status, body: result.body };
    }
    await client.query('COMMIT');
    return { status: 201, body: { enrollment: result.enrollment } };
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return { status: 409, body: { code: 'ALREADY_ENROLLED', message: 'Student already has an active enrollment in this class' } };
    }
    throw err;
  } finally {
    client.release();
  }
}

router.post('/:id/enrollments', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const cls = await loadClass(req.db, req.params.id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  if (cls.status !== 'active') return res.status(400).json({ message: `Class is ${cls.status}` });
  const studentId = Number(req.body.student_id);
  if (!studentId) return res.status(400).json({ message: 'student_id is required' });
  const result = await enrollStudent(req.db, cls, studentId, req.user.user_id);
  res.status(result.status).json(result.body);
});

// ---------------------------------------------------------------------------
// SCH-3 — join/leave requests (staff-executed; requests are the demand signal)
// ---------------------------------------------------------------------------
router.post('/:id/membership-requests', authenticateToken, async (req, res) => {
  const cls = await loadClass(req.db, req.params.id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  const { kind, student_id, reason } = req.body;
  if (!['join', 'leave'].includes(kind)) return res.status(400).json({ message: 'kind must be join or leave' });
  const studentId = Number(student_id);
  if (!studentId) return res.status(400).json({ message: 'student_id is required' });
  if (kind === 'leave' && !reason) return res.status(400).json({ message: 'A reason is required to leave a class' });

  // requester must be the student, a linked guardian, or staff
  const requester = req.user;
  if (requester.role !== 'staff' && requester.user_id !== studentId) {
    const { rows } = await req.db.query(
      `SELECT 1 FROM student_guardians sg JOIN guardians g ON g.guardian_id = sg.guardian_id
        WHERE sg.student_id = $1 AND g.user_id = $2`, [studentId, requester.user_id]);
    if (!rows.length) return res.status(403).json({ message: 'Not authorized to act for this student' });
  }

  const client = await req.db.connect();
  try {
    await client.query('BEGIN');
    const seat = await seatCheck(client, cls);
    const { rows: [request] } = await client.query(
      `INSERT INTO class_membership_requests (class_id, student_id, kind, requested_by, reason, is_waitlist)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [cls.class_id, studentId, kind, requester.user_id, reason ?? null, kind === 'join' && !seat.ok]
    );
    await client.query(
      `INSERT INTO staff_tasks (kind, subject_type, subject_id, details)
       VALUES ($1,'membership_request',$2,$3)`,
      [kind === 'join' ? 'join_request' : 'leave_request', request.request_id,
       { class_id: cls.class_id, student_id: studentId, reason: reason ?? null }]
    );
    await client.query('COMMIT');
    res.status(201).json({ request });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

router.post('/membership-requests/:requestId/resolve', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { action, reason } = req.body;
  if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'action must be approve or reject' });
  if (!UUID_RE.test(req.params.requestId)) return res.status(404).json({ message: 'Request not found' });

  const { rows: [request] } = await req.db.query(
    `SELECT * FROM class_membership_requests WHERE request_id = $1`, [req.params.requestId]);
  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.status !== 'pending') return res.status(400).json({ message: `Request already ${request.status}` });

  const cls = await loadClass(req.db, request.class_id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  if (action === 'approve' && request.kind === 'join' && cls.status !== 'active') {
    return res.status(400).json({ message: `Class is ${cls.status}` });
  }

  const resolvedStatus = action === 'approve' ? 'approved' : 'rejected';
  const settings = await getSettings(req.db);
  const client = await req.db.connect();
  try {
    await client.query('BEGIN');
    // Enrollment and the request-status flip commit together — a partial write would
    // otherwise strand the request in 'pending' with the student already enrolled,
    // which a retry can never clear (it hits the unique index and 409s).
    if (action === 'approve' && request.kind === 'join') {
      // approval runs the full SCH-2 gate sequence (AC: a requester who no longer
      // passes the credit gate blocks with the same shortfall surface)
      const result = await enrollWithinTx(client, cls, request.student_id, req.user.user_id, settings);
      if (!result.ok) {
        await client.query('ROLLBACK');
        return res.status(result.status).json(result.body);
      }
    }
    if (action === 'approve' && request.kind === 'leave') {
      await client.query(
        `UPDATE enrollments SET status = 'left', left_at = CURRENT_TIMESTAMP, removed_by = $1
          WHERE class_id = $2 AND student_id = $3 AND status = 'active'`,
        [req.user.user_id, request.class_id, request.student_id]
      );
    }
    await client.query(
      `UPDATE class_membership_requests SET status = $1, resolved_by = $2, resolved_at = CURRENT_TIMESTAMP
        WHERE request_id = $3`,
      [resolvedStatus, req.user.user_id, request.request_id]
    );
    const recipients = await familyRecipients(client, request.student_id);
    await logNotifications(client, {
      eventType: `${request.kind}_request_${resolvedStatus}`,
      recipientUserIds: recipients, subjectType: 'membership_request', subjectId: request.request_id,
      payload: { class_id: request.class_id, reason: reason ?? null }
    });
    await client.query('COMMIT');
    res.json({ request_id: request.request_id, status: resolvedStatus });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ code: 'ALREADY_ENROLLED', message: 'Student already has an active enrollment in this class' });
    }
    throw err;
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// SCH-6 — end (future-dated) or terminate (immediate)
// ---------------------------------------------------------------------------
router.patch('/:id/end', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const cls = await loadClass(req.db, req.params.id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  if (cls.status !== 'active') return res.status(400).json({ message: 'Only an active class can be ended' });
  const { ends_on } = req.body;
  if (!ends_on) return res.status(400).json({ message: 'ends_on is required' });

  // Cut off in the class's wall-clock zone: a session's UTC instant can land on a different
  // calendar day than its local date (a 5pm PDT class is next-day UTC), so a naive
  // starts_at::date > ends_on cutoff drops or keeps the boundary day off by one.
  const tz = cls.recurrence_rule?.timezone ?? 'utc';
  const cutoff = DateTime.fromISO(ends_on, { zone: tz }).plus({ days: 1 }).startOf('day');
  if (!cutoff.isValid) return res.status(400).json({ message: `invalid ends_on: ${ends_on}` });
  const cutoffUtc = cutoff.toUTC().toISO();

  const client = await req.db.connect();
  try {
    await client.query('BEGIN');
    const { rowCount: removed } = await client.query(
      `DELETE FROM class_sessions
        WHERE class_id = $1 AND status = 'scheduled' AND starts_at >= $2`,
      [cls.class_id, cutoffUtc]
    );
    await client.query(
      `UPDATE classes SET ends_on = $1, status = 'ended' WHERE class_id = $2`,
      [ends_on, cls.class_id]
    );
    const { rows: enrolled } = await client.query(
      `SELECT student_id FROM enrollments WHERE class_id = $1 AND status = 'active'`, [cls.class_id]);
    for (const { student_id } of enrolled) {
      const recipients = await familyRecipients(client, student_id);
      await logNotifications(client, {
        eventType: 'class_ended', recipientUserIds: recipients,
        subjectType: 'class', subjectId: cls.class_id, payload: { ends_on, sessions_removed: removed }
      });
    }
    await client.query('COMMIT');
    res.json({ class_id: cls.class_id, ends_on, sessions_removed: removed });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

router.post('/:id/terminate', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const cls = await loadClass(req.db, req.params.id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  if (cls.status === 'terminated') return res.status(400).json({ message: 'Class is already terminated' });

  const client = await req.db.connect();
  try {
    await client.query('BEGIN');
    // future sessions were never deducted (INV-1) ⇒ nothing to refund by construction
    const { rowCount: removed } = await client.query(
      `DELETE FROM class_sessions
        WHERE class_id = $1 AND status = 'scheduled' AND starts_at > CURRENT_TIMESTAMP`,
      [cls.class_id]
    );
    const { rows: enrolled } = await client.query(
      `UPDATE enrollments SET status = 'removed', left_at = CURRENT_TIMESTAMP, removed_by = $1
        WHERE class_id = $2 AND status = 'active' RETURNING student_id`,
      [req.user.user_id, cls.class_id]
    );
    await client.query(`UPDATE classes SET status = 'terminated' WHERE class_id = $1`, [cls.class_id]);
    for (const { student_id } of enrolled) {
      const recipients = await familyRecipients(client, student_id);
      await logNotifications(client, {
        eventType: 'class_terminated', recipientUserIds: recipients,
        subjectType: 'class', subjectId: cls.class_id, payload: { sessions_removed: removed }
      });
    }
    await client.query('COMMIT');
    res.json({ class_id: cls.class_id, status: 'terminated', sessions_removed: removed, students_removed: enrolled.length });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

export default router;
