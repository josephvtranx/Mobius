-- =============================================
-- PostgreSQL Schema for Mobius (Time-Based Tracking Edition)
-- =============================================

-- 1. USERS
CREATE TABLE users (
  user_id        SERIAL PRIMARY KEY,
  password_hash  TEXT    NOT NULL,
  name           TEXT    NOT NULL,
  email          TEXT    NOT NULL UNIQUE,
  phone          TEXT,
  role           TEXT    NOT NULL CHECK (role IN ('student','staff','instructor','admin')),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  last_login     TIMESTAMP,
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. GUARDIANS
CREATE TABLE guardians (
  guardian_id    SERIAL PRIMARY KEY,
  name           TEXT    NOT NULL,
  phone          TEXT,
  email          TEXT,
  relationship   TEXT
);

-- 3. STUDENTS
CREATE TABLE students (
  student_id   INT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  status       TEXT    NOT NULL CHECK (status IN ('enrolled','on_trial')),
  age          INT,
  grade        INT,
  gender       TEXT    CHECK (gender IN ('male','female','other')),
  school       TEXT,
  pa_code      TEXT
);

-- 4a. STAFF
CREATE TABLE staff (
  staff_id             INT     PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  department           TEXT,
  employment_status    TEXT    NOT NULL CHECK (employment_status IN ('full_time','part_time')),
  salary               NUMERIC,
  hourly_rate          NUMERIC,
  total_hours_worked   NUMERIC DEFAULT 0,
  age                  INT,
  gender               TEXT    CHECK (gender IN ('male','female','other'))
);

-- 4b. INSTRUCTORS
CREATE TABLE instructors (
  instructor_id   INT    PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  age             INT,
  gender          TEXT   CHECK (gender IN ('male','female','other')),
  college_attended TEXT,
  major           TEXT,
  employment_type TEXT   CHECK (employment_type IN ('full_time','part_time')),
  salary          NUMERIC CHECK (salary >= 0),
  hourly_rate     NUMERIC CHECK (hourly_rate >= 0)
);

-- 4c. INSTRUCTOR_AVAILABILITY
CREATE TABLE instructor_availability (
  availability_id SERIAL PRIMARY KEY,
  instructor_id   INT NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  day_of_week     TEXT NOT NULL CHECK (day_of_week IN ('mon','tue','wed','thu','fri','sat','sun')),
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  start_date      DATE,
  end_date        DATE,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  type            TEXT CHECK (type IN ('default','preferred','emergency')),
  notes           TEXT
);

-- 4d. INSTRUCTOR_UNAVAILABILITY
CREATE TABLE instructor_unavailability (
  unavail_id     SERIAL PRIMARY KEY,
  instructor_id  INT NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  start_datetime TIMESTAMP NOT NULL,
  end_datetime   TIMESTAMP NOT NULL,
  reason         TEXT,
  CHECK (end_datetime > start_datetime)
);

-- 5. SUBJECT GROUPS
CREATE TABLE subject_groups (
  group_id     SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  description  TEXT
);

-- 6. SUBJECTS
CREATE TABLE subjects (
  subject_id  SERIAL PRIMARY KEY,
  group_id    INT REFERENCES subject_groups(group_id) ON DELETE SET NULL,
  name        TEXT NOT NULL
);

-- 7. STUDENT_GUARDIAN
CREATE TABLE student_guardian (
  student_id   INT REFERENCES students(student_id) ON DELETE CASCADE,
  guardian_id  INT REFERENCES guardians(guardian_id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, guardian_id)
);

-- 8. INSTRUCTOR_SPECIALTIES
CREATE TABLE instructor_specialties (
  instructor_id  INT REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  subject_id     INT REFERENCES subjects(subject_id) ON DELETE CASCADE,
  PRIMARY KEY (instructor_id, subject_id)
);

-- 8b. INSTRUCTOR_GROUP_SPECIALTIES
CREATE TABLE instructor_group_specialties (
  instructor_id  INT REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  group_id       INT REFERENCES subject_groups(group_id) ON DELETE CASCADE,
  PRIMARY KEY (instructor_id, group_id)
);

-- 9. INSTRUCTOR_ASSIGNMENTS
CREATE TABLE instructor_assignments (
  assignment_id   SERIAL PRIMARY KEY,
  instructor_id   INT     NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  student_id      INT     NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  subject_id      INT     NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  start_date      DATE,
  end_date        DATE
);

-- 10. CLASS_SERIES
CREATE TABLE class_series (
  series_id            SERIAL PRIMARY KEY,
  subject_id           INT     NOT NULL REFERENCES subjects(subject_id),
  student_id           INT     NOT NULL REFERENCES students(student_id),
  instructor_id        INT     REFERENCES instructors(instructor_id),
  created_by_staff_id  INT     REFERENCES staff(staff_id),
  start_date           DATE    NOT NULL,
  end_date             DATE,
  days_of_week         TEXT[]  NOT NULL CHECK (days_of_week <@ ARRAY['mon','tue','wed','thu','fri','sat','sun']),
  start_time           TIME    NOT NULL,
  end_time             TIME    NOT NULL,
  num_sessions         INT     NOT NULL,
  location             TEXT,
  status               TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_progress','completed','canceled')),
  instructor_confirmation_status TEXT DEFAULT 'pending' CHECK (instructor_confirmation_status IN ('pending','accepted','declined')),
  notes                TEXT
);

-- 11. CLASS_SESSIONS
CREATE TABLE class_sessions (
  session_id                 SERIAL PRIMARY KEY,
  series_id                  INT REFERENCES class_series(series_id),
  instructor_id              INT     NOT NULL REFERENCES instructors(instructor_id) ON DELETE CASCADE,
  student_id                 INT     NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  subject_id                 INT     NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
  session_date               DATE    NOT NULL,
  start_time                 TIME    NOT NULL,
  end_time                   TIME    NOT NULL,
  location                   TEXT,
  status                     TEXT    NOT NULL CHECK (status IN ('scheduled','completed','canceled','rescheduled')) DEFAULT 'scheduled',
  cancellation_reason        TEXT,
  rescheduled_to_session_id  INT     REFERENCES class_sessions(session_id) ON DELETE SET NULL,
  matched_availability_id    INT     REFERENCES instructor_availability(availability_id)
);

-- 12. ATTENDANCE
CREATE TABLE attendance (
  session_id   INT     NOT NULL REFERENCES class_sessions(session_id) ON DELETE CASCADE,
  student_id   INT     NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  attended     BOOLEAN NOT NULL,
  notes        TEXT,
  PRIMARY KEY (session_id, student_id)
);

-- 13. TIME_LOGS
CREATE TABLE time_logs (
  log_id                   SERIAL PRIMARY KEY,
  staff_id                 INT     NOT NULL REFERENCES staff(staff_id) ON DELETE CASCADE,
  clock_in                 TIMESTAMP NOT NULL,
  clock_out                TIMESTAMP,
  associated_session_id    INT     REFERENCES class_sessions(session_id) ON DELETE SET NULL,
  notes                    TEXT
);

-- 14. TIME_PACKAGES
CREATE TABLE time_packages (
  time_package_id  SERIAL PRIMARY KEY,
  name             TEXT    NOT NULL,
  hours_total      INT     NOT NULL CHECK (hours_total > 0),
  price            NUMERIC NOT NULL CHECK (price >= 0),
  expiration_days  INT     NOT NULL CHECK (expiration_days >= 0)
);

-- 15. STUDENT_TIME_PACKAGES
CREATE TABLE student_time_packages (
  purchase_id        SERIAL PRIMARY KEY,
  student_id         INT     NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  time_package_id    INT     NOT NULL REFERENCES time_packages(time_package_id) ON DELETE RESTRICT,
  purchase_date      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  minutes_remaining  INT     NOT NULL CHECK (minutes_remaining >= 0),
  expiration_date    DATE,
  hours_total        NUMERIC GENERATED ALWAYS AS (minutes_remaining / 60.0) STORED
);

-- 16. TIME_DEDUCTIONS
CREATE TABLE time_deductions (
  deduction_id    SERIAL PRIMARY KEY,
  student_id      INT     NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  session_id      INT     NOT NULL REFERENCES class_sessions(session_id) ON DELETE CASCADE,
  time_package_id INT     NOT NULL REFERENCES student_time_packages(purchase_id) ON DELETE CASCADE,
  minutes_used    INT     NOT NULL CHECK (minutes_used > 0),
  deducted_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 17. PAYROLL
CREATE TABLE payroll (
  payroll_id        SERIAL PRIMARY KEY,
  user_id           INT     NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  user_type         TEXT    NOT NULL CHECK (user_type IN ('staff','instructor')),
  pay_period_start  DATE    NOT NULL,
  pay_period_end    DATE    NOT NULL,
  total_pay         NUMERIC NOT NULL CHECK (total_pay >= 0),
  generated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 18. RESCHEDULE REQUESTS
CREATE TABLE reschedule_requests (
  request_id     SERIAL PRIMARY KEY,
  session_id     INT NOT NULL REFERENCES class_sessions(session_id) ON DELETE CASCADE,
  student_id     INT NOT NULL REFERENCES students(student_id),
  instructor_id  INT NOT NULL REFERENCES instructors(instructor_id),
  proposed_times JSONB,
  selected_time  TIMESTAMP,
  status         TEXT CHECK (status IN ('pending','approved','declined','expired')) DEFAULT 'pending',
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
