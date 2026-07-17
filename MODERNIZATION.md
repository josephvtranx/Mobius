# MODERNIZATION.md

A phased plan to modernize and optimize the Mobius LMS monorepo **without breaking anything along the way**. Each phase is independently shippable and ordered so that the safety net exists before any risky change.

Risk = chance of breaking prod if done carelessly. Effort = rough size (small ≈ <½ day, medium ≈ 1–2 days, large ≈ 3+ days).

> **Golden rule:** do not start Phase 1+ until Phase 0's characterization tests cover the auth + tenant-resolution paths. Everything below is reversible if those tests are green before and after.

---

## Open decisions (answer these first)

These are the choices only you can make; the phase tasks that depend on them are noted, and I'll finalize those tasks once you've answered. Each has my recommendation marked **(rec)**. Check one box per decision (or write in an alternative).

### D1 — Access-token TTL (gates 2.3)
The token is currently `expiresIn: '120m'` with a stale `// 15 minutes` comment. What's the intended lifetime?
- [x] Keep **120m**, just fix the comment **(rec — lowest risk; no client-flow change)**
- [ ] Shorten to **15m** and rely on the refresh-token flow (requires verifying the client actually calls `/auth/refresh-token`)
- [ ] Other: ______

### D2 — `admin` role registration (gates 2.4) — ✅ RESOLVED
**Decision:** The Mobius "admin" is a **platform-scoped** role (Mobius staff who manage institutions), **not** a tenant role. It moves to the registry as a separate subsystem; the vestigial tenant `admin` role is **removed**. (Original options — out-of-band vs guarded route — are both moot: no tenant `admin` exists at all.)
- Remove `admin` from the tenant `users.role` CHECK (`server/src/config/schema.sql`); existing tenant DBs need an `ALTER ... CHECK` migration (no `role='admin'` rows can exist).
- Repoint the 2 gates to `staff`: `server/src/routes/userRoutes.js` `GET /all` (`authorizeRole('admin')`→`'staff'`) and `server/src/routes/uploadRoutes.js` `/cleanup` (`role !== 'admin'`→`'staff'`).
- Fix `client/src/pages/auth/register/user/RoleSelect.jsx` — the "Admin" tile submits `role:'staff'`; remove the misleading tile.
- **Platform admins** are built as a separate **registry-level** subsystem (new `platform_admins` table, tenant-less login, `scope:'platform'` JWT, institution management + per-institution finance drill-in). Tracked in its own plan; out of scope for Phase 2 cleanup. Aligns with **D7 / Phase 5.3** (JWT-only, no session cookie).
- [x] **Remove the tenant `admin` role; platform admin becomes a registry-scoped subsystem.**

