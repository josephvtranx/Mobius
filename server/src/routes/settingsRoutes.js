// Tenant settings read (2026-08-20): the institution_settings knobs already
// exist server-side (getSettings powers gates, windows, deduction rules) but
// no client surface could read them — every client-side threshold was
// hardcoded (a known gap). Staff-only, read-only; writes stay with the
// platform-admin console.
import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getSettings } from '../helpers/institutionSettings.js';

const router = express.Router();

router.get('/', authenticateToken, authorizeRole('staff'), async (req, res) => {
  res.json(await getSettings(req.db));
});

export default router;
