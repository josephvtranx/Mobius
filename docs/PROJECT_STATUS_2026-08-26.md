# Mobius project status and next-step plan

Snapshot: 2026-08-26, local working tree, including uncommitted work.

## Where the project stands

Mobius is a substantial implemented application undergoing workflow completion and hardening, not a new scaffold. The shared time package, tenant routing, schema-v2 scheduling/billing model, role-specific UI, and isolated backend test harness are in place. This scan does **not** establish production readiness.

Scope: repository-wide inventory of application sources, route/service wiring, migrations, tests, scripts, CI, and historical plans; closer inspection of authentication, onboarding, finance, current diffs, and known gaps. This is not a line-by-line security audit or an every-button browser QA pass. Dependencies, generated assets, and design bundles were treated as supporting material rather than application implementations. No production access, deployment, database migration command, or browser session was performed.

## Verified local baseline

- `npm test`: **171 passed, 13 test files**, exit 0. Tests use ephemeral PGlite databases and replay migrations. Run duration: 32.54 seconds.
- `npm --prefix client run build`: **passed**, exit 0. Largest emitted JS chunk: main, 364.92 kB (117.28 kB gzip). Route splitting is already implemented.
- `npm run lint`: **failed**, exit 1, **302 errors**. Of these, **295** are in imported design/vendor bundles and **7** are in application files. Counts describe this local checkout, not necessarily the files present in CI.
- Application lint errors: `client/src/pages/Messages.jsx` (1), `client/src/pages/admin/ConfigEditor.jsx` (1), `client/src/pages/operations/Payroll.jsx` (1), `server/src/routes/messageRoutes.js` (2), `server/src/routes/payrollRoutes.js` (2). These are restricted `Date` uses.
- Source inventory: 102 client JS/JSX files (16,490 lines), 69 server source JS files (9,281 lines), 13 test suites plus one harness, six tenant SQL migrations and two registry SQL migrations. Counts exclude CSS, assets, dependencies, and generated output.
- At scan start: 35 tracked files modified, with 2,269 insertions and 678 deletions; additional untracked files include new features and agent guides. These changes predate this scan and were preserved.

Passing backend tests and a successful bundle do not establish complete UI wiring, payment correctness, or authorization coverage.

## Implemented feature map

### Shared foundation

- Root `index.js`: framework-independent Luxon UTC helpers, imported by both apps as `mobius-lms`.
- `server/src/app.js`: Express app assembly and tenant routing; `server/index.js`: runtime listener and jobs.
- Registry database: institution directory, global user login directory, platform administrators. Each tenant has a separate database, not a shared tenant-id schema.
- Normal login uses email/password via `user_directory`. Legacy header-scoped login remains. Authenticated tenant requests carry a JWT with `tenantCode`.
- `client/src/App.jsx` lazy-loads role-specific pages; `shellNav.js` defines navigation. Platform administration is distinct from tenant staff.

### Academics and scheduling

- Class creation, catalog, enrollment, membership requests, recurrence changes, price history, ending and termination have server routes and UI surfaces.
- Attendance, cancellation, rescheduling, notes/versioning/locks, booking, slot search, and scheduled jobs have domain implementations.
- Dedicated student, guardian, instructor, and staff pages exist. Staff scheduling and family workflows still need scenario-based browser verification.
- Main implementation anchors: `classRoutes.js`, `sessionRoutes.js`, `bookingRoutes.js`, `rescheduleRoutes.js`, `slotFinder.js`, `deductionEngine.js`, and `client/src/pages/operations/classes/`.

### People and onboarding — active local work

- `NewStudentModal.jsx` creates a student and optionally links a guardian. It deliberately directs enrollment and payment to separate pages; it is not a completed all-in-one onboarding wizard.
- `AddSubjectModal.jsx` handles group-class selection/waitlisting and private-lesson matching/creation/enrollment. `onboardingService.js` calls the new staff student endpoint, settings read, guardian linking, and instructor match endpoint.
- Student, instructor, staff, and class roster pages exist. The instructor roster remains a large component (1,406 lines); refactor only after behavior has regression coverage.
- Design handoff directories are references, not evidence that their screens/workflows are implemented.

### Finance — active local work

- Staff payment recording, invoice allocation, payroll preview/run, wallets, credit ledger entries, and reporting exist.
- New `credit_packages` migration and staff package CRUD provide a price-to-credit association. A payment with `package_id` credits the wallet in the same transaction; a payment without a package remains money-only.
- This is manual recording of money received, **not payment processing**. There is no implemented card checkout simply because a payment method can be named “Card.”
- Finance charts aggregate returned payment/payroll lists. Existing list ceilings (payments/invoices 500, payroll 200) warrant a completeness check before treating totals as authoritative at scale. The overview itself explains that payroll-only costs omit other operating costs.
- Staff settings are read-only at `/api/settings`; writes are in the platform-admin configuration flow.

### Communication and platform operations

- Messaging, class announcements, notification bell/feed, staff task inbox, and email/job code exist. Email delivery and all task-resolution paths were not exercised in this scan.
- Platform-admin login, institution management, configuration, and cross-tenant finance have implementations and tests.
- Automated production tenant DB provisioning is explicitly unwired; `tenantProvisioner.js` requires an injected implementation. PGlite test provisioning does not prove Azure provisioning works.

## Confirmed code-level gaps to prioritize

