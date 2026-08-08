// Phase 7.2 — billing & wallet (spec 04). Suites map to the spec's acceptance
// criteria: BIL-1 deduction correctness (mark / auto-complete / correction /
// lock), BIL-2 low-balance & grace lifecycle, BIL-3 price changes — plus the
// engine edges, the wallet read surface, and manual entries.
//
// Timeline note: runAutoComplete sweeps EVERY unmarked session older than its
// cutoff, so the seed is arranged around one controlled run at
// now = 2026-07-16T12:00Z (cutoff 07-15T12Z): it legitimately auto-completes
// s3 (lock suite), sE1/sE2 (price suite) and s2 (its own AC) in ends_at order,
// and later suites assert against those auto-created rows.
//
// BIL-2 AC3 (INV-6): no billing code path unenrolls — verified by review;
// sessionRoutes/walletRoutes/billingJobs/deductionEngine never write enrollments.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { startTestEnv, TEST_CODE, SEED_USER } from './helpers/testEnv.js';
import { runAutoComplete, runLowBalanceScan, runRecordLock, runPriceSync } from '../src/jobs/billingJobs.js';
import { applyAttendanceWithinTx } from '../src/helpers/deductionEngine.js';
import { getSettings } from '../src/helpers/institutionSettings.js';

// This suite hardcoded a mid-July-2026 timeline. Two clocks are in play:
// the job functions (runAutoComplete/runRecordLock/runLowBalanceScan/
// applyAttendanceWithinTx) take an explicit `now`, but the HTTP attendance
// marks, the price INV-4 future-check, runPriceSync (no `now` param) and
// the wallet committed-math all run against the REAL clock. The suite only
// passed when real "now" sat a day or two after the 2026-07-16 anchor;
// once real time moved past it, the recent sessions fell outside the
// record-lock window, future price dates became past, and the
// committed/runway sessions (Jul 20-25) stopped counting as future.
//
// Fix: shift EVERY fixture timestamp AND every explicit `now` arg by the
// same exact-day offset, chosen so the 2026-07-16 anchor lands on
// (today - 1). That keeps the simulated clock aligned with the shifted
// sessions (their internal relationships are untouched) while placing the
// whole timeline at the same position relative to real "now" that it had
// the day it was written. Exact-day (not whole-week) because these
// sessions are inserted with explicit timestamps, so weekday alignment is
// irrelevant here — only the offset from real now matters. bd() shifts a
// plain date; bt() shifts a UTC timestamp (keeps time-of-day + Z).
const BILL_ANCHOR = DateTime.fromISO('2026-07-16');
const SHIFT_DAYS = Math.round(DateTime.now().startOf('day').diff(BILL_ANCHOR, 'days').days) - 1;
const bd = (iso) => DateTime.fromISO(iso).plus({ days: SHIFT_DAYS }).toISODate();
const bt = (iso) => DateTime.fromISO(iso, { zone: 'utc' })
  .plus({ days: SHIFT_DAYS })
  .toFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
// NOTE: never statically import src/db/* here — those modules capture
// REGISTRY_URL/PGSSLMODE at module scope, and the harness only sets them
// inside startTestEnv() (env.getTenantPool is the post-env import).

let env;
let staff;      // authenticated supertest agent + auth header
let pool;       // the app's tenant pool (for job functions)
let cls = {};   // class ids by name
let ses = {};   // session ids by name

function tokenFor(userId) {
  return jwt.sign({ userId, tenantCode: TEST_CODE }, process.env.JWT_SECRET, { expiresIn: '10m' });
}

