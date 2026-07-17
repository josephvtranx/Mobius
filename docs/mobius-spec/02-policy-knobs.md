# 02 — Policy Knobs Registry (per-PA configuration)

Single source of truth for every academy-configurable setting. `Existing` = defined in onboarding spec §1;
`NEW` = introduced by this bundle. All knobs are per-institution.

| Knob | Type | Default | Governs | Status |
|---|---|---|---|---|
| `payment_modes_enabled` | enum | both | collect_now / payment_link / both | Existing |
| `payment_link_ttl_hours` | int | 48 | provisional-hold survival unpaid | Existing |
| `consultation_hold_ttl_min` | int | 30 | wizard slot holds | Existing |
| `trial_class_enabled` | bool | false | trial branch (v1.1) | Existing |
| `reschedule_window_hours` | int | per PA | **THE Window.** Gates (a) student/guardian 1:1 reschedule eligibility, (b) cancellation-refund eligibility for BOTH class types. One number, printed on enrollment agreements. Split knobs rejected (loophole: cancel+rebook defeats a longer reschedule window). | Existing (scope broadened) |
| `enrollment_runway_sessions` | int | 4 | credit gate for open-ended classes: balance must cover next N sessions (≈ one month at weekly cadence — matches KR monthly re-registration rhythm) | NEW |
| `session_record_lock_days` | int | 7 | INV-5 freeze: attendance adjustments, deduction reversals, AND note edits share this one window | NEW |
| `attendance_autocomplete_hours` | int | 24 | unmarked session auto-completes as attended (deduct + dashboard flag) | NEW |
| `negative_balance_floor_sessions` | int | 1 | grace depth: wallet may go negative by this many sessions before further sessions block | NEW |
| `low_balance_notify_runway_sessions` | int | 2 | guardian low-balance notice fires when balance < next N sessions' cost | NEW |
| `instructor_response_window_hours` | int | 24 | instructor accept/reject deadline for reschedule requests AND self-serve booking requests; silence → staff escalation (`ASSUMPTION[US-8]` task shape) | NEW |
| `self_serve_booking_enabled` | bool | true | students/guardians may book one-off 1:1 sessions from instructor calendars | NEW |
| `group_catalog_visible` | bool | true | open-seat group classes browsable in student/guardian portal (request-to-join only; staff executes) | NEW |
| `session_generation_horizon_weeks` | int | 8 | rolling session materialization for open-ended classes | NEW |

## Knob interaction rules

1. `reschedule_window_hours` is evaluated against a session's **current** scheduled start
   (re-reschedules re-check against the moved time, not the original).
2. `attendance_autocomplete_hours` also triggers the "session notes pending" instructor reminder —
   one timer, two nudges (see `06`, `08`).
3. Changing any knob is future-only (INV-4): in-flight requests/holds resolve under the values active
   at their creation.
