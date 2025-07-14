import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { toUtcIso, assertUtcIso } from '../lib/time.js';
import { requireUtcIso } from '../middleware/requireUtcIso.js';

const router = express.Router();

// Validation middleware for new TIMESTAMPTZ fields
const sessionValidation = [
    body('instructor_id').isInt().withMessage('Instructor ID must be a valid integer'),
    body('student_id').isInt().withMessage('Student ID must be a valid integer'),
    body('subject_id').isInt().withMessage('Subject ID must be a valid integer'),
    body('session_start').isISO8601().withMessage('Session start must be a valid ISO 8601 timestamp'),
    body('session_end').isISO8601().withMessage('Session end must be a valid ISO 8601 timestamp'),
    body('location').optional().isString().withMessage('Location must be a string')
];

// Error handling middleware for validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ 
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

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
            query += ` AND cs.session_start >= $${paramCount}::timestamptz`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            query += ` AND cs.session_end <= $${paramCount}::timestamptz`;
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

        query += ` ORDER BY cs.session_start`;

        const result = await req.db.query(query, params);
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
        const result = await req.db.query(`
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
router.post('/', authenticateToken, requireUtcIso(['session_start', 'session_end']), sessionValidation, handleValidationErrors, async (req, res) => {
    try {
        console.log('Received session creation request:', req.body);
        
        const {
            instructor_id,
            student_id,
            subject_id,
            session_start,
            session_end,
            location
        } = req.body;

        // Debug: Log the received data
        console.log('Parsed session data:', {
            instructor_id,
            student_id,
            subject_id,
            session_start,
            session_end,
            location
        });

        // Validate that all required fields are present
        if (!instructor_id || !student_id || !subject_id || !session_start || !session_end) {
            console.log('Missing required fields:', { instructor_id, student_id, subject_id, session_start, session_end });
            return res.status(400).json({ 
                error: 'Missing required fields',
                required: ['instructor_id', 'student_id', 'subject_id', 'session_start', 'session_end'],
                received: { instructor_id, student_id, subject_id, session_start, session_end }
            });
        }

        // Validate time range
        const startDate = toUtcIso(session_start);
        const endDate = toUtcIso(session_end);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ 
                error: 'Invalid date format for session_start or session_end',
                session_start,
                session_end
            });
        }
        
        if (startDate >= endDate) {
            return res.status(400).json({ error: 'Session start must be before session end' });
        }

        // Check if instructor exists and is active
        const instructorCheck = await req.db.query(`
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
        const studentCheck = await req.db.query(`
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
        const subjectCheck = await req.db.query(`
            SELECT subject_id, name FROM subjects WHERE subject_id = $1
        `, [subject_id]);

        if (subjectCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        // Check if instructor is qualified to teach this subject
        const instructorSubjectCheck = await req.db.query(`
            SELECT * FROM instructor_specialties 
            WHERE instructor_id = $1 AND subject_id = $2
        `, [instructor_id, subject_id]);

        if (instructorSubjectCheck.rows.length === 0) {
            return res.status(400).json({ error: 'Instructor is not qualified to teach this subject' });
        }

        // Check instructor availability using the new TIMESTAMPTZ fields
        // Extract day of week from session_start - convert to local time first
        const sessionStartDate = toUtcIso(session_start);
        const dayMap = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
        
        // Convert UTC to local time for day calculation
        const localDate = new Date(sessionStartDate.getTime() - (sessionStartDate.getTimezoneOffset() * 60000));
        const dayOfWeek = dayMap[localDate.getDay()];
        
        // Extract time components from session_start and session_end
        // Convert UTC to local time for availability checking
        const localStartTime = toUtcIso(session_start);
        const localEndTime = toUtcIso(session_end);
        const startTime = localStartTime.toTimeString().slice(0, 5);
        const endTime = localEndTime.toTimeString().slice(0, 5);
        const sessionDate = localStartTime.toISOString().split('T')[0];
        
        console.log(`[DEBUG] Session start: ${session_start}`);
        console.log(`[DEBUG] Session end: ${session_end}`);
        console.log(`[DEBUG] UTC day: ${sessionStartDate.getDay()}`);
        console.log(`[DEBUG] Local day: ${localDate.getDay()}`);
        console.log(`[DEBUG] Day of week: ${dayOfWeek}`);
        console.log(`[DEBUG] Start time: ${startTime}`);
        console.log(`[DEBUG] End time: ${endTime}`);
        console.log(`[DEBUG] Session date: ${sessionDate}`);
        
        const instructorAvailability = await req.db.query(`
            WITH availability_check AS (
                SELECT * FROM instructor_availability
                WHERE instructor_id = $1
                AND day_of_week = $2
                AND status = 'active'
                AND (
                    -- Session start time is within availability
                    ($3::time >= start_time AND $3::time < end_time)
                    OR
                    -- Session end time is within availability
                    ($4::time > start_time AND $4::time <= end_time)
                    OR
                    -- Session completely contains availability
                    ($3::time <= start_time AND $4::time >= end_time)
                )
                AND (start_date IS NULL OR start_date <= $5::date)
                AND (end_date IS NULL OR end_date >= $5::date)
            ),
            unavailability_check AS (
                SELECT * FROM instructor_unavailability
                WHERE instructor_id = $1
                AND $6::timestamptz BETWEEN start_datetime AND end_datetime
                AND (
                    ($3::time, $4::time) OVERLAPS (
                        CAST(start_datetime AS time), 
                        CAST(end_datetime AS time)
                    )
                )
            )
            SELECT * FROM availability_check
            WHERE NOT EXISTS (
                SELECT 1 FROM unavailability_check
            )
        `, [instructor_id, dayOfWeek, startTime, endTime, sessionDate, session_start]);

        if (instructorAvailability.rows.length === 0) {
            console.log(`[DEBUG] Availability check failed for instructor ${instructor_id} on ${sessionDate} (${startTime} - ${endTime})`);
            
            const allAvail = await req.db.query(`
                SELECT * FROM instructor_availability 
                WHERE instructor_id = $1 AND day_of_week = $2
            `, [instructor_id, dayOfWeek]);
            console.log(`[DEBUG] All availability for instructor ${instructor_id} on ${dayOfWeek}:`, allAvail.rows);
            
            return res.status(400).json({ 
                error: 'Instructor is not available at this time',
                debug: {
                    dayOfWeek,
                    instructorId: instructor_id,
                    sessionDate,
                    startTime,
                    endTime,
                    availableSlots: allAvail.rows
                }
            });
        }

        // Check for scheduling conflicts using TIMESTAMPTZ
        const conflicts = await req.db.query(`
            SELECT 
                cs.*,
                CASE 
                    WHEN cs.instructor_id = $1 THEN 'instructor'
                    WHEN cs.student_id = $2 THEN 'student'
                END as conflict_type
            FROM class_sessions cs
            WHERE (cs.instructor_id = $1 OR cs.student_id = $2)
            AND (
                ($3::timestamptz, $4::timestamptz) OVERLAPS (cs.session_start, cs.session_end)
            )
            AND cs.status NOT IN ('canceled', 'completed')
        `, [instructor_id, student_id, session_start, session_end]);

        if (conflicts.rows.length > 0) {
            const conflictDetails = conflicts.rows.map(conflict => ({
                session_id: conflict.session_id,
                conflict_type: conflict.conflict_type,
                session_start: conflict.session_start,
                session_end: conflict.session_end,
                status: conflict.status
            }));
            
            console.log('Scheduling conflicts found:', conflictDetails);
            
            return res.status(400).json({ 
                error: 'Time slot conflicts with existing session',
                conflicts: conflictDetails
            });
        }

        // Create session using new TIMESTAMPTZ fields
        try {
            console.log('Attempting to create session with data:', {
                instructor_id,
                student_id,
                subject_id,
                session_start,
                session_end,
                location
            });
            
            // Extract old format fields for backward compatibility
            const sessionDate = toUtcIso(session_start).toISOString().split('T')[0];
            const startTime = toUtcIso(session_start).toTimeString().slice(0, 5);
            const endTime = toUtcIso(session_end).toTimeString().slice(0, 5);
            
            const result = await req.db.query(`
            INSERT INTO class_sessions (
                instructor_id,
                student_id,
                subject_id,
                session_date,
                start_time,
                end_time,
                    session_start,
                    session_end,
                location,
                status
            )
                VALUES ($1, $2, $3, $4, $5, $6, $7::timestamptz, $8::timestamptz, $9, 'pending')
            RETURNING *
            `, [instructor_id, student_id, subject_id, sessionDate, startTime, endTime, session_start, session_end, location]);

            console.log('Session created successfully:', result.rows[0]);

        // Create instructor unavailability for this specific session
        await req.db.query(`
            INSERT INTO instructor_unavailability (
                instructor_id,
                start_datetime,
                end_datetime,
                reason
            )
                VALUES ($1, $2::timestamptz, $3::timestamptz, $4)
            `, [instructor_id, session_start, session_end, `Scheduled class session ${result.rows[0].session_id}`]);

        res.status(201).json(result.rows[0]);
        } catch (dbError) {
            console.error('Database error creating session:', dbError);
            throw dbError;
        }
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

        // Map 'confirmed' to 'scheduled' for class sessions
        let mappedStatus = status;
        if (status === 'confirmed') {
            mappedStatus = 'scheduled';
        }

        if (!['scheduled', 'completed', 'canceled', 'rescheduled', 'pending', 'declined'].includes(mappedStatus)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await req.db.query(`
            UPDATE class_sessions
            SET 
                status = $1,
                cancellation_reason = $2
            WHERE session_id = $3
            RETURNING *
        `, [mappedStatus, cancellation_reason, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class session not found' });
        }

        // If session is canceled or completed, remove the unavailability record
        if (mappedStatus === 'canceled' || mappedStatus === 'completed') {
            await req.db.query(`
                DELETE FROM instructor_unavailability
                WHERE instructor_id = $1
                AND reason LIKE $2
            `, [result.rows[0].instructor_id, `Scheduled class session ${id}%`]);
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
        const sessionCheck = await req.db.query(`
            SELECT * FROM class_sessions
            WHERE session_id = $1 AND session_start <= NOW()
        `, [id]);

        if (sessionCheck.rows.length === 0) {
            return res.status(400).json({ 
                error: 'Session not found or is scheduled for future date' 
            });
        }

        const result = await req.db.query(`
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

// Add DELETE endpoint for single class session
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await req.db.query(
            'DELETE FROM class_sessions WHERE session_id = $1 RETURNING *',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Class session not found' });
        }
        res.json({ message: 'Class session deleted successfully' });
    } catch (error) {
        console.error('Error deleting class session:', error);
        res.status(500).json({ error: 'Failed to delete class session' });
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
            query += ` AND cs.session_start >= $2::timestamptz AND cs.session_end <= $3::timestamptz`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY cs.session_start ASC`;

        const result = await req.db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching instructor sessions:', error);
        res.status(500).json({ error: 'Failed to fetch instructor sessions' });
    }
});

export default router; 