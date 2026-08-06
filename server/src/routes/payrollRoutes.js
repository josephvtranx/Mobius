// Real payroll (server: /api/payroll). payroll/time_logs already existed in
// the v2 baseline schema with zero endpoints against them — instructor
// Pay.jsx and staff Payroll.jsx were both honest stubs until now.
import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { computePayrollPreview } from '../helpers/payroll.js';
import { withTransaction } from '../helpers/withTransaction.js';

const router = express.Router();

function validPeriod(start, end) {
  if (!start || !end) return false;
  const s = new Date(start), e = new Date(end);
  return !isNaN(s) && !isNaN(e) && e >= s;
}

// The caller's own payroll history — instructor or staff.
router.get('/mine', authenticateToken, async (req, res) => {
  if (!['instructor', 'staff'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Instructors or staff only' });
  }
  const { rows } = await req.db.query(
    `SELECT payroll_id, pay_period_start, pay_period_end, total_pay, generated_at
       FROM payroll WHERE user_id = $1 ORDER BY pay_period_start DESC`,
    [req.user.user_id]);
  res.json(rows);
});

// Preview what a period would pay out, without saving anything.
router.get('/preview', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { start, end } = req.query;
  if (!validPeriod(start, end)) return res.status(400).json({ message: 'start and end (dates, end >= start) are required' });
  const rows = await computePayrollPreview(req.db, start, end);
  res.json(rows);
});

// Run payroll: computes the same as /preview and writes one row per
// eligible person. Skips (doesn't error on) anyone already paid for this
// exact period — re-running a period is safe, not a double-pay.
router.post('/run', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { pay_period_start, pay_period_end } = req.body;
  if (!validPeriod(pay_period_start, pay_period_end)) {
    return res.status(400).json({ message: 'pay_period_start and pay_period_end (dates, end >= start) are required' });
  }
  const preview = await computePayrollPreview(req.db, pay_period_start, pay_period_end);

  const result = await withTransaction(req.db, async (client) => {
    const paid = [], skipped = [];
    for (const row of preview) {
      if (row.excluded) { skipped.push({ user_id: row.user_id, name: row.name, reason: row.reason }); continue; }
      const { rows: existing } = await client.query(
        `SELECT 1 FROM payroll WHERE user_id = $1 AND pay_period_start = $2 AND pay_period_end = $3`,
        [row.user_id, pay_period_start, pay_period_end]);
      if (existing.length) { skipped.push({ user_id: row.user_id, name: row.name, reason: 'Already paid for this period' }); continue; }

      const { rows: [inserted] } = await client.query(
        `INSERT INTO payroll (user_id, user_type, pay_period_start, pay_period_end, total_pay)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [row.user_id, row.user_type, pay_period_start, pay_period_end, row.total_pay]);
      paid.push({ ...row, payroll_id: inserted.payroll_id });
    }
    return { paid, skipped };
  });

  res.json(result);
});

// Past runs (all people) — the staff Payroll page's history list.
router.get('/', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { rows } = await req.db.query(
    `SELECT p.payroll_id, p.user_id, u.name, p.user_type, p.pay_period_start,
            p.pay_period_end, p.total_pay, p.generated_at
       FROM payroll p JOIN users u ON u.user_id = p.user_id
      ORDER BY p.pay_period_start DESC, u.name LIMIT 200`);
  res.json(rows);
});

export default router;