async function seed() {
  const db = env.tenantDb;
  await db.exec(`
    INSERT INTO users (password_hash, name, email, role) VALUES
      ('h','Instructor','instr@test.com','instructor'),      -- 2
      ('h','Student A','sa@test.com','student'),             -- 3
      ('h','Student B','sb@test.com','student'),             -- 4
      ('h','Student C','sc@test.com','student'),             -- 5
      ('h','Student D','sd@test.com','student'),             -- 6
      ('h','Student E','se@test.com','student'),             -- 7
      ('h','Student F','sf@test.com','student'),             -- 8
      ('h','Guardian A','ga@test.com','guardian'),           -- 9
      ('h','Student G','sg@test.com','student'),             -- 10
      ('h','Instructor 2','instr2@test.com','instructor'),   -- 11
      ('h','Student H','sh@test.com','student');             -- 12
    INSERT INTO instructors (instructor_id) VALUES (2), (11);
    INSERT INTO students (student_id, status) VALUES
      (3,'enrolled'),(4,'enrolled'),(5,'enrolled'),(6,'enrolled'),
      (7,'enrolled'),(8,'enrolled'),(10,'enrolled'),(12,'enrolled');
    INSERT INTO guardians (user_id, relationship) VALUES (9, 'parent');
    INSERT INTO student_guardians (student_id, guardian_id, is_primary) VALUES (3, 1, true);
    INSERT INTO subject_groups (name) VALUES ('Math');
    INSERT INTO subjects (group_id, name) VALUES (1,'Algebra');
    INSERT INTO instructor_specialties (instructor_id, subject_id) VALUES (2,1),(11,1);
    -- wallets: A–E funded, F empty (AC1 excused), G/H created lazily by tests
    INSERT INTO wallets (student_id, balance) VALUES (3,20),(4,20),(5,20),(6,20),(7,20),(8,0);
  `);

  async function mkClass(name, { cost, limit = 6, instructor = 2, endsOn = null, open = false }) {
    const { rows: [row] } = await db.query(
      `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit,
                            session_credit_cost, recurrence, starts_on, ends_on, created_by)
       VALUES ('group', 1, $1, $2, $3, 'weekly', $5, $4, 1) RETURNING class_id`,
      [instructor, limit, cost, open ? null : bd(endsOn ?? '2026-07-31'), bd('2026-07-01')]);
    cls[name] = row.class_id;
    return row.class_id;
  }
  async function mkSession(name, className, startsAt, endsAt, instructor = 2) {
    const { rows: [row] } = await db.query(
      `INSERT INTO class_sessions (class_id, instructor_id, starts_at, ends_at)
       VALUES ($1, $2, $3, $4) RETURNING session_id`,
      [cls[className], instructor, startsAt, endsAt]);
    ses[name] = row.session_id;
    return row.session_id;
  }
  async function enroll(className, ...studentIds) {
    for (const sid of studentIds) {
      await db.query(`INSERT INTO enrollments (class_id, student_id) VALUES ($1,$2)`, [cls[className], sid]);
    }
  }

  await mkClass('A', { cost: 5 });                    // BIL-1 AC1 + edges
  await enroll('A', 3, 4, 5, 6, 7, 8);
  await mkSession('s1', 'A', bt('2026-07-16T10:00:00Z'), bt('2026-07-16T11:00:00Z'));
  await mkSession('sX', 'A', bt('2026-07-16T18:00:00Z'), bt('2026-07-16T19:00:00Z'));

  await mkClass('B', { cost: 5 });                    // auto-complete
  await enroll('B', 3, 4);
  await mkSession('s2', 'B', bt('2026-07-15T10:00:00Z'), bt('2026-07-15T11:00:00Z'));

  await mkClass('C', { cost: 5 });                    // lock window
  await enroll('C', 3);
  await mkSession('s3', 'C', bt('2026-07-01T10:00:00Z'), bt('2026-07-01T11:00:00Z'));

  await mkClass('D', { cost: 5 });                    // grace / blocked / lazy wallet
  await enroll('D', 3, 12);
  await mkSession('s4',  'D', bt('2026-07-16T12:00:00Z'), bt('2026-07-16T13:00:00Z'));
  await mkSession('s4b', 'D', bt('2026-07-16T14:00:00Z'), bt('2026-07-16T15:00:00Z'));
  await mkSession('s5',  'D', bt('2026-07-16T16:00:00Z'), bt('2026-07-16T17:00:00Z'));
  await mkSession('s6',  'D', bt('2026-07-16T20:00:00Z'), bt('2026-07-16T21:00:00Z'));

  await mkClass('E', { cost: 5 });                    // BIL-3: price history 5 → 8 on 07-10
  await enroll('E', 4);
  await db.query(
    `INSERT INTO class_price_history (class_id, session_credit_cost, effective_from, set_by) VALUES
       ($1, 5, $2, 1), ($1, 8, $3, 1)`, [cls.E, bt('2026-07-01T00:00:00Z'), bt('2026-07-10T00:00:00Z')]);
  await mkSession('sE1', 'E', bt('2026-07-08T10:00:00Z'), bt('2026-07-08T11:00:00Z'));
  await mkSession('sE2', 'E', bt('2026-07-12T10:00:00Z'), bt('2026-07-12T11:00:00Z'));

  await mkClass('Y', { cost: 5, instructor: 11 });    // other-instructor 403
  await enroll('Y', 3);
  await mkSession('sY', 'Y', bt('2026-07-16T09:00:00Z'), bt('2026-07-16T10:00:00Z'), 11);

  await mkClass('F', { cost: 4, open: true });        // committed: open-ended, runway-limited
  await enroll('F', 10);
  await db.query(
    `INSERT INTO class_price_history (class_id, session_credit_cost, effective_from, set_by) VALUES
       ($1, 4, $2, 1), ($1, 6, $3, 1)`, [cls.F, bt('2026-07-01T00:00:00Z'), bt('2026-07-23T00:00:00Z')]);
  for (let d = 20; d <= 25; d++) {
    await mkSession(`sF${d}`, 'F', bt(`2026-07-${d}T10:00:00Z`), bt(`2026-07-${d}T11:00:00Z`));
  }

  await mkClass('G', { cost: 4, endsOn: '2026-07-31' }); // committed: fixed-end, all remaining
  await enroll('G', 10);
  for (let d = 20; d <= 22; d++) {
    await mkSession(`sG${d}`, 'G', bt(`2026-07-${d}T12:00:00Z`), bt(`2026-07-${d}T13:00:00Z`));
  }
}

