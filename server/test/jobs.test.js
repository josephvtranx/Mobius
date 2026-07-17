// Phase 7.6 — notifications & jobs (spec 08): the session generator, prefs
// filtering in notifyFamily, the attendance-marked ping, the multi-tenant
// scheduler tick (runGroup — no timers in tests), and the dashboard signals.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { startTestEnv, TEST_CODE, SEED_USER } from './helpers/testEnv.js';
import { runSessionGenerator, runHoldExpiry } from '../src/jobs/scheduleJobs.js';
import { JOB_GROUPS, runGroup } from '../src/jobs/scheduler.js';
import { notifyFamily } from '../src/helpers/notify.js';

const TZ = 'America/Los_Angeles';

let env;
let staff;
let pool;
let cls = {};
let ses = {};
let lastTue;      // the seeded anchor session (Tuesday 10:00 LA)
let conflictSlot; // lastTue + 2 weeks — occupied by another class

const authAs = (userId) => ({
  Authorization: `Bearer ${jwt.sign({ userId, tenantCode: TEST_CODE }, process.env.JWT_SECRET, { expiresIn: '10m' })}`
});

async function seed() {
  const db = env.tenantDb;
  await db.exec(`
    INSERT INTO users (password_hash, name, email, role) VALUES
      ('h','Instructor','instr@test.com','instructor'),    -- 2
      ('h','Student A','sa@test.com','student'),           -- 3
      ('h','Student B','sb@test.com','student'),           -- 4
      ('h','Guardian A','ga@test.com','guardian'),         -- 5 (billing_only)
      ('h','Guardian B','gb@test.com','guardian'),         -- 6 (default prefs)
      ('h','Instructor 2','instr2@test.com','instructor'); -- 7
    INSERT INTO instructors (instructor_id) VALUES (2), (7);
    INSERT INTO students (student_id, status) VALUES (3,'enrolled'),(4,'enrolled');
    INSERT INTO guardians (user_id, relationship) VALUES (5,'parent'),(6,'parent');
    INSERT INTO student_guardians (student_id, guardian_id, is_primary, notification_prefs) VALUES
      (3, 1, true,  '{"mode":"billing_only"}'),
      (3, 2, false, '{}');
    INSERT INTO subject_groups (name) VALUES ('Math');
    INSERT INTO subjects (group_id, name) VALUES (1,'Algebra');
    INSERT INTO instructor_specialties (instructor_id, subject_id) VALUES (2,1);
    INSERT INTO wallets (student_id, balance) VALUES (4, 100);
  `);

  // open-ended weekly Tue 10:00–11:00 LA class — the generator's candidate
  const { rows: [c1] } = await db.query(
    `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit,
                          session_credit_cost, recurrence, recurrence_rule, starts_on, created_by)
     VALUES ('group', 1, 2, 6, 5, 'weekly',
             '{"timezone":"America/Los_Angeles","byday":[{"day":"tue","start":"10:00","end":"11:00"}]}',
             '2026-06-01', 1) RETURNING class_id`);
  cls.open = c1.class_id;
  for (const sid of [3, 4]) {
    await db.query(`INSERT INTO enrollments (class_id, student_id) VALUES ($1,$2)`, [cls.open, sid]);
  }

  // anchor session: the next Tuesday 10:00 LA from today
  let d = DateTime.now().setZone(TZ).startOf('day');
  while (d.weekday !== 2) d = d.plus({ days: 1 });
  lastTue = d.set({ hour: 10 });
  await db.query(
    `INSERT INTO class_sessions (class_id, instructor_id, starts_at, ends_at) VALUES ($1, 2, $2, $3)`,
    [cls.open, lastTue.toUTC().toISO(), lastTue.plus({ hours: 1 }).toUTC().toISO()]);

  // a fixed-end class (generator must ignore it) occupying one future slot —
  // the INV-3 conflict the generator has to skip
  conflictSlot = lastTue.plus({ weeks: 2 });
  const { rows: [c2] } = await db.query(
    `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit,
                          session_credit_cost, recurrence, starts_on, ends_on, created_by)
     VALUES ('group', 1, 2, 6, 5, 'weekly', '2026-06-01', $1, 1) RETURNING class_id`,
    [conflictSlot.plus({ weeks: 4 }).toISODate()]);
  cls.fixed = c2.class_id;
  await db.query(
    `INSERT INTO class_sessions (class_id, instructor_id, starts_at, ends_at) VALUES ($1, 2, $2, $3)`,
    [cls.fixed, conflictSlot.toUTC().toISO(), conflictSlot.plus({ hours: 1 }).toUTC().toISO()]);

  // a past session on the open class for the attendance ping test
  const { rows: [sp] } = await db.query(
    `INSERT INTO class_sessions (class_id, instructor_id, starts_at, ends_at)
     VALUES ($1, 2, $2, $3) RETURNING session_id`,
    [cls.open, DateTime.utc().minus({ hours: 2 }).toISO(), DateTime.utc().minus({ hours: 1 }).toISO()]);
  ses.past = sp.session_id;
}

