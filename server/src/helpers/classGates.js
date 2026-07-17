// Enrollment gate sequence (spec 03 SCH-2, 04 §credit gate).
// All three checks run inside the caller's transaction, in order:
// seat (business cap) → room (physical cap) → credit (wallet runway).
// Each returns { ok, ...details }; callers turn failures into API errors.

export async function seatCheck(client, classRow) {
  const { rows } = await client.query(
    `SELECT count(*)::int AS active FROM enrollments WHERE class_id = $1 AND status = 'active'`,
    [classRow.class_id]
  );
  const active = rows[0].active;
  return { ok: active < classRow.student_limit, active, limit: classRow.student_limit };
}

// Every future scheduled session's room must physically fit the roster + the new student.
export async function roomCheck(client, classRow, additional = 1) {
  const { rows } = await client.query(
    `SELECT count(*)::int AS active FROM enrollments WHERE class_id = $1 AND status = 'active'`,
    [classRow.class_id]
  );
  const needed = rows[0].active + additional;
  const { rows: tight } = await client.query(
    `SELECT cs.session_id, cs.starts_at, r.name AS room_name, r.capacity
       FROM class_sessions cs
       JOIN rooms r ON r.room_id = cs.room_id
      WHERE cs.class_id = $1 AND cs.status = 'scheduled'
        AND cs.starts_at > CURRENT_TIMESTAMP AND r.capacity < $2
      ORDER BY cs.starts_at LIMIT 5`,
    [classRow.class_id, needed]
  );
  return { ok: tight.length === 0, needed, conflicts: tight };
}

// Point-in-time check, no reservation (spec 04): fixed-end classes need runway
// to the end; open-ended need enrollment_runway_sessions' worth.
export async function creditGate(client, classRow, studentId, settings) {
  const cost = classRow.session_credit_cost;
  let sessionsRequired;
  if (classRow.ends_on !== null) {
    const { rows } = await client.query(
      `SELECT count(*)::int AS remaining FROM class_sessions
        WHERE class_id = $1 AND status = 'scheduled' AND starts_at > CURRENT_TIMESTAMP`,
      [classRow.class_id]
    );
    sessionsRequired = rows[0].remaining;
  } else {
    sessionsRequired = settings.enrollment_runway_sessions;
  }
  const required = cost * sessionsRequired;

  const { rows: w } = await client.query(
    `SELECT balance FROM wallets WHERE student_id = $1`, [studentId]
  );
  const balance = w.length ? w[0].balance : 0; // no wallet yet = zero credits
  return { ok: balance >= required, required, balance, shortfall: Math.max(0, required - balance) };
}
