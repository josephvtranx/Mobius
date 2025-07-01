import express from 'express';
import { body } from 'express-validator';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const sessionValidation = [
    body('instructor_id').isInt().withMessage('Instructor ID must be a valid integer'),
    body('student_id').isInt().withMessage('Student ID must be a valid integer'),
    body('subject_id').isInt().withMessage('Subject ID must be a valid integer'),
    body('session_date').isDate().withMessage('Session date must be a valid date'),
    body('start_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format'),
    body('end_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format'),
    body('location').optional().isString().withMessage('Location must be a string')
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
            JOIN users u_i ON i.instructor_id = u_i.user_id
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u_s ON s.student_id = u_s.user_id
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
            JOIN users u_i ON i.instructor_id = u_i.user_id
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u_s ON s.student_id = u_s.user_id
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

// Create a new class session
router.post('/', authenticateToken, sessionValidation, async (req, res) => {
    try {
        const {
            instructor_id,
            student_id,
            subject_id,
            session_date,
            start_time,
            end_time,
            location
        } = req.body;

        // Validate time range
        if (start_time >= end_time) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }

        // Check if instructor exists and is active
        const instructorCheck = await pool.query(`
            SELECT i.instructor_id, u.name, u.is_active
            FROM instructors i
            JOIN users u ON i.instructor_id = u.user_id
            WHERE i.instructor_id = $1
        `, [instructor_id]);

        if (instructorCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Instructor not found' });
        }

        if (!instructorCheck.rows[0].is_active) {
            return res.status(400).json({ error: 'Instructor account is inactive' });
        }

        // Check if student exists and is active
        const studentCheck = await pool.query(`
            SELECT s.student_id, u.name, u.is_active
            FROM students s
            JOIN users u ON s.student_id = u.user_id
            WHERE s.student_id = $1
        `, [student_id]);

        if (studentCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        if (!studentCheck.rows[0].is_active) {
            return res.status(400).json({ error: 'Student account is inactive' });
        }

        // Check if subject exists
        const subjectCheck = await pool.query(`
            SELECT subject_id, name FROM subjects WHERE subject_id = $1
        `, [subject_id]);

        if (subjectCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        // Check if instructor is qualified to teach this subject
        const instructorSubjectCheck = await pool.query(`
            SELECT * FROM instructor_specialties 
            WHERE instructor_id = $1 AND subject_id = $2
        `, [instructor_id, subject_id]);

        if (instructorSubjectCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Instructor is not qualified to teach this subject' });
        }

        // Check instructor availability
        const instructorAvailability = await pool.query(`
            WITH availability_check AS (
                SELECT * FROM instructor_availability
                WHERE instructor_id = $1
                AND day_of_week = LOWER(to_char($2::date, 'Dy'))
                AND $3::time BETWEEN start_time AND end_time
                AND $4::time BETWEEN start_time AND end_time
            ),
            unavailability_check AS (
                SELECT * FROM instructor_unavailability
                WHERE instructor_id = $1
                AND $2::date BETWEEN DATE(start_datetime) AND DATE(end_datetime)
                AND $3::time BETWEEN CAST(start_datetime AS time) AND CAST(end_datetime AS time)
                AND $4::time BETWEEN CAST(start_datetime AS time) AND CAST(end_datetime AS time)
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

        // Create session (no credit deduction at scheduling time)
        const result = await pool.query(`
            INSERT INTO class_sessions (
                instructor_id,
                student_id,
                subject_id,
                session_date,
                start_time,
                end_time,
                location,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled')
            RETURNING *
        `, [instructor_id, student_id, subject_id, session_date, start_time, end_time, location]);

        // Create instructor unavailability for this specific session
        const sessionStartDateTime = `${session_date} ${start_time}`;
        const sessionEndDateTime = `${session_date} ${end_time}`;
        
        await pool.query(`
            INSERT INTO instructor_unavailability (
                instructor_id,
                start_datetime,
                end_datetime,
                reason
            )
            VALUES ($1, $2::timestamp, $3::timestamp, $4)
        `, [instructor_id, sessionStartDateTime, sessionEndDateTime, `Scheduled class session ${result.rows[0].session_id}`]);

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

        // If session is canceled or completed, remove the unavailability record
        if (status === 'canceled' || status === 'completed') {
            await pool.query(`
                DELETE FROM instructor_unavailability
                WHERE instructor_id = $1
                AND reason LIKE $2
            `, [result.rows[0].instructor_id, `Scheduled class session ${id}%`]);
        }

        // Note: No credit refund logic here since credits are only deducted when attendance is marked
        // If a session is canceled before attendance is marked, no credits were deducted

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

// Get class sessions by instructor
router.get('/instructor/:instructorId', async (req, res) => {
    try {
        const { instructorId } = req.params;
        const { startDate, endDate } = req.query;

        let query = `
            SELECT 
                cs.*,
                json_build_object(
                    'student_id', s.student_id,
                    'name', u_s.name,
                    'email', u_s.email
                ) as student,
                sub.name as subject_name
            FROM class_sessions cs
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u_s ON s.student_id = u_s.user_id
            JOIN subjects sub ON cs.subject_id = sub.subject_id
            WHERE cs.instructor_id = $1
        `;

        const params = [instructorId];

        if (startDate && endDate) {
            query += ` AND cs.session_date BETWEEN $2 AND $3`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY cs.session_date ASC, cs.start_time ASC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching instructor sessions:', error);
        res.status(500).json({ error: 'Failed to fetch instructor sessions' });
    }
});

export default router; 