// Test environment: boots two in-process PGlite instances (registry + one tenant),
// exposes them over TCP via pglite-socket so the real pg pools connect to them,
// loads the real schema files, then imports the real Express app.
//
// No docker/local Postgres required (MODERNIZATION D5 revised: this machine has
// no docker; PGlite is hermetic and works identically in CI).
import { PGlite } from '@electric-sql/pglite';
import { citext } from '@electric-sql/pglite/contrib/citext';
import { btree_gist } from '@electric-sql/pglite/contrib/btree_gist';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import bcrypt from 'bcryptjs';
import net from 'net';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');

// Replay the up-sections of a migration chain in filename order (ADR-0002:
// migrations are the single schema source — schema.sql is gone). Fresh
// ephemeral DBs don't need node-pg-migrate's pgmigrations bookkeeping, and
// db.exec is much faster than driving the wire protocol per migration.
function migrationChainSql(dir) {
  const full = path.join(MIGRATIONS_DIR, dir);
  return readdirSync(full)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => readFileSync(path.join(full, f), 'utf8').split('-- Down Migration')[0])
    .join('\n');
}

export const TEST_CODE = 'TEST01';
export const SEED_USER = {
  email: 'staff@test.com',
  password: 'Password123!',
  name: 'Seed Staff',
  role: 'staff'
};

const freePort = () => new Promise((resolve) => {
  const srv = net.createServer();
  srv.listen(0, '127.0.0.1', () => {
    const { port } = srv.address();
    srv.close(() => resolve(port));
  });
});

async function startPg(migrationsSubdir, extensions) {
  const db = await PGlite.create({ extensions });
  await db.exec(migrationChainSql(migrationsSubdir));
  const port = await freePort();
  const server = new PGLiteSocketServer({ db, port, host: '127.0.0.1' });
  await server.start();
  return { db, server, url: `postgres://test:test@127.0.0.1:${port}/postgres` };
}

// Two-tenant variant for the cross-tenant isolation test: one registry, two
// fully separate tenant DBs (A and B), each with its own login-able staff user
// and its own data. Proves a JWT minted for tenant A can never read/write
// tenant B's rows — the pool resolves per-tenant from the token's tenantCode
// claim, so req.db is physically a different database.
export const TEST_CODE_A = 'TENA01';
export const TEST_CODE_B = 'TENB01';

export async function startTwoTenantEnv() {
  const registry = await startPg('registry', { citext });
  const tenantA = await startPg('tenant', { citext, btree_gist });
  const tenantB = await startPg('tenant', { citext, btree_gist });

  await registry.db.query(
    `INSERT INTO institutions (code, name, conn_string) VALUES ($1,$2,$3),($4,$5,$6)`,
    [TEST_CODE_A, 'Academy A', tenantA.url, TEST_CODE_B, 'Academy B', tenantB.url]
  );

  // Seed one staff user per tenant, with the SAME numeric user_id (1) in both —
  // this is the key trap: if isolation were broken, tenant A's token (userId 1)
  // could read tenant B's user 1. Distinct emails so the directory routes each.
  async function seedStaff(t, email, code) {
    const hash = await bcrypt.hash('Password123!', 10);
    await t.db.query(
      `INSERT INTO users (password_hash, name, email, role) VALUES ($1,$2,$3,'staff')`,
      [hash, `Staff ${code}`, email]
    );
    await t.db.query(`INSERT INTO staff (staff_id, employment_status) VALUES (1, 'full_time')`);
    await registry.db.query(
      `INSERT INTO user_directory (email, password_hash, code) VALUES ($1,$2,$3)`,
      [email, hash, code]
    );
  }
  await seedStaff(tenantA, 'staff-a@test.com', TEST_CODE_A);
  await seedStaff(tenantB, 'staff-b@test.com', TEST_CODE_B);

  process.env.REGISTRY_URL = registry.url;
  process.env.PGSSLMODE = 'disable';
  process.env.RESEND_API_KEY = '';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
  process.env.NODE_ENV = 'test';

  const { default: app } = await import('../../src/app.js');
  const { getTenantPool } = await import('../../src/db/tenantPool.js');
  const { registryPool } = await import('../../src/db/registryPool.js');

  return {
    app,
    getTenantPool,
    tenantADb: tenantA.db,
    tenantBDb: tenantB.db,
    async stop() {
      const pa = await getTenantPool(TEST_CODE_A).catch(() => null);
      const pb = await getTenantPool(TEST_CODE_B).catch(() => null);
      registryPool.on('error', () => {});
      pa?.on('error', () => {});
      pb?.on('error', () => {});
      await new Promise((r) => setTimeout(r, 150));
      await registry.server.stop().catch(() => {});
      await tenantA.server.stop().catch(() => {});
      await tenantB.server.stop().catch(() => {});
      await registryPool.end().catch(() => {});
      if (pa) await pa.end().catch(() => {});
      if (pb) await pb.end().catch(() => {});
      await registry.db.close().catch(() => {});
      await tenantA.db.close().catch(() => {});
      await tenantB.db.close().catch(() => {});
    }
  };
}

