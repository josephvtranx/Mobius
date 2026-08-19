# Mobius LMS — Complete Codebase Inventory (2026-08-15)

Multi-tenant Learning Management System for tutoring academies. Express 4 + PostgreSQL API,
React 18 + Vite SPA, one physical database per tenant, JWT-only auth. ~23k LOC JS/JSX,
7.2k CSS, 857 lines SQL, 209 commits.

---

## 1. FEATURES (user-facing, by domain)

### Auth & accounts
- **Single-step email+password login that locates the tenant** — no institution-code entry; a global registry directory (`user_directory`, email as CITEXT PK) resolves email→tenant, authenticates against the registry hash, then loads the tenant profile row (`authController.login`, registry-first with legacy header fallback).
- **Role-dispatched registration** — student / instructor / staff forms with role-specific validator sets chosen at runtime (`roleBasedValidation`); students carry repeatable guardian sub-forms.
- **Guardian auto-provisioning at student signup** — each guardian becomes a first-class login (`role='guardian'`) with a system-generated temp password, deduped by email; first link becomes primary; cross-DB registry writes tracked for compensating rollback.
- **KR-adulthood purchasing rule** — `can_purchase` derived in SQL from `date_of_birth` (≥19, zero guardians) for Korean civil-law chargeback risk.
- **Password lifecycle** — strength policy + last-5 reuse prevention (`passwordHistoryHelpers`, bcrypt-compares stored hashes), change-password syncs tenant + registry hashes, `token_version` bump kills all refresh tokens on logout/change.
- **Refresh rotation with tenant continuity** — refresh tokens carry `{userId, version, tenantCode}`; the refresh controller resolves its own pool from the claim; client interceptor does one silent refresh-and-retry with a shared promise coalescing concurrent 401s.
- **Institution workspace request** — public form emails a formatted lead to the platform owner (Resend).

### Scheduling & classes
- **Unified class model** — everything (weekly group series, biweekly, one-off 1:1 bookings) is a `classes` row; a one-off is `recurrence='none'` with one session (spec: "all things start with a class entity").
- **Class creation with session materialization** (SCH-1) — staff create a class and the recurrence engine (`helpers/recurrence.js`, Luxon) materializes every `class_sessions` row up front, holding local wall-clock time across DST; instructor must be actively qualified (`instructor_specialties` checked in code, not just FK).
- **Triple-layered double-booking defense** (INV-3) — pre-checks in `slotFinder.instructorFree` for friendly errors, then a partial unique index on `(instructor_id, starts_at)`, then `btree_gist EXCLUDE` constraints over `tstzrange` for instructor AND room — catching variable-duration overlaps the exact-start index can't. Races surface as 23P01/23505 → 409 "refresh and pick another time".
- **Three-gate enrollment** (SCH-2) — seat → room-capacity → credit-runway, all in one transaction with `SELECT … FOR UPDATE` on the class row so concurrent adds can't both pass the seat cap; distinct failure codes (`CLASS_FULL`, `ROOM_CAPACITY` + conflict list, `INSUFFICIENT_CREDITS` + shortfall math).
- **Request-to-join catalog** (SCH-3) — students/guardians request, staff resolve; full classes waitlist (`is_waitlist`); approval re-runs the full gate sequence atomically with the status flip.
- **Self-serve 1:1 booking** (SCH-4) — knob-gated; credit gate runs BEFORE the TTL slot hold so unfunded requests reserve nothing; creates a `status='pending'` class invisible to every gate until the instructor accepts (activate + materialize + best-fit room inside the tx) or rejects (dissolve the never-active class).
- **Reschedule as atomic swap** (RSC-1, the flagship flow) — student picks from instructor's real open slots; a TTL hold + request are created and the original session stays on the calendar (`reschedule_requested`, INV-2) until the instructor accepts: original → terminal `moved`, successor session inserted carrying `rescheduled_from` + a `reschedule_chain` JSONB history; zero credit movement. Instructor silence → TTL escalation to staff; Window close → lazy hard-stop expiry.
- **Cancellation matrix** (RSC-2/3/5) — student/guardian cancel inside "The Window" forfeits the credit and files an appeal-review staff task; instructor cancel requires a reason and auto-refunds; staff cancel bypasses the Window; leave-class can't launder a late cancel (RSC-4 anti-loophole: in-Window sessions marked `cancelled_late` unless staff waive).
- **Open-slots computation** — weekly availability materialized in academy timezone minus busy sessions, active holds, time off, AND an all-rooms-busy sweep (+1/−1 interval counting): a slot with no free room is never advertised.
- **Series schedule change** (SCH-5) — future-only, effective-dated; deletes future sessions using the OLD rule's timezone for date comparison, re-materializes under the new rule, rolls back on conflict.
- **Rolling-horizon session generator** — nightly job extends open-ended classes to the horizon knob; each occurrence inserts under its own `SAVEPOINT` so a calendar-race loser is skipped without losing the batch.
- **Instructor availability management** — weekly click-to-toggle grid (cells where they teach are locked), staff-side batch editor with preview blocks + date-windowed patterns, ad-hoc unavailability ranges; overlap prevented by a gist EXCLUDE over `(day, daterange, tsrange)` built by projecting TIME onto a fixed epoch date.
- **Weekly calendar UIs** — hand-built CSS-grid week views (no calendar library): student schedule (64px/hour, absolutely positioned blocks, status palette, week paging that re-queries a UTC range endpoint) and staff person-search scheduling view.

