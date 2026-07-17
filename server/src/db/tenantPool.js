import pg from 'pg';
import { registryPool } from './registryPool.js';

const tenantPools = new Map();          // code → pg.Pool

// PGSSLMODE=disable is set by the test harness (local PGlite socket, no TLS);
// production (Azure) keeps the permissive-SSL default.
const ssl = process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false };

export async function getTenantPool(code) {
  if (tenantPools.has(code)) return tenantPools.get(code);

  const { rows } = await registryPool.query(
    'SELECT conn_string FROM institutions WHERE code = $1',
    [code]
  );
  if (!rows.length) throw new Error('Institution code not found');

  const pool = new pg.Pool({
    connectionString: rows[0].conn_string,
    ssl
  });
  tenantPools.set(code, pool);
  return pool;
} 