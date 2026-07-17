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

export default router;
