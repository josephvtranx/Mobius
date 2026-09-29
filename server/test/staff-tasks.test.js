import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { startTestEnv, TEST_CODE } from './helpers/testEnv.js';

let env;
let staffToken;
let studentToken;
beforeAll(async () => {
  env = await startTestEnv();
  const { rows: [student] } = await env.tenantDb.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ('Student', 'task-student@test.com', 'h', 'student') RETURNING user_id`);
  const token = (userId) => jwt.sign({ userId, tenantCode: TEST_CODE }, process.env.JWT_SECRET);
  staffToken = token(1);
  studentToken = token(student.user_id);
});
afterAll(async () => { await env?.stop(); });
beforeEach(async () => { await env.tenantDb.exec('DELETE FROM staff_tasks'); });

async function seed(status = 'open', details = {}) {
  const { rows: [task] } = await env.tenantDb.query(
    `INSERT INTO staff_tasks (kind, status, details) VALUES ('other', $1, $2) RETURNING *`, [status, details]);
  return task;
}
const get = (path = '', token = staffToken) => request(env.app).get(`/api/staff-tasks${path}`).set('Authorization', `Bearer ${token}`);
const resolve = (id, action, token = staffToken) => request(env.app).post(`/api/staff-tasks/${id}/resolve`)
  .set('Authorization', `Bearer ${token}`).send({ action });
const reopen = (id, token = staffToken) => request(env.app).post(`/api/staff-tasks/${id}/reopen`)
  .set('Authorization', `Bearer ${token}`);

describe('staff task inbox', () => {
  it('requires staff for list, count and resolution', async () => {
    const task = await seed();
    expect((await request(env.app).get('/api/staff-tasks')).status).toBe(401);
    expect((await get('', studentToken)).status).toBe(403);
    expect((await get('/count', studentToken)).status).toBe(403);
    expect((await resolve(task.task_id, 'done', studentToken)).status).toBe(403);
    expect((await reopen(task.task_id, studentToken)).status).toBe(403);
  });
  it('lists active tasks and provides separately filtered history', async () => {
    await seed(); await seed('in_progress'); await seed('done'); await seed('dismissed');
    await env.tenantDb.exec(`UPDATE staff_tasks SET urgency = 'urgent' WHERE status = 'open'`);
    const active = await get();
    expect(active.status).toBe(200);
    expect(active.body.tasks).toHaveLength(2);
    expect(active.body.open_count).toBe(2);
    expect((await get('?status=done')).body.tasks).toHaveLength(1);
    const all = await get('?status=all');
    expect(all.body.total_count).toBe(4);
    expect(all.body.open_count).toBe(2);
    expect(all.body.urgent_count).toBe(1);
    expect(all.body.done_count).toBe(1);
    expect(all.body.dismissed_count).toBe(1);
    expect(all.body.all_count).toBe(4);
    expect((await get('?status=invalid')).status).toBe(400);
  });
  it('keeps accurate totals when the list reaches its display limit', async () => {
    await env.tenantDb.exec(`INSERT INTO staff_tasks (kind) SELECT 'other' FROM generate_series(1,501)`);
    const res = await get();
    expect(res.body.tasks).toHaveLength(500);
    expect(res.body.open_count).toBe(501);
    expect(res.body.total_count).toBe(501);
    expect((await get('/count')).body.open_count).toBe(501);
  });
  it('does not crash on malformed optional enrichment ids', async () => {
    await seed('open', { student_id: 'invalid', class_id: 'not-a-uuid', session_id: 'invalid' });
    const res = await get();
    expect(res.status).toBe(200);
    expect(res.body.tasks[0].student_name).toBeNull();
  });
  it('records resolution and prevents subsequent overwrite', async () => {
    const task = await seed();
    const first = await resolve(task.task_id, 'done');
    expect(first.status).toBe(200);
    expect(first.body.resolved_at).toBeTruthy();
    expect((await resolve(task.task_id, 'dismissed')).status).toBe(409);
    const { rows: [saved] } = await env.tenantDb.query('SELECT * FROM staff_tasks WHERE task_id=$1', [task.task_id]);
    expect(saved.status).toBe('done');
    expect(saved.resolved_by).toBe(1);
  });
  it('rejects invalid ids, missing tasks and invalid actions', async () => {
    const task = await seed();
    expect((await resolve('bad-id', 'done')).status).toBe(400);
    expect((await resolve(task.task_id, 'approve')).status).toBe(400);
    expect((await resolve('00000000-0000-0000-0000-000000000000', 'done')).status).toBe(404);
  });
  it('dismisses an in-progress task and preserves it in history', async () => {
    const task = await seed('in_progress');
    expect((await resolve(task.task_id, 'dismissed')).status).toBe(200);
    expect((await get()).body.tasks).toHaveLength(0);
    expect((await get('?status=dismissed')).body.tasks[0].task_id).toBe(task.task_id);
  });
  it('reopens a closed task and clears its resolution metadata', async () => {
    const task = await seed();
    expect((await resolve(task.task_id, 'done')).status).toBe(200);
    expect((await reopen(task.task_id)).status).toBe(200);
    const { rows: [saved] } = await env.tenantDb.query('SELECT * FROM staff_tasks WHERE task_id=$1', [task.task_id]);
    expect(saved.status).toBe('open');
    expect(saved.resolved_by).toBeNull();
    expect(saved.resolved_at).toBeNull();
    expect((await reopen(task.task_id)).status).toBe(409);
    expect((await reopen('bad-id')).status).toBe(400);
    expect((await reopen('00000000-0000-0000-0000-000000000000')).status).toBe(404);
  });
});
