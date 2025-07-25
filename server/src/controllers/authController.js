import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateTokens, verifyAccessToken, verifyRefreshToken } from '../helpers/authHelpers.js';
import { validatePasswordStrength } from '../helpers/passwordHelpers.js';
import { checkPasswordHistory, addToPasswordHistory } from '../helpers/passwordHistoryHelpers.js';

// Token verification endpoint handler
export const verifyTokenHandler = async (req, res) => {
    const client = await req.db.connect();
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                valid: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);
        if (!decoded) {
            return res.status(401).json({ 
                valid: false,
                message: 'Invalid or expired token'
            });
        }

        // Check if user exists and is active
        const result = await req.db.query(
            'SELECT user_id, name, email, role, is_active FROM users WHERE user_id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                valid: false,
                message: 'User not found'
            });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(401).json({
                valid: false,
                message: 'Account is inactive'
            });
        }

        // Token is valid and user exists
        res.json({ 
            valid: true,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            valid: false,
            message: 'Error verifying token',
            error: error.message
        });
    } finally {
        client.release();
    }
};

export const signup = async (req, res) => {
    const client = await req.db.connect();
    
    try {
        const {
            password,
            name,
            email,
            phone,
            role,
            // Role-specific fields
            status,          // for students
            age,            // for students/staff/instructors
            grade,          // for students
            gender,         // for students/staff/instructors
            school,         // for students
            pa_code,        // for students
            guardians,      // for students
            department,     // for staff
            employment_status, // for staff
            salary,         // for staff
            hourly_rate,    // for staff
            college_attended, // for instructors
            major           // for instructors
        } = req.body;

        // Start transaction
        await client.query('BEGIN');

        // Check if email already exists
        const emailCheck = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({
                message: 'Email already registered',
                errors: [{
                    field: 'email',
                    message: 'This email address is already registered'
                }]
            });
        }

        // Validate role-specific required fields
        if (role === 'student') {
            if (!guardians || !Array.isArray(guardians) || guardians.length === 0) {
                return res.status(400).json({
                    message: 'Validation error',
                    errors: [{
                        field: 'guardians',
                        message: 'At least one guardian is required'
                    }]
                });
            }

            // Validate each guardian
            for (let i = 0; i < guardians.length; i++) {
                const guardian = guardians[i];
                if (!guardian.name || !guardian.phone || !guardian.relationship) {
                    return res.status(400).json({
                        message: 'Validation error',
                        errors: [{
                            field: `guardians[${i}]`,
                            message: 'Guardian name, phone, and relationship are required'
                        }]
                    });
                }
            }
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const userResult = await client.query(
            `INSERT INTO users (password_hash, name, email, phone, role, is_active)
             VALUES ($1, $2, $3, $4, $5, true)
             RETURNING *`,
            [hashedPassword, name, email, phone, role]
        );

        const user = userResult.rows[0];

        // Create role-specific records
        if (role === 'student') {
            try {
                // Create student record first
                await client.query(
                    `INSERT INTO students (
                        student_id,
                        status,
                        age,
                        grade,
                        gender,
                        school,
                        pa_code
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        user.user_id,
                        status || 'enrolled',
                        age,
                        grade,
                        gender,
                        school,
                        pa_code
                    ]
                );

                // Handle multiple guardians
                if (guardians && guardians.length > 0) {
                    for (const guardian of guardians) {
                        try {
                            // Create guardian record
                            const guardianResult = await client.query(
                                `INSERT INTO guardians (name, phone, email, relationship)
                                 VALUES ($1, $2, $3, $4)
                                 RETURNING guardian_id`,
                                [guardian.name, guardian.phone, guardian.email, guardian.relationship]
                            );
                            const guardianId = guardianResult.rows[0].guardian_id;

                            // Create the student-guardian relationship
                            await client.query(
                                `INSERT INTO student_guardian (student_id, guardian_id)
                                 VALUES ($1, $2)`,
                                [user.user_id, guardianId]
                            );
                        } catch (guardianError) {
                            console.error('Guardian creation error:', guardianError);
                            throw {
                                status: 400,
                                message: 'Error creating guardian record',
                                errors: [{
                                    field: 'guardians',
                                    message: `Failed to create guardian: ${guardianError.message}`
                                }]
                            };
                        }
                    }
                }
            } catch (studentError) {
                console.error('Student creation error:', studentError);
                throw {
                    status: 400,
                    message: 'Error creating student record',
                    errors: [{
                        field: 'student',
                        message: `Failed to create student record: ${studentError.message}`
                    }]
                };
            }
        } else if (role === 'instructor') {
            try {
                await client.query(
                    `INSERT INTO instructors (
                        instructor_id,
                        age,
                        gender,
                        college_attended,
                        major
                    ) VALUES ($1, $2, $3, $4, $5)`,
                    [user.user_id, age, gender, college_attended, major]
                );
            } catch (instructorError) {
                console.error('Instructor creation error:', instructorError);
                throw {
                    status: 400,
                    message: 'Error creating instructor record',
                    errors: [{
                        field: 'instructor',
                        message: `Failed to create instructor record: ${instructorError.message}`
                    }]
                };
            }
        } else if (role === 'staff') {
            try {
                await client.query(
                    `INSERT INTO staff (
                        staff_id,
                        department,
                        employment_status,
                        salary,
                        hourly_rate,
                        age,
                        gender
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        user.user_id,
                        department,
                        employment_status || 'full_time',
                        salary,
                        hourly_rate,
                        age,
                        gender
                    ]
                );
            } catch (staffError) {
                console.error('Staff creation error:', staffError);
                throw {
                    status: 400,
                    message: 'Error creating staff record',
                    errors: [{
                        field: 'staff',
                        message: `Failed to create staff record: ${staffError.message}`
                    }]
                };
            }
        }

        // Commit transaction
        await client.query('COMMIT');

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);

        // Send response
        res.status(201).json({
            message: 'User created successfully',
            token: accessToken,
            refreshToken,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Signup error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            constraint: error.constraint,
            detail: error.detail,
            schema: error.schema,
            table: error.table,
            column: error.column,
            dataType: error.dataType,
            body: JSON.stringify(req.body, null, 2)
        });

        // If it's our custom error with status and errors array
        if (error.status && error.errors) {
            return res.status(error.status).json({
                message: error.message,
                errors: error.errors
            });
        }

        // Handle database constraint violations
        if (error.code === '23505') { // unique_violation
            return res.status(400).json({
                message: 'Database constraint violation',
                errors: [{
                    field: error.constraint || 'unknown',
                    message: error.detail || 'A record with this value already exists'
                }]
            });
        }

        // Handle database foreign key violations
        if (error.code === '23503') { // foreign_key_violation
            return res.status(400).json({
                message: 'Database reference error',
                errors: [{
                    field: error.constraint || 'unknown',
                    message: error.detail || 'Referenced record does not exist'
                }]
            });
        }

        // Handle data type violations
        if (error.code === '22P02') { // invalid_text_representation
            return res.status(400).json({
                message: 'Invalid data type',
                errors: [{
                    field: error.column || 'unknown',
                    message: error.detail || 'Invalid data type for field'
                }]
            });
        }

        // Handle not-null violations
        if (error.code === '23502') { // not_null_violation
            return res.status(400).json({
                message: 'Missing required field',
                errors: [{
                    field: error.column || 'unknown',
                    message: `${error.column} is required`
                }]
            });
        }

        // Handle check constraint violations
        if (error.code === '23514') { // check_violation
            return res.status(400).json({
                message: 'Invalid value',
                errors: [{
                    field: error.constraint || 'unknown',
                    message: error.detail || 'Value violates check constraint'
                }]
            });
        }

        // Handle other database errors
        if (error.code) {
            return res.status(400).json({
                message: 'Database error',
                errors: [{
                    field: 'database',
                    message: `Database error: ${error.message}`,
                    detail: error.detail || '',
                    code: error.code
                }]
            });
        }

        // Generic error response
        res.status(500).json({
            message: 'Error creating user',
            errors: [{
                field: 'general',
                message: error.message,
                detail: error.detail || ''
            }]
        });
    } finally {
        client.release();
    }
};