const mark = (sessionId, marks, auth) =>
  staff.agent.post(`/api/sessions/${sessionId}/attendance`).set(auth ?? staff.auth).send({ marks });

const balanceOf = async (studentId) => {
  const { rows } = await env.tenantDb.query(
    `SELECT balance FROM wallets WHERE student_id = $1`, [studentId]);
  return rows.length ? rows[0].balance : null;
};

beforeAll(async () => {
  env = await startTestEnv();
  await seed();
  const agent = request.agent(env.app);
  const login = await agent.post('/api/auth/login')
    .set('x-institution-code', TEST_CODE)  // D7: tenant via header, then via the JWT
    .send({ email: SEED_USER.email, password: SEED_USER.password });
  staff = { agent, auth: { Authorization: `Bearer ${login.body.accessToken}` } };
  pool = await env.getTenantPool(TEST_CODE);
}, 60000);

afterAll(async () => {
  await env?.stop();
});

describe('BIL-1 AC1 — group session: 5 present + 1 excused', () => {
  it('writes exactly 5 attendance-linked deductions; excused balance unchanged', async () => {
    const res = await mark(ses.s1, [
      { student_id: 3, status: 'present' }, { student_id: 4, status: 'present' },
      { student_id: 5, status: 'present' }, { student_id: 6, status: 'present' },
      { student_id: 7, status: 'present' }, { student_id: 8, status: 'absent_excused' }
    ]);
    expect(res.status).toBe(200);
    expect(res.body.results.every(r => r.ok)).toBe(true);
    expect(res.body.session_status).toBe('completed');

    const { rows: deductions } = await env.tenantDb.query(
      `SELECT l.amount FROM credit_ledger l
        JOIN session_attendance sa ON sa.attendance_id = l.attendance_id
       WHERE sa.session_id = $1 AND l.entry_type = 'deduction'`, [ses.s1]);
    expect(deductions.length).toBe(5);
    expect(deductions.every(d => d.amount === -5)).toBe(true);
    expect(await balanceOf(3)).toBe(15);
    expect(await balanceOf(8)).toBe(0); // excused: unchanged
  });
});

