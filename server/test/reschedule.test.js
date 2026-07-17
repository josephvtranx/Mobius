// Phase 7.3 Slice B — RSC-1 reschedule flow (spec 07): request + slot hold,
// open calendar, accept (atomic swap + chain), reject, TTL escalation,
// Window-close hard stop. INV-1: zero ledger entries from any move.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { startTestEnv, TEST_CODE, SEED_USER } from './helpers/testEnv.js';
import { runHoldExpiry, runRequestDeadlines } from '../src/jobs/scheduleJobs.js';

let env;
let staff;
let pool;
let T0;        // seed-time base for job "now" params
let cls = {};
let ses = {};

const at = (hours) => T0.plus({ hours }).toISO();
const authAs = (userId) => ({
  Authorization: `Bearer ${jwt.sign({ userId, tenantCode: TEST_CODE }, process.env.JWT_SECRET, { expiresIn: '10m' })}`
});

async function seed() {
  const db = env.tenantDb;
  await db.exec(`
    INSERT INTO users (password_hash, name, email, role) VALUES
      ('h','Instructor','instr@test.com','instructor'),   -- 2
      ('h','Student A','sa@test.com','student'),          -- 3 (guardian 5)
      ('h','Student B','sb@test.com','student'),          -- 4
      ('h','Guardian A','ga@test.com','guardian'),        -- 5
      ('h','Student C','sc@test.com','student'),          -- 6
      ('h','Instructor 2','instr2@test.com','instructor');-- 7
    INSERT INTO instructors (instructor_id) VALUES (2), (7);
    INSERT INTO students (student_id, status) VALUES (3,'enrolled'),(4,'enrolled'),(6,'enrolled');
    INSERT INTO guardians (user_id, relationship) VALUES (5, 'parent');
    INSERT INTO student_guardians (student_id, guardian_id, is_primary) VALUES (3, 1, true);
    INSERT INTO subject_groups (name) VALUES ('Math');
    INSERT INTO subjects (group_id, name) VALUES (1,'Algebra');
    INSERT INTO instructor_specialties (instructor_id, subject_id) VALUES (2,1),(7,1);
    INSERT INTO rooms (name, capacity) VALUES ('Small', 2), ('Big', 8);
    INSERT INTO instructor_availability (instructor_id, day_of_week, start_time, end_time) VALUES
      (2,'sun','00:00','23:59:59'),(2,'mon','00:00','23:59:59'),(2,'tue','00:00','23:59:59'),
      (2,'wed','00:00','23:59:59'),(2,'thu','00:00','23:59:59'),(2,'fri','00:00','23:59:59'),
      (2,'sat','00:00','23:59:59');
  `);

  async function mkClass(name, { type = 'one_on_one', limit } = {}) {
    const { rows: [row] } = await db.query(
      `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit,
                            session_credit_cost, recurrence, starts_on, created_by)
       VALUES ($1, 1, 2, $2, 5, 'weekly', '2026-07-01', 1) RETURNING class_id`,
      [type, type === 'one_on_one' ? 1 : (limit ?? 6)]);
    cls[name] = row.class_id;
  }
  async function mkSession(name, className, startHours, instructor = 2) {
    const { rows: [row] } = await db.query(
      `INSERT INTO class_sessions (class_id, instructor_id, starts_at, ends_at)
       VALUES ($1, $2, $3, $4) RETURNING session_id`,
      [cls[className], instructor, at(startHours), at(startHours + 1)]);
    ses[name] = row.session_id;
  }
  async function enroll(className, ...ids) {
    for (const sid of ids) {
      await db.query(`INSERT INTO enrollments (class_id, student_id) VALUES ($1,$2)`, [cls[className], sid]);
    }
  }

  await mkClass('rA'); await enroll('rA', 3); await mkSession('origA', 'rA', 48);
  await mkClass('rB'); await enroll('rB', 4);
  await mkSession('origIn', 'rB', 2);   // inside the 24h Window
  await mkSession('origB', 'rB', 55);
  await mkClass('rC'); await enroll('rC', 6); await mkSession('origC', 'rC', 76);
  await mkClass('rD'); await enroll('rD', 4); await mkSession('origD', 'rD', 58);
  // sessG is taught by instructor 7 so a +80h proposal is FREE on instructor
  // 2's calendar — the request must fail on the student-collision guard alone
  await mkClass('G', { type: 'group' }); await enroll('G', 3, 4); await mkSession('sessG', 'G', 80, 7);
}

const requestReschedule = (sessionName, hours, auth) =>
  staff.agent.post(`/api/sessions/${ses[sessionName]}/reschedule-request`).set(auth)
    .send({ proposed_starts_at: at(hours), proposed_ends_at: at(hours + 1) });

const respond = (requestId, body, auth) =>
  staff.agent.post(`/api/reschedule-requests/${requestId}/respond`).set(auth ?? authAs(2)).send(body);

