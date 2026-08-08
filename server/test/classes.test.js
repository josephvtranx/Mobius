// Phase 7.1 — classes domain (spec 03). Tests follow the spec's acceptance
// criteria: SCH-1 create/materialize/conflict, SCH-2 gate sequence,
// SCH-3 catalog + membership requests, SCH-6 end/terminate.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { startTestEnv, TEST_CODE, SEED_USER } from './helpers/testEnv.js';

let env;
let staff; // authenticated supertest agent + token
let classA; // fixed-end group class used across suites
let classB; // open-ended group class in the tiny room

const TZ = 'America/Los_Angeles';

// These fixtures were originally written against a hardcoded Aug 2026
// window. Much of the domain logic under test is relative to "now" —
// the credit gate counts only FUTURE sessions, INV-4 rejects past
// effective dates, record-lock deadlines fire N days after a session —
// so once real wall-clock time passed those literals the assertions
// drifted (a class that was all-future became partly-past, etc).
//
// Fix: shift every fixture date forward by a whole number of WEEKS,
// computed once from today, so the whole window lands ~2-3 weeks in the
// future. Whole-week shifting preserves every weekday (Mon/Wed/Tue/Thu
// patterns → identical session counts) and every relative gap (a date
// that was 33 days before the anchor stays 33 days before it, so the
// "past effective date" case stays past). The original Monday anchor is
// 2026-08-03. d() shifts a plain 'YYYY-MM-DD'; ts() shifts the date part
// of a UTC timestamp while keeping the time-of-day (and the required Z).
// NOTE: the shift keeps the window inside PDT for realistic run dates —
// the one DST-sensitive assertion (the 17:00-PT == 00:00Z collision) is
// in the first shifted week, comfortably before the Nov PST changeover.
const FIXTURE_ANCHOR = DateTime.fromISO('2026-08-03');
const _target = DateTime.now().plus({ days: 14 }).startOf('day');
const SHIFT_WEEKS = Math.max(0, Math.ceil(_target.diff(FIXTURE_ANCHOR, 'weeks').weeks));
const SHIFT_DAYS = SHIFT_WEEKS * 7;
const d = (iso) => DateTime.fromISO(iso).plus({ days: SHIFT_DAYS }).toISODate();
const ts = (iso) => DateTime.fromISO(iso, { zone: 'utc' })
  .plus({ days: SHIFT_DAYS })
  .toFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

async function seed() {
  const db = env.tenantDb;
  // users 2..6: instructor, four students (exec: multi-statement)
  await db.exec(`
    INSERT INTO users (password_hash, name, email, role) VALUES
      ('h','Instructor','instr@test.com','instructor'),
      ('h','Student A','sa@test.com','student'),
      ('h','Student B','sb@test.com','student'),
      ('h','Student C','sc@test.com','student'),
      ('h','Student D','sd@test.com','student');
    INSERT INTO instructors (instructor_id) VALUES (2);
    INSERT INTO students (student_id, status) VALUES (3,'enrolled'),(4,'enrolled'),(5,'enrolled'),(6,'enrolled');
    INSERT INTO subject_groups (name) VALUES ('Math');
    INSERT INTO subjects (group_id, name) VALUES (1,'Algebra');
    INSERT INTO instructor_specialties (instructor_id, subject_id) VALUES (2, 1);
    INSERT INTO rooms (name, capacity) VALUES ('Tiny Room', 2), ('Big Room', 10);
    INSERT INTO wallets (student_id, balance) VALUES (3, 100), (4, 0);
  `);
}

function tokenFor(userId) {
  return jwt.sign({ userId, tenantCode: TEST_CODE }, process.env.JWT_SECRET, { expiresIn: '10m' });
}

beforeAll(async () => {
  env = await startTestEnv();
  await seed();
  const agent = request.agent(env.app);
  const login = await agent.post('/api/auth/login')
    .set('x-institution-code', TEST_CODE)  // D7: tenant via header, then via the JWT
    .send({ email: SEED_USER.email, password: SEED_USER.password });
  staff = { agent, auth: { Authorization: `Bearer ${login.body.accessToken}` } };
}, 60000);

afterAll(async () => {
  await env?.stop();
});

