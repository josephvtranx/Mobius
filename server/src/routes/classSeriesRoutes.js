import express from 'express';
import { body } from 'express-validator';
import pool from '../config/db.js';
const router = express.Router();

// Validation middleware
const classSeriesValidation = [
    body('subject_id').isInt().withMessage('Valid subject ID is required'),
    body('student_id').isInt().withMessage('Valid student ID is required'),
    body('instructor_id').isInt().withMessage('Valid instructor ID is required'),
    body('start_date').isDate().withMessage('Valid start date is required'),
    body('end_date').optional().isDate().withMessage('Valid end date is required'),
    body('days_of_week').isArray().withMessage('Days of week must be an array'),
    body('days_of_week.*').isIn(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
        .withMessage('Invalid day of week'),
    body('start_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    body('end_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format'),
    body('location').optional().isString().withMessage('Location must be a string'),
    body('notes').optional().isString().withMessage('Notes must be a string')
];

// Get all class series
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                cs.*,
                json_build_object(
                    'instructor_id', i.instructor_id,
                    'name', u_i.name,
                    'email', u_i.email
                ) as instructor,
                json_build_object(
                    'student_id', s.student_id,
                    'name', u_s.name,
                    'email', u_s.email
                ) as student,
                sub.name as subject_name
            FROM class_series cs
            JOIN instructors i ON cs.instructor_id = i.instructor_id
            JOIN users u_i ON i.user_id = u_i.user_id
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u_s ON s.user_id = u_s.user_id
            JOIN subjects sub ON cs.subject_id = sub.subject_id
            ORDER BY cs.start_date DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching class series:', error);
        res.status(500).json({ error: 'Failed to fetch class series' });
    }
});

// Get pending class series
router.get('/pending', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                cs.*,
                json_build_object(
                    'instructor_id', i.instructor_id,
                    'name', u_i.name,
                    'email', u_i.email
                ) as instructor,
                json_build_object(
                    'student_id', s.student_id,
                    'name', u_s.name,
                    'email', u_s.email
                ) as student,
                sub.name as subject_name
            FROM class_series cs
            JOIN instructors i ON cs.instructor_id = i.instructor_id
            JOIN users u_i ON i.user_id = u_i.user_id
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u_s ON s.user_id = u_s.user_id
            JOIN subjects sub ON cs.subject_id = sub.subject_id
            WHERE cs.status = 'pending'
            ORDER BY cs.start_date ASC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching pending class series:', error);
        res.status(500).json({ error: 'Failed to fetch pending class series' });
    }
});

// Create new class series
router.post('/', classSeriesValidation, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const {
            subject_id,
            student_id,
            instructor_id,
            start_date,
            end_date,
            days_of_week,
            start_time,
            end_time,
            location,
            notes
        } = req.body;

        // Check instructor availability
        const instructorAvailability = await client.query(`
            SELECT * FROM instructor_availability
            WHERE instructor_id = $1
            AND day_of_week = ANY($2::text[])
            AND $3::time BETWEEN start_time AND end_time
            AND $4::time BETWEEN start_time AND end_time
        `, [instructor_id, days_of_week, start_time, end_time]);

        if (instructorAvailability.rows.length === 0) {
            return res.status(400).json({ error: 'Instructor is not available at these times' });
        }

        // Calculate number of sessions first
        const sessions = [];
        let currentDate = new Date(start_date);
        const endDate = new Date(end_date);

        while (currentDate <= endDate) {
            const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
            
            if (days_of_week.includes(dayOfWeek)) {
                sessions.push({
                    instructor_id,
                    student_id,
                    subject_id,
                    session_date: new Date(currentDate),
                    start_time,
                    end_time,
                    location,
                    status: 'scheduled',
                    credits_cost: 1
                });
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Create class series
        const seriesResult = await client.query(`
            INSERT INTO class_series (
                subject_id,
                student_id,
                instructor_id,
                created_by_staff_id,
                start_date,
                end_date,
                days_of_week,
                start_time,
                end_time,
                location,
                status,
                instructor_confirmation_status,
                notes,
                num_sessions
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7::text[], $8, $9, $10, 'pending', 'pending', $11, $12)
            RETURNING *
        `, [
            subject_id,
            student_id,
            instructor_id,
            req.user.staff_id, // Assuming we have the staff_id from the authenticated user
            start_date,
            end_date,
            days_of_week,
            start_time,
            end_time,
            location,
            notes,
            sessions.length
        ]);

        // Generate individual sessions
        const series = seriesResult.rows[0];

        // Insert all sessions
        for (const session of sessions) {
            await client.query(`
                INSERT INTO class_sessions (
                    series_id,
                    instructor_id,
                    student_id,
                    subject_id,
                    session_date,
                    start_time,
                    end_time,
                    location,
                    status,
                    credits_cost
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [
                series.series_id,
                session.instructor_id,
                session.student_id,
                session.subject_id,
                session.session_date,
                session.start_time,
                session.end_time,
                session.location,
                session.status,
                session.credits_cost
            ]);
        }

        await client.query('COMMIT');
        res.status(201).json(series);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating class series:', error);
        res.status(500).json({ error: 'Failed to create class series' });
    } finally {
        client.release();
    }
});

// Update class series status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'in_progress', 'completed', 'canceled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(`
            UPDATE class_series
            SET status = $1
            WHERE series_id = $2
            RETURNING *
        `, [status, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class series not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating class series status:', error);
        res.status(500).json({ error: 'Failed to update class series status' });
    }
});

// Delete class series
router.delete('/:id', async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { id } = req.params;

        // Delete associated sessions first
        await client.query(`
            DELETE FROM class_sessions
            WHERE series_id = $1
        `, [id]);

        // Delete the series
        const result = await client.query(`
            DELETE FROM class_series
            WHERE series_id = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class series not found' });
        }

        await client.query('COMMIT');
        res.json({ message: 'Class series deleted successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error deleting class series:', error);
        res.status(500).json({ error: 'Failed to delete class series' });
    } finally {
        client.release();
    }
});

export default router; 