### Attendance & academics
- **One-pass attendance + notes** (ACA-1) — bulk endpoint takes `{marks:[{student_id, status, note?}]}`; role-gated status sets (instructors: present/absent; staff add excusals + cancellation statuses); partial success semantics — engine failures collect while the rest commit; notes never block money.
- **Attendance drives billing** (INV-1, the linchpin) — see billing; UI shows a live consequence line ("3 absences — billed 15 credits") before saving.
- **Auto-complete job** — unmarked sessions past the knob hours are marked present-with-`auto_completed` flag, one tx per session, deduped `auto_complete_verify` staff task; floor-blocked students stay unmarked and retry next run.
- **Versioned session notes** (INV-5) — template fields all optional by design (mandatory ⇒ "good job 👍 ×40"); edits append the prior payload to a `versions` JSONB array, never overwrite; portals see an "edited" stamp + timestamps, raw versions are staff-only.
- **Record lock + unlock workflow** (ACA-4) — attendance and notes share a lock window (`session_record_lock_days`); a nightly job stamps `locked_at`; corrections past it require an instructor unlock request → staff task → 48h unlock window (a FUTURE `locked_at`) that auto-relocks.
- **Student record timeline** (ACA-2) — drives off `attendance UNION notes` CTE so an orphan note still surfaces; noteless entries still show subject/class (deliberate no-shame empty state).
- **Note-completion report** (ACA-3) — per-instructor/per-class rates over a trailing window plus a drill-down of every unnoted (session, student) pair.

### Billing, wallets & payments
- **Per-student prepaid credit wallets — never pooled across a family** (explicit product decision); balance is a cache, the append-only signed `credit_ledger` is authoritative; INV-1 enforced by a CHECK: deductions/refunds must carry an `attendance_id`.
- **Net-effect correction engine** (`deductionEngine.applyAttendanceWithinTx`) — `delta = desiredNet − Σ(prior entries for this attendance)`, so correction chains converge exactly across price changes with history only appended; wallet locked `FOR UPDATE`; grace-floor breach returns `ATTENDANCE_BLOCKED` writing nothing so a post-top-up retry is a clean first mark.
- **Grace → blocked lifecycle without stored state** — negative balance to a knob floor is allowed; crossing negative fires one urgent family notice + one deduped delinquency staff task; "blocked" is computed from balance so it can't drift; billing never unenrolls anyone (INV-6 — enforced by the deliberate absence of any trigger).
- **Effective-dated pricing** (BIL-3/INV-4) — future-only `class_price_history`; every deduction resolves price at the session's own start time; families notified once per change; a daily sync keeps the class's display price in step.
- **Committed/available runway math** — `walletMath.computeWallet` computes committed as Σ price-at-start of future scheduled sessions (bounded by the runway knob for open-ended classes via `LEFT JOIN LATERAL … LIMIT CASE`), available = balance − committed.
- **Manual payments & invoicing** — record-money-received ledger (deliberately no processor yet: no dollars↔credits rate exists, so nothing is fabricated); invoices with partial payments via an `invoice_payments` junction (one payment can span invoices); **`overdue` derived at read time** with a CASE expression so no cron keeps it honest.
- **Staff wallet adjustments** — reason-chipped manual entries restricted to `purchase|bonus|adjustment` (deduction/refund/cashout rejected, citing INV-1 and the pending Top-Up spec); topping up past zero auto-closes the delinquency task.

