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
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_DIR = path.join(__dirname, '..', '..', 'src', 'config');

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

async function startPg(schemaFile, extensions) {
  const db = await PGlite.create({ extensions });
  await db.exec(readFileSync(path.join(CONFIG_DIR, schemaFile), 'utf8'));
  const port = await freePort();
  const server = new PGLiteSocketServer({ db, port, host: '127.0.0.1' });
  await server.start();
  return { db, server, url: `postgres://test:test@127.0.0.1:${port}/postgres` };
}

export async function startTestEnv() {
  const registry = await startPg('regestryschema.sql', { citext });
  const tenant = await startPg('schema.sql', { citext, btree_gist });

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

  // Env must be set BEFORE the app (and thus registryPool) is imported.
  // dotenv.config() never overrides pre-set values, so server/.env stays inert here.
  process.env.REGISTRY_URL = registry.url;
  process.env.PGSSLMODE = 'disable';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';
  process.env.NODE_ENV = 'test';

  const { default: app } = await import('../../src/app.js');
  const { getTenantPool } = await import('../../src/db/tenantPool.js');
  const { registryPool } = await import('../../src/db/registryPool.js');

  return {
    app,
    getTenantPool,
    tenantDb: tenant.db,     // direct PGlite handle for state assertions
    registryDb: registry.db,
    async stop() {
      const pool = await getTenantPool(TEST_CODE).catch(() => null);
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
      await registryPool.end().catch(() => {});
      if (pool) await pool.end().catch(() => {});
      await registry.db.close().catch(() => {});
      await tenant.db.close().catch(() => {});
    }
  };
}
