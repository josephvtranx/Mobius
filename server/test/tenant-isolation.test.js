// Cross-tenant data-isolation test (backlog section 3): proves a JWT minted
// for tenant A can never read or write tenant B's data. The isolation
// mechanism is D7 — the token's tenantCode claim resolves req.db to that
// tenant's own Postgres pool (tenantPool.js, cached per code) — so this is
// really asserting that req.db is physically a different database per tenant,
// end-to-end through the real app, not just by code inspection.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { startTwoTenantEnv, TEST_CODE_A, TEST_CODE_B } from './helpers/testEnv.js';

let env;
let tokenA;
let tokenB;

beforeAll(async () => {
  env = await startTwoTenantEnv();
  // email+password locate the tenant via the registry directory; each token
  // ends up carrying its own tenantCode claim.
  const a = await request(env.app).post('/api/auth/login')
    .send({ email: 'staff-a@test.com', password: 'Password123!' });
  const b = await request(env.app).post('/api/auth/login')
    .send({ email: 'staff-b@test.com', password: 'Password123!' });
  expect(a.status).toBe(200);
  expect(b.status).toBe(200);
  tokenA = a.body.accessToken;
  tokenB = b.body.accessToken;
}, 60000);

afterAll(async () => {
  await env?.stop();
});

describe('cross-tenant isolation (D7)', () => {
  it('each token carries its own tenantCode claim', () => {
    const claim = (t) => JSON.parse(Buffer.from(t.split('.')[1], 'base64').toString()).tenantCode;
    expect(claim(tokenA)).toBe(TEST_CODE_A);
    expect(claim(tokenB)).toBe(TEST_CODE_B);
  });

  it('a list endpoint returns ONLY the caller\'s own tenant rows', async () => {
    const listA = await request(env.app).get('/api/users').set('Authorization', `Bearer ${tokenA}`);
    const listB = await request(env.app).get('/api/users').set('Authorization', `Bearer ${tokenB}`);
    expect(listA.status).toBe(200);
    expect(listB.status).toBe(200);
    const emailsA = listA.body.map((u) => u.email);
    const emailsB = listB.body.map((u) => u.email);
    // A sees its own staff and NOT B's, and vice versa
    expect(emailsA).toContain('staff-a@test.com');
    expect(emailsA).not.toContain('staff-b@test.com');
    expect(emailsB).toContain('staff-b@test.com');
    expect(emailsB).not.toContain('staff-a@test.com');
  });

  it('the SAME user_id resolves to different records per tenant (req.db is a different DB)', async () => {
    // user_id 1 exists in BOTH tenants (the trap). Each token must read its own.
    const uA = await request(env.app).get('/api/users/1').set('Authorization', `Bearer ${tokenA}`);
    const uB = await request(env.app).get('/api/users/1').set('Authorization', `Bearer ${tokenB}`);
    expect(uA.status).toBe(200);
    expect(uB.status).toBe(200);
    expect(uA.body.email).toBe('staff-a@test.com');
    expect(uB.body.email).toBe('staff-b@test.com');
    expect(uA.body.email).not.toBe(uB.body.email);
  });

  it('a write through tenant A lands in A\'s DB and is invisible in B\'s DB', async () => {
    const created = await request(env.app).post('/api/subject-groups')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Isolation-Probe-A' });
    expect(created.status).toBe(201);

    // Direct DB assertions against each tenant's PGlite handle: present in A, absent in B.
    const inA = await env.tenantADb.query(`SELECT 1 FROM subject_groups WHERE name = 'Isolation-Probe-A'`);
    const inB = await env.tenantBDb.query(`SELECT 1 FROM subject_groups WHERE name = 'Isolation-Probe-A'`);
    expect(inA.rows.length).toBe(1);
    expect(inB.rows.length).toBe(0);

    // And tenant B's API never surfaces A's write either.
    const listB = await request(env.app).get('/api/subject-groups').set('Authorization', `Bearer ${tokenB}`);
    expect(listB.status).toBe(200);
    expect(listB.body.map((g) => g.name)).not.toContain('Isolation-Probe-A');
  });
});
