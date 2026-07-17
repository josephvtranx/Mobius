// Shared authorization checks for acting on a student's behalf.

// staff, the student themself, or a guardian linked via student_guardians
export async function canActForStudent(db, user, studentId) {
  if (user.role === 'staff' || user.user_id === studentId) return true;
  const { rows } = await db.query(
    `SELECT 1 FROM student_guardians sg JOIN guardians g ON g.guardian_id = sg.guardian_id
      WHERE sg.student_id = $1 AND g.user_id = $2`, [studentId, user.user_id]);
  return rows.length > 0;
}
