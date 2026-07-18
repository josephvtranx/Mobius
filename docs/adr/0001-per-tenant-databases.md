# ADR-0001 — Stay with per-tenant databases

**Status:** accepted, 2026-07-18 (MODERNIZATION 5.1)

## Context

Mobius is multi-tenant: a registry DB maps each institution `code` to a
`conn_string`, and every institution has its own PostgreSQL database holding
the full app schema. MODERNIZATION 5.1 asked whether to keep this or move to
a single shared database with a `tenant_id` column on every table.

## Decision

**Keep one database per tenant.** The registry → `conn_string` → lazy pool
cache model stands.

## Rationale

- The entire v2 stack assumes it: tenant resolution via the JWT `tenantCode`
  claim (D7), `req.db` pools, the PGlite test harness, all 142 tests, and
  every query in the Phase 7 server — none carry a `tenant_id`. Switching
  means altering ~40 tables and every query, with cross-tenant data leaks as
  the failure mode of any missed WHERE clause.
- Shared-schema wins at thousands-of-tiny-tenants scale. A tutoring-academy
  LMS realistically serves tens of institutions; one Azure PostgreSQL server
  hosts that many databases comfortably, and pools are created lazily so
  connection pressure tracks *active* tenants.
- Isolation is a product feature for schools: per-tenant backup/restore/
  export, and offboarding = drop one database.
- The genuine cost — N databases means N schema migrations — is addressed by
  the fleet migration runner (ADR-0002).

## Revisit triggers

Reopen this decision if any of these become true:

- ~100+ active tenants (operational + connection-limit pressure)
- connection exhaustion on Azure despite per-pool `max` tuning
- fleet migration runs become slow/fragile enough to gate releases
- a product need for live cross-tenant queries (analytics would get a
  read-side warehouse before we'd merge the OLTP databases)

## Consequences

- Every schema change ships as a migration applied to every tenant DB +
  the registry (ADR-0002; `npm run migrate` in `server/`).
- Tenant onboarding = create the database, insert the registry row, run the
  migration script (it fast-forwards new DBs through the full chain).
- Helpers keep taking `db`/`client` as their first argument — that discipline
  is what keeps tenancy from leaking into module state.
