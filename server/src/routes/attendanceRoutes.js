import express from 'express';
import { body } from 'express-validator';
// import pool from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { toUtcIso, assertUtcIso } from '../lib/time.js';
import { requireUtcIso } from '../middleware/requireUtcIso.js';

const router = express.Router();

// Validation middleware
const attendanceValidation = [
    body('session_id').isInt().withMessage('Session ID must be a valid integer'),
    body('student_id').isInt().withMessage('Student ID must be a valid integer'),
    body('attended').isBoolean().withMessage('Attendance status must be a boolean'),
    body('notes').optional().isString().withMessage('Notes must be a string')
];

// Helper function to calculate session duration in minutes
const calculateSessionDuration = (sessionStart, sessionEnd) => {
    const start = new Date(sessionStart);
    const end = new Date(sessionEnd);
    return Math.round((end - start) / (1000 * 60)); // Convert to minutes
};

// Mark attendance for a class session
router.post('/mark', authenticateToken, attendanceValidation, async (req, res) => {
    const client = await req.db.connect();
    try {
        const { session_id, student_id, attended, notes } = req.body;

        // Check if session exists and is scheduled
        const sessionCheck = await client.query(`
            SELECT 
                cs.session_id,
                cs.session_start,
                cs.session_end,
                cs.status,
                s.name as student_name,
                i.name as instructor_name
            FROM class_sessions cs
            JOIN students s ON cs.student_id = s.student_id
            JOIN users u1 ON s.student_id = u1.user_id
            JOIN instructors i ON cs.instructor_id = i.instructor_id
            JOIN users u2 ON i.instructor_id = u2.user_id
            WHERE cs.session_id = $1 AND cs.student_id = $2
        `, [session_id, student_id]);

        if (sessionCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Class session not found' });
        }

        const session = sessionCheck.rows[0];

        if (session.status !== 'scheduled') {
            return res.status(400).json({ 
                error: `Cannot mark attendance for session with status: ${session.status}` 
            });
        }

        // Check if attendance already exists
        const existingAttendance = await client.query(`
            SELECT * FROM attendance 
            WHERE session_id = $1 AND student_id = $2
        `, [session_id, student_id]);

        if (existingAttendance.rows.length > 0) {
            return res.status(400).json({ error: 'Attendance already marked for this session' });
        }

        await client.query('BEGIN');

        // Insert attendance record
        await client.query(`
            INSERT INTO attendance (session_id, student_id, attended, notes)
            VALUES ($1, $2, $3, $4)
        `, [session_id, student_id, attended, notes || null]);

        // If student attended, deduct time and log deduction
        if (attended) {
            // Calculate session duration in minutes
            const sessionDurationMinutes = calculateSessionDuration(session.session_start, session.session_end);

            // Check if student has sufficient time packages
            const studentTimePackages = await client.query(`
                SELECT 
                    stp.purchase_id,
                    stp.minutes_remaining,
                    stp.expiration_date,
                    tp.name as package_name
                FROM student_time_packages stp
                JOIN time_packages tp ON stp.time_package_id = tp.time_package_id
                WHERE stp.student_id = $1 
                AND stp.minutes_remaining > 0
                AND stp.expiration_date >= CURRENT_DATE
                ORDER BY stp.expiration_date ASC
            `, [student_id]);

            if (studentTimePackages.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ 
                    error: 'Student has no available time packages for this session' 
                });
            }

            const totalAvailableMinutes = studentTimePackages.rows.reduce(
                (sum, pkg) => sum + parseInt(pkg.minutes_remaining), 0
            );

            if (totalAvailableMinutes < sessionDurationMinutes) {
                await client.query('ROLLBACK');
                return res.status(400).json({ 
                    error: `Insufficient time. Student has ${(totalAvailableMinutes / 60).toFixed(1)} hours, needs ${(sessionDurationMinutes / 60).toFixed(1)} hours for this session` 
                });
            }

            // Deduct time from oldest packages first
            let minutesToDeduct = sessionDurationMinutes;
            for (const timePackage of studentTimePackages.rows) {
                if (minutesToDeduct <= 0) break;

                const minutesFromThisPackage = Math.min(
                    minutesToDeduct, 
                    parseInt(timePackage.minutes_remaining)
                );

                // Update student time package
                await client.query(`
                    UPDATE student_time_packages 
                    SET minutes_remaining = minutes_remaining - $1
                    WHERE purchase_id = $2
                `, [minutesFromThisPackage, timePackage.purchase_id]);

                // Log time deduction
                await client.query(`
                    INSERT INTO time_deductions (
                        student_id, 
                        session_id, 
                        time_package_id, 
                        minutes_used, 
                        deducted_at
                    )
                    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                `, [student_id, session_id, timePackage.purchase_id, minutesFromThisPackage]);

                minutesToDeduct -= minutesFromThisPackage;
            }

            // Update session status to completed
            await client.query(`
                UPDATE class_sessions 
                SET status = 'completed'
                WHERE session_id = $1
            `, [session_id]);
        } else {
            // If student didn't attend, mark session as canceled
            await client.query(`
                UPDATE class_sessions 
                SET status = 'canceled',
                cancellation_reason = 'Student marked as not attended'
                WHERE session_id = $1
            `, [session_id]);
        }

        await client.query('COMMIT');

        // Get updated time balance
        const updatedTime = await client.query(`
            SELECT COALESCE(SUM(minutes_remaining), 0) as total_minutes
            FROM student_time_packages 
            WHERE student_id = $1 AND expiration_date >= CURRENT_DATE
        `, [student_id]);

        const totalMinutes = parseInt(updatedTime.rows[0].total_minutes);
        const sessionDurationMinutes = attended ? calculateSessionDuration(session.session_start, session.session_end) : 0;

        res.json({
            success: true,
            message: `Attendance marked successfully. Student ${attended ? 'attended' : 'did not attend'}.`,
            session: {
                id: session.session_id,
                start: session.session_start,
                end: session.session_end,
                instructor: session.instructor_name,
                student: session.student_name
            },
            attendance: {
                attended,
                notes: notes || null
            },
            time: {
                deducted: sessionDurationMinutes,
                remaining: totalMinutes,
                remainingHours: (totalMinutes / 60).toFixed(1)
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error marking attendance:', error);
        res.status(500).json({ 
            error: error.message || 'Failed to mark attendance' 
        });
    } finally {
        client.release();
    }
});

// Get attendance for a session
router.get('/session/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;

        const result = await req.db.query(`
            SELECT 
                a.session_id,
                a.student_id,
                a.attended,
                a.notes,
                a.created_at,
                s.name as student_name,
                cs.session_start,
                cs.session_end,
                cs.status as session_status
            FROM attendance a
            JOIN students s ON a.student_id = s.student_id
            JOIN users u ON s.student_id = u.user_id
            JOIN class_sessions cs ON a.session_id = cs.session_id
            WHERE a.session_id = $1
            ORDER BY a.created_at DESC
        `, [sessionId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

// Get attendance history for a student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const result = await req.db.query(`
            SELECT 
                a.session_id,
                a.attended,
                a.notes,
                a.created_at,
                cs.session_start,
                cs.session_end,
                cs.status as session_status,
                sub.name as subject_name,
                i.name as instructor_name
            FROM attendance a
            JOIN class_sessions cs ON a.session_id = cs.session_id
            JOIN subjects sub ON cs.subject_id = sub.subject_id
            JOIN instructors i ON cs.instructor_id = i.instructor_id
            JOIN users u ON i.instructor_id = u.user_id
            WHERE a.student_id = $1
            ORDER BY cs.session_start DESC
            LIMIT $2 OFFSET $3
        `, [studentId, limit, offset]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).json({ error: 'Failed to fetch student attendance' });
    }
});

// Get attendance summary for a student
router.get('/student/:studentId/summary', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;

        const result = await req.db.query(`
            SELECT 
                COUNT(*) as total_sessions,
                COUNT(CASE WHEN a.attended = true THEN 1 END) as attended_sessions,
                COUNT(CASE WHEN a.attended = false THEN 1 END) as missed_sessions,
                ROUND(
                    COUNT(CASE WHEN a.attended = true THEN 1 END) * 100.0 / COUNT(*), 
                    2
                ) as attendance_rate
            FROM attendance a
            JOIN class_sessions cs ON a.session_id = cs.session_id
            WHERE a.student_id = $1
        `, [studentId]);

        const summary = result.rows[0] || {
            total_sessions: 0,
            attended_sessions: 0,
            missed_sessions: 0,
            attendance_rate: 0
        };

        res.json(summary);
    } catch (error) {
        console.error('Error fetching attendance summary:', error);
        res.status(500).json({ error: 'Failed to fetch attendance summary' });
    }
});

export default router; 