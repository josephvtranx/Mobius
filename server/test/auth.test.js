// Characterization tests (MODERNIZATION 0.2) + Phase 2 fix coverage.
// Remaining pinned quirks:
//  - validation errors omit `field` (express-validator v7 renamed .param → .path,
//    validateRequest still reads .param)
//  - student signup still 400s against schema v2 (guardian model changed — Phase 7.4);
//    the transaction rollback is what's pinned
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

  it('creates a staff account: 201, accessToken (2.2), 12-round hash (2.1), committed (2.6)', async () => {
    // Runs right after the duplicate-email early return on the same pool —
    // before the 2.6 fix that early return left a dangling BEGIN and this
    // user would have been trapped in an uncommitted transaction.
    const agent = await tenantAgent();
    const res = await agent.post('/api/auth/register').send(staffPayload);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User created successfully');
    expect(res.body.accessToken).toBeTypeOf('string'); // was `token` pre-2.2
    expect(res.body.token).toBeUndefined();
    expect(res.body.refreshToken).toBeTypeOf('string');
    expect(res.body.user).toMatchObject({ email: staffPayload.email, role: 'staff' });

    // asserted through a SEPARATE connection (env.tenantDb) — proves the COMMIT landed
    const { rows } = await env.tenantDb.query(
      `SELECT u.password_hash, s.department FROM users u
       JOIN staff s ON s.staff_id = u.user_id WHERE u.email = $1`, [staffPayload.email]);
    expect(rows).toHaveLength(1);
    expect(rows[0].password_hash).toMatch(/^\$2[aby]\$12\$/); // 12 rounds via hashPassword
    expect(rows[0].department).toBe('Ops');
  });

  it('rolls back the whole transaction when a role insert fails (student path — Phase 7.4 drift)', async () => {
    // The users INSERT succeeds against schema v2, but the guardian INSERT
    // still uses the v1 contact-only guardian shape → 400, and the ROLLBACK
    // must erase the user row. Flips when Phase 7.4 rebuilds guardian signup.
    const agent = await tenantAgent();
    const res = await agent.post('/api/auth/register').send({
      name: 'New Student', email: 'new-student@test.com', password: 'Password123!',
      role: 'student', age: 15, grade: 9, gender: 'other', school: 'Test High',
      guardians: [{ name: 'Parent', phone: '555-0100', relationship: 'parent' }]
    });
    expect(res.status).toBe(400);
    const { rows } = await env.tenantDb.query(
      'SELECT count(*)::int AS n FROM users WHERE email = $1', ['new-student@test.com']);
    expect(rows[0].n).toBe(0);
  });
});

describe('POST /api/auth/change-password (mounted in 2.5)', () => {
  // uses the staff account created by the signup test above
  const email = 'new-staff@test.com';
  const oldPassword = 'Password123!';
  const newPassword = 'Fresh$Word99';

  async function loginAgent(pw) {
    const agent = await tenantAgent();
    const res = await agent.post('/api/auth/login').send({ email, password: pw });
    return { agent, res };
  }

  it('401s a wrong current password', async () => {
    const { agent, res } = await loginAgent(oldPassword);
    const out = await agent.post('/api/auth/change-password')
      .set('Authorization', `Bearer ${res.body.accessToken}`)
      .send({ currentPassword: 'Nope-Wrong1!', newPassword });
    expect(out.status).toBe(401);
    expect(out.body).toEqual({ message: 'Current password is incorrect' });
  });

  it('400s a weak new password', async () => {
    const { agent, res } = await loginAgent(oldPassword);
    const out = await agent.post('/api/auth/change-password')
      .set('Authorization', `Bearer ${res.body.accessToken}`)
      .send({ currentPassword: oldPassword, newPassword: 'alllowercase1' });
    expect(out.status).toBe(400);
    expect(out.body.message).toBe('Password requirements not met');
  });

  it('changes the password, stores history, and invalidates the old one', async () => {
    const { agent, res } = await loginAgent(oldPassword);
    const out = await agent.post('/api/auth/change-password')
      .set('Authorization', `Bearer ${res.body.accessToken}`)
      .send({ currentPassword: oldPassword, newPassword });
    expect(out.status).toBe(200);
    expect(out.body).toEqual({ message: 'Password changed successfully' });

    const oldLogin = await loginAgent(oldPassword);
    expect(oldLogin.res.status).toBe(401);
    const newLogin = await loginAgent(newPassword);
    expect(newLogin.res.status).toBe(200);

    const { rows } = await env.tenantDb.query(
      `SELECT count(*)::int AS n FROM password_history ph
       JOIN users u ON u.user_id = ph.user_id WHERE u.email = $1`, [email]);
    expect(rows[0].n).toBeGreaterThanOrEqual(1);
  });

  it('rejects reusing a recent password (history check with db arg — the 2.5 bug)', async () => {
    const { agent, res } = await loginAgent(newPassword);
    const out = await agent.post('/api/auth/change-password')
      .set('Authorization', `Bearer ${res.body.accessToken}`)
      .send({ currentPassword: newPassword, newPassword });
    expect(out.status).toBe(400);
    expect(out.body.message).toContain('used recently');
  });
});

describe('POST /api/auth/logout (mounted in 2.5; token_version now in schema — 2.7)', () => {
  it('bumps token_version so old refresh tokens 401', async () => {
    const agent = await tenantAgent();
    const login = await agent.post('/api/auth/login')
      .send({ email: 'new-staff@test.com', password: 'Fresh$Word99' });
    expect(login.status).toBe(200);

    const out = await agent.post('/api/auth/logout')
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(out.status).toBe(200);
    expect(out.body).toEqual({ message: 'Logged out successfully' });

    const refresh = await agent.post('/api/auth/refresh-token')
      .send({ refreshToken: login.body.refreshToken });
    expect(refresh.status).toBe(401);
    expect(refresh.body).toEqual({ message: 'Token has been invalidated' });
  });
});

describe('GET /api/users/all role gate (2.4: admin → staff)', () => {
  it('200s for staff, 403s for a student', async () => {
    const agent = await tenantAgent();
    const staffLogin = await agent.post('/api/auth/login')
      .send({ email: SEED_USER.email, password: SEED_USER.password });
    const ok = await agent.get('/api/users/all')
      .set('Authorization', `Bearer ${staffLogin.body.accessToken}`);
    expect(ok.status).toBe(200);
    expect(Array.isArray(ok.body)).toBe(true);

    // craft a student directly (student signup is Phase 7.4) + a signed JWT
    await env.tenantDb.query(
      `INSERT INTO users (password_hash, name, email, role) VALUES ('h','Stu','stu-gate@test.com','student')`);
    const { rows } = await env.tenantDb.query(
      `SELECT user_id FROM users WHERE email = 'stu-gate@test.com'`);
    const studentToken = jwt.sign(
      { userId: rows[0].user_id, role: 'student', email: 'stu-gate@test.com' },
      process.env.JWT_SECRET, { expiresIn: '5m' });
    const denied = await agent.get('/api/users/all')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(denied.status).toBe(403);
  });
});
