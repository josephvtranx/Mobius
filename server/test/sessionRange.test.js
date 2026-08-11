// GET /api/sessions — the staff date-range session query backing the
// Scheduling week browser and the Attendance queue: required from/to
// (UTC ISO-Z, max 62 days), optional student_id / instructor_id filters,
// staff-only. Every other session listing is horizon-based; this is the
// one "sessions across all classes in a range" read.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { startTestEnv, TEST_CODE, SEED_USER } from './helpers/testEnv.js';

let env;
let staff;
let T0;

const at = (hours) => T0.plus({ hours }).toISO();
const authAs = (userId) => ({
  Authorization: `Bearer ${jwt.sign({ userId, tenantCode: TEST_CODE }, process.env.JWT_SECRET, { expiresIn: '10m' })}`
});

const list = (query, auth) =>
  staff.agent.get('/api/sessions').query(query).set(auth ?? staff.auth);

async function seed() {
  const db = env.tenantDb;
  await db.exec(`
    INSERT INTO users (password_hash, name, email, role) VALUES
      ('h','Instructor A','ia@test.com','instructor'),  -- 2
      ('h','Instructor B','ib@test.com','instructor'),  -- 3
      ('h','Student A','sa@test.com','student'),        -- 4
      ('h','Student B','sb@test.com','student');        -- 5
    INSERT INTO instructors (instructor_id) VALUES (2), (3);
    INSERT INTO students (student_id, status) VALUES (4,'enrolled'),(5,'enrolled');
    INSERT INTO subject_groups (name) VALUES ('Math');
    INSERT INTO subjects (group_id, name) VALUES (1,'Algebra'),(1,'Geometry');
    INSERT INTO rooms (name, capacity) VALUES ('Room 1', 8);
  `);
  // Two classes: Algebra (instructor 2, students 4+5), Geometry (instructor 3, student 5)
  const { rows: [c1] } = await db.query(
    `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit,
                          session_credit_cost, recurrence, starts_on, created_by)
     VALUES ('group', 1, 2, 8, 5, 'weekly', CURRENT_DATE, 1) RETURNING class_id`);
  const { rows: [c2] } = await db.query(
    `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit,
                          session_credit_cost, recurrence, starts_on, created_by)
     VALUES ('one_on_one', 2, 3, 1, 5, 'none', CURRENT_DATE, 1) RETURNING class_id`);
  await db.query(
    `INSERT INTO enrollments (class_id, student_id, status) VALUES
       ($1, 4, 'active'), ($1, 5, 'active'), ($2, 5, 'active')`, [c1.class_id, c2.class_id]);
  // Sessions: in-range scheduled (both classes), in-range completed, out-of-range
  await db.query(
    `INSERT INTO class_sessions (class_id, instructor_id, room_id, starts_at, ends_at, status) VALUES
       ($1, 2, 1, $3, $4, 'scheduled'),
       ($1, 2, 1, $5, $6, 'completed'),
       ($2, 3, 1, $7, $8, 'scheduled'),
       ($1, 2, 1, $9, $10, 'scheduled')`,
    [c1.class_id, c2.class_id,
     at(24), at(25),                  // in range, Algebra
     at(30), at(31),                  // in range, Algebra, completed
     at(26), at(27),                  // in range, Geometry
     at(24 * 30), at(24 * 30 + 1)]); // far future, outside the queried week
}

beforeAll(async () => {
  env = await startTestEnv();
  T0 = DateTime.utc().startOf('hour');
  await seed();
  const agent = request.agent(env.app);
  const login = await agent.post('/api/auth/login')
    .set('x-institution-code', TEST_CODE)
    .send({ email: SEED_USER.email, password: SEED_USER.password });
  staff = { agent, auth: { Authorization: `Bearer ${login.body.accessToken}` } };
}, 60000);

afterAll(async () => {
  await env?.stop();
});

describe('GET /api/sessions — auth and validation', () => {
  it('401s without a token and 403s a non-staff role', async () => {
    const noAuth = await staff.agent.get('/api/sessions').query({ from: at(0), to: at(48) });
    expect(noAuth.status).toBe(401);
    const asStudent = await list({ from: at(0), to: at(48) }, authAs(4));
    expect(asStudent.status).toBe(403);
  });

  it('400s missing, non-Z, inverted, and oversized ranges', async () => {
    expect((await list({})).status).toBe(400);
    expect((await list({ from: '2026-08-10T00:00:00', to: at(48) })).status).toBe(400);
    expect((await list({ from: at(48), to: at(0) })).status).toBe(400);
    expect((await list({ from: at(0), to: at(24 * 90) })).status).toBe(400);
    expect((await list({ from: at(0), to: at(48), student_id: 'abc' })).status).toBe(400);
  });
});

describe('GET /api/sessions — range and filters', () => {
  it('returns all sessions overlapping the range with subject, class_type and roster_count', async () => {
    const res = await list({ from: at(0), to: at(24 * 7) });
    expect(res.status).toBe(200);
    expect(res.body.sessions).toHaveLength(3); // far-future row excluded
    const subjects = res.body.sessions.map((s) => s.subject).sort();
    expect(subjects).toEqual(['Algebra', 'Algebra', 'Geometry']);
    const algebra = res.body.sessions.find((s) => s.subject === 'Algebra');
    expect(algebra.roster_count).toBe(2);
    expect(algebra.class_type).toBe('group');
    // completed rows are included — past weeks are browsable
    expect(res.body.sessions.some((s) => s.status === 'completed')).toBe(true);
  });

  it('filters by instructor_id', async () => {
    const res = await list({ from: at(0), to: at(24 * 7), instructor_id: 3 });
    expect(res.status).toBe(200);
    expect(res.body.sessions).toHaveLength(1);
    expect(res.body.sessions[0].subject).toBe('Geometry');
  });

  it('filters by student_id via active enrollment', async () => {
    const forA = await list({ from: at(0), to: at(24 * 7), student_id: 4 });
    expect(forA.body.sessions.every((s) => s.subject === 'Algebra')).toBe(true);
    expect(forA.body.sessions).toHaveLength(2);
    const forB = await list({ from: at(0), to: at(24 * 7), student_id: 5 });
    expect(forB.body.sessions).toHaveLength(3); // enrolled in both classes
  });
});
