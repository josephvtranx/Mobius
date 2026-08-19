# Feature gap map — 2026-08-10

Eight parallel end-to-end traces over every feature domain (auth/platform, staff
rosters & classes, scheduling & sessions, tasks/requests/subjects, finance,
instructor, family, admin & infra). Every feature traced through the full chain:
page → service → route mount → controller → SQL/tables → response shape →
rendering. All claims verified with file:line evidence at HEAD. The 2026-08-09
audit was used only for leads; each repeated claim was independently
re-verified (corrections listed at the bottom).

---

## Verdict summary

| # | Feature | Verdict |
|---|---------|---------|
| 1 | Multi-tenant login | PARTIAL — works, but is now one-step (docs stale); tenant `is_active` never enforced |
| 2 | Self-registration | PARTIAL — works, but staff self-registration is an open privilege escalation |
| 3 | Institution registration funnel | BROKEN — double-prefixed mount, every submission 404s |
| 4 | Refresh / logout / verify | PARTIAL — refresh solid; logout never revokes; verify can 500-then-pass |
| 5 | Password change/reset | UNWIRED / BROKEN — endpoints exist, zero UI; no reset path at all |
| 6 | Profile & picture upload | BROKEN (picture) — wrong URL base, ephemeral disk, unauthenticated serving |
| 7 | Messaging | WORKING — best-wired feature; scope + notification gaps |
| 8 | Notifications (in-app) | WORKING — bell works; many events render as raw slugs |
| 8b | Email pipeline | UNREACHABLE — zero emails can ever send end-to-end today |
| 9 | Rosters (student/instructor/staff/class) | PARTIAL — staff roster unprotected; ClassRoster can't display subjects |
| 10 | Student management / drill-downs | UNWIRED — endpoints exist; staff can't reach or use them |
| 11 | Guardian linking | PARTIAL — link works; created guardian can never log in |
| 12 | Class management | BROKEN (creation) — UI can't create a class; end-class breaks live classes |
| 13 | Enrollments | PARTIAL — direct enroll works; wizard doesn't enroll; no un-enroll path |
| 14 | Operations scheduling | PARTIAL — read-only current-week viewer; can't schedule anything |
| 15 | Session lifecycle | PARTIAL — writes work; no read endpoint; reasons write-only |
| 16 | Reschedule flow | PARTIAL — family+instructor wired; staff escalation dead-ends |
| 17 | Rooms | PARTIAL — no create/edit UI; assigner ignores `is_active` |
| 18 | Attendance | PARTIAL — marking works; review is blank; cancelled shows green |
| 19 | Task inbox | PARTIAL — queue works; 3 kinds unresolvable, most deep links dead |
| 20 | Membership requests | PARTIAL — staff side done; families can't see, withdraw, or leave |
| 21 | Note-unlock flow | BROKEN — request button always 400s AND grant has no caller |
| 22 | Subjects & groups | BROKEN — 3 endpoints 500 on v2 schema; group UI can't show its data |
| 23 | Instructor qualifications | PARTIAL + DESTRUCTIVE — the only UI wipes specialties on every save |
| 24 | Financial dashboard | PARTIAL — client-side sums over truncated lists; costs = payroll only |
| 25 | Payments | PARTIAL — overdue invoices unactionable; methods can't be created |
| 26 | Invoices | PARTIAL — no delivery/notification; out-of-band payments can't be applied |
| 27 | Wallets / credits | PARTIAL — money-in only; two unreconciled ledgers; no package sales |
| 28 | Payroll | PARTIAL — $0 silent payouts; no approval/void; staff rates uneditable |
| 29 | Reports | PARTIAL — 2 operational reports, zero financial; latent 500 |
| 30 | Instructor availability | PARTIAL — grid works; validation dead; no instructor time-off UI |
| 31 | My Classes | PARTIAL — derived from session history; primary CTA guaranteed to fail |
| 32 | Feedback / notes | PARTIAL→BROKEN — write works once; no read-back; unlock dead (see 21) |
| 33 | Instructor inbox | PARTIAL — 2 request types wired; termination unfileable |
| 34 | Instructor Pay | WORKING (thin) — real rows; unverifiable and $0-prone |
| 35 | Instructor cancel (RSC-3) | WORKING — but the required reason is write-only everywhere |
| 36 | Guardian portal | PARTIAL — solid dashboard; payment-links half permanently empty |
| 37 | Catalog & booking | PARTIAL — guardian dead ends; slots are windows, not slots |
| 38 | Student schedule/classes/record | PARTIAL — works for students; unreachable/broken for others |
| 39 | Guardian billing | PARTIAL — no pay path; hard-breaks for staff viewers |
| 40 | Guardian requests | BROKEN — hard-errors for 2 of 3 allowed roles; no withdraw of anything |
| 41 | Notification prefs | BROKEN — no read-back, clobbers JSONB, email opt-in unwritable |
| 42 | Platform-admin auth | PARTIAL — works in code; no production bootstrap for first admin |
| 43 | Tenant provisioning | BROKEN in production — provisioner only registered in tests |
| 44 | Tenant configuration | PARTIAL — 11/15 knobs live; audit trail absent; client never reads settings |
| 45 | Cross-tenant finance | WORKING (thin) — serial fan-out, invented currency, gross-only |
| 46 | Migrations infra | WORKING — schema_version never written; poor failure ergonomics |
| 47 | Auth forensics (`auth_logs`) | UNWIRED — logs the wrong events, readable by no one |

