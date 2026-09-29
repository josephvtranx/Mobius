# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

> This is the **root** guide covering monorepo-wide concerns. Each workspace has its own deeper guide:
> - [`server/AGENTS.md`](server/AGENTS.md) — Express + PostgreSQL API
> - [`client/AGENTS.md`](client/AGENTS.md) — React + Vite SPA

## Overview

Mobius LMS is a **multi-tenant** Learning Management System for tutoring/education institutions. It's a monorepo with two apps plus a root package:

- **Root (`/`)** — orchestration scripts, shared ESLint rules, and the `mobius-lms` package.
- **`server/`** — Express + PostgreSQL API (ES modules, `"type": "module"`).
- **`client/`** — React 18 + Vite SPA.

## Commands

Run from the repo **root** unless noted.

```bash
npm run dev:setup      # First-time setup: installs all deps + copies env templates (setup-dev.cjs)
npm run install:all    # Install root + server + client dependencies
npm run dev            # Run client (Vite, :5173) and server (nodemon, :5001) concurrently
npm run dev:windows    # Same as dev, for Windows shells
npm run dev:server     # Server only
npm run dev:client     # Client only
npm run build          # Install server+client deps, then build the client (server needs no build)
npm start              # Starts server with NODE_ENV=development (current script)
npm --prefix server run start:prod # Starts server with NODE_ENV=production
npm test               # Server tests (vitest + supertest; PGlite-backed — no external DB needed)
npm run lint           # ESLint over the whole repo (Date/moment bans; blocking in CI)
```

Tests live in `server/test/` (13 suites covering auth, tenant isolation, classes, academics, billing, booking, rescheduling, cancellations, guardians, jobs, email, and platform admin). The harness (`server/test/helpers/testEnv.js`) boots in-process PGlite over TCP and replays the real migration chains (`server/migrations/` — the single schema source, ADR-0002). CI: `.github/workflows/ci.yml`.

## Monorepo structure & the `mobius-lms` package

Both `server/package.json` and `client/package.json` declare `"mobius-lms": "file:.."`. The root is an ESM package with `main`/`exports` pointing to `index.js`, exporting `toUtcIso`, `isoToLocal`, and `assertUtcIso`. Both apps import these helpers from `mobius-lms`; keep the shared implementation framework-independent. Client display helpers live in `client/src/lib/timeDisplay.js`.

## Client ↔ server contract (cross-cutting)

**Single credential (MODERNIZATION D7, 2026-07-17):** the JWT carries BOTH identity and tenant — a `tenantCode` claim selects which tenant database the request runs against (`req.db` on the server). There is **no session cookie and no express-session**. Tenant selection is token-driven; database pools are cached in memory by tenant code. Account/tenant deactivation enforcement is incomplete; do not assume pool caching revokes access.

- **Authenticated requests:** `Authorization: Bearer <JWT>` → the middleware verifies it and resolves `req.db` from the `tenantCode` claim.
- **Normal login:** email/password resolves the institution through registry `user_directory`. The client can also send `X-Institution-Code` for legacy header-scoped login; registration remains tenant-scoped. `POST /api/institution {code}` is a stateless validation endpoint. See `authController.js`, `userDirectory.js`, and `client/src/services/authService.js`.
- Refresh tokens carry `tenantCode` too; rotation preserves the tenant.

Without a tenant signal, pre-route `req.db` remains undefined. Normal directory login can resolve a tenant itself; protected tenant routes require a resolvable token. Platform-admin auth is a separate registry-scoped flow. See `server/AGENTS.md`.

Prefer `{ message, errors: [{ field, message }] }` for new validation errors. Existing responses are **not uniform**: message-only, error-only, and fallback `{ error, message }` shapes remain. Client services generally read `err.response.data.message`; preserve compatibility when standardizing errors.

## Time handling (repo-wide enforced convention)

All timestamps crossing the API boundary must be **UTC ISO strings with a `Z` suffix**.

- Root `.eslintrc.json` bans the global `Date` constructor (`Use time.ts helpers instead`) and bans importing `moment`. Use **luxon** (or `date-fns` where already present).
- Helpers: `toUtcIso`, `isoToLocal`, `assertUtcIso` — single implementation in the root `mobius-lms` package (`index.js`), imported as `from 'mobius-lms'` in both apps.
- The server enforces it on input via the `requireUtcIso(fields)` middleware (rejects non-`Z` timestamps with 400). See `server/AGENTS.md`.

