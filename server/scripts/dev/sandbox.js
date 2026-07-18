// Local demo sandbox: boots the REAL server against in-process PGlite
// (schema v2, no Azure, no docker) with seeded demo accounts — the same
// machinery the test suite uses. Run from server/:  node scripts/dev/sandbox.js
// All logins use password: Password123!   Institution code: TEST01
import bcrypt from 'bcryptjs';
import { DateTime } from 'luxon';

process.env.CORS_ORIGIN = 'http://localhost:5173'; // Vite dev origin (set before app import)
process.env.JOBS_DISABLED = '1'; // PGlite serves one connection; keep the scheduler off
process.env.RESEND_API_KEY = ''; // never send real email from the sandbox
process.env.PG_POOL_MAX = '1';   // serialize ALL queries through one connection —
                                 // concurrent browser requests queue instead of
                                 // hanging on a second PGlite socket

const { startTestEnv, TEST_CODE } = await import('../../test/helpers/testEnv.js');
const env = await startTestEnv();
const db = env.tenantDb;
const TZ = 'America/Los_Angeles';
const at = (days, hour) => DateTime.now().setZone(TZ).plus({ days }).set({ hour, minute: 0, second: 0, millisecond: 0 }).toUTC().toISO();

const hash = await bcrypt.hash('Password123!', 10);

// registry login directory: email+password locate the institution (no code)
for (const email of ['staff@test.com', 'instructor@demo.com', 'alice@demo.com',
                     'ben@demo.com', 'grace@demo.com', 'charlie@demo.com']) {
  await env.registryDb.query(
    `INSERT INTO user_directory (email, password_hash, code) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING`,
    [email, hash, TEST_CODE]);
}

// people (staff@test.com is user 1, seeded by the harness)
await db.query(`
  INSERT INTO users (password_hash, name, email, role) VALUES
    ($1,'Kim Soyeon','instructor@demo.com','instructor'),  -- 2
    ($1,'Alice Park','alice@demo.com','student'),          -- 3
    ($1,'Ben Lee','ben@demo.com','student'),               -- 4
    ($1,'Grace Park','grace@demo.com','guardian'),         -- 5
    ($1,'Charlie Adult','charlie@demo.com','student')      -- 6
`, [hash]);
await db.exec(`
  INSERT INTO instructors (instructor_id) VALUES (2);
  INSERT INTO students (student_id, status, date_of_birth, grade, school) VALUES
    (3,'enrolled','2012-03-01',8,'Demo Middle School'),
    (4,'enrolled','2013-06-01',7,'Demo Middle School'),
    (6,'enrolled','1999-01-01',12,'—');
  UPDATE students SET can_purchase = true WHERE student_id = 6;
  INSERT INTO guardians (user_id, relationship) VALUES (5,'parent');
  INSERT INTO student_guardians (student_id, guardian_id, is_primary) VALUES (3, 1, true);
  INSERT INTO subject_groups (name) VALUES ('Math'), ('English');
  INSERT INTO subjects (group_id, name) VALUES (1,'Algebra'), (1,'Geometry'), (2,'Writing');
  INSERT INTO instructor_specialties (instructor_id, subject_id) VALUES (2,1),(2,2),(2,3);
  INSERT INTO rooms (name, capacity) VALUES ('Room A', 4), ('Room B', 10);
  INSERT INTO instructor_availability (instructor_id, day_of_week, start_time, end_time) VALUES
    (2,'mon','09:00','18:00'),(2,'tue','09:00','18:00'),(2,'wed','09:00','18:00'),
    (2,'thu','09:00','18:00'),(2,'fri','09:00','18:00');
  INSERT INTO wallets (student_id, balance) VALUES (3, 40), (4, 3), (6, 30);
`);

// one running group class with upcoming sessions, Alice + Ben enrolled
const { rows: [cls] } = await db.query(`
  INSERT INTO classes (class_type, subject_id, instructor_id, student_limit,
                       session_credit_cost, recurrence, recurrence_rule, starts_on, created_by)
  VALUES ('group', 1, 2, 6, 5, 'weekly',
          '{"timezone":"America/Los_Angeles","byday":[{"day":"tue","start":"16:00","end":"17:00"},{"day":"thu","start":"16:00","end":"17:00"}]}',
          CURRENT_DATE, 1) RETURNING class_id`);
for (const sid of [3, 4]) {
  await db.query(`INSERT INTO enrollments (class_id, student_id) VALUES ($1,$2)`, [cls.class_id, sid]);
}
// four upcoming sessions (and one from yesterday, ready for attendance marking)
for (const [d, h] of [[-1, 16], [2, 16], [4, 16], [9, 16], [11, 16]]) {
  await db.query(
    `INSERT INTO class_sessions (class_id, instructor_id, room_id, starts_at, ends_at)
     VALUES ($1, 2, 2, $2, $3)`,
    [cls.class_id, at(d, h), at(d, h + 1)]);
}

const PORT = process.env.PORT || 5001;
env.app.listen(PORT, () => {
  console.log(`
Sandbox up on http://localhost:${PORT} (PGlite in-memory, schema v2 — nothing touches Azure)

  Institution code: ${TEST_CODE}
  Logins (password for all: Password123!)
    staff       staff@test.com
    instructor  instructor@demo.com
    guardian    grace@demo.com   (Alice's parent)
    student     alice@demo.com / ben@demo.com (low balance: 3) / charlie@demo.com (adult)

  Seeded: Algebra group class (Tue/Thu 4pm PT) with Alice + Ben enrolled,
  5 sessions (one yesterday — markable), wallets 40/3/30, rooms, availability.
  Data resets every restart.`);
});
