# 05 — Guardians & Accounts

Covers: guardian login/portal scope, multi-child aggregation, multi-guardian support, adult students,
purchasing rights. Reads with `01 §7,9`. Credential mechanics (system-generated usernames, temp
passwords, institution code login) are unchanged from onboarding spec §6.

## Core rules

- **Guardian is a first-class login** (own USERS row, role=guardian), not a viewer of the student account.
- **Portal scope: full visibility** of each linked student — schedule, classes, per-session notes,
  grades/performance fields, attendance, wallet balance & ledger, invoices/payment links.
- **Multi-child:** the guardian's payments dashboard aggregates all linked students — balances,
  upcoming costs, pending payment links — and can pay/top-up **for a chosen student**. Credit pools are
  per-student, never shared (supersession note, 00-INDEX).
- **Multi-guardian:** STUDENT_GUARDIANS join table; N guardians per student; exactly one `is_primary`
  (billing contact — payment links/invoices default there). Every linked guardian gets full portal
  visibility; notification preferences are per-guardian.
- **Guardian may act for the student** wherever the student can act self-serve: reschedule requests,
  cancellations, join/leave requests, one-off booking requests. Audit records `requested_by` =
  the guardian's user id.
- **Guardian optional per student** (adult students exist: 재수생, adult language learners).
- **Purchasing rights** = `students.can_purchase` flag:
  - default **false** for minors (KR civil law: minors' contracts voidable without legal-representative
    consent — chargeback risk),
  - default **true** for adult students with zero linked guardians,
  - staff-editable per student.
  When false, top-up CTAs deep-link the guardian instead of the student.

## User stories

### GRD-1 — Guardian portal home
*As a guardian, I want one home showing all my children's schedules, balances, and anything needing my
action, so that I never miss a payment or a schedule change.*

- Sections: per-child card (next sessions, balance available/committed, latest note indicator) +
  "Needs action" (pending payment links w/ expiry countdown, low-balance alerts, reschedule outcomes).
- AC: **Given** two linked children, **then** both cards render with independent wallets; paying a link
  for child A never touches child B's balance.

### GRD-2 — Staff links a second guardian
*As a staff member, I want to add another guardian to a student, so that both households get access.*

- From student profile: search existing guardians (dedupe by email/phone, same lookup as onboarding
  Step 1) or create new → link (non-primary by default) → credentials email to the new guardian
  (skip re-issue if the guardian already has an account — onboarding dedupe rule).
- Primary reassignment is an explicit staff action; exactly-one-primary enforced (partial unique index).
- AC: **Given** an existing guardian of another student is linked, **then** no new credentials are
  issued and their portal now shows both students.

### GRD-3 — Onboarding compatibility
*As the onboarding wizard, I keep creating/linking exactly one guardian, who becomes primary.*

- Commit step writes STUDENT_GUARDIANS(is_primary=true) instead of a direct FK. Zero wizard UI change.
- `ASSUMPTION[SCHEMA]:` backfill migration per `01 §7`.

### GRD-4 — Adult student, no guardian
*As an adult student, I want to manage and pay for my own learning, so that no fictional guardian is
required.*

- Student with zero STUDENT_GUARDIANS rows: billing notifications, payment links, receipts go to the
  student; `can_purchase=true`; portal shows own wallet + top-up.
- AC: **Given** an adult student books a one-off session (SCH-4) with sufficient balance, **then** the
  entire flow completes with no guardian entity anywhere.

### GRD-5 — Notification preferences per guardian
*As a guardian, I want to choose channels/events (all | billing-only | digest), so that two guardians
aren't forced into identical noise levels.*

- prefs JSONB honored by the notification service (`08`); statutory/urgent classes (payment expiry,
  delinquency, instructor cancellation) cannot be fully muted — minimum in-app.

## Privacy boundary

Instructors see their own classes' students (name, attendance, own notes) — never wallet balances,
payment state, or guardian contact details beyond what messaging requires. Staff sees all (tenant-scoped).
