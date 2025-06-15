import express from 'express';
import { body } from 'express-validator';
import pool from '../config/db.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getStudentRoster } from '../controllers/studentController.js';

const router = express.Router();

// Validation middleware
const studentValidation = [
    body('status').isIn(['enrolled', 'on_trial']).withMessage('Invalid status'),
    body('age').isInt({ min: 5, max: 18 }).withMessage('Age must be between 5 and 18'),
    body('grade').isInt({ min: 1, max: 12 }).withMessage('Grade must be between 1 and 12'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('school').notEmpty().trim().withMessage('School is required'),
    body('pa_code').optional().trim()
];

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get student roster (moved to top for better organization)
router.get('/roster', getStudentRoster);

// Get all students
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, u.name, u.email, u.phone
            FROM students s
            JOIN users u ON s.student_id = u.user_id
            WHERE u.is_active = true
            ORDER BY u.name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ 
            error: 'Failed to fetch students',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get single student with their details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                s.*,
                u.name,
                u.email,
                u.phone,
                json_agg(DISTINCT g.*) as guardians,
                json_agg(DISTINCT cs.*) as class_sessions
            FROM students s
            JOIN users u ON s.student_id = u.user_id
            LEFT JOIN student_guardian sg ON s.student_id = sg.student_id
            LEFT JOIN guardians g ON sg.guardian_id = g.guardian_id
            LEFT JOIN class_sessions cs ON s.student_id = cs.student_id
            WHERE s.student_id = $1 AND u.is_active = true
            GROUP BY s.student_id, u.user_id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Failed to fetch student' });
    }
});

// Create new student
router.post('/', studentValidation, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const {
            status,
            age,
            grade,
            gender,
            school,
            pa_code
        } = req.body;

        // Get the current user from the auth token
        const user = req.user;
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Generate a unique student ID (e.g., MOB-2024-0001)
        const yearPrefix = new Date().getFullYear();
        const countResult = await client.query(
            "SELECT COUNT(*) FROM students WHERE student_id LIKE $1",
            [`MOB-${yearPrefix}-%`]
        );
        const count = parseInt(countResult.rows[0].count) + 1;
        const studentId = `MOB-${yearPrefix}-${count.toString().padStart(4, '0')}`;

        // Insert student record with user_id
        const result = await client.query(`
            INSERT INTO students (
                student_id,
                user_id,
                status,
                age,
                grade,
                gender,
                school,
                pa_code,
                created_at,
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *
        `, [studentId, user.user_id, status, age, grade, gender, school, pa_code]);

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating student:', {
            message: error.message,
            stack: error.stack,
            user: req.user,
            body: req.body
        });
        res.status(500).json({
            error: 'Failed to create student',
            details: error.message
        });
    } finally {
        client.release();
    }
});

// Update student
router.put('/:id', studentValidation, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, guardian_contact } = req.body;

        const result = await pool.query(`
            UPDATE students 
            SET status = $1, guardian_contact = $2
            WHERE student_id = $3
            RETURNING *
        `, [status, guardian_contact, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

// Credit related routes
router.get('/:id/credits', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate student exists
        const studentExists = await pool.query('SELECT * FROM students WHERE student_id = $1', [id]);
        if (studentExists.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const result = await pool.query(`
            SELECT 
                sc.*,
                cp.name as package_name,
                cp.total_credits,
                cp.price
            FROM student_credits sc
            JOIN credit_packages cp ON sc.package_id = cp.package_id
            WHERE sc.student_id = $1
            ORDER BY sc.purchase_date DESC
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching student credits:', error);
        res.status(500).json({ 
            error: 'Failed to fetch student credits',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Purchase credits
router.post('/:id/credits', async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { package_id } = req.body;

        // Validate student exists
        const studentExists = await client.query('SELECT * FROM students WHERE student_id = $1', [id]);
        if (studentExists.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Get package details
        const packageResult = await client.query(
            'SELECT * FROM credit_packages WHERE package_id = $1',
            [package_id]
        );

        if (packageResult.rows.length === 0) {
            return res.status(404).json({ error: 'Credit package not found' });
        }

        await client.query('BEGIN');

        const package_info = packageResult.rows[0];
        const expiration_date = new Date();
        expiration_date.setDate(expiration_date.getDate() + package_info.expiration_days);

        const result = await client.query(`
            INSERT INTO student_credits 
            (student_id, package_id, credits_remaining, expiration_date)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [id, package_id, package_info.total_credits, expiration_date]);

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error purchasing credits:', error);
        res.status(500).json({ 
            error: 'Failed to purchase credits',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
});

export default router;