### D3 — Mount `logout` / `change-password` routes (gates 2.5)
Both handlers exist but no route mounts them; `changePassword` is also bugged (missing `db` arg).
- [x] **Fix the bug and mount both** `/auth/change-password` + `/auth/logout` **(rec — they're written, users likely expect them)**
- [ ] Fix the bug only; leave unmounted until there's a UI for them
- [ ] Delete both handlers as dead code (fold into Phase 1)
- [ ] Other: ______

### D4 — Shared `mobius-lms` package language (gates 3.1, 3.4)
- [x] **Plain ESM `.js`**, no build step **(rec — simplest; both apps are already ESM)**
- [ ] **TypeScript** with a `tsup`/`tsc` build + `prepare` script (more upfront setup)
- [ ] Other: ______

### D5 — Test/staging database strategy (gates 0.4, 0.7) — ✅ REVISED 2026-07-17
- [ ] ~~**docker-compose Postgres**~~ (dev machine has no docker/podman/colima)
- [ ] A dedicated **Azure test/staging DB** (closer to prod, but shared state + cost)
- [x] **PGlite over TCP** (`@electric-sql/pglite` + `pglite-socket`): in-process Postgres/WASM exposed on localhost so the real `pg` pools connect unmodified; loads the real schema files; zero external deps, identical locally and in CI. Implemented in `server/test/helpers/testEnv.js`. Limitation: one connection at a time per instance — fine for sequential supertest runs.

### D6 — Tenancy data model (gates 5.1; architectural, can defer)
- [] **Keep per-tenant databases** (current model) and add migration tooling
- [ ] Move to **shared schema with `tenant_id`** row-level scoping
- [x] **Defer** — evaluate later, keep current model for now **(rec — don't block cleanup on this)**
- [ ] Other: ______

### D7 — Session store & credential model (gates 5.2, 5.3)
Today: in-memory `MemoryStore` cookie (tenant) + JWT (identity) — breaks under restart / multi-instance.
- [x] **Embed `tenantCode` in the JWT**, drop the session cookie entirely **(rec — removes MemoryStore *and* the dual-credential complexity)**
- [ ] Keep the cookie but move to a **persistent store** (Postgres/Redis)
- [ ] Defer (accept single-instance limitation for now)
- [ ] Other: ______

### D8 — ESLint enforcement timing (gates 4.5)
Enabling the `new Date()` ban surfaces **54** existing violations in `client/src`.
- [x] Land ESLint **non-blocking now**, fix violations during Phase 4, flip to **blocking** at 4.5 **(rec)**
- [ ] Fix all 54 up front and make it blocking immediately
- [ ] Other: ______

### D9 — Time & calendar library consolidation (gates 5.5, 5.6)
- [x] Standardize time on **luxon**, drop `date-fns`/`moment`; consolidate calendars later **(rec)**
- [ ] Leave library choices as-is
- [ ] Other: ______

### D10 — Registry `conn_string` credential handling (gates 6) — ✅ RESOLVED
The registry stores full tenant PG URLs (credentials) in plaintext. **Decision:** acceptable **pre-launch only**; documented in `regestryschema.sql` and `docs/schema-v2.md`. Revisit (pgcrypto or vault-injected credentials) before production tenants exist.
- [x] **Keep plaintext for now, documented; revisit before launch.**

### D11 — Group-class support in the schema — ✅ RESOLVED
- [x] **Baked in now** (schema v2): `classes.student_limit` + `enrollments` join; sessions no longer hard-code a single student. Decided 2026-07-17 alongside the spec bundle (`docs/mobius-spec/`).

---

## Discovery notes (evidence this plan is built on)

Verified against the current tree (not inferred):

- **No tests** anywhere (`*.test.*`/`*.spec.*` = 0 files), **no CI** (`.github/workflows` absent), **no test deps** (jest/vitest/supertest none), **no in-repo deploy config** (no `render.yaml`/`Dockerfile`/`Procfile` — Render is dashboard-configured).
- **`express-session` uses the default in-memory `MemoryStore`** (`index.js` calls `session({secret,...})` with no `store`). This does not survive restarts and is not shared across Render instances — a scaling/correctness risk directly tied to the tenant cookie.
- Dead code confirmed unreferenced by grep: `src/server.js`, `src/config/db.js`, `src/lib/time.ts`, `src/models/scheduleModel.js`, `src/controllers/scheduleController.js` (also queries **nonexistent tables** `classes`/`class_instructors`/`classrooms`/`class_students`/`students.id`), `src/config/{checkInstructorAvailability,checkSchema,debugSessions}.js`, `src/config/Untitled.png`.
- Duplicated patterns: `BEGIN` transaction boilerplate in **9 files** (mix of controllers *and* route files); Postgres error-code→HTTP mapping copy-pasted in **3 controllers** (`authController`, `staffController`, `studentController`).
- `req.db` threading is otherwise consistent (117 `req.db.query` + 23 `req.db.connect`, no live global-pool import).
- Unused/overlapping deps: server `bcrypt` (native; only `bcryptjs` imported), client `moment` (unimported + ESLint-banned) and `motion` (only `framer-motion` imported); two calendar libs both in use (`react-big-calendar` + `react-calendar`); three time libs shipped (`luxon`, `date-fns`, `moment`).
- ESLint bans `new Date()` repo-wide but it appears **54×** in `client/src` because no `lint` script/CI enforces it.
- **Schema drift (found 2026-07-17, fixed by schema v2):** live code wrote to tables missing from `schema.sql` — `auth_logs` (`middleware/auth.js`, every login attempt) and `password_history` (signup path). `helpers/conflictCheck.js` is unimported dead code querying the legacy `classes` model (→ Phase 1). `scripts/migrate.sh` invokes Flyway but **zero migration files exist** (→ 5.4).
- **Schema v2 landed 2026-07-17** (see Phase 6): greenfield rewrite of `schema.sql`/`regestryschema.sql` against the product spec bundle (`docs/mobius-spec/`, extends the onboarding PDF). Possible because no live DB existed. Server code still targets v1 → Phase 7.

---

## Phase 0 — Safety net (do first)

Goal: be able to refactor with confidence. No production behavior changes.

> **Status 2026-07-17 — largely done.** 0.1–0.6 ✅: vitest+supertest in `server/` (20 characterization tests green: `test/auth.test.js`, `test/tenant.test.js`), PGlite harness (`test/helpers/testEnv.js`, per revised D5), CI at `.github/workflows/ci.yml` (lint non-blocking), root `lint`/`test` scripts (fixed root `.eslintrc.json` — it had no `parserOptions`, so the Date/moment bans had never actually parsed a file; 107 real violations now visible). Enabler refactor: `index.js` split → `src/app.js` exports the app (behavior-preserving; boot smoke-tested). 0.7 partially: `docs/deploy.md` records the dashboard config; **staging environment itself still TODO**. 0.8 ✅ noted in `docs/deploy.md`. CI itself is unverified until the branch is pushed to GitHub.

| # | Task (file-level) | Risk | Effort |
|---|---|---|---|
| 0.1 | Add a test runner + HTTP test dep to `server/` (recommend **vitest + supertest**); add `"test"` script. | low | small |
| 0.2 | Characterization tests for **auth**: `POST /api/institution` (valid/invalid code), `authController.login` (incl. the `!req.db` → 400 guard), `signup` transaction commit **and** rollback, `refreshToken`, `verifyTokenHandler`. Assert current response shapes verbatim (incl. the `token` vs `accessToken` quirk — pin behavior before fixing in Phase 2). | low | medium |
| 0.3 | Characterization tests for **tenant resolution**: `getTenantPool` caching (`Map` reuse), the pre-`/api` middleware attaching `req.db`, and missing-`tenantCode` behavior. Use a disposable tenant DB loaded from `schema.sql`. | medium | medium |
| 0.4 | Spin up a **disposable test tenant DB + registry row** (docker-compose Postgres or an Azure test DB) and a script to load `src/config/schema.sql` + `regestryschema.sql`. Required for 0.2/0.3 to be real. | medium | medium |
| 0.5 | Add **CI** (`.github/workflows/ci.yml`): install → `client` build → server tests → ESLint. Start ESLint **non-blocking** (`continue-on-error`) since 0.7 will surface many violations. | low | small |
| 0.6 | Add `"lint"` scripts (root `eslint .`, `client`, `server`) so the existing `Date`/`moment` bans actually run. Do **not** fail the build yet. | low | small |
| 0.7 | Document a **staging environment** (a staging Render service + staging tenant DB) and capture the currently-dashboard-only env/deploy config into the repo (`render.yaml` or at least `docs/deploy.md`). | medium | medium |
| 0.8 | Note (decision, not fix): flag the `MemoryStore` session risk for Phase 5; ensure tests don't depend on cross-request session persistence beyond a single worker. | low | small |

**Exit criteria:** green CI running auth + tenant tests against a real schema; staging reachable.

---

## Phase 1 — Remove dead code ✅ (done 2026-07-17)

Every item verified unreferenced. Procedure for each: delete → `npm run build` + server boot smoke → Phase 0 tests green → commit individually (easy revert). **All items below landed as individual commits; exit criteria verified (tests 20/20, boot OK, client build OK, `git grep` clean).** 1.7 chose "move": dev scripts now in `server/scripts/dev/`.

| # | Task | Risk | Effort |
|---|---|---|---|
| 1.1 | Delete `server/src/server.js` (duplicate Express app, nothing runs it). Then fix `server/package.json` `"main": "src/server.js"` → `"index.js"`. | low | small |
| 1.2 | Delete `server/src/config/db.js` (legacy global pool, only commented imports reference it). | low | small |
| 1.3 | Remove the 9 commented-out `// import pool from '../config/db.js';` lines (attendance/subject/guardian/studentGuardian/instructor/timePackage routes, `scheduleController`, `passwordHelpers`, `passwordHistoryHelpers`). | low | small |
| 1.4 | Delete `server/src/lib/time.ts` (orphan — all imports use `time.js`; no TS build exists). | low | small |
| 1.5 | Delete `server/src/models/scheduleModel.js` (unimported) and remove the now-empty `models/` dir. | low | small |
| 1.6 | Delete `server/src/controllers/scheduleController.js` — unmounted **and** references several tables absent from `schema.sql` (`classes`, `class_instructors`, `classrooms`, `class_students`, `students.id`). Confirm no route file imports it (none does). | low | small |
| 1.6b | Delete `server/src/helpers/conflictCheck.js` — imported nowhere; queries the same legacy `classes` model. Verify unimported at delete time. | low | small |
| 1.7 | Move `server/src/config/{checkInstructorAvailability,checkSchema,debugSessions}.js` to a `scripts/dev/` dir (or delete); delete stray `server/src/config/Untitled.png`. | low | small |
| 1.8 | Remove unused server dep **`bcrypt`** (native) from `server/package.json`; keep `bcryptjs`. Rebuild lockfile. | low | small |
| 1.9 | Remove unused client deps: **`moment`** (unimported + banned). Verify then remove **`motion`** (only `framer-motion` imported). Rebuild lockfile. | low | small |

**Exit criteria:** build + boot + tests unchanged; `git grep` for each removed symbol returns nothing.

---

## Phase 2 — Fix known bugs & inconsistencies ✅ (done 2026-07-17)

Each fix should add/extend a Phase 0 test that pins the corrected behavior. **All tasks below landed (tests 20 → 27, all green).** Notes: 2.4's RoleSelect tile was *relabeled* to "Staff" rather than deleted (it always submitted staff; staff still need a registration path). 2.7 resolved by adding `token_version` + `password_updated_at` to schema v2 `users`. Signup's staff/instructor inserts were aligned to v2 columns so the 201 path is testable; the student/guardian signup path stays v1-shaped until Phase 7.4.

| # | Task | Risk | Effort |
|---|---|---|---|
| 2.1 | **bcrypt salt rounds:** replace inline `bcrypt.genSalt(10)` in `authController.signup` (line ~148) and `changePassword` (~608) with the shared `authHelpers.hashPassword` (12 rounds). Existing 10-round hashes still verify, so no migration needed. | low | small |
| 2.2 | **Token field naming:** `signup` returns `token: accessToken` while `login` returns `accessToken`. Standardize `signup` on `accessToken`. Confirm no client reads `.data.token` (client `authService.register` ignores it — safe). | low | small |
| 2.3 | **Stale TTL comment/decision:** `authHelpers.generateAccessToken` sets `expiresIn: '120m'` with a `// Short lived - 15 minutes` comment. Decide the real intended TTL; fix the comment and, if shortening, verify the client refresh-token flow actually exercises `/auth/refresh-token`. | low (comment) / medium (if TTL changes) | small |
| 2.4 | **Remove the vestigial tenant `admin` role** (D2 resolved): drop `admin` from the `users.role` CHECK in `schema.sql` (+ `ALTER ... CHECK` migration for existing tenant DBs); repoint the 2 gates to `staff` (`userRoutes.js` `GET /all`, `uploadRoutes.js` `/cleanup`); remove the misleading Admin tile in `RoleSelect.jsx`. Platform admin is handled separately as a registry-scoped subsystem (own plan). | low | small |
| 2.5 | **`changePassword` broken + unrouted:** it calls `checkPasswordHistory(userId, newPassword)` / `addToPasswordHistory(userId, hashedPassword)` missing the leading `db` arg the helpers require, and no route mounts it (nor `logout`). Fix call sites to pass `req.db`, then decide whether to mount `/auth/change-password` and `/auth/logout`. | medium | medium |
| 2.6 | **`signup` leaks an open transaction (found by 0.2 tests):** every early `return` after `BEGIN` (duplicate email, guardian validation) releases the client back to the pool mid-transaction — later queries on that connection run inside the stale tx and can be silently lost. Fix: `ROLLBACK` before early returns (or restructure so `BEGIN` happens after validation). The test harness works around it in `testEnv.stop()`. | medium | small |
| 2.7 | **`logout`/`refreshToken` reference a `token_version` column that exists in no schema.** `refreshToken` survives only because `undefined \|\| 0 === 0`; `logout`'s UPDATE would throw if ever mounted. Either add the column (schema v2 follow-up) or drop the version mechanism. | low | small |

Done during Phase 0 (2026-07-17): removed a never-used `req.db.connect()` checkout in `verifyTokenHandler` (wasted a pooled connection per verify request; found because PGlite's single-connection socket deadlocked on it).

**Exit criteria:** tests assert the fixed shapes/behaviors; no client consumer regressions.

---

## Phase 3 — Consolidate `mobius-lms` into a real shared package

Today `"mobius-lms": "file:.."` is declared in both apps but imported by neither; the time helpers are duplicated (`server/src/lib/time.js` ↔ `client/src/lib/time.js`). Make the root package the single source.

| # | Task | Risk | Effort |
|---|---|---|---|
| 3.1 | Give the root package real entry points: add `index.js` + `"exports"`/`"main"` in root `package.json`, exposing `toUtcIso`, `isoToLocal`, `assertUtcIso` as pure ESM (luxon dep already at root). Keep it framework-agnostic (no node/browser-only APIs). | medium | medium |
| 3.2 | Point the server at it: replace `server/src/lib/time.*` imports with `from 'mobius-lms'`; delete the server copy. Re-run Phase 0 tests. | medium | small |
| 3.3 | Point the client at it: replace `client/src/lib/time.js` imports with `from 'mobius-lms'`; ensure **Vite resolves/optimizes the linked package** (`optimizeDeps`/`server.fs.allow` as needed) and the prod build inlines it. Smoke both dev and `vite build`. | high | medium |
| 3.4 | Decide the JS-vs-TS story for the shared package: recommend **plain ESM `.js`** to avoid adding a build step; if TS is wanted, add a `tsup`/`tsc` build and a `prepare` script. | medium | medium |

**Exit criteria:** one implementation of the time helpers; both apps build and pass tests importing from `mobius-lms`.

---

## Phase 4 — Standardize repeated patterns

Do this after Phase 0 so the many touched write-paths are covered. Highest structural payoff.

| # | Task | Risk | Effort |
|---|---|---|---|
| 4.1 | Add a **`withTransaction(db, fn)`** helper (`connect` → `BEGIN` → `fn(client)` → `COMMIT`/`ROLLBACK` → `release`). Refactor the 9 files doing manual `BEGIN` (`authController`, `instructorController`, and routes: guardian, payment, user, student, classSeries, attendance, timePackage). Migrate one file at a time. | medium | large |
| 4.2 | Add a **`pgErrorToHttp(error)`** util mapping `23505/23503/23502/22P02/23514` → `{status, message, errors}`. Replace the copy-pasted blocks in `authController`, `staffController`, `studentController`. | low | medium |
| 4.3 | Centralize the response error shape (`{ message, errors: [{field,message}] }`) behind the existing error-handler middleware so controllers `throw`/`next(err)` instead of hand-formatting. | medium | medium |
| 4.4 | **Layering consistency:** business logic + transactions currently live inline in 7 route files while other domains use `controllers/`. Move route-embedded logic into matching controllers so `routes/` only wires middleware. Do per-domain, behind tests. | medium | large |
| 4.5 | Enforce conventions now that they're deduped: flip CI ESLint to **blocking** and clear the 54 `new Date()` violations in `client/src` (use the shared time helpers). | medium | medium |

**Exit criteria:** single transaction helper, single error mapper, `routes/` free of inline DB logic, ESLint green and blocking.

---

## Phase 5 — Architecture-level decisions (evaluate, then decide — mostly non-code)

Produce short decision records (`docs/adr/*.md`); implementation, if any, spins off its own plan.

| # | Task | Risk | Effort |
|---|---|---|---|
| 5.1 | **Per-tenant-DB vs shared-schema-with-`tenant_id`.** Evaluate at current + expected scale: N databases ⇒ N migrations, N connection pools, Azure connection-limit pressure, and no migration framework today (just `scripts/migrate.sh` + raw `schema.sql`). Weigh isolation/compliance benefits vs operational cost. Decide and document. | high | large |
| 5.2 | **Session store.** `express-session` uses in-memory `MemoryStore` behind `trust proxy` on Render — lost on restart, not shared across instances, so the tenant cookie breaks under horizontal scaling. Decide: move to a persistent store (e.g. Postgres/Redis) **or** eliminate the cookie by embedding `tenantCode` in the JWT (see 5.3). | high | medium |
| 5.3 | **Dual-credential complexity (cookie tenant + JWT identity).** Evaluate collapsing to a single credential by putting the tenant in the JWT claims — removes `withCredentials`/CORS-credentials and the session store entirely, at the cost of re-issuing tokens on tenant switch. Decide. | high | large |
| 5.4 | **Migration tooling.** Adopt a real migration tool (node-pg-migrate/Knex/Prisma-migrate) to make per-tenant schema changes repeatable — a prerequisite for whatever 5.1 decides. | medium | medium |
| 5.5 | **Time-library sprawl.** Standardize on one library (luxon, given the existing helpers) across both apps; drop `date-fns`/`moment` usage. Feeds the Phase 4.5 lint enforcement. | low | medium |
| 5.6 | **Calendar-library overlap.** Two libs in use (`react-big-calendar` + `react-calendar` in `CalendarWidget`); decide whether to consolidate. | low | medium |

---

## Phase 6 — Schema v2 ✅ (landed 2026-07-17)

Full design + rationale: [`docs/schema-v2.md`](docs/schema-v2.md). Product spec: [`docs/mobius-spec/`](docs/mobius-spec/).

Greenfield rewrite of `server/src/config/schema.sql` + `regestryschema.sql` (no live DB existed): classes/enrollments (group classes, D11), per-student credit wallets + attendance-driven ledger, guardian logins + `student_guardians`, session notes, reschedule/hold state machines, policy-knob registry, staff tasks, notification log — plus the drift fix (`auth_logs`, `password_history`) and the hardening set (FK indexes, exclusion constraints, CHECKs, citext, `NUMERIC(10,2)`, RESTRICT on money paths).

**Consequences for other phases:**
- **0.4** — the test DB must load schema **v2**; note the server's live query paths still target v1 tables until Phase 7, so characterization tests for class/attendance domains should wait for their Phase 7 rewrite (auth/tenant tests are unaffected — `users`/`auth_logs` are v2-compatible).
- **2.4** — the `admin` role CHECK removal is already done in v2; only the two route gates + `RoleSelect.jsx` remain.
- **5.4** — migration tooling baselines on v2 as V1; no live-DB migration path needed.

## Phase 7 — Spec implementation (server/client alignment to v2)

The schema now leads the code. Each domain below is its own work package against `docs/mobius-spec/`; all follow the Phase 0 test-first rule. Order roughly: SCH → BIL → RSC → GRD → ACA → jobs.

| # | Domain | Spec file | Core surface |
|---|---|---|---|
| 7.1 | Scheduling & classes (SCH-1…6) | `03` | class CRUD, session materialization, enrollment gates, catalog, self-serve booking |
| 7.2 | Billing & wallet (BIL-1…3) | `04` | deduction engine, credit gates, low-balance lifecycle, price changes |
| 7.3 | Reschedules & cancellations (RSC-1…5) | `07` | the Window, atomic swap, holds, capability matrix |
| 7.4 | Guardians & accounts (GRD-1…5) | `05` | guardian login/portal, multi-child, purchasing rights |
| 7.5 | Academic layer (ACA-1…4) | `06` | attendance+notes surface, locks, completion dashboards |
| 7.6 | Notifications & background jobs | `08` | notification service, sweeper/generator/auto-completer/scanner jobs, dashboard signals |

Open items riding along: `ASSUMPTION[ONBOARDING-§8]` reconciliation when the onboarding PDF lands; Top-Up spec (`ASSUMPTION[TOPUP]`) for purchases/bundles + KR-REFUND statutory cash-out (`BIL-OPEN-1`).

## Suggested sequencing

Phase 0 → 1 → 2 can proceed back-to-back (low risk, high cleanup value). Phase 3 and 4 both depend on the Phase 0 net and are independent of each other. Phase 5 decisions (esp. 5.1/5.2/5.3) should be made **before** investing in 4.4/4.5, since they can change the request/DB model those refactors touch. Phase 6 is **done**; Phase 7 domains should follow the Phase 0 safety net and can interleave with Phases 3–4 (7.x rewrites supersede some 4.4 moves — don't refactor a controller Phase 7 is about to replace).
