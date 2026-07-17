# Schema v2 — Design Document

Tenant schema: `server/src/config/schema.sql` · Registry: `server/src/config/regestryschema.sql`
Spec bundle: [`docs/mobius-spec/`](mobius-spec/) (files `00`–`08`) · Modernization plan: [`../MODERNIZATION.md`](../MODERNIZATION.md)

**Status:** greenfield rewrite (no live DB existed when this landed, 2026-07-17). Server code still targets the v1 model — code alignment is tracked in MODERNIZATION.md Phase 7, not here.

## Why v2

The v1 schema had (a) drift — live code wrote to `auth_logs` / `password_history`, which the file never created; (b) near-zero indexing and no DB-level double-booking protection; and (c) a data model (time packages / minute deductions, single-student sessions, contact-only guardians) superseded by the product spec bundle, which defines classes/enrollments, per-student credit wallets with an attendance-driven ledger, guardian logins, session notes, and reschedule state machines.

## Key decisions

| Decision | Choice | Rationale |
|---|---|---|
| Primary keys | **INT identity** for people/catalog (`users`, `students`, `staff`, `instructors`, `guardians`, `subjects`, `rooms`, money tables); **UUID** for spec domain entities (`classes`, `class_sessions`, `enrollments`, attendance, notes, requests, holds, wallets) | Spec (`01`) specifies UUID PKs for its entities; keeping people as INT minimizes breakage of the JWT/auth code (`decoded.userId`) during Phase 7 alignment |
| Enums | `TEXT` + `CHECK` (no Postgres `ENUM` types) | Matches repo idiom; cheaper to evolve |
| `institution_id` columns | **Omitted** | One DB per tenant; the connection *is* the tenant scope (see `server/CLAUDE.md`). The spec's `institution_id` FKs collapse to nothing here |
| Credits vs money | Credits are `INT` (wallet balance, ledger amounts, `session_credit_cost`); money is `NUMERIC(10,2)` | Spec `04`: credits are the internal unit; won-denominated amounts appear only on payments/invoices/links |
| Ledger amounts | **Signed** (`deduction`/`cashout` < 0; `purchase`/`bonus`/`refund` > 0; `adjustment` either), CHECK-enforced | Balance = Σ(amount); no sign ambiguity per entry type |
| Policy knobs | Singleton-row `institution_settings` with typed columns + defaults from spec `02`; `institution_settings_history` for audit | 14 fixed knobs; typed columns beat EAV for CHECKs and defaults. INV-4 (future-only) is app-enforced: snapshot knob values onto requests/holds at creation |
| `updated_at` | Trigger-maintained (`set_updated_at()`) on hot mutable tables | No app discipline required |

## Entity map

```
TENANT DB
├── users ──┬── students ──< student_guardians >── guardians (user-linked, first-class login)
│           ├── staff / instructors                │  is_primary partial-unique, notif prefs JSONB
│           └── auth_logs, password_history        └── wallets (1:1) ──< credit_ledger
├── subjects / subject_groups / specialties · rooms · pa_codes
├── instructor_availability / _unavailability / instructor_time_requests
├── classes ──< class_price_history
│      ├──< enrollments >── students          (unique-active partial index)
│      ├──< class_membership_requests         (join/leave, staff-executed)
│      └──< class_sessions
│             ├──< session_attendance ──< credit_ledger (deduction/refund/adjustment)
│             ├──< session_notes
│             └──< reschedule_requests ── slot_holds
├── payments / payment_links / invoices / invoice_payments / refunds
├── institution_settings (+_history) · notification_log · staff_tasks
└── time_logs · payroll · operating_expenses · financial_periods   (ops, carried over)
```

## How the invariants are enforced (spec `00-INDEX` INV-1…7)

| Invariant | DB mechanism | App responsibility |
|---|---|---|
| INV-1 attendance = source of truth for money | `credit_ledger` CHECK: `deduction`/`refund` require `attendance_id`; FK to `session_attendance` | Deduction engine writes attendance → ledger in one tx; `adjustment` should reference the attendance it corrects (not CHECK-forced — staff waivers exist) |
| INV-2 original stands until swap confirmed | `class_sessions.status` machine (`moved` terminal); successor row carries `rescheduled_from` + `reschedule_chain` | Atomic swap in one tx |
| INV-3 DB backstop vs double-booking | Unique partial `(instructor_id, starts_at)` on **both** `class_sessions` (live statuses) and `slot_holds` (active) — exactly as spec'd | Writers go holds-first; on 23505 → 409 → re-offer |
| — beyond-spec hardening | gist `EXCLUDE` on `class_sessions` per instructor **and** per room over `tstzrange(starts_at, ends_at)` — catches variable-duration overlaps the exact-start unique index can't | None |
| INV-4 future-only mutations | `class_price_history(effective_from)` unique per class; settings history table | App rejects past-dated `effective_from`; sessions price at their own start time |
| INV-5 7-day freeze | `locked_at` on `session_attendance` + `session_notes` | Nightly lock-enforcer job sets it; unlock = staff task, logged |
| INV-6 staff-in-the-loop | `staff_tasks` table; **no** DB path auto-unenrolls (no triggers/cascades from wallet state to enrollments) | Code review: no such code path, ever |
| INV-7 auditable side-effects | `notification_log` (INV-7), `reschedule_chain`, `versions` on notes, `institution_settings_history` | Every job/flow writes its log rows |

## Per-domain notes