## ESLint

- Root `.eslintrc.json` (legacy format) holds the repo-wide `Date`/`moment` bans above.
- `client/eslint.config.js` (flat config) adds React/hooks/react-refresh rules for the client.
- `server/` has no ESLint config of its own.
- Neither child workspace has a `lint` script. Use root `npm run lint`, also run by CI. The client flat config is separate; its plugin dependencies are not all declared in the client manifest.

## Deployment

Deployed on **Render** (`mobius-t071.onrender.com`) with custom domain `mobiusteach.com`. In production the server serves the client's static build (`client/dist`) and handles the SPA catch-all. PostgreSQL is hosted on **Azure**.

## Notes / gotchas

- `server/.env` holds **live credentials** (never committed — gitignored). Do not echo or duplicate them into new files; use `server/.env.example` (placeholders only) when documenting config. **History note (2026-07-18):** an old `server/README.md` revision and `transport.js` leaked the Azure DB password, JWT secret, and Resend key into git history — scrubbed from the tree in d1bd4286, but the values are burned until the user rotates them (Azure/Render/Resend dashboards).
- `AGENTS.md` files are not ignored by the current `.gitignore`; review and commit them if they should be shared. The older `CLAUDE.md` guides are ignored.

## Safe working workflow

- Inspect `git status --short` before edits. Preserve existing uncommitted work; do not reset, stash, or overwrite unrelated changes.
- Never print, copy, or commit real environment secrets. Use placeholder examples for documentation.
- Before starting servers, browser testing, migrations, or jobs, establish that the database and API targets are local/test. Development mode alone does not isolate production data. Do not access or modify production without explicit authorization.
- Prefer the PGlite test harness for backend verification. The runtime entrypoint starts background jobs unless disabled; importing the test app does not start them.
- For client verification, use `npm --prefix client run build` to avoid the dependency installation performed by root `npm run build`.
- For code changes, run relevant tests and root lint; report exactly what passed, failed, or was not run. Documentation-only changes need link/command checks, not an application launch.
- Keep changes focused. Do not deploy, push, or run database migrations as part of an unrelated task.

## Codebase map and current state (2026-08-26)

- Start with `docs/PROJECT_STATUS_2026-08-26.md` for the measured baseline, active work, gaps, and proposed milestones. Re-run checks before relying on its dated results.
- `client/src/App.jsx` owns lazy-loaded routes; `client/src/config/shellNav.js` owns role navigation. Services centralize API calls. CSS tokens and shell styles are in `client/src/css/`.
- `server/src/app.js` assembles middleware/routes; `server/index.js` starts the runtime. Domain logic lives in routes/helpers, jobs in `server/src/jobs/`, schema in the registry/tenant migration chains.
- Product reference: `docs/mobius-spec/00-INDEX.md` and its numbered sections; architectural decisions: `docs/adr/`. Validate historical plans and inventories against source before implementing their backlog items.
- Active local feature work spans student creation/guardian linking, subject matching/enrollment, class/attendance/request screens, credit packages/payment-linked wallet credits, and finance UI. Preserve these existing changes.
- Payments are manual records of money received. Package purchases now grant credits atomically; payment processing, family checkout, and cashout are not thereby implemented. Never invent conversion rates or payment-provider choices.
- Staff settings read exists; configuration writes are platform-admin operations. Production tenant provisioning is deliberately unconfigured; tests inject a PGlite provisioner.
- Latest local checks: 171 tests passed across 13 files; client build passed; root lint failed with 302 errors (295 design/vendor bundle violations, seven application Date violations). This is not a claim of production or browser verification.
- Prioritize access-control/deactivation checks, sensitive request logging, institution-registration routing, usable account activation, and onboarding/payment regression tests. Details and evidence are in the status snapshot.
- Reference bundles (`add student/`, `design_handoff_mobius_apps/`, `ds-bundle/`) are not the app. Root lint currently traverses them; do not fix vendor-generated code or remove safety rules just to make lint green.
