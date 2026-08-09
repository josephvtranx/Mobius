// Platform-admin API (/api/admin) — Mobius-employee operations that sit ABOVE
// any tenant: provision academies, edit their config, and read cross-tenant
// finance. Everything except /login requires authenticatePlatformAdmin and
// works on registryPool / per-tenant pools resolved by code, never req.db.
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registryPool } from '../db/registryPool.js';
import { getTenantPool } from '../db/tenantPool.js';
import { authenticatePlatformAdmin } from '../middleware/adminAuth.js';
import { provisionTenantDb } from '../lib/tenantProvisioner.js';
import { hashPassword } from '../helpers/authHelpers.js';

const router = express.Router();
const CODE_RE = /^[A-Za-z0-9_-]{3,32}$/;

// Whitelist of institution_settings columns an admin may edit, with a validator
// each. Column names come only from THIS map (never raw request keys), so
// building the UPDATE SET from them is safe.
const int = (min) => (v) => Number.isInteger(v) && v >= min;
const bool = (v) => typeof v === 'boolean';
const EDITABLE = {
  payment_modes_enabled: (v) => ['collect_now', 'payment_link', 'both'].includes(v),
  payment_link_ttl_hours: int(1),
  consultation_hold_ttl_min: int(1),
  trial_class_enabled: bool,
  reschedule_window_hours: int(0),
  enrollment_runway_sessions: int(1),
  session_record_lock_days: int(1),
  attendance_autocomplete_hours: int(1),
  negative_balance_floor_sessions: int(0),
  low_balance_notify_runway_sessions: int(1),
  instructor_response_window_hours: int(1),
  self_serve_booking_enabled: bool,
  default_one_on_one_credit_cost: int(0),
  group_catalog_visible: bool,
  session_generation_horizon_weeks: int(1),
};

