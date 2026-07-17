// Characterization tests (MODERNIZATION 0.2): pin CURRENT auth behavior verbatim,
// including known quirks, so refactors can prove they changed nothing:
//  - signup returns `token` (not `accessToken`) — quirk pinned until Phase 2.2
//  - validation errors omit `field` (express-validator v7 renamed .param → .path,
//    validateRequest still reads .param)
//  - signup's success path currently 400s against schema v2 (v1 columns) — drift
//    documented in MODERNIZATION Phase 7; the transaction rollback is what's pinned
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { startTestEnv, TEST_CODE, SEED_USER } from './helpers/testEnv.js';

let env;

beforeAll(async () => {
  env = await startTestEnv();
}, 60000);

afterAll(async () => {
  await env?.stop();
});

// agent with the tenant cookie already established
async function tenantAgent() {
  const agent = request.agent(env.app);
  await agent.post('/api/institution').send({ code: TEST_CODE }).expect(200);
  return agent;
}

describe('POST /api/institution', () => {
  it('accepts a valid code and sets the session cookie', async () => {
    const agent = request.agent(env.app);
    const res = await agent.post('/api/institution').send({ code: TEST_CODE });
    expect(res.status).toBe(200);
    expect(res.headers['set-cookie']?.join(';')).toContain('connect.sid');
  });

  it('rejects an unknown code with 404 and a plain-text body', async () => {
    const res = await request(env.app).post('/api/institution').send({ code: 'NOPE99' });
    expect(res.status).toBe(404);
    expect(res.text).toBe('Invalid institution code');
  });
});

describe('POST /api/auth/login', () => {
  it('400s when no institution was selected (the !req.db guard)', async () => {
    const res = await request(env.app)
      .post('/api/auth/login')
      .send({ email: SEED_USER.email, password: SEED_USER.password });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'No institution selected or DB unavailable.' });
  });

  it('400s invalid email format with the validation shape (field currently omitted — v7 quirk)', async () => {
    const agent = await tenantAgent();
    const res = await agent.post('/api/auth/login').send({ email: 'not-an-email', password: 'x' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
    expect(res.body.errors[0].message).toBe('Valid email is required');
    expect(res.body.errors[0].field).toBeUndefined();
  });

  it('401s on unknown email and on wrong password with the same message', async () => {
    const agent = await tenantAgent();
    const unknown = await agent.post('/api/auth/login')
      .send({ email: 'ghost@test.com', password: 'Password123!' });
    expect(unknown.status).toBe(401);
    expect(unknown.body).toEqual({ message: 'Invalid email or password' });

    const wrongPw = await agent.post('/api/auth/login')
      .send({ email: SEED_USER.email, password: 'WrongPassword1!' });
    expect(wrongPw.status).toBe(401);
    expect(wrongPw.body).toEqual({ message: 'Invalid email or password' });
  });

  it('logs in, returns accessToken/refreshToken/user, and updates last_login', async () => {
    const agent = await tenantAgent();
    const res = await agent.post('/api/auth/login')
      .send({ email: SEED_USER.email, password: SEED_USER.password });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.accessToken).toBeTypeOf('string');
    expect(res.body.refreshToken).toBeTypeOf('string');
    expect(res.body.user).toEqual({
      user_id: 1,
      name: SEED_USER.name,
      email: SEED_USER.email,
      role: SEED_USER.role
      // NB: no `username` key — column doesn't exist, undefined is dropped from JSON
    });

    const decoded = jwt.verify(res.body.accessToken, process.env.JWT_SECRET);
    expect(decoded).toMatchObject({ userId: 1, role: 'staff', email: SEED_USER.email });

    const { rows } = await env.tenantDb.query('SELECT last_login FROM users WHERE user_id = 1');
    expect(rows[0].last_login).not.toBeNull();
  });

  it('401s an inactive account with a distinct message', async () => {
    await env.tenantDb.query(`UPDATE users SET is_active = false WHERE user_id = 1`);
    const agent = await tenantAgent();
    const res = await agent.post('/api/auth/login')
      .send({ email: SEED_USER.email, password: SEED_USER.password });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Account is inactive. Please contact support.' });
    await env.tenantDb.query(`UPDATE users SET is_active = true WHERE user_id = 1`);
  });
});

