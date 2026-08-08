import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { getStudentRoster } from '../controllers/studentController.js';

const router = express.Router();

// Staff-only: both routes return every student's PII (name/email/phone).
// The v2 per-student surfaces (schedule/record/guardians/purchasing) live
// in studentGuardianV2Routes.js with their own canActForStudent-style
// checks; nothing student/guardian-facing reads from this router.
//
// Removed (2026-08-08): the legacy v1 handlers that used to live here —
// GET /:id (joined the singular `student_guardian` table and
// `class_sessions.student_id`, neither of which exists in schema v2),
// POST / and PUT /:id (inserted/updated v1-only columns like `user_id`,
// `age`, `guardian_contact`), and the /:id/time-packages + /:id/time-balance
// routes (dropped v1 tables — wallets/credit_ledger replaced them). All
// would 500 if hit and had zero client callers.
router.use(authenticateToken, authorizeRole('staff'));

// Get student roster
router.get('/roster', getStudentRoster);

// Get all students
router.get('/', async (req, res) => {
    try {
        const result = await req.db.query(`
            SELECT s.*, u.name, u.email, u.phone
            FROM students s
            JOIN users u ON s.student_id = u.user_id
            WHERE u.is_active = true
            ORDER BY u.name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            error: 'Failed to fetch students',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;
