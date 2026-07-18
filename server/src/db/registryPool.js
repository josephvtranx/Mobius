import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// PGSSLMODE=disable is set by the test harness (local PGlite socket, no TLS);
// production (Azure) keeps the permissive-SSL default.
const ssl = process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false };

export const registryPool = new pg.Pool({
  connectionString: process.env.REGISTRY_URL,   // points to mobius_registry
  ssl,
  // PG_POOL_MAX=1 for PGlite-backed sandboxes (single-connection socket)
  ...(process.env.PG_POOL_MAX ? { max: Number(process.env.PG_POOL_MAX) } : {})
});