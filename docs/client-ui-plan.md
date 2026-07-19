# Client UI roadmap — role-by-role requirements

Derived from the spec's user stories (`docs/mobius-spec/01–08`) and the live v2 server surface.
Status legend: ✅ done · 🔶 template exists — needs UX + styling · ❌ missing · 🔧 needs a small server endpoint first.
Working cadence: one step at a time — build → Playwright screenshot verify → user review → commit.

## 1. Design conventions (all surfaces)

- **Visual language** (established in `css/login.css` + `css/home.css`): ink `#16303a`, teal `#2e9d8d` (accent `#63b3a6`), muted `#64827e`, white cards radius 14–16 with border `#e3eeec` on soft-wash backgrounds; Poppins.
- Every page has **loading, empty, and error states**. No raw `JSON.stringify` notices; no raw enum strings (shared status-label map); dates via `isoToLocal`; server error `message` rendered verbatim.
- Destructive/consequential actions use `components/Modal.jsx` (never `window.confirm`) and state the **money effect before confirming** (RSC-2: "credit will not be used" vs "past the deadline — credit forfeited; you can appeal").
- Spec invariants that shape UI: INV-1 only attendance moves money · INV-2 original session stands until swap confirmed · INV-3 conflicts 409 → refresh/re-offer · INV-5 7-day record lock → staff unlock flow · INV-6 no self-serve exits (requests, not actions) · INV-7 every notice names the concrete object.

## 2. Requirements by role

### Staff

| Story | Surface | Status | Notes |
|---|---|---|---|
| — | Home dashboard (KPIs, needs-attention, quick actions) | ✅ | shipped `fa0f7c31` |
| SCH-1 | Class-create wizard: type → schedule builder → instructor picker (auto-confirm / needs-confirmation badges) → room picker w/ "show conflicting" toggle → cost | 🔶 `CreateClass.jsx` | warn-not-block on room capacity; 409 → re-rank |
| SCH-2 | Class detail: add-to-roster with the 3-gate errors (seat full / room-swap offer / credit shortfall + top-up CTA) | 🔶 `ClassDetail.jsx` | surface server gate responses verbatim |
| SCH-5 | Effective-dated recurrence editor (future-only, INV-4) | 🔶 `ClassDetail.jsx` | |
| SCH-6 | End vs terminate controls w/ consequence copy | 🔶 `ClassDetail.jsx` | Modal, not window.confirm |
| BIL-3 | Price editor w/ `effective_from` | 🔶 `ClassDetail.jsx` | one notice per change (server does this) |
| BIL-1/2 | Wallets: ledger, manual adjustments, delinquency states, auto-complete verify queue | 🔶 `WalletView.jsx` | INV-6: block-don't-unenroll messaging |
| SCH-3/RSC-4 | Membership requests approve/reject (+ waive window) | 🔶 `MembershipRequests.jsx` | |
| ACA-3 / 08 | Reports: signals + note-completion drilldown | 🔶 `ReportsDashboard.jsx` | |
| 08 registry | **Unified staff task inbox** (join/leave/escalations/unlock/appeals/terminations) | ❌🔧 | needs `GET /api/tasks` (staff_tasks table exists) |
| 02 knobs | **Settings / policy-knobs editor** | ❌🔧 | needs settings GET/PATCH routes; future-only warnings |
| GRD-2 | Student profile: guardian linking, make-primary, purchasing toggle | ❌ | server routes exist (`/students/:id/guardians`) |
| — | Scheduling calendar rebuilt on v2 sessions | ❌🔧 | needs a sessions-range read; retires legacy `Scheduling.jsx` |
| — | Rosters (student/instructor/staff/class) | ✅ | run on v2 queries; minor cleanup only |

### Instructor

