// Platform-admin auth — the ONLY auth path that authenticates against the
// registry rather than a tenant DB. A platform-admin JWT carries
// { adminId, isPlatformAdmin: true } and NO tenantCode, so the app-level
// tenant middleware leaves req.db undefined (correct — admin routes work on
// registryPool / cross-tenant, never a single req.db). Keep this strictly
// separate from authenticateToken so a tenant user can never reach /api/admin
// and an admin token is never mistaken for a tenant credential.
import jwt from 'jsonwebtoken';
import { registryPool } from '../db/registryPool.js';

export const authenticatePlatformAdmin = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired' });
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (!decoded.isPlatformAdmin || !decoded.adminId) {
      return res.status(403).json({ message: 'Platform admin access required' });
    }

    const { rows } = await registryPool.query(
      'SELECT admin_id, email, name, is_active FROM platform_admins WHERE admin_id = $1',
      [decoded.adminId]);
    if (!rows.length || !rows[0].is_active) {
      return res.status(401).json({ message: 'Admin not found or deactivated' });
    }
    req.admin = rows[0];
    next();
  } catch (error) {
    console.error('Platform admin auth error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
