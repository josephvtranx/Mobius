// Real payments (server: /api/payments). payments/payment_methods already
// existed in the v2 baseline schema with zero endpoints against them — the
// staff Financial-Dashboard Payments.jsx page and guardian Billing were both
// honest stubs until now. This is a manual "record money already received"
// ledger, not a checkout flow: there is no processor integration
// (payments.provider/provider_ref stay NULL), no card collection, and no
// payment_links — recording a payment does not touch wallets/credits, since
// there is no real dollars-per-credit rate anywhere in the schema yet
// (ASSUMPTION[TOPUP] hasn't landed) and inventing one would be fabricated
// business logic. Granting credits for a payment stays a separate, already
// real action on the Wallets page.
import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { canActForStudent } from '../helpers/authz.js';

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
  const { student_id, amount, payment_date, method_id, description, reference } = req.body;
  if (!student_id) return res.status(400).json({ message: 'student_id is required' });
  if (!validAmount(amount)) return res.status(400).json({ message: 'amount must be a non-negative number' });
  if (!payment_date) return res.status(400).json({ message: 'payment_date is required' });

  const { rows: [student] } = await req.db.query(
    `SELECT 1 FROM students WHERE student_id = $1`, [student_id]);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const { rows: [payment] } = await req.db.query(
    `INSERT INTO payments (student_id, amount, payment_date, method_id, description, reference)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [student_id, amount, payment_date, method_id ?? null, description ?? null, reference ?? null]);
  res.status(201).json(payment);
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
