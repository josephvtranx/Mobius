// Real payments (server: /api/payments). payments/payment_methods already
// existed in the v2 baseline schema with zero endpoints against them — the
// staff Financial-Dashboard Payments.jsx page and guardian Billing were both
// honest stubs until now. This is a manual "record money already received"
// ledger, not a checkout flow: there is no processor integration
// (payments.provider/provider_ref stay NULL) and no card collection.
//
// Update (2026-08-20): credit_packages landed — an academy-defined bundle
// IS a real dollars-per-credit rate, so recording a payment WITH a
// package_id credits the wallet (credits + bonus) in the same transaction.
// A payment without a package stays money-only, exactly as before.
import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { canActForStudent } from '../helpers/authz.js';
import { withTransaction } from '../helpers/withTransaction.js';
import { notifyFamily } from '../helpers/notify.js';

const router = express.Router();

function validAmount(amount) {
  return typeof amount === 'number' && isFinite(amount) && amount >= 0;
}

// ---------------------------------------------------------------------------
// Payment methods directory (Cash/Card/Bank transfer/…) — staff-maintained,
// same small-directory pattern as roomRoutes.js.
// ---------------------------------------------------------------------------
router.get('/methods', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { rows } = await req.db.query(
    `SELECT method_id, method_name, details FROM payment_methods ORDER BY method_name`);
  res.json(rows);
});

router.post('/methods', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { method_name, details } = req.body;
  if (!method_name?.trim()) return res.status(400).json({ message: 'method_name is required' });
  const { rows: [method] } = await req.db.query(
    `INSERT INTO payment_methods (method_name, details) VALUES ($1,$2) RETURNING *`,
    [method_name.trim(), details ?? null]);
  res.status(201).json(method);
});

