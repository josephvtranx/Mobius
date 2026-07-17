// Classes domain (schema v2) — spec 03: SCH-1 create, SCH-2 roster gates,
// SCH-3 catalog + membership requests, SCH-5 series-level schedule edits,
// SCH-6 end/terminate; plus BIL-3 price changes (spec 04).
// Deferred to later slices: SCH-4 self-serve booking (needs holds, spec 07),
// ranked instructor picker, part-time time requests, custom recurrence.
import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getSettings } from '../helpers/institutionSettings.js';
import { materializeOccurrences, RecurrenceError } from '../helpers/recurrence.js';
import { seatCheck, roomCheck, creditGate } from '../helpers/classGates.js';
import { logNotifications, familyRecipients } from '../helpers/notify.js';
import { applyAttendanceWithinTx } from '../helpers/deductionEngine.js';
import { insideWindow } from '../helpers/scheduleWindow.js';
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
      // RSC-4 anti-loophole: sessions already inside the Window at execution
      // follow the Window rule (cancelled_late ⇒ credit lost) unless staff
      // waives via { waive_window: true } — "leave class" is not a free
      // late-cancel for tonight. Later sessions were never deducted (INV-1),
      // so there is nothing to refund by construction. Future-dated effective
      // leaves are deferred: staff simply approve when the date arrives.
      if (!req.body.waive_window) {
        const { rows: upcoming } = await client.query(
          `SELECT * FROM class_sessions
            WHERE class_id = $1 AND status = 'scheduled' AND starts_at > CURRENT_TIMESTAMP`,
          [request.class_id]);
        for (const session of upcoming) {
          if (!insideWindow(session.starts_at, settings)) continue;
          const r = await applyAttendanceWithinTx(client, {
            session, studentId: request.student_id, status: 'cancelled_late',
            actorUserId: req.user.user_id, settings
          });
          if (!r.ok) {
            await client.query('ROLLBACK');
            return res.status(r.status).json(r.body);
          }
        }
      }
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
// SCH-5 — series-level schedule change, future-only (INV-4): scheduled
// sessions on/after the effective date are regenerated on the new pattern;
// completed/past sessions are untouched. Conflicts re-check via the calendar
// constraints (409 re-offers with a full rollback).
// ---------------------------------------------------------------------------
router.patch('/:id/schedule', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const cls = await loadClass(req.db, req.params.id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  if (cls.status !== 'active') return res.status(400).json({ message: `Class is ${cls.status}` });
  if (cls.recurrence === 'none') return res.status(400).json({ message: 'One-off classes have no series to edit' });

  const { recurrence = cls.recurrence, recurrence_rule, effective_from } = req.body;
  const newTz = recurrence_rule?.timezone;
  if (!effective_from || !newTz) {
    return res.status(400).json({ message: 'effective_from and recurrence_rule { timezone, byday } are required' });
  }
  const effective = DateTime.fromISO(effective_from, { zone: newTz });
  if (!effective.isValid) return res.status(400).json({ message: `invalid effective_from: ${effective_from}` });
  if (effective.startOf('day') <= DateTime.now().setZone(newTz).startOf('day')) {
    return res.status(400).json({ message: 'effective_from must be a future date (series changes are future-only, INV-4)' });
  }
  // pg returns DATE columns as JS Dates; materializeOccurrences takes ISO strings
  const endsOnIso = cls.ends_on == null ? null
    : (typeof cls.ends_on === 'string' ? cls.ends_on : DateTime.fromJSDate(cls.ends_on).toISODate());
  if (endsOnIso && effective_from > endsOnIso) {
    return res.status(400).json({ message: 'effective_from is after the class end date' });
  }

  const settings = await getSettings(req.db);
  let occurrences;
  try {
    occurrences = materializeOccurrences({
      recurrence, recurrenceRule: recurrence_rule, startsOn: effective_from,
      endsOn: endsOnIso, horizonWeeks: settings.session_generation_horizon_weeks
    });
  } catch (err) {
    if (err instanceof RecurrenceError) return res.status(400).json({ message: err.message });
    throw err;
  }
  if (occurrences.length === 0) return res.status(400).json({ message: 'the new pattern produces no sessions in the window' });

  // the OLD rule's timezone governs which local day existing sessions fall on
  const oldTz = cls.recurrence_rule?.timezone ?? 'utc';
  const client = await req.db.connect();
  try {
    await client.query('BEGIN');
    const { rowCount: removed } = await client.query(
      `DELETE FROM class_sessions
        WHERE class_id = $1 AND status = 'scheduled'
          AND (starts_at AT TIME ZONE $3)::date >= $2::date`,
      [cls.class_id, effective_from, oldTz]
    );
    for (const occ of occurrences) {
      await client.query(
        `INSERT INTO class_sessions (class_id, instructor_id, room_id, starts_at, ends_at)
         VALUES ($1,$2,$3,$4,$5)`,
        [cls.class_id, cls.instructor_id, cls.default_room_id, occ.startsAt, occ.endsAt]
      );
    }
    await client.query(
      `UPDATE classes SET recurrence = $1, recurrence_rule = $2 WHERE class_id = $3`,
      [recurrence, recurrence_rule, cls.class_id]
    );

    // SCH-5: enrolled families + instructor get the old→new pattern diff
    const payload = {
      old: { recurrence: cls.recurrence, recurrence_rule: cls.recurrence_rule },
      new: { recurrence, recurrence_rule },
      effective_from, sessions_removed: removed, sessions_created: occurrences.length
    };
    const { rows: enrolled } = await client.query(
      `SELECT student_id FROM enrollments WHERE class_id = $1 AND status = 'active'`, [cls.class_id]);
    for (const { student_id } of enrolled) {
      const recipients = await familyRecipients(client, student_id);
      await logNotifications(client, {
        eventType: 'schedule_changed', recipientUserIds: recipients,
        subjectType: 'class', subjectId: cls.class_id, payload
      });
    }
    await logNotifications(client, {
      eventType: 'schedule_changed', recipientUserIds: [cls.instructor_id],
      subjectType: 'class', subjectId: cls.class_id, payload
    });

    await client.query('COMMIT');
    res.json({ class_id: cls.class_id, effective_from, sessions_removed: removed, sessions_created: occurrences.length });
  } catch (err) {
    await client.query('ROLLBACK');
    if (isCalendarConflict(err)) {
      return res.status(409).json({
        message: 'Scheduling conflict — the instructor or room is already booked in that window',
        detail: err.detail ?? null
      });
    }
    if (err.code === '23503') {
      return res.status(409).json({ message: 'Sessions on/after the effective date already have attendance records' });
    }
    throw err;
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// RSC-5 — instructor requests series termination: an urgent staff task, never
// a self-serve terminate. Guardians hear nothing until staff confirm a
// resolution (SCH-5 re-pattern / SCH-6 terminate / re-match).
// ---------------------------------------------------------------------------
router.post('/:id/termination-request', authenticateToken, async (req, res) => {
  const cls = await loadClass(req.db, req.params.id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  if (!(req.user.role === 'instructor' && req.user.user_id === cls.instructor_id)) {
    return res.status(403).json({ message: 'Only this class\'s instructor can request termination' });
  }
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: 'A reason is required' });
  if (cls.status !== 'active') return res.status(400).json({ message: `Class is ${cls.status}` });

  await req.db.query(
    `INSERT INTO staff_tasks (kind, urgency, subject_type, subject_id, details)
     VALUES ('instructor_termination_request','urgent','class',$1,$2)`,
    [cls.class_id, { reason, instructor_id: cls.instructor_id }]);
  res.status(201).json({ class_id: cls.class_id, message: 'Termination request filed — staff will follow up' });
});

// ---------------------------------------------------------------------------
// BIL-3 — future-only price change (INV-4). Sessions bill at the price row
// active at their start (deductionEngine.priceAtSessionStart); completed
// deductions never change. classes.session_credit_cost stays the "current
// value" for the gate/catalog and is refreshed by billingJobs.runPriceSync.
// ---------------------------------------------------------------------------
router.post('/:id/price', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const cls = await loadClass(req.db, req.params.id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  if (cls.status !== 'active') return res.status(400).json({ message: `Class is ${cls.status}` });

  const { session_credit_cost, effective_from } = req.body;
  if (!Number.isInteger(session_credit_cost) || session_credit_cost < 0) {
    return res.status(400).json({ message: 'session_credit_cost must be a non-negative integer' });
  }
  try {
    assertUtcIso(effective_from);
  } catch {
    return res.status(400).json({ message: 'effective_from must be a UTC ISO string with Z suffix' });
  }
  if (DateTime.fromISO(effective_from) <= DateTime.utc()) {
    return res.status(400).json({ message: 'effective_from must be in the future (price changes are future-only, INV-4)' });
  }

  const client = await req.db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO class_price_history (class_id, session_credit_cost, effective_from, set_by)
       VALUES ($1,$2,$3,$4)`,
      [cls.class_id, session_credit_cost, effective_from, req.user.user_id]
    );
    // BIL-3 AC: every enrolled guardian/student gets exactly one old→new notice
    const { rows: enrolled } = await client.query(
      `SELECT student_id FROM enrollments WHERE class_id = $1 AND status = 'active'`, [cls.class_id]);
    for (const { student_id } of enrolled) {
      const recipients = await familyRecipients(client, student_id);
      await logNotifications(client, {
        eventType: 'price_change', recipientUserIds: recipients,
        subjectType: 'class', subjectId: cls.class_id,
        payload: { old: cls.session_credit_cost, new: session_credit_cost, effective_from }
      });
    }
    await client.query('COMMIT');
    res.status(201).json({ class_id: cls.class_id, session_credit_cost, effective_from });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ message: 'A price is already set for that effective time' });
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
