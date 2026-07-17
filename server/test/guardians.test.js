// Phase 7.4 — guardians & accounts (spec 05): v2 signup with guardian logins,
// GRD-2 staff linking + dedupe + primary reassignment, GRD-1 portal
// aggregation with independent per-child wallets, GRD-5 prefs, GRD-4 adult
// students (can_purchase), and the privacy boundary.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { startTestEnv, TEST_CODE, SEED_USER } from './helpers/testEnv.js';

let env;
let staff;
let ids = {}; // user ids captured from register responses

const at = (hours) => DateTime.utc().plus({ hours }).toISO();
const authAs = (userId) => ({
  Authorization: `Bearer ${jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '10m' })}`
});

const register = (payload) =>
  staff.agent.post('/api/auth/register').send({
    password: 'Password123!', role: 'student', gender: 'other', school: 'Test High', grade: 9,
    ...payload
  });

beforeAll(async () => {
  env = await startTestEnv();
  const agent = request.agent(env.app);
  await agent.post('/api/institution').send({ code: TEST_CODE }).expect(200);
  const login = await agent.post('/api/auth/login')
    .send({ email: SEED_USER.email, password: SEED_USER.password });
  staff = { agent, auth: { Authorization: `Bearer ${login.body.accessToken}` } };
}, 60000);

afterAll(async () => {
  await env?.stop();
});

describe('v2 student signup (GRD-3/GRD-4)', () => {
  it('minor with two guardians: guardian logins created, first is primary, can_purchase=false', async () => {
    const res = await register({
      name: 'Student A', email: 'sa@test.com', date_of_birth: '2012-04-01',
      guardians: [
        { name: 'GP One', email: 'gp1@test.com', relationship: 'parent' },
        { name: 'GP Two', email: 'gp2@test.com', relationship: 'parent' }
      ]
    });
    expect(res.status).toBe(201);
    ids.studentA = res.body.user.user_id;

    const { rows: gUsers } = await env.tenantDb.query(
      `SELECT user_id, email FROM users WHERE role = 'guardian' ORDER BY user_id`);
    expect(gUsers).toHaveLength(2);
    ids.gp1 = gUsers[0].user_id;
    ids.gp2 = gUsers[1].user_id;

    const { rows: issued } = await env.tenantDb.query(
      `SELECT 1 FROM notification_log WHERE event_type = 'credentials_issued'`);
    expect(issued).toHaveLength(2);

    const { rows: [stu] } = await env.tenantDb.query(
      `SELECT can_purchase FROM students WHERE student_id = $1`, [ids.studentA]);
    expect(stu.can_purchase).toBe(false);
  });

  it('adult with no guardians: can_purchase=true, no guardian entity anywhere', async () => {
    const res = await register({
      name: 'Student B', email: 'sb@test.com', date_of_birth: '2000-01-01', grade: 12
    });
    expect(res.status).toBe(201);
    ids.studentB = res.body.user.user_id;

    const { rows: [stu] } = await env.tenantDb.query(
      `SELECT can_purchase FROM students WHERE student_id = $1`, [ids.studentB]);
    expect(stu.can_purchase).toBe(true);
    const { rows: links } = await env.tenantDb.query(
      `SELECT 1 FROM student_guardians WHERE student_id = $1`, [ids.studentB]);
    expect(links).toHaveLength(0);
  });

  it('dedupes an existing guardian by email — linked, no new account or credentials', async () => {
    const res = await register({
      name: 'Student C', email: 'sc@test.com', date_of_birth: '2013-09-01',
      guardians: [{ name: 'GP One', email: 'gp1@test.com', relationship: 'parent' }]
    });
    expect(res.status).toBe(201);
    ids.studentC = res.body.user.user_id;

    const { rows: gp1Users } = await env.tenantDb.query(
      `SELECT count(*)::int AS n FROM users WHERE email = 'gp1@test.com'`);
    expect(gp1Users[0].n).toBe(1);
    const { rows: issued } = await env.tenantDb.query(
      `SELECT count(*)::int AS n FROM notification_log WHERE event_type = 'credentials_issued'`);
    expect(issued[0].n).toBe(2); // unchanged — no re-issue
  });
});

describe('GRD-2 — staff linking and primary management', () => {
  it('links an existing guardian to another student without new credentials (AC)', async () => {
    const res = await staff.agent.post(`/api/students/${ids.studentB}/guardians`)
      .set(staff.auth).send({ email: 'gp1@test.com', relationship: 'parent' });
    expect(res.status).toBe(201);
    expect(res.body.credentials_issued).toBe(false);
    expect(res.body.link.is_primary).toBe(true); // first guardian for B → primary

    // gp1's portal now shows all three students
    const portal = await staff.agent.get('/api/guardians/me/portal').set(authAs(ids.gp1));
    expect(portal.status).toBe(200);
    expect(portal.body.children.map(c => c.student_id).sort()).toEqual(
      [ids.studentA, ids.studentB, ids.studentC].sort());
  });

  it('409s a duplicate link', async () => {
    const res = await staff.agent.post(`/api/students/${ids.studentB}/guardians`)
      .set(staff.auth).send({ email: 'gp1@test.com' });
    expect(res.status).toBe(409);
  });

  it('creates and links a brand-new guardian (credentials issued, non-primary)', async () => {
    const res = await staff.agent.post(`/api/students/${ids.studentB}/guardians`)
      .set(staff.auth).send({ email: 'gp3@test.com', name: 'GP Three', relationship: 'other' });
    expect(res.status).toBe(201);
    expect(res.body.credentials_issued).toBe(true);
    expect(res.body.link.is_primary).toBe(false); // B already has a primary
  });

  it('make-primary swaps under the exactly-one-primary index', async () => {
    const list = await staff.agent.get(`/api/students/${ids.studentB}/guardians`).set(staff.auth);
    const gp3 = list.body.guardians.find(g => g.email === 'gp3@test.com');

    const res = await staff.agent
      .post(`/api/students/${ids.studentB}/guardians/${gp3.guardian_id}/make-primary`).set(staff.auth);
    expect(res.status).toBe(200);

    const after = await staff.agent.get(`/api/students/${ids.studentB}/guardians`).set(staff.auth);
    const primaries = after.body.guardians.filter(g => g.is_primary);
    expect(primaries).toHaveLength(1);
    expect(primaries[0].email).toBe('gp3@test.com');
  });

  it('explicit is_primary on a student with a primary → 409; purchasing toggle works', async () => {
    const conflict = await staff.agent.post(`/api/students/${ids.studentA}/guardians`)
      .set(staff.auth).send({ email: 'gp3@test.com', is_primary: true });
    expect(conflict.status).toBe(409);

    const toggle = await staff.agent.patch(`/api/students/${ids.studentA}/purchasing`)
      .set(staff.auth).send({ can_purchase: true });
    expect(toggle.status).toBe(200);
    const { rows: [stu] } = await env.tenantDb.query(
      `SELECT can_purchase FROM students WHERE student_id = $1`, [ids.studentA]);
    expect(stu.can_purchase).toBe(true);
  });
});

