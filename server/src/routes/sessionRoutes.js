// Sessions domain (schema v2) — attendance marking surface for the spec 04
// deduction engine (BIL-1). The richer post-session notes surface is ACA-1
// (Phase 7.5); the cancellation statuses normally arrive via the Phase 7.3
// flows but staff can record/correct them manually here until then.
// INV-6: no code path here touches enrollments — billing never unenrolls.
import express from 'express';
import { DateTime } from 'luxon';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getSettings } from '../helpers/institutionSettings.js';
import { applyAttendanceWithinTx, ATTENDANCE_STATUSES } from '../helpers/deductionEngine.js';
import { insideWindow } from '../helpers/scheduleWindow.js';
import { canActForStudent } from '../helpers/authz.js';
import { logNotifications, notifyFamily } from '../helpers/notify.js';
import { instructorFree, bestFitRoom, studentCollision } from '../helpers/slotFinder.js';
import { withTransaction } from '../helpers/withTransaction.js';
import { HttpError } from '../helpers/httpError.js';
import { isCalendarConflict } from '../helpers/pgErrors.js';
import { upsertNoteWithinTx } from '../helpers/sessionNotes.js';
import { assertUtcIso } from 'mobius-lms';

const router = express.Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// spec 04 "Set by" column: instructors record what happened in the room;
// excusals and the cancellation trio are staff-side calls.
const INSTRUCTOR_SETTABLE = new Set(['present', 'absent_unexcused']);

async function loadSession(db, sessionId) {
  if (!UUID_RE.test(sessionId)) return null;
  const { rows } = await db.query(
    `SELECT cs.*, c.class_type, c.recurrence, c.status AS class_status
       FROM class_sessions cs JOIN classes c ON c.class_id = cs.class_id
      WHERE cs.session_id = $1`, [sessionId]);
  return rows[0] ?? null;
}

const hasStarted = (session) => DateTime.utc() >= DateTime.fromJSDate(session.starts_at);

// a note payload counts only if some template field has content (spec 06:
// all fields optional — an empty object is "notes skipped", never an error)
const NOTE_FIELDS = ['performance', 'improvements', 'free_notes'];
const hasNoteContent = (note) =>
  note != null && typeof note === 'object' && NOTE_FIELDS.some(f => note[f]);