const openSlotsReq = () =>
  staff.agent.get(`/api/instructors/2/open-slots`)
    .query({ from: at(0), to: at(72), tz: 'America/Los_Angeles' }).set(staff.auth);

const rowOf = async (table, idCol, id) => {
  const { rows } = await env.tenantDb.query(`SELECT * FROM ${table} WHERE ${idCol} = $1`, [id]);
  return rows[0] ?? null;
};
const sessionStatus = async (name) => (await rowOf('class_sessions', 'session_id', ses[name])).status;
const anyOverlap = (slots, sIso, eIso) => {
  const s = DateTime.fromISO(sIso), e = DateTime.fromISO(eIso);
  return slots.some(x => DateTime.fromISO(x.starts_at) < e && DateTime.fromISO(x.ends_at) > s);
};

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

describe('open calendar (availability − sessions − holds)', () => {
  it('paints open windows and excludes booked sessions; validates params', async () => {
    const res = await openSlotsReq();
    expect(res.status).toBe(200);
    expect(res.body.slots.length).toBeGreaterThan(0);
    expect(anyOverlap(res.body.slots, at(48), at(49))).toBe(false); // origA busy

    const noTz = await staff.agent.get(`/api/instructors/2/open-slots`)
      .query({ from: at(0), to: at(72) }).set(staff.auth);
    expect(noTz.status).toBe(400);
    const badTz = await staff.agent.get(`/api/instructors/2/open-slots`)
      .query({ from: at(0), to: at(72), tz: 'Mars/Olympus' }).set(staff.auth);
    expect(badTz.status).toBe(400);
  });
});

describe('RSC-1 — request creation', () => {
  let requestId;

  it('creates request + TTL hold; original stays on calendar as reschedule_requested (INV-2)', async () => {
    const res = await requestReschedule('origA', 60, authAs(3));
    expect(res.status).toBe(201);
    requestId = res.body.request.request_id;
    expect(res.body.request.status).toBe('pending');

    const hold = await rowOf('slot_holds', 'hold_id', res.body.request.hold_id);
    expect(hold.status).toBe('active');
    const ttlHours = DateTime.fromJSDate(hold.expires_at).diff(DateTime.utc(), 'hours').hours;
    expect(ttlHours).toBeGreaterThan(23);
    expect(ttlHours).toBeLessThan(25); // instructor_response_window_hours = 24

    expect(await sessionStatus('origA')).toBe('reschedule_requested');
    const { rows: notice } = await env.tenantDb.query(
      `SELECT recipient_user_id FROM notification_log WHERE event_type = 'reschedule_requested'`);
    expect(notice.map(n => n.recipient_user_id)).toEqual([2]);

    // held interval no longer paints as open
    const slots = await openSlotsReq();
    expect(anyOverlap(slots.body.slots, at(60), at(61))).toBe(false);

    // one open request per session
    const dup = await requestReschedule('origA', 62, authAs(3));
    expect(dup.status).toBe(400);
  });

  it('a racing request for the held slot 409s (INV-3)', async () => {
    const res = await requestReschedule('origB', 60, authAs(4));
    expect(res.status).toBe(409);
  });

  it('guards: group, inside-Window, collision, occupied slot, strangers', async () => {
    const group = await requestReschedule('sessG', 90, authAs(3));
    expect(group.status).toBe(400);
    expect(group.body.message).toContain('Group');

    const inside = await requestReschedule('origIn', 90, authAs(4));
    expect(inside.status).toBe(400);
    expect(inside.body.message).toContain('deadline');

    const collision = await requestReschedule('origB', 80, authAs(4)); // overlaps sessG (student 4 enrolled)
    expect(collision.status).toBe(400);
    expect(collision.body.message).toContain('Algebra');

    const occupied = await requestReschedule('origB', 48, authAs(4)); // origA's (reschedule_requested) slot
    expect(occupied.status).toBe(409);

    const stranger = await requestReschedule('origB', 90, authAs(6));
    expect(stranger.status).toBe(403);
  });

  it('reject releases the hold and restores the original', async () => {
    const res = await respond(requestId, { action: 'reject', reason: 'conflict' });
    expect(res.status).toBe(200);
    expect(await sessionStatus('origA')).toBe('scheduled');
    const req2 = await rowOf('reschedule_requests', 'request_id', requestId);
    expect(req2.status).toBe('rejected');
    const hold = await rowOf('slot_holds', 'hold_id', req2.hold_id);
    expect(hold.status).toBe('released');
    const { rows: notices } = await env.tenantDb.query(
      `SELECT recipient_user_id FROM notification_log
        WHERE event_type = 'reschedule_rejected' ORDER BY recipient_user_id`);
    expect(notices.map(n => n.recipient_user_id)).toEqual([3, 5]);
  });
});

