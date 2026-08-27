// Repeatable synthetic academy. Fresh migrated DB only; never a production seeder.
import bcrypt from 'bcryptjs';
import { DateTime } from 'luxon';
import { TEST_CODE } from '../../test/helpers/testEnv.js';

export async function seedAcademy(env, { now = DateTime.now().setZone('America/Los_Angeles') } = {}) {
const db = env.tenantDb;
const TZ = 'America/Los_Angeles';
// ---------------------------------------------------------------------------
// Deterministic RNG (mulberry32) — same academy on every restart.
// ---------------------------------------------------------------------------
let rngState = 0x5eed2026;
const rand = () => {
  rngState |= 0; rngState = (rngState + 0x6d2b79f5) | 0;
  let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const randInt = (a, b) => a + Math.floor(rand() * (b - a + 1));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const chance = (p) => rand() < p;

const FIRST = ['Alice', 'Ben', 'Grace', 'Soyeon', 'Minjun', 'Jiwoo', 'Hana', 'Daniel', 'Priya', 'Leo', 'Mia', 'Noah',
  'Sofia', 'Marcus', 'Sara', 'Amara', 'Ethan', 'Yuna', 'Jae', 'Lena', 'Omar', 'Ivy', 'Hugo', 'Nari',
  'Felix', 'Tessa', 'Ravi', 'Chloe', 'Dmitri', 'Aisha', 'Sungmin', 'Eleanor', 'Kenji', 'Rosa', 'Tomas', 'Hyejin'];
const LAST = ['Park', 'Lee', 'Kim', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Tanaka', 'Bell', 'Fournier', 'Shah',
  'Rossi', 'Webb', 'Haddad', 'Ndiaye', 'Novak', 'Silva', 'Meyer', 'Okafor', 'Ito', 'Alvarez', 'Dubois', 'Nguyen'];
const SCHOOLS = ['Demo Middle School', 'Riverside Middle School', 'Lakeview High', 'St. Anne Prep', 'Northgate High', 'Cedar Elementary'];
const COLLEGES = ['Seoul National University', 'UCLA', 'UW', 'NYU', 'KAIST', 'Berkeley'];
const MAJORS = ['Mathematics', 'English Literature', 'Physics', 'Chemistry', 'Education', 'Statistics'];

const usedNames = new Set(['Alice Park', 'Ben Lee', 'Grace Park', 'Charlie Adult', 'Kim Soyeon']);
function genName() {
  for (;;) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    if (!usedNames.has(name)) { usedNames.add(name); return name; }
  }
}
const emailFor = (name, id) => `${name.toLowerCase().replace(/[^a-z]+/g, '.')}.${id}@demo.com`;

const hash = await bcrypt.hash('Password123!', 10);

// registry login directory: email+password locate the institution (no code)
for (const email of ['staff@test.com', 'instructor@demo.com', 'alice@demo.com',
                     'ben@demo.com', 'grace@demo.com', 'charlie@demo.com']) {
  await env.registryDb.query(
    `INSERT INTO user_directory (email, password_hash, code) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING`,
    [email, hash, TEST_CODE]);
}

// Chunked multi-row INSERT (PGlite is happy up to thousands of params).
async function bulkInsert(table, cols, rows, returning = '') {
  const out = [];
  for (let i = 0; i < rows.length; i += 400) {
    const chunk = rows.slice(i, i + 400);
    const params = [];
    const tuples = chunk.map((row) => `(${row.map((v) => { params.push(v); return `$${params.length}`; }).join(',')})`);
    const { rows: ret } = await db.query(
      `INSERT INTO ${table} (${cols.join(',')}) VALUES ${tuples.join(',')}${returning ? ` RETURNING ${returning}` : ''}`,
      params);
    out.push(...ret);
  }
  return out;
}

// ---------------------------------------------------------------------------
// People. The named six keep their historical ids: staff@test.com is user 1
// (seeded by the harness), then Kim (2), Alice (3), Ben (4), Grace (5),
// Charlie (6). Everyone after is generated.
// ---------------------------------------------------------------------------
await db.query(`
  INSERT INTO users (password_hash, name, email, role) VALUES
    ($1,'Kim Soyeon','instructor@demo.com','instructor'),  -- 2
    ($1,'Alice Park','alice@demo.com','student'),          -- 3
    ($1,'Ben Lee','ben@demo.com','student'),               -- 4
    ($1,'Grace Park','grace@demo.com','guardian'),         -- 5
    ($1,'Charlie Adult','charlie@demo.com','student')      -- 6
`, [hash]);

const N_INSTRUCTORS = 12;   // incl. Kim
const N_STUDENTS = 72;      // incl. Alice, Ben, Charlie
const N_EXTRA_STAFF = 3;

// Generated users, in blocks so ids are predictable to reason about.
const instructorNames = Array.from({ length: N_INSTRUCTORS - 1 }, genName);
const studentNames = Array.from({ length: N_STUDENTS - 3 }, genName);
const staffNames = Array.from({ length: N_EXTRA_STAFF }, genName);

const instructorIds = [2, ...(await bulkInsert('users', ['password_hash', 'name', 'email', 'role'],
  instructorNames.map((n, i) => [hash, n, emailFor(n, 100 + i), 'instructor']), 'user_id')).map((r) => r.user_id)];
const studentIds = [3, 4, 6, ...(await bulkInsert('users', ['password_hash', 'name', 'email', 'role'],
  studentNames.map((n, i) => [hash, n, emailFor(n, 300 + i), 'student']), 'user_id')).map((r) => r.user_id)];
const staffIds = [1, ...(await bulkInsert('users', ['password_hash', 'name', 'email', 'role'],
  staffNames.map((n, i) => [hash, n, emailFor(n, 900 + i), 'staff']), 'user_id')).map((r) => r.user_id)];

// Instructors: a real mix of employment so payroll produces non-zero pay.
await bulkInsert('instructors',
  ['instructor_id', 'date_of_birth', 'gender', 'college_attended', 'major', 'employment_type', 'salary', 'hourly_rate'],
  instructorIds.map((id, i) => {
    const fullTime = i < 4;
    return [id, `19${randInt(75, 99)}-${String(randInt(1, 12)).padStart(2, '0')}-15`,
      pick(['male', 'female', 'other']), pick(COLLEGES), pick(MAJORS),
      fullTime ? 'full_time' : 'part_time',
      fullTime ? randInt(3200, 4800) : null,
      fullTime ? null : randInt(28, 55)];
  }));

await bulkInsert('staff', ['staff_id', 'department', 'employment_status', 'salary', 'hourly_rate'],
  staffIds.slice(1).map((id) => [id, pick(['Front desk', 'Operations', 'Billing']),
    chance(0.6) ? 'full_time' : 'part_time', chance(0.6) ? randInt(2800, 4200) : null, chance(0.5) ? randInt(18, 30) : null]));

// Students: grade-consistent DOBs, a few on trial, adults can purchase.
const adultIds = new Set([6]);
await bulkInsert('students', ['student_id', 'status', 'date_of_birth', 'grade', 'gender', 'school'],
  studentIds.map((id, i) => {
    if (id === 3) return [3, 'enrolled', '2012-03-01', 8, 'female', 'Demo Middle School'];
    if (id === 4) return [4, 'enrolled', '2013-06-01', 7, 'male', 'Demo Middle School'];
    if (id === 6) return [6, 'enrolled', '1999-01-01', 12, 'other', '—'];
    const adult = i > 60; // a handful of adult learners at the tail
    if (adult) adultIds.add(id);
    const grade = adult ? 12 : randInt(4, 12);
    const birthYear = adult ? randInt(1995, 2004) : now.year - (grade + 6);
    return [id, chance(0.9) ? 'enrolled' : 'on_trial',
      `${birthYear}-${String(randInt(1, 12)).padStart(2, '0')}-${String(randInt(1, 28)).padStart(2, '0')}`,
      grade, pick(['male', 'female', 'other']), adult ? '—' : pick(SCHOOLS)];
  }));
await db.query(`UPDATE students SET can_purchase = true WHERE student_id = ANY($1)`, [[...adultIds]]);

// Guardians: one per minor student (Grace stays Alice's). Guardian users are
// generated; only Grace can log in — that's enough for the guardian portal.
const minorIds = studentIds.filter((id) => !adultIds.has(id));
const guardianUsers = await bulkInsert('users', ['password_hash', 'name', 'email', 'role'],
  minorIds.filter((id) => id !== 3).map((sid, i) => {
    const n = genName();
    return [hash, n, emailFor(n, 600 + i), 'guardian'];
  }), 'user_id');
const guardianRows = await bulkInsert('guardians', ['user_id', 'relationship'],
  [[5, 'parent'], ...guardianUsers.map((u) => [u.user_id, pick(['parent', 'parent', 'grandparent', 'guardian'])])], 'guardian_id, user_id');
const graceGuardianId = guardianRows.find((g) => g.user_id === 5).guardian_id;
const otherGuardians = guardianRows.filter((g) => g.user_id !== 5);
await bulkInsert('student_guardians', ['student_id', 'guardian_id', 'is_primary'],
  [[3, graceGuardianId, true],
   ...minorIds.filter((id) => id !== 3).map((sid, i) => [sid, otherGuardians[i].guardian_id, true])]);

// ---------------------------------------------------------------------------
// Catalog: subject groups, subjects, specialties, rooms, availability.
// ---------------------------------------------------------------------------
await db.exec(`
  INSERT INTO subject_groups (name) VALUES ('Math'), ('English'), ('Science'), ('Test prep');
  INSERT INTO subjects (group_id, name) VALUES
    (1,'Algebra'), (1,'Geometry'), (1,'Calculus'),
    (2,'Writing'), (2,'Reading'), (2,'Literature'),
    (3,'Physics'), (3,'Chemistry'), (3,'Biology'),
    (4,'SAT Math'), (4,'SAT Verbal');
  INSERT INTO rooms (name, capacity) VALUES
    ('Room A', 4), ('Room B', 10), ('Room C', 8), ('Lab 1', 6), ('Seminar Hall', 16);
`);
const N_SUBJECTS = 11, N_ROOMS = 5;

// Each instructor teaches 2–4 subjects; Kim keeps Algebra/Geometry/Writing.
const specialtyRows = [[2, 1], [2, 2], [2, 4]];
for (const id of instructorIds.slice(1)) {
  const subjects = new Set();
  while (subjects.size < randInt(2, 4)) subjects.add(randInt(1, N_SUBJECTS));
  for (const s of subjects) specialtyRows.push([id, s]);
}
await bulkInsert('instructor_specialties', ['instructor_id', 'subject_id'], specialtyRows);

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri'];
await bulkInsert('instructor_availability', ['instructor_id', 'day_of_week', 'start_time', 'end_time'],
  instructorIds.flatMap((id) => DAYS.map((d) => [id, d, '09:00', '20:00'])));

const specialtiesOf = new Map();
for (const [iid, sid] of specialtyRows) {
  if (!specialtiesOf.has(iid)) specialtiesOf.set(iid, []);
  specialtiesOf.get(iid).push(sid);
}

// ---------------------------------------------------------------------------
// Classes on a collision-free grid: no two classes share (instructor, day,
// hour) or (room, day, hour) — respects the schema's exclusion constraints.
// The Algebra group class (Kim, Tue/Thu 4pm, Room B, Alice + Ben) is class
// one, exactly as the README describes.
// ---------------------------------------------------------------------------
const HOURS = [15, 16, 17, 18, 19];
const usedInstr = new Set(); // `${iid}:${day}:${hour}`
const usedRoom = new Set();  // `${room}:${day}:${hour}`
const classes = [];

function claimSlots(iid, roomId, nSlots, fixed = null) {
  const slots = [];
  let guard = 0;
  while (slots.length < nSlots && guard++ < 300) {
    const [day, hour] = fixed?.[slots.length] ?? [pick(DAYS), pick(HOURS)];
    const ik = `${iid}:${day}:${hour}`, rk = `${roomId}:${day}:${hour}`;
    if (usedInstr.has(ik) || usedRoom.has(rk) || slots.some((s) => s.day === day && s.hour === hour)) continue;
    usedInstr.add(ik); usedRoom.add(rk);
    slots.push({ day, hour });
  }
  return slots.length === nSlots ? slots : null;
}

function addClass({ type, subjectId, iid, roomId, limit, cost, slots }) {
  classes.push({ type, subjectId, iid, roomId, limit, cost, slots, students: [] });
}

// Class 1: the canonical Algebra group class.
claimSlots(2, 2, 2, [['tue', 16], ['thu', 16]]);
addClass({ type: 'group', subjectId: 1, iid: 2, roomId: 2, limit: 6, cost: 5,
  slots: [{ day: 'tue', hour: 16 }, { day: 'thu', hour: 16 }] });

// ~19 more group classes + 5 one-on-ones, spread across instructors.
const ROOM_CAP = { 1: 4, 2: 10, 3: 8, 4: 6, 5: 16 };
for (let i = 0; i < 19; i++) {
  const iid = instructorIds[i % instructorIds.length];
  const subjectId = pick(specialtiesOf.get(iid));
  const roomId = randInt(1, N_ROOMS);
  const limit = Math.min(randInt(4, 12), ROOM_CAP[roomId]);
  const slots = claimSlots(iid, roomId, chance(0.55) ? 2 : 1);
  if (!slots) continue;
  addClass({ type: 'group', subjectId, iid, roomId, limit, cost: randInt(4, 8), slots });
}
for (let i = 0; i < 5; i++) {
  const iid = instructorIds[(i * 3 + 1) % instructorIds.length];
  const roomId = randInt(1, N_ROOMS);
  const slots = claimSlots(iid, roomId, 1);
  if (!slots) continue;
  addClass({ type: 'one_on_one', subjectId: pick(specialtiesOf.get(iid)), iid, roomId, limit: 1, cost: randInt(6, 9), slots });
}

const WEEKS_BACK = 8, WEEKS_AHEAD = 2;
const startsOn = now.minus({ weeks: WEEKS_BACK }).toISODate();
for (const c of classes) {
  const rule = { timezone: TZ, byday: c.slots.map((s) => ({ day: s.day, start: `${s.hour}:00`.padStart(5, '0'), end: `${s.hour + 1}:00`.padStart(5, '0') })) };
  const { rows: [row] } = await db.query(
    `INSERT INTO classes (class_type, subject_id, instructor_id, student_limit, session_credit_cost,
                          recurrence, recurrence_rule, starts_on, default_room_id, created_by)
     VALUES ($1,$2,$3,$4,$5,'weekly',$6,$7,$8,1) RETURNING class_id`,
    [c.type, c.subjectId, c.iid, c.limit, c.cost, JSON.stringify(rule), startsOn, c.roomId]);
  c.classId = row.class_id;
}

// Enrollments: Alice + Ben in Algebra (class 1), everyone else spread so each
// class sits at 50–100% of its limit and each student lands in 1–3 classes.
classes[0].students = [3, 4];
const enrollmentCount = new Map(studentIds.map((id) => [id, 0]));
enrollmentCount.set(3, 1); enrollmentCount.set(4, 1);
for (const c of classes.slice(1)) {
  const target = c.type === 'one_on_one' ? 1 : Math.max(2, Math.round(c.limit * (0.5 + rand() * 0.5)));
  const pool = studentIds.filter((id) => (enrollmentCount.get(id) ?? 0) < 3
    && !classes.some(other => other.students.includes(id)
      && other.slots.some(a => c.slots.some(b => a.day === b.day && a.hour === b.hour))));
  while (c.students.length < target && pool.length) {
    const idx = Math.floor(rand() * pool.length);
    const sid = pool.splice(idx, 1)[0];
    c.students.push(sid);
    enrollmentCount.set(sid, (enrollmentCount.get(sid) ?? 0) + 1);
  }
}
await bulkInsert('enrollments', ['class_id', 'student_id', 'joined_by'],
  classes.flatMap((c) => c.students.map((sid) => [c.classId, sid, 1])));

// ---------------------------------------------------------------------------
// Sessions: WEEKS_BACK weeks of history + WEEKS_AHEAD upcoming, generated
// from each class's byday. Past sessions: mostly completed with attendance,
// a few cancelled (with reasons), and YESTERDAY'S left unmarked so the
// Attendance page has a live "needs marking" backlog.
// ---------------------------------------------------------------------------
const DAY_NUM = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5 };
const CANCEL_REASONS = ['Tutor was out sick', 'Family conflict — make-up scheduled', 'School holiday', 'Room maintenance'];
const weekStart = now.startOf('week');
const sessionRows = [];   // [class_id, instructor_id, room_id, starts_at, ends_at, status, cancellation_reason]
const sessionMeta = [];   // aligned: { classRef, kind }
for (const c of classes) {
  for (let w = -WEEKS_BACK; w <= WEEKS_AHEAD; w++) {
    for (const s of c.slots) {
      const start = weekStart.plus({ weeks: w, days: DAY_NUM[s.day] - 1 }).set({ hour: s.hour, minute: 0, second: 0, millisecond: 0 });
      const end = start.plus({ hours: 1 });
      if (end < now.minus({ weeks: WEEKS_BACK + 1 })) continue;
      let status = 'scheduled', reason = null, kind = 'future';
      if (end < now) {
        const yesterday = start.hasSame(now.minus({ days: 1 }), 'day');
        if (yesterday) { kind = 'unmarked'; }
        else if (chance(0.05)) { status = pick(['cancelled_staff', 'cancelled_instructor']); reason = pick(CANCEL_REASONS); kind = 'cancelled'; }
        else if (chance(0.04)) { kind = 'unmarked'; }
        else { status = 'completed'; kind = 'completed'; }
      }
      sessionRows.push([c.classId, c.iid, c.roomId, start.toUTC().toISO(), end.toUTC().toISO(), status, reason]);
      sessionMeta.push({ classRef: c, kind });
    }
  }
}
const insertedSessions = await bulkInsert('class_sessions',
  ['class_id', 'instructor_id', 'room_id', 'starts_at', 'ends_at', 'status', 'cancellation_reason'],
  sessionRows, 'session_id, ends_at');