// ---------------------------------------------------------------------------
// POST /:id/attendance — bulk mark/correct: { marks: [{ student_id, status }] }
// ---------------------------------------------------------------------------
router.post('/:id/attendance', authenticateToken, async (req, res) => {
  const session = await loadSession(req.db, req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });

  const isStaff = req.user.role === 'staff';
  const isSessionInstructor = req.user.role === 'instructor' && req.user.user_id === session.instructor_id;
  if (!isStaff && !isSessionInstructor) {
    return res.status(403).json({ message: 'Only staff or this session\'s instructor can mark attendance' });
  }

  const marks = req.body.marks;
  if (!Array.isArray(marks) || marks.length === 0) {
    return res.status(400).json({ message: 'marks must be a non-empty array of { student_id, status }' });
  }
  const seen = new Set();
  for (const mark of marks) {
    if (!ATTENDANCE_STATUSES.includes(mark.status)) {
      return res.status(400).json({ message: `invalid attendance status: ${mark.status}` });
    }
    if (!isStaff && !INSTRUCTOR_SETTABLE.has(mark.status)) {
      return res.status(400).json({ message: `Instructors may only mark present or absent_unexcused (${mark.status} is staff-set)` });
    }
    // ACA-1: notes ride along in the same request, but only the session's
    // instructor authors them (spec 06: everyone reads, the instructor writes)
    if (hasNoteContent(mark.note) && !isSessionInstructor) {
      return res.status(400).json({ message: 'Session notes are instructor-authored — only this session\'s instructor can write them' });
    }
    const sid = Number(mark.student_id);
    if (!sid) return res.status(400).json({ message: 'each mark needs a student_id' });
    if (seen.has(sid)) return res.status(400).json({ message: `duplicate mark for student ${sid}` });
    seen.add(sid);
  }

  if (!['scheduled', 'completed'].includes(session.status)) {
    return res.status(400).json({ message: `Session is ${session.status}` });
  }
  if (DateTime.utc() < DateTime.fromJSDate(session.starts_at)) {
    return res.status(400).json({ message: 'Session has not started yet' });
  }

  // markable = active enrollee, or a student with an existing attendance row
  // (roster changes never erase history — corrections stay possible after a leave)
  const { rows: markable } = await req.db.query(
    `SELECT student_id FROM enrollments WHERE class_id = $1 AND status = 'active'
      UNION
     SELECT student_id FROM session_attendance WHERE session_id = $2`,
    [session.class_id, session.session_id]);
  const markableIds = new Set(markable.map(r => r.student_id));
  for (const sid of seen) {
    if (!markableIds.has(sid)) {
      return res.status(400).json({ message: `Student ${sid} is not enrolled in this class` });
    }
  }

  const settings = await getSettings(req.db);
  const now = DateTime.utc().toISO();

  const outcome = await withTransaction(req.db, async (client) => {
    const results = [];
    const failures = [];
    for (const mark of marks) {
      const studentId = Number(mark.student_id);
      const r = await applyAttendanceWithinTx(client, {
        session, studentId, status: mark.status,
        actorUserId: req.user.user_id, settings, now
      });
      if (r.ok) {
        const result = { student_id: studentId, ok: true, status: mark.status, delta: r.delta, balance: r.balance };
        // 등하원-style trust ping (spec 08): a human present FIRST-mark tells
        // the family the student is in class. Corrections and the system
        // auto-completer (which calls the engine directly) never ping.
        if (mark.status === 'present' && r.firstMark) {
          await notifyFamily(client, {
            studentId, eventType: 'attendance_marked',
            subjectType: 'class_session', subjectId: session.session_id,
            payload: { status: 'present', starts_at: session.starts_at }
          });
        }
        // ACA-1: the note template saves in the same pass; a note failure never
        // blocks the attendance/billing side (notes never block money)
        if (hasNoteContent(mark.note)) {
          const noteResult = await upsertNoteWithinTx(client, {
            session, studentId, fields: mark.note, actorUserId: req.user.user_id, settings, now
          });
          result.note_saved = noteResult.ok;
          if (!noteResult.ok) result.note_error = noteResult.body.code;
        }
        results.push(result);
      } else {
        // the engine wrote nothing for this student — the rest still commit
        failures.push(r);
        results.push({ student_id: studentId, ok: false, ...r.body });
      }
    }

    // 'completed' = held and fully recorded; partial marking leaves 'scheduled'
    // so the auto-completer finishes it.
    let sessionStatus = session.status;
    if (session.status === 'scheduled') {
      const { rows: [{ missing }] } = await client.query(
        `SELECT count(*)::int AS missing FROM enrollments e
          WHERE e.class_id = $1 AND e.status = 'active'
            AND NOT EXISTS (SELECT 1 FROM session_attendance sa
                             WHERE sa.session_id = $2 AND sa.student_id = e.student_id)`,
        [session.class_id, session.session_id]);
      if (missing === 0) {
        await client.query(`UPDATE class_sessions SET status = 'completed' WHERE session_id = $1`,
          [session.session_id]);
        sessionStatus = 'completed';
      }
    }
    return { results, failures, sessionStatus };
  });

  if (outcome.failures.length === marks.length) {
    return res.status(outcome.failures[0].status).json(outcome.failures[0].body);
  }
  res.json({ results: outcome.results, session_status: outcome.sessionStatus });
});

