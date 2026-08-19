# Production-readiness goal prompt

This document is a self-contained `/goal` prompt for Claude — copy the
content below the divider into the `/goal` UI command (or hand this whole
file to a fresh agent) to work through it. It's grounded entirely in real
findings from this codebase, not generic checklist boilerplate.

---

Mobius LMS is a multi-tenant Learning Management System for tutoring/education
academies: Express + PostgreSQL API (ES modules, server/), React 18 + Vite SPA
(client/), monorepo root with a shared `mobius-lms` package (time helpers:
toUtcIso/isoToLocal/assertUtcIso). Read the three CLAUDE.md files first
(root, server/, client/) — they document the architecture in full detail
(D7 single-credential JWT+tenantCode auth model, no session cookies;
per-tenant Postgres databases via a registry DB; node-pg-migrate for schema,
migrations are the single source of truth; the UTC-Z timestamp convention
enforced by ESLint and requireUtcIso middleware).

GOAL: work through the real production-readiness backlog below. Everything
in it is grounded in an actual gap found in this codebase — nothing here is
generic checklist boilerplate. Treat it as a punch list, not a rigid order:
use judgment on sequencing, but respect the "needs a decision" items below —
never guess on those.

## Phase A: Full-stack correctness & optimization audit (frontend + backend + schema)

Do this section first, and A1 before anything else in the whole goal — it's
about whether what already exists is *correct and efficient*, not about
missing features or unclicked buttons (those come in Phase 0 and the
backlog below).

### A1. Backend authentication/authorization coverage — START HERE, confirmed real bugs

Counted `authenticateToken` usages across every file in server/src/routes/.
Two files have ZERO:

- **instructorRoutes.js — completely unauthenticated.** Every route (GET
  /roster, GET /, GET /:id, POST /, PUT /:id, POST/GET/PUT/DELETE
  availability, GET/POST/DELETE unavailability) has no auth middleware at
  all, not even a router-level `router.use(authenticateToken)`. Anyone who
  sends a valid X-Institution-Code header (no login, no JWT) can read every
  instructor's name/email/phone, create instructor records, or modify
  availability. Fix: add `router.use(authenticateToken)` at the top (match
  the pattern in studentRoutes.js/guardianRoutes.js line 8-ish) and add
  `authorizeRole('staff')` on the mutating routes (POST/PUT/DELETE) — read
  the file to confirm which reads should stay open to any authenticated
  role vs. staff-only.
- **subjectRoutes.js — completely unauthenticated.** Same issue: GET/POST/
  PUT/DELETE subjects, POST/DELETE instructor-subject assignment, all with
  zero auth. Same fix pattern.

This is a live production security hole (the app is deployed at
mobius-t071.onrender.com) — fix and verify (a 401 with no token, a 403 for
a non-staff token on mutating routes, and normal function restored for a
real staff token) before doing anything else in this audit.

