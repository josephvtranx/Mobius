import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import { 
    generateTimeSlots, 
    validateSchedulingRequest,
    findSmartSchedulingMatches
} from '../helpers/timeSlotHelpers.js';
import { toUtcIso, assertUtcIso } from '../lib/time.js';
import { requireUtcIso } from '../middleware/requireUtcIso.js';
const router = express.Router();

// Validation middleware
const classSeriesValidation = [
    body('subject_id').isInt().withMessage('Valid subject ID is required'),
    body('student_id').isInt().withMessage('Valid student ID is required'),
    body('instructor_id').isInt().withMessage('Valid instructor ID is required'),
    body('start_date').isDate().withMessage('Valid start date is required'),
    body('end_date').optional().isDate().withMessage('Valid end date is required'),
    body('days_of_week').isArray().withMessage('Days of week must be an array'),
    body('days_of_week.*').isIn(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])
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
                sub.name as subject_name
            FROM class_series cs
            LEFT JOIN instructors i ON cs.instructor_id = i.instructor_id
            LEFT JOIN users u_i ON i.instructor_id = u_i.user_id
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u_s ON s.student_id = u_s.user_id
            JOIN subjects sub ON cs.subject_id = sub.subject_id
            ORDER BY cs.start_date DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching class series:', error);
        res.status(500).json({ error: 'Failed to fetch class series' });
    }
});

// Temporary endpoint to update existing single sessions to pending status
router.post('/update-single-sessions-to-pending', async (req, res) => {
    try {
        console.log('[DEBUG] Updating single sessions to pending status...');
        
        const result = await req.db.query(`
            UPDATE class_sessions 
            SET status = 'pending' 
            WHERE series_id IS NULL AND status = 'scheduled'
            RETURNING session_id, status, instructor_id, student_id, session_date
        `);
        
        console.log('[DEBUG] Updated sessions:', result.rows);
        res.json({ 
            message: `Updated ${result.rows.length} single sessions to pending status`,
            updatedSessions: result.rows 
        });
    } catch (error) {
        console.error('Error updating single sessions:', error);
        res.status(500).json({ error: 'Failed to update single sessions' });
    }
});

// Get pending class series and single sessions
router.get('/pending', async (req, res) => {
    try {
        console.log('[DEBUG] Fetching pending class series and single sessions...');
        
        // Debug: Check all class_sessions and their statuses
        const allSessionsDebug = await req.db.query(`
            SELECT session_id, status, series_id, instructor_id, student_id, session_date
            FROM class_sessions
            ORDER BY session_date DESC
            LIMIT 10
        `);
        console.log('[DEBUG] All recent class_sessions:', allSessionsDebug.rows);
        
        // Fetch pending class series
        const seriesResult = await req.db.query(`
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
            JOIN users u_i ON i.instructor_id = u_i.user_id
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u_s ON s.student_id = u_s.user_id
            JOIN subjects sub ON cs.subject_id = sub.subject_id
            WHERE cs.status = 'pending'
            ORDER BY cs.start_date ASC
        `);

        console.log('[DEBUG] Pending class series count:', seriesResult.rows.length);
        console.log('[DEBUG] Pending class series:', seriesResult.rows);

        // Fetch pending single class sessions (not part of a series)
        const singleResult = await req.db.query(`
            SELECT 
                cs.session_id, cs.instructor_id, cs.student_id, cs.subject_id, cs.session_date as start_date, cs.session_date as end_date,
                ARRAY[LOWER(TO_CHAR(cs.session_date, 'Dy'))] as days_of_week,
                cs.start_time, cs.end_time, cs.location, cs.status,
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
            WHERE cs.status = 'pending' AND cs.series_id IS NULL
            ORDER BY cs.session_date ASC
        `);

        console.log('[DEBUG] Pending single sessions count:', singleResult.rows.length);
        console.log('[DEBUG] Pending single sessions:', singleResult.rows);

        // Map single sessions to match class series structure
        const singleSessions = singleResult.rows.map(row => ({
            ...row,
            series_id: null, // For consistency
            num_sessions: 1,
            // days_of_week is already an array
        }));

        // Combine and return
        const combined = [...seriesResult.rows, ...singleSessions];
        console.log('[DEBUG] Combined results count:', combined.length);
        console.log('[DEBUG] Combined results:', combined);
        
        res.json(combined);
    } catch (error) {
        console.error('Error fetching pending class series and single sessions:', error);
        res.status(500).json({ error: 'Failed to fetch pending class series and sessions' });
    }
});