// ---------------------------------------------------------------------------
// RSC-2 — student/guardian cancels their seat in a session. The Window decides
// the money effect: outside → cancelled_in_window (never deducted, INV-1);
// inside → cancelled_late (credit lost; appeal task for staff review).
// 1:1: the slot is released; group: the session runs, only this seat is out.
// ---------------------------------------------------------------------------
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  const session = await loadSession(req.db, req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  if (session.status !== 'scheduled') return res.status(400).json({ message: `Session is ${session.status}` });
  if (hasStarted(session)) {
    return res.status(400).json({ message: 'Session has already started — attendance applies instead' });
  }

  const studentId = Number(req.body.student_id ?? (req.user.role === 'student' ? req.user.user_id : NaN));
  if (!studentId) return res.status(400).json({ message: 'student_id is required' });
  if (!await canActForStudent(req.db, req.user, studentId)) {
    return res.status(403).json({ message: 'Not authorized to act for this student' });
  }
  const { rows: enrolled } = await req.db.query(
    `SELECT 1 FROM enrollments WHERE class_id = $1 AND student_id = $2 AND status = 'active'`,
    [session.class_id, studentId]);
  if (!enrolled.length) return res.status(400).json({ message: 'Student is not enrolled in this class' });

  const settings = await getSettings(req.db);
  const late = insideWindow(session.starts_at, settings);
  const status = late ? 'cancelled_late' : 'cancelled_in_window';

  try {
    const view = await withTransaction(req.db, async (client) => {
    const r = await applyAttendanceWithinTx(client, {
      session, studentId, status, actorUserId: req.user.user_id, settings
    });
    // e.g. ATTENDANCE_BLOCKED on a late cancel at the grace floor
    if (!r.ok) throw new HttpError(r.status, r.body);

    let sessionStatus = session.status;
    if (session.class_type === 'one_on_one') {
      await client.query(
        `UPDATE class_sessions SET status = 'cancelled_student' WHERE session_id = $1`,
        [session.session_id]);
      sessionStatus = 'cancelled_student';
    }
    if (late) {
      // lightweight appeal affordance: staff may reverse via absent_excused adjustment
      await client.query(
        `INSERT INTO staff_tasks (kind, subject_type, subject_id, details)
         VALUES ('appeal_review','session_attendance',$1,$2)`,
        [r.attendance.attendance_id,
         { session_id: session.session_id, student_id: studentId, class_id: session.class_id }]);
    }

    await notifyFamily(client, {
      studentId: studentId, eventType: late ? 'session_cancelled_late' : 'session_cancelled',
      alsoNotify: [session.instructor_id],
        subjectType: 'class_session', subjectId: session.session_id,
      payload: {
        student_id: studentId, starts_at: session.starts_at,
        money_effect: late ? 'credit_forfeited' : 'no_charge', appeal_available: late
      }
    });
    return {
      attendance_status: status, session_status: sessionStatus,
      money_effect: late ? 'credit_forfeited' : 'no_charge',
      delta: r.delta, balance: r.balance
    };
    });
    res.json(view);
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json(err.body);
    throw err;
  }
});

// ---------------------------------------------------------------------------
// ACA-1/INV-5 — note-only create/edit (the attendance route saves notes in the
// same pass; this covers later touch-ups within the 7-day window and edits
// inside an ACA-4 unlock window). Instructor-of-session only.
// ---------------------------------------------------------------------------
router.put('/:id/notes/:studentId', authenticateToken, async (req, res) => {
  const session = await loadSession(req.db, req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  if (!(req.user.role === 'instructor' && req.user.user_id === session.instructor_id)) {
    return res.status(403).json({ message: 'Session notes are instructor-authored — only this session\'s instructor can write them' });
  }
  const studentId = Number(req.params.studentId);
  if (!studentId) return res.status(400).json({ message: 'invalid student id' });
  const { rows: markable } = await req.db.query(
    `SELECT 1 FROM enrollments WHERE class_id = $1 AND student_id = $2 AND status = 'active'
      UNION
     SELECT 1 FROM session_attendance WHERE session_id = $3 AND student_id = $2`,
    [session.class_id, studentId, session.session_id]);
  if (!markable.length) return res.status(400).json({ message: 'Student is not on this session' });
  if (!hasNoteContent(req.body)) {
    return res.status(400).json({ message: 'At least one of performance, improvements, free_notes is required' });
  }

  const settings = await getSettings(req.db);
  try {
    const r = await withTransaction(req.db, async (client) => {
      const result = await upsertNoteWithinTx(client, {
        session, studentId, fields: req.body, actorUserId: req.user.user_id, settings
      });
      if (!result.ok) throw new HttpError(result.status, result.body);
      return result;
    });
    res.json({ note: r.note, edited: r.edited });
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json(err.body);
    throw err;
  }
});

// ---------------------------------------------------------------------------
// ACA-4 — post-lock correction: instructor requests an unlock (staff task),
// staff unlocks that note target for 48h (future locked_at stamp → auto-relock
// when it passes; runRecordLock never touches non-NULL stamps).
// ---------------------------------------------------------------------------
router.post('/:id/notes/:studentId/unlock-request', authenticateToken, async (req, res) => {
  const session = await loadSession(req.db, req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  if (!(req.user.role === 'instructor' && req.user.user_id === session.instructor_id)) {
    return res.status(403).json({ message: 'Only this session\'s instructor can request an unlock' });
  }
  const studentId = Number(req.params.studentId);
  if (!studentId) return res.status(400).json({ message: 'invalid student id' });
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: 'A reason is required' });

  const subjectId = `${session.session_id}:${studentId}`;
  const { rows: open } = await req.db.query(
    `SELECT 1 FROM staff_tasks
      WHERE kind = 'note_unlock_request' AND subject_type = 'session_note'
        AND subject_id = $1 AND status IN ('open','in_progress')`, [subjectId]);
  if (open.length) return res.status(409).json({ message: 'An unlock request is already pending for this note' });

  await req.db.query(
    `INSERT INTO staff_tasks (kind, subject_type, subject_id, details)
     VALUES ('note_unlock_request','session_note',$1,$2)`,
    [subjectId, { session_id: session.session_id, student_id: studentId, reason, requested_by: req.user.user_id }]);
  res.status(201).json({ message: 'Unlock request filed — staff will review', subject_id: subjectId });
});

