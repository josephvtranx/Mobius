# 03 — Scheduling & Classes

Covers: class creation, instructor assignment, rooms, rolling group rosters, catalog & join requests,
self-serve one-off 1:1 booking. Reads with: `01-domain-model.md`, `02-policy-knobs.md`.
Reschedules/cancellations live in `07`. Onboarding wizard (new-client path) is unchanged — it creates a
CLASS under the hood exactly like SCH-1, pre-filled by the matcher.

## Core rules

- Staff creates ALL classes. `class_type` chosen first; group adds `student_limit`.
- Recurrence: weekly default; biweekly; custom. `none` = one-off single instance (1:1 only).
- End: `ends_on` date or open-ended (NULL). Open-ended sessions materialize on a rolling horizon.
- Instructor assignment is manual, **assisted**: the picker ranks instructors by availability fit for the
  chosen schedule ("half-matcher" — same scoring service as onboarding `POST /matching/search`, without
  auto-selection). `ASSUMPTION[US-4]:` full-time instructors auto-confirm; `ASSUMPTION[US-3]:` part-time
  selection fires an INSTRUCTOR_TIME_REQUEST with `ASSUMPTION[US-8]` fallback timeout.
- Room picker: shows AVAILABLE rooms for the chosen time pattern; conflicting rooms hidden behind a
  "Show conflicting spaces" toggle (visible but clearly marked/unselectable-by-default).
- Two-number capacity model: `student_limit` = business seat cap (hard block always);
  room capacity = physical cap (block + one-click swap at add time; warn-only at creation).
- INV-3: every session write is protected by the unique hold/session index; racing writers get 409.

---

## User stories

### SCH-1 — Staff creates a class (both types)
*As a staff member, I want to create a 1:1 or group class with instructor, schedule, room, cost, and
capacity in one motion, so that a class is bookable/enrollable the moment I save it.*

Flow:
1. `+ New Class` → choose `class_type` (1:1 | group). Group reveals `student_limit` field.
2. Subject → schedule builder: recurrence (weekly default | biweekly | custom | one-off[1:1 only]),
   day/time pairs, `starts_on`, `ends_on` or open-ended toggle.
3. Instructor picker: ranked by availability fit for that pattern (score from matching service);
   full-time = "auto-confirms" badge; part-time = "needs confirmation" badge + time request on save.
4. Room picker: available rooms for the whole pattern; "Show conflicting spaces" reveals the rest.
   Warn (not block) if `student_limit` > selected room capacity.
5. `session_credit_cost` (int, required).
6. Save → transaction: CLASS row, session materialization (full for fixed-end; horizon for open-ended),
   room per session, holds→confirmed, notifications (instructor).

Acceptance criteria:
- **Given** a group class with `student_limit=8` and room capacity 6, **when** staff saves,
  **then** save succeeds with a visible warning ("Room seats 6 of 8") and an audit note.
- **Given** recurrence=custom with an invalid rule, **then** save is blocked with inline validation.
- **Given** a part-time instructor selected, **then** sessions save as `pending instructor` and an
  INSTRUCTOR_TIME_REQUEST is created (`ASSUMPTION[US-3]`).
- **Given** another admin claims the same instructor slot concurrently, **then** the loser receives 409
  and the picker re-ranks (INV-3).

### SCH-2 — Staff adds a student to a group class (rolling roster)
*As a staff member, I want to add a student to a group class at any time, so that rosters can grow
whenever a seat is open.*

Gate sequence (single transaction with ENROLLMENTS insert):
1. **Seat check:** active enrollments < `student_limit` → else hard block ("Class is full — raise limit?").
2. **Room check:** active enrollments + 1 ≤ capacity of each future session's room → else block with
   one-click swap: "Room 201 caps at 10 — Room 305 (cap 14) is free Mon/Wed 5–6:30 — swap?" Swap
   updates future sessions' room_id and queues room-change notices to enrolled families.
3. **Credit gate** (see `04`): fixed-end → balance ≥ cost × remaining sessions; open-ended → balance ≥
   cost × `enrollment_runway_sessions`. Fail → show shortfall + "collect top-up" shortcut
   (`ASSUMPTION[TOPUP]` bundles surface here).
4. Insert enrollment → guardian + student notified; sessions appear on their schedules.

