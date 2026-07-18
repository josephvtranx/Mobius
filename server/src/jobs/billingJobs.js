// Billing background jobs (spec 08 §Background jobs) as plain exported
// functions — scheduler wiring is Phase 7.6. Every function takes (db, now?)
// with `now` a UTC ISO string flowing into ALL time comparisons as a SQL
// parameter (never CURRENT_TIMESTAMP for window math), so the PGlite tests can
// drive the clock. INV-6: nothing here touches enrollments.
import { DateTime } from 'luxon';
import { getSettings } from '../helpers/institutionSettings.js';
import { withTransaction } from '../helpers/withTransaction.js';
import { applyAttendanceWithinTx } from '../helpers/deductionEngine.js';
import { notifyFamily } from '../helpers/notify.js';

// Sessions ended > attendance_autocomplete_hours ago with unmarked active
// enrollees: mark them present/auto (deducting per BIL-1), flag the session
// for human verification, and complete it once everyone has a row.
// ATTENDANCE_BLOCKED students stay unmarked — the job re-encounters them every
// run until a top-up clears the floor (the BIL-2 "blocked" state).
export async function runAutoComplete(db, now = DateTime.utc().toISO()) {
  const settings = await getSettings(db);
  const cutoff = DateTime.fromISO(now).minus({ hours: settings.attendance_autocomplete_hours }).toISO();
  const { rows: sessions } = await db.query(
    `SELECT cs.* FROM class_sessions cs
      WHERE cs.status = 'scheduled' AND cs.ends_at < $1
        AND EXISTS (SELECT 1 FROM enrollments e
                     WHERE e.class_id = cs.class_id AND e.status = 'active'
                       AND NOT EXISTS (SELECT 1 FROM session_attendance sa
                                        WHERE sa.session_id = cs.session_id AND sa.student_id = e.student_id))
      ORDER BY cs.ends_at`, [cutoff]);

  let marked = 0, blocked = 0;
  for (const session of sessions) {
    // one transaction per session, one client at a time; a failing session
    // doesn't poison the rest of the run
    await withTransaction(db, async (client) => {
      const { rows: unmarked } = await client.query(
        `SELECT e.student_id FROM enrollments e
          WHERE e.class_id = $1 AND e.status = 'active'
            AND NOT EXISTS (SELECT 1 FROM session_attendance sa
                             WHERE sa.session_id = $2 AND sa.student_id = e.student_id)`,
        [session.class_id, session.session_id]);

      let wrote = false;
      for (const { student_id } of unmarked) {
        const r = await applyAttendanceWithinTx(client, {
          session, studentId: student_id, status: 'present',
          actorUserId: null, autoCompleted: true, settings, now
        });
        if (r.ok) { marked++; wrote = true; } else { blocked++; }
      }

      if (wrote) {
        // BIL-1: "auto-completed — verify" dashboard flag; deduped per session
        const { rows: openTask } = await client.query(
          `SELECT 1 FROM staff_tasks
            WHERE kind = 'auto_complete_verify' AND subject_type = 'class_session'
              AND subject_id = $1 AND status IN ('open','in_progress')`,
          [session.session_id]);
        if (!openTask.length) {
          await client.query(
            `INSERT INTO staff_tasks (kind, subject_type, subject_id, details)
             VALUES ('auto_complete_verify','class_session',$1,$2)`,
            [session.session_id, { class_id: session.class_id, ends_at: session.ends_at }]);
        }
      }

      // blocked students keep the session 'scheduled' — correctly "unfinished"
      const { rows: [{ missing }] } = await client.query(
        `SELECT count(*)::int AS missing FROM enrollments e
          WHERE e.class_id = $1 AND e.status = 'active'
            AND NOT EXISTS (SELECT 1 FROM session_attendance sa
                             WHERE sa.session_id = $2 AND sa.student_id = e.student_id)`,
        [session.class_id, session.session_id]);
      if (missing === 0) {
        await client.query(
          `UPDATE class_sessions SET status = 'completed' WHERE session_id = $1`, [session.session_id]);
      }
    });
  }
  return { sessions: sessions.length, marked, blocked };
}

// BIL-2 "low" state: non-negative balance below cost × runway knob → family
// notice with concrete numbers, max 1×/week per enrollment (deduped against
// notification_log). Negative balances are the grace state, owned by the
// engine's deduction-time path — the scanner skips them.
export async function runLowBalanceScan(db, now = DateTime.utc().toISO()) {
  const settings = await getSettings(db);
  const dedupeSince = DateTime.fromISO(now).minus({ days: 7 }).toISO();
  const { rows: lowEnrollments } = await db.query(
    `SELECT e.enrollment_id, e.student_id, c.class_id, sub.name AS subject,
            c.session_credit_cost AS cost, COALESCE(w.balance, 0)::int AS balance
       FROM enrollments e
       JOIN classes c ON c.class_id = e.class_id AND c.status = 'active'
       JOIN subjects sub ON sub.subject_id = c.subject_id
       LEFT JOIN wallets w ON w.student_id = e.student_id
      WHERE e.status = 'active'
        AND COALESCE(w.balance, 0) >= 0
        AND COALESCE(w.balance, 0) < c.session_credit_cost * $1
        AND NOT EXISTS (SELECT 1 FROM notification_log nl
                         WHERE nl.event_type = 'low_balance'
                           AND nl.subject_type = 'enrollment'
                           AND nl.subject_id = e.enrollment_id::text
                           AND nl.created_at > $2)`,
    [settings.low_balance_notify_runway_sessions, dedupeSince]);

  for (const row of lowEnrollments) {
    await notifyFamily(db, {
      studentId: row.student_id, eventType: 'low_balance', subjectType: 'enrollment', subjectId: row.enrollment_id,
      payload: {
        class_id: row.class_id, subject: row.subject,
        balance: row.balance, session_credit_cost: row.cost,
        runway_sessions: settings.low_balance_notify_runway_sessions
      }
    });
  }
  return { notified: lowEnrollments.length };
}

// INV-5: freeze attendance AND session notes past the shared lock window
// (spec 02 — session_record_lock_days covers both records).
export async function runRecordLock(db, now = DateTime.utc().toISO()) {
  const settings = await getSettings(db);
  const cutoff = DateTime.fromISO(now).minus({ days: settings.session_record_lock_days }).toISO();
  const { rowCount: attendance } = await db.query(
    `UPDATE session_attendance sa SET locked_at = $1
       FROM class_sessions cs
      WHERE cs.session_id = sa.session_id AND sa.locked_at IS NULL AND cs.ends_at < $2`,
    [now, cutoff]);
  const { rowCount: notes } = await db.query(
    `UPDATE session_notes sn SET locked_at = $1
       FROM class_sessions cs
      WHERE cs.session_id = sn.session_id AND sn.locked_at IS NULL AND cs.ends_at < $2`,
    [now, cutoff]);
  return { attendance, notes };
}

// Keeps classes.session_credit_cost (the "current value" read by the credit
// gate and catalog) in step with the latest effective price-history row —
// billing itself always resolves from history (priceAtSessionStart).
export async function runPriceSync(db, now = DateTime.utc().toISO()) {
  const { rowCount: updated } = await db.query(
    `UPDATE classes c SET session_credit_cost = h.session_credit_cost
       FROM (SELECT DISTINCT ON (class_id) class_id, session_credit_cost
               FROM class_price_history WHERE effective_from <= $1
               ORDER BY class_id, effective_from DESC) h
      WHERE h.class_id = c.class_id AND c.session_credit_cost <> h.session_credit_cost`,
    [now]);
  return { updated };
}