export async function startTestEnv() {
  const registry = await startPg('registry', { citext });
  const tenant = await startPg('tenant', { citext, btree_gist });

  await registry.db.query(
    `INSERT INTO institutions (code, name, conn_string) VALUES ($1, $2, $3)`,
    [TEST_CODE, 'Test Academy', tenant.url]
  );

  // seed a login-able staff user (user_id 1 — first identity value)
  const hash = await bcrypt.hash(SEED_USER.password, 10);
  await tenant.db.query(
    `INSERT INTO users (password_hash, name, email, role) VALUES ($1, $2, $3, $4)`,
    [hash, SEED_USER.name, SEED_USER.email, SEED_USER.role]
  );
  await tenant.db.query(`INSERT INTO staff (staff_id, employment_status) VALUES (1, 'full_time')`);
  // registry auth row: email+password locate the institution (no code needed)
  await registry.db.query(
    `INSERT INTO user_directory (email, password_hash, code) VALUES ($1, $2, $3)`,
    [SEED_USER.email, hash, TEST_CODE]
  );
  // seed a platform admin (Mobius employee) — registry-level, same password
  await registry.db.query(
    `INSERT INTO platform_admins (email, password_hash, name) VALUES ($1, $2, $3)`,
    ['admin@mobius.com', hash, 'Mobius Admin']
  );

  // Env must be set BEFORE the app (and thus registryPool) is imported.
  // dotenv.config() never overrides pre-set values, so server/.env stays inert here.
  process.env.REGISTRY_URL = registry.url;
  process.env.PGSSLMODE = 'disable';
  // dotenv would otherwise load the real Resend key from server/.env — tests
  // must NEVER send real email (emailJobs skips when the key is empty)
  process.env.RESEND_API_KEY = '';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
  process.env.NODE_ENV = 'test';

  const { default: app } = await import('../../src/app.js');
  const { getTenantPool } = await import('../../src/db/tenantPool.js');
  const { registryPool } = await import('../../src/db/registryPool.js');
  const { setTenantProvisioner } = await import('../../src/lib/tenantProvisioner.js');

  // Platform-admin provisioning against PGlite: each new academy is a fresh
  // migrated PGlite tenant instance (mirrors production's CREATE DATABASE +
  // migrate). Tracked so stop() tears them down.
  const provisioned = [];
  setTenantProvisioner(async ({ code }) => {
    const t = await startPg('tenant', { citext, btree_gist });
    provisioned.push({ ...t, code });
    return t.url;
  });

  return {
    app,
    getTenantPool,
    tenantDb: tenant.db,     // direct PGlite handle for state assertions
    registryDb: registry.db,
    async stop() {
      const pool = await getTenantPool(TEST_CODE).catch(() => null);
      // Provisioned academies each have their own cached tenant pool; attach an
      // error handler to each so the socket-close on teardown doesn't surface
      // as an uncaught "Connection terminated unexpectedly".
      const provPools = [];
      for (const p of provisioned) {
        const pp = await getTenantPool(p.code).catch(() => null);
        if (pp) { pp.on('error', () => {}); provPools.push(pp); }
      }
      // Stop the wire servers FIRST: pg's Terminate handshake races pglite-socket
      // and throws an uncaught protocol error; a plain socket close is handled
      // by the pools' idle-error path instead. Swallow those error events.
      registryPool.on('error', () => {});
      pool?.on('error', () => {});
      // let in-flight wire messages settle; without this a stray commandComplete
      // can land mid-teardown and throw an uncaught protocol error (flaky ~1/4)
      await new Promise((r) => setTimeout(r, 150));
      await registry.server.stop().catch(() => {});
      await tenant.server.stop().catch(() => {});
      for (const pp of provPools) await pp.end().catch(() => {});
      for (const p of provisioned) {
        await p.server.stop().catch(() => {});
        await p.db.close().catch(() => {});
      }
      await registryPool.end().catch(() => {});
      if (pool) await pool.end().catch(() => {});
      await registry.db.close().catch(() => {});
      await tenant.db.close().catch(() => {});
    }
  };
}
