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
            WHERE is_deleted = false
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get single user
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT user_id, name, email, phone, role, created_at 
            FROM users 
            WHERE user_id = $1 AND is_deleted = false
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
            'SELECT user_id FROM users WHERE email = $1 AND is_deleted = false',
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const result = await pool.query(`
            INSERT INTO users (name, email, phone, role, created_at, is_deleted)
            VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, false)
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
            'SELECT user_id FROM users WHERE email = $1 AND user_id != $2 AND is_deleted = false',
            [email, id]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const result = await pool.query(`
            UPDATE users 
            SET name = $1, email = $2, phone = $3, role = $4
            WHERE user_id = $5 AND is_deleted = false
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
            UPDATE users 
            SET is_deleted = true 
            WHERE user_id = $1 AND is_deleted = false
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

// Get user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;
        let userData;

        // Get base user data
        const userResult = await pool.query(
            'SELECT user_id, username, name, email, phone, role, last_login FROM users WHERE user_id = $1',
            [userId]
        );

        userData = userResult.rows[0];

        // Get role-specific data
        switch (userData.role) {
            case 'student':
                const studentResult = await pool.query(
                    'SELECT status, guardian_contact FROM students WHERE student_id = $1',
                    [userId]
                );
                userData = { ...userData, ...studentResult.rows[0] };
                break;

            case 'instructor':
                const instructorResult = await pool.query(
                    `SELECT s.name as subject_name 
                     FROM instructor_specialties is_
                     JOIN subjects s ON s.subject_id = is_.subject_id
                     WHERE is_.instructor_id = $1`,
                    [userId]
                );
                userData = { 
                    ...userData, 
                    specialties: instructorResult.rows.map(row => row.subject_name)
                };
                break;

            case 'staff':
                const staffResult = await pool.query(
                    'SELECT employment_status, salary, hourly_rate FROM staff WHERE staff_id = $1',
                    [userId]
                );
                userData = { ...userData, ...staffResult.rows[0] };
                break;
        }

        res.json(userData);

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ 
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

// Update user profile (protected route)
router.put('/profile', authenticateToken, async (req, res) => {
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

// Admin route to get all users (protected + role-based)
router.get('/all', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT user_id, username, name, email, role, is_active, last_login FROM users'
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

export default router;
