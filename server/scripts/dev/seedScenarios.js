import request from 'supertest';
import { TEST_CODE } from '../../test/helpers/testEnv.js';

export const DEMO_ACCOUNTS = [
  { role: 'Staff', name: 'Joseph Tran', email: 'staff@test.com' },
  { role: 'Instructor', name: 'Kim Soyeon', email: 'instructor@demo.com' },
  { role: 'Guardian', name: 'Grace Park (Alice’s parent)', email: 'grace@demo.com' },
  { role: 'Student', name: 'Alice Park', email: 'alice@demo.com' },
  { role: 'Student · low balance', name: 'Ben Lee', email: 'ben@demo.com' },
  { role: 'Adult student', name: 'Charlie Adult', email: 'charlie@demo.com' },
  { role: 'Platform admin', name: 'Mobius Admin', email: 'admin@mobius.com', path: '/admin/login' },
];

// Curated fixtures use the real APIs for transitions; fail startup if a scenario
// is no longer valid. Reserve mornings for these; generated classes use 15–20h.
export async function seedScenarios(env, academy) {
  const db = env.tenantDb;
  const api = request(env.app);
  const auth = {};
  for (const [id, email] of [[1,'staff@test.com'],[2,'instructor@demo.com'],[3,'alice@demo.com'],[6,'charlie@demo.com']]) {
    const res = await api.post('/api/auth/login').send({ email, password: 'Password123!' });
    if (res.status !== 200) throw new Error(`Seed login failed for ${email}`);
    auth[id] = { Authorization: `Bearer ${res.body.accessToken}` };
  }
  const post = async (path, id, body) => {
    const res = await api.post(path).set(auth[id]).send(body);
    if (res.status >= 400) throw new Error(`Seed scenario ${path}: ${res.status} ${res.body.message}`);
    return res.body;
  };
  const when = (days, hour) => academy.now.startOf('day').plus({ days, hours: hour }).toUTC().toISO();
  const { rows: [subject] } = await db.query("INSERT INTO subjects (group_id,name) VALUES (1,'Sandbox Practice') RETURNING subject_id");
  const { rows: [room] } = await db.query("INSERT INTO rooms (name,capacity) VALUES ('Practice room',6) RETURNING room_id");
  await db.query('INSERT INTO instructor_specialties (instructor_id,subject_id) VALUES (2,$1)', [subject.subject_id]);
  await db.exec("INSERT INTO instructor_availability (instructor_id,day_of_week,start_time,end_time) VALUES (2,'sat','09:00','20:00'),(2,'sun','09:00','20:00')");
  async function makeClass(students, { type = 'group', limit = 6, day = -3, hour = 10 } = {}) {
    const { rows: [cls] } = await db.query(
      `INSERT INTO classes (class_type,subject_id,instructor_id,student_limit,session_credit_cost,recurrence,starts_on,default_room_id,created_by,ends_on,recurrence_rule)
       VALUES ($1,$2,2,$3,5,$6,$4,$5,1,$4,$7) RETURNING class_id`,
      [type,subject.subject_id,limit,academy.now.startOf('day').plus({days:day}).toISODate(),room.room_id,
        type === 'group' ? 'weekly' : 'none', type === 'group' ? { timezone: 'America/Los_Angeles', byday: [{
          day: academy.now.plus({days:day}).toFormat('ccc').toLowerCase(), start: `${hour}:00`, end: `${hour+1}:00` }] } : null]);
    for (const id of students) await db.query('INSERT INTO enrollments (class_id,student_id,joined_by) VALUES ($1,$2,1)', [cls.class_id,id]);
    const session = await addSession(cls.class_id, day, hour);
    return { classId: cls.class_id, sessionId: session.session_id, startsAt: when(day,hour) };
  }
  async function addSession(classId, day, hour) {
    const { rows: [row] } = await db.query(
      `INSERT INTO class_sessions (class_id,instructor_id,room_id,starts_at,ends_at) VALUES ($1,2,$2,$3,$4) RETURNING session_id`,
      [classId,room.room_id,when(day,hour),when(day,hour+1)]);
    return row;
  }
  const attendance = await makeClass([3,4], { day: -1 });
  const notes = await makeClass([3,4], { day: -2 });
  await post(`/api/sessions/${notes.sessionId}/attendance`, 2, { marks: [
    { student_id: 3, status: 'present', note: { performance: 'Clear reasoning', improvements: 'Show working' } },
    { student_id: 4, status: 'present' },
  ] });
  const verify = await makeClass([3], { day: -1, hour: 11 });
  await post(`/api/sessions/${verify.sessionId}/attendance`, 2, { marks: [{ student_id: 3, status: 'present' }] });
  await db.query('UPDATE session_attendance SET auto_completed=true WHERE session_id=$1', [verify.sessionId]);
  await db.query("INSERT INTO staff_tasks (kind,subject_type,subject_id,details) VALUES ('auto_complete_verify','class_session',$1,$2)",
    [verify.sessionId, { class_id: verify.classId, note: 'Sandbox: verify the automatic attendance mark' }]);
  const reschedule = await makeClass([6], { type: 'one_on_one', limit: 1, day: 3 });
  const moved = await post(`/api/sessions/${reschedule.sessionId}/reschedule-request`, 6,
    { proposed_starts_at: when(4,10), proposed_ends_at: when(4,11) });
  reschedule.requestId = moved.request.request_id;
  const booking = await post('/api/bookings', 3, { instructor_id: 2, subject_id: subject.subject_id,
    tz: 'America/Los_Angeles', starts_at: when(5,11), ends_at: when(5,12) });
  const fullClass = await makeClass([4], { limit: 1, day: 6, hour: 12 });
  const waitlist = await post(`/api/classes/${fullClass.classId}/membership-requests`, 3, { kind: 'join', student_id: 3 });
  const openClass = await makeClass([3], { day: 6, hour: 13 });
  const join = await post(`/api/classes/${openClass.classId}/membership-requests`, 6, { kind: 'join', student_id: 6 });
  const cancellation = await makeClass([3], { day: 7, hour: 13 });
  const cancelled = await makeClass([6], { type: 'one_on_one', limit: 1, day: 8, hour: 13 });
  await post(`/api/sessions/${cancelled.sessionId}/cancel`, 6, { reason: 'other', note: 'Sandbox: cancelled ahead of the deadline' });
  const dm = await post('/api/messages/conversations', 3, { recipient_user_id: 2 });
  await post(`/api/messages/conversations/${dm.conversation_id}/messages`, 3, { body: 'Sandbox: could we review fractions next lesson?' });
  const announcement = await post(`/api/messages/conversations/class/${attendance.classId}`, 2, {});
  await post(`/api/messages/conversations/${announcement.conversation_id}/messages`, 2, { body: 'Sandbox: bring your practice workbook to the next class.' });
  // Restore the documented balances after setup transitions, retaining a clear audit trail.
  for (const [id, balance] of [[3,40],[4,3],[6,30]]) {
    await db.query(`INSERT INTO credit_ledger (wallet_id,entry_type,amount,note,created_by)
      SELECT wallet_id,'adjustment',$2-balance,'Sandbox scenario balance adjustment',1 FROM wallets
      WHERE student_id=$1 AND balance<>$2`, [id,balance]);
    await db.query('UPDATE wallets SET balance=$2 WHERE student_id=$1', [id,balance]);
  }
  await db.exec(`
    UPDATE staff_tasks t SET status='done',resolved_by=1,resolved_at=CURRENT_TIMESTAMP
      FROM wallets w WHERE t.kind='delinquent_balance' AND t.subject_type='student'
      AND t.subject_id=w.student_id::text AND w.balance>=0 AND t.status IN ('open','in_progress');
    INSERT INTO staff_tasks (kind,urgency,subject_type,subject_id,details)
    SELECT 'delinquent_balance','urgent','student',w.student_id::text,jsonb_build_object('balance',w.balance,'student_id',w.student_id)
      FROM wallets w WHERE w.balance<0 AND NOT EXISTS (SELECT 1 FROM staff_tasks t
        WHERE t.kind='delinquent_balance' AND t.subject_id=w.student_id::text AND t.status IN ('open','in_progress'));
    INSERT INTO staff_tasks (kind,subject_type,subject_id,details)
    VALUES ('other','student','3','{"note":"Sandbox: follow up with Alice about her workbook"}');
  `);
  return { institutionCode: TEST_CODE, attendance, notes, verify, reschedule, booking,
    waitlist: { ...fullClass, requestId: waitlist.request.request_id },
    join: { ...openClass, requestId: join.request.request_id }, cancellation, cancelled,
    messaging: { conversationId: dm.conversation_id } };
}