// Attendance for completed (present-heavy) and cancelled sessions.
const attendanceRows = [];
insertedSessions.forEach((s, i) => {
  const { classRef, kind } = sessionMeta[i];
  if (kind === 'completed') {
    for (const sid of classRef.students) {
      const status = chance(0.88) ? 'present' : chance(0.5) ? 'absent_unexcused' : 'absent_excused';
      attendanceRows.push([s.session_id, sid, status, classRef.iid, s.ends_at]);
    }
  } else if (kind === 'cancelled') {
    for (const sid of classRef.students) {
      attendanceRows.push([s.session_id, sid, 'instructor_cancelled', 1, s.ends_at]);
    }
  }
});
await bulkInsert('session_attendance', ['session_id', 'student_id', 'status', 'marked_by', 'marked_at'], attendanceRows);

// ---------------------------------------------------------------------------
// Money: wallets (+ top-up ledger entries), 6 months of payments, 3 months
// of payroll. Alice/Ben/Charlie keep their documented balances.
// ---------------------------------------------------------------------------
const wallets = await bulkInsert('wallets', ['student_id', 'balance'],
  studentIds.map((sid) => {
    if (sid === 3) return [3, 40];
    if (sid === 4) return [4, 3];
    if (sid === 6) return [6, 30];
    const r = rand();
    return [sid, r < 0.06 ? randInt(-8, -1) : r < 0.2 ? randInt(0, 5) : randInt(10, 60)];
  }), 'wallet_id, student_id');
