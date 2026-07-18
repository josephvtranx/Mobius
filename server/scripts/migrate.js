#!/usr/bin/env node
// Multi-tenant migration runner (MODERNIZATION 5.4, ADR-0002) — replaces the
// old scripts/migrate.sh, which assumed Flyway (never installed, no migration
// files existed). Applies migrations/registry to the registry DB, then
// migrations/tenant to EVERY tenant conn_string in the institutions table.
// node-pg-migrate tracks applied migrations per-database in `pgmigrations`,
// so re-runs are no-ops and a new tenant DB gets the full chain.
//
//   REGISTRY_URL=postgres://… node scripts/migrate.js          # all tenants
//   REGISTRY_URL=… node scripts/migrate.js --only CODE         # one tenant
//   node scripts/migrate.js --dry-run                          # list, don't run
//   node scripts/migrate.js --no-lock    # single-connection DBs (PGlite): skip
//                                        # the advisory lock's extra connection
//
// A failing tenant aborts the run (fail-fast): partially-migrated fleets are
// worse than a stopped run — fix the failing tenant, re-run, the rest resume.
import { runner } from 'node-pg-migrate';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS = path.join(__dirname, '..', 'migrations');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const noLock = args.includes('--no-lock');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;

const REGISTRY_URL = process.env.REGISTRY_URL;
if (!REGISTRY_URL) {
  console.error('REGISTRY_URL is required');
  process.exit(1);
}

// Same SSL posture as the app pools: Azure needs SSL; PGSSLMODE=disable is
// the PGlite/test escape hatch.
const ssl = process.env.PGSSLMODE === 'disable'
  ? false
  : { rejectUnauthorized: false };

async function migrate(name, connectionString, dir) {
  console.log(`\n=== ${name} (${dir}) ===`);
  if (dryRun) {
    console.log('  (dry-run: skipped)');
    return;
  }
  await runner({
    databaseUrl: { connectionString, ssl },
    dir: path.join(MIGRATIONS, dir),
    direction: 'up',
    migrationsTable: 'pgmigrations',
    noLock,
    verbose: false,
    log: (msg) => console.log(`  ${msg}`)
  });
}

await migrate('registry', REGISTRY_URL, 'registry');

const registryClient = new pg.Client({ connectionString: REGISTRY_URL, ssl });
await registryClient.connect();
const { rows: tenants } = await registryClient.query(
  `SELECT code, name, conn_string FROM institutions ORDER BY code`
);
await registryClient.end();

const targets = only ? tenants.filter((t) => t.code === only) : tenants;
if (only && !targets.length) {
  console.error(`No institution with code ${only}`);
  process.exit(1);
}
console.log(`\nTenants: ${targets.map((t) => t.code).join(', ') || '(none)'}`);

for (const t of targets) {
  await migrate(`tenant ${t.code} (${t.name})`, t.conn_string, 'tenant');
}

console.log('\nDone.');
