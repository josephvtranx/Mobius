# Server guidance

Applies to `server/`; also follow the root `AGENTS.md`.

## Structure

- Express 4 with ESM. `index.js` starts the listener and background scheduler; `src/app.js` exports the app for tests.
- Routes live in `src/routes/`, controllers in `src/controllers/`, shared logic in `src/helpers/`, and middleware in `src/middleware/`.
- `src/db/registryPool.js` accesses institution metadata; `src/db/tenantPool.js` resolves tenant pools. Tenant-scoped operations must use the resolved `req.db`, not a global connection.
- SQL schema changes belong in `migrations/registry/` or `migrations/tenant/`. The test harness replays the real migration chains.

## Contracts and safety

- Preserve verified JWT `tenantCode` resolution and authorization checks. Never treat a caller-supplied institution code as authorization for protected resources.
- Keep errors consistent with `{ message, errors: [{ field, message }] }`; use the existing error and validation helpers.
- Use parameterized SQL. Keep multi-step writes atomic using existing transaction patterns.
- Import shared time helpers from `mobius-lms`; validate timestamp inputs with `requireUtcIso` where applicable.
- Never load live environment credentials into debugging output or new files. Confirm local database targets before running scripts or migrations.
- Starting `index.js` can run scheduled jobs. Use the test harness for isolated verification; `JOBS_DISABLED=1` disables runtime jobs but does not make database access safe by itself.

## Verification (from repository root)

- All server tests: `npm test`.
- One test file: `npm --prefix server test -- test/auth.test.js` (replace with the relevant file).
- Tests in `test/` use Vitest, Supertest, and ephemeral PGlite databases through `test/helpers/testEnv.js`; no external PostgreSQL is needed.
- Add regression tests for changed behavior, especially tenant isolation, permissions, and financial writes.
- Run `npm run lint` from the root. There is no server compilation step.

## Domain map and invariants

- `classRoutes.js`, `bookingRoutes.js`, `instructorCalendarRoutes.js`, `slotFinder.js`, and `recurrence.js`: classes, membership, booking, conflict checks, and matching. Preserve the original session until a reschedule is accepted.
- `sessionRoutes.js`, `deductionEngine.js`, and `sessionNotes.js`: attendance, credit consequences, cancellation, and notes/locks. Deductions/refunds are attendance-linked; correction entries append to the ledger rather than overwriting history.
- `walletRoutes.js` and `walletMath.js`: balances, committed credits, and runway. Wallets belong to individual students, not entire families. Preserve transaction locks and negative-balance gates.
- `paymentRoutes.js` and `packageRoutes.js`: staff records of money already received and academy-defined credit packages. A package payment grants base plus bonus credits within the payment transaction. A non-package payment does not grant credits. No payment processor is implemented.
- `studentGuardianV2Routes.js`: staff-created students, guardian links, primary-guardian changes, student schedules/records, purchasing permissions. Registry and tenant writes are separate database transactions with compensating cleanup, not distributed atomic commits.
- `messageRoutes.js`, `staffTaskRoutes.js`, `notificationRoutes.js`, and jobs implement communication and queues. Route existence does not mean every task kind has a verified resolution flow.
- `adminRoutes.js` uses registry-level platform-admin auth. `settingsRoutes.js` is staff read-only. Never substitute tenant staff for platform admin or vice versa.

## Current hazards to check before editing

- Normal email/password login resolves via `user_directory`; legacy header-scoped login still exists. Existing-token activity checks are weaker than directory login: tenant pools do not filter `is_active`, and tenant authentication does not reject inactive user rows. Add regression tests when fixing this.
- Staff self-registration currently lacks an invitation gate; staff roster reads lack a staff-role guard. Instructor and subject routers already have authentication—old audit claims to the contrary are stale.
- The institution-registration router repeats its mount prefix. The app error handler is inline in `src/app.js`; `src/middleware/errorHandler.js` is not the active fallback. Do not assume changing that standalone middleware updates runtime behavior.
- Current request/error logs can include body data. Do not reproduce real credentials in logs; prefer isolated synthetic test payloads.
- `server/scripts/dev/sandbox.js` uses `startTestEnv()`, disables real email/jobs, and sets `PG_POOL_MAX=1` for PGlite. Confirm the port is free before launching it. It is ephemeral: restarting resets its data.
- As of 2026-08-26, 171 tests pass. No direct endpoint tests were found for packages, manual payments, settings, or instructor matching. Add coverage for authorization, rollback, retries, and boundary values in those flows.
- See `../docs/PROJECT_STATUS_2026-08-26.md` for the proposed sequence; historical readiness docs are not an instruction to deploy or run migrations.
