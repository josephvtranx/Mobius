# 01 — Domain Model & Schema Deltas

Deltas against onboarding spec §8 tables: `GUARDIANS, STUDENTS, CLASS_SERIES, CLASS_SESSIONS, ROOMS,
INSTRUCTOR_AVAILABILITY, INSTRUCTOR_TIME_REQUESTS, WALLETS, CREDIT_LEDGER, INVOICES, SLOT_HOLDS,
PAYMENT_LINKS, ONBOARDING_DRAFTS, PROSPECTS, NOTIFICATION_LOG, USERS, INSTITUTIONS`.

## Entity overview

```
INSTITUTION (PA/tenant)
 ├── ROOMS (per-tenant classroom DB, capacity)
 ├── USERS (staff / instructor / student / guardian roles)
 ├── STUDENTS ──< STUDENT_GUARDIANS >── GUARDIANS
 │      └── WALLETS (1:1 with student) ──< CREDIT_LEDGER
 ├── CLASSES (root entity; renames/extends CLASS_SERIES)
 │      ├──< CLASS_PRICE_HISTORY
 │      ├──< ENROLLMENTS >── STUDENTS
 │      └──< CLASS_SESSIONS
 │             ├──< SESSION_ATTENDANCE (per student per session)
 │             ├──< SESSION_NOTES (per student per session)
 │             └──< RESCHEDULE_REQUESTS
 ├── CLASS_MEMBERSHIP_REQUESTS (join/leave, staff-executed)
 └── SLOT_HOLDS (extended with new hold origins)
```

## 1. CLASSES  (extend/rename `CLASS_SERIES`)

The product-owner mental model: *"all things start with a class entity."* A one-off 1:1 booking is a
class with `recurrence = none` and exactly one session — one unified model, no special cases.

| Field | Type | Notes |
|---|---|---|
| class_id | UUID PK | (= former series_id) |
| institution_id | FK | tenant |
| class_type | enum | `one_on_one` \| `group` — the ONLY structural difference is student capacity |
| subject_id | FK | |
| instructor_id | FK | staff-assigned; system surfaces best-availability candidates (see 03) |
| student_limit | int | `1` for one_on_one (enforced); `>1` for group. Business seat count — hard cap. |
| session_credit_cost | int | staff-set at creation; current value (history in CLASS_PRICE_HISTORY) |
| recurrence | enum | `none` \| `weekly` (default) \| `biweekly` \| `custom` |
| recurrence_rule | JSONB | byday/time pairs; for `custom`, RRULE-like payload |
| starts_on | date | |
| ends_on | date NULL | NULL = open-ended (runs until staff ends it) |
| status | enum | `active` \| `ended` \| `terminated` |
| default_room_id | FK NULL | preferred room; per-session room may differ |
| created_by | FK → USERS | |

**Session materialization (open-ended classes).** Sessions cannot be generated to infinity. A rolling
generator job (see `08`) materializes sessions `horizon_weeks` ahead (default 8) for `ends_on IS NULL`
classes. Fixed-end classes generate fully at creation. All billing math that says "remaining sessions"
means *materialized-or-computable* remaining sessions.

## 2. ENROLLMENTS  (NEW)

| Field | Type | Notes |
|---|---|---|
| enrollment_id | UUID PK | |
| class_id / student_id | FK | |
| status | enum | `active` \| `left` \| `removed` |
| joined_at / left_at | timestamp | left_at = effective date of leaving |
| joined_by / removed_by | FK → USERS | staff executes both directions (requests live in CLASS_MEMBERSHIP_REQUESTS) |

- **UNIQUE partial index** `(class_id, student_id) WHERE status='active'` — one live membership.
- Insert path MUST run: seat check (`active count < student_limit`) → room physical check → credit gate
  (see `04`). All three in one transaction with the insert.
- 1:1 classes have exactly one active enrollment (app-level check: `class_type='one_on_one'` ⇒ count ≤ 1).

## 3. CLASS_MEMBERSHIP_REQUESTS  (NEW — join & leave, staff-executed)

| Field | Type | Notes |
|---|---|---|
| request_id | UUID PK | |
| class_id / student_id | FK | |
| kind | enum | `join` \| `leave` |
| requested_by | FK → USERS | student or guardian (guardian may act for student) |
| reason | text NULL | required UI-side for `leave` (retention signal) |
| status | enum | `pending` \| `approved` \| `rejected` \| `cancelled` |
| resolved_by / resolved_at | FK / ts | staff |

## 4. SESSION_ATTENDANCE  (NEW — the billing linchpin, per INV-1)

| Field | Type | Notes |
|---|---|---|
| attendance_id | UUID PK | |
| session_id / student_id | FK | |
| status | enum | `present` \| `absent_unexcused` \| `absent_excused` \| `cancelled_in_window` \| `cancelled_late` \| `instructor_cancelled` |
| marked_by | FK NULL | NULL when auto-completed |
| auto_completed | bool | true when the 24h fallback fired |
| marked_at | timestamp | |
| adjusted_from | enum NULL | previous status if changed within the 7-day window (INV-5) |
| locked_at | timestamp | session_end + `session_record_lock_days` |