### Payroll & finance reporting
- **Preview-then-run payroll** — `computePayrollPreview` shared by both so they cannot drift; part-time instructor pay = hourly rate × Σ completed-session hours; salaried staff flat; hourly staff explicitly excluded-with-reason (no clock-in feature — refusing to fabricate); re-running a period skips already-paid people rather than double-paying.
- **Financial dashboard** — revenue MTD, monthly income bucketing (client-side into a pre-seeded month map so empty months render), payroll cost by user type, delinquency queue.
- **Ops reports dashboard** — instructor cancel rate (60d), pending auto-complete verifications, serial movers (≥3 reschedules/30d), open-task aging by kind.

### Students, guardians & roster
- **Guardian portal** (GRD-1) — per-child cards: wallet with status flags, next sessions, last feedback, needs-attention (payment links + low balance using the same predicate as the scanner), recent notifications.
- **Guardian linking** (GRD-2) — staff link-or-create from the roster; existing guardians linked as-is with no new credentials; exactly-one-primary enforced by a partial unique index; make-primary is a clear-then-set transaction.
- **Per-guardian notification prefs** (GRD-5) — `all` / `billing_only` / `digest` JSONB per link; urgent events are unmutable; students get billing events only when `can_purchase`.
- **Rosters** — sortable/expandable student, instructor, and staff grids; filter chips derived from real data; instructor roster (largest page, 1.4k lines) embeds pay/subject-assignment editing and both availability editors.
- **Report an absence** — guardian modal with reason chips writing `cancel_reason/cancel_note`, money effect branched in the success copy.

### Messaging & notifications
- **Relationship-gated DMs** — staff↔anyone; instructor↔student/guardian only with a real teaching relationship derived from enrollments (including `pending` bookings, so booking-only families can reach their instructor); no instructor↔instructor; contacts computed by one UNION query per role.
- **Per-class announcement threads** — one thread per class (partial unique index); posting is instructor-of-class/staff; readership derived from enrollment at read time so roster changes need zero participant bookkeeping; unread tracked by upserted `last_read_at`.
- **Safeguarding tier** (researched against ParentSquare/Bloomz/Classroom patterns) — staff can read any thread; guardians see children's DM threads read-only ("via Alice" rows) without touching the child's read state; no delete endpoints exist anywhere — the log is permanent.
- **Polling messenger UI** — 320px thread rail + conversation pane; conversations poll 15s, open thread 5s; unread badge propagates to the sidebar rail.
- **Notification service** (INV-7) — every automated side-effect writes a `notification_log` row; in-app bell (30s poll, 11 event types humanized) + queued email channel drained by a 5-minute job through an injectable transport (single attempt, failed rows stay visible, no retry storms).

### Staff operations
- **Unified task inbox** — 9 task kinds (join/leave requests, delinquency, reschedule/booking escalations, termination requests, auto-complete verify, note unlocks, appeals) each with icon/sentence/deep-link; resolving dispatches a window event so the sidebar badge updates without navigation.
- **Membership request resolution** — approve/reject with seat impact shown; leave-approval exposes the `waive_window` checkbox.
- **Enrollment wizard** — 3-step modal (student+subject → smart-match instructors filtered by real qualifications with per-candidate open-slot fan-out → confirm), also seedable from the scheduling page for existing students.

