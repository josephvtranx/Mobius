// Guardian portal (spec 05 GRD-1/GRD-5): one home aggregating every linked
// student — schedule, wallet, latest note, needs-action — plus per-guardian
// notification preferences. Guardians get FULL visibility of linked students;
// wallets stay per-student, never pooled. Mounted at /api/guardians alongside
// the legacy v1 router (distinct paths — legacy has no /me/*).
import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getSettings } from '../helpers/institutionSettings.js';
import { computeWallet } from '../helpers/walletMath.js';

const router = express.Router();

// my guardian_id + linked students (empty array for an unlinked guardian)
async function myLinks(db, userId) {
  const { rows } = await db.query(
    `SELECT sg.student_id, sg.is_primary, sg.notification_prefs, u.name AS student_name
       FROM guardians g
       JOIN student_guardians sg ON sg.guardian_id = g.guardian_id
       JOIN users u ON u.user_id = sg.student_id
      WHERE g.user_id = $1
      ORDER BY u.name`, [userId]);
  return rows;
}

// ---------------------------------------------------------------------------
// GRD-1 — portal home: per-child cards + "needs action"
// ---------------------------------------------------------------------------
router.get('/me/portal', authenticateToken, authorizeRole('guardian'), async (req, res) => {
  const links = await myLinks(req.db, req.user.user_id);
  const settings = await getSettings(req.db);

  const children = [];
  const lowBalance = [];
  for (const link of links) {
    const wallet = await computeWallet(req.db, link.student_id, settings);

    const { rows: nextSessions } = await req.db.query(
      `SELECT cs.session_id, cs.starts_at, cs.ends_at, sub.name AS subject
         FROM enrollments e
         JOIN classes c ON c.class_id = e.class_id AND c.status = 'active'
         JOIN subjects sub ON sub.subject_id = c.subject_id
         JOIN class_sessions cs ON cs.class_id = c.class_id
        WHERE e.student_id = $1 AND e.status = 'active'
          AND cs.status = 'scheduled' AND cs.starts_at > CURRENT_TIMESTAMP
        ORDER BY cs.starts_at LIMIT 3`, [link.student_id]);

    const { rows: [lastNote] } = await req.db.query(
      `SELECT max(created_at) AS last_note_at FROM session_notes WHERE student_id = $1`,
      [link.student_id]);

    // same low-balance predicate as the daily scanner (BIL-2 "low")
    const { rows: low } = await req.db.query(
      `SELECT c.class_id, sub.name AS subject, c.session_credit_cost AS cost
         FROM enrollments e
         JOIN classes c ON c.class_id = e.class_id AND c.status = 'active'
         JOIN subjects sub ON sub.subject_id = c.subject_id
        WHERE e.student_id = $1 AND e.status = 'active'
          AND $2 >= 0 AND $2 < c.session_credit_cost * $3`,
      [link.student_id, wallet.balance, settings.low_balance_notify_runway_sessions]);
    for (const l of low) {
      lowBalance.push({ student_id: link.student_id, student_name: link.student_name, ...l, balance: wallet.balance });
    }

    children.push({
      student_id: link.student_id, name: link.student_name, is_primary: link.is_primary,
      balance: wallet.balance, committed: wallet.committed, available: wallet.available,
      next_sessions: nextSessions, last_note_at: lastNote?.last_note_at ?? null
    });
  }

  // pending payment links (nothing writes this table until the Top-Up spec —
  // included so the portal shape is final) + my recent notifications
  const { rows: paymentLinks } = await req.db.query(
    `SELECT pl.* FROM payment_links pl
      WHERE pl.status = 'pending' AND pl.student_id = ANY($1::int[])
      ORDER BY pl.expires_at`,
    [links.map(l => l.student_id)]);

  const { rows: notifications } = await req.db.query(
    `SELECT notification_id, event_type, subject_type, subject_id, payload, created_at
       FROM notification_log WHERE recipient_user_id = $1
      ORDER BY notification_id DESC LIMIT 20`, [req.user.user_id]);

  res.json({
    children,
    needs_action: { payment_links: paymentLinks, low_balance: lowBalance },
    notifications
  });
});

// ---------------------------------------------------------------------------
// GRD-5 — per-guardian notification preferences (JSONB, per linked student).
// Stored here; HONORED by the Phase 7.6 notification service, which also
// enforces the unmutable floor (urgent classes stay minimum in-app).
// ---------------------------------------------------------------------------
router.patch('/me/students/:studentId/prefs', authenticateToken, authorizeRole('guardian'), async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (!studentId) return res.status(400).json({ message: 'invalid student id' });
  const prefs = req.body.notification_prefs;
  if (prefs === null || typeof prefs !== 'object' || Array.isArray(prefs)) {
    return res.status(400).json({ message: 'notification_prefs must be an object' });
  }

  const { rowCount } = await req.db.query(
    `UPDATE student_guardians sg SET notification_prefs = $1
       FROM guardians g
      WHERE g.guardian_id = sg.guardian_id AND g.user_id = $2 AND sg.student_id = $3`,
    [JSON.stringify(prefs), req.user.user_id, studentId]);
  if (!rowCount) return res.status(403).json({ message: 'Not linked to this student' });
  res.json({ student_id: studentId, notification_prefs: prefs });
});

export default router;