describe('SCH-1 — staff creates a class', () => {
  it('creates a fixed-end weekly group class and materializes every session', async () => {
    const res = await staff.agent.post('/api/classes').set(staff.auth).send({
      class_type: 'group', subject_id: 1, instructor_id: 2, student_limit: 3,
      session_credit_cost: 5, recurrence: 'weekly',
      recurrence_rule: { timezone: TZ, byday: [
        { day: 'mon', start: '17:00', end: '18:30' },
        { day: 'wed', start: '17:00', end: '18:30' }
      ] },
      starts_on: d('2026-08-03'), ends_on: d('2026-08-28'), default_room_id: 2
    });
    expect(res.status).toBe(201);
    expect(res.body.sessions_created).toBe(8); // Mon×4 + Wed×4 in Aug 3–28
    expect(res.body.warnings).toEqual([]);
    classA = res.body.class;

    const { rows } = await env.tenantDb.query(
      `SELECT count(*)::int AS n FROM class_price_history WHERE class_id = $1`, [classA.class_id]);
    expect(rows[0].n).toBe(1);
  });

  it('warns (never blocks) when student_limit exceeds room capacity', async () => {
    const res = await staff.agent.post('/api/classes').set(staff.auth).send({
      class_type: 'group', subject_id: 1, instructor_id: 2, student_limit: 8,
      session_credit_cost: 5, recurrence: 'weekly',
      recurrence_rule: { timezone: TZ, byday: [
        { day: 'tue', start: '10:00', end: '11:00' },
        { day: 'thu', start: '10:00', end: '11:00' }
      ] },
      starts_on: d('2026-08-04'), ends_on: null, default_room_id: 1 // open-ended, tiny room
    });
    expect(res.status).toBe(201);
    expect(res.body.warnings[0]).toContain('seats 2 of 8');
    expect(res.body.sessions_created).toBeGreaterThanOrEqual(16); // 8-week horizon, 2/wk
    classB = res.body.class;
  });

  it('409s when the instructor is already booked (INV-3, racing writer loses)', async () => {
    // one-off request colliding with a classA session (Mon Aug 10 17:00 PDT = 00:00Z Aug 11)
    const res = await staff.agent.post('/api/classes').set(staff.auth).send({
      class_type: 'one_on_one', subject_id: 1, instructor_id: 2, student_limit: 1,
      session_credit_cost: 5, recurrence: 'none', starts_on: d('2026-08-11'),
      sessions: [{ starts_at: ts('2026-08-11T00:30:00.000Z'), ends_at: ts('2026-08-11T01:30:00.000Z') }]
    });
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('conflict');
  });

  it('creates a one-off 1:1 (recurrence none) with exactly one session', async () => {
    const res = await staff.agent.post('/api/classes').set(staff.auth).send({
      class_type: 'one_on_one', subject_id: 1, instructor_id: 2, student_limit: 1,
      session_credit_cost: 7, recurrence: 'none', starts_on: d('2026-09-04'),
      sessions: [{ starts_at: ts('2026-09-04T17:00:00.000Z'), ends_at: ts('2026-09-04T18:00:00.000Z') }]
    });
    expect(res.status).toBe(201);
    expect(res.body.sessions_created).toBe(1);
  });

  it('rejects one-off group classes and unsupported custom recurrence', async () => {
    const oneOffGroup = await staff.agent.post('/api/classes').set(staff.auth).send({
      class_type: 'group', subject_id: 1, instructor_id: 2, student_limit: 4,
      session_credit_cost: 5, recurrence: 'none', starts_on: d('2026-09-05'),
      sessions: [{ starts_at: ts('2026-09-05T17:00:00.000Z'), ends_at: ts('2026-09-05T18:00:00.000Z') }]
    });
    expect(oneOffGroup.status).toBe(400);

    const custom = await staff.agent.post('/api/classes').set(staff.auth).send({
      class_type: 'group', subject_id: 1, instructor_id: 2, student_limit: 4,
      session_credit_cost: 5, recurrence: 'custom', recurrence_rule: { timezone: TZ, byday: [] },
      starts_on: d('2026-09-05')
    });
    expect(custom.status).toBe(400);
    expect(custom.body.message).toContain('custom');
  });
});