await db.exec(`INSERT INTO payment_methods (method_name) VALUES ('Card'), ('Bank transfer'), ('Cash')`);
// Credit packages (~$9/credit; classes cost 4–8 credits/session).
await db.exec(`
  INSERT INTO credit_packages (name, credits, bonus_credits, price, sort_order) VALUES
    ('Starter', 50, 0, 450, 1),
    ('Standard', 100, 5, 850, 2),
    ('Intensive', 200, 20, 1600, 3)
`);
const paymentRows = [];
for (const sid of studentIds) {
  for (let m = 5; m >= 0; m--) {
    if (!chance(0.65)) continue;
    const month = now.minus({ months: m });
    const day = Math.min(randInt(1, 27), m === 0 ? Math.max(1, now.day - 1) : 27);
    paymentRows.push([sid, randInt(15, 55) * 10, month.set({ day }).toISODate(), randInt(1, 3), 'Tuition received (money-only record)']);
  }
}
await bulkInsert('payments', ['student_id', 'amount', 'payment_date', 'method_id', 'description'], paymentRows);

// Match historical attendance to its actual credit effect. Opening adjustments
// explicitly represent imported balances; they are not undocumented purchases.
await db.exec(`
  INSERT INTO credit_ledger (wallet_id, entry_type, amount, attendance_id, note, created_by, created_at)
  SELECT w.wallet_id, 'deduction', -c.session_credit_cost, a.attendance_id,
         'Historical session attendance', a.marked_by, a.marked_at
    FROM session_attendance a JOIN class_sessions s USING (session_id)
    JOIN classes c USING (class_id) JOIN wallets w ON w.student_id = a.student_id
   WHERE a.status IN ('present','absent_unexcused','cancelled_late');
`);
for (const w of wallets) {
  const { rows: [payment] } = await db.query(
    `INSERT INTO payments (student_id, amount, payment_date, method_id, package_id, description)
     VALUES ($1,850,$2,2,2,'Package: Standard') RETURNING payment_id`,
    [w.student_id, now.minus({ days: 3 }).toISODate()]);
  await db.query(
    `INSERT INTO credit_ledger (wallet_id, entry_type, amount, note, created_by, created_at)
     VALUES ($1,'purchase',105,$2,1,$3)`,
    [w.wallet_id, `Package: Standard (100 + 5 bonus); payment ${payment.payment_id}`,
      now.minus({ days: 3 }).toUTC().toISO()]);
}
await db.query(`
  INSERT INTO credit_ledger (wallet_id, entry_type, amount, note, created_by, created_at)
  SELECT w.wallet_id, 'adjustment', w.balance - COALESCE(sum(l.amount),0),
         'Synthetic opening balance adjustment (imported history)', 1, $1
    FROM wallets w LEFT JOIN credit_ledger l USING (wallet_id)
   GROUP BY w.wallet_id, w.balance HAVING w.balance <> COALESCE(sum(l.amount),0)
`, [now.minus({ weeks: WEEKS_BACK + 1 }).toUTC().toISO()]);
// Notes have a real mixture of complete and missing entries.
await db.exec(`
  INSERT INTO session_notes (session_id, student_id, performance, improvements, created_by, created_at)
  SELECT a.session_id, a.student_id, 'Understands the core concepts', 'Practice showing each step',
         s.instructor_id, a.marked_at
    FROM session_attendance a JOIN class_sessions s USING (session_id)
   WHERE a.status = 'present' AND a.student_id % 3 <> 0;
`);

const { rows: instructorPay } = await db.query(
  `SELECT instructor_id, employment_type, salary, hourly_rate FROM instructors`);
const payrollRows = [];
for (let m = 3; m >= 1; m--) {
  const start = now.minus({ months: m }).startOf('month').toISODate();
  const end = now.minus({ months: m }).endOf('month').toISODate();
  for (const i of instructorPay) {
    const pay = i.employment_type === 'full_time' ? Number(i.salary) : Number(i.hourly_rate) * randInt(24, 56);
    payrollRows.push([i.instructor_id, 'instructor', start, end, Math.round(pay * 100) / 100]);
  }
  for (const sid of staffIds.slice(1)) {
    payrollRows.push([sid, 'staff', start, end, randInt(2200, 4200)]);
  }
}
await bulkInsert('payroll', ['user_id', 'user_type', 'pay_period_start', 'pay_period_end', 'total_pay'], payrollRows);


return { studentIds, instructorIds, staffIds, classes, now,
  counts: { students: studentIds.length, instructors: instructorIds.length, classes: classes.length,
    sessions: insertedSessions.length, attendance: attendanceRows.length, payments: paymentRows.length } };
}
