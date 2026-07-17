// Sessions domain (schema v2) — attendance marking surface for the spec 04
// deduction engine (BIL-1). The richer post-session notes surface is ACA-1
// (Phase 7.5); the cancellation statuses normally arrive via the Phase 7.3
// flows but staff can record/correct them manually here until then.
// INV-6: no code path here touches enrollments — billing never unenrolls.
import express from 'express';
import { DateTime } from 'luxon';
import { authenticateToken } from '../middleware/auth.js';
import { getSettings } from '../helpers/institutionSettings.js';
import { applyAttendanceWithinTx, ATTENDANCE_STATUSES } from '../helpers/deductionEngine.js';

const router = express.Router();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// spec 04 "Set by" column: instructors record what happened in the room;
// excusals and the cancellation trio are staff-side calls.
const INSTRUCTOR_SETTABLE = new Set(['present', 'absent_unexcused']);

// ---------------------------------------------------------------------------
// POST /:id/attendance — bulk mark/correct: { marks: [{ student_id, status }] }
// ---------------------------------------------------------------------------
router.post('/:id/attendance', authenticateToken, async (req, res) => {
  if (!UUID_RE.test(req.params.id)) return res.status(404).json({ message: 'Session not found' });
  const { rows: [session] } = await req.db.query(
    `SELECT cs.*, c.status AS class_status
       FROM class_sessions cs JOIN classes c ON c.class_id = cs.class_id
      WHERE cs.session_id = $1`, [req.params.id]);
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

  const client = await req.db.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    const failures = [];
    for (const mark of marks) {
      const studentId = Number(mark.student_id);
      const r = await applyAttendanceWithinTx(client, {
        session, studentId, status: mark.status,
        actorUserId: req.user.user_id, settings, now
      });
      if (r.ok) {
        results.push({ student_id: studentId, ok: true, status: mark.status, delta: r.delta, balance: r.balance });
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
    await client.query('COMMIT');

    if (failures.length === marks.length) {
      return res.status(failures[0].status).json(failures[0].body);
    }
    res.json({ results, session_status: sessionStatus });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

export default router;
