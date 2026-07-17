// Characterization tests (MODERNIZATION 0.3): tenant resolution — getTenantPool
// caching, the pre-/api middleware attaching req.db from the session cookie,
// and behavior when no tenantCode exists.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
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

describe('tenant middleware (req.db attachment)', () => {
  it('leaves req.db unset without a session cookie → login guard 400s', async () => {
    const res = await request(env.app)
      .post('/api/auth/login')
      .send({ email: SEED_USER.email, password: SEED_USER.password });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'No institution selected or DB unavailable.' });
  });

  it('attaches the tenant pool when the session has a tenantCode', async () => {
    const agent = request.agent(env.app);
    await agent.post('/api/institution').send({ code: TEST_CODE }).expect(200);
    // a real tenant query runs (user lookup) — proves req.db pointed at the tenant DB
    const res = await agent.post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'Password123!' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid email or password' });
  });

  it('keeps tenants isolated per agent (no cookie bleed between agents)', async () => {
    const withTenant = request.agent(env.app);
    await withTenant.post('/api/institution').send({ code: TEST_CODE }).expect(200);
    const without = request.agent(env.app);
    const res = await without.post('/api/auth/login')
      .send({ email: SEED_USER.email, password: SEED_USER.password });
    expect(res.status).toBe(400); // fresh agent, no session → no req.db
  });
});