router.post('/:id/notes/:studentId/unlock', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const session = await loadSession(req.db, req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  const studentId = Number(req.params.studentId);
  if (!studentId) return res.status(400).json({ message: 'invalid student id' });

  const unlockUntil = DateTime.utc().plus({ hours: 48 }).toISO();
  const subjectId = `${session.session_id}:${studentId}`;
  await withTransaction(req.db, async (client) => {
    // upsert: a post-lock FIRST write has no row yet — the placeholder carries
    // the stamp; write-authz keys on the session's instructor, not created_by
    await client.query(
      `INSERT INTO session_notes (session_id, student_id, created_by)
       VALUES ($1,$2,$3)
       ON CONFLICT (session_id, student_id) DO NOTHING`,
      [session.session_id, studentId, req.user.user_id]);
    await client.query(
      `UPDATE session_notes SET locked_at = $1 WHERE session_id = $2 AND student_id = $3`,
      [unlockUntil, session.session_id, studentId]);
    await client.query(
      `UPDATE staff_tasks SET status = 'done', resolved_by = $1, resolved_at = CURRENT_TIMESTAMP
        WHERE kind = 'note_unlock_request' AND subject_type = 'session_note'
          AND subject_id = $2 AND status IN ('open','in_progress')`,
      [req.user.user_id, subjectId]);
    await logNotifications(client, {
      eventType: 'note_unlocked', recipientUserIds: [session.instructor_id],
      subjectType: 'session_note', subjectId,
      payload: { session_id: session.session_id, student_id: studentId, unlocked_until: unlockUntil }
    });
  });
  res.json({ session_id: session.session_id, student_id: studentId, unlocked_until: unlockUntil });
});