---

## P0 — Security

- **S1. Anyone with an institution code can self-register as `staff` with a
  self-declared salary.** `authRoutes.js:29` accepts `role:'staff'`;
  `StaffRegistration.jsx:52-55` passes `salary`/`hourly_rate` through to
  `authController.js:312-329`. Unauthenticated escalation to the full ops
  surface (rosters, finance, wallets, payroll) + attacker-controlled payroll.
- **S2. `GET /staff/roster` has no role gate.** `staffRoutes.js:8` is
  `authenticateToken` only, and `staffController.js` does no redaction — any
  student/guardian/instructor can read every staff member's salary, rate,
  email, phone, age, gender.
- **S3. `GET /classes/:id` has no role gate** (`classRoutes.js:204`) and
  returns the full roster with student names; any user can enumerate class ids
  from the catalog and read every roster.
- **S4. `/uploads` is unauthenticated and cross-tenant** (`app.js:153`; single
  shared directory, tenant separation commented out in `upload.js:20-28`).
- **S5. `/api/admin/login` is outside `authLimiter`** — 300 attempts/min/IP
  against the highest-privilege login (`app.js:114` vs `middleware/auth.js:24-30`).
  Platform-admin and tenant JWTs also share `JWT_SECRET`, and platform admins
  have no token revocation.
- **S6. Access tokens are irrevocable** — `token_version` is checked only on
  refresh (`authController.js:583`), never in `authenticateToken`; and
  `POST /auth/logout` has **zero client callers** (`ProfileCard.jsx:50` is
  local-only), so refresh tokens survive logout for 7 days.
- **S7. Institution-registration endpoint** (once its 404 is fixed) is an
  unauthenticated HTML-injection + spam vector at 300/min
  (`registerInstitution.js:20-33`).
- **S8. Registry login never checks `institutions.is_active`**
  (`tenantPool.js:13-17`) — suspending a tenant does not lock anyone out; and
  no endpoint can set `is_active` anyway.

## P0 — Data loss / corruption

- **D1. Any staff edit of an instructor silently wipes ALL subject
  qualifications.** `InstructorRoster.jsx:677-689` never prefills
  `subjectAssignments` (its own TODO says so); `handleSubmit:751-757` filters
  empties → `instructorController.js:134-137` unconditionally
  `DELETE FROM instructor_specialties` then re-inserts nothing. A salary edit
  makes the instructor unbookable and unassignable
  (`classRoutes.js:78`, `bookingRoutes.js:70`). Fix: prefill from
  `GET /instructors/:id` (already returns full specialty rows).
- **D2. Payroll silently pays $0 and locks the period.** Self-registered
  instructors have NULL `employment_type`/rates (`authController.js:288-296`);
  `payroll.js:22-32` coerces to hourly × $0; `payrollRoutes.js:51-56` inserts
  the $0 row, and the exists-guard then reports "Already paid" forever.
- **D3. Ending a class kills it immediately regardless of `ends_on`**
  (`classRoutes.js:624` flips `status='ended'`) — it vanishes from family
  schedules and the catalog while its remaining sessions still run.
- **D4. Time-off writes are timezone-corrupt.** `POST /instructors/:id/unavailability`
  has no `requireUtcIso`; the only writer sends naive `datetime-local` strings
  (`InstructorRoster.jsx:1358-1385`) into TIMESTAMPTZ — slot subtraction then
  blocks the wrong hours. Also A4: the availability date-window save 400s on
  `YYYY-MM-DD` and the error is swallowed (`InstructorRoster.jsx:285-287`).

## P0 — Live breakages (no decision needed)