These are static findings unless identified as a command result above; no live production reproduction was attempted.

1. **Access-control boundaries need tightening.** Public `/api/auth/register` accepts the staff role through role-based validation and creates an active user; no invitation/approval check is visible in that flow. `staffRoutes.js` protects roster reads with authentication but no staff-role guard, while `staffController.js` returns compensation and contact data. Agree on who may create staff accounts, then test and enforce that rule.
2. **Suspension is not enforced consistently on existing sessions.** Directory login checks institution activity, but `getTenantPool()` caches by code and selects only `conn_string`; `authenticateToken()` checks user existence without checking `user.is_active`. Audit refresh, legacy login, and existing-token behavior together. Do not assume a successful admin status change immediately revokes access.
3. **Request logging can expose sensitive fields.** `app.js` logs non-GET request bodies and includes request bodies in error logs. Authentication payloads pass through this logger. Redact/remove sensitive payload logging before broader rollout; never copy actual secrets into a bug report.
4. **Institution registration route is double-prefixed.** App mounts `/api/register-institution`, while the router declares `POST /api/register-institution`. The normal client URL therefore does not match the mounted POST route. Add a local regression test and correct the relative route.
5. **New account activation is incomplete.** Staff-created students receive a hash of a random password that is not returned; new guardian creation similarly records `credentials_issued` without a usable delivery/reset flow. `PasswordReset.jsx` is a placeholder. Decide an invitation/set-password flow rather than treating an account row as a usable login.
6. **Onboarding retries need recovery design.** The new-student modal creates the student first, then links the guardian in a separate request. A link failure leaves a student behind and the modal shows a general error; a retry can create another record or hit email uniqueness. Test partial success and make continuation explicit.
7. **Verification does not cover the newest endpoint paths.** The existing suites cover auth, tenants, classes, academics, billing, rescheduling, cancellation, booking, guardians, jobs, email, and admin. A source search found no direct endpoint tests for packages, payment recording, settings read, or instructor matching; there are also no dedicated client test scripts. Add targeted coverage rather than interpreting 171 passing tests as whole-app coverage.
8. **Documentation overstates consistency.** Error responses still vary: many routes return only `{ message }`, some use `{ error }`, and the app fallback returns `{ error, message }`. The richer `{ message, errors: [...] }` shape is a convention to adopt, not a guaranteed current API invariant.

## Proposed next milestones

### 1. Establish a dependable development baseline

- Review and checkpoint the current work in logical groups when the user authorizes commits; do not mix the onboarding/package work with unrelated cleanup.
- Exclude imported/generated reference bundles from application lint intentionally, then fix the seven application violations. Do not weaken the Date/moment rules to hide them.
- Preserve the 171-test baseline and add reproductions for the access-control and registration findings.
- Exit criterion: build, tests, and correctly scoped lint pass with no unrelated changes.

### 2. Close access and account-entry gaps

- Restrict staff creation, staff roster access, and inactive tenant/user sessions; test unauthenticated, wrong-role, cross-tenant, and already-issued-token cases.
- Redact authentication/request logging and fix institution registration routing.
- Decide and implement account invitation/set-password recovery, including newly created guardians and students.
- Exit criterion: legitimate users can enter the app; unauthorized users cannot create staff or read restricted roster data; deactivation blocks further access under the agreed policy.

### 3. Complete one staff workflow end to end

- Use the local PGlite sandbox: create student → link guardian → record package payment → select/create class → enroll → mark attendance → verify wallet and family views.
- Test matching conflicts, full-class waitlists, insufficient credits, partial failures, repeated submissions, package retirement, discounts, and transaction rollback.
- Decide retry/idempotency behavior for payment recording before relying on repeated submissions during network failures.
- Exit criterion: the workflow succeeds in browser QA and has regression coverage for its failure paths.

### 4. Verify each role, then operational totals

- Walk the actual nav for staff, instructor, student, guardian, and platform admin; exercise actions, not just page loads.
- Prioritize attendance/notes/unlocks, requests/reschedule escalation, family billing, notification preferences, and administrative configuration.
- Verify totals against complete server aggregates or documented pagination, then reconcile payments, invoices, credits, and payroll.
- Exit criterion: a role-by-role checklist separates implemented-and-verified flows from blocked product decisions.

### 5. Prepare production operations explicitly

- Decide provisioning/bootstrap strategy, payment provider and family checkout scope, email/account delivery, durable upload storage, and staging isolation.
- Review migration rollout and backout, backups/restore, production start command, monitoring, TLS settings, and credential rotation status with the owner.
- Exit criterion: a documented deployment rehearsal on isolated staging. No production action is authorized by this plan.

## Reading order and stale-document cautions

Start with the three `AGENTS.md` files, this snapshot, then the relevant `docs/mobius-spec/` section and migrations. ADR-0001 and ADR-0002 explain tenant databases and schema migrations.

`MODERNIZATION.md`, `docs/PROD_READINESS_GOAL.md`, `docs/client-ui-plan.md`, `docs/CODEBASE_INVENTORY.md`, and the August 9/10 audits are useful historical context, not current acceptance checklists. In particular, old claims that task inboxes, notifications, route splitting, instructor/subject authentication, and all price-to-credit links are missing no longer describe the checkout. Older “17 failing tests” claims are superseded by the measured baseline above. Preserve unresolved product decisions without replaying obsolete work instructions from those documents.
