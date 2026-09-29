// Phase 7.5 — academic layer (spec 06): ACA-1 one-pass attendance+notes,
// INV-5 versioned edits + the 7-day lock, ACA-4 unlock flow (future-stamp
// auto-relock), ACA-2 record timeline with the privacy split, ACA-3 note
// completion report, and the notes-pending nudge.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { DateTime } from 'luxon';
import { startTestEnv, TEST_CODE, SEED_USER } from './helpers/testEnv.js';
import { runRecordLock } from '../src/jobs/billingJobs.js';
import { runNotesReminder } from '../src/jobs/academicJobs.js';

let env;
let staff;
let pool;
let T0;
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
    INSERT INTO wallets (student_id, balance) VALUES (3,100),(4,100);
  `);
  const { rows: [c] } = await db.query(
    `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit,
                          session_credit_cost, recurrence, starts_on, created_by)
     VALUES ('group', 1, 2, 6, 5, 'weekly', '2026-06-01', 1) RETURNING class_id`);
  cls.g = c.class_id;
  for (const sid of [3, 4]) {
    await db.query(`INSERT INTO enrollments (class_id, student_id) VALUES ($1,$2)`, [cls.g, sid]);
  }
  async function mkSession(name, startHours) {
    const { rows: [row] } = await db.query(
      `INSERT INTO class_sessions (class_id, instructor_id, starts_at, ends_at)
       VALUES ($1, 2, $2, $3) RETURNING session_id`,
      [cls.g, at(startHours), at(startHours + 1)]);
    ses[name] = row.session_id;
  }
  await mkSession('sDone', -3);           // ended -2h: inside the edit window
  await mkSession('sNoNote', -5);         // ended -4h: attendance, no notes
  await mkSession('sOld', -240);          // ended 10 days ago: computed-locked
}

const noteRow = async (sessionName, studentId) => {
  const { rows } = await env.tenantDb.query(
    `SELECT * FROM session_notes WHERE session_id = $1 AND student_id = $2`,
    [ses[sessionName], studentId]);
  return rows[0] ?? null;
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

describe('ACA-1 — attendance + notes in one pass', () => {
  it('one request writes attendance and notes together; notes never block money', async () => {
    const res = await staff.agent.post(`/api/sessions/${ses.sDone}/attendance`)
      .set(authAs(2)).send({ marks: [
        { student_id: 3, status: 'present', note: { performance: 'strong start' } },
        { student_id: 4, status: 'present' } // notes skipped — attendance still saves
      ] });
    expect(res.status).toBe(200);
    expect(res.body.results.find(r => r.student_id === 3).note_saved).toBe(true);

    const { rows: att } = await env.tenantDb.query(
      `SELECT 1 FROM session_attendance WHERE session_id = $1`, [ses.sDone]);
    expect(att).toHaveLength(2);
    expect(await noteRow('sDone', 3)).not.toBeNull();
    expect(await noteRow('sDone', 4)).toBeNull();
    // billing proceeded for both
    const { rows: [w] } = await env.tenantDb.query(
      `SELECT balance FROM wallets WHERE student_id = 4`);
    expect(w.balance).toBe(95);

    // second session marked with no notes at all (empty-state + reminder fixture)
    const bare = await staff.agent.post(`/api/sessions/${ses.sNoNote}/attendance`)
      .set(authAs(2)).send({ marks: [
        { student_id: 3, status: 'present' }, { student_id: 4, status: 'present' }
      ] });
    expect(bare.status).toBe(200);
  });

  it('notes are instructor-authored: staff-with-note 400s, other instructors 403', async () => {
    const staffNote = await staff.agent.post(`/api/sessions/${ses.sDone}/attendance`)
      .set(staff.auth).send({ marks: [
        { student_id: 3, status: 'present', note: { free_notes: 'staff scribble' } }
      ] });
    expect(staffNote.status).toBe(400);
    expect(staffNote.body.message).toContain('instructor-authored');

    const wrongInstructor = await staff.agent.put(`/api/sessions/${ses.sDone}/notes/3`)
      .set(authAs(7)).send({ performance: 'nope' });
    expect(wrongInstructor.status).toBe(403);
  });

  it('gives staff a read-only attendance log with marker attribution', async () => {
    const from = T0.minus({ days: 1 }).toISO();
    const to = T0.plus({ days: 1 }).toISO();
    const list = await staff.agent.get('/api/sessions/attendance-log')
      .set(staff.auth).query({ from, to });

    expect(list.status).toBe(200);
    const logged = list.body.sessions.find((session) => session.session_id === ses.sDone);
    expect(logged).toMatchObject({
      subject: 'Algebra',
      instructor: 'Instructor',
      recorded_count: 2,
      present_count: 2,
      auto_completed: false,
      recorded_by: 'Instructor'
    });

    const detail = await staff.agent.get(`/api/sessions/${ses.sDone}/attendance-log`)
      .set(staff.auth);
    expect(detail.status).toBe(200);
    expect(detail.body.records).toHaveLength(2);
    expect(detail.body.records[0]).toMatchObject({
      status: 'present',
      marked_by: 'Instructor',
      marked_by_role: 'instructor',
      auto_completed: false
    });

    const instructorList = await staff.agent.get('/api/sessions/attendance-log')
      .set(authAs(2)).query({ from, to });
    expect(instructorList.status).toBe(403);
  });
});

describe('INV-5 — versioned edits inside the window', () => {
  it('each edit appends the prior payload to versions and stamps edited_at', async () => {
    const first = await staff.agent.put(`/api/sessions/${ses.sDone}/notes/3`)
      .set(authAs(2)).send({ performance: 'stronger', free_notes: 'watch algebra drills' });
    expect(first.status).toBe(200);
    expect(first.body.edited).toBe(true);

    const second = await staff.agent.put(`/api/sessions/${ses.sDone}/notes/3`)
      .set(authAs(2)).send({ performance: 'strongest', free_notes: 'watch algebra drills' });
    expect(second.status).toBe(200);

    const note = await noteRow('sDone', 3);
    expect(note.performance).toBe('strongest');
    expect(note.versions).toHaveLength(2);
    expect(note.versions[0].performance).toBe('strong start');
    expect(note.edited_at).not.toBeNull();
  });
});

describe('ACA-2 — the record timeline', () => {
  it('guardians see latest text + edit stamps (no version payloads); staff see payloads', async () => {
    const guardian = await staff.agent.get('/api/students/3/record').set(authAs(5));
    expect(guardian.status).toBe(200);
    const done = guardian.body.entries.find(e => e.session_id === ses.sDone);
    expect(done.note.performance).toBe('strongest');
    expect(done.note.edit_count).toBe(2);
    expect(done.note.edit_history).toHaveLength(2);
    expect(done.note.versions).toBeUndefined(); // audit payloads are staff-only

    // no-shame empty state: the noteless entry still carries the subject
    const bare = guardian.body.entries.find(e => e.session_id === ses.sNoNote);
    expect(bare.note).toBeNull();
    expect(bare.subject).toBe('Algebra');
    expect(bare.attendance.status).toBe('present');

    const asStaff = await staff.agent.get('/api/students/3/record').set(staff.auth);
    const doneStaff = asStaff.body.entries.find(e => e.session_id === ses.sDone);
    expect(doneStaff.note.versions).toHaveLength(2);

    const stranger = await staff.agent.get('/api/students/3/record').set(authAs(6));
    expect(stranger.status).toBe(403);
  });
});

describe('ACA-4 — lock and the unlock flow', () => {
  it('post-window writes are blocked (computed deadline, no row needed)', async () => {
    const res = await staff.agent.put(`/api/sessions/${ses.sOld}/notes/3`)
      .set(authAs(2)).send({ performance: 'late correction' });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('RECORD_LOCKED');
  });

  it('unlock request → staff task; staff unlock opens a 48h window; auto-relock after', async () => {
    const noReason = await staff.agent
      .post(`/api/sessions/${ses.sOld}/notes/3/unlock-request`).set(authAs(2)).send({});
    expect(noReason.status).toBe(400);

    const filed = await staff.agent.post(`/api/sessions/${ses.sOld}/notes/3/unlock-request`)
      .set(authAs(2)).send({ reason: 'factual error in the note' });
    expect(filed.status).toBe(201);
    const dup = await staff.agent.post(`/api/sessions/${ses.sOld}/notes/3/unlock-request`)
      .set(authAs(2)).send({ reason: 'again' });
    expect(dup.status).toBe(409);

    const unlocked = await staff.agent.post(`/api/sessions/${ses.sOld}/notes/3/unlock`)
      .set(staff.auth).send({});
    expect(unlocked.status).toBe(200);

    const row = await noteRow('sOld', 3);
    expect(DateTime.fromJSDate(row.locked_at) > DateTime.utc()).toBe(true); // future stamp
    const { rows: tasks } = await env.tenantDb.query(
      `SELECT status FROM staff_tasks WHERE kind = 'note_unlock_request'`);
    expect(tasks.every(t => t.status === 'done')).toBe(true);
    const { rows: notice } = await env.tenantDb.query(
      `SELECT recipient_user_id FROM notification_log WHERE event_type = 'note_unlocked'`);
    expect(notice.map(n => n.recipient_user_id)).toEqual([2]);

    // edit inside the window works (versioned over the placeholder)
    const edit = await staff.agent.put(`/api/sessions/${ses.sOld}/notes/3`)
      .set(authAs(2)).send({ performance: 'corrected record' });
    expect(edit.status).toBe(200);

    // the nightly lock job never clobbers an open unlock window
    await runRecordLock(pool);
    const after = await noteRow('sOld', 3);
    expect(DateTime.fromJSDate(after.locked_at) > DateTime.utc()).toBe(true);

    // when the stamp passes, the note relocks with no job involvement
    await env.tenantDb.query(
      `UPDATE session_notes SET locked_at = CURRENT_TIMESTAMP - interval '1 hour'
        WHERE session_id = $1 AND student_id = 3`, [ses.sOld]);
    const relocked = await staff.agent.put(`/api/sessions/${ses.sOld}/notes/3`)
      .set(authAs(2)).send({ performance: 'too late' });
    expect(relocked.status).toBe(409);
  });
});

describe('ACA-3 — note completion report', () => {
  it('computes rates per instructor/class with the missing drill-down; staff-only', async () => {
    const res = await staff.agent.get('/api/reports/note-completion').set(staff.auth);
    expect(res.status).toBe(200);

    // marked pairs: sDone(2) + sNoNote(2) = 4; noted: sDone/student 3 only
    const instr = res.body.by_instructor.find(r => r.instructor_id === 2);
    expect(instr.marked).toBe(4);
    expect(instr.noted).toBe(1);
    expect(instr.rate).toBe(0.25);
    expect(res.body.missing).toHaveLength(3);

    const notStaff = await staff.agent.get('/api/reports/note-completion').set(authAs(2));
    expect(notStaff.status).toBe(403);
  });
});

describe('report validation and data quality', () => {
  it.each(['0', '-1', '366', '1.5', 'abc'])('rejects invalid note window %s', async (days) => {
    const res = await staff.agent.get(`/api/reports/note-completion?days=${days}`).set(staff.auth);
    expect(res.status).toBe(400);
  });

  it('keeps blank notes missing and returns readable session context', async () => {
    const { rows: [note] } = await env.tenantDb.query(
      `INSERT INTO session_notes (session_id,student_id,created_by,performance,free_notes)
       VALUES ($1,4,2,'   ','') RETURNING note_id`, [ses.sDone]);
    try {
      const res = await staff.agent.get('/api/reports/note-completion?days=30').set(staff.auth);
      expect(res.status).toBe(200);
      const missing = res.body.missing.find(r => r.session_id === ses.sDone && r.student_id === 4);
      expect(missing.student).toBe('Student B');
      expect(missing.instructor).toBe('Instructor');
      expect(missing.starts_at).toMatch(/Z$/);
      expect(res.body.by_instructor.find(r => r.instructor_id === 2).noted).toBe(1);
    } finally {
      await env.tenantDb.query('DELETE FROM session_notes WHERE note_id=$1',[note.note_id]);
    }
  });

  it('handles nonnumeric task subjects without crashing dashboard reports', async () => {
    const { rows: [task] } = await env.tenantDb.query(
      `INSERT INTO staff_tasks (kind,subject_type,subject_id) VALUES ('delinquent_balance','student','not-an-id') RETURNING task_id`);
    try {
      const res = await staff.agent.get('/api/reports/dashboard').set(staff.auth);
      expect(res.status).toBe(200);
      expect(res.body.delinquency_queue.some(r=>r.task_id===task.task_id)).toBe(false);
      expect((await staff.agent.get('/api/reports/dashboard').set(authAs(2))).status).toBe(403);
    } finally {
      await env.tenantDb.query('DELETE FROM staff_tasks WHERE task_id=$1',[task.task_id]);
    }
  });
});

describe('notes-pending nudge', () => {
  it('reminds the instructor once per note-missing session, deduped', async () => {
    // +25h: both marked sessions are past the 24h timer; sOld has no attendance
    const run = await runNotesReminder(pool, at(25));
    expect(run.reminded).toBe(2); // sDone (student 4 missing) + sNoNote (both)

    const { rows: notices } = await env.tenantDb.query(
      `SELECT recipient_user_id FROM notification_log WHERE event_type = 'notes_pending'`);
    expect(notices).toHaveLength(2);
    expect(notices.every(n => n.recipient_user_id === 2)).toBe(true);

    const rerun = await runNotesReminder(pool, at(25));
    expect(rerun.reminded).toBe(0);
  });
});