// ---------------------------------------------------------------------------
// RSC-1 — student/guardian requests a 1:1 reschedule. Creates the request +
// a TTL'd slot hold (INV-3 backstop: uq_holds_instructor_slot); the original
// session STAYS on the calendar as reschedule_requested (INV-2) until the
// instructor responds, the TTL escalates, or the Window hard-stops it.
// ---------------------------------------------------------------------------
router.post('/:id/reschedule-request', authenticateToken, async (req, res) => {
  const session = await loadSession(req.db, req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  if (session.class_type !== 'one_on_one') {
    return res.status(400).json({ message: 'Group sessions cannot be rescheduled — the class runs regardless; cancel your seat instead' });
  }
  // a pending request already flipped the session to reschedule_requested,
  // so this guard also enforces one open request per session
  if (session.status !== 'scheduled') return res.status(400).json({ message: `Session is ${session.status}` });

  const { proposed_starts_at, proposed_ends_at } = req.body;
  try {
    assertUtcIso(proposed_starts_at);
    assertUtcIso(proposed_ends_at);
  } catch {
    return res.status(400).json({ message: 'proposed timestamps must be UTC ISO strings with Z suffix' });
  }
  const start = DateTime.fromISO(proposed_starts_at);
  if (DateTime.fromISO(proposed_ends_at) <= start) {
    return res.status(400).json({ message: 'proposed end must be after its start' });
  }
  if (start <= DateTime.utc()) return res.status(400).json({ message: 'proposed time must be in the future' });

  // the 1:1 class's single active enrollee is the student being acted for
  const { rows: enr } = await req.db.query(
    `SELECT student_id FROM enrollments WHERE class_id = $1 AND status = 'active'`, [session.class_id]);
  if (!enr.length) return res.status(400).json({ message: 'No active enrollment on this class' });
  const studentId = enr[0].student_id;
  if (!await canActForStudent(req.db, req.user, studentId)) {
    return res.status(403).json({ message: 'Not authorized to act for this student' });
  }

  const settings = await getSettings(req.db);
  if (insideWindow(session.starts_at, settings)) {
    return res.status(400).json({ message: 'Past the change deadline — the reschedule window has closed; contact the academy to appeal' });
  }

  // RSC-1 step-2 validations (sequential pool reads)
  if (!await instructorFree(req.db, session.instructor_id, proposed_starts_at, proposed_ends_at, session.session_id)) {
    return res.status(409).json({ message: 'The instructor is not free at that time' });
  }
  if (!await bestFitRoom(req.db, proposed_starts_at, proposed_ends_at, 1)) {
    return res.status(400).json({ message: 'No room is available at that time' });
  }
  const collision = await studentCollision(req.db, studentId, proposed_starts_at, proposed_ends_at, session.session_id);
  if (collision) {
    return res.status(400).json({ message: `The new time overlaps the student's ${collision.subject} session` });
  }

  const expiresAt = DateTime.utc().plus({ hours: settings.instructor_response_window_hours }).toISO();
  try {
    const request = await withTransaction(req.db, async (client) => {
    const { rows: [hold] } = await client.query(
      `INSERT INTO slot_holds (instructor_id, starts_at, ends_at, origin, held_for_student_id, expires_at, created_by)
       VALUES ($1,$2,$3,'reschedule_request',$4,$5,$6) RETURNING hold_id`,
      [session.instructor_id, proposed_starts_at, proposed_ends_at, studentId, expiresAt, req.user.user_id]);
    const { rows: [row] } = await client.query(
      `INSERT INTO reschedule_requests (session_id, requested_by, proposed_starts_at, proposed_ends_at, hold_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [session.session_id, req.user.user_id, proposed_starts_at, proposed_ends_at, hold.hold_id]);
    await client.query(
      `UPDATE class_sessions SET status = 'reschedule_requested' WHERE session_id = $1`, [session.session_id]);
    await logNotifications(client, {
      eventType: 'reschedule_requested', recipientUserIds: [session.instructor_id],
      subjectType: 'reschedule_request', subjectId: row.request_id,
      payload: { session_id: session.session_id, from: session.starts_at, to: proposed_starts_at, student_id: studentId }
    });
    return row;
    });
    res.status(201).json({ request });
  } catch (err) {
    if (isCalendarConflict(err)) {
      // INV-3: a racing writer already holds or booked that slot
      return res.status(409).json({ message: 'That slot was just taken — refresh the calendar and pick another time' });
    }
    throw err;
  }
});

// ---------------------------------------------------------------------------
// RSC-3 — instructor cancels an instance (unilateral; families made whole
// automatically: instructor_cancelled never deducts and auto-refunds any prior
// deduction). Reason required. One-offs get a rebook hint (SCH-4 deep link).
// ---------------------------------------------------------------------------
router.post('/:id/instructor-cancel', authenticateToken, async (req, res) => {
  const session = await loadSession(req.db, req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  if (!(req.user.role === 'instructor' && req.user.user_id === session.instructor_id)) {
    return res.status(403).json({ message: 'Only this session\'s instructor can cancel it' });
  }
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ message: 'A reason is required to cancel a session' });
  if (session.status !== 'scheduled') return res.status(400).json({ message: `Session is ${session.status}` });

  const settings = await getSettings(req.db);
  const { rows: enrolled } = await req.db.query(
    `SELECT student_id FROM enrollments WHERE class_id = $1 AND status = 'active'`, [session.class_id]);

  try {
    await withTransaction(req.db, async (client) => {
      for (const { student_id } of enrolled) {
        const r = await applyAttendanceWithinTx(client, {
          session, studentId: student_id, status: 'instructor_cancelled',
          actorUserId: req.user.user_id, settings
        });
        if (!r.ok) throw new HttpError(r.status, r.body);
      }
      await client.query(
        `UPDATE class_sessions SET status = 'cancelled_instructor', cancellation_reason = $1
          WHERE session_id = $2`, [reason, session.session_id]);

      for (const { student_id } of enrolled) {
        await notifyFamily(client, {
          studentId: student_id, eventType: 'session_cancelled_by_instructor', subjectType: 'class_session', subjectId: session.session_id,
          payload: {
            reason, starts_at: session.starts_at,
            rebook: session.recurrence === 'none' // one-off: family must book another time
          }
        });
      }
    });
    res.json({ session_id: session.session_id, status: 'cancelled_instructor', students: enrolled.length });
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json(err.body);
    throw err;
  }
});

// ---------------------------------------------------------------------------
// RSC-5 — staff cancels any session: unrestricted by the Window, always logged,
// always notifies. Money still flows through attendance statuses — staff picks
// one; default is the never-deduct academy-cancelled equivalent.
// ---------------------------------------------------------------------------
const STAFF_CANCEL_STATUSES = new Set(['instructor_cancelled', 'cancelled_in_window', 'cancelled_late']);

router.post('/:id/staff-cancel', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const session = await loadSession(req.db, req.params.id);
  if (!session) return res.status(404).json({ message: 'Session not found' });
  if (session.status !== 'scheduled') return res.status(400).json({ message: `Session is ${session.status}` });
  const status = req.body.status ?? 'instructor_cancelled';
  if (!STAFF_CANCEL_STATUSES.has(status)) {
    return res.status(400).json({ message: `status must be one of: ${[...STAFF_CANCEL_STATUSES].join(', ')}` });
  }
  const reason = req.body.reason ?? null;

  const settings = await getSettings(req.db);
  const { rows: enrolled } = await req.db.query(
    `SELECT student_id FROM enrollments WHERE class_id = $1 AND status = 'active'`, [session.class_id]);

  try {
    await withTransaction(req.db, async (client) => {
      for (const { student_id } of enrolled) {
        const r = await applyAttendanceWithinTx(client, {
          session, studentId: student_id, status, actorUserId: req.user.user_id, settings
        });
        // all-or-nothing: e.g. a cancelled_late deduction floor-blocks one student
        if (!r.ok) throw new HttpError(r.status, { ...r.body, student_id });
      }
      await client.query(
        `UPDATE class_sessions SET status = 'cancelled_staff', cancellation_reason = $1
          WHERE session_id = $2`, [reason, session.session_id]);

      for (const { student_id } of enrolled) {
        await notifyFamily(client, {
          studentId: student_id, eventType: 'session_cancelled_by_staff', subjectType: 'class_session', subjectId: session.session_id,
          payload: { reason, starts_at: session.starts_at, attendance_status: status }
        });
      }
      await logNotifications(client, {
        eventType: 'session_cancelled_by_staff', recipientUserIds: [session.instructor_id],
        subjectType: 'class_session', subjectId: session.session_id,
        payload: { reason, starts_at: session.starts_at, attendance_status: status }
      });
    });
    res.json({ session_id: session.session_id, status: 'cancelled_staff', attendance_status: status, students: enrolled.length });
  } catch (err) {
    if (err instanceof HttpError) return res.status(err.status).json(err.body);
    throw err;
  }
});

export default router;