describe('GRD-1 — portal home', () => {
  beforeAll(async () => {
    // scheduling + wallet fixtures: instructor, one open-ended class (cost 5),
    // students A (funded) and C (low) enrolled, two future sessions
    const db = env.tenantDb;
    await db.exec(`
      INSERT INTO users (password_hash, name, email, role) VALUES ('h','Instr','instr@test.com','instructor');
    `);
    const { rows: [iu] } = await db.query(`SELECT user_id FROM users WHERE email = 'instr@test.com'`);
    await db.query(`INSERT INTO instructors (instructor_id) VALUES ($1)`, [iu.user_id]);
    await db.exec(`
      INSERT INTO subject_groups (name) VALUES ('Math');
      INSERT INTO subjects (group_id, name) VALUES (1,'Algebra');
    `);
    const { rows: [cls] } = await db.query(
      `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit, session_credit_cost,
                            recurrence, starts_on, created_by)
       VALUES ('group', 1, $1, 6, 5, 'weekly', '2026-07-01', 1) RETURNING class_id`, [iu.user_id]);
    for (const sid of [ids.studentA, ids.studentC]) {
      await db.query(`INSERT INTO enrollments (class_id, student_id) VALUES ($1,$2)`, [cls.class_id, sid]);
    }
    await db.query(
      `INSERT INTO class_sessions (class_id, instructor_id, starts_at, ends_at) VALUES
         ($1,$2,$3,$4), ($1,$2,$5,$6)`,
      [cls.class_id, iu.user_id, at(24), at(25), at(48), at(49)]);
    await db.query(
      `INSERT INTO wallets (student_id, balance) VALUES ($1, 30), ($2, 7)`,
      [ids.studentA, ids.studentC]);
    ids.instructor = iu.user_id;
  });

  it('renders per-child cards with independent wallets and flags low balances', async () => {
    const res = await staff.agent.get('/api/guardians/me/portal').set(authAs(ids.gp1));
    expect(res.status).toBe(200);

    const byId = Object.fromEntries(res.body.children.map(c => [c.student_id, c]));
    // independent wallets (AC: child A's balance never touches child C's)
    expect(byId[ids.studentA].balance).toBe(30);
    expect(byId[ids.studentC].balance).toBe(7);
    // committed: open-ended runway capped at available future sessions (2 × 5)
    expect(byId[ids.studentA].committed).toBe(10);
    expect(byId[ids.studentA].available).toBe(20);
    expect(byId[ids.studentA].next_sessions).toHaveLength(2);

    // low-balance flag: C (7 < 5×2) yes, A (30) no
    const flagged = res.body.needs_action.low_balance.map(l => l.student_id);
    expect(flagged).toContain(ids.studentC);
    expect(flagged).not.toContain(ids.studentA);
    expect(res.body.needs_action.payment_links).toEqual([]);
  });
});

describe('GRD-5 — notification prefs, and the privacy boundary', () => {
  it('round-trips prefs for a linked student; rejects non-linked guardians', async () => {
    const res = await staff.agent.patch(`/api/guardians/me/students/${ids.studentA}/prefs`)
      .set(authAs(ids.gp1)).send({ notification_prefs: { mode: 'billing-only', channel: 'email' } });
    expect(res.status).toBe(200);
    const { rows: [link] } = await env.tenantDb.query(
      `SELECT sg.notification_prefs FROM student_guardians sg
        JOIN guardians g ON g.guardian_id = sg.guardian_id
       WHERE g.user_id = $1 AND sg.student_id = $2`, [ids.gp1, ids.studentA]);
    expect(link.notification_prefs).toEqual({ mode: 'billing-only', channel: 'email' });

    const notLinked = await staff.agent.patch(`/api/guardians/me/students/${ids.studentB}/prefs`)
      .set(authAs(ids.gp2)).send({ notification_prefs: { mode: 'all' } });
    expect(notLinked.status).toBe(403); // gp2 is linked to A only
  });

  it('privacy boundary: instructors get no portal; guardians get no staff surface', async () => {
    const instrPortal = await staff.agent.get('/api/guardians/me/portal').set(authAs(ids.instructor));
    expect(instrPortal.status).toBe(403);

    const guardianStaff = await staff.agent.post(`/api/students/${ids.studentA}/guardians`)
      .set(authAs(ids.gp1)).send({ email: 'x@test.com', name: 'X' });
    expect(guardianStaff.status).toBe(403);
  });
});
