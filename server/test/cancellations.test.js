// Phase 7.3 Slice A — cancellations (spec 07): RSC-2 student/guardian cancel
// (the Window decides the money effect), RSC-3 instructor cancel (families
// made whole automatically), RSC-5 staff cancel (Window never binds staff) +
// instructor termination requests, RSC-4 leave anti-loophole.
// Money flows only through attendance statuses (spec 04 engine, Phase 7.2).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { startTestEnv, TEST_CODE, SEED_USER } from './helpers/testEnv.js';

let env;
let staff;
let ses = {};  // session ids by name
let cls = {};  // class ids by name

const at = (hours) => DateTime.utc().plus({ hours }).toISO();

function tokenFor(userId) {
  return jwt.sign({ userId, tenantCode: TEST_CODE }, process.env.JWT_SECRET, { expiresIn: '10m' });
}
const authAs = (userId) => ({ Authorization: `Bearer ${tokenFor(userId)}` });

async function seed() {
  const db = env.tenantDb;
  await db.exec(`
    INSERT INTO users (password_hash, name, email, role) VALUES
      ('h','Instructor','instr@test.com','instructor'),   -- 2
      ('h','Student A','sa@test.com','student'),          -- 3 (guardian: 5)
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
    INSERT INTO wallets (student_id, balance) VALUES (3,50),(4,50),(6,50);
  `);

  async function mkClass(name, { type = 'group', limit = 6, recurrence = 'weekly', cost = 5 }) {
    const { rows: [row] } = await db.query(
      `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit,
                            session_credit_cost, recurrence, starts_on, created_by)
       VALUES ($1, 1, 2, $2, $3, $4, '2026-07-01', 1) RETURNING class_id`,
      [type, type === 'one_on_one' ? 1 : limit, cost, recurrence]);
    cls[name] = row.class_id;
  }
  async function mkSession(name, className, startHours, durationHours = 1) {
    const { rows: [row] } = await db.query(
      `INSERT INTO class_sessions (class_id, instructor_id, starts_at, ends_at)
       VALUES ($1, 2, $2, $3) RETURNING session_id`,
      [cls[className], at(startHours), at(startHours + durationHours)]);
    ses[name] = row.session_id;
  }
  async function enroll(className, ...studentIds) {
    for (const sid of studentIds) {
      await db.query(`INSERT INTO enrollments (class_id, student_id) VALUES ($1,$2)`, [cls[className], sid]);
    }
  }

  await mkClass('oneOnOne', { type: 'one_on_one' });   // student 3
  await enroll('oneOnOne', 3);
  await mkSession('sIn1', 'oneOnOne', 2);    // inside the 24h window
  await mkSession('sOut1', 'oneOnOne', 48);  // outside
  await mkSession('sPast1', 'oneOnOne', -2); // already started
  await mkSession('sG', 'oneOnOne', 52);     // guardian-cancel case

  await mkClass('group', { type: 'group' });           // students 3, 4
  await enroll('group', 3, 4);
  await mkSession('sOut2', 'group', 50);
  await mkSession('sIn2', 'group', 4);
  await mkSession('sIn2b', 'group', 6);
  await mkSession('sIn2c', 'group', 8);
  await mkSession('sOut2b', 'group', 72);

  await mkClass('oneOff', { type: 'one_on_one', recurrence: 'none' }); // student 6
  await enroll('oneOff', 6);
  await mkSession('sOne', 'oneOff', 30);
}

const balanceOf = async (studentId) => {
  const { rows } = await env.tenantDb.query(
    `SELECT balance FROM wallets WHERE student_id = $1`, [studentId]);
  return rows[0].balance;
};
const attendanceOf = async (sessionName, studentId) => {
  const { rows } = await env.tenantDb.query(
    `SELECT * FROM session_attendance WHERE session_id = $1 AND student_id = $2`,
    [ses[sessionName], studentId]);
  return rows[0] ?? null;
};
const sessionStatus = async (sessionName) => {
  const { rows } = await env.tenantDb.query(
    `SELECT status FROM class_sessions WHERE session_id = $1`, [ses[sessionName]]);
  return rows[0].status;
};

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