export const login = async (req, res) => {
    // Debug logs for session and institution code
    console.log('--- LOGIN ATTEMPT ---');
    console.log('Session ID:', req.sessionID);
    console.log('Session:', req.session);
    console.log('Institution code in session:', req.session?.tenantCode);
    // Guard for req.db
    if (!req.db) {
        console.error('No req.db found. Likely missing or invalid institution code or session.');
        return res.status(400).json({ error: 'No institution selected or DB unavailable.' });
    }
    const client = await req.db.connect();
    
    try {
        const { email, password } = req.body;

        // Find user by email
        const result = await client.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        const user = result.rows[0];

        // Check if user exists
        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({
                message: 'Account is inactive. Please contact support.'
            });
        }

        // Update last login
        await client.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
            [user.user_id]
        );

        // Generate tokens
        const tokens = generateTokens(user);

        // Send response
        res.json({
            message: 'Login successful',
            ...tokens,
            user: {
                user_id: user.user_id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Error during login',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// Refresh token handler
export const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(401).json({ message: 'Refresh token is required' });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(token);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        // Get user from database
        const result = await req.db.query(
            'SELECT * FROM users WHERE user_id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Check if token version matches (for invalidation)
        if (decoded.version !== (user.token_version || 0)) {
            return res.status(401).json({ message: 'Token has been invalidated' });
        }

        // Generate new tokens
        const tokens = generateTokens(user);

        res.json({
            message: 'Token refreshed successfully',
            ...tokens,
            user: {
                user_id: user.user_id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            message: 'Error refreshing token',
            error: error.message
        });
    }
};

// Logout handler
export const logout = async (req, res) => {
    try {
        const userId = req.user.user_id;

        // Increment token version to invalidate all existing refresh tokens
        await req.db.query(
            'UPDATE users SET token_version = COALESCE(token_version, 0) + 1 WHERE user_id = $1',
            [userId]
        );

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            message: 'Error during logout',
            error: error.message
        });
    }
};

// Change password handler
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const { currentPassword, newPassword } = req.body;

        // Get user from database
        const result = await req.db.query(
            'SELECT * FROM users WHERE user_id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Validate new password strength
        const { isValid, errors } = validatePasswordStrength(newPassword);
        if (!isValid) {
            return res.status(400).json({
                message: 'Password requirements not met',
                errors
            });
        }

        // Check if password was used before
        const historyCheck = await checkPasswordHistory(userId, newPassword);
        if (!historyCheck.isValid) {
            return res.status(400).json({
                message: historyCheck.error
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Start transaction
        const client = await req.db.connect();
        try {
            await client.query('BEGIN');

            // Update password and increment token version
            await client.query(
                `UPDATE users 
                 SET password_hash = $1, 
                     token_version = COALESCE(token_version, 0) + 1,
                     password_updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $2`,
                [hashedPassword, userId]
            );

            // Add to password history
            await addToPasswordHistory(userId, hashedPassword);

            await client.query('COMMIT');

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            message: 'Error changing password',
            error: error.message
        });
    }
}; 