describe('SCH-2 — enrollment gate sequence (seat → room → credit, one tx)', () => {
  it('enrolls a funded student; blocks a double enrollment', async () => {
    // classA: fixed-end, 8 future sessions × 5 credits = 40 required; A has 100
    const ok = await staff.agent.post(`/api/classes/${classA.class_id}/enrollments`)
      .set(staff.auth).send({ student_id: 3 });
    expect(ok.status).toBe(201);

    const dup = await staff.agent.post(`/api/classes/${classA.class_id}/enrollments`)
      .set(staff.auth).send({ student_id: 3 });
    expect(dup.status).toBe(409);
    expect(dup.body.code).toBe('ALREADY_ENROLLED');
  });

  it('blocks on credit shortfall with the exact amount; same request succeeds after top-up', async () => {
    const short = await staff.agent.post(`/api/classes/${classA.class_id}/enrollments`)
      .set(staff.auth).send({ student_id: 4 });
    expect(short.status).toBe(400);
    expect(short.body.code).toBe('INSUFFICIENT_CREDITS');
    expect(short.body.required).toBe(40);
    expect(short.body.shortfall).toBe(40);

    await env.tenantDb.query(`UPDATE wallets SET balance = 40 WHERE student_id = 4`);
    const retry = await staff.agent.post(`/api/classes/${classA.class_id}/enrollments`)
      .set(staff.auth).send({ student_id: 4 });
    expect(retry.status).toBe(201);
  });

  it('treats a missing wallet as zero balance', async () => {
    const res = await staff.agent.post(`/api/classes/${classA.class_id}/enrollments`)
      .set(staff.auth).send({ student_id: 5 });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INSUFFICIENT_CREDITS');
    expect(res.body.balance).toBe(0);
  });

  it('hard-blocks at student_limit (CLASS_FULL)', async () => {
    await env.tenantDb.query(
      `INSERT INTO wallets (student_id, balance) VALUES (5, 1000), (6, 1000)`);
    const third = await staff.agent.post(`/api/classes/${classA.class_id}/enrollments`)
      .set(staff.auth).send({ student_id: 5 });
    expect(third.status).toBe(201); // 3/3

    const overflow = await staff.agent.post(`/api/classes/${classA.class_id}/enrollments`)
      .set(staff.auth).send({ student_id: 6 });
    expect(overflow.status).toBe(409);
    expect(overflow.body.code).toBe('CLASS_FULL');
  });

  it('blocks on room capacity before credits (ROOM_CAPACITY, physical cap)', async () => {
    // classB: tiny room caps 2; open-ended gate = 5 × 4 runway = 20 credits
    const first = await staff.agent.post(`/api/classes/${classB.class_id}/enrollments`)
      .set(staff.auth).send({ student_id: 3 });
    expect(first.status).toBe(201);
    const second = await staff.agent.post(`/api/classes/${classB.class_id}/enrollments`)
      .set(staff.auth).send({ student_id: 4 });
    expect(second.status).toBe(201);

    const overCap = await staff.agent.post(`/api/classes/${classB.class_id}/enrollments`)
      .set(staff.auth).send({ student_id: 5 });
    expect(overCap.status).toBe(409);
    expect(overCap.body.code).toBe('ROOM_CAPACITY');
    expect(overCap.body.message).toContain('Tiny Room');
  });
});

