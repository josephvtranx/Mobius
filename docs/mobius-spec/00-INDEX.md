# Möbius Core Spec Bundle — Index

> **Purpose.** Dev-ready user stories, flows, state machines, and schema deltas for the five core domains
> beyond new-client onboarding: Scheduling/Classes, Billing/Wallet, Guardians/Accounts, Academic Layer,
> Reschedules/Cancellations.
> Extends `Mobius_Onboarding_UserFlow_Spec.pdf` (v1.0, 2026-07-15). All decisions locked with product owner 2026-07-17.

## How to use with Claude Code

- Each file is self-contained for its domain. When implementing a feature, load **only** the relevant
  domain file plus `01-domain-model.md` (schema) and `02-policy-knobs.md` (config).
- Grep `ASSUMPTION` to find every point pending confirmation from not-yet-provided specs
  (User Stories 3/4/8, Top-Up spec, existing rescheduling Figma flow). Format:
  `ASSUMPTION[source]: text` — resolve each when the source doc arrives.
- Story IDs are namespaced (`SCH-`, `BIL-`, `GRD-`, `ACA-`, `RSC-`) to avoid collision with the
  academy's existing numeric "User Story 3/4/8" series. Map later if desired.
- Schema changes are written as **deltas** against the onboarding spec's data model
  (Section 8 of that PDF). `NEW TABLE` / `ALTER` labels are migration-ready intent, not literal SQL.

## File map

| File | Domain | Load when working on |
|---|---|---|
| `01-domain-model.md` | Entities, schema deltas, indexes, enums | any migration / model work |
| `02-policy-knobs.md` | Per-academy (PA) configuration registry | settings, feature flags |
| `03-scheduling-classes.md` | Class entity, rosters, rooms, booking | class CRUD, catalog, booking |
| `04-billing-wallet.md` | Credits, gates, deduction engine, low balance | wallet, ledger, attendance-billing |
| `05-guardians-accounts.md` | Logins, multi-guardian, purchasing rights | auth, portal, family views |
| `06-academic-layer.md` | Session notes, templates, locks | notes, instructor UX, dashboards |
| `07-reschedule-cancellation.md` | Windows, reschedule flow, cancellations | any schedule-mutation feature |
| `08-notifications-jobs.md` | Notification triggers, background jobs, dashboard signals | notifs, cron, ops dashboards |

## Glossary

| Term | Meaning |
|---|---|
| **Class** | The root scheduling entity. Type `one_on_one` or `group`. Group differs **only** by `student_limit > 1`. Staff-created, always. |
| **Session** | One concrete occurrence of a class (a row on MCal). Generated from the class's recurrence, or a single instance for one-off 1:1 bookings. |
| **Enrollment** | A student's membership in a class. Rolling for groups (join/leave anytime a seat is open). |
| **Wallet / Credit** | Per-student prepaid balance. Every class defines a per-session credit cost. Deduction is attendance-driven. |
| **Committed balance** | Soft (computed, never locked) sum of credit costs of the student's scheduled sessions in the coming cycle. |
| **Runway** | Enrollment gate for open-ended classes: balance must cover the next N sessions (`enrollment_runway_sessions`). |
| **The Window** | `reschedule_window_hours` — single PA-level knob gating 1:1 reschedule eligibility AND cancellation-refund eligibility for both class types. |
| **Hold** | Row in `SLOT_HOLDS` (onboarding spec). Reused for reschedule requests and self-serve bookings. DB unique partial index on `(instructor_id, starts_at)` remains the universal double-booking backstop. |
| **PA** | Partner Academy — the tenant. All knobs are per-PA. |

## Cross-cutting invariants (INV-*)

Implement these as system-wide guarantees; every domain file assumes them.

- **INV-1 — Attendance is the source of truth for money.** No credit moves without an attendance
  event (or its auto-complete fallback). See `04`, deduction engine.
- **INV-2 — The original session stands until the swap is confirmed.** No reschedule path may
  remove a session before its replacement is accepted. Atomic swap only. See `07`.
- **INV-3 — DB-level backstop.** The unique partial index on `(instructor_id, starts_at) WHERE status IN
  (consultation, provisional, confirmed)` (onboarding spec §8) guards ALL new flows — reschedules,
  self-serve bookings, staff class creation. Losing writer gets 409 → UI re-offers.
- **INV-4 — Future-only mutations.** Price changes, recurrence edits, and policy-knob changes never
  rewrite completed/settled records. Effective-dated forward application only.
- **INV-5 — 7-day mutability freeze.** Attendance, its deduction, and session notes for a given session
  are editable for `session_record_lock_days` (default 7) after session end, then frozen; staff unlock
  (logged, with reason) is the only exception.
- **INV-6 — Staff-in-the-loop for relationship-ending actions.** The system never autonomously
  unenrolls a student, terminates a series, or evicts for non-payment. It notifies, blocks, and creates
  staff tasks; a human executes.
- **INV-7 — Every automated side-effect is auditable and read-back-able** (the onboarding spec's
  "success checklist" philosophy applies to all new flows: reschedules, cancellations, price changes,
  room swaps all emit notification-log + audit entries).

## Decisions that SUPERSEDE referenced specs

- **Per-student wallets, never pooled.** The onboarding spec §10 notes "shared family wallet
  recommended (per Top-Up spec)". Product owner decision 2026-07-17: **wallets are per-student**;
  the guardian portal *aggregates the view and payment actions* across children, but credit pools are
  never shared. When the Top-Up spec is provided, reconcile in this direction.

## ASSUMPTION registry (grep `ASSUMPTION` for in-context instances)

| Tag | Pending source | What we assumed |
|---|---|---|
| `ASSUMPTION[US-3]` | User Story 3 | `INSTRUCTOR_TIME_REQUESTS` semantics (part-time confirm flow) work as summarized in onboarding spec §5; reused for any part-time instructor scheduling in new flows. |
| `ASSUMPTION[US-4]` | User Story 4 | Full-time instructor contract availability is authoritative → no instructor approval needed on staff-created classes for full-timers. |
| `ASSUMPTION[US-8]` | User Story 8 | Admin-fallback timeout mechanics (values, task shape) — reused for reschedule-request escalation and part-time confirmation timeouts. |
| `ASSUMPTION[TOPUP]` | Top-Up spec | Bundle/package tiers, promo bonus credits, refund-as-paid-credits rules. Our billing stories reference but do not redefine them. |
| `ASSUMPTION[RESCHED-FIGMA]` | Main Figma rescheduling flow | Existing rescheduling UI exists; `07` defines target logic — reconcile UI states with that flow on handoff. |
| `ASSUMPTION[SCHEMA]` | Existing prod schema | `STUDENTS` currently references a single guardian; `05` specifies migration to `STUDENT_GUARDIANS` join table. Confirm current FK shape before writing the migration. |

## Open compliance flag (not blocking v1, must not be forgotten)

**KR-REFUND:** Under Korea's Academy Act enforcement decree (교습비 반환기준, Annex 4), prepaid tuition
is subject to mandatory statutory refunds (full before course start; 2/3 within first third; 1/2 before
midpoint; none after) payable within 5 days; non-refund is finable. Wallet credits are prepaid tuition.
The Top-Up spec's "refund as paid credits" is fine as default UX, but a **compliant cash-out path** must
exist for statutory cases. Track as `BIL-OPEN-1` in `04-billing-wallet.md`.
