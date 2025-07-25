import bcrypt from 'bcryptjs';
// import pool from '../config/db.js';

// Common passwords to disallow (this should be much larger in production)
const COMMON_PASSWORDS = [
    'password', 'password123', '123456', 'qwerty',
    'letmein', 'admin', 'welcome', 'monkey'
];

// Validate password strength
export const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isCommonPassword = COMMON_PASSWORDS.includes(password.toLowerCase());

    const isValid = password.length >= minLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar &&
        !isCommonPassword;

    return {
        isValid,
        errors: !isValid ? [
            ...(password.length < minLength ? ['Password must be at least 8 characters long'] : []),
            ...(!hasUpperCase ? ['Password must contain at least one uppercase letter'] : []),
            ...(!hasLowerCase ? ['Password must contain at least one lowercase letter'] : []),
            ...(!hasNumbers ? ['Password must contain at least one number'] : []),
            ...(!hasSpecialChar ? ['Password must contain at least one special character'] : []),
            ...(isCommonPassword ? ['Password is too common. Please choose a more unique password'] : [])
        ] : []
    };
};

// Check if password is expired
export const isPasswordExpired = async (userId) => {
    try {
        const result = await db.query(`
            SELECT 
                CASE 
                    WHEN password_updated_at < NOW() - INTERVAL '90 days' THEN true 
                    ELSE false 
                END as is_expired,
                password_updated_at
            FROM users 
            WHERE user_id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        return {
            isExpired: result.rows[0].is_expired,
            lastUpdated: result.rows[0].password_updated_at
        };
    } catch (error) {
        console.error('Error checking password expiration:', error);
        throw error;
    }
}; 