Acceptance criteria:
- **Given** a student 5 credits short, **then** the add is blocked and the shortfall amount + top-up CTA
  are displayed; after top-up the same add succeeds without re-entry.
- **Given** the add exceeds room capacity but not `student_limit`, **then** the block offers available
  larger rooms only for the class's time pattern; accepting swaps and completes the add atomically.
- **Given** a mid-series room swap, **then** every enrolled guardian/student receives a room-change
  notice and sessions display the new room.

### SCH-3 — Student/guardian browses the group catalog and requests to join
*As a student or guardian, I want to browse open group classes and request a seat, so that I can express
demand without waiting for staff to think of me.* (`group_catalog_visible`)

- Catalog card: subject, instructor, schedule, per-session cost, seats left. No self-serve join —
  "Request to join" → CLASS_MEMBERSHIP_REQUESTS(kind=join) → staff task.
- Staff approves → runs SCH-2 gates → enrolled (or rejects with reason → requester notified).
- Rationale (market): group placement in KR academies is level-matched (반배정) after staff vetting;
  the request is the demand signal, staff keeps roster control.

Acceptance criteria:
- **Given** a full class, **then** the card shows "Full — join waitlist" and the request is tagged
  waitlist (staff sees it when a seat frees).
- **Given** staff approval of a requester who no longer passes the credit gate, **then** approval is
  blocked with the shortfall (same surface as SCH-2 step 3).

### SCH-4 — Student/guardian books a one-off 1:1 session (self-serve)
*As a student or guardian, I want to book a single 1:1 session from an instructor's open calendar,
so that I can get tutoring without a staff call.* (`self_serve_booking_enabled`)

Flow:
1. Pick instructor (any active instructor with open availability) → calendar renders painted
   availability minus sessions minus active holds — the matcher's data, read-only.
2. Pick slot → **credit gate:** balance ≥ that class's one-session cost (cost = PA default 1:1 rate or
   instructor/subject rate — staff-configured pricing table; `ASSUMPTION[TOPUP]` if tiered).
3. Request created: one-off CLASS (recurrence=none) in `pending` + SLOT_HOLD(origin=self_serve_booking,
   TTL=`instructor_response_window_hours`).
4. Instructor accepts → session confirmed, room auto-assigned (capacity-fit), notifications.
   Rejects → hold released, requester notified with nearest-alternative suggestions.
   Silence → staff escalation task (`ASSUMPTION[US-8]`), then expiry.

Acceptance criteria:
- **Given** insufficient balance at step 2, **then** the slot is not requestable; shortfall + top-up CTA
  shown (never a hold on unfunded requests).
- **Given** two families request the same slot, **then** the second hold POST 409s and the calendar
  refreshes (INV-3).
- **Given** no room exists at the chosen time, **then** the slot renders unavailable (room check is part
  of slot render, not post-approval surprise).

### SCH-5 — Staff edits a class's schedule/recurrence (series-level change)
*As a staff member, I want to change a class's recurring pattern going forward, so that permanent family
or instructor schedule changes are handled without touching history.*

- Future-only (INV-4): pick an effective date; sessions after it are regenerated on the new pattern;
  completed/past sessions untouched; conflicts re-checked (409 path re-offers).
- All enrolled families + instructor notified with old→new pattern diff.
- Student/guardian-side series changes are **requests to staff** (contact/appeal), never self-serve
  (blast-radius rule — see `07` rationale).

### SCH-6 — Staff ends or terminates a class
- `ends_on` set/moved earlier (future-only) → sessions after date removed; enrolled notified.
- `terminated` (immediate): future sessions removed; **no deductions existed for them (INV-1), so no
  refunds needed**; any already-deducted future session (edge: pre-deduct never happens — assert) —
  n/a by design. Enrollments → `removed`, families notified, prospect/retention task optional.
- Instructor-initiated termination is a REQUEST → urgent staff task (see `07` RSC-5).

---

## Edge rules

- **One-off classes** never appear in the group catalog; they exist only via SCH-4 or staff creation.
- **Biweekly/custom cadence** interacts with runway: "next N sessions" counts occurrences, not weeks.
- **Instructor availability truth:** calendars shown to families are derived from
  INSTRUCTOR_AVAILABILITY minus CLASS_SESSIONS minus active SLOT_HOLDS — identical query path as the
  matcher, one service, no drift.
