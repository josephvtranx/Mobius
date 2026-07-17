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