describe('RSC-1 — accept: the atomic swap', () => {
  let newSessionId;

  it('moves the original, creates the successor with chain + room, moves no credits', async () => {
    const created = await requestReschedule('origA', 60, authAs(3)); // slot free again post-reject
    expect(created.status).toBe(201);
    const res = await respond(created.body.request.request_id, { action: 'accept' });
    expect(res.status).toBe(200);
    newSessionId = res.body.new_session.session_id;

    expect(await sessionStatus('origA')).toBe('moved');
    const successor = await rowOf('class_sessions', 'session_id', newSessionId);
    expect(successor.class_id).toBe(cls.rA);
    expect(successor.status).toBe('scheduled');
    expect(successor.room_id).not.toBeNull();
    expect(DateTime.fromJSDate(successor.rescheduled_from).toUTC().toISO()).toBe(at(48));
    expect(successor.reschedule_chain.length).toBe(1);

    // exactly one live session for the occurrence
    const { rows: live } = await env.tenantDb.query(
      `SELECT 1 FROM class_sessions WHERE class_id = $1 AND status = 'scheduled'`, [cls.rA]);
    expect(live.length).toBe(1);

    // INV-1: the move touches no credits
    const { rows: ledger } = await env.tenantDb.query(`SELECT 1 FROM credit_ledger`);
    expect(ledger.length).toBe(0);

    const hold = await rowOf('slot_holds', 'hold_id', created.body.request.hold_id);
    expect(hold.status).toBe('confirmed');
  });

  it('re-rescheduling the successor builds the full chain', async () => {
    const created = await staff.agent.post(`/api/sessions/${newSessionId}/reschedule-request`)
      .set(authAs(3)).send({ proposed_starts_at: at(72), proposed_ends_at: at(73) });
    expect(created.status).toBe(201);
    const res = await respond(created.body.request.request_id, { action: 'accept' });
    expect(res.status).toBe(200);

    const chain = res.body.new_session.reschedule_chain;
    expect(chain.length).toBe(2); // 48h → 60h → 72h: the full path
  });
});

describe('deadline jobs and hard stops', () => {
  it('TTL silence escalates to staff, who can then respond on behalf', async () => {
    const created = await requestReschedule('origB', 84, authAs(4));
    expect(created.status).toBe(201);

    const swept = await runHoldExpiry(pool, at(26));
    expect(swept.expired).toBeGreaterThanOrEqual(1);
    const deadlines = await runRequestDeadlines(pool, at(26));
    expect(deadlines.escalated).toBe(1);
    expect(deadlines.expired).toBe(0); // origB at +55h is still outside the Window at +26h

    const reqRow = await rowOf('reschedule_requests', 'request_id', created.body.request.request_id);
    expect(reqRow.status).toBe('escalated');
    const { rows: tasks } = await env.tenantDb.query(
      `SELECT 1 FROM staff_tasks WHERE kind = 'reschedule_escalation' AND subject_id = $1`,
      [created.body.request.request_id]);
    expect(tasks.length).toBe(1);

    // rerun: no duplicate escalation/task
    const rerun = await runRequestDeadlines(pool, at(26));
    expect(rerun.escalated).toBe(0);

    // staff accept on the instructor's behalf still swaps
    const res = await respond(created.body.request.request_id, { action: 'accept' }, staff.auth);
    expect(res.status).toBe(200);
    expect(await sessionStatus('origB')).toBe('moved');
  });

  it('Window-close expires an unresolved request; original stands; family notified at both transitions', async () => {
    const created = await requestReschedule('origC', 100, authAs(6));
    expect(created.status).toBe(201);

    // at +53h: TTL (24h) long past → escalates; Window (24h) closes at +52h for a +76h session → expires
    const deadlines = await runRequestDeadlines(pool, at(53));
    expect(deadlines.escalated).toBe(1);
    expect(deadlines.expired).toBe(1);

    const reqRow = await rowOf('reschedule_requests', 'request_id', created.body.request.request_id);
    expect(reqRow.status).toBe('expired');
    expect(await sessionStatus('origC')).toBe('scheduled'); // the original stands
    const { rows: events } = await env.tenantDb.query(
      `SELECT event_type FROM notification_log
        WHERE subject_type = 'reschedule_request' AND subject_id = $1
          AND recipient_user_id = 6 ORDER BY notification_id`,
      [created.body.request.request_id]);
    expect(events.map(e => e.event_type)).toEqual(['reschedule_escalated', 'reschedule_expired']);
  });

  it('responding after the Window closes lazily expires the request', async () => {
    const created = await requestReschedule('origD', 90, authAs(4));
    expect(created.status).toBe(201);

    // widen the Window so origD (+58h) is now inside it
    await env.tenantDb.query(`UPDATE institution_settings SET reschedule_window_hours = 100`);
    const res = await respond(created.body.request.request_id, { action: 'accept' });
    expect(res.status).toBe(400);
    expect(res.body.request_status).toBe('expired');
    expect(await sessionStatus('origD')).toBe('scheduled');
    await env.tenantDb.query(`UPDATE institution_settings SET reschedule_window_hours = 24`);
  });
});