describe('GET /api/auth/verify (with tenant selected)', () => {
  // NB: without a tenant cookie this endpoint would reject with an unhandled
  // async error (`req.db.connect()` sits outside the try) — not exercised here
  // because Express 4 turns that into a process-level rejection, not a response.
  it('401s with no token', async () => {
    const agent = await tenantAgent();
    const res = await agent.get('/api/auth/verify');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ valid: false, message: 'No token provided' });
  });

  it('401s an invalid token', async () => {
    const agent = await tenantAgent();
    const res = await agent.get('/api/auth/verify').set('Authorization', 'Bearer garbage');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ valid: false, message: 'Invalid or expired token' });
  });

  it('200s a valid token with the user payload', async () => {
    const agent = await tenantAgent();
    const login = await agent.post('/api/auth/login')
      .send({ email: SEED_USER.email, password: SEED_USER.password });
    const res = await agent.get('/api/auth/verify')
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      valid: true,
      user: { user_id: 1, name: SEED_USER.name, email: SEED_USER.email, role: 'staff' }
    });
  });
});

describe('POST /api/auth/refresh-token', () => {
  it('400s when refreshToken is missing (validation, not the 401 in the handler)', async () => {
    const agent = await tenantAgent();
    const res = await agent.post('/api/auth/refresh-token').send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });

  it('401s an invalid refresh token', async () => {
    const agent = await tenantAgent();
    const res = await agent.post('/api/auth/refresh-token').send({ refreshToken: 'garbage' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid refresh token' });
  });

  it('rotates tokens for a valid refresh token', async () => {
    const agent = await tenantAgent();
    const login = await agent.post('/api/auth/login')
      .send({ email: SEED_USER.email, password: SEED_USER.password });
    const res = await agent.post('/api/auth/refresh-token')
      .send({ refreshToken: login.body.refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Token refreshed successfully');
    expect(res.body.accessToken).toBeTypeOf('string');
    expect(res.body.refreshToken).toBeTypeOf('string');
    expect(res.body.user.user_id).toBe(1);
  });
});

// Kept last in the file: signup's early returns leave a dangling BEGIN on the
// pooled connection (bug logged as MODERNIZATION 2.6) which can taint later
// queries on the same connection.
describe('POST /api/auth/register (signup)', () => {
  const staffPayload = {
    name: 'New Staff',
    email: 'new-staff@test.com',
    password: 'Password123!',
    role: 'staff',
    age: 30,
    gender: 'other',
    department: 'Ops',
    employment_status: 'full_time'
  };

  it('400s a duplicate email before writing anything', async () => {
    const agent = await tenantAgent();
    const res = await agent.post('/api/auth/register')
      .send({ ...staffPayload, email: SEED_USER.email });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email already registered');
    const { rows } = await env.tenantDb.query(
      'SELECT count(*)::int AS n FROM users WHERE email = $1', [SEED_USER.email]);
    expect(rows[0].n).toBe(1);
  });

  it('rolls back the whole transaction when a role insert fails (v1 code vs v2 schema drift)', async () => {
    // The users INSERT succeeds against schema v2, but the staff INSERT still
    // sends the removed v1 `age` column → the role-specific catch wraps it as a
    // 400 'Error creating staff record', and the ROLLBACK must erase the user
    // row. Flips to 201 when Phase 7 aligns signup with v2 — update this test then.
    const agent = await tenantAgent();
    const res = await agent.post('/api/auth/register').send(staffPayload);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Error creating staff record');
    const { rows } = await env.tenantDb.query(
      'SELECT count(*)::int AS n FROM users WHERE email = $1', [staffPayload.email]);
    expect(rows[0].n).toBe(0);
  });
});
