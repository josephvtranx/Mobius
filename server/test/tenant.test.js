// Characterization tests (MODERNIZATION 0.3, re-pinned for D7): tenant
// resolution — getTenantPool caching, and the pre-/api middleware attaching
// req.db from the Bearer token's tenantCode claim (authenticated requests) or
// the X-Institution-Code header (pre-auth requests). No session exists.
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

describe('getTenantPool', () => {
  it('returns the same cached Pool instance for the same code', async () => {
    const a = await env.getTenantPool(TEST_CODE);
    const b = await env.getTenantPool(TEST_CODE);
    expect(b).toBe(a);
  });

  it('throws for a code not in the registry', async () => {
    await expect(env.getTenantPool('GHOST1')).rejects.toThrow('Institution code not found');
  });
});

describe('tenant middleware (req.db attachment — D7 single credential)', () => {
  it('leaves req.db unset with no header/token → 400 for directory-unknown emails', async () => {
    // (a directory-KNOWN email like the seed staff now logs in with no header
    // at all — the registry finds the tenant; see auth.test.js)
    const res = await request(env.app)
      .post('/api/auth/login')
      .send({ email: 'not-in-directory@test.com', password: SEED_USER.password });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'No institution selected or DB unavailable.' });
  });

  it('attaches the tenant pool from the X-Institution-Code header', async () => {
    // a real tenant query runs (user lookup) — proves req.db pointed at the tenant DB
    const res = await request(env.app).post('/api/auth/login')
      .set('x-institution-code', TEST_CODE)
      .send({ email: 'nobody@test.com', password: 'Password123!' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid email or password' });
  });

  it('an unknown header code leaves req.db unset → 400 guard (directory-unknown email)', async () => {
    const res = await request(env.app).post('/api/auth/login')
      .set('x-institution-code', 'GHOST1')
      .send({ email: 'not-in-directory@test.com', password: SEED_USER.password });
    expect(res.status).toBe(400);
  });

  it('resolves the tenant from the Bearer token claim alone — no prior handshake, no state', async () => {
    const login = await request(env.app).post('/api/auth/login')
      .set('x-institution-code', TEST_CODE)
      .send({ email: SEED_USER.email, password: SEED_USER.password });
    expect(login.status).toBe(200);

    // a completely fresh request (new "connection", no header, no cookie):
    // the JWT alone carries the tenant — this is what makes the model survive
    // restarts and horizontal scaling (nothing lives in server memory)
    const res = await request(env.app).get('/api/auth/verify')
      .set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
  });

  it('401s a validly-signed token whose tenant claim no longer resolves', async () => {
    const ghost = jwt.sign(
      { userId: 1, role: 'staff', email: SEED_USER.email, tenantCode: 'GHOST1' },
      process.env.JWT_SECRET, { expiresIn: '10m' });
    const res = await request(env.app).get('/api/users/all')
      .set('Authorization', `Bearer ${ghost}`);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Unknown institution' });
  });
});
