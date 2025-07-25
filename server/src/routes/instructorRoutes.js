import express from 'express';
import { body } from 'express-validator';
// import pool from '../config/db.js';
import { getInstructorRoster, updateInstructor } from '../controllers/instructorController.js';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { toUtcIso, assertUtcIso } from '../lib/time.js';
import { requireUtcIso } from '../middleware/requireUtcIso.js';
const router = express.Router();

// Validation middleware
const instructorValidation = [
    body('user_id').isInt().withMessage('Valid user ID is required'),
    body('hourly_rate').isFloat({ min: 0 }).withMessage('Valid hourly rate is required'),
    body('max_weekly_hours').optional().isInt({ min: 0 }).withMessage('Max weekly hours must be positive'),
    body('specialization').optional().isString().withMessage('Specialization must be a string')
];

const availabilityValidation = [
    body('day_of_week').isIn(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])
        .withMessage('Valid day of week is required'),
    body('start_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    body('end_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format'),
    body('type').optional().isIn(['default', 'preferred', 'emergency'])
        .withMessage('Type must be default, preferred, or emergency'),
    body('status').optional().isIn(['active', 'inactive'])
        .withMessage('Status must be active or inactive'),
    body('start_date').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('end_date').optional().isISO8601().withMessage('End date must be a valid date'),
    body('notes').optional().isString().withMessage('Notes must be a string')
];

// Get instructor roster
router.get('/roster', getInstructorRoster);