describe('SCH-3 — catalog and membership requests', () => {
  it('lists group classes with live seat counts; full classes are flagged', async () => {
    const res = await staff.agent.get('/api/classes/catalog')
      .set({ Authorization: `Bearer ${tokenFor(3)}` }); // students can browse
    expect(res.status).toBe(200);
    const a = res.body.find(c => c.class_id === classA.class_id);
    expect(a.seats_left).toBe(0);
    expect(a.full).toBe(true);
  });

  it('respects the group_catalog_visible knob', async () => {
    await env.tenantDb.query(`UPDATE institution_settings SET group_catalog_visible = false`);
    const res = await staff.agent.get('/api/classes/catalog')
      .set({ Authorization: `Bearer ${tokenFor(3)}` });
    expect(res.status).toBe(403);
    await env.tenantDb.query(`UPDATE institution_settings SET group_catalog_visible = true`);
  });

  it('join request on a full class is tagged waitlist and creates a staff task', async () => {
    const res = await staff.agent.post(`/api/classes/${classA.class_id}/membership-requests`)
      .set({ Authorization: `Bearer ${tokenFor(6)}` })
      .send({ kind: 'join', student_id: 6 });
    expect(res.status).toBe(201);
    expect(res.body.request.is_waitlist).toBe(true);

    const { rows } = await env.tenantDb.query(
      `SELECT count(*)::int AS n FROM staff_tasks WHERE kind = 'join_request'`);
    expect(rows[0].n).toBe(1);
  });

  it('approving a join request re-runs the gates (full class still blocks)', async () => {
    const { rows: [reqRow] } = await env.tenantDb.query(
      `SELECT request_id FROM class_membership_requests WHERE kind = 'join' AND status = 'pending' LIMIT 1`);
    const res = await staff.agent.post(`/api/classes/membership-requests/${reqRow.request_id}/resolve`)
      .set(staff.auth).send({ action: 'approve' });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('CLASS_FULL');
  });

  it('a student cannot file requests for someone else', async () => {
    const res = await staff.agent.post(`/api/classes/${classA.class_id}/membership-requests`)
      .set({ Authorization: `Bearer ${tokenFor(6)}` })
      .send({ kind: 'join', student_id: 3 });
    expect(res.status).toBe(403);
  });

  it('leave requires a reason; staff approval frees the seat', async () => {
    const noReason = await staff.agent.post(`/api/classes/${classA.class_id}/membership-requests`)
      .set({ Authorization: `Bearer ${tokenFor(3)}` })
      .send({ kind: 'leave', student_id: 3 });
    expect(noReason.status).toBe(400);

    const leave = await staff.agent.post(`/api/classes/${classA.class_id}/membership-requests`)
      .set({ Authorization: `Bearer ${tokenFor(3)}` })
      .send({ kind: 'leave', student_id: 3, reason: 'schedule conflict' });
    expect(leave.status).toBe(201);

    const resolved = await staff.agent.post(`/api/classes/membership-requests/${leave.body.request.request_id}/resolve`)
      .set(staff.auth).send({ action: 'approve' });
    expect(resolved.status).toBe(200);

    const { rows } = await env.tenantDb.query(
      `SELECT status FROM enrollments WHERE class_id = $1 AND student_id = 3`, [classA.class_id]);
    expect(rows[0].status).toBe('left');

    // freed seat: the waitlisted student can now enroll
    const nowFits = await staff.agent.post(`/api/classes/${classA.class_id}/enrollments`)
      .set(staff.auth).send({ student_id: 6 });
    expect(nowFits.status).toBe(201);
  });
});

describe('SCH-6 — end and terminate', () => {
  it('ending a class removes only sessions after the end date', async () => {
    const res = await staff.agent.patch(`/api/classes/${classA.class_id}/end`)
      .set(staff.auth).send({ ends_on: d('2026-08-14') });
    expect(res.status).toBe(200);
    expect(res.body.sessions_removed).toBe(4); // Mon 17, Wed 19, Mon 24, Wed 26

    const { rows } = await env.tenantDb.query(
      `SELECT count(*)::int AS n FROM class_sessions WHERE class_id = $1`, [classA.class_id]);
    expect(rows[0].n).toBe(4); // Aug 3, 5, 10, 12 remain
  });

  it('terminating removes future sessions and the whole roster, with notifications', async () => {
    const res = await staff.agent.post(`/api/classes/${classB.class_id}/terminate`).set(staff.auth);
    expect(res.status).toBe(200);
    expect(res.body.students_removed).toBe(2);

    const { rows: e } = await env.tenantDb.query(
      `SELECT count(*)::int AS n FROM enrollments WHERE class_id = $1 AND status = 'removed'`, [classB.class_id]);
    expect(e[0].n).toBe(2);
    const { rows: s } = await env.tenantDb.query(
      `SELECT count(*)::int AS n FROM class_sessions WHERE class_id = $1 AND status = 'scheduled'`, [classB.class_id]);
    expect(s[0].n).toBe(0);
    const { rows: n } = await env.tenantDb.query(
      `SELECT count(*)::int AS n FROM notification_log WHERE event_type = 'class_terminated'`);
    expect(n[0].n).toBeGreaterThanOrEqual(2);
  });

  it('ends by the class local date, not the UTC date (boundary session kept)', async () => {
    // Mon 20:00 PDT is 03:00Z Tuesday — its UTC date is a day ahead of the local date
    const created = await staff.agent.post('/api/classes').set(staff.auth).send({
      class_type: 'one_on_one', subject_id: 1, instructor_id: 2, student_limit: 1,
      session_credit_cost: 5, recurrence: 'weekly',
      recurrence_rule: { timezone: TZ, byday: [{ day: 'mon', start: '20:00', end: '21:00' }] },
      starts_on: d('2026-08-03'), ends_on: d('2026-08-03')
    });
    expect(created.status).toBe(201);
    expect(created.body.sessions_created).toBe(1);

    // ending on that same local Monday must KEEP the session (a UTC-date cutoff would drop it)
    const ended = await staff.agent.patch(`/api/classes/${created.body.class.class_id}/end`)
      .set(staff.auth).send({ ends_on: d('2026-08-03') });
    expect(ended.status).toBe(200);
    expect(ended.body.sessions_removed).toBe(0);
  });

  it('will not end or re-terminate an already-terminated class', async () => {
    // classB was terminated above
    const reEnd = await staff.agent.patch(`/api/classes/${classB.class_id}/end`)
      .set(staff.auth).send({ ends_on: d('2026-09-01') });
    expect(reEnd.status).toBe(400);

    const reTerm = await staff.agent.post(`/api/classes/${classB.class_id}/terminate`).set(staff.auth);
    expect(reTerm.status).toBe(400);
  });
});

