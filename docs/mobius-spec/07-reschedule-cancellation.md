# 07 — Reschedules & Cancellations

Covers: the Window, who-can-do-what matrix, the 1:1 reschedule request flow (recurring instances AND
one-offs), student/instructor/staff cancellations, group leave. Reads with `01 §6`, `02`, `04`
(attendance statuses drive all money effects). `ASSUMPTION[RESCHED-FIGMA]:` an existing rescheduling
flow exists in the main Figma — reconcile UI states with this logic on handoff.

## The Window (single knob)

`reschedule_window_hours`, evaluated against the session's **current** scheduled start:
- Outside the Window → student/guardian may reschedule (1:1) or cancel with refund-in-effect
  (really: never-deducted, INV-1).
- Inside the Window → reschedule button hidden; cancellation = `cancelled_late` → credit lost
  (deduction). Staff appeal can reverse via `adjustment` (`absent_excused`).
- One number for both actions and both class types. Split windows rejected: a shorter cancel window +
  longer reschedule window lets families cancel+rebook to fake a reschedule — loophole by construction.

## Capability matrix

| Actor | 1:1 recurring instance | 1:1 one-off | Group session | Whole series |
|---|---|---|---|---|
| Student / Guardian | reschedule request (outside Window); cancel | reschedule request; cancel | **cancel only** (no group reschedule — the class runs regardless; you rejoin next week) | leave request (group) / change request via staff |
| Instructor | cancel instance (unilateral, auto-refund) | cancel instance (family must rebook — SCH-4) | cancel instance (all students auto-refunded) | REQUEST termination → staff task |
| Staff | anything, any time (window does not bind staff); all actions logged | ← | ← | edit pattern (SCH-5) / terminate (SCH-6) |

Money mapping is entirely via attendance statuses (`04`): `cancelled_in_window` (outside Window ⇒ no
deduct), `cancelled_late` (inside ⇒ deduct), `instructor_cancelled` (never deduct / auto-refund any prior
deduct).

## RSC-1 — Student/guardian reschedules a 1:1 session (the flagship flow)

*As a student or guardian, I want to move a 1:1 session to another open time on my instructor's
calendar, so that a conflict doesn't cost us the lesson.*

Preconditions to render the button: class_type=1:1 ∧ now < start − Window ∧ session not completed.

1. Session card → "Request reschedule" → instructor's calendar (painted availability − sessions −
   active holds; identical query as matcher/SCH-4).
2. Pick slot → validations at request time: instructor free (INV-3), a room exists at that time,
   **collision guard** — the new time may not overlap any existing session of the same student.
3. Create RESCHEDULE_REQUEST(pending) + SLOT_HOLD(origin=reschedule_request,
   TTL=`instructor_response_window_hours`). **Original session stays on calendar** as
   `reschedule_requested` (INV-2).
