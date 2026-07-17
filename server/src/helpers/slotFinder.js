// Instructor calendar truth (spec 03 edge rules / 07 RSC-1): open time =
// INSTRUCTOR_AVAILABILITY − instructor_unavailability − live CLASS_SESSIONS −
// active SLOT_HOLDS. One query path for the family-facing calendar, the
// reschedule validations, and (later) the matcher/SCH-4 — no drift.
// All helpers take db/client first (house convention).
import { DateTime } from 'luxon';

const LIVE_SESSION = `('scheduled','reschedule_requested')`;
const LUXON_TO_DOW = { 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat', 7: 'sun' };

// Everything occupying the instructor in [fromIso, toIso), sorted by start.
export async function busyIntervals(db, instructorId, fromIso, toIso) {
  const { rows } = await db.query(
    `SELECT starts_at, ends_at FROM class_sessions
      WHERE instructor_id = $1 AND status IN ${LIVE_SESSION}
        AND starts_at < $3 AND ends_at > $2
     UNION ALL
     SELECT starts_at, ends_at FROM slot_holds
      WHERE instructor_id = $1 AND status = 'active' AND expires_at > CURRENT_TIMESTAMP
        AND starts_at < $3 AND ends_at > $2
     UNION ALL
     SELECT start_datetime, end_datetime FROM instructor_unavailability
      WHERE instructor_id = $1 AND start_datetime < $3 AND end_datetime > $2
     ORDER BY 1`,
    [instructorId, fromIso, toIso]);
  return rows;
}

// Weekly availability windows materialized over [fromIso, toIso) in the
// academy's wall-clock zone `tz`, minus everything busy. Returns open windows
// [{ starts_at, ends_at }] (UTC ISO); the client discretizes into pickable slots.
export async function openSlots(db, instructorId, fromIso, toIso, tz) {
  const { rows: availability } = await db.query(
    `SELECT day_of_week, start_time, end_time, start_date, end_date
       FROM instructor_availability
      WHERE instructor_id = $1 AND status = 'active'`, [instructorId]);
  if (!availability.length) return [];

  const from = DateTime.fromISO(fromIso).setZone(tz);
  const to = DateTime.fromISO(toIso).setZone(tz);

  const windows = [];
  for (let day = from.startOf('day'); day < to; day = day.plus({ days: 1 })) {
    const dow = LUXON_TO_DOW[day.weekday];
    const dayIso = day.toISODate();
    for (const a of availability) {
      if (a.day_of_week !== dow) continue;
      if (a.start_date && dayIso < DateTime.fromJSDate(a.start_date).toISODate()) continue;
      if (a.end_date && dayIso > DateTime.fromJSDate(a.end_date).toISODate()) continue;
      const [sh, sm] = String(a.start_time).split(':').map(Number);
      const [eh, em] = String(a.end_time).split(':').map(Number);
      let s = day.set({ hour: sh, minute: sm, second: 0, millisecond: 0 });
      let e = day.set({ hour: eh, minute: em, second: 0, millisecond: 0 });
      if (s < from) s = from;
      if (e > to) e = to;
      if (e > s) windows.push({ s: s.toUTC(), e: e.toUTC() });
    }
  }
  windows.sort((a, b) => a.s - b.s);

  const busy = (await busyIntervals(db, instructorId, fromIso, toIso)).map(b => ({
    s: DateTime.fromJSDate(b.starts_at), e: DateTime.fromJSDate(b.ends_at)
  }));

  const open = [];
  for (const w of windows) {
    let cursor = w.s;
    for (const b of busy) {
      if (b.e <= cursor || b.s >= w.e) continue;
      if (b.s > cursor) open.push({ s: cursor, e: b.s });
      if (b.e > cursor) cursor = b.e;
      if (cursor >= w.e) break;
    }
    if (cursor < w.e) open.push({ s: cursor, e: w.e });
  }
  return open.map(o => ({ starts_at: o.s.toISO(), ends_at: o.e.toISO() }));
}

// INV-3 pre-check (the DB unique index / exclusion constraints are the backstop).
// excludeSessionId: the session being moved may overlap its own slot.
export async function instructorFree(db, instructorId, startsAt, endsAt, excludeSessionId = null) {
  const { rows } = await db.query(
    `SELECT 1 FROM class_sessions
      WHERE instructor_id = $1 AND status IN ${LIVE_SESSION}
        AND starts_at < $3 AND ends_at > $2
        AND ($4::uuid IS NULL OR session_id <> $4)
     UNION ALL
     SELECT 1 FROM slot_holds
      WHERE instructor_id = $1 AND status = 'active' AND expires_at > CURRENT_TIMESTAMP
        AND starts_at < $3 AND ends_at > $2
     UNION ALL
     SELECT 1 FROM instructor_unavailability
      WHERE instructor_id = $1 AND start_datetime < $3 AND end_datetime > $2
     LIMIT 1`,
    [instructorId, startsAt, endsAt, excludeSessionId]);
  return rows.length === 0;
}

// Capacity-fit heuristic: the smallest free room that seats the roster.
export async function bestFitRoom(db, startsAt, endsAt, minCapacity = 1) {
  const { rows } = await db.query(
    `SELECT room_id, name, capacity FROM rooms r
      WHERE r.capacity >= $3
        AND NOT EXISTS (SELECT 1 FROM class_sessions cs
                         WHERE cs.room_id = r.room_id AND cs.status IN ${LIVE_SESSION}
                           AND cs.starts_at < $2 AND cs.ends_at > $1)
      ORDER BY r.capacity, r.room_id LIMIT 1`,
    [startsAt, endsAt, minCapacity]);
  return rows[0] ?? null;
}

// The proposed time may not overlap any other session on the student's own
// schedule (RSC-1 collision guard). Returns the conflicting session or null.
export async function studentCollision(db, studentId, startsAt, endsAt, excludeSessionId = null) {
  const { rows } = await db.query(
    `SELECT cs.session_id, cs.starts_at, sub.name AS subject
       FROM enrollments e
       JOIN classes c ON c.class_id = e.class_id
       JOIN subjects sub ON sub.subject_id = c.subject_id
       JOIN class_sessions cs ON cs.class_id = c.class_id
      WHERE e.student_id = $1 AND e.status = 'active'
        AND cs.status IN ${LIVE_SESSION}
        AND cs.starts_at < $3 AND cs.ends_at > $2
        AND ($4::uuid IS NULL OR cs.session_id <> $4)
      LIMIT 1`,
    [studentId, startsAt, endsAt, excludeSessionId]);
  return rows[0] ?? null;
}