describe('membership request list (slice-3 endpoint)', () => {
  it('staff list pending requests with names; non-staff 403', async () => {
    const res = await staff.agent.get('/api/classes/membership-requests').set(staff.auth);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1); // student 6's waitlisted join
    expect(res.body[0]).toHaveProperty('student_name');
    expect(res.body[0]).toHaveProperty('subject');
    expect(res.body[0]).toHaveProperty('is_waitlist');

    const notStaff = await staff.agent.get('/api/classes/membership-requests')
      .set({ Authorization: `Bearer ${tokenFor(3)}` });
    expect(notStaff.status).toBe(403);
  });
});

describe('SCH-5 — series-level schedule change', () => {
  let classS; // Tue/Thu 13:00–14:00 PT, Aug 4–28 → 8 sessions

  it('regenerates only sessions on/after the effective date, with the old→new diff notice', async () => {
    const created = await staff.agent.post('/api/classes').set(staff.auth).send({
      class_type: 'group', subject_id: 1, instructor_id: 2, student_limit: 4,
      session_credit_cost: 5, recurrence: 'weekly',
      recurrence_rule: { timezone: TZ, byday: [
        { day: 'tue', start: '13:00', end: '14:00' },
        { day: 'thu', start: '13:00', end: '14:00' }
      ] },
      starts_on: d('2026-08-04'), ends_on: d('2026-08-28')
    });
    expect(created.status).toBe(201);
    expect(created.body.sessions_created).toBe(8);
    classS = created.body.class;
    await staff.agent.post(`/api/classes/${classS.class_id}/enrollments`)
      .set(staff.auth).send({ student_id: 3 }).expect(201);

    const before = await staff.agent.get(`/api/classes/${classS.class_id}`).set(staff.auth);
    const keptIds = before.body.sessions.slice(0, 4).map(s => s.session_id); // Aug 4, 6, 11, 13

    const res = await staff.agent.patch(`/api/classes/${classS.class_id}/schedule`)
      .set(staff.auth).send({
        recurrence_rule: { timezone: TZ, byday: [{ day: 'fri', start: '13:00', end: '14:00' }] },
        effective_from: d('2026-08-14')
      });
    expect(res.status).toBe(200);
    expect(res.body.sessions_removed).toBe(4); // Aug 18, 20, 25, 27
    expect(res.body.sessions_created).toBe(3); // Fri Aug 14, 21, 28

    const after = await staff.agent.get(`/api/classes/${classS.class_id}`).set(staff.auth);
    expect(after.body.sessions.length).toBe(7);
    expect(after.body.sessions.slice(0, 4).map(s => s.session_id)).toEqual(keptIds); // history untouched
    expect(after.body.recurrence_rule.byday).toEqual([{ day: 'fri', start: '13:00', end: '14:00' }]);

    // diff notice: enrolled family (student 3, no guardians seeded) + instructor
    const { rows: notices } = await env.tenantDb.query(
      `SELECT recipient_user_id, payload FROM notification_log
        WHERE event_type = 'schedule_changed' AND subject_id = $1
        ORDER BY recipient_user_id`, [classS.class_id]);
    expect(notices.map(n => n.recipient_user_id)).toEqual([2, 3]);
    expect(notices[0].payload.old.recurrence_rule.byday.length).toBe(2);
    expect(notices[0].payload.new.recurrence_rule.byday.length).toBe(1);
  });

  it('re-checks conflicts and rolls back fully on 409 (INV-3 re-offer)', async () => {
    // Mon 17:30 PT collides with classA's kept Mon Aug 10 17:00–18:30 session
    const res = await staff.agent.patch(`/api/classes/${classS.class_id}/schedule`)
      .set(staff.auth).send({
        recurrence_rule: { timezone: TZ, byday: [{ day: 'mon', start: '17:30', end: '18:00' }] },
        effective_from: d('2026-08-05')
      });
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('conflict');

    // rollback left the Friday schedule from the previous test intact
    const after = await staff.agent.get(`/api/classes/${classS.class_id}`).set(staff.auth);
    expect(after.body.sessions.length).toBe(7);
    expect(after.body.recurrence_rule.byday).toEqual([{ day: 'fri', start: '13:00', end: '14:00' }]);
  });

  it('rejects one-offs, past effective dates, invalid rules, and inactive classes', async () => {
    const oneOff = await staff.agent.post('/api/classes').set(staff.auth).send({
      class_type: 'one_on_one', subject_id: 1, instructor_id: 2, student_limit: 1,
      session_credit_cost: 5, recurrence: 'none', starts_on: d('2026-09-10'),
      sessions: [{ starts_at: ts('2026-09-10T20:00:00.000Z'), ends_at: ts('2026-09-10T21:00:00.000Z') }]
    });
    expect(oneOff.status).toBe(201);
    const newRule = { timezone: TZ, byday: [{ day: 'mon', start: '09:00', end: '10:00' }] };

    const noSeries = await staff.agent.patch(`/api/classes/${oneOff.body.class.class_id}/schedule`)
      .set(staff.auth).send({ recurrence_rule: newRule, effective_from: d('2026-09-15') });
    expect(noSeries.status).toBe(400);
    expect(noSeries.body.message).toContain('series');

    const past = await staff.agent.patch(`/api/classes/${classS.class_id}/schedule`)
      .set(staff.auth).send({ recurrence_rule: newRule, effective_from: d('2026-07-01') });
    expect(past.status).toBe(400);
    expect(past.body.message).toContain('future');

    const badRule = await staff.agent.patch(`/api/classes/${classS.class_id}/schedule`)
      .set(staff.auth).send({
        recurrence_rule: { timezone: TZ, byday: [{ day: 'xyz', start: '09:00', end: '10:00' }] },
        effective_from: d('2026-08-20')
      });
    expect(badRule.status).toBe(400);

    const tooLate = await staff.agent.patch(`/api/classes/${classS.class_id}/schedule`)
      .set(staff.auth).send({ recurrence_rule: newRule, effective_from: d('2026-09-15') });
    expect(tooLate.status).toBe(400);
    expect(tooLate.body.message).toContain('end date');

    const ended = await staff.agent.patch(`/api/classes/${classA.class_id}/schedule`)
      .set(staff.auth).send({ recurrence_rule: newRule, effective_from: d('2026-08-20') });
    expect(ended.status).toBe(400);
    expect(ended.body.message).toContain('ended');
  });
});

describe('GET /api/instructors/me/sessions — the instructor home read', () => {
  it('returns the caller\'s upcoming sessions in-window, ordered', async () => {
    const res = await staff.agent.get('/api/instructors/me/sessions?days=31')
      .set({ Authorization: `Bearer ${tokenFor(2)}` });
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    for (const s of res.body) {
      expect(['scheduled', 'reschedule_requested']).toContain(s.status);
      expect(s.subject).toBeTruthy();
      expect(typeof s.enrolled).toBe('number');
    }
    const starts = res.body.map((s) => s.starts_at);
    expect([...starts].sort()).toEqual(starts);
  });

  it('403s non-instructors', async () => {
    const res = await staff.agent.get('/api/instructors/me/sessions')
      .set({ Authorization: `Bearer ${tokenFor(3)}` });
    expect(res.status).toBe(403);
  });
});