describe('BIL-1 AC2 — auto-complete then day-3 correction', () => {
  it('auto-completes every stale unmarked session in ends_at order', async () => {
    // cutoff 07-15T12Z catches s3, sE1, sE2, s2 (s4..s6/sX/sY end later)
    const run = await runAutoComplete(pool, bt('2026-07-16T12:00:00Z'));
    expect(run.sessions).toBe(4);
    expect(run.marked).toBe(5); // s3:1, sE1:1, sE2:1, s2:2
    expect(run.blocked).toBe(0);

    const { rows: [s2row] } = await env.tenantDb.query(
      `SELECT * FROM session_attendance WHERE session_id = $1 AND student_id = 3`, [ses.s2]);
    expect(s2row.status).toBe('present');
    expect(s2row.auto_completed).toBe(true);
    expect(s2row.marked_by).toBeNull();

    const { rows: tasks } = await env.tenantDb.query(
      `SELECT 1 FROM staff_tasks WHERE kind = 'auto_complete_verify' AND subject_id = $1`, [ses.s2]);
    expect(tasks.length).toBe(1);

    // deductions are system entries; s2 flipped completed
    const { rows: [ded] } = await env.tenantDb.query(
      `SELECT l.created_by FROM credit_ledger l WHERE l.attendance_id = $1`, [s2row.attendance_id]);
    expect(ded.created_by).toBeNull();
    const { rows: [s2s] } = await env.tenantDb.query(
      `SELECT status FROM class_sessions WHERE session_id = $1`, [ses.s2]);
    expect(s2s.status).toBe('completed');

    // student 4 hit the grace path during the sweep (20-5-5-8-5 = -3)
    expect(await balanceOf(4)).toBe(-3);

    // rerun: nothing left to do
    const rerun = await runAutoComplete(pool, bt('2026-07-16T12:00:00Z'));
    expect(rerun.sessions).toBe(0);
  });

  it('a correction to absent_excused emits an adjustment restoring the credit', async () => {
    const before = await balanceOf(3); // 5 after S1+autos
    const res = await mark(ses.s2, [{ student_id: 3, status: 'absent_excused' }]);
    expect(res.status).toBe(200);
    expect(await balanceOf(3)).toBe(before + 5);

    const { rows } = await env.tenantDb.query(
      `SELECT l.entry_type, l.amount FROM credit_ledger l
        JOIN session_attendance sa ON sa.attendance_id = l.attendance_id
       WHERE sa.session_id = $1 AND sa.student_id = 3 ORDER BY l.entry_id`, [ses.s2]);
    expect(rows).toEqual([
      { entry_type: 'deduction', amount: -5 },
      { entry_type: 'adjustment', amount: 5 }
    ]);
    const { rows: [att] } = await env.tenantDb.query(
      `SELECT adjusted_from, auto_completed FROM session_attendance
        WHERE session_id = $1 AND student_id = 3`, [ses.s2]);
    expect(att.adjusted_from).toBe('present');
    expect(att.auto_completed).toBe(false);
  });
});