Then, as a general practice for every other route file (even the ones that
already show nonzero authenticateToken counts): confirm every individual
route has the *correct* role restriction, not just *some* auth — e.g. a
route requiring only authenticateToken when it should also require
authorizeRole('staff') is still a real authorization bug, just a subtler
one than "no auth at all." registerInstitution.js legitimately has zero
auth (it's the pre-login registration-request flow) — that one's correct
as-is, don't "fix" it.

### A2. SQL injection / query-construction audit

Grep every route/helper file for SQL built via template-literal string
interpolation of request input (`` `...${req.body.x}...` ``) rather than
parameterized placeholders ($1, $2, ...). The codebase's established
pattern is 100% parameterized queries — confirm there are truly zero
exceptions, not just "the ones I happened to look at."

### A3. N+1 query patterns and missing pagination

- Known existing N+1 pattern (already commented as intentional/accepted
  in the code, worth revisiting): the staff Home dashboard
  (client/src/pages/Home.jsx) and Attendance.jsx both fetch a list of
  classes, then do `Promise.all(classes.map(c => classService.getClass(c.id)))`
  — one request per class instead of one batched request. Fine at seed-
  data scale, a real problem once a tenant has 50+ active classes. Look
  for a batch endpoint opportunity (e.g. an endpoint that returns classes
  with their sessions in one query) and audit for more instances of this
  same pattern elsewhere (roster pages, reports).
- Check every "list everything" endpoint (GET /students, GET /instructors,
  GET /classes, etc.) for a LIMIT/pagination — several newer endpoints
  built this session added one (payrollRoutes LIMIT 200, paymentRoutes
  LIMIT 500) but the older, original list endpoints (studentRoutes.js,
  instructorRoutes.js) return every row with no limit at all. Not urgent
  at current data volumes, but a real scalability gap as tenants grow —
  add pagination or at least a sane LIMIT with a documented ceiling.

### A4. Schema audit

- Confirm every foreign-key column in the baseline migration
  (server/migrations/tenant/1784358546915_baseline-schema-v2.sql) has a
  supporting index — Postgres does NOT auto-index FK columns, only the
  referenced (usually primary-key) side. Cross-reference the FK list
  against the CREATE INDEX statements and flag any gap, especially on
  tables likely to grow large (class_sessions, session_attendance,
  credit_ledger, notification_log).
- Spot-check CHECK/NOT NULL constraints against what the application
  layer actually assumes is always present — flag any place server code
  handles "what if this is null" for a column the schema doesn't actually
  allow to be null (dead code) or vice versa (a real gap where null could
  slip through and break something downstream).

### A5. Frontend performance

- Every production build this session has printed: "Some chunks are
  larger than 500 kB after minification" (main bundle ~800KB). There is
  currently zero code-splitting — every route's code ships in one bundle
  regardless of role or page. Implement route-based lazy loading
  (`React.lazy`/`Suspense`) at minimum for the big route groups (staff
  operations pages, financial dashboard, registration flows) so a student
  logging in doesn't download staff-only code.
- Audit list-heavy pages (roster tables, session lists, the Scheduling
  week-grid, Messages thread list) for missing `key` props, unnecessary
  re-renders from inline function/object literals passed to child
  components in tight loops, and redundant re-fetching of the same data
  across sibling components on one page.

### Verification for Phase A
- A1: write a quick manual check (curl or a short script) proving both
  fixed route files now 401 with no token and 403 with a wrong role,
  then confirm normal staff functionality still works via sandbox
  click-through. This is the highest-value verification in the whole
  goal — a real security hole closing.
- A3/A4: no visual verification needed, but re-run `npm test` after any
  index/query change to confirm nothing regresses.
- A5: re-run the production build and confirm the bundle-size warning
  either disappears or the largest chunk shrinks meaningfully; spot-check
  that lazy-loaded routes still render correctly (no blank screens from
  a missed Suspense boundary).

## Phase 0: Full functional QA sweep (every role × every real page × every interactive element)

Do this after Phase A — it's how new entries get added to this list. Use
claude-in-chrome against the sandbox (`node server/scripts/dev/sandbox.js`;
demo accounts below). Walk each role's ACTUAL nav tree (pulled directly
from client/src/config/shellNav.js, not assumed):

- Student (alice@demo.com): Home (/home), My schedule
  (/family/students/:id/schedule), My classes (/family/students/:id/classes),
  Class catalog (/catalog), Messages (/messages), Feedback
  (/family/students/:id/record), Settings (/profile).
- Guardian (grace@demo.com): My children (/portal), Class catalog (/catalog),
  Messages (/messages), Settings (/profile) — plus each child card's own
  links to Schedule/Progress/Billing/Requests (/family/students/:id/...).
- Instructor (instructor@demo.com): Today (/home), My schedule
  (/operations/schedule), My classes (/instructor/classes), Inbox (/inbox),
  Feedback (/instructor/feedback), Messages (/messages), Availability
  (/instructor/availability), Pay (/instructor/pay).
