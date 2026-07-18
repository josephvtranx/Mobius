// v2 instructor calendar read (spec 03 edge rules / 07 RSC-1 step 1): the
// family-facing painted calendar = availability − unavailability − sessions −
// active holds, via helpers/slotFinder (the shared query path). Mounted at
// /api/instructors alongside the legacy v1 router (no path overlap).
// Availability TIMEs are academy wall clock; there is no institution-timezone
// setting, so callers supply the projection zone explicitly via ?tz=.
import express from 'express';
import { DateTime } from 'luxon';
import { authenticateToken } from '../middleware/auth.js';
import { openSlots } from '../helpers/slotFinder.js';

const router = express.Router();
const MAX_RANGE_DAYS = 60;

// The caller's own upcoming teaching schedule (home-dashboard read; the
// legacy /:id/schedule queries dropped v1 columns and predates schema v2).
router.get('/me/sessions', authenticateToken, async (req, res) => {
  if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Instructors only' });
  const days = Math.min(Number(req.query.days) || 7, 31);
  const { rows } = await req.db.query(
    `SELECT cs.session_id, cs.class_id, cs.starts_at, cs.ends_at, cs.status, cs.room_id,
            c.class_type, sub.name AS subject,
            (SELECT count(*)::int FROM enrollments e
              WHERE e.class_id = cs.class_id AND e.status = 'active') AS enrolled
       FROM class_sessions cs
       JOIN classes c ON c.class_id = cs.class_id
       JOIN subjects sub ON sub.subject_id = c.subject_id
      WHERE cs.instructor_id = $1
        AND cs.status IN ('scheduled','reschedule_requested')
        AND cs.starts_at >= CURRENT_TIMESTAMP
        AND cs.starts_at < CURRENT_TIMESTAMP + make_interval(days => $2)
      ORDER BY cs.starts_at`,
    [req.user.user_id, days]);
  res.json(rows);
});

router.get('/:id/open-slots', authenticateToken, async (req, res) => {
  const instructorId = Number(req.params.id);
  if (!instructorId) return res.status(400).json({ message: 'invalid instructor id' });
  const { from, to, tz } = req.query;
  if (!from || !to || !tz) return res.status(400).json({ message: 'from, to, and tz query params are required' });

  const fromDt = DateTime.fromISO(from);
  const toDt = DateTime.fromISO(to);
  if (!fromDt.isValid || !toDt.isValid) return res.status(400).json({ message: 'from/to must be ISO timestamps' });
  if (!DateTime.now().setZone(tz).isValid) return res.status(400).json({ message: `invalid tz: ${tz}` });
  if (toDt <= fromDt) return res.status(400).json({ message: 'to must be after from' });
  if (toDt.diff(fromDt, 'days').days > MAX_RANGE_DAYS) {
    return res.status(400).json({ message: `range must be at most ${MAX_RANGE_DAYS} days` });
  }

  const { rows: instructor } = await req.db.query(
    `SELECT 1 FROM instructors WHERE instructor_id = $1`, [instructorId]);
  if (!instructor.length) return res.status(404).json({ message: 'Instructor not found' });

  const slots = await openSlots(req.db, instructorId, from, to, tz);
  res.json({ instructor_id: instructorId, from, to, slots });
});

export default router;