describe('BIL-1 AC3 — record lock', () => {
  it('runRecordLock stamps rows past the window and leaves recent ones alone', async () => {
    // cutoff 07-15T12Z: locks s3, sE1, sE2, s2 rows (5); s1 (ends 07-16) stays open
    const run = await runRecordLock(pool, bt('2026-07-22T12:00:00Z'));
    expect(run.attendance).toBe(5);

    const { rows: s1open } = await env.tenantDb.query(
      `SELECT 1 FROM session_attendance WHERE session_id = $1 AND locked_at IS NULL`, [ses.s1]);
    expect(s1open.length).toBe(6);
  });

  it('blocks corrections on a locked row (locked_at path)', async () => {
    const res = await mark(ses.s2, [{ student_id: 4, status: 'absent_excused' }]);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('RECORD_LOCKED');
  });

  it('blocks corrections past the computed deadline even when unlocked', async () => {
    // s1 ends 07-16T11Z → deadline 07-23T11Z; row is NOT locked (job cutoff missed it)
    const { rows: [session] } = await env.tenantDb.query(
      `SELECT * FROM class_sessions WHERE session_id = $1`, [ses.s1]);
    const settings = await getSettings(env.tenantDb);
    const r = await applyAttendanceWithinTx(env.tenantDb, {
      session, studentId: 3, status: 'absent_unexcused',
      actorUserId: 1, settings, now: bt('2026-07-24T00:00:00Z')
    });
    expect(r.ok).toBe(false);
    expect(r.body.code).toBe('RECORD_LOCKED');
  });
});

describe('BIL-2 AC1 — grace: attend into negative balance', () => {
  it('deducts into grace, notifies the family urgently, opens one delinquent task', async () => {
    await env.tenantDb.query(`UPDATE wallets SET balance = 3 WHERE student_id = 3`);
    const res = await mark(ses.s4, [{ student_id: 3, status: 'present' }]);
    expect(res.status).toBe(200);
    expect(await balanceOf(3)).toBe(-2); // 3 - 5, within floor -5

    const { rows: tasks } = await env.tenantDb.query(
      `SELECT 1 FROM staff_tasks WHERE kind = 'delinquent_balance' AND subject_id = '3' AND status = 'open'`);
    expect(tasks.length).toBe(1);
    // urgent notice: guardian only — billing events reach the student only
    // when can_purchase (spec 08 trigger table / 05; Phase 7.6 notifyFamily)
    const { rows: notices } = await env.tenantDb.query(
      `SELECT recipient_user_id FROM notification_log
        WHERE event_type = 'balance_negative' AND subject_id = '3' ORDER BY recipient_user_id`);
    expect(notices.map(n => n.recipient_user_id)).toEqual([9]);
  });

  it('a second grace deduction does not duplicate the task or the urgent notice', async () => {
    await env.tenantDb.query(`UPDATE institution_settings SET negative_balance_floor_sessions = 2`);
    const res = await mark(ses.s4b, [{ student_id: 3, status: 'present' }]);
    expect(res.status).toBe(200);
    expect(await balanceOf(3)).toBe(-7); // floor now -10

    const { rows: tasks } = await env.tenantDb.query(
      `SELECT 1 FROM staff_tasks WHERE kind = 'delinquent_balance' AND subject_id = '3' AND status = 'open'`);
    expect(tasks.length).toBe(1);
    const { rows: notices } = await env.tenantDb.query(
      `SELECT 1 FROM notification_log WHERE event_type = 'balance_negative' AND subject_id = '3'`);
    expect(notices.length).toBe(1); // unchanged (guardian-only, see above)

    // restore: correct s4b back (credit-restoring corrections are never blocked)
    const undo = await mark(ses.s4b, [{ student_id: 3, status: 'absent_excused' }]);
    expect(undo.status).toBe(200);
    expect(await balanceOf(3)).toBe(-2);
    await env.tenantDb.query(`UPDATE institution_settings SET negative_balance_floor_sessions = 1`);
  });
});