// Get all instructors
router.get('/', async (req, res) => {
    try {
        const result = await req.db.query(`
            SELECT 
                i.*,
                u.name,
                u.email,
                u.phone,
                json_agg(DISTINCT s.name) as specialties
            FROM instructors i
            JOIN users u ON i.instructor_id = u.user_id
            LEFT JOIN instructor_specialties is_join ON i.instructor_id = is_join.instructor_id
            LEFT JOIN subjects s ON is_join.subject_id = s.subject_id
            WHERE u.is_active = true
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
        const result = await req.db.query(`
            SELECT 
                i.*,
                u.name,
                u.email,
                u.phone,
                json_agg(DISTINCT s.*) as specialties,
                json_agg(DISTINCT ia.*) as availability,
                json_agg(DISTINCT cs.*) as upcoming_sessions
            FROM instructors i
            JOIN users u ON i.instructor_id = u.user_id
            LEFT JOIN instructor_specialties is_join ON i.instructor_id = is_join.instructor_id
            LEFT JOIN subjects s ON is_join.subject_id = s.subject_id
            LEFT JOIN instructor_availability ia ON i.instructor_id = ia.instructor_id
            LEFT JOIN class_sessions cs ON i.instructor_id = cs.instructor_id
            WHERE i.instructor_id = $1 AND u.is_active = true
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
        const userCheck = await req.db.query(
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
        const instructorCheck = await req.db.query(
            'SELECT instructor_id FROM instructors WHERE user_id = $1',
            [user_id]
        );

        if (instructorCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Instructor record already exists' });
        }

        const result = await req.db.query(`
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

// Update instructor - using new controller function
router.put('/:id', updateInstructor);

// Add availability
router.post('/:id/availability', requireUtcIso(['start_date', 'end_date']), availabilityValidation, async (req, res) => {
    try {
        const { id } = req.params;
        const { day_of_week, start_time, end_time, type, status, start_date, end_date, notes } = req.body;

        // Validate time range
        if (start_time >= end_time) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }

        // Validate date range if both dates are provided
        if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({ error: 'Start date must be before end date' });
        }

        const result = await req.db.query(`
            INSERT INTO instructor_availability (
                instructor_id,
                day_of_week,
                start_time,
                end_time,
                type,
                status,
                start_date,
                end_date,
                notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [
            id, 
            day_of_week, 
            start_time, 
            end_time, 
            type || 'default', 
            status || 'active', 
            start_date || null, 
            end_date || null, 
            notes || null
        ]);

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
        const result = await req.db.query(`
            SELECT * FROM instructor_availability
            WHERE instructor_id = $1
            ORDER BY 
                CASE day_of_week
                    WHEN 'sun' THEN 1
                    WHEN 'mon' THEN 2
                    WHEN 'tue' THEN 3
                    WHEN 'wed' THEN 4
                    WHEN 'thu' THEN 5
                    WHEN 'fri' THEN 6
                    WHEN 'sat' THEN 7
                END,
                start_time
        `, [id]);

        console.log('[DEBUG] /api/instructors/' + id + '/availability result:', result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
});

// Update availability slot
router.put('/:id/availability/:availabilityId', async (req, res) => {
    try {
        const { id, availabilityId } = req.params;
        const { day_of_week, start_time, end_time, type, status, start_date, end_date, notes } = req.body;

        // Validate time range
        if (start_time >= end_time) {
            return res.status(400).json({ error: 'Start time must be before end time' });
        }

        // Validate date range if both dates are provided
        if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({ error: 'Start date must be before end date' });
        }

        const result = await req.db.query(`
            UPDATE instructor_availability
            SET day_of_week = $1, start_time = $2, end_time = $3, type = $4, status = $5, start_date = $6, end_date = $7, notes = $8
            WHERE availability_id = $9 AND instructor_id = $10
            RETURNING *
        `, [day_of_week, start_time, end_time, type, status, start_date || null, end_date || null, notes || null, availabilityId, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Availability slot not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating availability:', error);
        res.status(500).json({ error: 'Failed to update availability' });
    }
});

// Delete availability slot
router.delete('/:id/availability/:availabilityId', async (req, res) => {
    try {
        const { id, availabilityId } = req.params;
        const result = await req.db.query(`
            DELETE FROM instructor_availability
            WHERE availability_id = $1 AND instructor_id = $2
            RETURNING *
        `, [availabilityId, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Availability slot not found' });
        }

        res.json({ message: 'Availability slot deleted successfully' });
    } catch (error) {
        console.error('Error deleting availability:', error);
        res.status(500).json({ error: 'Failed to delete availability' });
    }
});

// Get instructor unavailability
router.get('/:id/unavailability', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.db.query(`
            SELECT * FROM instructor_unavailability
            WHERE instructor_id = $1
            ORDER BY start_datetime
        `, [id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching unavailability:', error);
        res.status(500).json({ error: 'Failed to fetch unavailability' });
    }
});

// Add unavailability
router.post('/:id/unavailability', async (req, res) => {
    try {
        const { id } = req.params;
        const { start_datetime, end_datetime, reason } = req.body;

        // Validate datetime range
        if (new Date(start_datetime) >= new Date(end_datetime)) {
            return res.status(400).json({ error: 'Start datetime must be before end datetime' });
        }

        const result = await req.db.query(`
            INSERT INTO instructor_unavailability (
                instructor_id,
                start_datetime,
                end_datetime,
                reason
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [id, start_datetime, end_datetime, reason]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding unavailability:', error);
        res.status(500).json({ error: 'Failed to add unavailability' });
    }
});

// Delete unavailability
router.delete('/:id/unavailability/:unavailabilityId', async (req, res) => {
    try {
        const { id, unavailabilityId } = req.params;
        const result = await req.db.query(`
            DELETE FROM instructor_unavailability
            WHERE unavail_id = $1 AND instructor_id = $2
            RETURNING *
        `, [unavailabilityId, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Unavailability record not found' });
        }

        res.json({ message: 'Unavailability record deleted successfully' });
    } catch (error) {
        console.error('Error deleting unavailability:', error);
        res.status(500).json({ error: 'Failed to delete unavailability' });
    }
});

// Get instructor's weekly schedule (class sessions + student/subject info)
router.get('/:id/schedule', async (req, res) => {
    try {
        const { id } = req.params;
        let { start_date, end_date } = req.query;

        // Default to current week (Sun-Sat)
        const now = new Date();
        if (!start_date) start_date = format(startOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd');
        if (!end_date) end_date = format(endOfWeek(now, { weekStartsOn: 0 }), 'yyyy-MM-dd');

        // Get individual sessions using new TIMESTAMPTZ fields
        const sessionsResult = await req.db.query(`
            SELECT 
                cs.session_id,
                cs.session_start,
                cs.session_end,
                cs.status,
                u_s.name as student_name,
                sub.name as subject_name,
                'session' as type
            FROM class_sessions cs
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u_s ON s.student_id = u_s.user_id
            JOIN subjects sub ON cs.subject_id = sub.subject_id
            WHERE cs.instructor_id = $1
              AND cs.session_start >= $2::timestamptz
              AND cs.session_end <= $3::timestamptz
              AND cs.status IN ('scheduled', 'completed', 'in_progress')
        `, [id, start_date, end_date]);

        // Get class series (keeping old format for now since class_series table might not be updated yet)
        const seriesResult = await req.db.query(`
            SELECT 
                cs.series_id as session_id,
                cs.start_date as session_date,
                cs.session_start,
                cs.session_end,
                cs.status,
                u_s.name as student_name,
                sub.name as subject_name,
                'series' as type
            FROM class_series cs
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u_s ON s.student_id = u_s.user_id
            JOIN subjects sub ON cs.subject_id = sub.subject_id
            WHERE cs.instructor_id = $1
              AND cs.start_date <= $3
              AND (cs.end_date IS NULL OR cs.end_date >= $2)
              AND cs.status IN ('confirmed', 'in_progress', 'pending')
        `, [id, start_date, end_date]);

        // Combine and sort results
        const allClasses = [...sessionsResult.rows, ...seriesResult.rows];
        const result = {
            rows: allClasses.sort((a, b) => {
                // Handle both old and new format
                const aDate = a.session_start ? new Date(a.session_start) : new Date(a.session_date);
                const bDate = b.session_start ? new Date(b.session_start) : new Date(b.session_date);
                return aDate - bDate;
            })
        };

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching instructor schedule:', error);
        res.status(500).json({ error: 'Failed to fetch instructor schedule' });
    }
});

export default router; 