import express from 'express';
import { body, validationResult } from 'express-validator';
import { 
    login, 
    signup, 
    verifyTokenHandler, 
    refreshToken, 
    logout,
    changePassword 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware
const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// Base validation rules for all users
const baseValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').optional().matches(/^\+?[\d\s-]+$/).withMessage('Invalid phone number'),
    body('role').isIn(['student', 'instructor', 'staff']).withMessage('Invalid role')
];

// Student-specific validation (schema v2, Phase 7.4): date_of_birth replaces
// age; guardians are first-class logins so each needs an email (dedupe key).
const studentValidation = [
    ...baseValidation,
    body('date_of_birth').optional().isISO8601().withMessage('date_of_birth must be an ISO date'),
    body('grade').isInt({ min: 1, max: 12 }).withMessage('Grade must be between 1 and 12'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('school').notEmpty().withMessage('School is required'),
    body('status').optional().isIn(['enrolled', 'on_trial']).withMessage('Invalid status'),
    body('pa_code').optional(),
    // Guardian validation — optional (adult students, GRD-4); guardians become
    // users (role=guardian), so email is required as the account/dedupe key
    body('guardians').optional().isArray().withMessage('Guardians must be an array'),
    body('guardians.*.name').notEmpty().withMessage('Guardian name is required'),
    body('guardians.*.email').isEmail().withMessage('Guardian email is required'),
    body('guardians.*.phone').optional().matches(/^\+?[\d\s-]+$/).withMessage('Invalid guardian phone number'),
    body('guardians.*.relationship').isIn(['parent', 'guardian', 'grandparent', 'other']).withMessage('Invalid guardian relationship')
];

// Instructor-specific validation
const instructorValidation = [
    ...baseValidation,
    body('age').isInt({ min: 18 }).withMessage('Instructor must be at least 18 years old'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('college_attended').notEmpty().withMessage('College/University is required'),
    body('major').notEmpty().withMessage('Major/Field of study is required')
];

// Staff-specific validation
const staffValidation = [
    ...baseValidation,
    body('age').isInt({ min: 18 }).withMessage('Staff must be at least 18 years old'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('department').notEmpty().withMessage('Department is required'),
    body('employment_status').optional().isIn(['full_time', 'part_time', 'contract', 'temporary']).withMessage('Invalid employment status'),
    body('salary').optional().isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
    body('hourly_rate').optional().isFloat({ min: 0 }).withMessage('Hourly rate must be a positive number')
];

const changePasswordValidation = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

const refreshTokenValidation = [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
];

// Custom validation middleware to apply role-specific validation
const roleBasedValidation = async (req, res, next) => {
    try {
        const role = req.body.role;
        let validationRules;

        switch (role) {
            case 'student':
                validationRules = studentValidation;
                break;
            case 'instructor':
                validationRules = instructorValidation;
                break;
            case 'staff':
                validationRules = staffValidation;
                break;
            default:
                validationRules = baseValidation;
        }

        await Promise.all(validationRules.map(validation => validation.run(req)));
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation error',
                errors: errors.array().map(err => ({
                    field: err.param,
                    message: err.msg
                }))
            });
        }
        next();
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({
            message: 'Error during validation',
            error: error.message
        });
    }
};

// Public routes
router.post('/login', loginValidation, validateRequest, login);
router.post('/register', roleBasedValidation, signup);
router.get('/verify', verifyTokenHandler);
router.post('/refresh-token', refreshTokenValidation, validateRequest, refreshToken);

// Authenticated routes (mounted in MODERNIZATION 2.5)
router.post('/change-password', authenticateToken, changePasswordValidation, validateRequest, changePassword);
router.post('/logout', authenticateToken, logout);

export default router; 