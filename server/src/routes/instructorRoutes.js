import express from 'express';
import { body } from 'express-validator';
import pool from '../config/db.js';
const router = express.Router();

// Validation middleware
const instructorValidation = [
    body('user_id').isInt().withMessage('Valid user ID is required'),
    body('hourly_rate').isFloat({ min: 0 }).withMessage('Valid hourly rate is required'),
    body('max_weekly_hours').optional().isInt({ min: 0 }).withMessage('Max weekly hours must be positive'),
    body('specialization').optional().isString().withMessage('Specialization must be a string')
];

const availabilityValidation = [
    body('day_of_week').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
        .withMessage('Valid day of week is required'),
    body('start_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    body('end_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format')
];

// Get all instructors
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                i.*,
                u.name,
                u.email,
                u.phone,
                json_agg(DISTINCT s.name) as specialties
            FROM instructors i
            JOIN users u ON i.user_id = u.user_id
            LEFT JOIN instructor_specialties is_join ON i.instructor_id = is_join.instructor_id
            LEFT JOIN subjects s ON is_join.subject_id = s.subject_id
            WHERE u.is_deleted = false
            GROUP BY i.instructor_id, u.user_id
            ORDER BY u.name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching instructors:', error);
        res.status(500).json({ error: 'Failed to fetch instructors' });
    }
});

// Get single instructor with their details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                i.*,
                u.name,
                u.email,
                u.phone,
                json_agg(DISTINCT s.*) as specialties,
                json_agg(DISTINCT ia.*) as availability,
                json_agg(DISTINCT cs.*) as upcoming_sessions
            FROM instructors i
            JOIN users u ON i.user_id = u.user_id
            LEFT JOIN instructor_specialties is_join ON i.instructor_id = is_join.instructor_id
            LEFT JOIN subjects s ON is_join.subject_id = s.subject_id
            LEFT JOIN instructor_availability ia ON i.instructor_id = ia.instructor_id
            LEFT JOIN class_sessions cs ON i.instructor_id = cs.instructor_id
            WHERE i.instructor_id = $1 AND u.is_deleted = false
            GROUP BY i.instructor_id, u.user_id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Instructor not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching instructor:', error);
        res.status(500).json({ error: 'Failed to fetch instructor' });
    }
});

// Create new instructor
router.post('/', instructorValidation, async (req, res) => {
    try {
        const { 
            user_id, 
            hourly_rate, 
            max_weekly_hours, 
            specialization,
            biography 
        } = req.body;

        // Check if user exists and is not already an instructor
        const userCheck = await pool.query(
            'SELECT role FROM users WHERE user_id = $1 AND is_deleted = false',
            [user_id]
        );

        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (userCheck.rows[0].role !== 'instructor') {
            return res.status(400).json({ error: 'User must have instructor role' });
        }

        // Check if instructor record already exists
        const instructorCheck = await pool.query(
            'SELECT instructor_id FROM instructors WHERE user_id = $1',
            [user_id]
        );

        if (instructorCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Instructor record already exists' });
        }

        const result = await pool.query(`
            INSERT INTO instructors (
                user_id, 
                hourly_rate, 
                max_weekly_hours, 
                specialization,
                biography,
                hire_date
            )
            VALUES ($1, $2, $3, $4, $5, CURRENT_DATE)
            RETURNING *
        `, [user_id, hourly_rate, max_weekly_hours, specialization, biography]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating instructor:', error);
        res.status(500).json({ error: 'Failed to create instructor' });
    }
});

// Update instructor
router.put('/:id', instructorValidation, async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            hourly_rate, 
            max_weekly_hours, 
            specialization,
            biography 
        } = req.body;

        const result = await pool.query(`
            UPDATE instructors 
            SET 
                hourly_rate = $1,
                max_weekly_hours = $2,
                specialization = $3,
                biography = $4
            WHERE instructor_id = $5
            RETURNING *
        `, [hourly_rate, max_weekly_hours, specialization, biography, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Instructor not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating instructor:', error);
        res.status(500).json({ error: 'Failed to update instructor' });
    }
});

// Add availability
router.post('/:id/availability', availabilityValidation, async (req, res) => {
    try {
        const { id } = req.params;
        const { day_of_week, start_time, end_time } = req.body;

        // Validate time range
        if (start_time >= end_time) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }

        const result = await pool.query(`
            INSERT INTO instructor_availability (
                instructor_id,
                day_of_week,
                start_time,
                end_time
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [id, day_of_week, start_time, end_time]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding availability:', error);
        res.status(500).json({ error: 'Failed to add availability' });
    }
});

// Get instructor availability
router.get('/:id/availability', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT * FROM instructor_availability
            WHERE instructor_id = $1
            ORDER BY 
                CASE day_of_week
                    WHEN 'Monday' THEN 1
                    WHEN 'Tuesday' THEN 2
                    WHEN 'Wednesday' THEN 3
                    WHEN 'Thursday' THEN 4
                    WHEN 'Friday' THEN 5
                    WHEN 'Saturday' THEN 6
                    WHEN 'Sunday' THEN 7
                END,
                start_time
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
});

// Delete availability slot
router.delete('/:id/availability/:slotId', async (req, res) => {
    try {
        const { id, slotId } = req.params;

        const result = await pool.query(`
            DELETE FROM instructor_availability
            WHERE instructor_id = $1 AND id = $2
            RETURNING *
        `, [id, slotId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Availability slot not found' });
        }

        res.json({ message: 'Availability slot deleted successfully' });
    } catch (error) {
        console.error('Error deleting availability:', error);
        res.status(500).json({ error: 'Failed to delete availability' });
    }
});

export default router; 