describe('BIL-2 AC2 — attendance-blocked at the floor, cleared by top-up', () => {
  it('blocks the mark with the shortfall message and writes nothing', async () => {
    const res = await mark(ses.s5, [{ student_id: 3, status: 'present' }]);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('ATTENDANCE_BLOCKED');
    expect(res.body.message).toContain('top-up required (-7 < -5)');

    const { rows: att } = await env.tenantDb.query(
      `SELECT 1 FROM session_attendance WHERE session_id = $1 AND student_id = 3`, [ses.s5]);
    expect(att.length).toBe(0);
    expect(await balanceOf(3)).toBe(-2);
  });

  it('a top-up closes the delinquent task and the same mark succeeds', async () => {
    const topup = await staff.agent.post('/api/wallets/3/entries').set(staff.auth)
      .send({ entry_type: 'purchase', amount: 10, note: 'front-desk top-up' });
    expect(topup.status).toBe(201);
    expect(topup.body.balance).toBe(8);

    const { rows: tasks } = await env.tenantDb.query(
      `SELECT status FROM staff_tasks WHERE kind = 'delinquent_balance' AND subject_id = '3'`);
    expect(tasks.every(t => t.status === 'done')).toBe(true);
    const { rows: credited } = await env.tenantDb.query(
      `SELECT 1 FROM notification_log WHERE event_type = 'wallet_credited' AND subject_id = '3'`);
    expect(credited.length).toBeGreaterThanOrEqual(1);

    const retry = await mark(ses.s5, [{ student_id: 3, status: 'present' }]);
    expect(retry.status).toBe(200);
    expect(await balanceOf(3)).toBe(3);
  });
});

describe('BIL-3 — price changes', () => {
  it('sessions bill at the price active at their start (5 before, 8 after the change)', async () => {
    // sE1/sE2 were deducted during the auto-complete sweep
    const { rows } = await env.tenantDb.query(
      `SELECT sa.session_id, l.amount FROM credit_ledger l
        JOIN session_attendance sa ON sa.attendance_id = l.attendance_id
       WHERE sa.session_id IN ($1, $2) AND l.entry_type = 'deduction'`, [ses.sE1, ses.sE2]);
    const byS = Object.fromEntries(rows.map(r => [r.session_id, r.amount]));
    expect(byS[ses.sE1]).toBe(-5);
    expect(byS[ses.sE2]).toBe(-8);
  });

  it('staff sets a future price: history row + exactly one notice per family; INV-4 enforced', async () => {
    const ok = await staff.agent.post(`/api/classes/${cls.E}/price`).set(staff.auth)
      .send({ session_credit_cost: 10, effective_from: bt('2026-08-01T00:00:00.000Z') });
    expect(ok.status).toBe(201);
    const { rows: notices } = await env.tenantDb.query(
      `SELECT recipient_user_id FROM notification_log WHERE event_type = 'price_change'`);
    expect(notices.length).toBe(1); // one enrolled student (4), no guardian

    const past = await staff.agent.post(`/api/classes/${cls.E}/price`).set(staff.auth)
      .send({ session_credit_cost: 9, effective_from: bt('2026-06-01T00:00:00.000Z') });
    expect(past.status).toBe(400);
    expect(past.body.message).toContain('future');

    const dup = await staff.agent.post(`/api/classes/${cls.E}/price`).set(staff.auth)
      .send({ session_credit_cost: 11, effective_from: bt('2026-08-01T00:00:00.000Z') });
    expect(dup.status).toBe(409);
  });

  it('runPriceSync refreshes the current-value column (future rows excluded)', async () => {
    const run = await runPriceSync(pool); // real now: 07-10 row (8) effective, 08-01 (10) not yet
    expect(run.updated).toBe(1);
    const { rows: [e] } = await env.tenantDb.query(
      `SELECT session_credit_cost FROM classes WHERE class_id = $1`, [cls.E]);
    expect(e.session_credit_cost).toBe(8);
  });
});