| Story | Surface | Status | Notes |
|---|---|---|---|
| — | Home (week schedule + inbox preview) | ✅ | shipped `fa0f7c31` |
| RSC-1 / SCH-4 | Inbox: accept/reject reschedules + bookings, escalation countdown | 🔶 `InstructorInbox.jsx` | kill `JSON.stringify` notices |
| ACA-1 | One-pass attendance + notes (roster list, toggles, collapsed note template, save-all, partial OK) | 🔶 `SessionAttendance.jsx` | reminder deep-links land here pre-filtered |
| RSC-3 | Session cancel w/ required reason | ❌ small | session card action + Modal |
| ACA-4 | "Request unlock" affordance on locked notes | ❌ small | creates staff task |
| — | Availability editor (weekly windows + unavailability) | ❌ | verify the v1-era availability endpoints against v2 schema first |
| privacy | Never render wallets, payment state, or guardian contacts | rule | applies to every instructor surface |

### Student

| Story | Surface | Status | Notes |
|---|---|---|---|
| — | Home (sessions, credits, feedback) | ✅ | shipped `fa0f7c31` |
| RSC-1/2 | Schedule: Window-aware reschedule button, money-effect cancel dialog, appeal affordance | 🔶 `StudentSchedule.jsx` | INV-2 status chip while request pending |
| SCH-4 | Booking: painted availability slot picker, credit gate before hold | 🔶 `BookSession.jsx` | insufficient credits → shortfall + top-up CTA |
| ACA-2 | Record timeline w/ visible "edited" stamps, no-shame empty state | 🔶 `StudentRecord.jsx` | |
| SCH-3 | Catalog: seats-left cards, request-to-join / waitlist | 🔶 `Catalog.jsx` | no self-serve join |
| GRD-4 | Own wallet/ledger page (adult self-serve; minors get guardian-directed top-up copy) | ❌ small | reuse `GET /wallets/:id` |

### Guardian

| Story | Surface | Status | Notes |
|---|---|---|---|
| GRD-1 | Portal = their home: per-child cards (next sessions, available/committed, latest note), needs-action panel | 🔶 `GuardianPortal.jsx` | **next implementation step**; wallets never pooled across children |
| GRD-5 | Notification prefs editor (mode + email opt-in; urgent-can't-be-muted messaging) | 🔶 (inline select today) | email opt-in shipped server-side `718fa0c2` |
| shared | Child schedule / record / booking = the family pages above (guardian acts for student) | 🔶 | audit `requested_by` handled server-side |
| BIL-2 | Top-up / payment flow | ⏸ Top-Up spec | CTAs point to "contact the academy" until then |

### Cross-role

| Item | Status | Notes |
|---|---|---|
| Shared UI kit: Button/Card/Badge/EmptyState + status-label map (`components/ui/`, `css/ui.css`) | ❌ | **step 1** — everything else restyles onto it |
| Notifications bell + in-app feed | ❌🔧 | generalize the guardian-portal feed query to `GET /api/notifications/mine` |

## 3. Build order

1. **Shared UI kit + label map** (adopt in Home retroactively).
2. **Guardian portal polish + prefs editor** (GRD-1/5).
3. **Family flows**: StudentSchedule, BookSession, Catalog, StudentRecord.
4. **Instructor surfaces**: Inbox, attendance+notes, session cancel, unlock request.
5. **Staff classes suite**: ClassesList, ClassDetail (SCH-2/5/6 + BIL-3), CreateClass wizard.
6. **Staff money + queues**: WalletView, MembershipRequests, ReportsDashboard.
7. **Missing pages w/ one small tested endpoint each**: staff task inbox, settings editor, notifications feed + bell, student profile/guardian UI, student wallet page.
8. **Staff scheduling calendar v2** → retire legacy Scheduling/Schedule pages.
9. **Cleanup**: delete replaced legacy pages/CSS/services, unmount superseded v1 routers, drop ESLint legacy exemptions, decide academics mocks.

## 4. Parked (with owners)

Top-Up purchase UI, payment links, statutory cashout → **Top-Up spec** · finance dashboards → same · Kakao channel → delivery integration slice · trial classes → v1.1 · homework/gradebooks → out of v1 scope · academics mock pages → delete-or-build decision at step 9.
