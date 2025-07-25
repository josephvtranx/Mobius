import express from 'express';
import { body } from 'express-validator';
// import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Validation middleware
const guardianValidation = [
    body('name').notEmpty().trim()
        .withMessage('Guardian name is required'),
    body('phone').optional().matches(/^\+?[\d\s-]+$/)
        .withMessage('Invalid phone number'),
    body('email').optional().isEmail().normalizeEmail()
        .withMessage('Invalid email format'),
    body('relationship').notEmpty().trim()
        .withMessage('Relationship to student is required')
];

// Get all guardians
router.get('/', async (req, res) => {
    try {
        const result = await req.db.query('SELECT * FROM guardians');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching guardians:', error);
        res.status(500).json({ error: 'Failed to fetch guardians' });
    }
});

// Get specific guardian
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.db.query('SELECT * FROM guardians WHERE guardian_id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Guardian not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching guardian:', error);
        res.status(500).json({ error: 'Failed to fetch guardian' });
    }
});

// Create new guardian
router.post('/', guardianValidation, async (req, res) => {
    const client = await req.db.connect();
    try {
        await client.query('BEGIN');
        
        const { name, phone, email, relationship } = req.body;
        
        // Create guardian record
        const result = await client.query(
            `INSERT INTO guardians (name, phone, email, relationship, created_at, updated_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING *`,
            [name, phone, email, relationship]
        );
        
        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating guardian:', {
            message: error.message,
            stack: error.stack,
            user: req.user,
            body: req.body
        });
        res.status(500).json({
            error: 'Failed to create guardian',
            details: error.message
        });
    } finally {
        client.release();
    }
});

// Update guardian
router.put('/:id', guardianValidation, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, relationship } = req.body;
        
        const result = await req.db.query(
            'UPDATE guardians SET name = $1, phone = $2, email = $3, relationship = $4 WHERE guardian_id = $5 RETURNING *',
            [name, phone, email, relationship, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Guardian not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating guardian:', error);
        res.status(500).json({ error: 'Failed to update guardian' });
    }
});

// Delete guardian
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.db.query('DELETE FROM guardians WHERE guardian_id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Guardian not found' });
        }
        
        res.json({ message: 'Guardian deleted successfully' });
    } catch (error) {
        console.error('Error deleting guardian:', error);
        res.status(500).json({ error: 'Failed to delete guardian' });
    }
});

// Get all students for a guardian
router.get('/:id/students', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.db.query(`
            SELECT s.* 
            FROM students s
            JOIN student_guardian sg ON s.student_id = sg.student_id
            WHERE sg.guardian_id = $1
        `, [id]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching guardian\'s students:', error);
        res.status(500).json({ error: 'Failed to fetch guardian\'s students' });
    }
});

export default router; 