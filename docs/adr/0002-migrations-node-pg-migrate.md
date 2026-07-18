# ADR-0002 — Schema migrations via node-pg-migrate, applied fleet-wide

**Status:** accepted, 2026-07-18 (MODERNIZATION 5.4)

## Context

There was no working migration story: `scripts/migrate.sh` assumed Flyway
(never installed, no migration files ever existed) and schema changes were
hand-applied from `schema.sql`. Per-tenant databases (ADR-0001) make
repeatable migrations a hard requirement — every change must be applied N
times, identically, resumably.

## Decision

**node-pg-migrate**, with plain-SQL migration files, driven by a custom
fleet runner.

- **Layout:** `server/migrations/registry/` and `server/migrations/tenant/`
  hold timestamp-prefixed `.sql` files (`-- Up Migration` /
  `-- Down Migration` sections). The baselines are today's schema v2 and
  registry schema verbatim; `src/config/schema.sql` and
  `regestryschema.sql` are **deleted** — migrations are the single source
  of truth.
- **Runner:** `server/scripts/migrate.js` (`npm run migrate`) migrates the
  registry DB first, then every `conn_string` in `institutions`. Fail-fast:
  a failing tenant aborts the run; fix, re-run, the rest resume (the
  per-database `pgmigrations` table makes re-runs no-ops). Flags: `--only
  CODE`, `--dry-run`, `--no-lock` (single-connection targets like PGlite
  can't serve node-pg-migrate's second advisory-lock connection).
- **Tests:** the PGlite harness replays the up-sections of each chain in
  filename order (`db.exec`, no wire protocol, no bookkeeping table) — the
  suite always runs against exactly what migrations produce.

## Why node-pg-migrate

npm-native (no Java/Go binary), supports raw SQL files (the codebase is
raw SQL everywhere — no ORM buy-in), and exposes a programmatic `runner()`
that makes the loop-over-tenants script trivial. Knex/Prisma were rejected
for dragging in query-builder/ORM worldviews; dbmate for being outside npm
and harder to drive programmatically; Flyway for being a JVM dependency
nobody ever installed.

## Consequences

- Every schema change = a new `.sql` file in the right chain (use
  `npx node-pg-migrate create <name> -j sql -m migrations/tenant`), applied
  everywhere via `npm run migrate`. Never edit an applied migration.
- Migrations are up-only in practice (downs optional); roll forward.
- **Existing production databases are NOT baseline-compatible:** they're on
  schema v1 without a `pgmigrations` table. The v1→v2 production migration
  (data transform or fresh start, plus marking the baseline as applied) is
  its own deliberate task before the runner ever points at prod.
