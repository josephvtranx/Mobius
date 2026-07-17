// Staff reports (spec 06 ACA-3 / 08 dashboard signals). v1: the note
// completion rate — notes-with-any-field ÷ attendance-marked student-sessions
// over a trailing window, per instructor and per class, with the missing-pair
// drill-down so staff can coach before parents complain.
import express from 'express';
import { DateTime } from 'luxon';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/note-completion', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const days = Math.min(Number(req.query.days) || 30, 365);
  const since = DateTime.utc().minus({ days }).toISO();

  // one scan; noted = a session_notes row with any non-empty template field
  const { rows: pairs } = await req.db.query(
    `SELECT cs.session_id, cs.instructor_id, cs.class_id, sub.name AS subject,
            u.name AS instructor, sa.student_id,
            (n.note_id IS NOT NULL AND
             (n.performance IS NOT NULL OR n.improvements IS NOT NULL OR n.free_notes IS NOT NULL)) AS noted
       FROM session_attendance sa
       JOIN class_sessions cs ON cs.session_id = sa.session_id
       JOIN classes c ON c.class_id = cs.class_id
       JOIN subjects sub ON sub.subject_id = c.subject_id
       JOIN users u ON u.user_id = cs.instructor_id
       LEFT JOIN session_notes n ON n.session_id = sa.session_id AND n.student_id = sa.student_id
      WHERE cs.ends_at >= $1 AND cs.ends_at <= CURRENT_TIMESTAMP
      ORDER BY cs.ends_at DESC`, [since]);

  const rollup = (keyFn, labelFn) => {
    const acc = new Map();
    for (const p of pairs) {
      const key = keyFn(p);
      if (!acc.has(key)) acc.set(key, { ...labelFn(p), marked: 0, noted: 0 });
      const row = acc.get(key);
      row.marked += 1;
      if (p.noted) row.noted += 1;
    }
    return [...acc.values()].map(r => ({ ...r, rate: r.marked ? r.noted / r.marked : null }));
  };

  res.json({
    window_days: days,
    by_instructor: rollup(p => p.instructor_id,
      p => ({ instructor_id: p.instructor_id, instructor: p.instructor })),
    by_class: rollup(p => p.class_id,
      p => ({ class_id: p.class_id, subject: p.subject, instructor: p.instructor })),
    missing: pairs.filter(p => !p.noted).map(p => ({
      session_id: p.session_id, student_id: p.student_id,
      instructor_id: p.instructor_id, class_id: p.class_id, subject: p.subject
    }))
  });
});

// ---------------------------------------------------------------------------
// GET /dashboard — the remaining spec 08 people-management signals (note
// completion has its own endpoint above). Sequential pool reads.
// ---------------------------------------------------------------------------
router.get('/dashboard', authenticateToken, authorizeRole('staff'), async (req, res) => {
  // schedule stability: instructor-cancelled ÷ taught, trailing 60d (RSC-3)
  const { rows: cancelRates } = await req.db.query(
    `SELECT cs.instructor_id, u.name AS instructor,
            count(*) FILTER (WHERE cs.status = 'cancelled_instructor')::int AS cancelled,
            count(*) FILTER (WHERE cs.status IN ('completed','cancelled_instructor'))::int AS taught
       FROM class_sessions cs JOIN users u ON u.user_id = cs.instructor_id
      WHERE cs.starts_at >= CURRENT_TIMESTAMP - interval '60 days'
        AND cs.status IN ('completed','cancelled_instructor')
      GROUP BY cs.instructor_id, u.name`);

  // billing ran on a fallback; a human should glance (BIL-1)
  const { rows: autoPending } = await req.db.query(
    `SELECT task_id, subject_id AS session_id, created_at FROM staff_tasks
      WHERE kind = 'auto_complete_verify' AND status IN ('open','in_progress')
      ORDER BY created_at`);

  // INV-6: humans execute consequences — the delinquency queue
  const { rows: delinquency } = await req.db.query(
    `SELECT t.task_id, t.subject_id AS student_id, u.name AS student,
            COALESCE(w.balance, 0)::int AS balance,
            date_part('day', CURRENT_TIMESTAMP - t.created_at)::int AS days_open
       FROM staff_tasks t
       JOIN users u ON u.user_id = t.subject_id::int
       LEFT JOIN wallets w ON w.student_id = t.subject_id::int
      WHERE t.kind = 'delinquent_balance' AND t.status IN ('open','in_progress')
      ORDER BY t.created_at`);

  // serial movers: ≥3 reschedule requests in 30d (RSC-1 — appeal/limit talks)
  const { rows: serialMovers } = await req.db.query(
    `SELECT h.held_for_student_id AS student_id, u.name AS student, count(*)::int AS requests
       FROM reschedule_requests r
       JOIN slot_holds h ON h.hold_id = r.hold_id
       JOIN users u ON u.user_id = h.held_for_student_id
      WHERE r.created_at >= CURRENT_TIMESTAMP - interval '30 days'
      GROUP BY h.held_for_student_id, u.name
     HAVING count(*) >= 3
      ORDER BY count(*) DESC`);

  // nothing silently rots: open tasks by kind with the oldest age
  const { rows: taskAging } = await req.db.query(
    `SELECT kind, count(*)::int AS open,
            max(date_part('day', CURRENT_TIMESTAMP - created_at))::int AS oldest_days
       FROM staff_tasks WHERE status IN ('open','in_progress')
      GROUP BY kind ORDER BY oldest_days DESC`);

  res.json({
    instructor_cancel_rate: cancelRates.map(r => ({
      ...r, rate: r.taught ? r.cancelled / r.taught : null
    })),
    auto_completed_pending: { count: autoPending.length, tasks: autoPending },
    delinquency_queue: delinquency,
    serial_movers: serialMovers,
    pending_requests_aging: taskAging
  });
});

export default router;
