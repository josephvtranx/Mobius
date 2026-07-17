// Scheduling background jobs (spec 08): the hold-expiry sweeper and the
// request-deadline enforcer, as plain exported functions — scheduler wiring is
// Phase 7.6. `now` is a UTC ISO string flowing into every time comparison as a
// SQL parameter so tests can drive the clock (PGlite's clock can't be faked).
import { DateTime } from 'luxon';
import { getSettings } from '../helpers/institutionSettings.js';
import { logNotifications, familyRecipients } from '../helpers/notify.js';

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
      const recipients = await familyRecipients(db, row.held_for_student_id);
      await logNotifications(db, {
        eventType: 'reschedule_escalated', recipientUserIds: recipients,
        subjectType: 'reschedule_request', subjectId: row.request_id,
        payload: { message: 'No instructor response yet — academy staff are following up' }
      });
    }
    escalated++;
  }

  // (b) hard stop: the Window before the original session closed unresolved
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
      const recipients = await familyRecipients(db, row.held_for_student_id);
      await logNotifications(db, {
        eventType: 'reschedule_expired', recipientUserIds: recipients,
        subjectType: 'reschedule_request', subjectId: row.request_id,
        payload: { session_id: row.session_id, original_starts_at: row.starts_at }
      });
    }
    expired++;
  }
  return { escalated, expired };
}
