import pool from '../config/db.js';
import { verifyAccessToken } from '../helpers/authHelpers.js';
import rateLimit from 'express-rate-limit';

// Rate limiter for auth endpoints
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        message: 'Too many requests from this IP, please try again later'
    }
});

// Log authentication attempts
const logAuthAttempt = async (req, success, reason = null) => {
    try {
        await pool.query(
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
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            await logAuthAttempt(req, false, 'No token provided');
            return res.status(401).json({ 
                message: 'Authentication required. Please provide a valid access token'
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);
        if (!decoded) {
            await logAuthAttempt(req, false, 'Invalid token');
            return res.status(401).json({ 
                message: 'Invalid or expired token. Please login again or refresh your token'
            });
        }
        
        // Check if user still exists and is active
        const userResult = await pool.query(
            'SELECT user_id, username, email, role, is_active FROM users WHERE user_id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            await logAuthAttempt(req, false, 'User not found');
            return res.status(401).json({ 
                message: 'User account no longer exists'
            });
        }

        const user = userResult.rows[0];
        
        if (!user.is_active) {
            await logAuthAttempt(req, false, 'Inactive account');
            return res.status(401).json({ 
                message: 'Account is inactive. Please contact support for assistance'
            });
        }

        // Log successful authentication
        await logAuthAttempt(req, true);

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        await logAuthAttempt(req, false, 'Internal error');
        res.status(500).json({ 
            message: 'An error occurred while authenticating your request'
        });
    }
};

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