// Get all class series and all single class sessions (for class history)
router.get('/all', async (req, res) => {
    try {
        // Fetch all class series
        const seriesResult = await req.db.query(`
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
            JOIN users u_i ON i.instructor_id = u_i.user_id
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u_s ON s.student_id = u_s.user_id
            JOIN subjects sub ON cs.subject_id = sub.subject_id
            ORDER BY cs.start_date DESC
        `);

        // Fetch all single class sessions (not part of a series)
        const singleResult = await req.db.query(`
            SELECT 
                cs.session_id, cs.instructor_id, cs.student_id, cs.subject_id, cs.session_date as start_date, cs.session_date as end_date,
                ARRAY[LOWER(TO_CHAR(cs.session_date, 'Dy'))] as days_of_week,
                cs.start_time, cs.end_time, cs.location, cs.status,
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
            WHERE cs.series_id IS NULL
            ORDER BY cs.session_date DESC
        `);

        // Map single sessions to match class series structure
        const singleSessions = singleResult.rows.map(row => ({
            ...row,
            series_id: null, // For consistency
            num_sessions: 1,
            // days_of_week is already an array
        }));

        // Combine and return
        const combined = [...seriesResult.rows, ...singleSessions];
        // Sort by start_date descending (in case)
        combined.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        res.json(combined);
    } catch (error) {
        console.error('Error fetching all class series and sessions:', error);
        res.status(500).json({ error: 'Failed to fetch all class series and sessions' });
    }
});