describe('deduction engine edges', () => {
  it('re-marking the same status is idempotent (no new ledger rows)', async () => {
    const res = await mark(ses.s1, [{ student_id: 3, status: 'present' }]);
    expect(res.status).toBe(200);
    const { rows } = await env.tenantDb.query(
      `SELECT count(*)::int AS n FROM credit_ledger l
        JOIN session_attendance sa ON sa.attendance_id = l.attendance_id
       WHERE sa.session_id = $1 AND sa.student_id = 3`, [ses.s1]);
    expect(rows[0].n).toBe(1);
  });

  it('correcting excused → present deducts (floor boundary is inclusive)', async () => {
    // student 8: balance 0, cost 5, floor -5 → exactly at the floor: allowed
    const res = await mark(ses.s1, [{ student_id: 8, status: 'present' }]);
    expect(res.status).toBe(200);
    expect(await balanceOf(8)).toBe(-5);
    const { rows } = await env.tenantDb.query(
      `SELECT l.entry_type, l.amount FROM credit_ledger l
        JOIN session_attendance sa ON sa.attendance_id = l.attendance_id
       WHERE sa.session_id = $1 AND sa.student_id = 8 ORDER BY l.entry_id`, [ses.s1]);
    expect(rows).toEqual([{ entry_type: 'adjustment', amount: -5 }]);
  });

  it('correcting to instructor_cancelled refunds an existing deduction', async () => {
    const before = await balanceOf(4);
    const res = await mark(ses.s1, [{ student_id: 4, status: 'instructor_cancelled' }]);
    expect(res.status).toBe(200);
    expect(await balanceOf(4)).toBe(before + 5);
    const { rows } = await env.tenantDb.query(
      `SELECT l.entry_type, l.amount FROM credit_ledger l
        JOIN session_attendance sa ON sa.attendance_id = l.attendance_id
       WHERE sa.session_id = $1 AND sa.student_id = 4 ORDER BY l.entry_id DESC LIMIT 1`, [ses.s1]);
    expect(rows[0]).toEqual({ entry_type: 'refund', amount: 5 });
  });

  it('instructor_cancelled as a first mark moves no credits', async () => {
    const before = await balanceOf(5);
    const res = await mark(ses.sX, [{ student_id: 5, status: 'instructor_cancelled' }]);
    expect(res.status).toBe(200);
    expect(await balanceOf(5)).toBe(before);
    const { rows } = await env.tenantDb.query(
      `SELECT 1 FROM credit_ledger l
        JOIN session_attendance sa ON sa.attendance_id = l.attendance_id
       WHERE sa.session_id = $1 AND sa.student_id = 5`, [ses.sX]);
    expect(rows.length).toBe(0);
  });

  it('rejects marks for students not in the class', async () => {
    const res = await mark(ses.s1, [{ student_id: 10, status: 'present' }]);
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('not enrolled');
  });

  it('instructors mark their own sessions with the room statuses only', async () => {
    const instrAuth = { Authorization: `Bearer ${tokenFor(2)}` };
    const ok = await mark(ses.sX, [{ student_id: 6, status: 'present' }], instrAuth);
    expect(ok.status).toBe(200);

    const staffOnly = await mark(ses.sX, [{ student_id: 7, status: 'absent_excused' }], instrAuth);
    expect(staffOnly.status).toBe(400);

    const otherSession = await mark(ses.sY, [{ student_id: 3, status: 'present' }], instrAuth);
    expect(otherSession.status).toBe(403);
  });

  it('creates the wallet lazily on a first deduction', async () => {
    expect(await balanceOf(12)).toBeNull();
    const res = await mark(ses.s6, [{ student_id: 12, status: 'present' }]);
    expect(res.status).toBe(200);
    expect(await balanceOf(12)).toBe(-5);
  });
});

