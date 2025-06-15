import express from 'express';
import { body } from 'express-validator';
import pool from '../config/db.js';
const router = express.Router();

// Validation middleware
const sessionValidation = [
    body('instructor_id').isInt().withMessage('Valid instructor ID is required'),
    body('student_id').isInt().withMessage('Valid student ID is required'),
    body('subject_id').isInt().withMessage('Valid subject ID is required'),
    body('session_date').isDate().withMessage('Valid date is required'),
    body('start_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    body('end_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format'),
    body('location').optional().isString().withMessage('Location must be a string'),
    body('credits_cost').optional().isInt({ min: 1 }).withMessage('Credits cost must be positive')
];

// Get all class sessions with filters
router.get('/', async (req, res) => {
    try {
        const { 
            start_date, 
            end_date, 
            instructor_id, 
            student_id,
            status 
        } = req.query;

        let query = `
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
            FROM class_sessions cs
            JOIN instructors i ON cs.instructor_id = i.instructor_id
            JOIN users u_i ON i.user_id = u_i.user_id
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u_s ON s.user_id = u_s.user_id
            JOIN subjects sub ON cs.subject_id = sub.subject_id
            WHERE 1=1
        `;

        const params = [];
        let paramCount = 1;

        if (start_date) {
            query += ` AND cs.session_date >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            query += ` AND cs.session_date <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }

        if (instructor_id) {
            query += ` AND cs.instructor_id = $${paramCount}`;
            params.push(instructor_id);
            paramCount++;
        }

        if (student_id) {
            query += ` AND cs.student_id = $${paramCount}`;
            params.push(student_id);
            paramCount++;
        }

        if (status) {
            query += ` AND cs.status = $${paramCount}`;
            params.push(status);
        }

        query += ` ORDER BY cs.session_date, cs.start_time`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching class sessions:', error);
        res.status(500).json({ error: 'Failed to fetch class sessions' });
    }
});

// Get single class session
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
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
                sub.name as subject_name,
                att.attended,
                att.notes as attendance_notes
            FROM class_sessions cs
            JOIN instructors i ON cs.instructor_id = i.instructor_id
            JOIN users u_i ON i.user_id = u_i.user_id
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u_s ON s.user_id = u_s.user_id
            JOIN subjects sub ON cs.subject_id = sub.subject_id
            LEFT JOIN attendance att ON cs.session_id = att.session_id
            WHERE cs.session_id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class session not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching class session:', error);
        res.status(500).json({ error: 'Failed to fetch class session' });
    }
});

// Create new class session
router.post('/', sessionValidation, async (req, res) => {
    try {
        const {
            instructor_id,
            student_id,
            subject_id,
            session_date,
            start_time,
            end_time,
            location,
            credits_cost = 1
        } = req.body;

        // Check if instructor is available
        const instructorAvailability = await pool.query(`
            WITH availability_check AS (
                SELECT * FROM instructor_availability
                WHERE instructor_id = $1
                AND day_of_week = to_char($2::date, 'Day')
                AND $3::time BETWEEN start_time AND end_time
                AND $4::time BETWEEN start_time AND end_time
            ),
            unavailability_check AS (
                SELECT * FROM instructor_unavailability
                WHERE instructor_id = $1
                AND $2::date BETWEEN DATE(start_datetime) AND DATE(end_datetime)
                AND $3::time BETWEEN TIME(start_datetime) AND TIME(end_datetime)
                AND $4::time BETWEEN TIME(start_datetime) AND TIME(end_datetime)
            )
            SELECT * FROM availability_check
            WHERE NOT EXISTS (
                SELECT 1 FROM unavailability_check
            )
        `, [instructor_id, session_date, start_time, end_time]);

        if (instructorAvailability.rows.length === 0) {
            return res.status(400).json({ error: 'Instructor is not available at this time' });
        }

        // Check for scheduling conflicts
        const conflicts = await pool.query(`
            SELECT * FROM class_sessions
            WHERE (instructor_id = $1 OR student_id = $2)
            AND session_date = $3
            AND (
                ($4::time, $5::time) OVERLAPS (start_time, end_time)
            )
            AND status NOT IN ('canceled', 'completed')
        `, [instructor_id, student_id, session_date, start_time, end_time]);

        if (conflicts.rows.length > 0) {
            return res.status(400).json({ error: 'Time slot conflicts with existing session' });
        }

        // Check student credits
        const studentCredits = await pool.query(`
            SELECT SUM(credits_remaining) as total_credits
            FROM student_credits
            WHERE student_id = $1 AND expiration_date >= CURRENT_DATE
        `, [student_id]);

        if (studentCredits.rows[0].total_credits < credits_cost) {
            return res.status(400).json({ error: 'Insufficient credits' });
        }

        // Create session
        const result = await pool.query(`
            INSERT INTO class_sessions (
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
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled', $8)
            RETURNING *
        `, [instructor_id, student_id, subject_id, session_date, start_time, end_time, location, credits_cost]);

        // Deduct credits
        await pool.query(`
            UPDATE student_credits
            SET credits_remaining = credits_remaining - $1
            WHERE student_id = $2
            AND expiration_date >= CURRENT_DATE
            AND credits_remaining >= $1
            ORDER BY expiration_date
            LIMIT 1
        `, [credits_cost, student_id]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating class session:', error);
        res.status(500).json({ error: 'Failed to create class session' });
    }
});

// Update class session status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, cancellation_reason } = req.body;

        if (!['scheduled', 'completed', 'canceled', 'rescheduled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(`
            UPDATE class_sessions
            SET 
                status = $1,
                cancellation_reason = $2
            WHERE session_id = $3
            RETURNING *
        `, [status, cancellation_reason, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class session not found' });
        }

        // If canceled, refund credits
        if (status === 'canceled') {
            await pool.query(`
                UPDATE student_credits
                SET credits_remaining = credits_remaining + $1
                WHERE student_id = $2
                AND expiration_date >= CURRENT_DATE
                ORDER BY expiration_date
                LIMIT 1
            `, [result.rows[0].credits_cost, result.rows[0].student_id]);
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating class session status:', error);
        res.status(500).json({ error: 'Failed to update class session status' });
    }
});

// Mark attendance
router.post('/:id/attendance', async (req, res) => {
    try {
        const { id } = req.params;
        const { attended, notes } = req.body;

        // Check if session exists and is scheduled for today or in the past
        const sessionCheck = await pool.query(`
            SELECT * FROM class_sessions
            WHERE session_id = $1 AND session_date <= CURRENT_DATE
        `, [id]);

        if (sessionCheck.rows.length === 0) {
            return res.status(400).json({ 
                error: 'Session not found or is scheduled for future date' 
            });
        }

        const result = await pool.query(`
            INSERT INTO attendance (session_id, student_id, attended, notes)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (session_id, student_id)
            DO UPDATE SET attended = $3, notes = $4
            RETURNING *
        `, [id, sessionCheck.rows[0].student_id, attended, notes]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

export default router; 