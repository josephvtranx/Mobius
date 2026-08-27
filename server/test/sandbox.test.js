import { beforeAll, afterAll, it, expect } from 'vitest';
import request from 'supertest';
import { startTestEnv } from './helpers/testEnv.js';
import { seedAcademy } from '../scripts/dev/seedAcademy.js';
import { seedScenarios, DEMO_ACCOUNTS } from '../scripts/dev/seedScenarios.js';

let env, scenarios, api;
const auth = {};
beforeAll(async () => {
  process.env.PG_POOL_MAX = '1';
  env = await startTestEnv();
  api = request(env.app);
  const academy = await seedAcademy(env);
  scenarios = await seedScenarios(env, academy);
  for (const [role,email] of [['staff','staff@test.com'],['instructor','instructor@demo.com'],['alice','alice@demo.com'],['charlie','charlie@demo.com']]) {
    const res = await api.post('/api/auth/login').send({email,password:'Password123!'});
    auth[role] = { Authorization: `Bearer ${res.body.accessToken}` };
  }
}, 60000);
afterAll(async () => { await env?.stop(); });

it('all documented demo accounts authenticate through the normal login flows', async () => {
  for (const account of DEMO_ACCOUNTS) {
    const res = await api.post(account.path ? '/api/admin/login' : '/api/auth/login')
      .send({email:account.email,password:'Password123!'});
    expect(res.status, account.email).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  }
});
it('every balance reconciles, deductions reference attendance, package grants match payments', async () => {
  const {rows: bad} = await env.tenantDb.query(`SELECT w.wallet_id FROM wallets w LEFT JOIN credit_ledger l USING (wallet_id)
    GROUP BY w.wallet_id,w.balance HAVING w.balance <> COALESCE(sum(l.amount),0)`);
  expect(bad).toEqual([]);
  const {rows: balances} = await env.tenantDb.query('SELECT balance FROM wallets WHERE student_id IN (3,4,6) ORDER BY student_id');
  expect(balances.map(r=>r.balance)).toEqual([40,3,30]);
  const {rows: packages} = await env.tenantDb.query(`SELECT p.payment_id FROM payments p JOIN credit_packages cp USING (package_id)
    JOIN wallets w USING (student_id) WHERE NOT EXISTS (SELECT 1 FROM credit_ledger l
    WHERE l.wallet_id=w.wallet_id AND l.amount=cp.credits+cp.bonus_credits
      AND l.note='Package: Standard (100 + 5 bonus); payment ' || p.payment_id)`);
  expect(packages).toEqual([]);
  const {rows: deductions} = await env.tenantDb.query(`SELECT a.attendance_id FROM session_attendance a
    JOIN class_sessions s USING(session_id) JOIN classes c USING(class_id)
    LEFT JOIN credit_ledger l USING(attendance_id) WHERE a.status IN ('present','absent_unexcused','cancelled_late')
    GROUP BY a.attendance_id,c.session_credit_cost HAVING COALESCE(sum(l.amount),0) <> -c.session_credit_cost`);
  expect(deductions).toEqual([]);
});
it('has complete/missing notes, pending queues, and no student calendar overlaps', async () => {
  const {rows: notes} = await env.tenantDb.query('SELECT student_id,performance FROM session_notes WHERE session_id=$1', [scenarios.notes.sessionId]);
  expect(notes).toEqual([{student_id:3,performance:'Clear reasoning'}]);
  const {rows: waitlist} = await env.tenantDb.query('SELECT is_waitlist,status FROM class_membership_requests WHERE request_id=$1', [scenarios.waitlist.requestId]);
  expect(waitlist[0]).toEqual({is_waitlist:true,status:'pending'});
  const {rows: overlaps} = await env.tenantDb.query(`SELECT e1.student_id FROM enrollments e1 JOIN enrollments e2
    ON e1.student_id=e2.student_id AND e1.class_id<e2.class_id
    JOIN class_sessions s1 ON s1.class_id=e1.class_id JOIN class_sessions s2 ON s2.class_id=e2.class_id
    WHERE s1.status IN ('scheduled','reschedule_requested') AND s2.status IN ('scheduled','reschedule_requested')
    AND s1.starts_at<s2.ends_at AND s2.starts_at<s1.ends_at`);
  expect(overlaps).toEqual([]);
});
it('seeded booking, reschedule and enrollment can be completed through the API', async () => {
  const booking = await api.post(`/api/bookings/${scenarios.booking.class_id}/respond`).set(auth.instructor).send({action:'accept'});
  expect(booking.status).toBe(200);
  const reschedule = await api.post(`/api/reschedule-requests/${scenarios.reschedule.requestId}/respond`).set(auth.instructor).send({action:'accept'});
  expect(reschedule.status).toBe(200);
  const join = await api.post(`/api/classes/membership-requests/${scenarios.join.requestId}/resolve`).set(auth.staff).send({action:'approve'});
  expect(join.status).toBe(200);
});
it('practice attendance is idempotent and the missing note can be filled', async () => {
  const payload = {marks:[{student_id:3,status:'present'}]};
  const first = await api.post(`/api/sessions/${scenarios.attendance.sessionId}/attendance`).set(auth.instructor).send(payload);
  expect(first.status).toBe(200);
  const repeat = await api.post(`/api/sessions/${scenarios.attendance.sessionId}/attendance`).set(auth.instructor).send(payload);
  expect(repeat.status).toBe(200);
  const {rows:[wallet]} = await env.tenantDb.query('SELECT balance FROM wallets WHERE student_id=3');
  expect(wallet.balance).toBe(35);
  const note = await api.put(`/api/sessions/${scenarios.notes.sessionId}/notes/4`).set(auth.instructor).send({performance:'Improved focus'});
  expect(note.status).toBe(200);
});
it('package payment adds credits, money-only does not, and an early cancellation costs none', async () => {
  const paid = await api.post('/api/payments').set(auth.staff).send({student_id:4,package_id:2,payment_date:'2026-08-27',method_id:2});
  expect(paid.status).toBe(201);
  expect(paid.body.credited).toBe(105);
  const cash = await api.post('/api/payments').set(auth.staff).send({student_id:4,amount:10,payment_date:'2026-08-27',method_id:3});
  expect(cash.status).toBe(201);
  const {rows:[wallet]} = await env.tenantDb.query('SELECT balance FROM wallets WHERE student_id=4');
  expect(wallet.balance).toBe(108);
  const cancel = await api.post(`/api/sessions/${scenarios.cancellation.sessionId}/cancel`).set(auth.alice).send({reason:'other'});
  expect(cancel.status).toBe(200);
  const {rows:[alice]} = await env.tenantDb.query('SELECT balance FROM wallets WHERE student_id=3');
  expect(alice.balance).toBe(35);
});