const recipientsOf = async (eventType, subjectId) => {
  const { rows } = await env.tenantDb.query(
    `SELECT recipient_user_id FROM notification_log
      WHERE event_type = $1 AND subject_id = $2 ORDER BY recipient_user_id`,
    [eventType, subjectId]);
  return rows.map(r => r.recipient_user_id);
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

describe('session generator (rolling horizon)', () => {
  it('materializes the horizon, skips INV-3 losers, and is rerun-idempotent', async () => {
    const run = await runSessionGenerator(pool);
    expect(run.classes).toBe(1); // the fixed-end class is ignored
    expect(run.skipped).toBe(1); // the occupied conflictSlot
    expect(run.created).toBeGreaterThanOrEqual(5); // ~8 weeks of Tuesdays minus the loser

    // the losing slot was skipped, not duplicated
    const { rows: atConflict } = await env.tenantDb.query(
      `SELECT 1 FROM class_sessions WHERE class_id = $1 AND starts_at = $2`,
      [cls.open, conflictSlot.toUTC().toISO()]);
    expect(atConflict.length).toBe(0);

    const rerun = await runSessionGenerator(pool);
    expect(rerun.created).toBe(0);
    expect(rerun.skipped).toBe(0);
  });
});

describe('notifyFamily — GRD-5 prefs and recipient rules', () => {
  it('billing_only guardians skip non-billing events; default guardians and the student get them', async () => {
    await notifyFamily(pool, {
      studentId: 3, eventType: 'schedule_changed',
      subjectType: 'test', subjectId: 'prefs-1', payload: {}
    });
    expect(await recipientsOf('schedule_changed', 'prefs-1')).toEqual([3, 6]); // gA (5) muted
  });

  it('billing events reach guardians per prefs; the student only when can_purchase', async () => {
    await notifyFamily(pool, {
      studentId: 3, eventType: 'low_balance',
      subjectType: 'test', subjectId: 'prefs-2', payload: {}
    });
    expect(await recipientsOf('low_balance', 'prefs-2')).toEqual([5, 6]); // no student row

    await env.tenantDb.query(`UPDATE students SET can_purchase = true WHERE student_id = 3`);
    await notifyFamily(pool, {
      studentId: 3, eventType: 'low_balance',
      subjectType: 'test', subjectId: 'prefs-3', payload: {}
    });
    expect(await recipientsOf('low_balance', 'prefs-3')).toEqual([3, 5, 6]);
    await env.tenantDb.query(`UPDATE students SET can_purchase = false WHERE student_id = 3`);
  });

  it('urgent events can never be muted', async () => {
    await notifyFamily(pool, {
      studentId: 3, eventType: 'session_cancelled_by_instructor',
      subjectType: 'test', subjectId: 'prefs-4', payload: {}
    });
    // urgent + non-billing: billing_only guardian included anyway; student too
    expect(await recipientsOf('session_cancelled_by_instructor', 'prefs-4')).toEqual([3, 5, 6]);
  });
});

describe('attendance-marked ping (등하원 trust signal)', () => {
  it('pings the family on a human present first-mark only', async () => {
    const res = await staff.agent.post(`/api/sessions/${ses.past}/attendance`)
      .set(authAs(2)).send({ marks: [
        { student_id: 3, status: 'present' },
        { student_id: 4, status: 'absent_unexcused' } // no ping for absences
      ] });
    expect(res.status).toBe(200);
    // non-billing event: billing_only guardian (5) muted; student + gB get it
    expect(await recipientsOf('attendance_marked', ses.past)).toEqual([3, 6]);

    // corrections never re-ping
    const correct = await staff.agent.post(`/api/sessions/${ses.past}/attendance`)
      .set(staff.auth).send({ marks: [{ student_id: 4, status: 'present' }] });
    expect(correct.status).toBe(200);
    expect(await recipientsOf('attendance_marked', ses.past)).toEqual([3, 6]); // unchanged
  });
});

describe('scheduler — runGroup', () => {
  it('runs a group across active tenants from the registry', async () => {
    await env.tenantDb.query(
      `INSERT INTO slot_holds (instructor_id, starts_at, ends_at, origin, expires_at)
       VALUES (7, $1, $2, 'reschedule_request', CURRENT_TIMESTAMP - interval '1 hour')`,
      [DateTime.utc().plus({ hours: 200 }).toISO(), DateTime.utc().plus({ hours: 201 }).toISO()]);

    const results = await runGroup('minute', {
      registryPool: env.registryDb,
      getTenantPool: async () => pool
    });
    const sweep = results.find(r => r.job === 'runHoldExpiry');
    expect(sweep.tenant).toBe(TEST_CODE);
    expect(sweep.expired).toBe(1);
  });

  it('contains a failing job: logs it, the rest of the group still runs', async () => {
    const errors = [];
    JOB_GROUPS.testGroup = { intervalMs: 1, jobs: {
      boom: async () => { throw new Error('kaboom'); },
      sweep: (db) => runHoldExpiry(db)
    } };
    try {
      const results = await runGroup('testGroup', {
        registryPool: env.registryDb,
        getTenantPool: async () => pool,
        logger: { error: (msg) => errors.push(msg), log: () => {} }
      });
      expect(errors.some(e => e.includes('boom') && e.includes('kaboom'))).toBe(true);
      expect(results.some(r => r.job === 'sweep')).toBe(true); // survived the neighbor's crash
    } finally {
      delete JOB_GROUPS.testGroup;
    }
  });
});

describe('dashboard signals', () => {
  it('populates the four remaining spec 08 signals; staff-only', async () => {
    const db = env.tenantDb;
    // instructor cancel rate: one completed (ses.past flipped by attendance) — add a cancelled one
    await db.query(
      `INSERT INTO class_sessions (class_id, instructor_id, starts_at, ends_at, status, cancellation_reason)
       VALUES ($1, 2, $2, $3, 'cancelled_instructor', 'sick')`,
      [cls.open, DateTime.utc().minus({ days: 3 }).toISO(), DateTime.utc().minus({ days: 3 }).plus({ hours: 1 }).toISO()]);
    // verify-queue task
    await db.query(
      `INSERT INTO staff_tasks (kind, subject_type, subject_id) VALUES ('auto_complete_verify','class_session','x')`);
    // delinquency: the engine already opened a task for student 3 when the ping
    // test deducted their lazily-created wallet negative — assert it surfaces
    // serial movers: three requests for student 4
    const { rows: [s] } = await db.query(
      `SELECT session_id FROM class_sessions WHERE class_id = $1 LIMIT 1`, [cls.open]);
    for (let i = 0; i < 3; i++) {
      const { rows: [h] } = await db.query(
        `INSERT INTO slot_holds (instructor_id, starts_at, ends_at, origin, held_for_student_id, expires_at, status)
         VALUES (7, $1, $2, 'reschedule_request', 4, CURRENT_TIMESTAMP + interval '1 day', 'released')
         RETURNING hold_id`,
        [DateTime.utc().plus({ hours: 300 + i }).toISO(), DateTime.utc().plus({ hours: 300 + i, minutes: 30 }).toISO()]);
      await db.query(
        `INSERT INTO reschedule_requests (session_id, requested_by, proposed_starts_at, proposed_ends_at, hold_id, status)
         VALUES ($1, 4, $2, $3, $4, 'rejected')`,
        [s.session_id, DateTime.utc().plus({ hours: 300 + i }).toISO(),
         DateTime.utc().plus({ hours: 300 + i, minutes: 30 }).toISO(), h.hold_id]);
    }

    const res = await staff.agent.get('/api/reports/dashboard').set(staff.auth);
    expect(res.status).toBe(200);
    const instr = res.body.instructor_cancel_rate.find(r => r.instructor_id === 2);
    expect(instr.cancelled).toBe(1);
    expect(instr.rate).toBeGreaterThan(0);
    expect(res.body.auto_completed_pending.count).toBeGreaterThanOrEqual(1);
    expect(res.body.delinquency_queue.map(d => Number(d.student_id))).toContain(3);
    expect(res.body.serial_movers).toEqual([
      expect.objectContaining({ student_id: 4, requests: 3 })
    ]);
    expect(res.body.pending_requests_aging.length).toBeGreaterThanOrEqual(2);

    const notStaff = await staff.agent.get('/api/reports/dashboard').set(authAs(2));
    expect(notStaff.status).toBe(403);
  });
});
