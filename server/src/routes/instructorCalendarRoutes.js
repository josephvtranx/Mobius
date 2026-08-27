// v2 instructor calendar read (spec 03 edge rules / 07 RSC-1 step 1): the
// family-facing painted calendar = availability − unavailability − sessions −
// active holds, via helpers/slotFinder (the shared query path). Mounted at
// /api/instructors alongside the legacy v1 router (no path overlap).
// Availability TIMEs are academy wall clock; there is no institution-timezone
// setting, so callers supply the projection zone explicitly via ?tz=.
import express from 'express';
import { DateTime } from 'luxon';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
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

// ---------------------------------------------------------------------------
// POST /match — add-student wizard Smart Match (staff). Given a subject, a
// weekly cadence and the family's painted availability windows, return the
// qualified instructors whose REAL open slots (openSlots: availability minus
// instructor busy minus room-exhausted intervals) fall inside that
// availability over the next 14 days, with up to per_week proposed 1-hour
// slots on distinct weekdays. Ranked: full coverage first, then full-time
// (auto-confirms per the design), then most options. The design's star
// ratings / hours taught / retention have no schema source and are omitted.
// availability: [{ day: 'mon'..'sun', start: 'HH:mm', end: 'HH:mm' }]
// ---------------------------------------------------------------------------
router.post('/match', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { subject_id, per_week, availability, tz } = req.body;
  if (!Number.isInteger(Number(subject_id))) return res.status(400).json({ message: 'subject_id is required' });
  const perWeek = Number(per_week);
  if (!Number.isInteger(perWeek) || perWeek < 1 || perWeek > 7) {
    return res.status(400).json({ message: 'per_week must be 1–7' });
  }
  if (!Array.isArray(availability) || !availability.length) {
    return res.status(400).json({ message: 'availability windows are required' });
  }
  const zone = tz || 'UTC';
  if (!DateTime.now().setZone(zone).isValid) return res.status(400).json({ message: `invalid tz: ${zone}` });
  const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  for (const w of availability) {
    if (!DAY_KEYS.includes(w.day) || !/^\d{2}:\d{2}$/.test(w.start ?? '') || !/^\d{2}:\d{2}$/.test(w.end ?? '')) {
      return res.status(400).json({ message: 'each availability window needs { day, start, end }' });
    }
  }

  const { rows: candidates } = await req.db.query(
    `SELECT i.instructor_id, u.name, i.employment_type
       FROM instructor_specialties sp
       JOIN instructors i ON i.instructor_id = sp.instructor_id
       JOIN users u ON u.user_id = i.instructor_id AND u.is_active = true
      WHERE sp.subject_id = $1
      ORDER BY u.name`, [Number(subject_id)]);

  const from = DateTime.now().setZone(zone).plus({ days: 1 }).startOf('day');
  const to = from.plus({ days: 14 });
  const byDay = new Map();
  for (const w of availability) {
    if (!byDay.has(w.day)) byDay.set(w.day, []);
    byDay.get(w.day).push(w);
  }

  const results = [];
  for (const c of candidates) {
    // Sequential per instructor — PGlite serves one connection; candidate
    // counts are academy-sized (tens), not thousands.
    const open = await openSlots(req.db, c.instructor_id, from.toUTC().toISO(), to.toUTC().toISO(), zone);
    const proposed = [];
    const usedDays = new Set();
    for (const o of open) {
      const s = DateTime.fromISO(o.starts_at).setZone(zone);
      const dayKey = DAY_KEYS[s.weekday - 1];
      const windows = byDay.get(dayKey);
      if (!windows || usedDays.has(dayKey)) continue;
      for (const w of windows) {
        const wStart = s.set({ hour: Number(w.start.slice(0, 2)), minute: Number(w.start.slice(3)), second: 0, millisecond: 0 });
        const wEnd = s.set({ hour: Number(w.end.slice(0, 2)), minute: Number(w.end.slice(3)), second: 0, millisecond: 0 });
        const clipStart = s > wStart ? s : wStart;
        const openEnd = DateTime.fromISO(o.ends_at).setZone(zone);
        const clipEnd = openEnd < wEnd ? openEnd : wEnd;
        if (clipEnd.diff(clipStart, 'minutes').minutes >= 60) {
          proposed.push({ starts_at: clipStart.toUTC().toISO(), ends_at: clipStart.plus({ hours: 1 }).toUTC().toISO() });
          usedDays.add(dayKey);
          break;
        }
      }
      if (proposed.length >= perWeek) break;
    }
    if (proposed.length > 0) {
      results.push({
        instructor_id: c.instructor_id,
        name: c.name,
        employment_type: c.employment_type,
        auto_confirms: c.employment_type === 'full_time',
        slots: proposed,
        coverage: proposed.length,
      });
    }
  }

  results.sort((a, b) =>
    (b.coverage >= perWeek) - (a.coverage >= perWeek)
    || b.auto_confirms - a.auto_confirms
    || b.coverage - a.coverage);
  res.json({ per_week: perWeek, matches: results });
});

export default router;
