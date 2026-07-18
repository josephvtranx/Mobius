// SCH-4 — self-serve one-off 1:1 booking (spec 03): knob gate, request =
// pending class + enrollment + TTL'd hold (credit gate BEFORE the hold),
// INV-3 racing, instructor accept (session materializes) / reject (class
// dissolves), US-8 escalation and slot-arrival expiry.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { startTestEnv, TEST_CODE, SEED_USER } from './helpers/testEnv.js';
import { runBookingDeadlines } from '../src/jobs/scheduleJobs.js';

let env;
let staff;
let pool;
let T0;

const at = (hours) => T0.plus({ hours }).toISO();
const authAs = (userId) => ({
  Authorization: `Bearer ${jwt.sign({ userId, tenantCode: TEST_CODE }, process.env.JWT_SECRET, { expiresIn: '10m' })}`
});

const book = (auth, overrides = {}) =>
  staff.agent.post('/api/bookings').set(auth).send({
    instructor_id: 2, subject_id: 1, tz: 'America/Los_Angeles',
    starts_at: at(48), ends_at: at(49), ...overrides
  });

const respond = (classId, body, auth) =>
  staff.agent.post(`/api/bookings/${classId}/respond`).set(auth ?? authAs(2)).send(body);

const rowOf = async (table, idCol, id) => {
  const { rows } = await env.tenantDb.query(`SELECT * FROM ${table} WHERE ${idCol} = $1`, [id]);
  return rows[0] ?? null;
};

async function seed() {
  const db = env.tenantDb;
  await db.exec(`
    INSERT INTO users (password_hash, name, email, role) VALUES
      ('h','Instructor','instr@test.com','instructor'),   -- 2
      ('h','Student A','sa@test.com','student'),          -- 3 (guardian 5)
      ('h','Student B','sb@test.com','student'),          -- 4 (unfunded)
      ('h','Guardian A','ga@test.com','guardian'),        -- 5
      ('h','Student C','sc@test.com','student'),          -- 6
      ('h','Instructor 2','instr2@test.com','instructor');-- 7
    INSERT INTO instructors (instructor_id) VALUES (2), (7);
    INSERT INTO students (student_id, status) VALUES (3,'enrolled'),(4,'enrolled'),(6,'enrolled');
    INSERT INTO guardians (user_id, relationship) VALUES (5, 'parent');
    INSERT INTO student_guardians (student_id, guardian_id, is_primary) VALUES (3, 1, true);
    INSERT INTO subject_groups (name) VALUES ('Math');
    INSERT INTO subjects (group_id, name) VALUES (1,'Algebra'),(1,'Chemistry');
    INSERT INTO instructor_specialties (instructor_id, subject_id) VALUES (2,1),(7,1);
    INSERT INTO rooms (name, capacity) VALUES ('Small', 2), ('Big', 8);
    INSERT INTO instructor_availability (instructor_id, day_of_week, start_time, end_time) VALUES
      (2,'sun','00:00','23:59:59'),(2,'mon','00:00','23:59:59'),(2,'tue','00:00','23:59:59'),
      (2,'wed','00:00','23:59:59'),(2,'thu','00:00','23:59:59'),(2,'fri','00:00','23:59:59'),
      (2,'sat','00:00','23:59:59');
    INSERT INTO wallets (student_id, balance) VALUES (3,10),(6,10); -- student 4 walletless (0)
  `);
}

