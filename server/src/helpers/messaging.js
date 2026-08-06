// Who's allowed to message whom. Not an open free-for-all: staff can reach
// anyone (operational necessity), but an instructor and a student/guardian
// can only message each other if a real active teaching relationship
// exists (derived from enrollments/classes, not a stored contact list) —
// mirrors the design's "message your teacher" / "message your student's
// family" model rather than a general social-messaging free-for-all.
// instructor_id/student_id/staff_id are all == users.user_id (1:1 PK-as-FK).

async function instructorTeachesStudent(db, instructorId, studentId) {
  const { rows } = await db.query(
    `SELECT 1 FROM enrollments e JOIN classes c ON c.class_id = e.class_id
      WHERE e.student_id = $1 AND c.instructor_id = $2
        AND e.status = 'active' AND c.status = 'active' LIMIT 1`,
    [studentId, instructorId]);
  return rows.length > 0;
}

async function instructorTeachesGuardiansChild(db, instructorId, guardianUserId) {
  const { rows } = await db.query(
    `SELECT 1 FROM student_guardians sg
       JOIN guardians g ON g.guardian_id = sg.guardian_id
       JOIN enrollments e ON e.student_id = sg.student_id
       JOIN classes c ON c.class_id = e.class_id
      WHERE g.user_id = $1 AND c.instructor_id = $2
        AND e.status = 'active' AND c.status = 'active' LIMIT 1`,
    [guardianUserId, instructorId]);
  return rows.length > 0;
}

export async function canMessage(db, userA, userB) {
  if (userA.user_id === userB.user_id) return false;
  if (userA.role === 'staff' || userB.role === 'staff') return true;

  const instructor = userA.role === 'instructor' ? userA : userB.role === 'instructor' ? userB : null;
  const other = instructor === userA ? userB : userA;
  if (!instructor) return false; // no instructor on either side — not an allowed pair

  if (other.role === 'student') return instructorTeachesStudent(db, instructor.user_id, other.user_id);
  if (other.role === 'guardian') return instructorTeachesGuardiansChild(db, instructor.user_id, other.user_id);
  return false; // instructor <-> instructor not allowed
}

// The "New message" recipient picker — same relationship rules as
// canMessage(), expressed as a single query per role rather than N calls.
export async function getContacts(db, user) {
  if (user.role === 'staff') {
    const { rows } = await db.query(
      `SELECT user_id, name, role FROM users
        WHERE user_id <> $1 AND is_active = true ORDER BY name`, [user.user_id]);
    return rows;
  }

  if (user.role === 'instructor') {
    const { rows } = await db.query(
      `SELECT DISTINCT u.user_id, u.name, u.role FROM users u
        WHERE u.role = 'staff' AND u.is_active = true
        UNION
       SELECT DISTINCT u.user_id, u.name, u.role
         FROM enrollments e JOIN classes c ON c.class_id = e.class_id
         JOIN users u ON u.user_id = e.student_id
        WHERE c.instructor_id = $1 AND e.status = 'active' AND c.status = 'active' AND u.is_active = true
        UNION
       SELECT DISTINCT u.user_id, u.name, u.role
         FROM enrollments e JOIN classes c ON c.class_id = e.class_id
         JOIN student_guardians sg ON sg.student_id = e.student_id
         JOIN guardians g ON g.guardian_id = sg.guardian_id
         JOIN users u ON u.user_id = g.user_id
        WHERE c.instructor_id = $1 AND e.status = 'active' AND c.status = 'active' AND u.is_active = true
       ORDER BY name`, [user.user_id]);
    return rows;
  }

  // student or guardian: their own (or their linked children's) active
  // instructors, plus staff.
  const studentIdsQuery = user.role === 'student'
    ? `SELECT $1::int AS student_id`
    : `SELECT sg.student_id FROM student_guardians sg JOIN guardians g ON g.guardian_id = sg.guardian_id WHERE g.user_id = $1`;

  const { rows } = await db.query(
    `SELECT DISTINCT u.user_id, u.name, u.role FROM users u
      WHERE u.role = 'staff' AND u.is_active = true
      UNION
     SELECT DISTINCT u.user_id, u.name, u.role
       FROM (${studentIdsQuery}) s
       JOIN enrollments e ON e.student_id = s.student_id
       JOIN classes c ON c.class_id = e.class_id
       JOIN users u ON u.user_id = c.instructor_id
      WHERE e.status = 'active' AND c.status = 'active' AND u.is_active = true
     ORDER BY name`, [user.user_id]);
  return rows;
}