- **B1. Class creation cannot succeed from the UI.** `CreateClass.jsx:120`
  reads `i.instructor_id ?? i.user_id` but the roster endpoint returns
  `id`/`instructorId` (`instructorController.js:57-58`) → value falls back to
  the option text → `NaN` → `null` → 400 "Instructor not found".
- **B2. Tenant provisioning is test-only.** `tenantProvisioner.js:27-31`
  throws unless `setTenantProvisioner` was called; only `testEnv.js:175`
  calls it. Every production "Provision academy" click 500s. Also non-atomic
  across 3 DBs with no rollback (`adminRoutes.js:114-124`).
- **B3. No production bootstrap for the first platform admin** —
  `platform_admins` is only ever INSERTed by the test harness; the console is
  unenterable on a real deploy.
- **B4. Institution registration funnel 404s** (double-prefixed mount,
  `registerInstitution.js:6` + `app.js:215`) — carried from prior audit,
  still unfixed. Requests are also never persisted (email-only).
- **B5. Note-unlock is broken at BOTH ends.** The request button always 400s —
  `SessionAttendance.jsx:45` never sends the required `reason`
  (`sessionRoutes.js:303-304`) — and `POST …/unlock` has zero client callers.
  Prior audit's "request side fully wired" was wrong.
- **B6. No email of any kind can be sent.** The only writer of
  `notification_prefs` sends `{mode}` only (`Profile.jsx:45`) and full-column
  overwrites (`guardianPortalRoutes.js:105`), so `email:true` is unwritable →
  `notify.js:93` skips every email row; the only other `sendEmail` caller is
  the 404'd institution form. Resend transport + 10 templates + the 5-min job
  are dead code.
- **B7. Guardian accounts can never log in** — temp password minted and
  discarded (`studentGuardianV2Routes.js:85`), `credentials_issued` response
  field ignored by the UI, no reset endpoint, `/auth/change-password` has zero
  callers. Gates the entire family experience.
- **B8. Overdue invoices are unactionable.** Server returns *derived*
  `status:'overdue'` (`invoiceRoutes.js:15-16,54`); `Payments.jsx:196` gates
  Pay/Cancel on `status === 'pending'` — the invoice most needing collection
  is the one staff can't touch.
- **B9. Latent 500 on the reports dashboard.** `reportRoutes.js:82` casts
  `staff_tasks.subject_id::int` in a JOIN while `auto_complete_verify` rows
  store UUIDs there — plan-dependent crash of `/reports/dashboard`, which also
  feeds finance Overview.
- **B10. Three subject endpoints are guaranteed 500s** against v2 schema:
  `PUT /subjects/:id` writes nonexistent `department`/`description`
  (`subjectRoutes.js:211-214`), and both DELETEs query
  `class_sessions.subject_id` which doesn't exist (`:235`, `:301`; also
  `GET /subjects/:id` at `:130`).
- **B11. ClassRoster can never display subjects.** It fetches the flat
  `/subject-groups` (no `subjects` array) but renders `group.subjects`
  (`ClassRoster.jsx:22,97`); the nested endpoint
  (`/subjects/subject-groups`) has zero callers. Subjects are create-only and
  invisible.
- **B12. GuardianRequests and GuardianBilling hard-error for allowed roles.**
  Both call `getPortal()` unconditionally (`GuardianRequests.jsx:44`,
  `GuardianBilling.jsx:47`), which is guardian-only → students (Requests) and
  staff (both) get "Access denied" on routes that admit them.
- **B13. `GET /auth/verify` sits under `authLimiter`** and fires on every route
  change (`ProtectedRoute.jsx:21`) — a shared-NAT office can exhaust the
  login limiter by navigating.
- **B14. Changing your email in Settings self-locks the account** —
  `PATCH /users/profile` never syncs `user_directory` (registry-first login
  then fails); `DELETE /users/:id` similarly orphans the directory row,
  permanently blocking that email from re-registering.
- **B15. Dev proxy flag mismatch** — `api.js:14` treats unset
  `VITE_USE_PROXY` as proxy-on; `vite.config.js:12` requires `'true'` → with
  the var unset every dev API call returns index.html.
- **B16. Adult-student registration is unreachable** — server supports
  guardian-less students (GRD-4, `can_purchase`), but the form requires ≥1
  guardian (`StudentRegistration.jsx:24-26,60`), and `PATCH /students/:id/purchasing`
  has no UI to fix mis-flagged accounts.
