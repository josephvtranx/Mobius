// Scheduling background jobs (spec 08): the hold-expiry sweeper and the
// request-deadline enforcer, as plain exported functions — scheduler wiring is
// Phase 7.6. `now` is a UTC ISO string flowing into every time comparison as a
// SQL parameter so tests can drive the clock (PGlite's clock can't be faked).
import { DateTime } from 'luxon';
import { getSettings } from '../helpers/institutionSettings.js';
import { notifyFamily } from '../helpers/notify.js';
import { materializeOccurrences, RecurrenceError } from '../helpers/recurrence.js';

// Sweeper: active holds past their TTL expire. Generic over origins — also
// covers self_serve_booking (SCH-4) and consultation holds when those land.
export async function runHoldExpiry(db, now = DateTime.utc().toISO()) {
  const { rowCount: expired } = await db.query(
    `UPDATE slot_holds SET status = 'expired' WHERE status = 'active' AND expires_at < $1`, [now]);
  return { expired };
}

// Deadline enforcer (RSC-1 step 4): TTL silence → escalated + staff task;
// Window-close before the ORIGINAL session → expired, original stands.
// A request can pass through both in one run (escalated, then expired) — the
// family is notified at each transition, per the acceptance criteria.
export async function runRequestDeadlines(db, now = DateTime.utc().toISO()) {
  const settings = await getSettings(db);

  // (a) TTL escalation: pending requests whose hold has lapsed
  const { rows: stale } = await db.query(
    `SELECT r.request_id, h.held_for_student_id
       FROM reschedule_requests r JOIN slot_holds h ON h.hold_id = r.hold_id
      WHERE r.status = 'pending'
        AND (h.status = 'expired' OR (h.status = 'active' AND h.expires_at < $1))`, [now]);
  let escalated = 0;
  for (const row of stale) {
    await db.query(
      `UPDATE reschedule_requests SET status = 'escalated' WHERE request_id = $1`, [row.request_id]);
    const { rows: openTask } = await db.query(
      `SELECT 1 FROM staff_tasks
        WHERE kind = 'reschedule_escalation' AND subject_type = 'reschedule_request'
          AND subject_id = $1 AND status IN ('open','in_progress')`, [row.request_id]);
    if (!openTask.length) {
      await db.query(
        `INSERT INTO staff_tasks (kind, subject_type, subject_id, details)
         VALUES ('reschedule_escalation','reschedule_request',$1,$2)`,
        [row.request_id, { student_id: row.held_for_student_id }]);
    }
    if (row.held_for_student_id) {
      await notifyFamily(db, {
        studentId: row.held_for_student_id, eventType: 'reschedule_escalated', subjectType: 'reschedule_request', subjectId: row.request_id,
        payload: { message: 'No instructor response yet — academy staff are following up' }
      });
    }
    escalated++;
  }

  // (b) hard stop: the Window before the original session closed unresolved (RSC-1)
  const windowCloseCutoff = DateTime.fromISO(now).plus({ hours: settings.reschedule_window_hours }).toISO();
  const { rows: closing } = await db.query(
    `SELECT r.request_id, r.hold_id, r.session_id, h.held_for_student_id, cs.starts_at
       FROM reschedule_requests r
       JOIN class_sessions cs ON cs.session_id = r.session_id
       LEFT JOIN slot_holds h ON h.hold_id = r.hold_id
      WHERE r.status IN ('pending','escalated') AND cs.starts_at < $1`, [windowCloseCutoff]);
  let expired = 0;
  for (const row of closing) {
    await db.query(
      `UPDATE reschedule_requests SET status = 'expired' WHERE request_id = $1`, [row.request_id]);
    if (row.hold_id) {
      await db.query(
        `UPDATE slot_holds SET status = 'expired' WHERE hold_id = $1 AND status = 'active'`, [row.hold_id]);
    }
    await db.query(
      `UPDATE class_sessions SET status = 'scheduled' WHERE session_id = $1 AND status = 'reschedule_requested'`,
      [row.session_id]);
    if (row.held_for_student_id) {
      await notifyFamily(db, {
        studentId: row.held_for_student_id, eventType: 'reschedule_expired', subjectType: 'reschedule_request', subjectId: row.request_id,
        payload: { session_id: row.session_id, original_starts_at: row.starts_at }
      });
    }
    expired++;
  }
  return { escalated, expired };
}

