# 08 — Notifications, Background Jobs, Dashboard Signals

Registries consolidating every trigger/job/signal introduced by files 03–07, extending the onboarding
spec §9 tables (which remain in force for the wizard). Channels: Email · in-app · Kakao (per-guardian
prefs, `05`/GRD-5; urgent classes cannot be fully muted).

## Notification triggers (NEW, beyond onboarding §9)

| Event | Recipients | Notes |
|---|---|---|
| Class created / student enrolled | guardian(s), student, instructor | schedule payload |
| Join request submitted / approved / rejected | requester; staff task on submit | SCH-3 |
| Leave request submitted / executed | staff task; family on execute | RSC-4 |
| Room changed (mid-series swap or single session) | enrolled families, instructor | SCH-2; wrong-room kids are an ops failure |
| Class pattern changed (SCH-5) / ended / terminated | enrolled families, instructor | old→new diff |
| Price change scheduled | enrolled guardians | BIL-3; exactly one notice per change |
| Low balance (< N sessions runway) | guardian (student if can_purchase) | BIL-2; ≤1/week/enrollment |
| Grace entered (negative balance) | guardian URGENT + staff task | BIL-2 |
| Attendance-blocked (floor breached) | guardian URGENT, front-desk surface | BIL-2 |
| Attendance marked (등하원-style ping) | guardian | on `present` mark; market-standard trust signal |
| Session auto-completed (unmarked 24h) | staff dashboard flag | BIL-1/`04` |
| Notes pending reminder | instructor | same 24h timer; deep-link to ACA-1 surface |
| Note edited post-read / unlock granted | (portal stamp only) / staff log | ACA-2/4 |
| Reschedule request created | instructor | RSC-1 |
| Reschedule accepted / rejected / expired / escalated | family; staff task on escalate | RSC-1 |
| Self-serve booking requested / accepted / rejected / escalated | instructor; family; staff task on escalate | SCH-4 |
| Student cancel (late) → appeal affordance | staff task on appeal | RSC-2 |
| Instructor cancelled instance | all enrolled families, staff log | RSC-3; one-off variant carries rebook deep-link |
| Series termination requested (instructor) | URGENT staff task | RSC-5; families only on confirmed resolution |

## Background jobs

| Job | Schedule | Action |
|---|---|---|
| Hold-expiry sweeper | 1-min (existing) | now also expires `reschedule_request` & `self_serve_booking` holds → status transitions + notifications |
| Payment-link reminders / draft auto-abandon | existing | unchanged (onboarding §9) |
| Session generator (rolling horizon) | nightly | materialize sessions `session_generation_horizon_weeks` ahead for open-ended classes; assign rooms; INV-3 conflict-safe |
| Attendance auto-completer | hourly | sessions ended > `attendance_autocomplete_hours` with missing marks → `present`/auto, deduct, dashboard flag; also fires notes-pending reminder |
| Record lock enforcer | nightly | set `locked_at` on attendance + notes past `session_record_lock_days` |
| Low-balance scanner | daily | BIL-2 state evaluation per enrollment; emits low/grace notices + staff tasks |
| Request deadline enforcer | 5-min | reschedule/booking requests: TTL → escalated (staff task); Window-close → expired |
| Part-time confirmation fallback | existing | `ASSUMPTION[US-8]` — reused verbatim for class-creation time requests |

## Staff dashboard signals (people-management surfaces)

| Signal | Definition | Why |
|---|---|---|
| `instructor_cancel_rate` | instructor-cancelled instances / taught sessions, trailing 60d | schedule stability is a top parent-trust factor; see the pattern before parents complain (RSC-3) |
| `note_completion_rate` | per instructor & class, trailing 30d (ACA-3) | coach low performers; parents equate empty records with neglect |
| `auto_completed_sessions` | flagged, unresolved verify-queue | billing ran on a fallback; human should glance (BIL-1) |
| `delinquency queue` | enrollments in grace/blocked + days | INV-6: humans execute consequences |
| `serial movers` | students with ≥3 reschedules / 30d | RSC-1; appeal/limit conversations, no hard cap in v1 |
| `pending requests aging` | join/leave/reschedule/booking/unlock tasks by age | nothing silently rots |

## Implementation note

One notification service, event-driven off the domain writes above; NOTIFICATION_LOG rows for
everything (INV-7). Every family-facing message includes the concrete object (session time, class name,
amount) — no vague "something changed" notices.
