// Notification log writes (spec 08, INV-7): every automated side-effect gets a
// read-back-able record. Delivery (email/Kakao) is a later concern; v1 records
// in-app rows. Never throws — a logging failure must not fail the domain write
// UNLESS called inside a transaction client, where the caller wants atomicity.

export async function logNotifications(db, { eventType, recipientUserIds, subjectType, subjectId, payload }) {
  for (const uid of recipientUserIds.filter(Boolean)) {
    await db.query(
      `INSERT INTO notification_log (event_type, recipient_user_id, channel, subject_type, subject_id, payload)
       VALUES ($1, $2, 'in_app', $3, $4, $5)`,
      [eventType, uid, subjectType, String(subjectId), payload ?? null]
    );
  }
}

// student's own user id + every linked guardian's user id
export async function familyRecipients(db, studentId) {
  const { rows } = await db.query(
    `SELECT $1::int AS user_id
      UNION
     SELECT g.user_id FROM student_guardians sg
       JOIN guardians g ON g.guardian_id = sg.guardian_id
      WHERE sg.student_id = $1`,
    [studentId]
  );
  return rows.map(r => r.user_id);
}