// SCH-4 booking deadlines: instructor silence past the hold TTL escalates to
// staff (ASSUMPTION[US-8]); a booking still pending when its requested slot
// arrives is dead — hold expired, pending class removed, family notified.
export async function runBookingDeadlines(db, now = DateTime.utc().toISO()) {
  // (a) escalation: pending bookings whose hold has lapsed
  const { rows: stale } = await db.query(
    `SELECT c.class_id, h.held_for_student_id
       FROM classes c JOIN slot_holds h ON h.hold_id = c.booking_hold_id
      WHERE c.status = 'pending'
        AND (h.status = 'expired' OR (h.status = 'active' AND h.expires_at < $1))`, [now]);
  let escalated = 0;
  for (const row of stale) {
    const { rows: openTask } = await db.query(
      `SELECT 1 FROM staff_tasks
        WHERE kind = 'booking_escalation' AND subject_type = 'class'
          AND subject_id = $1 AND status IN ('open','in_progress')`, [row.class_id]);
    if (!openTask.length) {
      await db.query(
        `INSERT INTO staff_tasks (kind, subject_type, subject_id, details)
         VALUES ('booking_escalation','class',$1,$2)`,
        [row.class_id, { student_id: row.held_for_student_id }]);
      if (row.held_for_student_id) {
        await notifyFamily(db, {
          studentId: row.held_for_student_id, eventType: 'booking_escalated', subjectType: 'class', subjectId: row.class_id,
          payload: { message: 'No instructor response yet — academy staff are following up' }
        });
      }
      escalated++;
    }
  }

  // (b) expiry: the requested moment arrived with the booking unresolved
  const { rows: dead } = await db.query(
    `SELECT c.class_id, c.booking_hold_id, h.held_for_student_id, h.starts_at
       FROM classes c JOIN slot_holds h ON h.hold_id = c.booking_hold_id
      WHERE c.status = 'pending' AND h.starts_at <= $1`, [now]);
  let expired = 0;
  for (const row of dead) {
    await db.query(
      `UPDATE slot_holds SET status = 'expired' WHERE hold_id = $1 AND status IN ('active')`,
      [row.booking_hold_id]);
    await db.query(`DELETE FROM classes WHERE class_id = $1`, [row.class_id]);
    if (row.held_for_student_id) {
      await notifyFamily(db, {
        studentId: row.held_for_student_id, eventType: 'booking_expired', subjectType: 'class', subjectId: row.class_id,
        payload: { starts_at: row.starts_at }
      });
    }
    expired++;
  }
  return { escalated, expired };
}

// The rolling-horizon session generator (spec 08, nightly): open-ended active
// recurring classes get sessions materialized session_generation_horizon_weeks
// ahead, extending from the last existing session. Each occurrence inserts
// under its own SAVEPOINT so a calendar-constraint loser (INV-3) is skipped
// without losing the rest. Known limitation: a biweekly class whose only slot
// is Sunday (ISO week boundary) can flip cadence parity when regenerating.
export async function runSessionGenerator(db, now = DateTime.utc().toISO()) {
  const settings = await getSettings(db);
  const { rows: classes } = await db.query(
    `SELECT c.*, (SELECT max(starts_at) FROM class_sessions cs
                   WHERE cs.class_id = c.class_id) AS last_starts_at
       FROM classes c
      WHERE c.status = 'active' AND c.ends_on IS NULL
        AND c.recurrence IN ('weekly','biweekly') AND c.recurrence_rule IS NOT NULL`);

  let touched = 0, created = 0, skipped = 0;
  for (const cls of classes) {
    const tz = cls.recurrence_rule?.timezone ?? 'utc';
    const nowDt = DateTime.fromISO(now).setZone(tz);
    const target = nowDt.plus({ weeks: settings.session_generation_horizon_weeks });
    const last = cls.last_starts_at
      ? DateTime.fromJSDate(cls.last_starts_at).setZone(tz)
      : nowDt;
    if (last >= target) continue;

    let occurrences;
    try {
      occurrences = materializeOccurrences({
        recurrence: cls.recurrence, recurrenceRule: cls.recurrence_rule,
        startsOn: last.plus({ days: 1 }).toISODate(),
        endsOn: target.toISODate()
      });
    } catch (err) {
      if (err instanceof RecurrenceError) continue; // malformed rule: skip, don't kill the run
      throw err;
    }
    if (!occurrences.length) continue;

    touched++;
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      for (const occ of occurrences) {
        await client.query('SAVEPOINT occ');
        try {
          await client.query(
            `INSERT INTO class_sessions (class_id, instructor_id, room_id, starts_at, ends_at)
             VALUES ($1,$2,$3,$4,$5)`,
            [cls.class_id, cls.instructor_id, cls.default_room_id, occ.startsAt, occ.endsAt]);
          created++;
        } catch (err) {
          if (err.code === '23P01' || err.code === '23505') {
            await client.query('ROLLBACK TO SAVEPOINT occ');
            skipped++;
          } else {
            throw err;
          }
        }
        await client.query('RELEASE SAVEPOINT occ');
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
  return { classes: touched, created, skipped };
}
