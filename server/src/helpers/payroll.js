// Payroll computation, shared by the preview and run endpoints (payrollRoutes.js)
// so they can never drift from each other.
//
// Instructor part_time pay is hourly_rate × hours actually taught in the
// period, computed from real class_sessions (status = 'completed' — a
// session only reaches that once its attendance is fully marked, so this
// reflects class time actually delivered, not scheduled-but-not-yet-held
// time). Full-time instructors and full-time staff are paid their flat
// monthly `salary` for the run — not prorated to the exact date range
// chosen, which would just be a different fabricated precision dressed up
// as accuracy; staff are expected to run salaried payroll on a monthly
// cadence. Hourly (part_time) staff are excluded: `staff` don't teach
// classes, and there's no clock-in/out endpoint yet to generate real,
// ongoing time_logs — paying them from frozen seed data would be fake.

async function instructorPay(db, instructorId, periodStart, periodEnd) {
  const { rows: [inst] } = await db.query(
    `SELECT employment_type, salary, hourly_rate FROM instructors WHERE instructor_id = $1`,
    [instructorId]);
  if (!inst) return null;

  if (inst.employment_type === 'full_time') {
    return { user_type: 'instructor', pay_basis: 'salary', hours: null, rate: null, total_pay: Number(inst.salary ?? 0) };
  }

  const { rows: [{ hours }] } = await db.query(
    `SELECT COALESCE(SUM(EXTRACT(EPOCH FROM (ends_at - starts_at)) / 3600.0), 0)::float AS hours
       FROM class_sessions
      WHERE instructor_id = $1 AND status = 'completed'
        AND starts_at >= $2::timestamptz AND starts_at < $3::timestamptz`,
    [instructorId, periodStart, periodEnd]);
  const rate = Number(inst.hourly_rate ?? 0);
  return { user_type: 'instructor', pay_basis: 'hourly', hours, rate, total_pay: Math.round(hours * rate * 100) / 100 };
}

async function staffPay(db, staffId) {
  const { rows: [s] } = await db.query(
    `SELECT employment_status, salary FROM staff WHERE staff_id = $1`,
    [staffId]);
  if (!s) return null;
  if (s.employment_status !== 'full_time') {
    return { user_type: 'staff', pay_basis: 'hourly', excluded: true,
      reason: 'Hourly staff pay needs a real clock-in/out record — not built yet.' };
  }
  return { user_type: 'staff', pay_basis: 'salary', hours: null, rate: null, total_pay: Number(s.salary ?? 0) };
}

// Every active instructor + staff member's computed pay for a period.
// Real users only — no invented headcount.
export async function computePayrollPreview(db, periodStart, periodEnd) {
  const { rows: instructors } = await db.query(
    `SELECT u.user_id, u.name FROM users u JOIN instructors i ON i.instructor_id = u.user_id
      WHERE u.role = 'instructor' AND u.is_active = true ORDER BY u.name`);
  const { rows: staffMembers } = await db.query(
    `SELECT u.user_id, u.name FROM users u JOIN staff s ON s.staff_id = u.user_id
      WHERE u.role = 'staff' AND u.is_active = true ORDER BY u.name`);

  const rows = [];
  for (const i of instructors) {
    const pay = await instructorPay(db, i.user_id, periodStart, periodEnd);
    if (pay) rows.push({ user_id: i.user_id, name: i.name, ...pay });
  }
  for (const s of staffMembers) {
    const pay = await staffPay(db, s.user_id);
    if (pay) rows.push({ user_id: s.user_id, name: s.name, ...pay });
  }
  return rows;
}
