import express from 'express';
import { body } from 'express-validator';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const timePackageValidation = [
    body('name').isString().trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('hours_total').isInt({ min: 1 }).withMessage('Hours total must be a positive integer'),
    body('price').isNumeric().withMessage('Price must be a valid number'),
    body('expiration_days').isInt({ min: 0 }).withMessage('Expiration days must be a non-negative integer')
];

// Get all time packages
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM time_packages 
            ORDER BY hours_total ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching time packages:', error);
        res.status(500).json({ error: 'Failed to fetch time packages' });
    }
});

// Get time package by ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT * FROM time_packages 
            WHERE time_package_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Time package not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching time package:', error);
        res.status(500).json({ error: 'Failed to fetch time package' });
    }
});

// Create new time package
router.post('/', authenticateToken, timePackageValidation, async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, hours_total, price, expiration_days } = req.body;

        await client.query('BEGIN');

        const result = await client.query(`
            INSERT INTO time_packages (name, hours_total, price, expiration_days)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [name, hours_total, price, expiration_days]);

        await client.query('COMMIT');
        res.status(201).json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating time package:', error);
        res.status(500).json({ 
            error: 'Failed to create time package',
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// Update time package
router.put('/:id', authenticateToken, timePackageValidation, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { name, hours_total, price, expiration_days } = req.body;

        await client.query('BEGIN');

        const result = await client.query(`
            UPDATE time_packages 
            SET name = $1, hours_total = $2, price = $3, expiration_days = $4
            WHERE time_package_id = $5
            RETURNING *
        `, [name, hours_total, price, expiration_days, id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Time package not found' });
        }

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error updating time package:', error);
        res.status(500).json({ 
            error: 'Failed to update time package',
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// Delete time package
router.delete('/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        // Check if any students have this time package
        const studentPackages = await client.query(`
            SELECT COUNT(*) FROM student_time_packages 
            WHERE time_package_id = $1
        `, [id]);

        if (parseInt(studentPackages.rows[0].count) > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete time package that is currently assigned to students' 
            });
        }

        await client.query('BEGIN');

        const result = await client.query(`
            DELETE FROM time_packages 
            WHERE time_package_id = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Time package not found' });
        }

        await client.query('COMMIT');
        res.json({ message: 'Time package deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting time package:', error);
        res.status(500).json({ 
            error: 'Failed to delete time package',
            details: error.message 
        });
    } finally {
        client.release();
    }
});

export default router; 