4. Instructor notified → accept | reject.
   - **Accept → atomic swap:** original → `moved`; new CLASS_SESSIONS row in the same class at the new
     time; room auto-assigned (capacity-fit heuristic from onboarding commit); `rescheduled_from` set +
     `reschedule_chain` appended ("moved from Wed Jul 29 5:00 PM — requested by guardian, accepted by
     Kim Soyeon"); hold → confirmed; notify guardian/student/staff-log.
   - **Reject:** hold released; original stands (status back to `scheduled`); requester notified +
     offered other times.
   - **Silence at TTL:** status `escalated` → staff task (`ASSUMPTION[US-8]` shape); staff may accept/
     reject on the instructor's behalf or contact them.
   - **Hard stop:** if the Window before the ORIGINAL session closes with the request unresolved →
     `expired`, hold released, original stands, requester notified.
5. Billing: nothing moves (INV-1). The one deduction fires when the moved session is attended.

AC:
- **Given** an accepted swap, **then** exactly one session exists for that occurrence, ledger has zero
  entries from the move, and the new session's card shows the audit marker.
- **Given** a proposed slot that collides with the student's other class, **then** the slot is
  unpickable with reason shown.
- **Given** a re-reschedule of an already-moved session, **then** the Window checks against the CURRENT
  time and `reschedule_chain` shows the full path (Wed→Thu→Sat). No cap in v1; serial movers surface on
  the staff dashboard (`08`).
- **Given** instructor silence past TTL and past the Window, **then** original stands and the family was
  notified at both transitions.

## RSC-2 — Student/guardian cancels a session (both class types)

1. Session card → "Cancel session" → confirm dialog states the money effect *before* confirming:
   outside Window → "credit will not be used"; inside → "past the change deadline — credit will be
   forfeited; you can contact the academy to appeal."
2. Writes SESSION_ATTENDANCE `cancelled_in_window` | `cancelled_late` for that student only
   (group: other students unaffected; the session itself proceeds).
3. 1:1: the session slot is released for the instructor (session → `cancelled_student`); group: seat
   simply not attended that day.
4. Notifications: instructor (1:1), staff log; late-cancel additionally creates a lightweight appeal
   affordance for the family ("request review" → staff task → possible `absent_excused` adjustment).

## RSC-3 — Instructor cancels an instance (unilateral)

*As an instructor, I can cancel any single session I teach; families are made whole automatically.*

1. Instructor session card → cancel (reason required).
2. Session → `cancelled_instructor`; per-student attendance rows `instructor_cancelled`; any existing
   deduction auto-refunds (edge: shouldn't exist pre-session — assert; post-hoc cancels of completed
   sessions are staff-only corrections).
3. Slot + room freed. Notifications: every enrolled family, staff log.
4. Recurring (1:1 or group): family simply refunded/never-charged; next occurrence unchanged.
   **One-off 1:1:** notification includes "book another time" deep-link into SCH-4 with the same
   instructor preselected (family rebooks; there is no next class otherwise).
5. Reliability: increments `instructor_cancel_rate` (dashboard signal, `08`) — staff sees the pattern
   before parents complain.

## RSC-4 — Group leave

*As a student/guardian, I want to leave a group class, so that we stop attending — with a human
touchpoint before the seat is gone.*

1. Class card → "Leave class" (reason required) → CLASS_MEMBERSHIP_REQUESTS(kind=leave) → staff task
   (retention conversation moment — re-registration is THE survival metric; no silent self-serve exit).
2. Staff executes with an effective date (default: now): enrollment → `left`; future sessions vanish
   from the student's schedule; seat frees on the rolling roster; family notified.
3. **Anti-loophole:** any session already inside the Window at execution follows the Window rule
   (`cancelled_late` ⇒ credit lost) unless staff waives — "leave class" is not a free late-cancel for
   tonight.
4. Money: future sessions were never deducted (INV-1) ⇒ nothing to refund by construction.

## RSC-5 — Series termination requests (instructor) & staff overrides

- Instructor "end this class" → urgent staff task; staff runs SCH-6 (terminate) or SCH-5 (re-pattern) or
  re-matches instructor (onboarding §10 part-time-decline machinery). Guardians notified only once a
  resolution is confirmed (matches onboarding edge-case rule).
- Staff cancel/reschedule of any session: unrestricted by the Window, always logged, always notifies
  affected families + instructor; money effects still flow through attendance statuses (staff picks the
  status; default `instructor_cancelled`-equivalent "academy_cancelled" → never deduct).

## State machines (authoritative)

**RESCHEDULE_REQUEST:** `pending → accepted | rejected | escalated → (accepted|rejected) | expired`
(expiry on: TTL with no escalation resolution, or Window-close before original).

**CLASS_SESSIONS.status:** `scheduled → reschedule_requested → scheduled | moved` ;
`scheduled → completed | cancelled_student | cancelled_instructor | cancelled_staff`.
`moved` is terminal for that row; the successor row starts at `scheduled` carrying `rescheduled_from`.