beforeAll(async () => {
  env = await startTestEnv();
  T0 = DateTime.utc();
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

let bookedClassId;

describe('SCH-4 — booking requests', () => {
  it('is gated by the self_serve_booking_enabled knob', async () => {
    await env.tenantDb.query(`UPDATE institution_settings SET self_serve_booking_enabled = false`);
    const res = await book(authAs(3));
    expect(res.status).toBe(403);
    await env.tenantDb.query(`UPDATE institution_settings SET self_serve_booking_enabled = true`);
  });

  it('creates a pending class + enrollment + TTL hold; instructor notified; slot leaves the calendar', async () => {
    const res = await book(authAs(3));
    expect(res.status).toBe(201);
    expect(res.body.cost).toBe(5); // default_one_on_one_credit_cost
    bookedClassId = res.body.class_id;

    const cls = await rowOf('classes', 'class_id', bookedClassId);
    expect(cls.status).toBe('pending');
    expect(cls.class_type).toBe('one_on_one');
    expect(cls.recurrence).toBe('none');
    expect(cls.session_credit_cost).toBe(5);
    expect(cls.booking_hold_id).not.toBeNull();

    const hold = await rowOf('slot_holds', 'hold_id', cls.booking_hold_id);
    expect(hold.origin).toBe('self_serve_booking');
    expect(hold.status).toBe('active');
    expect(hold.held_for_student_id).toBe(3);
    const ttl = DateTime.fromJSDate(hold.expires_at).diff(DateTime.utc(), 'hours').hours;
    expect(ttl).toBeGreaterThan(23);
    expect(ttl).toBeLessThan(25);

    const { rows: enr } = await env.tenantDb.query(
      `SELECT status FROM enrollments WHERE class_id = $1 AND student_id = 3`, [bookedClassId]);
    expect(enr[0].status).toBe('active');

    const { rows: notice } = await env.tenantDb.query(
      `SELECT recipient_user_id FROM notification_log WHERE event_type = 'booking_requested'`);
    expect(notice.map(n => n.recipient_user_id)).toEqual([2]);

    // the held interval no longer paints as open
    const slots = await staff.agent.get('/api/instructors/2/open-slots')
      .query({ from: at(40), to: at(56), tz: 'America/Los_Angeles' }).set(staff.auth);
    const s = DateTime.fromISO(at(48)), e = DateTime.fromISO(at(49));
    expect(slots.body.slots.some(x =>
      DateTime.fromISO(x.starts_at) < e && DateTime.fromISO(x.ends_at) > s)).toBe(false);
  });

  it('never holds a slot for an unfunded request', async () => {
    const { rows: before } = await env.tenantDb.query(`SELECT count(*)::int AS n FROM slot_holds`);
    const res = await book(authAs(4), { starts_at: at(52), ends_at: at(53) });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INSUFFICIENT_CREDITS');
    expect(res.body.shortfall).toBe(5);
    const { rows: after } = await env.tenantDb.query(`SELECT count(*)::int AS n FROM slot_holds`);
    expect(after[0].n).toBe(before[0].n); // nothing reserved
  });

  it('409s a racing request for the held slot (INV-3)', async () => {
    const res = await book(authAs(6)); // same +48h slot
    expect(res.status).toBe(409);
  });

  it('guards: strangers, unqualified subjects, bad times', async () => {
    const stranger = await book(authAs(6), { student_id: 3, starts_at: at(60), ends_at: at(61) });
    expect(stranger.status).toBe(403);

    const unqualified = await book(authAs(6), { subject_id: 2, starts_at: at(60), ends_at: at(61) });
    expect(unqualified.status).toBe(400);
    expect(unqualified.body.message).toContain('not qualified');

    const reversed = await book(authAs(6), { starts_at: at(61), ends_at: at(60) });
    expect(reversed.status).toBe(400);

    const noTz = await book(authAs(6), { tz: undefined, starts_at: at(60), ends_at: at(61) });
    expect(noTz.status).toBe(400);

    const past = await book(authAs(6), { starts_at: at(-2), ends_at: at(-1) });
    expect(past.status).toBe(400);
  });
});

describe('SCH-4 — instructor response', () => {
  it('accept activates the class and materializes the session with a room', async () => {
    const res = await respond(bookedClassId, { action: 'accept' });
    expect(res.status).toBe(200);
    expect(res.body.session.room_id).not.toBeNull();
    expect(DateTime.fromISO(res.body.session.starts_at).toUTC().toISO()).toBe(at(48));

    const cls = await rowOf('classes', 'class_id', bookedClassId);
    expect(cls.status).toBe('active');
    const hold = await rowOf('slot_holds', 'hold_id', cls.booking_hold_id);
    expect(hold.status).toBe('confirmed');

    const { rows: notices } = await env.tenantDb.query(
      `SELECT recipient_user_id FROM notification_log
        WHERE event_type = 'booking_accepted' ORDER BY recipient_user_id`);
    expect(notices.map(n => n.recipient_user_id)).toEqual([3, 5]);
  });

  it('reject dissolves the pending class and releases the slot', async () => {
    const created = await book(authAs(6), { starts_at: at(56), ends_at: at(57) });
    expect(created.status).toBe(201);
    const holdId = (await rowOf('classes', 'class_id', created.body.class_id)).booking_hold_id;

    const res = await respond(created.body.class_id, { action: 'reject', reason: 'unavailable' });
    expect(res.status).toBe(200);

    expect(await rowOf('classes', 'class_id', created.body.class_id)).toBeNull();
    const { rows: enr } = await env.tenantDb.query(
      `SELECT 1 FROM enrollments WHERE class_id = $1`, [created.body.class_id]);
    expect(enr.length).toBe(0);
    expect((await rowOf('slot_holds', 'hold_id', holdId)).status).toBe('released');

    const { rows: [notice] } = await env.tenantDb.query(
      `SELECT recipient_user_id, payload FROM notification_log WHERE event_type = 'booking_rejected'`);
    expect(notice.recipient_user_id).toBe(6);
    expect(notice.payload.offer_alternatives).toBe(true);
  });
});

describe('SCH-4 — deadlines (US-8)', () => {
  it('escalates silent bookings to staff, then expires them when the slot arrives', async () => {
    const created = await book(authAs(5), { student_id: 3, starts_at: at(30), ends_at: at(31) });
    expect(created.status).toBe(201);
    const classId = created.body.class_id;

    const esc = await runBookingDeadlines(pool, at(26)); // TTL 24h passed
    expect(esc.escalated).toBe(1);
    expect(esc.expired).toBe(0);
    const { rows: tasks } = await env.tenantDb.query(
      `SELECT 1 FROM staff_tasks WHERE kind = 'booking_escalation' AND subject_id = $1`, [classId]);
    expect(tasks.length).toBe(1);
    const { rows: escNotices } = await env.tenantDb.query(
      `SELECT recipient_user_id FROM notification_log
        WHERE event_type = 'booking_escalated' ORDER BY recipient_user_id`);
    expect(escNotices.map(n => n.recipient_user_id)).toEqual([3, 5]);

    const rerun = await runBookingDeadlines(pool, at(26));
    expect(rerun.escalated).toBe(0); // deduped

    const exp = await runBookingDeadlines(pool, at(31)); // slot arrived unresolved
    expect(exp.expired).toBe(1);
    expect(await rowOf('classes', 'class_id', classId)).toBeNull();
    const { rows: expNotices } = await env.tenantDb.query(
      `SELECT 1 FROM notification_log WHERE event_type = 'booking_expired'`);
    expect(expNotices.length).toBe(2); // student 3 + guardian 5
  });
});

describe('pending bookings list (slice-3 endpoint)', () => {
  it('instructors see their own pending bookings; others scoped out', async () => {
    const created = await book(authAs(3), { starts_at: at(60), ends_at: at(61) });
    expect(created.status).toBe(201);

    const own = await staff.agent.get('/api/bookings').set(authAs(2));
    expect(own.status).toBe(200);
    expect(own.body.length).toBe(1);
    expect(own.body[0]).toHaveProperty('student_name');
    expect(own.body[0]).toHaveProperty('starts_at');

    const other = await staff.agent.get('/api/bookings').set(authAs(7));
    expect(other.body.length).toBe(0);

    const student = await staff.agent.get('/api/bookings').set(authAs(3));
    expect(student.status).toBe(403);
  });
});
