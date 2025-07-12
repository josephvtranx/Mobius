import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import pool from '../config/db.js';

const router = express.Router();

// Validation middleware
const userValidation = [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').optional().matches(/^\+?[\d\s-]+$/).withMessage('Invalid phone number'),
    body('role').isIn(['student', 'staff', 'instructor']).withMessage('Invalid role'),
];

// Get all users
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT user_id, name, email, phone, role, created_at 
            FROM users 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get user profile (protected route) - MUST COME BEFORE /:id
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        console.log('Fetching profile for user ID:', userId);

        // Get base user data
        const userResult = await pool.query(
            'SELECT user_id, name, email, phone, role, last_login, profile_pic_url FROM users WHERE user_id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ 
                message: 'User not found',
                userId: userId
            });
        }

        const userData = userResult.rows[0];
        console.log('Base user data:', userData);

        // For now, just return the base user data without role-specific queries
        res.json(userData);

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ 
            message: 'Error fetching profile',
            error: error.message,
            stack: error.stack
        });
    }
});

// Admin route to get all users (protected + role-based) - MUST COME BEFORE /:id
router.get('/all', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT user_id, name, email, role, is_active, last_login FROM users'
        );

        res.json(result.rows);

    } catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({ 
            message: 'Error fetching users',
            error: error.message
        });
    }
});

// Get single user
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT user_id, name, email, phone, role, created_at 
            FROM users 
            WHERE user_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create new user
router.post('/', userValidation, async (req, res) => {
    try {
        const { name, email, phone, role } = req.body;

        // Check if email already exists
        const emailCheck = await pool.query(
            'SELECT user_id FROM users WHERE email = $1',
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const result = await pool.query(`
            INSERT INTO users (name, email, phone, role, created_at)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
            RETURNING user_id, name, email, phone, role, created_at
        `, [name, email, phone, role]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user
router.put('/:id', userValidation, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role } = req.body;

        // Check if email already exists for other users
        const emailCheck = await pool.query(
            'SELECT user_id FROM users WHERE email = $1 AND user_id != $2',
            [email, id]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const result = await pool.query(`
            UPDATE users 
            SET name = $1, email = $2, phone = $3, role = $4
            WHERE user_id = $5
            RETURNING user_id, name, email, phone, role, created_at
        `, [name, email, phone, role, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Soft delete user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            DELETE FROM users 
            WHERE user_id = $1
            RETURNING user_id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Update user profile (protected route)
router.patch('/profile', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const userId = req.user.user_id;
        const { name, phone, email } = req.body;

        await client.query('BEGIN');

        // Update base user data
        const userResult = await client.query(
            `UPDATE users 
             SET name = COALESCE($1, name),
                 phone = COALESCE($2, phone),
                 email = COALESCE($3, email)
             WHERE user_id = $4
             RETURNING *`,
            [name, phone, email, userId]
        );

        await client.query('COMMIT');

        res.json({
            message: 'Profile updated successfully',
            user: userResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Profile update error:', error);
        res.status(500).json({ 
            message: 'Error updating profile',
            error: error.message
        });
    } finally {
        client.release();
    }
});

export default router;
