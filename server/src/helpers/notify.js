// The notification service (spec 08, INV-7): one event-driven service off the
// domain writes; every automated side-effect gets a read-back-able
// notification_log row. Delivery today is in-app rows only — Email/Kakao are a
// later integration slice; per-guardian prefs (GRD-5) already filter here.
// Callers inside a transaction pass the tx client so notices commit atomically
// with the domain write.

// Urgent classes can never be fully muted (spec 05/08: payment expiry,
// delinquency, instructor cancellation — minimum in-app).
export const URGENT_EVENTS = new Set([
  'balance_negative', 'session_cancelled_by_instructor', 'class_terminated',
  'payment_link_expiring' // reserved: Top-Up spec
]);

export const BILLING_EVENTS = new Set([
  'low_balance', 'balance_negative', 'wallet_credited', 'price_change',
  'payment_link_expiring'
]);

export async function logNotifications(db, { eventType, recipientUserIds, subjectType, subjectId, payload }) {
  for (const uid of recipientUserIds.filter(Boolean)) {
    await db.query(
      `INSERT INTO notification_log (event_type, recipient_user_id, channel, subject_type, subject_id, payload)
       VALUES ($1, $2, 'in_app', $3, $4, $5)`,
      [eventType, uid, subjectType, String(subjectId), payload ?? null]
    );
  }
}

// student's own user id + every linked guardian's user id (no prefs filtering —
// use notifyFamily for family-facing events; this remains for raw recipient sets)
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

const prefMode = (prefs) => String(prefs?.mode ?? 'all').replace('-', '_');

// The family-facing entry point. Recipient rules:
// - guardians: filtered by their per-link notification_prefs.mode —
//   'all'/absent and 'digest' deliver (the in-app feed IS the digest; the mode
//   matters once email lands); 'billing_only' delivers only BILLING ∪ URGENT.
//   URGENT events always deliver.
// - the student: always for non-billing events; for BILLING events only when
//   they can_purchase or have zero guardians (spec 05 GRD-4 adult flow).
// - alsoNotify (instructor, staff, …) bypasses prefs entirely.
export async function notifyFamily(db, {
  studentId, eventType, subjectType, subjectId, payload, alsoNotify = []
}) {
  const { rows: guardians } = await db.query(
    `SELECT g.user_id, sg.notification_prefs FROM student_guardians sg
      JOIN guardians g ON g.guardian_id = sg.guardian_id
     WHERE sg.student_id = $1`, [studentId]);

  const isBilling = BILLING_EVENTS.has(eventType);
  const isUrgent = URGENT_EVENTS.has(eventType);

  const recipients = new Set(alsoNotify.filter(Boolean));

  let studentGets = true;
  if (isBilling && guardians.length) {
    const { rows: [stu] } = await db.query(
      `SELECT can_purchase FROM students WHERE student_id = $1`, [studentId]);
    studentGets = stu?.can_purchase === true;
  }
  if (studentGets) recipients.add(studentId);

  for (const g of guardians) {
    const mode = prefMode(g.notification_prefs);
    const muted = mode === 'billing_only' && !isBilling && !isUrgent;
    if (!muted) recipients.add(g.user_id);
  }

  await logNotifications(db, {
    eventType, recipientUserIds: [...recipients], subjectType, subjectId, payload
  });
}