// Create new class series
router.post('/', authenticateToken, requireUtcIso(['start_date', 'end_date']), classSeriesValidation, async (req, res) => {
    const client = await req.db.connect();
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
            notes,
            sessions
        } = req.body;

        let sessionsToInsert = [];
        if (Array.isArray(sessions) && sessions.length > 0) {
            // Validate each session
            for (const [i, session] of sessions.entries()) {
                if (!session.session_date || !session.start_time || !session.end_time) {
                    return res.status(400).json({ error: `Session ${i + 1} is missing required fields` });
                }
                // Check instructor availability for this session
                // Convert JavaScript day to database day format
                // JavaScript getDay(): 0=Sunday, 1=Monday, 2=Tuesday, etc.
                // Database format: 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
                
                // Fix timezone issue by ensuring we parse the date correctly
                // Add 'T00:00:00' to ensure it's parsed as local time, not UTC
                const dateString = `${session.session_date}T00:00:00`;
                const dateObj = new Date(dateString);
                const jsDay = dateObj.getDay();
                const dayMap = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
                const dayOfWeek = dayMap[jsDay];
                
                // Debug: Let's verify the date calculation
                console.log(`[DEBUG] Session date: ${session.session_date}`);
                console.log(`[DEBUG] Date string: ${dateString}`);
                console.log(`[DEBUG] JavaScript getDay(): ${jsDay}`);
                console.log(`[DEBUG] Calculated dayOfWeek: ${dayOfWeek}`);
                
                const avail = await client.query(`
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
                `, [
                    instructor_id,
                    dayOfWeek,
                    session.start_time,
                    session.end_time,
                    session.session_date
                ]);
                
                if (avail.rows.length === 0) {
                    // Add debugging information
                    console.log(`[DEBUG] Availability check failed for instructor ${instructor_id} on ${session.session_date} (${session.start_time} - ${session.end_time})`);
                    console.log(`[DEBUG] Day of week: ${dayOfWeek}`);
                    
                    // Check what availability exists for this instructor and day
                    const allAvail = await client.query(`
                        SELECT * FROM instructor_availability 
                        WHERE instructor_id = $1 AND day_of_week = $2
                    `, [instructor_id, dayOfWeek]);
                    console.log(`[DEBUG] All availability for instructor ${instructor_id} on ${dayOfWeek}:`, allAvail.rows);
                    
                    return res.status(400).json({ 
                        error: `Instructor is not available for session on ${session.session_date} (${session.start_time} - ${session.end_time})`,
                        debug: {
                            dayOfWeek: dayOfWeek,
                            instructorId: instructor_id,
                            sessionDate: session.session_date,
                            startTime: session.start_time,
                            endTime: session.end_time,
                            availableSlots: allAvail.rows
                        }
                    });
                }
                sessionsToInsert.push({
                    instructor_id,
                    student_id,
                    subject_id,
                    session_date: session.session_date,
                    start_time: session.start_time,
                    end_time: session.end_time,
                    location,
                    status: 'scheduled',
                    credits_cost: 1
                });
            }
        } else {
            // Fallback: generate sessions from pattern (legacy)
        let currentDate = new Date(start_date);
        const endDate = new Date(end_date);
        while (currentDate <= endDate) {
            const dayMap = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
            const dayOfWeek = dayMap[currentDate.getDay()];
            if (days_of_week.includes(dayOfWeek)) {
                    sessionsToInsert.push({
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
        }

        // Create class series (keep start_time/end_time for reference, but sessions can vary)
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
            req.user?.staff_id || null, // Make it optional
            start_date,
            end_date,
            days_of_week,
            start_time,
            end_time,
            location,
            notes,
            sessionsToInsert.length
        ]);

        // Generate individual sessions
        const series = seriesResult.rows[0];

        // Insert all sessions
        for (const session of sessionsToInsert) {
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
                    status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                series.series_id,
                session.instructor_id,
                session.student_id,
                session.subject_id,
                session.session_date,
                session.start_time,
                session.end_time,
                session.location,
                session.status
            ]);
        }

        await client.query('COMMIT');
        res.status(201).json(series);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating class series:', error);
        console.error('Request body:', req.body);
        res.status(500).json({ error: 'Failed to create class series', details: error.message });
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

        const result = await req.db.query(`
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
    const client = await req.db.connect();
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

// Get suggested time slots for a specific instructor
router.get('/suggested-slots/:instructorId', authenticateToken, async (req, res) => {
    const client = await req.db.connect();
    try {
        const { instructorId } = req.params;
        const { student_id, subject_id, duration_minutes = 60 } = req.query;

        if (!student_id || !subject_id) {
            return res.status(400).json({ 
                error: 'Student ID and Subject ID are required' 
            });
        }

        // Validate scheduling request
        const creditInfo = await validateSchedulingRequest(
            client, student_id, instructorId, subject_id, duration_minutes
        );

        // Get instructor availability
        const availabilityQuery = `
            SELECT 
                ia.availability_id,
                ia.day_of_week,
                ia.start_time,
                ia.end_time,
                ia.type,
                ia.notes
            FROM instructor_availability ia
            WHERE ia.instructor_id = $1
            AND ia.status = 'active'
            AND (ia.start_date IS NULL OR ia.start_date <= CURRENT_DATE + INTERVAL '14 days')
            AND (ia.end_date IS NULL OR ia.end_date >= CURRENT_DATE)
            ORDER BY 
                CASE ia.day_of_week 
                    WHEN 'sun' THEN 1 
                    WHEN 'mon' THEN 2 
                    WHEN 'tue' THEN 3 
                    WHEN 'wed' THEN 4 
                    WHEN 'thu' THEN 5 
                    WHEN 'fri' THEN 6 
                    WHEN 'sat' THEN 7 
                END,
                ia.start_time
        `;

        const availabilityResult = await client.query(availabilityQuery, [instructorId]);
        
        if (availabilityResult.rows.length === 0) {
            return res.json({ 
                timeSlots: [],
                message: 'No availability found for this instructor',
                studentTime: creditInfo.totalMinutes,
                timeNeeded: creditInfo.minutesNeeded
            });
        }

        // Generate time slots
        const suggestedSlots = await generateTimeSlots(
            client, 
            availabilityResult.rows, 
            duration_minutes, 
            instructorId, 
            student_id
        );

        // Add time information to each slot
        const slotsWithTime = suggestedSlots.map(slot => ({
            ...slot,
            timeNeeded: creditInfo.minutesNeeded
        }));

        // Limit to first 20 slots to avoid overwhelming the UI
        const limitedSlots = slotsWithTime.slice(0, 20);

        res.json({
            timeSlots: limitedSlots,
            totalFound: suggestedSlots.length,
            studentTime: creditInfo.totalMinutes,
            timeNeeded: creditInfo.minutesNeeded,
            message: limitedSlots.length > 0 
                ? `Found ${limitedSlots.length} available time slots` 
                : 'No available time slots found'
        });

    } catch (error) {
        console.error('Error fetching suggested time slots:', error);
        res.status(500).json({ 
            error: 'Failed to fetch suggested time slots',
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// Smart scheduling endpoint - matches students with instructors based on preferences
router.post('/smart-schedule', authenticateToken, [
    body('student_id').isInt().withMessage('Student ID must be a valid integer'),
    body('subject_id').isInt().withMessage('Subject ID must be a valid integer'),
    body('preferred_days').isArray().withMessage('Preferred days must be an array'),
    body('preferred_days.*').isIn(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']).withMessage('Invalid day format'),
    body('preferred_start_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format'),
    body('preferred_end_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format'),
    body('duration_minutes').optional().isInt({ min: 30, max: 120 }).withMessage('Duration must be between 30 and 120 minutes')
], async (req, res) => {
    const client = await req.db.connect();
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                error: 'Validation failed', 
                details: errors.array() 
            });
        }

        const {
            student_id,
            subject_id,
            preferred_days,
            preferred_start_time,
            preferred_end_time,
            duration_minutes = 60
        } = req.body;

        // Validate time range
        if (preferred_start_time >= preferred_end_time) {
            return res.status(400).json({ 
                error: 'Preferred start time must be before end time' 
            });
        }

        // Check if student exists and is active
        const studentCheck = await client.query(`
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
        const subjectCheck = await client.query(`
            SELECT subject_id, name FROM subjects WHERE subject_id = $1
        `, [subject_id]);

        if (subjectCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        // Find smart scheduling matches
        const matches = await findSmartSchedulingMatches(
            client, student_id, subject_id, preferred_days, 
            preferred_start_time, preferred_end_time, duration_minutes
        );

        // Get student time information (for display only, not validation)
        const studentTime = await client.query(`
            SELECT COALESCE(SUM(minutes_remaining), 0) as total_minutes
            FROM student_time_packages 
            WHERE student_id = $1 AND expiration_date >= CURRENT_DATE
        `, [student_id]);

        const totalMinutes = parseInt(studentTime.rows[0].total_minutes);

        // Group matches by quality
        const exactMatches = matches.filter(match => match.matchQuality === 'exact');
        const alternateMatches = matches.filter(match => match.matchQuality === 'alternate');

        // Limit results to top 20 matches
        const topMatches = matches.slice(0, 20);

        res.json({
            success: true,
            student: {
                id: studentCheck.rows[0].student_id,
                name: studentCheck.rows[0].name
            },
            subject: {
                id: subjectCheck.rows[0].subject_id,
                name: subjectCheck.rows[0].name
            },
            preferences: {
                days: preferred_days,
                startTime: preferred_start_time,
                endTime: preferred_end_time,
                duration: duration_minutes
            },
            matches: {
                exact: exactMatches.length,
                alternate: alternateMatches.length,
                total: matches.length
            },
            timeSlots: topMatches,
            time: {
                available: totalMinutes,
                needed: duration_minutes,
                availableHours: (totalMinutes / 60).toFixed(1),
                neededHours: (duration_minutes / 60).toFixed(1),
                sufficient: totalMinutes >= duration_minutes
            }
        });

    } catch (error) {
        console.error('Smart scheduling error:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to find scheduling matches' 
        });
    } finally {
        client.release();
    }
});

export default router; 