describe('RSC-2 — student/guardian cancels', () => {
  it('outside the Window: no charge; 1:1 slot released, group session unaffected', async () => {
    const res = await staff.agent.post(`/api/sessions/${ses.sOut1}/cancel`).set(authAs(3)).send({});
    expect(res.status).toBe(200);
    expect(res.body.attendance_status).toBe('cancelled_in_window');
    expect(res.body.money_effect).toBe('no_charge');
    expect(await sessionStatus('sOut1')).toBe('cancelled_student');
    expect(await balanceOf(3)).toBe(50);
    const { rows: ledger } = await env.tenantDb.query(
      `SELECT 1 FROM credit_ledger l JOIN session_attendance sa ON sa.attendance_id = l.attendance_id
        WHERE sa.session_id = $1`, [ses.sOut1]);
    expect(ledger.length).toBe(0);

    const group = await staff.agent.post(`/api/sessions/${ses.sOut2}/cancel`).set(authAs(3)).send({});
    expect(group.status).toBe(200);
    expect(await sessionStatus('sOut2')).toBe('scheduled'); // the class runs regardless
  });

  it('inside the Window: credit forfeited, appeal task created, family + instructor notified', async () => {
    const res = await staff.agent.post(`/api/sessions/${ses.sIn1}/cancel`).set(authAs(3)).send({});
    expect(res.status).toBe(200);
    expect(res.body.attendance_status).toBe('cancelled_late');
    expect(res.body.money_effect).toBe('credit_forfeited');
    expect(await balanceOf(3)).toBe(45);

    const att = await attendanceOf('sIn1', 3);
    const { rows: tasks } = await env.tenantDb.query(
      `SELECT 1 FROM staff_tasks WHERE kind = 'appeal_review' AND subject_id = $1`,
      [att.attendance_id]);
    expect(tasks.length).toBe(1);

    const { rows: notices } = await env.tenantDb.query(
      `SELECT recipient_user_id FROM notification_log
        WHERE event_type = 'session_cancelled_late' AND subject_id = $1
        ORDER BY recipient_user_id`, [ses.sIn1]);
    expect(notices.map(n => n.recipient_user_id)).toEqual([2, 3, 5]); // instructor + student + guardian
  });

  it('guards: guardian may act, strangers 403, started sessions and non-enrollees 400', async () => {
    const guardian = await staff.agent.post(`/api/sessions/${ses.sG}/cancel`)
      .set(authAs(5)).send({ student_id: 3 });
    expect(guardian.status).toBe(200);

    const stranger = await staff.agent.post(`/api/sessions/${ses.sIn2}/cancel`)
      .set(authAs(6)).send({ student_id: 3 });
    expect(stranger.status).toBe(403);

    const started = await staff.agent.post(`/api/sessions/${ses.sPast1}/cancel`).set(authAs(3)).send({});
    expect(started.status).toBe(400);
    expect(started.body.message).toContain('started');

    const notEnrolled = await staff.agent.post(`/api/sessions/${ses.sIn2}/cancel`).set(authAs(6)).send({});
    expect(notEnrolled.status).toBe(400);
    expect(notEnrolled.body.message).toContain('not enrolled');
  });
});

describe('RSC-3 — instructor cancels an instance', () => {
  it('requires a reason and the session\'s own instructor', async () => {
    const noReason = await staff.agent.post(`/api/sessions/${ses.sOut2b}/instructor-cancel`)
      .set(authAs(2)).send({});
    expect(noReason.status).toBe(400);

    const wrongInstructor = await staff.agent.post(`/api/sessions/${ses.sOne}/instructor-cancel`)
      .set(authAs(7)).send({ reason: 'sick' });
    expect(wrongInstructor.status).toBe(403);
  });

  it('cancels a group instance: every enrollee made whole, families notified', async () => {
    const res = await staff.agent.post(`/api/sessions/${ses.sOut2b}/instructor-cancel`)
      .set(authAs(2)).send({ reason: 'illness' });
    expect(res.status).toBe(200);
    expect(res.body.students).toBe(2);
    expect(await sessionStatus('sOut2b')).toBe('cancelled_instructor');

    for (const sid of [3, 4]) {
      const att = await attendanceOf('sOut2b', sid);
      expect(att.status).toBe('instructor_cancelled');
    }
    // pre-session: nothing was deducted, so nothing moves (INV-1)
    const { rows: ledger } = await env.tenantDb.query(
      `SELECT 1 FROM credit_ledger l JOIN session_attendance sa ON sa.attendance_id = l.attendance_id
        WHERE sa.session_id = $1`, [ses.sOut2b]);
    expect(ledger.length).toBe(0);

    const { rows: notices } = await env.tenantDb.query(
      `SELECT recipient_user_id, payload FROM notification_log
        WHERE event_type = 'session_cancelled_by_instructor' AND subject_id = $1
        ORDER BY recipient_user_id`, [ses.sOut2b]);
    expect(notices.map(n => n.recipient_user_id)).toEqual([3, 4, 5]);
    expect(notices[0].payload.rebook).toBe(false); // recurring: next occurrence unchanged
  });

  it('one-off cancels carry the rebook hint (family must book another time)', async () => {
    const res = await staff.agent.post(`/api/sessions/${ses.sOne}/instructor-cancel`)
      .set(authAs(2)).send({ reason: 'emergency' });
    expect(res.status).toBe(200);
    const { rows: [notice] } = await env.tenantDb.query(
      `SELECT payload FROM notification_log
        WHERE event_type = 'session_cancelled_by_instructor' AND subject_id = $1`, [ses.sOne]);
    expect(notice.payload.rebook).toBe(true);
  });
});

