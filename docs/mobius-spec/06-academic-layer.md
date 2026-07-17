# 06 — Academic Layer (Session Notes)

Covers: per-session per-student instructor notes, the attendance+notes surface, nudges, visibility,
edit/lock rules. Reads with `01 §4–5`, `02`. Deduction side of attendance is `04`.

## Core rules

- **Template per student per session:** `performance`, `improvements`, `free_notes`. All optional —
  hard-requiring notes yields "good job 👍" ×40, which devalues the channel worse than silence.
- **One post-session surface:** attendance marking (the billing linchpin) and the note template are the
  SAME screen — instructor marks present/absent per student and can fill the template inline. Habit
  piggybacks on the mandatory-ish action.
- **Nudges, not gates:** (a) "notes pending" reminder to instructor on the same
  `attendance_autocomplete_hours` timer (one timer, two nudges); (b) per-instructor/per-class
  **note completion rate** on the staff dashboard (next to cancellation-rate — `08`); staff manages it
  as a people matter.
- **Visibility: everyone reads, only the authoring instructor writes.** Guardian + student portals show
  notes verbatim (full-visibility decision). Design the guardian empty state deliberately: show
  attendance + class-level topic instead of a shaming "no notes yet" void.
- **Edit rules (INV-5):** freely editable for `session_record_lock_days` (7) after session end —
  symmetric with billing adjustments: *everything about a session is mutable for 7 days, then frozen.*
  After lock: staff unlock (reason, logged). Every edit appends to `versions` and surfaces a visible
  "edited Jul 20" stamp in portals (guardians see live records; silent history rewrites are a trust
  problem and a dispute generator).

## User stories

### ACA-1 — Instructor records attendance + notes in one pass
*As an instructor, right after class I want to mark attendance and jot each student's performance on one
screen, so that the record is done before I leave the room.*

Flow: session card → roster list → per student: attendance toggle (present / absent) + collapsed
template (performance, improvements, free notes) → save-all. Partial saves fine; unmarked students fall
to the auto-complete fallback (`04`).

AC:
- **Given** a 6-student group session, **then** one save writes ≤6 SESSION_ATTENDANCE + ≤6
  SESSION_NOTES rows in one request.
- **Given** notes skipped, **then** attendance still saves and billing proceeds (notes never block money).
- **Given** the reminder fires at +24h, **then** it deep-links this exact surface pre-filtered to
  missing entries.

### ACA-2 — Guardian reads the record
*As a guardian, I want each session's attendance and the instructor's note on my child's timeline,
so that I can see learning happening.*

AC:
- **Given** a session with a note edited twice inside the window, **then** the portal shows the latest
  text + "edited" stamp; tapping shows edit timestamps (not necessarily full diffs) —
  `versions` retains payloads for staff/audit.
- **Given** no note, **then** the entry shows attendance + class topic (no empty-shame state).

### ACA-3 — Staff monitors note completion
*As staff, I want completion rates per instructor and per class, so that I can coach low performers
before parents complain.*

AC: rate = notes-with-any-field / attendance-marked student-sessions, trailing 30 days; drill-down lists
missing sessions; threshold highlight configurable later (not a v1 knob).

### ACA-4 — Post-lock correction
*As an instructor, I want to fix a factual error in a locked note, so that the record is accurate.*

Flow: edit attempt post-lock → "request unlock" → staff task (reason) → staff unlocks that note row for
48h → edit (versioned, stamped) → auto-relock.

## Out of scope (explicitly, v1)

Homework assignment/submission tracking, gradebooks/scored assessments, periodic rollup progress
reports (monthly summaries) — the per-session template is the v1 academic record. Rollups compose from
it later without schema change (notes are already per-student per-session).