// ---------------------------------------------------------------------------
// POST / — record a payment already received. Staff-entered fact, not a
// charge: nothing here moves money or credits.
// ---------------------------------------------------------------------------
router.post('/', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { student_id, amount, payment_date, method_id, description, reference, package_id } = req.body;
  if (!student_id) return res.status(400).json({ message: 'student_id is required' });
  if (!payment_date) return res.status(400).json({ message: 'payment_date is required' });

  // Package purchase: the package supplies the default amount and the credit
  // grant. amount may still be overridden (discounts happen at the desk).
  let pkg = null;
  if (package_id != null) {
    if (!Number.isInteger(Number(package_id))) return res.status(400).json({ message: 'package_id must be a package id' });
    const { rows: [row] } = await req.db.query(
      `SELECT * FROM credit_packages WHERE package_id = $1`, [Number(package_id)]);
    if (!row) return res.status(400).json({ message: 'Unknown package' });
    if (!row.is_active) return res.status(400).json({ message: 'Package is retired' });
    pkg = row;
  }
  const paidAmount = amount === undefined && pkg ? Number(pkg.price) : amount;
  if (!validAmount(paidAmount)) return res.status(400).json({ message: 'amount must be a non-negative number' });
  // method_id is an integer FK — reject garbage ('' crashed the process
  // before express-async-errors) and unknown ids with a 400, not a 500.
  const methodId = method_id == null || method_id === '' ? null : Number(method_id);
  if (methodId !== null && !Number.isInteger(methodId)) {
    return res.status(400).json({ message: 'method_id must be a payment method id' });
  }

  const { rows: [student] } = await req.db.query(
    `SELECT 1 FROM students WHERE student_id = $1`, [student_id]);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  if (methodId !== null) {
    const { rows: [method] } = await req.db.query(
      `SELECT 1 FROM payment_methods WHERE method_id = $1`, [methodId]);
    if (!method) return res.status(400).json({ message: 'Unknown payment method' });
  }

  const outcome = await withTransaction(req.db, async (client) => {
    const { rows: [payment] } = await client.query(
      `INSERT INTO payments (student_id, amount, payment_date, method_id, description, reference, package_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [student_id, paidAmount, payment_date, methodId,
       description ?? (pkg ? `Package: ${pkg.name}` : null), reference ?? null, pkg?.package_id ?? null]);

    if (!pkg) return { payment };

    // Package purchase → wallet credit in the SAME transaction (mirrors the
    // Wallets manual-entry path, including closing a delinquency task when
    // the balance crosses back to non-negative).
    const grant = pkg.credits + pkg.bonus_credits;
    await client.query(
      `INSERT INTO wallets (student_id) VALUES ($1) ON CONFLICT (student_id) DO NOTHING`, [student_id]);
    const { rows: [wallet] } = await client.query(
      `SELECT wallet_id, balance FROM wallets WHERE student_id = $1 FOR UPDATE`, [student_id]);
    const { rows: [entry] } = await client.query(
      `INSERT INTO credit_ledger (wallet_id, entry_type, amount, note, created_by)
       VALUES ($1,'purchase',$2,$3,$4) RETURNING *`,
      [wallet.wallet_id, grant,
       `Package: ${pkg.name} (${pkg.credits}${pkg.bonus_credits ? ` + ${pkg.bonus_credits} bonus` : ''})`,
       req.user.user_id]);
    const { rows: [{ balance }] } = await client.query(
      `UPDATE wallets SET balance = balance + $1 WHERE wallet_id = $2 RETURNING balance`,
      [grant, wallet.wallet_id]);
    if (wallet.balance < 0 && balance >= 0) {
      await client.query(
        `UPDATE staff_tasks SET status = 'done', resolved_by = $1, resolved_at = CURRENT_TIMESTAMP
          WHERE kind = 'delinquent_balance' AND subject_type = 'student'
            AND subject_id = $2 AND status IN ('open','in_progress')`,
        [req.user.user_id, String(student_id)]);
    }
    await notifyFamily(client, {
      studentId: student_id, eventType: 'wallet_credited', subjectType: 'student', subjectId: student_id,
      payload: { entry_type: 'purchase', amount: grant, balance, package: pkg.name }
    });
    return { payment, credited: grant, balance };
  });
  res.status(201).json(outcome.payment ? { ...outcome.payment, credited: outcome.credited, balance: outcome.balance } : outcome);
});

// ---------------------------------------------------------------------------
// GET / — recent payments across all students (staff), optional period
// filter for the financial-dashboard revenue views.
// ---------------------------------------------------------------------------
router.get('/', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { start, end } = req.query;
  const conditions = [];
  const params = [];
  if (start) { params.push(start); conditions.push(`p.payment_date >= $${params.length}`); }
  if (end) { params.push(end); conditions.push(`p.payment_date <= $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await req.db.query(
    `SELECT p.payment_id, p.student_id, u.name AS student_name, p.amount, p.payment_date,
            p.method_id, pm.method_name, p.description, p.reference, p.created_at
       FROM payments p
       JOIN users u ON u.user_id = p.student_id
       LEFT JOIN payment_methods pm ON pm.method_id = p.method_id
       ${where}
      ORDER BY p.payment_date DESC, p.payment_id DESC LIMIT 500`,
    params);
  res.json(rows);
});

// ---------------------------------------------------------------------------
// GET /:studentId — one student's payment history (staff, the student, or a
// linked guardian) — powers GuardianBilling.jsx.
// ---------------------------------------------------------------------------
router.get('/:studentId', authenticateToken, async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (!studentId) return res.status(400).json({ message: 'invalid student id' });
  if (!await canActForStudent(req.db, req.user, studentId)) {
    return res.status(403).json({ message: 'Not authorized to view this payment history' });
  }
  const { rows } = await req.db.query(
    `SELECT p.payment_id, p.amount, p.payment_date, pm.method_name, p.description, p.created_at
       FROM payments p
       LEFT JOIN payment_methods pm ON pm.method_id = p.method_id
      WHERE p.student_id = $1
      ORDER BY p.payment_date DESC, p.payment_id DESC`,
    [studentId]);
  res.json(rows);
});

export default router;
