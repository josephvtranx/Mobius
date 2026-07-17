// Committed-balance math (spec 04 §Committed, display-only), shared by the
// wallet read surface and the guardian portal: committed = Σ price-at-start of
// scheduled, unattended, future sessions per active enrollment — all remaining
// for fixed-end classes, the next enrollment_runway_sessions for open-ended.
// "No wallet" stays balance 0 without creating a row (creditGate convention).
export async function computeWallet(db, studentId, settings) {
  const { rows: [wallet] } = await db.query(
    `SELECT wallet_id, balance FROM wallets WHERE student_id = $1`, [studentId]);
  const balance = wallet?.balance ?? 0;

  const { rows: perEnrollment } = await db.query(
    `SELECT e.enrollment_id, c.class_id, sub.name AS subject, c.ends_on,
            COALESCE(SUM(p.cost), 0)::int AS committed,
            count(cs.session_id)::int AS sessions_counted
       FROM enrollments e
       JOIN classes c   ON c.class_id = e.class_id
       JOIN subjects sub ON sub.subject_id = c.subject_id
       LEFT JOIN LATERAL (
         SELECT s.session_id, s.starts_at FROM class_sessions s
          WHERE s.class_id = c.class_id AND s.status = 'scheduled'
            AND s.starts_at > CURRENT_TIMESTAMP
            AND NOT EXISTS (SELECT 1 FROM session_attendance sa
                             WHERE sa.session_id = s.session_id AND sa.student_id = e.student_id)
          ORDER BY s.starts_at
          LIMIT CASE WHEN c.ends_on IS NULL THEN $2::int ELSE NULL END
       ) cs ON true
       LEFT JOIN LATERAL (
         SELECT COALESCE(
           (SELECT session_credit_cost FROM class_price_history
             WHERE class_id = c.class_id AND effective_from <= cs.starts_at
             ORDER BY effective_from DESC LIMIT 1),
           c.session_credit_cost)::int AS cost
       ) p ON cs.session_id IS NOT NULL
      WHERE e.student_id = $1 AND e.status = 'active' AND c.status = 'active'
      GROUP BY e.enrollment_id, c.class_id, sub.name, c.ends_on`,
    [studentId, settings.enrollment_runway_sessions]);

  const committed = perEnrollment.reduce((sum, r) => sum + r.committed, 0);
  return {
    wallet_id: wallet?.wallet_id ?? null,
    balance, committed, available: balance - committed,
    per_enrollment: perEnrollment
  };
}