- **B17. Attendance "Review" is a blank grid** — `sessionRoutes.js` has zero
  GET routes, so `SessionAttendance.jsx:56-60` can't read back marks; past
  attendance is unviewable and re-saving would re-mark. Also `Attendance.jsx:45-46`
  renders cancelled/moved sessions as green "Marked".

## P1 — Scheduling-integrity gaps (new this pass)

- `instructorFree` never consults `instructor_availability`
  (`slotFinder.js:132-148`) — bookings/reschedules can land entirely outside
  declared working hours.
- `studentCollision` is never called on enrollment or class creation
  (`enrollWithinTx`, `classRoutes.js:227-291`) — double-booked students.
- The nightly session generator swallows conflicts as `skipped` with no task
  or log (`scheduleJobs.js:183-191`) — recurring classes silently stop
  materializing on conflicted weekdays.
- `bestFitRoom` and room counts ignore `rooms.is_active`
  (`slotFinder.js:38,153`) — decommissioned rooms keep getting booked; and
  roomless (`room_id NULL`) sessions escape both the exclusion constraint and
  the busy-interval sweep → open-slot search over-reports.
- Open slots are merged *windows*, not slots — `BookSession.jsx:128` and
  `StudentSchedule.jsx:157` render one button per window, so families can only
  book each window's start minute; `EnrollmentWizard.jsx:101-108` books the
  **entire window** (potentially 8h) as one session.
- Booking credit gate reads raw `wallets.balance`, not
  `computeWallet().available` (`bookingRoutes.js:87-89`) — committed credits
  double-counted as spendable.
- No room-creation UI (`POST /rooms` unwired) → a new academy's `bestFitRoom`
  returns null → **every booking 400s** "No room is available".
- Current-week sessions before "now" are hidden from the staff grid
  (`studentGuardianV2Routes.js:175` `> CURRENT_TIMESTAMP`); week browsing
  still disabled; the staff Scheduling page has no scheduling actions at all,
  yet is the deep-link target for both escalation task kinds.
- Staff `/inbox` (the only place to approve reschedules/bookings) is absent
  from staff nav; `/operations/schedule` hard-redirects staff away
  (`Schedule.jsx:55`) despite allowing them.
- Slot holds have zero UI — a stuck hold blocks an instructor's slot with no
  operator visibility or release.
- Biweekly Sunday classes drift a week on nightly regeneration
  (`scheduleJobs.js:143` parity bug).

## P1 — Write-only / read-only data (feature halves)

- **Cancel reasons are write-only everywhere**: `class_sessions.cancellation_reason`
  (2 writes, 0 reads), `session_attendance.cancel_reason/cancel_note`
  (dedicated migration, 0 reads), and `NotificationBell.jsx:20` drops
  `payload.reason` — instructors/guardians are forced to give reasons no one
  can ever see. Appeal-review staff tasks carry no reason either.
- **Task deep links are mostly dead**: `delinquent_balance` details lack
  `student_id` (`deductionEngine.js:162`), note-unlock lacks `class_id`
  (`sessionRoutes.js:316`), termination lacks `class_id`
  (`classRoutes.js:545`), `auto_complete_verify`/`appeal_review` link to the
  class instead of the session; WalletView ignores the `?student=` param.
- `assigned_to` / `in_progress` / `'other'` task kind: still unreachable.
  Resolved tasks invisible (no history view); badge caps at 500 silently.
- Families can never file a **leave** request (only `kind:'join'` is ever
  sent, `Catalog.jsx:31`); `'cancelled'` membership status unreachable (no
  withdraw); no family-facing read of join requests (one-shot toast); staff
  Home mislabels leave requests as joins and approves without `waive_window`
  (`Home.jsx:246-252`).
- `reschedule_chain`/`rescheduled_from` audit trail: written, displayed
  nowhere. Session-note `versions` history: written, displayed nowhere.
  `instructor_availability.type/notes`: written, read nowhere.
- Instructors have no note read-back — `Feedback.jsx` fakes "Sent ✓" in
  memory; only the latest past session per class is writable (`:89`); no
  zero-classes empty state (still).
- `time_logs`: readers, no writers (hourly staff structurally unpayable;
  staff hours always empty). Staff pay rates uneditable after signup.
  `GET /payroll/mine` allows staff but no staff UI/nav reaches it.
- Instructor termination request: staff render side exists, instructor filing
  UI does not.
- Registration discards required `age` field (`authController.js:111`);
  signup skips password-strength validation that change-password enforces;
  invalid institution code at signup → raw 500.

## P1 — Finance integrity