// ---------------------------------------------------------------------------
// POST /login — authenticate against the registry's platform_admins. Issues a
// JWT with isPlatformAdmin + adminId and NO tenantCode.
// ---------------------------------------------------------------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  try {
    const { rows } = await registryPool.query('SELECT * FROM platform_admins WHERE email = $1', [email]);
    const admin = rows[0];
    if (!admin || !admin.is_active || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    await registryPool.query('UPDATE platform_admins SET last_login = CURRENT_TIMESTAMP WHERE admin_id = $1', [admin.admin_id]);
    const accessToken = jwt.sign(
      { adminId: admin.admin_id, email: admin.email, isPlatformAdmin: true },
      process.env.JWT_SECRET, { expiresIn: '120m' });
    res.json({ accessToken, admin: { id: admin.admin_id, email: admin.email, name: admin.name } });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Everything below is platform-admin-only.
router.use(authenticatePlatformAdmin);

router.get('/me', (req, res) => res.json(req.admin));

// ---------------------------------------------------------------------------
// GET /institutions — every academy with light per-tenant counts.
// ---------------------------------------------------------------------------
router.get('/institutions', async (_req, res) => {
  try {
    const { rows } = await registryPool.query(
      'SELECT code, name, is_active, schema_version, created_at FROM institutions ORDER BY created_at DESC');
    const out = [];
    for (const inst of rows) {
      let counts = { students: null, active_classes: null };
      try {
        const db = await getTenantPool(inst.code);
        const { rows: [c] } = await db.query(`
          SELECT (SELECT COUNT(*) FROM users WHERE role = 'student' AND is_active) AS students,
                 (SELECT COUNT(*) FROM classes WHERE status = 'active') AS active_classes`);
        counts = { students: Number(c.students), active_classes: Number(c.active_classes) };
      } catch { /* tenant DB unreachable — leave counts null, still list it */ }
      out.push({ ...inst, ...counts });
    }
    res.json(out);
  } catch (error) {
    console.error('Admin list institutions error:', error);
    res.status(500).json({ message: 'Failed to list institutions' });
  }
});

// ---------------------------------------------------------------------------
// POST /institutions — provision a new academy: create + migrate its DB,
// register it, and seed the first staff account (also its login-directory row).
// ---------------------------------------------------------------------------
router.post('/institutions', async (req, res) => {
  const { code, name, admin_email, admin_name, admin_password } = req.body;
  if (!code || !CODE_RE.test(code)) return res.status(400).json({ message: 'code must be 3–32 chars: letters, digits, _ or -' });
  if (!name) return res.status(400).json({ message: 'name is required' });
  if (!admin_email || !admin_name || !admin_password) {
    return res.status(400).json({ message: 'initial staff admin_email, admin_name and admin_password are required' });
  }
  if (String(admin_password).length < 8) return res.status(400).json({ message: 'admin_password must be at least 8 characters' });
  try {
    const { rows: dupe } = await registryPool.query('SELECT 1 FROM institutions WHERE code = $1', [code]);
    if (dupe.length) return res.status(409).json({ message: `Institution code ${code} already exists` });
    const { rows: dupeEmail } = await registryPool.query('SELECT 1 FROM user_directory WHERE email = $1', [admin_email]);
    if (dupeEmail.length) return res.status(409).json({ message: `${admin_email} already belongs to an account` });

    // 1. create + migrate the tenant DB
    const conn_string = await provisionTenantDb({ code, name });
    // 2. register it
    await registryPool.query('INSERT INTO institutions (code, name, conn_string) VALUES ($1, $2, $3)', [code, name, conn_string]);
    // 3. seed the first staff account (tenant profile + global login directory)
    const db = await getTenantPool(code);
    const hash = await hashPassword(admin_password);
    const { rows: [u] } = await db.query(
      `INSERT INTO users (password_hash, name, email, role) VALUES ($1, $2, $3, 'staff') RETURNING user_id`,
      [hash, admin_name, admin_email]);
    await db.query(`INSERT INTO staff (staff_id, employment_status) VALUES ($1, 'full_time')`, [u.user_id]);
    await registryPool.query('INSERT INTO user_directory (email, password_hash, code) VALUES ($1, $2, $3)', [admin_email, hash, code]);

    res.status(201).json({ code, name, initial_staff: admin_email });
  } catch (error) {
    console.error('Admin provision error:', error);
    res.status(500).json({ message: `Provisioning failed: ${error.message}` });
  }
});

// ---------------------------------------------------------------------------
// GET/PATCH /institutions/:code/config — the academy's institution_settings.
// ---------------------------------------------------------------------------
router.get('/institutions/:code/config', async (req, res) => {
  try {
    const db = await getTenantPool(req.params.code);
    const { rows } = await db.query('SELECT * FROM institution_settings');
    if (!rows.length) return res.status(404).json({ message: 'No settings row for this academy' });
    res.json({ editable: Object.keys(EDITABLE), settings: rows[0] });
  } catch (error) {
    console.error('Admin get config error:', error);
    res.status(404).json({ message: 'Academy not found or unreachable' });
  }
});

router.patch('/institutions/:code/config', async (req, res) => {
  const patch = req.body || {};
  const keys = Object.keys(patch);
  if (!keys.length) return res.status(400).json({ message: 'No settings provided' });
  const bad = keys.filter((k) => !EDITABLE[k] || !EDITABLE[k](patch[k]));
  if (bad.length) return res.status(400).json({ message: `Invalid or non-editable settings: ${bad.join(', ')}` });
  try {
    const db = await getTenantPool(req.params.code);
    // column names are from the EDITABLE whitelist, not raw request keys — safe.
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const vals = keys.map((k) => patch[k]);
    const { rows } = await db.query(
      `UPDATE institution_settings SET ${sets}, updated_at = CURRENT_TIMESTAMP RETURNING *`, vals);
    res.json({ settings: rows[0] });
  } catch (error) {
    console.error('Admin patch config error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// ---------------------------------------------------------------------------
// GET /finance — money coming in, aggregated across every active academy.
// ---------------------------------------------------------------------------
router.get('/finance', async (_req, res) => {
  try {
    const { rows: insts } = await registryPool.query('SELECT code, name FROM institutions WHERE is_active ORDER BY name');
    const academies = [];
    let grandTotal = 0, thisMonth = 0;
    const monthly = {};
    for (const inst of insts) {
      try {
        const db = await getTenantPool(inst.code);
        const { rows: [agg] } = await db.query(`
          SELECT COALESCE(SUM(amount), 0)::float AS total,
                 COALESCE(SUM(amount) FILTER (WHERE payment_date >= date_trunc('month', CURRENT_DATE)), 0)::float AS this_month,
                 COUNT(*)::int AS payments
            FROM payments`);
        const { rows: series } = await db.query(`
          SELECT to_char(date_trunc('month', payment_date), 'YYYY-MM') AS month, SUM(amount)::float AS total
            FROM payments
           WHERE payment_date >= (date_trunc('month', CURRENT_DATE) - INTERVAL '5 months')
           GROUP BY 1`);
        academies.push({ code: inst.code, name: inst.name, total: agg.total, this_month: agg.this_month, payments: agg.payments });
        grandTotal += agg.total; thisMonth += agg.this_month;
        for (const s of series) monthly[s.month] = (monthly[s.month] || 0) + s.total;
      } catch {
        academies.push({ code: inst.code, name: inst.name, total: null, this_month: null, payments: null, unreachable: true });
      }
    }
    const trend = Object.entries(monthly).sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => ({ month, total }));
    res.json({ grand_total: grandTotal, this_month: thisMonth, academies, trend });
  } catch (error) {
    console.error('Admin finance error:', error);
    res.status(500).json({ message: 'Failed to aggregate finance' });
  }
});

export default router;