- Staff (staff@test.com): Dashboard (/home), Task inbox
  (/operations/tasks — currently unbuilt, see below), Messages (/messages),
  Settings (/profile), Scheduling (/operations/scheduling), Attendance
  (/operations/attendance), Roster (Student/Instructor/Staff/Class
  sub-pages under /operations/roster/*), Classes (/operations/classes),
  Requests (/operations/requests), Financial dashboard (Overview/Income
  breakdown/Cost breakdown/Payments under /operations/finance/*), Wallets
  (/operations/wallets), Payroll (/operations/payroll), Reports
  (/operations/reports).
- Plus cross-cutting pages outside the nav: Login, the four registration
  flows (institution, role-select, student/instructor/staff), password
  reset, the landing page, Unauthorized, the class-detail page, the
  take-attendance page, the enrollment wizard modal (all its steps), and
  the reschedule-request flow.

For every page: click every button, link, filter, tab, and form submit —
not just load it and eyeball it. Catalog findings into exactly one bucket
(don't blur them together):
1. Dead/broken — onClick does nothing, throws a console error, or a form
   submit silently fails. Always a bug, fix directly.
2. Unbuilt route — nav links to a path with no matching route in App.jsx
   (falls through to the /home catch-all). Confirmed example:
   /operations/tasks (Task inbox — see below).
3. Stale honest stub that should now be real — a page correctly says "not
   available yet" but the backend it's waiting on now actually exists
   (this happened repeatedly already — payroll, payments, rooms all went
   from stub to real once someone checked). Verify the backend really is
   there before rebuilding; don't assume from the stub's wording alone.
4. Genuinely still blocked — the stub is accurate; the real blocker
   (Top-Up spec, a processor decision, etc.) still applies. Leave as-is.

Produce a findings doc (role → page → bucket → specifics) as you go; it
feeds directly into prioritizing everything below.

## Working discipline (read before touching anything)

- Real data only. Never fabricate numbers, statuses, or demo content.
  Before assuming a feature needs new schema, check whether the tables
  already exist unused — this happened repeatedly already (payroll, rooms,
  payments/invoicing, staff_tasks all pre-existed with zero API against
  them). Grep the baseline migration
  (server/migrations/tenant/1784358546915_baseline-schema-v2.sql) first.
- Verify everything twice. After any change: (1) `npm test` from server/ —
  compare the failure count against baseline before you started (there
  were 17 pre-existing failures as of this writing — see below — do not
  assume 0 is the baseline). (2) Live sandbox click-through via
  claude-in-chrome: `node server/scripts/dev/sandbox.js` boots a real
  server against in-memory PGlite with seeded demo accounts (password
  Password123! for all): staff@test.com, instructor@demo.com,
  alice@demo.com, ben@demo.com, charlie@demo.com, grace@demo.com. The
  client dev server (vite, :5173) may already be running — check with
  `lsof -i :5173` before starting a new one. Log out before switching roles.
- Match the design source exactly for UI work, don't eyeball it. Mockups
  live in .design-handoff/design_handoff_mobius_apps/ (gitignored, already
  extracted) — .dc.html files per role (Student/Instructor/Staff) plus an
  auth/ folder. When a mockup and the live app disagree, read the mockup's
  actual HTML/inline styles rather than guessing from a screenshot.
- Commit each finished, verified piece separately with a descriptive
  message explaining why, not just what — end each with "Co-Authored-By:
  Claude <noreply@anthropic.com>". Never bundle unrelated fixes into one
  commit.
- Stop and ask rather than guess on: real money movement or a
  payment-processor choice, credential rotation, any production
  infra/deploy change, destructive DB operations, or anything below marked
  "needs a decision."

## 1. Feature gaps (docs/client-ui-plan.md — read this file in full first)

- Staff: unified task inbox is linked in the sidebar nav (with a badge
  count) but the route/page don't exist. staff_tasks has 9 real `kind`
  values (see the CHECK constraint in the baseline migration); 5 of them
  (auto_complete_verify, reschedule_escalation, booking_escalation,
  appeal_review, instructor_termination_request) have ZERO code path that
  ever resolves them anywhere in the app — they'd stay open forever.
  join_request/leave_request tasks never close even though the real
  approve/decline flow (/operations/requests, server classRoutes.js POST
  /membership-requests/:id/resolve) already resolves the underlying
  request — fix that bug too. No generic list or resolve endpoint exists
  yet (only reportRoutes.js's /dashboard aggregate counts). Build:
  GET /api/staff-tasks (list, staff-only), a resolve endpoint, fix the 5
  orphaned kinds' resolve paths, fix the join/leave-request non-closure
  bug, and a real inbox page with per-kind icon/label/deep-link
  (join/leave → /operations/requests, delinquent_balance →
  /operations/wallets, reschedule/booking escalation →
  /operations/scheduling, instructor_termination_request → the class
  detail page, the rest → the relevant session/attendance screen).
- Staff: settings/policy-knobs editor for institution_settings — needs a
  decision on which knobs are actually staff-editable (see section 2).
- Staff: guardian-linking UI on the student profile page.
- Instructor: session cancel with a required reason (student side already
  has this — cancel_reason/cancel_note columns on session_attendance,
  server/src/routes/sessionRoutes.js CANCEL_REASONS — mirror that pattern
  for instructor-initiated cancellations if the business rule should be
  the same; confirm the reasons list with the user if it should differ).
- Instructor: "request unlock" affordance for locked session notes (the
  server endpoint already exists — POST
  /:id/notes/:studentId/unlock-request — only the UI trigger is missing).
- Instructor: availability editor.
- Instructor Inbox has a raw JSON.stringify notices bug — find it and
  render the notice content properly instead of dumping raw JSON.
- Student: own wallet/ledger page — GET /api/wallets/:id already exists
  and is used elsewhere (GuardianBilling.jsx is a close real-data
  reference implementation); students just don't have their own page yet.
- Cross-role: notifications bell + in-app feed. notification_log already
  exists and is populated by many flows (wallet credits, price changes,
  schedule changes, low balance, etc.) — a real, ready data source with
  zero UI against it.
- Cross-role: a shared UI kit (Button/Card/Badge/EmptyState components) —
  a refactor of existing repeated markup patterns (hm-btn, hm-card,
  hm-empty classes already exist in CSS; this is about extracting real
  React components), not new functionality. Confirm timing with the user
  before investing time here (see section 2).

## 2. Explicitly parked — NEEDS A DECISION, do not guess

- Everything gated on a "Top-Up spec" referenced repeatedly in
  docs/client-ui-plan.md and docs/mobius-spec/00-INDEX.md's ASSUMPTION
  registry, but that document does not exist anywhere in this repo.
  Blocked: guardian top-up/purchase UI, payment_links (the table exists,
  unused), any real dollar-per-credit pricing rule (there is currently NO
  conversion rate anywhere between dollars and credits — wallets store
  integer credits, payments store dollars, nothing links them), package
  payment collection in
  client/src/pages/operations/classes/EnrollmentWizard.jsx. Ask the user
  for the actual pricing/business rule before building any of this —
  inventing a rate would be fabricated business logic.
- Actual payment collection (a real processor — Stripe et al. — for
  payment_links "collect now"/emailed-link charging). The
  payments.provider/provider_ref columns exist as placeholders. Real
  infra/business decision (fees, PCI scope, account setup) — the user
  must choose the provider, not the agent.
- Staff settings/policy-knobs editor — confirm which institution_settings
  columns should actually be staff-editable before building the form.
- Shared UI kit timing — confirm this is wanted now vs. deferred, since it
  touches many files for no new user-facing functionality.
- Operating expenses / full P&L — operating_expenses and financial_periods
  tables exist, unused, tied to a pa_codes concept whose real-world
  meaning (cost center? department? location?) isn't yet understood — ask
  the user what a pa_code represents before building against it. Cost
  Breakdown currently shows payroll cost only, honestly labeled as such.
- Per-subject revenue breakdown — not derivable from the current payments
  schema (payments aren't tied to a class/subject, only a student). Needs
  either a schema change or an accepted approximation — ask first.
- Hourly (part-time) staff pay — excluded from payroll because there's no
  clock-in/out feature generating real time_logs data. Building
  clock-in/out is a real, schedulable feature if wanted — ask before
  starting since it's a genuinely new capability, not a gap-fill.
- Kakao notification channel — needs a real delivery integration
  (notification_log already has a 'kakao' channel value reserved).
- Trial classes — explicitly deferred to v1.1 in the plan doc.
- Homework/gradebooks — explicitly out of v1 scope.
- Academics mock pages (client/src/pages/academics/ — check what's left
  after this session's dead-page cleanup) — undecided whether to delete
  the remainder or build them out; ask.
- No staging environment exists (flagged in both MODERNIZATION.md and
  docs/deploy.md) — every deploy currently goes straight to the
  production Render service. Setting one up is an infra decision (new
  Render service, env var duplication) — confirm before creating billable
  infrastructure.
- No i18n/localization anywhere — all UI strings are hardcoded English
  throughout, despite the Kakao notification channel and the
  Korea-specific BIL-OPEN-1 compliance flag both suggesting a Korean
  market. Internationalizing the whole client is a large undertaking (new
  dependency, extracting every hardcoded string) — confirm this is
  actually wanted, and for which languages, before starting.
- No Terms of Service / Privacy Policy pages, no acceptance step in
  registration. The agent cannot write real legal text — this needs the
  user (or their counsel) to supply actual ToS/privacy content; building
  the page/acceptance-checkbox plumbing is easy once real text exists.

## 3. Known bugs / technical debt to fix directly (no decision needed)

- 17 pre-existing test failures in server/test/classes.test.js and
  server/test/billing.test.js. Root cause: both files hardcode absolute
  2026 calendar dates in fixtures; as real wall-clock time passes those
  dates, real business logic re-evaluates differently than the tests
  expect — INV-4 future-only checks (schedule/price changes must be
  future-dated), session_record_lock_days deadline checks on live
  attendance corrections, the wallet "committed" math (which only counts
  future-scheduled sessions), and runPriceSync's effective-date window
  all silently flip behavior as today's date advances. Fix: replace every
  hardcoded date literal with an offset from a dynamically-computed
  anchor (e.g. DateTime.now()-relative, or for classes.test.js
  specifically a Monday computed 3+ weeks in the future to give INV-4 and
  the credit-gate "only count future sessions" math enough headroom),
  preserving every exact relative day-offset and (for classes.test.js's
  recurrence-rule tests) weekday alignment between fixtures so the
  existing assertions (exact session counts, exact removed/created
  counts) stay correct. classes.test.js's rewrite was roughly half-done
  as of this writing (the BASE_MONDAY-relative helper pattern was worked
  out but not fully applied); billing.test.js hasn't been started — note
  billing.test.js's job-function calls (runAutoComplete, runRecordLock,
  runLowBalanceScan with an explicit `now` argument) use an explicit
  simulated clock and don't need to change relationally to each other,
  only relative to a new real-time-anchored base, while price-route INV-4
  checks, runPriceSync (no override param), and live HTTP
  attendance-correction calls (session_record_lock_days) genuinely depend
  on real wall-clock time and need the fixture's session dates moved to
  be genuinely near "now" for those specific assertions to hold. Verify
  with `npm test` reaching 0 failures, and sanity-check the fix is
  genuinely date-independent (e.g. mentally advance "today" by a month
  and confirm the relative math still holds), not coincidentally passing
  only today.
- Phase 5.5 (MODERNIZATION.md): drop date-fns/moment from package.json,
  consolidate all date handling onto luxon (root ESLint already bans raw
  Date/moment imports — this is just removing the now-unused dependencies
  and any remaining call sites).
- Phase 5.6: react-big-calendar and react-calendar are both
  installed/used — check if either is now dead weight given
  Scheduling.jsx has a real hand-built week-grid calendar (built this
  session, client/src/pages/operations/Scheduling.jsx) with no
  calendar-library dependency; consolidate onto one or remove both if
  truly unused.
- bookingRoutes.js: the open-slots "all rooms busy" subtraction logic is
  marked deferred in a code comment — read it and finish it.
- classRoutes.js: SCH-4 self-serve booking is marked deferred;
  leave-requests are currently approved manually by staff rather than
  auto-processing on the effective date — read the comment near line 372
  and decide if this is still the intended behavior or should be
  automated.
- File upload path mismatch (real, live bug): server/src/middleware/
  upload.js saves to path.join(__dirname, '../../uploads') →
  server/uploads/, but app.js's static route serves from
  path.join(__dirname, 'uploads') → server/src/uploads/ (which doesn't
  exist on disk at all — confirmed). Every uploaded profile picture
  404s. Fix by pointing one at the other consistently. Upload validation
  itself (mimetype allowlist, 5MB limit, server-generated filenames) is
  otherwise solid — the only related nit is mimetype is trusted from the
  client header, not verified by file content, if stricter validation is
  ever wanted.
- No client-side error boundary — no ErrorBoundary/componentDidCatch
  anywhere in client/src/. Any component throw currently white-screens
  the whole app with no recovery UI. Add one wrapping the app root with a
  plain "something went wrong, reload" fallback.
- No silent token refresh — authService.refreshToken() already exists
  and calls the real POST /auth/refresh-token endpoint, but
  client/src/services/api.js's response interceptor never calls it — any
  401 immediately clears storage and hard-redirects to /login. With a
  120-minute access-token TTL this means users get abruptly logged out
  mid-work instead of a transparent refresh. Wire the interceptor to
  attempt one refresh-and-retry before giving up and redirecting.
- No cross-tenant data-isolation test — grepped server/test/, none
  exists verifying tenant A's JWT truly cannot read/write tenant B's
  data. The isolation mechanism itself (server/src/db/tenantPool.js,
  pools cached in a Map keyed by tenant code) looks correct on
  inspection, but this is currently an untested invariant for a
  multi-tenant app holding real institutions' data — worth a real test,
  not just code-reading confidence.
- No /health endpoint — nothing in app.js/index.js for Render/uptime
  monitoring to hit. Add a plain GET /health returning 200 (and ideally
  a quick registry-DB ping) — cheap, no ambiguity.
- No startup env-var validation — index.js only defaults PORT and reads
  NODE_ENV/JOBS_DISABLED; nothing fails fast if JWT_SECRET, REGISTRY_URL,
  or RESEND_API_KEY are missing at boot. Add a startup check that fails
  loudly instead of misbehaving later.

## 4. Security — do not silently attempt to fix, but DO flag loudly

- The Azure DB password, JWT secret, and Resend API key leaked into git
  history (scrubbed from the tree in commit d1bd4286, but the values
  themselves are compromised) and have NOT been rotated per the root
  CLAUDE.md history note. This is a hard blocker for real production use
  with real user data. Rotating these requires the user to act in the
  Azure/Render/Resend dashboards directly — the agent cannot do this.
  Remind the user clearly and do not proceed to treat the app as
  production-safe until they confirm rotation is done.
- Only auth endpoints have rate limiting (authLimiter in
  server/src/middleware/auth.js) — no general API rate limiting exists.
  Flag this; adding broad rate limiting is reasonable to implement
  directly (low risk), but confirm reasonable limits with the user first
  since overly aggressive limits could break legitimate staff bulk
  actions.

## 5. Infra / operations gaps (real, found by direct check — not present)

- No error-monitoring/APM tool anywhere (no Sentry or equivalent in any
  package.json) — errors currently only go to console logs on Render.
  Worth setting up if the user wants real production visibility — ask
  first since it means adding a new external service dependency.
- No documented backup strategy for the Azure-hosted Postgres data — ask
  the user what (if anything) Azure already provides automatically
  before assuming this needs new work.
- Email sends (server/src/email/transport.js, Resend) have no retry
  logic on transient failure — the one call site (institution
  registration) does catch and surface failures rather than swallowing
  them silently, so this is a minor resilience gap, not a silent-failure
  bug. Low priority.
- Migration safety was checked and is fine: server/scripts/migrate.js
  has real --dry-run and --only CODE (single-tenant) flags. No explicit
  multi-tenant rollback orchestration, but node-pg-migrate's per-tenant
  down-migration is available directly if ever needed.
- **Production tenant provisioning is not wired (deferred 2026-08-12 —
  do at dev→prod transition).** The admin console's "Provision a new
  academy" works end-to-end in the sandbox (PGlite provisioner injected
  via the src/lib/tenantProvisioner.js seam) but fails loudly on Render:
  no production implementation is registered. The designed fix is small
  and agreed: (1) new Azure provisioner file — connect to the server's
  maintenance DB via a new `TENANT_PROVISION_URL` env var (role with
  CREATEDB), `CREATE DATABASE "mobius_<code>"` (code is regex-validated;
  lowercase, `-`→`_`), run node-pg-migrate's `runner()` with
  migrations/tenant against it, DROP DATABASE on migration failure so
  retries aren't blocked, return the conn string; (2) index.js registers
  it only when `TENANT_PROVISION_URL` is set (dev/test keep PGlite);
  (3) raise adminService's 15s axios timeout for the provision call to
  ~2min (real CREATE DATABASE + migration replay is slow). Known
  accepted risks: seed-step failure after registration leaves a staffless
  academy (manual fix: delete registry row); Azure max_connections is
  shared across all tenant pools — revisit tier/pool sizing as the fleet
  grows. Until wired, provisioning a real academy = manually create the
  Azure DB, run `npm run migrate`, insert the registry row.

## 6. Compliance (flagged, not urgent)

- BIL-OPEN-1 in the spec docs: a Korea statutory refund cash-out
  requirement, explicitly tracked as "must not forget" but not blocking
  v1. Leave as-is unless the user raises it.

## Suggested starting order (not rigid — use judgment)

1. Phase A1 — the two unauthenticated route files. Fix this before
   anything else; it's a live security hole, not a backlog item.
2. Rest of Phase A (A2-A5) — correctness/performance audit.
3. Phase 0 (the full QA sweep) — it will surface real findings that
   reshape priority on everything else, and is likely to turn up items
   not on this list at all.
4. The file-upload path mismatch — a one-line-ish fix for a bug that's
   live right now (broken profile pictures).
5. The 17 test failures — cheapest, already half-diagnosed, pure
   technical debt with zero product ambiguity.
6. Task Inbox — fully scoped, real feature, the 5-orphaned-kinds bug and
   the join/leave-request non-closure bug are concrete and
   well-understood.
7. Small, no-decision-needed hardening: client error boundary, silent
   token refresh, a /health endpoint, startup env-var validation, a
   cross-tenant isolation test. Each is small and independent — order
   among them doesn't matter.
8. Instructor Inbox JSON.stringify bug, "request unlock" UI trigger,
   student wallet page, notifications bell — small, well-understood,
   each backed by an endpoint that already exists.
9. Phase 5.5/5.6 dependency cleanup — mechanical, low-risk.
10. Everything else in section 2 — stop and surface the specific
    question to the user before starting any of it.

Check in with the user periodically with a short status update on what's
done and verified, rather than going silent for the whole run.