- Every finance KPI is a client-side sum over a truncated list:
  payments LIMIT 500 (`paymentRoutes.js:81`), payroll LIMIT 200
  (`payrollRoutes.js:74`), students LIMIT 500 — silent understatement past the
  caps. No server-side financial reporting layer exists at all.
- No invoice or payment ever notifies the family (no `notifyFamily` in either
  route file) — bills and receipts are invisible unless the guardian
  navigates to Billing. Partially-paid invoices display full amount
  (`amount_paid` returned, never rendered).
- Out-of-band payments can never be applied to an invoice (no link endpoint);
  no amend/credit-note path; `payment_links` has a reader and renderer but no
  writer (guardian "needs attention" half permanently empty).
- Two unreconciled ledgers (dollars vs credits), no conversion anywhere;
  money-out structurally impossible (`refunds` 0 refs, `cashout` 400s);
  goodwill refunds only fakeable as negative adjustments.
- `walletStatus()` never receives settings — all four call sites pass one
  arg (`derive.js:52-58`), and no tenant-facing settings endpoint exists, so
  every low-balance badge uses hardcoded 2×5 and can contradict server
  notifications.
- Payroll: no approval/void/correction, no prorating (1-day period pays full
  monthly salary), preview hours/rate not shown to instructors ("Paid on" is
  actually row-insert time).
- Cross-tenant finance: serial per-tenant queries on the request path,
  hardcoded USD (no currency column), gross-only, `unreachable` flag rendered
  identically to zero revenue.

## P1 — Admin & infra

- 4 settings knobs are UI theater (`payment_modes_enabled`,
  `payment_link_ttl_hours`, `consultation_hold_ttl_min`, `trial_class_enabled`);
  `institution_settings_history` never written; `updated_by` structurally
  unfillable (FKs tenant users, writer is a platform admin); decimal/empty
  input → opaque 400.
- `institutions.schema_version` never written (by console or migration
  runner); `logo_url` inert; `is_active` has no writer and no enforcement.
- `migrate.js --only` is case-sensitive against CITEXT; failures are raw
  unhandled rejections with no tenant identification; `--dry-run` lists
  nothing.
- `auth_logs` records the wrong thing: authorization outcomes on every
  role-gated request (write amplification), never login attempts; no
  attribution columns; no read path. Admin actions have no audit trail at all.
- Email job has single-attempt delivery, no retry, no failure surface; adding
  `RESEND_API_KEY` later would mail the entire stale backlog.

## P2 — Dormant slices (unchanged decisions needed)

Money-out (refunds/cashout/Top-Up spec), time tracking (`time_logs` writers),
PA/analytics (`pa_codes` write-only; `operating_expenses`/`financial_periods`
dead), `instructor_time_requests` + `instructor_group_specialties` (schema
only), onboarding consultation holds, Kakao channel, enrollment wizard
identity (it books one session; package selector display-only), digest mode
(offered, unimplemented).

---

## Corrections to the 2026-08-09 audit

| Prior claim | Now |
|---|---|
| `is_waitlist` written but never read | **FIXED** — read at `MembershipRequests.jsx:57-58` and `Catalog.jsx:32` |
| Instructor-qualification management has no UI | **WRONG** — UI exists (`InstructorRoster.jsx:245`) but is destructive (D1) |
| Note-unlock: "instructor request side is fully wired" | **WRONG** — the request button always 400s (B5) |
| Booking-only families cannot message their instructor | **OVERSTATED** — only while pending; acceptance flips class to `active` and messaging works |
| Instructor self-registration "may seed some specialties" | **WRONG** — it seeds none (`authController.js:288-296`) |
| "Payments… proper loading/error/empty states" | **WRONG** — `Payments.jsx:28-29,188,205` and `WalletView.jsx:42,94` have no loading state |
| Two-step login (client docs) | **STALE** — login is one-step; `setInstitutionCode` and `POST /api/institution` have zero callers |
| `conflictCheck.js`, `react-big-calendar` (docs) | **STALE** — deleted / never a dependency; successor is `slotFinder.js` |

## Verified clean (this pass)

Messaging chain (contacts→conversations→messages, gates, polling); in-app
notification bell scoping; reschedule respond/accept transactionality (with
room re-resolution rollback); attendance deduction engine idempotency
(`delta:0` on re-mark); direct enrollment tx (seat→room→credit gates + error
codes surfaced verbatim); all 7 session statuses and all reschedule statuses
reachable; v2 route mount ordering (no shadowing); instructor Pay/Inbox
response shapes field-for-field; admin console boundary tests.
