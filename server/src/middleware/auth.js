import { verifyAccessToken } from '../helpers/authHelpers.js';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';

// Rate limiter for auth endpoints (login/register/refresh) — the
// brute-force-sensitive surface, so it's tighter than the general API
// limiter. NOTE: this was previously defined but never applied to any
// route; it's now mounted on /api/auth in app.js.
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again later' },
    // the test suite drives many requests from one IP via supertest
    skip: () => process.env.NODE_ENV === 'test',
});

// Broad limiter for the rest of the API. Generous on purpose so legitimate
// staff bursts (dashboard fan-out, marking a whole class's attendance)
// never trip it — it exists to blunt scraping/abuse, not to throttle real
// use. Keyed per IP (trust proxy is set for Render).
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 300, // per IP per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please slow down and try again shortly' },
    skip: () => process.env.NODE_ENV === 'test',
});

// Log authentication attempts
const logAuthAttempt = async (req, success, reason = null) => {
    try {
        await req.db.query(
            `INSERT INTO auth_logs (ip_address, user_agent, endpoint, success, failure_reason)
             VALUES ($1, $2, $3, $4, $5)`,
            [
                req.ip,
                req.headers['user-agent'],
                req.originalUrl,
                success,
                reason
            ]
        );
    } catch (error) {
        console.error('Error logging auth attempt:', error);
    }
};

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // D7: the tenant middleware resolves req.db from the token's
        // tenantCode claim; a valid token whose tenant no longer resolves
        // (suspended/unknown institution) must not crash the request
        if (!req.db) {
            return res.status(401).json({ message: 'Unknown institution' });
        }

        // Query to get user by id instead of username
        const result = await req.db.query(
            'SELECT * FROM users WHERE user_id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export default authenticateToken;

// Role-based authorization middleware
export const authorizeRole = (...roles) => {
    return async (req, res, next) => {
        if (!req.user) {
            await logAuthAttempt(req, false, 'No user context');
            return res.status(401).json({ 
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            await logAuthAttempt(req, false, `Insufficient role: ${req.user.role}`);
            return res.status(403).json({ 
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        await logAuthAttempt(req, true);
        next();
    };
}; 