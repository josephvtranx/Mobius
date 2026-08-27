// Wallet surface (schema v2, spec 04): read view (balance / committed /
// available / ledger) and staff manual credit entries — the top-up stopgap
// until the Top-Up spec (ASSUMPTION[TOPUP]) lands. Deductions and refunds are
// engine-only (INV-1); cashout is BIL-OPEN-1 and rejected here.
// INV-6: no code path here touches enrollments — billing never unenrolls.
import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getSettings } from '../helpers/institutionSettings.js';
import { notifyFamily } from '../helpers/notify.js';
import { canActForStudent } from '../helpers/authz.js';
import { computeWallet } from '../helpers/walletMath.js';
import { withTransaction } from '../helpers/withTransaction.js';

const router = express.Router();

const MANUAL_ENTRY_TYPES = new Set(['purchase', 'bonus', 'adjustment']);

// ---------------------------------------------------------------------------
// GET / — staff wallet console: every active student with balance and last
// ledger activity in ONE query (the old UI was a pick-a-student dropdown
// because only the per-student view existed). Committed/available math stays
// on the per-student view — it's a lateral-join per enrollment and doesn't
// belong in a 70-row list.
// ---------------------------------------------------------------------------
router.get('/', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { rows } = await req.db.query(
    `SELECT s.student_id, u.name, COALESCE(w.balance, 0)::int AS balance,
            (SELECT max(l.created_at) FROM credit_ledger l WHERE l.wallet_id = w.wallet_id) AS last_entry_at
       FROM students s
       JOIN users u ON u.user_id = s.student_id AND u.is_active = true
       LEFT JOIN wallets w ON w.student_id = s.student_id
      ORDER BY u.name`);
  res.json(rows);
});

// ---------------------------------------------------------------------------
// GET /:studentId — balance, committed (display-only, spec 04 §Committed),
// available, recent ledger. Sequential pool reads; snapshot skew is fine for
// a dashboard view, and "no wallet" stays balance 0 without creating a row
// (same convention as classGates.creditGate).
// ---------------------------------------------------------------------------
router.get('/:studentId', authenticateToken, async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (!studentId) return res.status(400).json({ message: 'invalid student id' });
  if (!await canActForStudent(req.db, req.user, studentId)) {
    return res.status(403).json({ message: 'Not authorized to view this wallet' });
  }
  const { rows: [student] } = await req.db.query(
    `SELECT 1 FROM students WHERE student_id = $1`, [studentId]);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const settings = await getSettings(req.db);
  const walletView = await computeWallet(req.db, studentId, settings);

  const { rows: ledger } = await req.db.query(
    `SELECT l.entry_id, l.entry_type, l.amount, l.note, l.created_by, l.created_at,
            sa.session_id, sa.status AS attendance_status, cs.starts_at AS session_starts_at, cs.class_id
       FROM credit_ledger l
       JOIN wallets w ON w.wallet_id = l.wallet_id
       LEFT JOIN session_attendance sa ON sa.attendance_id = l.attendance_id
       LEFT JOIN class_sessions cs ON cs.session_id = sa.session_id
      WHERE w.student_id = $1
      ORDER BY l.entry_id DESC LIMIT 50`, [studentId]);

  res.json({ student_id: studentId, ...walletView, ledger });
});

// ---------------------------------------------------------------------------
// POST /:studentId/entries — staff manual credit entry ('purchase'|'bonus'|
// 'adjustment'; no attendance_id — this is the BIL-2 staff-waiver/top-up path).
// Crossing back to a non-negative balance closes the delinquent-balance task,
// which both keeps the delinquency queue honest and re-arms the grace notice;
// the attendance block clears automatically since it is computed from balance.
// ---------------------------------------------------------------------------
router.post('/:studentId/entries', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (!studentId) return res.status(400).json({ message: 'invalid student id' });
  const { entry_type, amount, note } = req.body;

  if (entry_type === 'deduction' || entry_type === 'refund') {
    return res.status(400).json({ message: 'deduction/refund entries are attendance-driven only (INV-1) — use the attendance surface' });
  }
  if (entry_type === 'cashout') {
    return res.status(400).json({ message: 'cashout is not available until the Top-Up spec lands (BIL-OPEN-1)' });
  }
  if (!MANUAL_ENTRY_TYPES.has(entry_type)) {
    return res.status(400).json({ message: 'entry_type must be purchase, bonus, or adjustment' });
  }
  if (!Number.isInteger(amount) || amount === 0) {
    return res.status(400).json({ message: 'amount must be a non-zero integer number of credits' });
  }
  if ((entry_type === 'purchase' || entry_type === 'bonus') && amount < 0) {
    return res.status(400).json({ message: `${entry_type} amount must be positive` });
  }

  const { rows: [student] } = await req.db.query(
    `SELECT 1 FROM students WHERE student_id = $1`, [studentId]);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const outcome = await withTransaction(req.db, async (client) => {
    await client.query(
      `INSERT INTO wallets (student_id) VALUES ($1) ON CONFLICT (student_id) DO NOTHING`, [studentId]);
    const { rows: [wallet] } = await client.query(
      `SELECT wallet_id, balance FROM wallets WHERE student_id = $1 FOR UPDATE`, [studentId]);

    const { rows: [entry] } = await client.query(
      `INSERT INTO credit_ledger (wallet_id, entry_type, amount, note, created_by)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [wallet.wallet_id, entry_type, amount, note ?? null, req.user.user_id]);
    const { rows: [{ balance }] } = await client.query(
      `UPDATE wallets SET balance = balance + $1 WHERE wallet_id = $2 RETURNING balance`,
      [amount, wallet.wallet_id]);

    if (wallet.balance < 0 && balance >= 0) {
      await client.query(
        `UPDATE staff_tasks SET status = 'done', resolved_by = $1, resolved_at = CURRENT_TIMESTAMP
          WHERE kind = 'delinquent_balance' AND subject_type = 'student'
            AND subject_id = $2 AND status IN ('open','in_progress')`,
        [req.user.user_id, String(studentId)]);
    }

    await notifyFamily(client, {
      studentId: studentId, eventType: 'wallet_credited', subjectType: 'student', subjectId: studentId,
      payload: { entry_type, amount, balance }
    });
    return { entry, balance };
  });
  res.status(201).json(outcome);
});

export default router;