- **UNIQUE** `(session_id, student_id)`.
- Deduction mapping (full engine in `04`): `present`, `absent_unexcused`, `cancelled_late` → **deduct**;
  `absent_excused`, `cancelled_in_window`, `instructor_cancelled` → **no deduct** (instructor_cancelled
  additionally reverses any prior deduct — refund entry).

## 5. SESSION_NOTES  (NEW)

| Field | Type | Notes |
|---|---|---|
| note_id | UUID PK | |
| session_id / student_id | FK | one note row per student per session (group ⇒ many rows) |
| performance / improvements | text NULL | template fields; optional |
| free_notes | text NULL | |
| created_by | FK → USERS | instructor only (write authz) |
| edited_at | timestamp NULL | rendered as visible "edited …" stamp in portals |
| versions | JSONB | append prior payload on every edit (lightweight history) |
| locked_at | timestamp | session_end + `session_record_lock_days`; staff unlock logged |

## 6. RESCHEDULE_REQUESTS  (NEW)

| Field | Type | Notes |
|---|---|---|
| request_id | UUID PK | |
| session_id | FK | the ORIGINAL session (which stands until swap — INV-2) |
| requested_by | FK → USERS | student or guardian |
| proposed_starts_at / proposed_ends_at | timestamp | |
| hold_id | FK → SLOT_HOLDS | soft hold on the proposed slot, TTL = instructor window |
| status | enum | `pending` \| `accepted` \| `rejected` \| `expired` \| `escalated` |
| responded_by / responded_at | FK / ts | instructor (or staff on escalation) |

## 7. STUDENT_GUARDIANS  (NEW — replaces single guardian FK)

| Field | Type | Notes |
|---|---|---|
| student_id / guardian_id | composite PK | |
| is_primary | bool | exactly one primary per student **when any guardian exists** (partial unique index `(student_id) WHERE is_primary`) — primary = billing contact (payment links, invoices) |
| notification_prefs | JSONB | per-guardian channel/event prefs |
| linked_by / linked_at | FK / ts | |

`ASSUMPTION[SCHEMA]:` current prod shape assumed to be a single guardian reference created at onboarding
commit. Migration: backfill one row per existing link with `is_primary=true`, then drop the FK.
Onboarding wizard is unchanged: it creates/links exactly one guardian → becomes primary.

## 8. CLASS_PRICE_HISTORY  (NEW)

| Field | Type | Notes |
|---|---|---|
| class_id | FK | |
| session_credit_cost | int | |
| effective_from | timestamp | future-only (INV-4); sessions price at their own start time's active row |
| set_by | FK → USERS | guardian notice auto-emitted on insert (see 08) |

## 9. ALTERs to existing tables

**STUDENTS**
- `ADD can_purchase bool` — default logic in `05` (off for minors, on for adult w/o guardian).
- `ADD date_of_birth` if not present (minor determination).
- `DROP/deprecate guardian FK` after STUDENT_GUARDIANS backfill.

**CLASS_SESSIONS**
- `ADD rescheduled_from timestamp NULL` + `ADD reschedule_chain JSONB` (audit marker: full move history).
- `ADD status` values: `scheduled` \| `reschedule_requested` \| `moved` \| `completed` \| `cancelled_student` \| `cancelled_instructor` \| `cancelled_staff`.
- `ADD room_id` already exists (onboarding §6); add `room_changed_notice_sent bool` for mid-series swaps.

**SLOT_HOLDS**
- `ADD origin enum`: `onboarding_consultation` \| `reschedule_request` \| `self_serve_booking`.
- Lifecycle & unique partial index unchanged (INV-3). TTL for the two new origins =
  `instructor_response_window_hours`.

**WALLETS / CREDIT_LEDGER**
- Wallet remains 1:1 per student (see 00-INDEX supersession note).
- `CREDIT_LEDGER.entry_type` enum: `purchase` \| `bonus` \| `deduction` \| `refund` \| `adjustment` \| `cashout` (KR-REFUND).
- `ADD CREDIT_LEDGER.attendance_id FK NULL` — every `deduction`/its `refund`/`adjustment` points at the
  attendance event that caused it (INV-1 traceability).
- `ADD WALLETS.balance` may go negative down to `-(negative_balance_floor_sessions × class cost)` during
  grace (see `04`); floor enforced at deduction time.

**USERS** — no change beyond onboarding spec; guardian is a first-class login role with portal scope per `05`.

## 10. Computed values (no storage)

- `committed_balance(student)` = Σ `session_credit_cost` of the student's scheduled, not-yet-attended
  sessions within the next `enrollment_runway_sessions` occurrences per enrolled class. Display-only.
- `available_balance` = `wallet.balance − committed_balance`. Warn (never block) when an action dips below 0.
- `instructor_cancel_rate`, `note_completion_rate`, `serial_mover_count` — dashboard signals, defined in `08`.
