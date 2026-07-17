# 04 — Billing & Wallet

Covers: credit model, enrollment gates, committed balance, the attendance-driven deduction engine,
low-balance lifecycle, price changes. Reads with `01`, `02`. Purchases/bundles/promos are owned by the
Top-Up spec (`ASSUMPTION[TOPUP]`); this file defines how credits are *spent and gated*, not sold.

## Model

- One wallet per student. **Never pooled** (supersedes onboarding §10 family-wallet note; guardian
  portal aggregates the *view*, see `05`).
- Every class defines `session_credit_cost` (staff-set). A student attending a session burns that cost.
- Payments are full-or-nothing: collect-now or payment-link (48h TTL) per onboarding spec. No
  installments/partials.
- INV-1: **no credit moves without an attendance event.** Ledger entries `deduction/refund/adjustment`
  carry `attendance_id`.

## Enrollment credit gate (runs inside SCH-2/SCH-3/SCH-4 transactions)

```
cost  = class.session_credit_cost (active price row at each session's start)
if class.ends_on IS NOT NULL:
    required = cost × count(remaining scheduled sessions)      # fixed-end: full runway to the end
else:
    required = cost × enrollment_runway_sessions               # open-ended: knob, default 4 (~1 month)
gate: wallet.balance ≥ required   → point-in-time check; NO reservation/lock
```

- Rationale: KR academies run on a monthly re-registration rhythm; a month of runway matches how
  guardians already pay, creates a natural renewal touchpoint, and (KR-REFUND) keeps statutory refund
  exposure small. Hard reservation rejected: confusing UX, double-booking of money across classes;
  the mid-enrollment lifecycle below is the real safety net.
- On failure: show shortfall and top-up CTA (direct credit purchase or bundle deals per
  `ASSUMPTION[TOPUP]`), then retry the same gated action without re-entry.

## Committed balance (display-only)

`committed = Σ cost of scheduled, unattended sessions within the next runway window per enrollment`
`available = balance − committed`
Portal + staff views show "Available X / Committed Y". Actions that would push `available < 0` warn but
never block (soft model, decided).

## Deduction engine (state machine)

Trigger surface = SESSION_ATTENDANCE (see `01 §4`). Per student per session:

| Attendance status | Ledger effect | Set by |
|---|---|---|
| `present` | deduction(cost) | instructor/front-desk mark, or auto-complete |
| `absent_unexcused` (no-show, no cancel) | deduction(cost) — market norm: student-fault absence is consumed | mark or auto-complete |
| `cancelled_late` (cancelled inside the Window) | deduction(cost) — credit lost; staff appeal may reverse via adjustment | cancellation flow (`07`) |
| `absent_excused` | none — staff-granted (appeal path) | staff |
| `cancelled_in_window` | none — never deducted (INV-1: nothing to refund) | cancellation flow (`07`) |
| `instructor_cancelled` | none; if a deduction somehow exists → automatic `refund` entry | instructor cancel (`07`) |

Timing:
1. Session ends → instructor marks attendance (embedded in the post-session surface with notes, `06`).
2. If unmarked after `attendance_autocomplete_hours` (24): auto-complete as `present`
   (`auto_completed=true`), deduct, flag on staff dashboard "auto-completed — verify".
3. Any status change within `session_record_lock_days` (7): engine emits compensating ledger entry
   (`adjustment` referencing the same attendance_id) — never edits history in place.
4. After lock: staff unlock (reason, logged) required for changes (INV-5).

Acceptance criteria (BIL-1 — deduction correctness):
- **Given** a group session with 6 students where 5 are marked present and 1 excused, **then** exactly 5
  deduction entries exist, each `attendance_id`-linked, and the excused student's balance is unchanged.
- **Given** an unmarked session at +24h, **then** all enrolled students auto-deduct as present, the
  session is dashboard-flagged, and a correction at day 3 to `absent_excused` produces an `adjustment`
  restoring the credit (ledger shows all three entries).
- **Given** a correction attempt at day 9, **then** it is blocked pending staff unlock.

## Low-balance / grace lifecycle (BIL-2)

States per (student, enrollment): `ok → low → grace(negative) → blocked`, always with a staff task
before any human-relationship consequence (INV-6).

1. **low:** daily scanner (see `08`) finds balance < cost × `low_balance_notify_runway_sessions` (2) →
   guardian notified (email/Kakao/in-app) with top-up link. Repeat max 1×/week per enrollment.
2. **grace:** next session arrives with insufficient balance → student STILL attends; deduction posts;
   wallet may go negative down to `negative_balance_floor_sessions` (1) × cost. Guardian urgently
   notified; staff task "delinquent balance" created.
3. **blocked:** at the floor, further sessions for that student flip to `attendance-blocked` state —
   student keeps the seat, sessions remain scheduled, but attendance cannot be marked `present` until
   top-up (front desk sees the block reason). No auto-unenroll, ever.
4. **resolution:** top-up clears negative first, unblocks; OR staff executes unenroll explicitly
   (leave flow, `07`/SCH), OR staff waives via `adjustment`.

Acceptance criteria:
- **Given** balance 3, cost 5, floor 1 session (⇒ minimum permitted balance −5), **when** tonight's
  session is attended, **then** the deduction posts, balance = −2 (within grace), and a guardian urgent
  notice + "delinquent balance" staff task exist.
- **Given** balance −2 (floor −5) and another session, **then** deduction to −7 would breach the floor ⇒
  session is attendance-blocked and front desk sees "top-up required (−7 < −5)".
- **Given** any state above, **then** no system-initiated unenrollment exists anywhere in the codebase
  (INV-6 — enforced by code review/checklist, there is no such code path).

## Price changes (BIL-3)

- Staff edits `session_credit_cost` with `effective_from` (future-only, INV-4) → CLASS_PRICE_HISTORY row.
- Sessions bill at the price row active at their start time. Completed deductions never change.
- Auto-notice to all enrolled guardians (old → new, effective date). Gate math and committed balance
  recompute immediately. (KR context: tuition disclosure/fee-hike sensitivity — transparency default.)

Acceptance criteria:
- **Given** a price change effective Aug 1 on a class with sessions Jul 29 and Aug 3, **then** Jul 29
  deducts old price, Aug 3 deducts new price, and each enrolled guardian received exactly one notice.

## BIL-OPEN-1 (compliance, tracked not blocking)

KR-REFUND (see 00-INDEX): implement `cashout` ledger type + staff-initiated statutory-refund flow when
the Top-Up spec lands. Statutory tiers computed on the *package purchase*, not per-credit; needs the
purchase→ledger linkage the Top-Up spec owns. `ASSUMPTION[TOPUP]`.
