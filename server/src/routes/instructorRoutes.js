import express from 'express';
import { body, validationResult } from 'express-validator';
import { getInstructorRoster, updateInstructor } from '../controllers/instructorController.js';
import { requireUtcIso } from '../middleware/requireUtcIso.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
const router = express.Router();

// SECURITY FIX: this entire router previously had zero auth middleware —
// every route (including instructor CRUD and availability writes) was
// reachable by anyone who sent a valid X-Institution-Code header, no
// login required. Baseline auth for every route; GET routes stay open to
// any authenticated role since real student/guardian booking flows
// (family/StudentClasses.jsx, family/BookSession.jsx, etc.) read from
// here. Mutations are staff-only, except availability/unavailability
// writes which an instructor may also do for themselves (both
// InstructorRoster.jsx (staff) and the instructor's own Availability.jsx
// call the same endpoints).
router.use(authenticateToken);

function staffOrSelf(req, res, next) {
  if (req.user.role === 'staff') return next();
  if (req.user.role === 'instructor' && Number(req.params.id) === req.user.user_id) return next();
  return res.status(403).json({ message: 'Not authorized' });
}

const availabilityValidation = [
    body('day_of_week').isIn(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])
        .withMessage('Valid day of week is required'),
    // HH:MM with optional :SS — DB TIME values round-trip as HH:MM:SS
    body('start_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('Start time must be in HH:MM format'),
    body('end_time').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/)
        .withMessage('End time must be in HH:MM format'),
    body('type').optional().isIn(['default', 'preferred', 'emergency'])
        .withMessage('Type must be default, preferred, or emergency'),
    body('status').optional().isIn(['active', 'inactive'])
        .withMessage('Status must be active or inactive'),
    body('start_date').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('end_date').optional().isISO8601().withMessage('End date must be a valid date'),
    body('notes').optional().isString().withMessage('Notes must be a string')
];

// The validation chains above collect errors; this actually enforces them
// (previously nothing read validationResult, so the chain was decorative).
function handleValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
    }
    next();
}

// Get instructor roster
router.get('/roster', getInstructorRoster);

// Get all instructors (full contact list — staff only; the sole client
// caller is the staff Scheduling page)
router.get('/', authorizeRole('staff'), async (req, res) => {
    try {
        // Paginated with a hard ceiling (see studentRoutes for rationale) —
        // an unbounded list grows with staff headcount. Default/cap 500.
        const limit = Math.min(Math.max(Number(req.query.limit) || 500, 1), 500);
        const offset = Math.max(Number(req.query.offset) || 0, 0);
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
            LIMIT $1 OFFSET $2
        `, [limit, offset]);
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

        // SECURITY: for non-staff callers, strip only the genuinely
        // sensitive fields (contact, pay, demographics). Non-PII fields
        // stay — students/guardians resolve the display name, and the
        // instructor's own "My classes" page derives its class list from
        // upcoming_sessions, so dropping those broke it. An instructor
        // viewing their OWN record gets everything.
        const row = result.rows[0];
        const isSelf = req.user.role === 'instructor' && req.user.user_id === Number(id);
        if (req.user.role !== 'staff' && !isSelf) {
            const { email, phone, salary, hourly_rate, date_of_birth, gender,
                    employment_type, ...safe } = row;
            return res.json(safe);
        }

        res.json(row);
    } catch (error) {
        console.error('Error fetching instructor:', error);
        res.status(500).json({ error: 'Failed to fetch instructor' });
    }
});

// Removed (2026-08-08): the legacy v1 POST / handler — it inserted
// v1-only columns (user_id, max_weekly_hours, specialization, biography,
// hire_date; v2 keys instructors by instructor_id and has none of those)
// and checked users.is_deleted, which v2 replaced with is_active. It
// would 500 if hit and had zero client callers — instructor records are
// created by registration (authRoutes signup).

// Update instructor - using new controller function
router.put('/:id', authorizeRole('staff'), updateInstructor);

// Add availability
router.post('/:id/availability', staffOrSelf, requireUtcIso(['start_date', 'end_date']), availabilityValidation, handleValidation, async (req, res) => {
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

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching availability:', error);
        res.status(500).json({ error: 'Failed to fetch availability' });
    }
});

// Update availability slot (same validation as the POST — this route
// previously accepted anything)
router.put('/:id/availability/:availabilityId', staffOrSelf, requireUtcIso(['start_date', 'end_date']), availabilityValidation, handleValidation, async (req, res) => {
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
router.delete('/:id/availability/:availabilityId', staffOrSelf, async (req, res) => {
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

// Add unavailability (time off) — datetimes cross the API boundary, so the
// repo-wide UTC ISO-Z convention applies
router.post('/:id/unavailability', staffOrSelf, requireUtcIso(['start_datetime', 'end_datetime']), async (req, res) => {
    try {
        const { id } = req.params;
        const { start_datetime, end_datetime, reason } = req.body;

        if (!start_datetime || !end_datetime) {
            return res.status(400).json({ error: 'start_datetime and end_datetime are required' });
        }

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
router.delete('/:id/unavailability/:unavailabilityId', staffOrSelf, async (req, res) => {
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

// Note: a legacy '/:id/schedule' handler used to live here — it queried
// class_sessions.session_start/session_end/student_id/subject_id and a
// class_series table, none of which exist in the real v2 schema (v2 uses
// starts_at/ends_at, and instructor↔class↔session relationships flow
// through classes + enrollments). It predated schema v2, had zero real
// callers, and would 500 if ever hit. Real instructor schedule reads live
// on GET /instructors/me/sessions (instructorCalendarRoutes.js) and, for
// staff looking up any instructor's week, GET /instructors/:id's own
// upcoming_sessions field.

export default router;
