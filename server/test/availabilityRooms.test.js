// instructorRoutes availability/unavailability CRUD + roomRoutes — the two
// scheduling route files that previously had zero test coverage. Also the
// regression test for inactive-room exclusion in the open-slots math
// (slotFinder.allRoomsBusyIntervals / bestFitRoom filter on rooms.is_active).
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

const ALL_WEEK = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

async function seed() {
  const db = env.tenantDb;
  await db.exec(`
    INSERT INTO users (password_hash, name, email, role) VALUES
      ('h','Instructor A','ia@test.com','instructor'),  -- 2
      ('h','Instructor B','ib@test.com','instructor'),  -- 3
      ('h','Student','st@test.com','student');          -- 4
    INSERT INTO instructors (instructor_id) VALUES (2), (3);
    INSERT INTO students (student_id, status) VALUES (4,'enrolled');
    INSERT INTO subject_groups (name) VALUES ('Math');
    INSERT INTO subjects (group_id, name) VALUES (1,'Algebra');
    INSERT INTO rooms (name, capacity) VALUES ('Alpha', 4), ('Beta', 4); -- ids 1, 2
  `);
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

let availId;

describe('instructor availability CRUD', () => {
  it('lets an instructor create their own window; strangers 403', async () => {
    const created = await staff.agent.post('/api/instructors/2/availability').set(authAs(2))
      .send({ day_of_week: 'mon', start_time: '09:00', end_time: '12:00' });
    expect(created.status).toBe(201);
    expect(created.body.day_of_week).toBe('mon');
    availId = created.body.availability_id;

    const otherInstructor = await staff.agent.post('/api/instructors/2/availability').set(authAs(3))
      .send({ day_of_week: 'tue', start_time: '09:00', end_time: '12:00' });
    expect(otherInstructor.status).toBe(403);
    const student = await staff.agent.post('/api/instructors/2/availability').set(authAs(4))
      .send({ day_of_week: 'tue', start_time: '09:00', end_time: '12:00' });
    expect(student.status).toBe(403);
  });

  it('rejects invalid payloads (validation is now enforced)', async () => {
    const badDay = await staff.agent.post('/api/instructors/2/availability').set(authAs(2))
      .send({ day_of_week: 'monday', start_time: '09:00', end_time: '12:00' });
    expect(badDay.status).toBe(400);
    const badTime = await staff.agent.post('/api/instructors/2/availability').set(authAs(2))
      .send({ day_of_week: 'tue', start_time: '9am', end_time: '12:00' });
    expect(badTime.status).toBe(400);
    const inverted = await staff.agent.post('/api/instructors/2/availability').set(authAs(2))
      .send({ day_of_week: 'tue', start_time: '12:00', end_time: '09:00' });
    expect(inverted.status).toBe(400);
  });

  it('lists windows for any authenticated role', async () => {
    const res = await staff.agent.get('/api/instructors/2/availability').set(authAs(4));
    expect(res.status).toBe(200);
    expect(res.body.some((r) => r.availability_id === availId)).toBe(true);
  });

  it('updates a window via PUT (with the same validation), 404s unknown ids', async () => {
    const ok = await staff.agent.put(`/api/instructors/2/availability/${availId}`).set(authAs(2))
      .send({ day_of_week: 'mon', start_time: '09:00:00', end_time: '11:00', type: 'default', status: 'active' });
    expect(ok.status).toBe(200);
    expect(ok.body.end_time).toBe('11:00:00');

    const bad = await staff.agent.put(`/api/instructors/2/availability/${availId}`).set(authAs(2))
      .send({ day_of_week: 'nope', start_time: '09:00', end_time: '11:00' });
    expect(bad.status).toBe(400);

    const missing = await staff.agent.put('/api/instructors/2/availability/999999').set(authAs(2))
      .send({ day_of_week: 'mon', start_time: '09:00', end_time: '11:00' });
    expect(missing.status).toBe(404);
  });

  it('deletes a window; a second delete 404s', async () => {
    const del = await staff.agent.delete(`/api/instructors/2/availability/${availId}`).set(authAs(2));
    expect(del.status).toBe(200);
    const again = await staff.agent.delete(`/api/instructors/2/availability/${availId}`).set(authAs(2));
    expect(again.status).toBe(404);
  });
});

describe('instructor unavailability (time off)', () => {
  let unavailId;

  it('requires both bounds as UTC ISO-Z', async () => {
    const missing = await staff.agent.post('/api/instructors/2/unavailability').set(authAs(2))
      .send({ start_datetime: at(24) });
    expect(missing.status).toBe(400);
    const nonZ = await staff.agent.post('/api/instructors/2/unavailability').set(authAs(2))
      .send({ start_datetime: '2026-08-15T09:00:00', end_datetime: '2026-08-15T10:00:00' });
    expect(nonZ.status).toBe(400);
  });

  it('creates a block and subtracts it from open-slots', async () => {
    // wide-open availability, then a time-off block over [T0+26h, T0+28h)
    for (const day of ALL_WEEK) {
      await staff.agent.post('/api/instructors/2/availability').set(authAs(2))
        .send({ day_of_week: day, start_time: '00:00', end_time: '23:59' });
    }
    const created = await staff.agent.post('/api/instructors/2/unavailability').set(authAs(2))
      .send({ start_datetime: at(26), end_datetime: at(28), reason: 'dentist' });
    expect(created.status).toBe(201);
    unavailId = created.body.unavail_id;

    const slots = await staff.agent.get('/api/instructors/2/open-slots')
      .query({ from: at(24), to: at(32), tz: 'UTC' }).set(staff.auth);
    expect(slots.status).toBe(200);
    const s = DateTime.fromISO(at(26)), e = DateTime.fromISO(at(28));
    expect(slots.body.slots.some((x) =>
      DateTime.fromISO(x.starts_at) < e && DateTime.fromISO(x.ends_at) > s)).toBe(false);
  });

  it('removes the block and the time reopens', async () => {
    const del = await staff.agent.delete(`/api/instructors/2/unavailability/${unavailId}`).set(authAs(2));
    expect(del.status).toBe(200);
    const slots = await staff.agent.get('/api/instructors/2/open-slots')
      .query({ from: at(24), to: at(32), tz: 'UTC' }).set(staff.auth);
    const s = DateTime.fromISO(at(26)), e = DateTime.fromISO(at(28));
    expect(slots.body.slots.some((x) =>
      DateTime.fromISO(x.starts_at) <= s && DateTime.fromISO(x.ends_at) >= e)).toBe(true);
  });
});

describe('rooms API', () => {
  it('lists active rooms to any authenticated role; writes are staff-only', async () => {
    const asStudent = await staff.agent.get('/api/rooms').set(authAs(4));
    expect(asStudent.status).toBe(200);
    expect(asStudent.body.map((r) => r.name).sort()).toEqual(['Alpha', 'Beta']);

    const post = await staff.agent.post('/api/rooms').set(authAs(4)).send({ name: 'X', capacity: 2 });
    expect(post.status).toBe(403);
    const patch = await staff.agent.patch('/api/rooms/1').set(authAs(2)).send({ capacity: 6 });
    expect(patch.status).toBe(403);
  });

  it('creates and validates rooms as staff', async () => {
    const bad = await staff.agent.post('/api/rooms').set(staff.auth).send({ name: '', capacity: 0 });
    expect(bad.status).toBe(400);
    const ok = await staff.agent.post('/api/rooms').set(staff.auth).send({ name: 'Gamma', capacity: 2 });
    expect(ok.status).toBe(201);
    const dupe = await staff.agent.post('/api/rooms').set(staff.auth).send({ name: 'Gamma', capacity: 2 });
    expect(dupe.status).toBe(400);
    // clean up so the room-math test below controls the full room set
    await env.tenantDb.query(`DELETE FROM rooms WHERE name = 'Gamma'`);
  });

  it('deactivating a room hides it from the default list (still visible with ?active=false)', async () => {
    const off = await staff.agent.patch('/api/rooms/2').set(staff.auth).send({ is_active: false });
    expect(off.status).toBe(200);
    expect(off.body.is_active).toBe(false);

    const dflt = await staff.agent.get('/api/rooms').set(staff.auth);
    expect(dflt.body.map((r) => r.name)).toEqual(['Alpha']);
    const all = await staff.agent.get('/api/rooms').query({ active: 'false' }).set(staff.auth);
    expect(all.body.map((r) => r.name).sort()).toEqual(['Alpha', 'Beta']);
  });

  it('inactive rooms do not count toward open-slot room capacity (regression)', async () => {
    // Beta is inactive (previous test). Occupy Alpha — the only active room —
    // with another instructor's live session over [T0+50h, T0+52h): instructor
    // 2 is free but no active room is, so the interval must not be offered.
    const { rows: [cls] } = await env.tenantDb.query(
      `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit,
                            session_credit_cost, recurrence, starts_on, created_by)
       VALUES ('one_on_one', 1, 3, 1, 5, 'none', CURRENT_DATE, 1) RETURNING class_id`);
    await env.tenantDb.query(
      `INSERT INTO class_sessions (class_id, instructor_id, room_id, starts_at, ends_at, status)
       VALUES ($1, 3, 1, $2, $3, 'scheduled')`, [cls.class_id, at(50), at(52)]);

    const s = DateTime.fromISO(at(50)), e = DateTime.fromISO(at(52));
    const blocked = await staff.agent.get('/api/instructors/2/open-slots')
      .query({ from: at(48), to: at(56), tz: 'UTC' }).set(staff.auth);
    expect(blocked.body.slots.some((x) =>
      DateTime.fromISO(x.starts_at) < e && DateTime.fromISO(x.ends_at) > s)).toBe(false);

    // Reactivate Beta — a second active room absorbs the conflict and the
    // interval opens back up.
    await staff.agent.patch('/api/rooms/2').set(staff.auth).send({ is_active: true });
    const open = await staff.agent.get('/api/instructors/2/open-slots')
      .query({ from: at(48), to: at(56), tz: 'UTC' }).set(staff.auth);
    expect(open.body.slots.some((x) =>
      DateTime.fromISO(x.starts_at) <= s && DateTime.fromISO(x.ends_at) >= e)).toBe(true);
  });
});
