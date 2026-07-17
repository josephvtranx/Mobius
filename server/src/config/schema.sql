-- =====================================================================
-- PostgreSQL Tenant Schema for Mobius — v2 (spec-aligned)
-- Design doc: docs/schema-v2.md  •  Spec bundle: docs/mobius-spec/
-- All instants UTC (TIMESTAMPTZ). Credits are integers; money is NUMERIC(10,2).
-- People/catalog tables use INT identity (existing code compatibility);
-- spec domain entities use UUID (gen_random_uuid()).
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- updated_at maintenance ----------------------------------------------
CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 1. IDENTITY & PEOPLE
-- =====================================================================

CREATE TABLE users (
  user_id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  password_hash   TEXT    NOT NULL,
  name            TEXT    NOT NULL,
  email           CITEXT  NOT NULL UNIQUE,
  phone           TEXT,
  -- guardian is a first-class login role (spec 05); vestigial admin removed (MODERNIZATION D2)
  role            TEXT    NOT NULL CHECK (role IN ('student','staff','instructor','guardian')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_login      TIMESTAMPTZ,
  profile_pic_url TEXT,
  token_version   INT NOT NULL DEFAULT 0,   -- bumped on logout/password change to invalidate refresh tokens
  password_updated_at TIMESTAMPTZ,          -- set by change-password; used by password-expiry checks
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE auth_logs (
  log_id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_address     TEXT,
  user_agent     TEXT,
  endpoint       TEXT,
  success        BOOLEAN NOT NULL,
  failure_reason TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_auth_logs_created ON auth_logs (created_at);

CREATE TABLE password_history (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- code depends on column name "id"
  user_id       INT  NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_password_history_user ON password_history (user_id, created_at DESC);

-- pa_codes: FK target replacing free-text pa_code (profit/analytics code)
CREATE TABLE pa_codes (
  pa_code_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE students (
  student_id    INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  status        TEXT NOT NULL CHECK (status IN ('enrolled','on_trial')),
  date_of_birth DATE,                      -- replaces stored age (minor determination, spec 05)
  grade         INT,
  gender        TEXT CHECK (gender IN ('male','female','other')),
  school        TEXT,
  pa_code_id    INT REFERENCES pa_codes(pa_code_id),
  -- purchasing rights (spec 05): default false for minors; staff-editable.
  -- App sets true at creation for adult students with zero linked guardians.
  can_purchase  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE guardians (
  guardian_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  relationship TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_guardians (
  student_id         INT NOT NULL REFERENCES students(student_id)   ON DELETE CASCADE,
  guardian_id        INT NOT NULL REFERENCES guardians(guardian_id) ON DELETE CASCADE,
  is_primary         BOOLEAN NOT NULL DEFAULT FALSE,   -- primary = billing contact
  notification_prefs JSONB   NOT NULL DEFAULT '{}',    -- per-guardian channel/event prefs (GRD-5)
  linked_by          INT REFERENCES users(user_id),
  linked_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, guardian_id)
);
-- exactly one primary per student when any guardian exists (spec 01 §7)
CREATE UNIQUE INDEX uq_student_primary_guardian ON student_guardians (student_id) WHERE is_primary;
CREATE INDEX idx_student_guardians_guardian ON student_guardians (guardian_id);

CREATE TABLE staff (
  staff_id          INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  department        TEXT,
  employment_status TEXT NOT NULL CHECK (employment_status IN ('full_time','part_time')),
  salary            NUMERIC(10,2) CHECK (salary >= 0),
  hourly_rate       NUMERIC(10,2) CHECK (hourly_rate >= 0),
  date_of_birth     DATE,
  gender            TEXT CHECK (gender IN ('male','female','other'))
);

CREATE TABLE instructors (
  instructor_id    INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  date_of_birth    DATE,
  gender           TEXT CHECK (gender IN ('male','female','other')),
  college_attended TEXT,
  major            TEXT,
  employment_type  TEXT CHECK (employment_type IN ('full_time','part_time')),
  salary           NUMERIC(10,2) CHECK (salary >= 0),
  hourly_rate      NUMERIC(10,2) CHECK (hourly_rate >= 0)
);

-- =====================================================================
-- 2. CATALOG, ROOMS & INSTRUCTOR TIME
-- =====================================================================

CREATE TABLE subject_groups (
  group_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE subjects (
  subject_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id   INT REFERENCES subject_groups(group_id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  UNIQUE (group_id, name)
);

CREATE TABLE instructor_specialties (
  instructor_id INT REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  subject_id    INT REFERENCES subjects(subject_id)       ON DELETE CASCADE,
  PRIMARY KEY (instructor_id, subject_id)
);
CREATE INDEX idx_instructor_specialties_subject ON instructor_specialties (subject_id);

CREATE TABLE instructor_group_specialties (
  instructor_id INT REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  group_id      INT REFERENCES subject_groups(group_id)   ON DELETE CASCADE,
  PRIMARY KEY (instructor_id, group_id)
);

-- ASSUMPTION[ONBOARDING-§8]: shape inferred from spec bundle usage (capacity checks, room picker)
CREATE TABLE rooms (
  room_id    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  capacity   INT  NOT NULL CHECK (capacity > 0),
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  notes      TEXT
);

CREATE TABLE instructor_availability (
  availability_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  instructor_id   INT  NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  day_of_week     TEXT NOT NULL CHECK (day_of_week IN ('sun','mon','tue','wed','thu','fri','sat')),
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL CHECK (end_time > start_time),
  start_date      DATE,
  end_date        DATE CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  type            TEXT CHECK (type IN ('default','preferred','emergency')),
  notes           TEXT,
  -- no overlapping active windows for the same instructor/day/date-validity
  EXCLUDE USING gist (
    instructor_id WITH =,
    day_of_week   WITH =,
    daterange(start_date, end_date, '[]') WITH &&,
    tsrange(DATE '2000-01-01' + start_time, DATE '2000-01-01' + end_time) WITH &&
  ) WHERE (status = 'active')
);
CREATE INDEX idx_availability_instructor ON instructor_availability (instructor_id);

CREATE TABLE instructor_unavailability (
  unavail_id     INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  instructor_id  INT NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime   TIMESTAMPTZ NOT NULL,
  reason         TEXT,
  CHECK (end_datetime > start_datetime)
);
CREATE INDEX idx_unavailability_instructor ON instructor_unavailability (instructor_id, start_datetime);

-- =====================================================================
-- 3. CLASSES & ENROLLMENT (spec 01 §1–3, 03)
-- =====================================================================

CREATE TABLE classes (
  class_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_type          TEXT NOT NULL CHECK (class_type IN ('one_on_one','group')),
  subject_id          INT  NOT NULL REFERENCES subjects(subject_id),
  instructor_id       INT  NOT NULL REFERENCES instructors(instructor_id),
  student_limit       INT  NOT NULL CHECK (student_limit >= 1),
  session_credit_cost INT  NOT NULL CHECK (session_credit_cost >= 0), -- current value; history below
  recurrence          TEXT NOT NULL DEFAULT 'weekly'
                      CHECK (recurrence IN ('none','weekly','biweekly','custom')),
  recurrence_rule     JSONB,          -- byday/time pairs; RRULE-like for custom
  starts_on           DATE NOT NULL,
  ends_on             DATE,           -- NULL = open-ended (rolling session materialization)
  -- 'pending' = self-serve one-off booking awaiting instructor response (SCH-4);
  -- invisible to catalog/gates/committed-math, which all filter status='active'
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending','active','ended','terminated')),
  default_room_id     INT REFERENCES rooms(room_id),
  created_by          INT NOT NULL REFERENCES users(user_id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (class_type <> 'one_on_one' OR student_limit = 1),
  CHECK (recurrence <> 'none' OR class_type = 'one_on_one'),           -- one-offs are 1:1 only
  CHECK (ends_on IS NULL OR ends_on >= starts_on)
);
CREATE TRIGGER trg_classes_updated BEFORE UPDATE ON classes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_classes_instructor ON classes (instructor_id) WHERE status = 'active';
CREATE INDEX idx_classes_subject    ON classes (subject_id);

CREATE TABLE class_price_history (
  price_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id            UUID NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
  session_credit_cost INT  NOT NULL CHECK (session_credit_cost >= 0),
  effective_from      TIMESTAMPTZ NOT NULL,   -- future-only (INV-4), app-enforced
  set_by              INT NOT NULL REFERENCES users(user_id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (class_id, effective_from)
);

CREATE TABLE enrollments (
  enrollment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      UUID NOT NULL REFERENCES classes(class_id)     ON DELETE CASCADE,
  student_id    INT  NOT NULL REFERENCES students(student_id)  ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','left','removed')),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_at       TIMESTAMPTZ,
  joined_by     INT REFERENCES users(user_id),
  removed_by    INT REFERENCES users(user_id),
  CHECK (status = 'active' OR left_at IS NOT NULL)
);
-- one live membership per class/student (spec 01 §2)
CREATE UNIQUE INDEX uq_enrollments_active ON enrollments (class_id, student_id) WHERE status = 'active';
CREATE INDEX idx_enrollments_student ON enrollments (student_id);
CREATE INDEX idx_enrollments_class   ON enrollments (class_id);

CREATE TABLE class_membership_requests (
  request_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id     UUID NOT NULL REFERENCES classes(class_id)    ON DELETE CASCADE,
  student_id   INT  NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  kind         TEXT NOT NULL CHECK (kind IN ('join','leave')),
  requested_by INT  NOT NULL REFERENCES users(user_id),      -- student or guardian
  reason       TEXT,                                         -- UI-required for leave
  is_waitlist  BOOLEAN NOT NULL DEFAULT FALSE,               -- SCH-3 full-class requests
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','approved','rejected','cancelled')),
  resolved_by  INT REFERENCES users(user_id),
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_membership_requests_class ON class_membership_requests (class_id, status);
CREATE INDEX idx_membership_requests_student ON class_membership_requests (student_id);

-- =====================================================================
-- 4. SESSIONS, HOLDS & RESCHEDULES (spec 01 §6/§9, 07)
-- =====================================================================

CREATE TABLE class_sessions (
  session_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id        UUID NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
  -- denormalized from classes for the INV-3 calendar indexes; app keeps in sync
  instructor_id   INT  NOT NULL REFERENCES instructors(instructor_id),
  room_id         INT REFERENCES rooms(room_id),
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN
                  ('scheduled','reschedule_requested','moved','completed',
                   'cancelled_student','cancelled_instructor','cancelled_staff')),
  rescheduled_from         TIMESTAMPTZ,                 -- audit marker (RSC-1)
  reschedule_chain         JSONB NOT NULL DEFAULT '[]', -- full move history
  room_changed_notice_sent BOOLEAN NOT NULL DEFAULT FALSE,
  cancellation_reason      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (ends_at > starts_at),
  -- beyond-spec hardening: no overlapping live sessions per instructor / per room
  EXCLUDE USING gist (instructor_id WITH =, tstzrange(starts_at, ends_at) WITH &&)
    WHERE (status IN ('scheduled','reschedule_requested')),
  EXCLUDE USING gist (room_id WITH =, tstzrange(starts_at, ends_at) WITH &&)
    WHERE (status IN ('scheduled','reschedule_requested') AND room_id IS NOT NULL)
);
CREATE TRIGGER trg_class_sessions_updated BEFORE UPDATE ON class_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- INV-3 backstop exactly as spec'd: unique (instructor_id, starts_at) over live rows
CREATE UNIQUE INDEX uq_sessions_instructor_slot ON class_sessions (instructor_id, starts_at)
  WHERE status IN ('scheduled','reschedule_requested');
CREATE INDEX idx_sessions_start        ON class_sessions (starts_at);
CREATE INDEX idx_sessions_class_start  ON class_sessions (class_id, starts_at);
CREATE INDEX idx_sessions_instr_start  ON class_sessions (instructor_id, starts_at);
CREATE INDEX idx_sessions_room         ON class_sessions (room_id) WHERE room_id IS NOT NULL;

-- ASSUMPTION[ONBOARDING-§8]: base shape inferred; origins/TTL per spec 01 §9
CREATE TABLE slot_holds (
  hold_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id       INT NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  starts_at           TIMESTAMPTZ NOT NULL,
  ends_at             TIMESTAMPTZ NOT NULL,
  origin              TEXT NOT NULL CHECK (origin IN
                      ('onboarding_consultation','reschedule_request','self_serve_booking')),
  status              TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','confirmed','released','expired')),
  held_for_student_id INT REFERENCES students(student_id),
  expires_at          TIMESTAMPTZ NOT NULL,
  created_by          INT REFERENCES users(user_id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (ends_at > starts_at)
);
-- INV-3: universal double-booking backstop for writers going through holds
CREATE UNIQUE INDEX uq_holds_instructor_slot ON slot_holds (instructor_id, starts_at)
  WHERE status = 'active';
CREATE INDEX idx_holds_expiry ON slot_holds (expires_at) WHERE status = 'active';

-- (SCH-4) a pending self-serve booking class points at its slot hold — the
-- hold carries the exact requested times until acceptance creates the session.
-- Added here (not in the classes DDL above) because slot_holds is defined later.
ALTER TABLE classes ADD COLUMN booking_hold_id UUID REFERENCES slot_holds(hold_id);

CREATE TABLE reschedule_requests (
  request_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id         UUID NOT NULL REFERENCES class_sessions(session_id) ON DELETE CASCADE,
  requested_by       INT  NOT NULL REFERENCES users(user_id),  -- student or guardian
  proposed_starts_at TIMESTAMPTZ NOT NULL,
  proposed_ends_at   TIMESTAMPTZ NOT NULL,
  hold_id            UUID REFERENCES slot_holds(hold_id),
  status             TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','accepted','rejected','expired','escalated')),
  responded_by       INT REFERENCES users(user_id),
  responded_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (proposed_ends_at > proposed_starts_at)
);
CREATE INDEX idx_reschedule_requests_session ON reschedule_requests (session_id);
CREATE INDEX idx_reschedule_requests_open ON reschedule_requests (status)
  WHERE status IN ('pending','escalated');

-- ASSUMPTION[US-3] / ASSUMPTION[ONBOARDING-§8]: part-time instructor confirmation
CREATE TABLE instructor_time_requests (
  request_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id INT  NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  class_id      UUID REFERENCES classes(class_id) ON DELETE CASCADE,
  payload       JSONB NOT NULL,      -- proposed day/time pattern
  status        TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','confirmed','declined','expired')),
  requested_by  INT REFERENCES users(user_id),
  responded_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ,         -- ASSUMPTION[US-8] fallback timeout
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_time_requests_instructor ON instructor_time_requests (instructor_id, status);

-- =====================================================================
-- 5. ATTENDANCE & ACADEMIC LAYER (spec 01 §4–5, 06)
-- =====================================================================

CREATE TABLE session_attendance (
  attendance_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID NOT NULL REFERENCES class_sessions(session_id) ON DELETE RESTRICT,
  student_id     INT  NOT NULL REFERENCES students(student_id)       ON DELETE RESTRICT,
  status         TEXT NOT NULL CHECK (status IN
                 ('present','absent_unexcused','absent_excused',
                  'cancelled_in_window','cancelled_late','instructor_cancelled')),
  marked_by      INT REFERENCES users(user_id),   -- NULL when auto-completed
  auto_completed BOOLEAN NOT NULL DEFAULT FALSE,
  marked_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  adjusted_from  TEXT CHECK (adjusted_from IN
                 ('present','absent_unexcused','absent_excused',
                  'cancelled_in_window','cancelled_late','instructor_cancelled')),
  locked_at      TIMESTAMPTZ,                     -- session_end + session_record_lock_days (INV-5)
  UNIQUE (session_id, student_id)
);
CREATE INDEX idx_attendance_student  ON session_attendance (student_id);
CREATE INDEX idx_attendance_unlocked ON session_attendance (marked_at) WHERE locked_at IS NULL;

CREATE TABLE session_notes (
  note_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES class_sessions(session_id) ON DELETE CASCADE,
  student_id   INT  NOT NULL REFERENCES students(student_id)       ON DELETE CASCADE,
  performance  TEXT,
  improvements TEXT,
  free_notes   TEXT,
  created_by   INT NOT NULL REFERENCES users(user_id),  -- instructor (write authz in app)
  edited_at    TIMESTAMPTZ,                             -- portal "edited …" stamp
  versions     JSONB NOT NULL DEFAULT '[]',             -- prior payloads appended on edit
  locked_at    TIMESTAMPTZ,                             -- INV-5, shared lock window
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (session_id, student_id)
);
CREATE INDEX idx_notes_student ON session_notes (student_id);

-- =====================================================================
-- 6. WALLET & CREDIT LEDGER (spec 04; ASSUMPTION[ONBOARDING-§8] base shape)
-- =====================================================================

CREATE TABLE wallets (
  wallet_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- per-student, never pooled (00-INDEX supersession)
  student_id INT NOT NULL UNIQUE REFERENCES students(student_id) ON DELETE RESTRICT,
  -- integer credits; may go negative to the grace floor — floor enforced at deduction time in app
  balance    INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER trg_wallets_updated BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE credit_ledger (
  entry_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, -- append-only, ordered
  wallet_id     UUID NOT NULL REFERENCES wallets(wallet_id) ON DELETE RESTRICT,
  entry_type    TEXT NOT NULL CHECK (entry_type IN
                ('purchase','bonus','deduction','refund','adjustment','cashout')),
  amount        INT NOT NULL CHECK (amount <> 0),  -- signed credits
  attendance_id UUID REFERENCES session_attendance(attendance_id),
  note          TEXT,
  created_by    INT REFERENCES users(user_id),     -- NULL = system (auto-complete, jobs)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- INV-1: money moves only on attendance events
  CHECK (entry_type NOT IN ('deduction','refund') OR attendance_id IS NOT NULL),
  -- sign discipline per entry type (adjustment may go either way)
  CHECK (
    (entry_type IN ('purchase','bonus','refund') AND amount > 0) OR
    (entry_type IN ('deduction','cashout')       AND amount < 0) OR
    (entry_type =  'adjustment')
  )
);
CREATE INDEX idx_ledger_wallet     ON credit_ledger (wallet_id, created_at DESC);
CREATE INDEX idx_ledger_attendance ON credit_ledger (attendance_id) WHERE attendance_id IS NOT NULL;

-- =====================================================================
-- 7. PAYMENTS & INVOICING (money side; credits are sold per Top-Up spec — ASSUMPTION[TOPUP])
-- =====================================================================

CREATE TABLE payment_methods (
  method_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  method_name TEXT NOT NULL UNIQUE,
  details     TEXT
);

-- ASSUMPTION[ONBOARDING-§8]: payment links (48h TTL default; knob payment_link_ttl_hours)
CREATE TABLE payment_links (
  link_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id INT NOT NULL REFERENCES students(student_id) ON DELETE RESTRICT,
  amount     NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  purpose    TEXT,
  url_token  TEXT NOT NULL UNIQUE,
  status     TEXT NOT NULL DEFAULT 'pending'
             CHECK (status IN ('pending','paid','expired','cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_by INT REFERENCES users(user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at    TIMESTAMPTZ
);
CREATE INDEX idx_payment_links_student ON payment_links (student_id);
CREATE INDEX idx_payment_links_open    ON payment_links (expires_at) WHERE status = 'pending';

CREATE TABLE payments (
  payment_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id   INT NOT NULL REFERENCES students(student_id) ON DELETE RESTRICT,
  amount       NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  payment_date DATE NOT NULL,
  method_id    INT REFERENCES payment_methods(method_id),
  link_id      UUID REFERENCES payment_links(link_id),
  provider     TEXT,            -- payment-provider integration point
  provider_ref TEXT,
  description  TEXT,
  reference    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_student ON payments (student_id);

CREATE TABLE invoices (
  invoice_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  student_id   INT NOT NULL REFERENCES students(student_id) ON DELETE RESTRICT,
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  issued_at    DATE NOT NULL,
  due_date     DATE,
  status       TEXT NOT NULL CHECK (status IN ('paid','pending','overdue','canceled')),
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_invoices_student ON invoices (student_id, status);

-- partial payments / one payment covering many invoices
CREATE TABLE invoice_payments (
  invoice_id INT NOT NULL REFERENCES invoices(invoice_id) ON DELETE RESTRICT,
  payment_id INT NOT NULL REFERENCES payments(payment_id) ON DELETE RESTRICT,
  amount     NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  PRIMARY KEY (invoice_id, payment_id)
);

CREATE TABLE refunds (
  refund_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_id  INT NOT NULL REFERENCES payments(payment_id) ON DELETE RESTRICT,
  amount      NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  refund_date DATE NOT NULL,
  reason      TEXT,
  -- KR-REFUND statutory cash-outs pair with a credit_ledger 'cashout' entry
  ledger_entry_id BIGINT REFERENCES credit_ledger(entry_id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_refunds_payment ON refunds (payment_id);

-- =====================================================================
-- 8. POLICY KNOBS (spec 02) — singleton row, seeded below
-- =====================================================================

CREATE TABLE institution_settings (
  singleton                          BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (singleton),
  payment_modes_enabled              TEXT NOT NULL DEFAULT 'both'
                                     CHECK (payment_modes_enabled IN ('collect_now','payment_link','both')),
  payment_link_ttl_hours             INT NOT NULL DEFAULT 48  CHECK (payment_link_ttl_hours > 0),
  consultation_hold_ttl_min          INT NOT NULL DEFAULT 30  CHECK (consultation_hold_ttl_min > 0),
  trial_class_enabled                BOOLEAN NOT NULL DEFAULT FALSE,
  reschedule_window_hours            INT NOT NULL DEFAULT 24  CHECK (reschedule_window_hours >= 0), -- "THE Window"; spec: per PA
  enrollment_runway_sessions         INT NOT NULL DEFAULT 4   CHECK (enrollment_runway_sessions > 0),
  session_record_lock_days           INT NOT NULL DEFAULT 7   CHECK (session_record_lock_days > 0),
  attendance_autocomplete_hours      INT NOT NULL DEFAULT 24  CHECK (attendance_autocomplete_hours > 0),
  negative_balance_floor_sessions    INT NOT NULL DEFAULT 1   CHECK (negative_balance_floor_sessions >= 0),
  low_balance_notify_runway_sessions INT NOT NULL DEFAULT 2   CHECK (low_balance_notify_runway_sessions > 0),
  instructor_response_window_hours   INT NOT NULL DEFAULT 24  CHECK (instructor_response_window_hours > 0),
  self_serve_booking_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
  -- (SCH-4) academy-wide 1:1 rate for self-serve one-off bookings; the
  -- per-instructor/subject pricing table arrives with the Top-Up spec
  default_one_on_one_credit_cost     INT NOT NULL DEFAULT 5 CHECK (default_one_on_one_credit_cost >= 0),
  group_catalog_visible              BOOLEAN NOT NULL DEFAULT TRUE,
  session_generation_horizon_weeks   INT NOT NULL DEFAULT 8   CHECK (session_generation_horizon_weeks > 0),
  updated_by                         INT REFERENCES users(user_id),
  updated_at                         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO institution_settings DEFAULT VALUES;

-- INV-4: knob changes are future-only; in-flight requests resolve under creation-time values
-- (app snapshots relevant knob values onto requests/holds at creation). History for audit:
CREATE TABLE institution_settings_history (
  history_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  knob       TEXT NOT NULL,
  old_value  TEXT,
  new_value  TEXT NOT NULL,
  changed_by INT REFERENCES users(user_id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 9. NOTIFICATIONS, TASKS & OPS (spec 08)
-- =====================================================================

-- ASSUMPTION[ONBOARDING-§8]: base shape inferred; INV-7 — every automated side-effect logged
CREATE TABLE notification_log (
  notification_id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_type        TEXT NOT NULL,
  recipient_user_id INT REFERENCES users(user_id),
  channel           TEXT CHECK (channel IN ('email','in_app','kakao')),
  subject_type      TEXT,     -- polymorphic object ref: 'class_session', 'payment_link', …
  subject_id        TEXT,
  payload           JSONB,
  status            TEXT NOT NULL DEFAULT 'queued'
                    CHECK (status IN ('queued','sent','failed','read')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at           TIMESTAMPTZ
);
CREATE INDEX idx_notifications_recipient ON notification_log (recipient_user_id, created_at DESC);
CREATE INDEX idx_notifications_event     ON notification_log (event_type, created_at DESC);

-- staff task queue: escalations, delinquency, unlock requests, appeals (INV-6: humans execute)
CREATE TABLE staff_tasks (
  task_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind         TEXT NOT NULL CHECK (kind IN
               ('reschedule_escalation','booking_escalation','join_request','leave_request',
                'delinquent_balance','auto_complete_verify','note_unlock_request',
                'appeal_review','instructor_termination_request','other')),
  urgency      TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal','urgent')),
  subject_type TEXT,
  subject_id   TEXT,
  details      JSONB,
  status       TEXT NOT NULL DEFAULT 'open'
               CHECK (status IN ('open','in_progress','done','dismissed')),
  assigned_to  INT REFERENCES users(user_id),
  resolved_by  INT REFERENCES users(user_id),
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_staff_tasks_open ON staff_tasks (status, created_at)
  WHERE status IN ('open','in_progress');

-- =====================================================================
-- 10. OPERATIONS (carried over from v1, hardened; outside spec scope)
-- =====================================================================

CREATE TABLE time_logs (
  log_id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  staff_id              INT NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
  clock_in              TIMESTAMPTZ NOT NULL,
  clock_out             TIMESTAMPTZ CHECK (clock_out IS NULL OR clock_out > clock_in),
  associated_session_id UUID REFERENCES class_sessions(session_id) ON DELETE SET NULL,
  notes                 TEXT,
  generated_at          TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_time_logs_staff ON time_logs (staff_id, clock_in);

CREATE TABLE payroll (
  payroll_id       INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  user_type        TEXT NOT NULL CHECK (user_type IN ('staff','instructor')),
  pay_period_start DATE NOT NULL,
  pay_period_end   DATE NOT NULL CHECK (pay_period_end >= pay_period_start),
  total_pay        NUMERIC(10,2) NOT NULL CHECK (total_pay >= 0),
  generated_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payroll_user ON payroll (user_id, pay_period_start);

CREATE TABLE operating_expenses (
  expense_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pa_code_id   INT NOT NULL REFERENCES pa_codes(pa_code_id),
  category     TEXT NOT NULL CHECK (category IN
               ('marketing','materials','rent','software','utilities','admin','other')),
  amount       NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  expense_date DATE NOT NULL,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_expenses_pa ON operating_expenses (pa_code_id, expense_date);

CREATE TABLE financial_periods (
  period_id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pa_code_id  INT NOT NULL REFERENCES pa_codes(pa_code_id),
  period_name TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL CHECK (end_date >= start_date),
  is_closed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
