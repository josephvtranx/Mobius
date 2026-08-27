// Credit packages (2026-08-20): academy-defined bundles of session credits
// with a money price. Staff manage them (Finance > Packages); the Payments
// page and the add-student wizard list the active ones. Purchasing happens
// through POST /payments with a package_id — never here — so money and
// credits move in one place.
import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();
router.use(authenticateToken, authorizeRole('staff'));

const validName = (s) => typeof s === 'string' && s.trim().length > 0;
const posInt = (n) => Number.isInteger(Number(n)) && Number(n) > 0;
const nonNegInt = (n) => Number.isInteger(Number(n)) && Number(n) >= 0;
const validPrice = (n) => Number.isFinite(Number(n)) && Number(n) >= 0;

// GET / — active packages (what buyers see); ?all=1 includes retired ones
// for the management page.
router.get('/', async (req, res) => {
  const { rows } = await req.db.query(
    `SELECT package_id, name, credits, bonus_credits, price, is_active, sort_order
       FROM credit_packages
      ${req.query.all ? '' : 'WHERE is_active'}
      ORDER BY sort_order, price`);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, credits, bonus_credits, price, sort_order } = req.body;
  if (!validName(name)) return res.status(400).json({ message: 'name is required' });
  if (!posInt(credits)) return res.status(400).json({ message: 'credits must be a positive integer' });
  if (bonus_credits != null && !nonNegInt(bonus_credits)) {
    return res.status(400).json({ message: 'bonus_credits must be a non-negative integer' });
  }
  if (!validPrice(price)) return res.status(400).json({ message: 'price must be a non-negative number' });

  const { rows: [pkg] } = await req.db.query(
    `INSERT INTO credit_packages (name, credits, bonus_credits, price, sort_order, created_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [name.trim(), Number(credits), Number(bonus_credits ?? 0), Number(price),
     Number.isInteger(Number(sort_order)) ? Number(sort_order) : 0, req.user.user_id]);
  res.status(201).json(pkg);
});

// PATCH /:id — edit fields / retire / reactivate. Old payments keep their
// package_id either way (soft retire, never delete).
router.patch('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: 'invalid package id' });
  const updates = [];
  const params = [];
  const set = (col, val) => { params.push(val); updates.push(`${col} = $${params.length}`); };

  const { name, credits, bonus_credits, price, is_active, sort_order } = req.body;
  if (name !== undefined) {
    if (!validName(name)) return res.status(400).json({ message: 'name must be non-empty' });
    set('name', name.trim());
  }
  if (credits !== undefined) {
    if (!posInt(credits)) return res.status(400).json({ message: 'credits must be a positive integer' });
    set('credits', Number(credits));
  }
  if (bonus_credits !== undefined) {
    if (!nonNegInt(bonus_credits)) return res.status(400).json({ message: 'bonus_credits must be a non-negative integer' });
    set('bonus_credits', Number(bonus_credits));
  }
  if (price !== undefined) {
    if (!validPrice(price)) return res.status(400).json({ message: 'price must be a non-negative number' });
    set('price', Number(price));
  }
  if (is_active !== undefined) set('is_active', !!is_active);
  if (sort_order !== undefined && Number.isInteger(Number(sort_order))) set('sort_order', Number(sort_order));
  if (!updates.length) return res.status(400).json({ message: 'nothing to update' });

  params.push(id);
  const { rows: [pkg] } = await req.db.query(
    `UPDATE credit_packages SET ${updates.join(', ')} WHERE package_id = $${params.length} RETURNING *`, params);
  if (!pkg) return res.status(404).json({ message: 'Package not found' });
  res.json(pkg);
});

export default router;