### Platform admin (Mobius employees)
- **Separate auth realm** — registry `platform_admins`, JWT carries `isPlatformAdmin` and deliberately NO `tenantCode` (so `req.db` never resolves — a tenant token can't reach `/api/admin` and vice versa); 120-min token, no refresh, `?expired=1` UX.
- **One-click tenant provisioning** — create + migrate a fresh database, register code→conn-string in the registry, seed first staff login + directory row; codes normalized uppercase, case-insensitively unique, format-checked at DB and API.
- **Cross-tenant finance console** — per-academy monthly revenue series, hand-rolled SVG bezier trend chart with 6-month pan windows, multi-select academy filter, per-academy tooltips; suspended academies listed-but-excluded from totals; unreachable tenant DBs degrade to flagged rows instead of failing the call.
- **Whitelisted config editor** — 15 policy knobs per academy, server-driven (`editable[]` decides what renders), draft-based PATCH of changed keys only, column names built from the whitelist never request keys (explicit SQL-injection defense).

---

## 2. ARCHITECTURE DECISIONS

1. **Monorepo with a real shared package** — root `mobius-lms` is pure-ESM, framework-agnostic (runs under Express and Vite), consumed as `file:..` by both apps; exports exactly the three time helpers so there is ONE implementation, not mirrored copies.
2. **Database-per-tenant multi-tenancy** (ADR-0001) — no `tenant_id` column anywhere; the connection IS the scope. Registry DB maps `institutions.code → conn_string`; `getTenantPool(code)` lazily builds and caches `pg.Pool`s in a Map. Isolation failure modes are structural, not query-discipline: a missed WHERE can't leak because the other tenant's rows are in another database. Offboarding = drop one DB. ADR names explicit revisit triggers (~100+ tenants, connection exhaustion).
3. **Single-credential auth (decision "D7")** — the JWT carries identity AND tenant (`tenantCode` claim); no cookies, no express-session, no server-side session state (restart/scale-safe). One global middleware resolves `req.db` from the verified claim; pre-auth requests use an `X-Institution-Code` header. Every failure path leaves `req.db` undefined → uniform 400/401.
4. **Registry-first login** — the registry (`user_directory`) is the auth source; the tenant `users` row is just the profile. This is what made "no institution code at login" possible, and it forces global email uniqueness — which the signup path enforces with compensating rollback because cross-DB writes aren't atomic (accepted pre-launch, documented).
5. **Two disjoint auth realms** — `authenticateToken` (tenant) vs `authenticatePlatformAdmin` (registry) are separate middleware with mutually exclusive claim requirements; the client mirrors this with a separate axios instance and localStorage keys.
6. **UTC-Z as a repo-wide contract** — every timestamp crossing the API is a UTC ISO string with Z suffix. Enforced three ways: ESLint bans the `Date` global and `moment` imports repo-wide (one sanctioned disable in the bridge helper), `requireUtcIso` middleware 400s violating bodies, Luxon everywhere for math (wall-clock-preserving recurrence across DST).
7. **Constraints as documentation** — business invariants live in the schema: INV-1 is a CHECK on `credit_ledger`; one-active-enrollment / one-primary-guardian / one-active-hold / one-announcement-thread are partial unique indexes; double-booking is gist EXCLUDE constraints; INV-6 is the deliberate ABSENCE of any auto-unenroll trigger.
8. **Hybrid key strategy with written rationale** — INT identity for people/money (keeps JWT code stable), UUID for spec domain entities, BIGINT identity for append-only logs; TEXT+CHECK instead of Postgres enums (cheaper to evolve).
9. **Append-only + compensating entries** — ledger corrections, note edits (`versions` JSONB), reschedules (`reschedule_chain`), attendance corrections (`adjusted_from`) never rewrite history.
10. **Derive, don't restate** — grace/blocked state, committed balance, invoice `overdue`, dashboard rates, class-thread membership, contact lists: all computed at read time so they can't drift. Documented as a design principle in the schema doc and the client derive helpers.
11. **House transaction/error grammar** — `withTransaction` wrapper (replaced ~25 hand-rolled copies) with composable `*WithinTx` helpers taking the caller's client; `HttpError` for early-return-by-throw inside transactions; `pgErrorToHttp` as the single pg-code→HTTP map with per-callsite overrides; `isCalendarConflict` as the single race test; uniform `{message, errors:[{field,message}]}` validation shape.
12. **Helpers receive `db` as the first argument** — never import a pool; this convention is what keeps tenancy from leaking into business logic.
13. **Dependency-injection seams instead of env branches** — tenant provisioning (`setTenantProvisioner`: PGlite in test/sandbox, loud error in unwired prod) and email delivery (injectable `send`) are seams, keeping `src/` free of `NODE_ENV` forks.
14. **Client: no state library, deliberately** — local `useState` + 23 domain service modules + localStorage; cross-component sync via window events (`profile-updated`, `staff-tasks-changed`) and the `storage` event; polling (5s/15s/30s tiers) instead of websockets. Route-level `React.lazy` splits replaced one ~800KB bundle ("a student never downloads staff code").
15. **Role theming via CSS custom properties** — one shell (`SideNav`/`Header`/`ProfileCard`) parameterized by `.app-shell--{teal|indigo|orange|mauve}` palettes (~20 vars each); nav structure per role in one config (`shellNav.js`) with breadcrumb overrides; `#modal-root` sits inside the themed div so portaled modals inherit the palette.
16. **Multi-tenant job scheduler** — 9 jobs in 4 cadence groups; each tick iterates active tenants from the registry with per-tenant/per-job failure containment and re-entry guards; every job takes `(db, now)` with `now` as a SQL parameter (never `CURRENT_TIMESTAMP`) — the design choice that makes time-dependent job tests deterministic on PGlite.
17. **Honest-stub discipline** — code refuses to fabricate missing business decisions and says so: no dollars↔credits conversion, hourly staff excluded from payroll with a reason, `cashout` 400s pending spec, `custom` recurrence throws, prod provisioning fails loudly. Product gaps are tagged in comments (`ASSUMPTION[TOPUP]`, `BIL-OPEN-1`).
18. **Spec-traceable code** — user stories and invariants from the 9-file spec bundle (SCH-*, RSC-*, BIL-*, GRD-*, ACA-*, INV-1..7) appear as comment references at their enforcement sites; three successive self-audits (gap audit → feature-gap map → prod-readiness goal) each correct their predecessor with file:line evidence.

---

## 3. UNDER-THE-HOOD WORK

- **Hermetic integration test harness** (`test/helpers/testEnv.js`) — in-process Postgres via PGlite exposed over a real TCP socket (`pglite-socket`) so the production `pg.Pool` path runs unchanged; replays the actual migration chains as the schema source; loads `citext` + `btree_gist` so the real exclusion constraints exist under test; injects a PGlite tenant provisioner so even platform-admin provisioning is tested end-to-end with zero cloud infra; `startTwoTenantEnv` seeds two tenants with the SAME user_id 1 as a deliberate isolation trap; teardown sequence documented to the level of a specific 1-in-4 protocol-race flake it fixes.
- **165 tests / 13 files (~3.6k lines)** — characterization tests for auth and tenant resolution; deep suites for billing (clock-shifting fixtures that stay green as real time passes), scheduling gates, reschedule swaps, cancellations, bookings, academics, guardians, jobs (scheduler ticks driven without timers), messaging-adjacent email delivery, admin provisioning, and cross-tenant isolation verified against raw DB handles, not just HTTP.
- **Multi-tenant migration runner** (`scripts/migrate.js`) — node-pg-migrate over plain SQL (ADR-0002); registry first, then every tenant conn-string sequentially, fail-fast; `--only CODE`, `--dry-run`, `--no-lock` flags; per-DB bookkeeping makes re-runs no-ops and new tenants get the full chain.
- **A 27-index FK audit migration** — found 34 unindexed FK child columns (Postgres doesn't auto-index them); added covering indexes in two tiers with partial `WHERE NOT NULL` forms, explicitly skipping tiny tables where write cost outweighs benefit.
- **Middleware stack** (order is load-bearing): trust-proxy → CORS (env-split allowlists + `*.mobiusteach.com` suffix matching, no credentials) → parsers → rate limits (auth-specific then general, test-skipped) → tenant resolution → request logging → health (503 on unreachable registry) → routers (v2 mounted before legacy v1 on shared prefixes) → static SPA + catch-all → error handler.
- **Validation layers** — express-validator chains + `validateRequest`; runtime role-dispatched signup validation; `requireUtcIso` for bodies + `assertZ` for query params; shared `UUID_RE` so bad ids 404 instead of 500 (22P02); pagination hard ceilings everywhere (500/200/50 tiers, 60-day slot ranges, 365-day report windows).
- **Demo sandbox** (`scripts/dev/sandbox.js`) — boots the real app on the PGlite stack with a full seeded academy (6 logins across all roles, classes, sessions, wallets, availability) and prints a login card; jobs disabled and pool serialized for PGlite's single connection; data resets each restart.
- **CI with zero external services** — Node 20, triple-lockfile npm cache, install → client build → full PGlite-backed test suite → blocking lint; no Postgres container, no secrets.
- **Deployment** — Render web service serves API + built SPA + catch-all from one process; Azure Flexible Postgres hosts registry + tenant DBs; `REGISTRY_URL` is the ONLY database URL in the environment (tenant URLs are data); boot fails fast on missing `JWT_SECRET`/`REGISTRY_URL`; custom domain with subdomain-wildcard CORS.
- **Email queue** — Resend behind a lazily-constructed client; `{skipped:true}` without a key so dev/test/sandbox structurally cannot send; delivery drained from `notification_log` in batches of 50, single-attempt with visible `failed` rows.
- **Design system** — token sheet (status/subject palettes, spacing/radius scales), 646-line shell stylesheet driven by per-role CSS variables, shared `hm-*` card/button/list vocabulary, per-family stylesheets; `index.css` deliberately trimmed from a 2200-line monolith to a reset, with the collision post-mortem in the file comment.
- **Docs as engineering artifacts** — 2 ADRs with revisit triggers, a schema-v2 rationale doc mapping each invariant to its enforcement layer, a 9-file locked spec bundle, three self-correcting audits, an academy-code naming policy, and a prod-readiness goal doc with an explicit "needs a business decision, do not guess" section.

---

## 4. NUMBERS

| Metric | Count |
|---|---|
| Express endpoints | **126** across 27 route files |
| React components | **64** `.jsx` files (51 pages + 13 shared components) |
| Client service modules | 23 |
| Database tables | **48** (45 tenant + 3 registry) |
| Migrations | 7 (5 tenant + 2 registry), 857 lines SQL |
| Roles in the access model | **5** actor types: student, guardian, instructor, staff (tenant) + platform admin (registry) — plus derived capability tiers (self / linked-guardian / staff via `canActForStudent`; oversight readers in messaging) |
| Tests | **165** across 13 files (~3.6k lines), all on in-process PGlite |
| Background jobs | 9 jobs in 4 cadence groups (minute / 5-min / hourly / daily) |
| Server helpers / middleware / controllers | 15 / 6 / 4 |
| Policy knobs | 17 columns in `institution_settings` (15 admin-editable) |
| Cross-cutting invariants | 7 (INV-1..7), each traceable to its enforcement site |
| Codebase size | ~23.2k LOC JS/JSX + 7.2k CSS; 209 commits |

---

## 5. INTERVIEW-STORY SHORTLIST

1. **"How do you isolate tenants?"** → database-per-tenant with a registry, JWT-carried tenant claim resolving a cached pool per request, and a two-tenant test that seeds the same user_id in both DBs to prove a leak is impossible — verified against raw DB handles.
2. **"Hardest concurrency problem?"** → double-booking: pre-checks for UX, partial unique index for exact starts, gist EXCLUDE over time ranges for variable durations, savepoint-per-occurrence in the nightly generator so race losers don't kill the batch.
3. **"A correctness system you're proud of?"** → the billing engine: append-only signed ledger with a CHECK that money only moves on attendance, net-effect correction math that converges across price changes, and a grace/blocked lifecycle computed (never stored) so it can't drift.
4. **"Testing story?"** → full integration suite with zero external dependencies: in-process Postgres over TCP running the real migrations and real exclusion constraints, injectable clock (`now` as a SQL param) making job tests deterministic, clock-shifting billing fixtures that never rot.
5. **"A product-thinking decision?"** → messaging paradigm research (DM vs email vs Slack models across Canvas/Classroom/ParentSquare) landing on relationship-gated DMs + derived-membership class announcements + a guardian/staff safeguarding read tier with an immutable log.
6. **"Timezone handling?"** → a repo-wide UTC-Z contract enforced by ESLint (the `Date` global is banned), a 3-function shared package, middleware rejection at the API edge, and DST-aware recurrence that deletes future sessions using the OLD rule's timezone during schedule changes.
