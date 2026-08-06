// Real invoices (server: /api/invoices). invoices/invoice_payments already
// existed in the v2 baseline schema with zero endpoints against them.
// "Paying" an invoice here means recording money already received against
// it (see paymentRoutes.js) — no processor, no card collection. `overdue`
// is derived at read time (pending + past due_date) rather than stored, so
// nothing needs a cron job to keep it honest — same "derive, don't restate"
// discipline as the client's wallet-status helpers.
import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { canActForStudent } from '../helpers/authz.js';
import { withTransaction } from '../helpers/withTransaction.js';

const router = express.Router();

const STATUS_EXPR = `CASE WHEN i.status = 'pending' AND i.due_date < CURRENT_DATE
                          THEN 'overdue' ELSE i.status END`;

function validAmount(amount) {
  return typeof amount === 'number' && isFinite(amount) && amount > 0;
}

// ---------------------------------------------------------------------------
// POST / — create an invoice (staff).
// ---------------------------------------------------------------------------
router.post('/', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { student_id, total_amount, due_date, description } = req.body;
  if (!student_id) return res.status(400).json({ message: 'student_id is required' });
  if (!validAmount(total_amount)) return res.status(400).json({ message: 'total_amount must be a positive number' });

  const { rows: [student] } = await req.db.query(
    `SELECT 1 FROM students WHERE student_id = $1`, [student_id]);
  if (!student) return res.status(404).json({ message: 'Student not found' });

  const { rows: [invoice] } = await req.db.query(
    `INSERT INTO invoices (student_id, total_amount, issued_at, due_date, status, description)
     VALUES ($1,$2,CURRENT_DATE,$3,'pending',$4) RETURNING *`,
    [student_id, total_amount, due_date ?? null, description ?? null]);
  res.status(201).json(invoice);
});

// ---------------------------------------------------------------------------
// GET / — all invoices (staff), optional ?status filter (matches the
// derived status, so ?status=overdue works even though nothing is stored
// as 'overdue').
// ---------------------------------------------------------------------------
router.get('/', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { status } = req.query;
  const params = [];
  let having = '';
  if (status) { params.push(status); having = `WHERE ${STATUS_EXPR} = $${params.length}`; }

  const { rows } = await req.db.query(
    `SELECT i.invoice_id, i.student_id, u.name AS student_name, i.total_amount,
            i.issued_at, i.due_date, i.status AS stored_status, ${STATUS_EXPR} AS status,
            i.description, i.created_at,
            COALESCE(paid.amount, 0) AS amount_paid
       FROM invoices i
       JOIN users u ON u.user_id = i.student_id
       LEFT JOIN (SELECT invoice_id, SUM(amount) AS amount FROM invoice_payments GROUP BY invoice_id) paid
              ON paid.invoice_id = i.invoice_id
       ${having}
      ORDER BY i.issued_at DESC, i.invoice_id DESC LIMIT 500`,
    params);
  res.json(rows);
});

// ---------------------------------------------------------------------------
// GET /:studentId — one student's invoices (staff, the student, or a linked
// guardian) — powers GuardianBilling.jsx.
// ---------------------------------------------------------------------------
router.get('/:studentId', authenticateToken, async (req, res) => {
  const studentId = Number(req.params.studentId);
  if (!studentId) return res.status(400).json({ message: 'invalid student id' });
  if (!await canActForStudent(req.db, req.user, studentId)) {
    return res.status(403).json({ message: 'Not authorized to view these invoices' });
  }
  const { rows } = await req.db.query(
    `SELECT i.invoice_id, i.total_amount, i.issued_at, i.due_date,
            ${STATUS_EXPR} AS status, i.description,
            COALESCE(paid.amount, 0) AS amount_paid
       FROM invoices i
       LEFT JOIN (SELECT invoice_id, SUM(amount) AS amount FROM invoice_payments GROUP BY invoice_id) paid
              ON paid.invoice_id = i.invoice_id
      WHERE i.student_id = $1
      ORDER BY i.issued_at DESC, i.invoice_id DESC`,
    [studentId]);
  res.json(rows);
});

// ---------------------------------------------------------------------------
// POST /:id/pay — record a payment against this invoice (staff): inserts a
// real payments row plus the invoice_payments link, then marks the invoice
// paid once the sum of its linked payments covers total_amount.
// ---------------------------------------------------------------------------
router.post('/:id/pay', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const invoiceId = Number(req.params.id);
  const { amount, payment_date, method_id, description } = req.body;
  if (!invoiceId) return res.status(400).json({ message: 'invalid invoice id' });
  if (!validAmount(amount)) return res.status(400).json({ message: 'amount must be a positive number' });
  if (!payment_date) return res.status(400).json({ message: 'payment_date is required' });

  const outcome = await withTransaction(req.db, async (client) => {
    const { rows: [invoice] } = await client.query(
      `SELECT * FROM invoices WHERE invoice_id = $1 FOR UPDATE`, [invoiceId]);
    if (!invoice) return { notFound: true };
    if (invoice.status !== 'pending') return { badStatus: invoice.status };

    const { rows: [payment] } = await client.query(
      `INSERT INTO payments (student_id, amount, payment_date, method_id, description)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [invoice.student_id, amount, payment_date, method_id ?? null, description ?? `Invoice #${invoiceId}`]);
    await client.query(
      `INSERT INTO invoice_payments (invoice_id, payment_id, amount) VALUES ($1,$2,$3)`,
      [invoiceId, payment.payment_id, amount]);

    const { rows: [{ total_paid }] } = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_paid FROM invoice_payments WHERE invoice_id = $1`,
      [invoiceId]);
    let status = invoice.status;
    if (Number(total_paid) >= Number(invoice.total_amount)) {
      status = 'paid';
      await client.query(`UPDATE invoices SET status = 'paid' WHERE invoice_id = $1`, [invoiceId]);
    }
    return { payment, status, total_paid: Number(total_paid) };
  });

  if (outcome.notFound) return res.status(404).json({ message: 'Invoice not found' });
  if (outcome.badStatus) return res.status(400).json({ message: `Invoice is already ${outcome.badStatus}` });
  res.status(201).json(outcome);
});

// ---------------------------------------------------------------------------
// PATCH /:id/cancel — cancel an unpaid invoice (staff).
// ---------------------------------------------------------------------------
router.patch('/:id/cancel', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const invoiceId = Number(req.params.id);
  if (!invoiceId) return res.status(400).json({ message: 'invalid invoice id' });
  const { rows: [invoice] } = await req.db.query(
    `SELECT status FROM invoices WHERE invoice_id = $1`, [invoiceId]);
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  if (invoice.status !== 'pending') return res.status(400).json({ message: `Invoice is already ${invoice.status}` });

  const { rows: [updated] } = await req.db.query(
    `UPDATE invoices SET status = 'canceled' WHERE invoice_id = $1 RETURNING *`, [invoiceId]);
  res.json(updated);
});

export default router;
