// Attendance-driven deduction engine (spec 04, BIL-1/BIL-2).
// INV-1: no credit moves without an attendance event — every deduction/refund/
// adjustment row is attendance_id-linked. INV-6: nothing here (or anywhere in
// billing) ever unenrolls a student; the grace/blocked lifecycle only gates
// attendance marking and raises staff tasks.
import { DateTime } from 'luxon';
import { notifyFamily } from './notify.js';

export const ATTENDANCE_STATUSES = [
  'present', 'absent_unexcused', 'absent_excused',
  'cancelled_in_window', 'cancelled_late', 'instructor_cancelled'
];

// Statuses that consume the session's credit cost (spec 04 §Deduction engine).
export const DEDUCTING = new Set(['present', 'absent_unexcused', 'cancelled_late']);

// Price active at the session's start (BIL-3): the latest price-history row
// effective on or before starts_at; classes.session_credit_cost is only a
// fallback for rows predating any history.
export async function priceAtSessionStart(client, classId, startsAt) {
  const { rows } = await client.query(
    `SELECT COALESCE(
       (SELECT session_credit_cost FROM class_price_history
         WHERE class_id = $1 AND effective_from <= $2
         ORDER BY effective_from DESC LIMIT 1),
       (SELECT session_credit_cost FROM classes WHERE class_id = $1)
     )::int AS cost`,
    [classId, startsAt]
  );
  return rows[0].cost;
}

// Marks or corrects one student's attendance and applies the ledger effect,
// inside the CALLER's open transaction (caller owns COMMIT/ROLLBACK; every
// statement runs on `client`). Returns
//   { ok:true, attendance, cost, delta, balance, wentNegative }
// or, having written NOTHING,
//   { ok:false, status, body: { code, message, ... } }.
//
// Corrections use net-effect math: delta = (deducting ? -cost : 0) minus what
// the ledger has actually charged this attendance so far. Working from the real
// charged sum (not a recomputed old cost) makes correction chains converge
// exactly, even across price changes — history is never edited, only appended.
export async function applyAttendanceWithinTx(client, {
  session, studentId, status, actorUserId,
  autoCompleted = false, settings, now = DateTime.utc().toISO()
}) {
  const cost = await priceAtSessionStart(client, session.class_id, session.starts_at);

  await client.query(
    `INSERT INTO wallets (student_id) VALUES ($1) ON CONFLICT (student_id) DO NOTHING`,
    [studentId]
  );
  // serializes the balance math + floor gate for this student
  const { rows: [wallet] } = await client.query(
    `SELECT wallet_id, balance FROM wallets WHERE student_id = $1 FOR UPDATE`,
    [studentId]
  );

  const { rows: [existing] } = await client.query(
    `SELECT * FROM session_attendance WHERE session_id = $1 AND student_id = $2 FOR UPDATE`,
    [session.session_id, studentId]
  );

  let currentNet = 0;
  if (existing) {
    // Corrections after the lock window need a staff unlock (INV-5; ACA-4 flow
    // is a later slice). The computed deadline also holds when the nightly lock
    // job hasn't stamped locked_at yet. First marks are never lock-blocked —
    // only rows the lock job has seen can be locked.
    const endsAt = typeof session.ends_at === 'string'
      ? DateTime.fromISO(session.ends_at)
      : DateTime.fromJSDate(session.ends_at);
    const lockDeadline = endsAt.plus({ days: settings.session_record_lock_days });
    if (existing.locked_at !== null || DateTime.fromISO(now) >= lockDeadline) {
      return { ok: false, status: 409, body: {
        code: 'RECORD_LOCKED',
        message: `Attendance for this session is locked (${settings.session_record_lock_days}-day window) — staff unlock required`
      } };
    }
    if (existing.status === status) {
      return { ok: true, attendance: existing, cost, delta: 0, balance: wallet.balance, wentNegative: false, firstMark: false };
    }
    const { rows: [net] } = await client.query(
      `SELECT COALESCE(SUM(amount), 0)::int AS net FROM credit_ledger WHERE attendance_id = $1`,
      [existing.attendance_id]
    );
    currentNet = net.net;
  }

  const desiredNet = DEDUCTING.has(status) ? -cost : 0;
  const delta = desiredNet - currentNet;

  // Grace floor (BIL-2): the balance may go negative down to
  // -(negative_balance_floor_sessions × cost); a deduction that would breach it
  // blocks the mark entirely — nothing is written, so a post-top-up retry is a
  // plain first mark and the auto-completer naturally re-encounters the student.
  // Credit-restoring corrections (delta >= 0) are never blocked.
  if (delta < 0) {
    const floor = -(settings.negative_balance_floor_sessions * cost);
    if (wallet.balance + delta < floor) {
      return { ok: false, status: 409, body: {
        code: 'ATTENDANCE_BLOCKED',
        message: `top-up required (${wallet.balance + delta} < ${floor})`,
        balance: wallet.balance, cost, floor
      } };
    }
  }

  let attendance;
  if (existing) {
    ({ rows: [attendance] } = await client.query(
      `UPDATE session_attendance
          SET status = $1, adjusted_from = $2, marked_by = $3,
              marked_at = CURRENT_TIMESTAMP, auto_completed = false
        WHERE attendance_id = $4 RETURNING *`,
      [status, existing.status, actorUserId, existing.attendance_id]
    ));
  } else {
    ({ rows: [attendance] } = await client.query(
      `INSERT INTO session_attendance (session_id, student_id, status, marked_by, auto_completed)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [session.session_id, studentId, status, actorUserId, autoCompleted]
    ));
  }

  let balance = wallet.balance;
  if (delta !== 0) {
    // spec names the instructor-cancelled reversal a refund; every other
    // correction is a signed adjustment. All entries reference the attendance.
    const entryType = !existing ? 'deduction'
      : (status === 'instructor_cancelled' && currentNet < 0) ? 'refund'
      : 'adjustment';
    await client.query(
      `INSERT INTO credit_ledger (wallet_id, entry_type, amount, attendance_id, created_by)
       VALUES ($1,$2,$3,$4,$5)`,
      [wallet.wallet_id, entryType, delta, attendance.attendance_id, actorUserId]
    );
    ({ rows: [{ balance }] } = await client.query(
      `UPDATE wallets SET balance = balance + $1 WHERE wallet_id = $2 RETURNING balance`,
      [delta, wallet.wallet_id]
    ));
  }

  // Grace crossing: deduction left the wallet negative → urgent family notice +
  // delinquent-balance staff task. One open task per student is the dedupe;
  // closing it (top-up in walletRoutes) re-arms the notice.
  const wentNegative = delta < 0 && balance < 0;
  if (wentNegative) {
    const { rows: openTask } = await client.query(
      `SELECT 1 FROM staff_tasks
        WHERE kind = 'delinquent_balance' AND subject_type = 'student'
          AND subject_id = $1 AND status IN ('open','in_progress')`,
      [String(studentId)]
    );
    if (!openTask.length) {
      await client.query(
        `INSERT INTO staff_tasks (kind, urgency, subject_type, subject_id, details)
         VALUES ('delinquent_balance','urgent','student',$1,$2)`,
        [String(studentId), { balance, cost, session_id: session.session_id, class_id: session.class_id }]
      );
      await notifyFamily(client, {
        studentId: studentId, eventType: 'balance_negative', subjectType: 'student', subjectId: studentId,
        payload: { balance, cost, class_id: session.class_id, urgency: 'urgent' }
      });
    }
  }

  return { ok: true, attendance, cost, delta, balance, wentNegative, firstMark: !existing };
}