describe('RSC-5 — staff cancel (Window never binds staff) + termination requests', () => {
  it('default staff cancel inside the Window deducts nothing', async () => {
    const res = await staff.agent.post(`/api/sessions/${ses.sIn2}/staff-cancel`)
      .set(staff.auth).send({ reason: 'academy closure' });
    expect(res.status).toBe(200);
    expect(res.body.attendance_status).toBe('instructor_cancelled');
    expect(await sessionStatus('sIn2')).toBe('cancelled_staff');
    expect(await balanceOf(3)).toBe(45); // unchanged
    expect(await balanceOf(4)).toBe(50);
  });

  it('staff may pick a deducting status explicitly', async () => {
    const res = await staff.agent.post(`/api/sessions/${ses.sIn2b}/staff-cancel`)
      .set(staff.auth).send({ status: 'cancelled_late', reason: 'no-show pattern' });
    expect(res.status).toBe(200);
    expect(await balanceOf(3)).toBe(40);
    expect(await balanceOf(4)).toBe(45);

    const bad = await staff.agent.post(`/api/sessions/${ses.sIn2c}/staff-cancel`)
      .set(staff.auth).send({ status: 'present' });
    expect(bad.status).toBe(400);
  });

  it('instructor termination request files an urgent staff task', async () => {
    const notInstructor = await staff.agent.post(`/api/classes/${cls.group}/termination-request`)
      .set(authAs(3)).send({ reason: 'x' });
    expect(notInstructor.status).toBe(403);

    const noReason = await staff.agent.post(`/api/classes/${cls.group}/termination-request`)
      .set(authAs(2)).send({});
    expect(noReason.status).toBe(400);

    const res = await staff.agent.post(`/api/classes/${cls.group}/termination-request`)
      .set(authAs(2)).send({ reason: 'schedule overload' });
    expect(res.status).toBe(201);
    const { rows: tasks } = await env.tenantDb.query(
      `SELECT urgency FROM staff_tasks
        WHERE kind = 'instructor_termination_request' AND subject_id = $1`, [cls.group]);
    expect(tasks.length).toBe(1);
    expect(tasks[0].urgency).toBe('urgent');
  });
});

describe('RSC-4 — leave anti-loophole', () => {
  it('leaving forfeits sessions already inside the Window (not a free late-cancel)', async () => {
    const req4 = await staff.agent.post(`/api/classes/${cls.group}/membership-requests`)
      .set(authAs(4)).send({ kind: 'leave', student_id: 4, reason: 'moving away' });
    expect(req4.status).toBe(201);

    const resolved = await staff.agent
      .post(`/api/classes/membership-requests/${req4.body.request.request_id}/resolve`)
      .set(staff.auth).send({ action: 'approve' });
    expect(resolved.status).toBe(200);

    // sIn2c (the one remaining scheduled inside-Window session) forfeited
    const att = await attendanceOf('sIn2c', 4);
    expect(att.status).toBe('cancelled_late');
    expect(await balanceOf(4)).toBe(40);
    const { rows: [enr] } = await env.tenantDb.query(
      `SELECT status FROM enrollments WHERE class_id = $1 AND student_id = 4`, [cls.group]);
    expect(enr.status).toBe('left');
  });

  it('staff may waive the Window on a leave', async () => {
    const req3 = await staff.agent.post(`/api/classes/${cls.group}/membership-requests`)
      .set(authAs(3)).send({ kind: 'leave', student_id: 3, reason: 'schedule conflict' });
    expect(req3.status).toBe(201);

    const resolved = await staff.agent
      .post(`/api/classes/membership-requests/${req3.body.request.request_id}/resolve`)
      .set(staff.auth).send({ action: 'approve', waive_window: true });
    expect(resolved.status).toBe(200);

    expect(await attendanceOf('sIn2c', 3)).toBeNull(); // no forfeit
    expect(await balanceOf(3)).toBe(40);               // unchanged
    const { rows: [enr] } = await env.tenantDb.query(
      `SELECT status FROM enrollments WHERE class_id = $1 AND student_id = 3`, [cls.group]);
    expect(enr.status).toBe('left');
  });
});