### Identity & guardians (spec `05`)
- `guardians.user_id` is `NOT NULL UNIQUE` → every guardian is a login (`users.role='guardian'`). Contact fields live on `users`.
- `student_guardians`: N guardians per student; partial unique index `(student_id) WHERE is_primary` ⇒ exactly one primary when any exist. Adult students = zero rows (GRD-4).
- `students.can_purchase` defaults **false** (minors, KR civil-law chargeback risk); the app flips it true at creation for adult students with no guardians.
- Vestigial `admin` role removed from the `users.role` CHECK (MODERNIZATION D2 — platform admin is registry-scoped, separate subsystem).

### Scheduling (spec `01`, `03`, `07`)
- `classes` unifies series and one-offs (`recurrence='none'`, 1:1 only — CHECK-enforced). `student_limit=1` CHECK-enforced for `one_on_one`.
- `class_sessions.instructor_id` is denormalized from `classes` so the INV-3 indexes and calendar queries don't join; app keeps it in sync (no substitute-instructor feature in v1).
- Session materialization: fixed-end classes generate fully at creation; open-ended on a rolling `session_generation_horizon_weeks` horizon (nightly job, spec `08`).
- `slot_holds.origin` distinguishes onboarding consultations / reschedule requests / self-serve bookings; TTL = `instructor_response_window_hours` for the latter two.

### Billing (spec `04`)
- `wallets.balance` is a cached integer; the ledger is authoritative. Deductions run `SELECT … FOR UPDATE` on the wallet row, verify the grace floor (`negative_balance_floor_sessions × cost`), then write ledger + balance in one tx.
- Grace/blocked lifecycle is app state derived from balance vs floor — deliberately **not** stored, so it can't drift.
- KR-REFUND (`BIL-OPEN-1`): `cashout` ledger type exists now; `refunds.ledger_entry_id` links a cash refund to its credit cash-out. Statutory-tier math waits for the Top-Up spec (`ASSUMPTION[TOPUP]`).
- `invoice_payments` allows partial payments / one payment across invoices (the v1 `invoices.payment_id` 1:1 FK is gone).

### Academic (spec `06`)
- `session_attendance` + `session_notes` unique per `(session_id, student_id)`; both carry `locked_at` (one shared freeze window: `session_record_lock_days`).
- Notes: `versions JSONB` appends prior payloads on each edit; `edited_at` renders the portal stamp. Write authz (author-instructor-only) is app-level.

### Config, notifications, tasks (spec `02`, `08`)
- All 14 knobs with spec defaults live in the singleton `institution_settings` row (seeded by the schema file). `reschedule_window_hours` default 24 is a placeholder — spec says "per PA", set at onboarding.
- `staff_tasks.kind` covers every staff-task producer in the bundle (escalations, join/leave, delinquency, auto-complete verification, unlock requests, appeals, termination requests).
- Dashboard signals (`instructor_cancel_rate`, `note_completion_rate`, serial movers) are **computed, not stored** (spec `01` §10).

### Registry
`is_active` (suspend without delete), `schema_version` (per-tenant migration tracking for Phase 5.4), `created_at`, citext + format-checked `code`. `conn_string` remains plaintext — **D10**: acceptable pre-launch only; revisit (pgcrypto or vault-injected credentials) before production tenants.

## ASSUMPTION registry

The bundle's assumptions (`ASSUMPTION[US-3/US-4/US-8/TOPUP/RESCHED-FIGMA]`) remain open — grep the spec files. New in this design:

| Tag | Where | What was assumed |
|---|---|---|
| `ASSUMPTION[ONBOARDING-§8]` | `rooms`, `slot_holds`, `payment_links`, `notification_log`, `instructor_time_requests`, `wallets`/`credit_ledger` base shape | The onboarding spec PDF (§8 data model) was unavailable; these tables were designed from how the bundle uses them. Reconcile column-by-column when the PDF arrives. |
| Correction to `ASSUMPTION[SCHEMA]` | `student_guardians` | The spec assumed a single-guardian FK; v1 actually had a `student_guardian` join table already. v2 adds `is_primary` + prefs; no FK-drop migration was ever needed. |
| `slot_holds` statuses | `slot_holds.status` | Spec quotes an index over `(consultation, provisional, confirmed)` statuses; v2 uses a generic hold lifecycle (`active/confirmed/released/expired`) with the INV-3 index on `active`. Verify against the PDF. |

## Dropped v1 tables

| v1 table | Superseded by |
|---|---|
| `time_packages`, `student_time_packages`, `time_deductions` | `wallets` + `credit_ledger` (credits, not minutes; attendance-driven) |
| `class_series` | `classes` (adds type, capacity, pricing, recurrence rule, room) |
| `attendance` | `session_attendance` (status enum drives billing; lock window) |
| `instructor_assignments` | `enrollments` + `classes.instructor_id` |
| free-text `pa_code` columns | `pa_codes` FK table |
| `reschedule_requests` (v1 shape) | v2 shape with `hold_id`, proposed range, escalation statuses |

## Impact on existing server code (Phase 7 preview, not done here)

Every controller/route touching `class_series`, `class_sessions` (old columns `session_start`/`session_end`/`series_id`), `attendance`, or time packages must be rewritten against v2. `auth`/`users`/`subjects`/`guardians` paths survive with column-level fixes (`guardians` now join through `users`; `students.age` → `date_of_birth`). The `requireUtcIso` convention and `req.db` tenancy pattern are unchanged.

## Verification (how this schema was tested)

Scratch Postgres (docker) → `psql -f regestryschema.sql` / `psql -f schema.sql` clean; constraint probes: instructor/room overlap exclusions reject conflicting inserts, INV-3 unique indexes reject same-slot rows, one-active-enrollment and one-primary-guardian partial uniques hold, ledger sign/attendance CHECKs reject invalid entries; `auth_logs`/`password_history` columns verified against `middleware/auth.js` and `helpers/passwordHistoryHelpers.js` query shapes.
