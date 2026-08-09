// Platform-admin API (/api/admin): registry-level auth, tenant provisioning,
// per-tenant config editing, and cross-tenant finance aggregation. The
// provisioner is the PGlite one injected by the test harness.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { startTestEnv, TEST_CODE, SEED_USER } from './helpers/testEnv.js';

let env;
let adminToken;
let staffToken;

beforeAll(async () => {
  env = await startTestEnv();
  const a = await request(env.app).post('/api/admin/login')
    .send({ email: 'admin@mobius.com', password: 'Password123!' });
  expect(a.status).toBe(200);
  adminToken = a.body.accessToken;
  // a normal tenant staff token, to prove it CANNOT reach /api/admin
  const s = await request(env.app).post('/api/auth/login')
    .send({ email: SEED_USER.email, password: SEED_USER.password });
  staffToken = s.body.accessToken;
}, 60000);

afterAll(async () => { await env?.stop(); });

const admin = (r) => r.set('Authorization', `Bearer ${adminToken}`);

describe('platform-admin auth boundary', () => {
  it('rejects wrong admin credentials', async () => {
    const r = await request(env.app).post('/api/admin/login').send({ email: 'admin@mobius.com', password: 'nope' });
    expect(r.status).toBe(401);
  });
  it('401 with no token, 403 for a tenant staff token', async () => {
    expect((await request(env.app).get('/api/admin/institutions')).status).toBe(401);
    const r = await request(env.app).get('/api/admin/institutions').set('Authorization', `Bearer ${staffToken}`);
    expect(r.status).toBe(403);
  });
  it("the admin token carries isPlatformAdmin and NO tenantCode", () => {
    const claim = JSON.parse(Buffer.from(adminToken.split('.')[1], 'base64').toString());
    expect(claim.isPlatformAdmin).toBe(true);
    expect(claim.tenantCode).toBeUndefined();
  });
});

describe('institutions list + provisioning', () => {
  it('lists existing academies with counts', async () => {
    const r = await admin(request(env.app).get('/api/admin/institutions'));
    expect(r.status).toBe(200);
    const codes = r.body.map((i) => i.code.toUpperCase());
    expect(codes).toContain(TEST_CODE);
  });

  it('provisions a new academy: DB created, migrated, registered, staff seeded', async () => {
    const r = await admin(request(env.app).post('/api/admin/institutions')).send({
      code: 'NEWACAD', name: 'New Academy',
      admin_email: 'head@newacad.com', admin_name: 'Head Teacher', admin_password: 'Password123!'
    });
    expect(r.status).toBe(201);
    expect(r.body.code).toBe('NEWACAD');

    // the seeded staff account can actually log in (proves tenant DB + directory row)
    const login = await request(env.app).post('/api/auth/login')
      .send({ email: 'head@newacad.com', password: 'Password123!' });
    expect(login.status).toBe(200);
    const claim = JSON.parse(Buffer.from(login.body.accessToken.split('.')[1], 'base64').toString());
    expect(claim.tenantCode.toUpperCase()).toBe('NEWACAD');
    expect(claim.role).toBe('staff');

    // it now appears in the list
    const list = await admin(request(env.app).get('/api/admin/institutions'));
    expect(list.body.map((i) => i.code.toUpperCase())).toContain('NEWACAD');
  });

  it('rejects a duplicate code and a bad code', async () => {
    const dup = await admin(request(env.app).post('/api/admin/institutions')).send({
      code: 'NEWACAD', name: 'x', admin_email: 'x@y.com', admin_name: 'x', admin_password: 'Password123!' });
    expect(dup.status).toBe(409);
    const bad = await admin(request(env.app).post('/api/admin/institutions')).send({
      code: 'no spaces!', name: 'x', admin_email: 'a@b.com', admin_name: 'x', admin_password: 'Password123!' });
    expect(bad.status).toBe(400);
  });
});

describe('per-academy config', () => {
  it('reads defaults and updates a whitelisted knob', async () => {
    const get = await admin(request(env.app).get(`/api/admin/institutions/NEWACAD/config`));
    expect(get.status).toBe(200);
    expect(get.body.settings.self_serve_booking_enabled).toBe(true);
    expect(get.body.settings.default_one_on_one_credit_cost).toBe(5);

    const patch = await admin(request(env.app).patch(`/api/admin/institutions/NEWACAD/config`))
      .send({ self_serve_booking_enabled: false, default_one_on_one_credit_cost: 7 });
    expect(patch.status).toBe(200);
    expect(patch.body.settings.self_serve_booking_enabled).toBe(false);
    expect(patch.body.settings.default_one_on_one_credit_cost).toBe(7);

    const reget = await admin(request(env.app).get(`/api/admin/institutions/NEWACAD/config`));
    expect(reget.body.settings.default_one_on_one_credit_cost).toBe(7);
  });

  it('rejects a non-editable or invalid setting', async () => {
    const r = await admin(request(env.app).patch(`/api/admin/institutions/NEWACAD/config`))
      .send({ singleton: false, default_one_on_one_credit_cost: -3 });
    expect(r.status).toBe(400);
  });
});

describe('cross-tenant finance aggregation', () => {
  it('sums payments across every active academy', async () => {
    // seed a student + two payments in the original tenant (the harness tenant
    // only seeds staff user 1, so create a payable student first)
    await env.tenantDb.query(`INSERT INTO users (password_hash, name, email, role) VALUES ('h','Pay Student','pay@t.com','student')`);
    const { rows: [u] } = await env.tenantDb.query(`SELECT user_id FROM users WHERE email='pay@t.com'`);
    await env.tenantDb.query(`INSERT INTO students (student_id, status) VALUES ($1,'enrolled')`, [u.user_id]);
    await env.tenantDb.query(`INSERT INTO payments (student_id, amount, payment_date)
      VALUES ($1, 100.00, CURRENT_DATE), ($1, 50.00, CURRENT_DATE)`, [u.user_id]);
    const r = await admin(request(env.app).get('/api/admin/finance'));
    expect(r.status).toBe(200);
    expect(r.body.grand_total).toBeGreaterThanOrEqual(150);
    expect(r.body.this_month).toBeGreaterThanOrEqual(150);
    const test01 = r.body.academies.find((a) => a.code.toUpperCase() === TEST_CODE);
    expect(test01.total).toBeGreaterThanOrEqual(150);
    // NEWACAD has no payments yet → 0, still listed
    const newacad = r.body.academies.find((a) => a.code.toUpperCase() === 'NEWACAD');
    expect(newacad.total).toBe(0);
  });
});