describe('wallet read surface', () => {
  it('is visible to staff, the student, and linked guardians — not strangers', async () => {
    for (const auth of [staff.auth,
      { Authorization: `Bearer ${tokenFor(3)}` },
      { Authorization: `Bearer ${tokenFor(9)}` }]) {
      const res = await staff.agent.get('/api/wallets/3').set(auth);
      expect(res.status).toBe(200);
      expect(res.body.ledger.length).toBeGreaterThan(0);
    }
    const stranger = await staff.agent.get('/api/wallets/3')
      .set({ Authorization: `Bearer ${tokenFor(10)}` });
    expect(stranger.status).toBe(403);
  });

  it('computes committed/available: runway-limited open-ended + full fixed-end, price-aware', async () => {
    // student 10, no wallet: classF (open, runway 4 of 6 sessions: 4+4+4+6=18),
    // classG (fixed-end, all 3 × 4 = 12) → committed 30, available -30
    const res = await staff.agent.get('/api/wallets/10').set(staff.auth);
    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(0);
    expect(res.body.wallet_id).toBeNull();
    expect(res.body.committed).toBe(30);
    expect(res.body.available).toBe(-30);
    const byClass = Object.fromEntries(res.body.per_enrollment.map(r => [r.class_id, r]));
    expect(byClass[cls.F].committed).toBe(18);
    expect(byClass[cls.F].sessions_counted).toBe(4);
    expect(byClass[cls.G].committed).toBe(12);
    expect(byClass[cls.G].sessions_counted).toBe(3);
    // the read never creates a wallet row
    expect(await balanceOf(10)).toBeNull();
  });
});

describe('manual entries', () => {
  it('rejects engine-only and unsupported types, and bad amounts', async () => {
    const cases = [
      [{ entry_type: 'deduction', amount: -5 }, 'INV-1'],
      [{ entry_type: 'refund', amount: 5 }, 'INV-1'],
      [{ entry_type: 'cashout', amount: -5 }, 'Top-Up'],
      [{ entry_type: 'purchase', amount: -5 }, 'positive'],
      [{ entry_type: 'purchase', amount: 2.5 }, 'integer'],
      [{ entry_type: 'adjustment', amount: 0 }, 'non-zero']
    ];
    for (const [body, needle] of cases) {
      const res = await staff.agent.post('/api/wallets/5/entries').set(staff.auth).send(body);
      expect(res.status).toBe(400);
      expect(res.body.message).toContain(needle);
    }
  });

  it('writes a bonus entry and updates the balance', async () => {
    const before = await balanceOf(5);
    const res = await staff.agent.post('/api/wallets/5/entries').set(staff.auth)
      .send({ entry_type: 'bonus', amount: 3, note: 'referral' });
    expect(res.status).toBe(201);
    expect(res.body.balance).toBe(before + 3);
    expect(res.body.entry.entry_type).toBe('bonus');
    expect(res.body.entry.created_by).not.toBeNull();
  });
});

describe('low-balance scanner', () => {
  it('notifies low (non-negative) enrollments once per week per enrollment', async () => {
    // isolate: everyone healthy except student 10 (balance 3 < 4×2 in classes F and G)
    await env.tenantDb.query(
      `UPDATE wallets SET balance = 100 WHERE student_id IN (3,4,5,6,7,8,12)`);
    await env.tenantDb.query(
      `INSERT INTO wallets (student_id, balance) VALUES (10, 3)`);

    const first = await runLowBalanceScan(pool);
    expect(first.notified).toBe(2); // classF + classG enrollments
    const { rows } = await env.tenantDb.query(
      `SELECT 1 FROM notification_log WHERE event_type = 'low_balance' AND recipient_user_id = 10`);
    expect(rows.length).toBe(2);

    const rerun = await runLowBalanceScan(pool);
    expect(rerun.notified).toBe(0); // deduped

    const nextWeek = await runLowBalanceScan(pool, bt('2026-07-25T12:00:00Z'));
    expect(nextWeek.notified).toBe(2); // re-armed after 7 days
  });
});
