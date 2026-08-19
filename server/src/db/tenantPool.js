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
    ssl,
    // PG_POOL_MAX=1 serializes all queries through one connection — required
    // for PGlite-backed sandboxes (its socket serves one connection at a time;
    // extra connects hang). Unset in production (pg default: 10).
    ...(process.env.PG_POOL_MAX ? { max: Number(process.env.PG_POOL_MAX) } : {})
  });
  tenantPools.set(code, pool);
  return pool;
}

// Drop a cached pool (academy deletion): end its connections and forget it,
// so a stale pool can never serve requests for a deregistered tenant.
export async function evictTenantPool(code) {
  const pool = tenantPools.get(code);
  if (!pool) return;
  tenantPools.delete(code);
  await pool.end().catch(() => {});
}