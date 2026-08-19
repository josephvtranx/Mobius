import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { generateTokens, verifyAccessToken, verifyRefreshToken, hashPassword } from '../helpers/authHelpers.js';
import { getTenantPool } from '../db/tenantPool.js';
import { directoryLookup, directoryRegister, directoryUpdatePassword, directoryRemove, institutionNameFor } from '../db/userDirectory.js';
import { validatePasswordStrength } from '../helpers/passwordHelpers.js';
import { checkPasswordHistory, addToPasswordHistory } from '../helpers/passwordHistoryHelpers.js';
import { withTransaction } from '../helpers/withTransaction.js';
import { HttpError } from '../helpers/httpError.js';
import { pgErrorToHttp } from '../helpers/pgErrors.js';

// Signup's pinned constraint-violation response shapes (MODERNIZATION 4.2 —
// the hand-rolled code blocks collapsed onto pgErrorToHttp overrides)
const SIGNUP_PG_OVERRIDES = {
    '23505': (e) => new HttpError(400, { message: 'Database constraint violation',
        errors: [{ field: e.constraint || 'unknown', message: e.detail || 'A record with this value already exists' }] }),
    '23503': (e) => new HttpError(400, { message: 'Database reference error',
        errors: [{ field: e.constraint || 'unknown', message: e.detail || 'Referenced record does not exist' }] }),
    '22P02': (e) => new HttpError(400, { message: 'Invalid data type',
        errors: [{ field: e.column || 'unknown', message: e.detail || 'Invalid data type for field' }] }),
    '23502': (e) => new HttpError(400, { message: 'Missing required field',
        errors: [{ field: e.column || 'unknown', message: `${e.column} is required` }] }),
    '23514': (e) => new HttpError(400, { message: 'Invalid value',
        errors: [{ field: e.constraint || 'unknown', message: e.detail || 'Value violates check constraint' }] })
};

// Token verification endpoint handler
// NB: previously checked out a pool client here that was never used (all queries
// go through req.db.query) — removed; it wasted a connection per request.
export const verifyTokenHandler = async (req, res) => {
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
    }
};

export const signup = async (req, res) => {
    // Registry rows inserted during this signup — removed again if the tenant
    // transaction rolls back (cross-DB writes aren't atomic; a crash between
    // the two can orphan a row — accepted pre-launch). Function-scoped so the
    // catch block can clean up.
    const directoryEmails = [];

    try {
        const {
            password,
            name,
            email,
            phone,
            role,
            // Role-specific fields
            status,          // for students
            age,            // form field for staff/instructors (not stored)
            date_of_birth,  // for students (schema v2 — replaces stored age)
            grade,          // for students
            gender,         // for students/staff/instructors
            school,         // for students
            pa_code,        // for students (resolved to a pa_codes row)
            guardians,      // for students: [{ name, email, phone?, relationship }]
            department,     // for staff
            employment_status, // for staff
            salary,         // for staff
            hourly_rate,    // for staff
            college_attended, // for instructors
            major           // for instructors
        } = req.body;

        // Validate BEFORE opening the transaction — the early returns below must
        // not leave a dangling BEGIN on the pooled connection (MODERNIZATION 2.6)

        // Check if email already exists
        const emailCheck = await req.db.query(
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

        // Global uniqueness: the registry user_directory is the auth source,
        // so an email taken in ANY institution is taken everywhere
        if (await directoryLookup(email)) {
            return res.status(400).json({
                message: 'Email already registered',
                errors: [{
                    field: 'email',
                    message: 'This email address is already registered'
                }]
            });
        }

        // Validate role-specific required fields. Guardians are OPTIONAL
        // (adult students exist — spec 05 GRD-4); each provided guardian
        // becomes a first-class login, so name + email + relationship are
        // required (email is the dedupe/account key).
        if (role === 'student') {
            const guardianList = Array.isArray(guardians) ? guardians : [];
            for (let i = 0; i < guardianList.length; i++) {
                const guardian = guardianList[i];
                if (!guardian.name || !guardian.email || !guardian.relationship) {
                    return res.status(400).json({
                        message: 'Validation error',
                        errors: [{
                            field: `guardians[${i}]`,
                            message: 'Guardian name, email, and relationship are required'
                        }]
                    });
                }
            }
        }

        // Hash password (12 rounds via shared helper — MODERNIZATION 2.1)
        const hashedPassword = await hashPassword(password);

        // Transaction (validation is done; every path inside commits or rolls back)
        const user = await withTransaction(req.db, async (client) => {

        // Insert user
        const userResult = await client.query(
            `INSERT INTO users (password_hash, name, email, phone, role, is_active)
             VALUES ($1, $2, $3, $4, $5, true)
             RETURNING *`,
            [hashedPassword, name, email, phone, role]
        );

        const newUser = userResult.rows[0];

        // Create role-specific records
        if (role === 'student') {
            // schema v2 (Phase 7.4): date_of_birth not age, pa_code resolved to a
            // pa_codes row, guardians are first-class users (role=guardian)
            // linked via student_guardians — first link is the primary (billing
            // contact; the partial unique index enforces exactly one).
            const guardianList = Array.isArray(guardians) ? guardians : [];

            let paCodeId = null;
            if (pa_code) {
                const { rows: [pa] } = await client.query(
                    `INSERT INTO pa_codes (code) VALUES ($1)
                     ON CONFLICT (code) DO UPDATE SET code = EXCLUDED.code
                     RETURNING pa_code_id`,
                    [pa_code]
                );
                paCodeId = pa.pa_code_id;
            }

            // Purchasing rights (spec 05): false for minors, true for adult
            // students (KR adulthood = 19) with zero linked guardians; a null
            // date_of_birth with no guardians is treated as adult. Staff-editable
            // afterwards; the Top-Up spec owns the enforcement point.
            let isAdult = true;
            if (date_of_birth) {
                const { rows: [ageRow] } = await client.query(
                    `SELECT date_part('year', age($1::date))::int AS years`, [date_of_birth]);
                isAdult = ageRow.years >= 19;
            }
            const canPurchase = guardianList.length === 0 && isAdult;

            await client.query(
                `INSERT INTO students (student_id, status, date_of_birth, grade, gender, school, pa_code_id, can_purchase)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [newUser.user_id, status || 'enrolled', date_of_birth ?? null, grade, gender, school, paCodeId, canPurchase]
            );

            let isFirstGuardian = true;
            for (const guardian of guardianList) {
                // Dedupe by email (citext unique): an existing guardian account is
                // linked as-is — no new credentials (GRD-2 rule). Any other role on
                // that email aborts the whole signup (transaction rolls back).
                const { rows: existing } = await client.query(
                    `SELECT user_id, role FROM users WHERE email = $1`, [guardian.email]);
                let guardianUserId;
                if (existing.length) {
                    if (existing[0].role !== 'guardian') {
                        throw {
                            status: 400,
                            message: 'Validation error',
                            errors: [{
                                field: 'guardians',
                                message: `${guardian.email} belongs to an existing non-guardian account`
                            }]
                        };
                    }
                    guardianUserId = existing[0].user_id;
                } else {
                    // System-generated temp credentials (onboarding §6); delivery is
                    // the Phase 7.6 notification service — the credentials_issued row
                    // records the issuance. The plaintext is never returned.
                    const tempHash = await hashPassword(randomBytes(12).toString('base64url'));
                    const { rows: [gUser] } = await client.query(
                        `INSERT INTO users (password_hash, name, email, phone, role, is_active)
                         VALUES ($1, $2, $3, $4, 'guardian', true) RETURNING user_id`,
                        [tempHash, guardian.name, guardian.email, guardian.phone ?? null]
                    );
                    guardianUserId = gUser.user_id;
                    await client.query(
                        `INSERT INTO notification_log (event_type, recipient_user_id, channel, subject_type, subject_id)
                         VALUES ('credentials_issued', $1, 'in_app', 'user', $2)`,
                        [guardianUserId, String(guardianUserId)]
                    );
                    // registry auth row for the new guardian login
                    await directoryRegister(guardian.email, tempHash, req.tenantCode);
                    directoryEmails.push(guardian.email);
                }

                const { rows: [gRow] } = await client.query(
                    `INSERT INTO guardians (user_id, relationship) VALUES ($1, $2)
                     ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
                     RETURNING guardian_id`,
                    [guardianUserId, guardian.relationship ?? null]
                );
                await client.query(
                    `INSERT INTO student_guardians (student_id, guardian_id, is_primary)
                     VALUES ($1, $2, $3)`,
                    [newUser.user_id, gRow.guardian_id, isFirstGuardian]
                );
                isFirstGuardian = false;
            }
        } else if (role === 'instructor') {
            try {
                // schema v2: instructors no longer store age (date_of_birth exists but
                // is not collected by this form)
                await client.query(
                    `INSERT INTO instructors (
                        instructor_id,
                        gender,
                        college_attended,
                        major
                    ) VALUES ($1, $2, $3, $4)`,
                    [newUser.user_id, gender, college_attended, major]
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
                // schema v2: staff no longer store age (date_of_birth exists but is
                // not collected by this form)
                await client.query(
                    `INSERT INTO staff (
                        staff_id,
                        department,
                        employment_status,
                        salary,
                        hourly_rate,
                        gender
                    ) VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        newUser.user_id,
                        department,
                        employment_status || 'full_time',
                        salary,
                        hourly_rate,
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

        // registry auth row for the new user (just before commit to minimize
        // the cross-DB orphan window)
        await directoryRegister(email, hashedPassword, req.tenantCode);
        directoryEmails.push(email);

        return newUser;
        });

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user, req.tenantCode);

        // Send response (accessToken — was `token`, standardized with login; MODERNIZATION 2.2)
        res.status(201).json({
            message: 'User created successfully',
            accessToken,
            refreshToken,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        // undo any registry rows THIS request inserted (only successfully
        // registered emails are tracked, so a 23505 loser's pre-existing
        // owner row is never touched)
        for (const dirEmail of directoryEmails) {
            await directoryRemove(dirEmail);
        }
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

        // Constraint violations: pinned shapes via pgErrorToHttp overrides
        const mapped = pgErrorToHttp(error, SIGNUP_PG_OVERRIDES);
        if (mapped instanceof HttpError) {
            return res.status(mapped.status).json(mapped.body);
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
    }
};

export const login = async (req, res) => {
    // Registry-first: the global user_directory (email → hash + institution)
    // is the auth source — email+password alone locate the tenant, no code
    // needed. Legacy/direct-seeded users without a directory row fall through
    // to the header-based per-tenant path below.
    try {
        const dir = await directoryLookup(req.body.email);
        if (dir) {
            if (!await bcrypt.compare(req.body.password, dir.password_hash)) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }
            // Suspension is enforced at the login boundary: existing access
            // tokens (≤120 min) ride out, but no new session can start.
            if (!dir.institution_active) {
                return res.status(403).json({
                    message: 'This academy is currently suspended. Please contact your academy or Mobius support.'
                });
            }
            let db;
            try {
                db = await getTenantPool(dir.code);
            } catch {
                return res.status(401).json({ message: 'Unknown institution' });
            }
            const { rows: [user] } = await db.query(
                'SELECT * FROM users WHERE email = $1', [req.body.email]);
            if (!user) return res.status(401).json({ message: 'Invalid email or password' });
            if (!user.is_active) {
                return res.status(401).json({ message: 'Account is inactive. Please contact support.' });
            }
            await db.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1', [user.user_id]);
            const tokens = generateTokens(user, dir.code);
            return res.json({
                message: 'Login successful',
                ...tokens,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    institution_name: dir.institution_name
                }
            });
        }
    } catch (error) {
        console.error('Registry login error:', error);
        return res.status(500).json({ message: 'Error during login', error: error.message });
    }

    // Fallback: per-tenant auth via the X-Institution-Code header (legacy rows
    // created before the directory existed)
    if (!req.db) {
        console.error('No req.db found. Missing or invalid institution code.');
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

        // Generate tokens (D7: the tenant travels in the JWT from here on)
        const tokens = generateTokens(user, req.tenantCode);

        // Send response
        res.json({
            message: 'Login successful',
            ...tokens,
            user: {
                user_id: user.user_id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role,
                institution_name: await institutionNameFor(req.tenantCode)
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

        // D7: the refresh token's tenantCode claim IS the tenant — resolve the
        // pool from it directly (no header or prior req.db needed)
        if (!decoded.tenantCode) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        let db;
        try {
            db = await getTenantPool(decoded.tenantCode);
        } catch {
            return res.status(401).json({ message: 'Unknown institution' });
        }

        // Get user from database
        const result = await db.query(
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

        // Generate new tokens (same tenant as the refresh token's claim)
        const tokens = generateTokens(user, decoded.tenantCode);

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

        // Check if password was used before (helpers take db as first arg)
        const historyCheck = await checkPasswordHistory(req.db, userId, newPassword);
        if (!historyCheck.isValid) {
            return res.status(400).json({
                message: historyCheck.error
            });
        }

        // Hash new password (12 rounds via shared helper — MODERNIZATION 2.1)
        const hashedPassword = await hashPassword(newPassword);

        await withTransaction(req.db, async (client) => {
            // Update password and increment token version
            await client.query(
                `UPDATE users 
                 SET password_hash = $1, 
                     token_version = COALESCE(token_version, 0) + 1,
                     password_updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $2`,
                [hashedPassword, userId]
            );

            // Add to password history (on the transaction client, so it rolls back together)
            await addToPasswordHistory(client, userId, hashedPassword);
        });

        // keep the registry auth hash in sync (0 rows = legacy user, fine)
        await directoryUpdatePassword(req.user.email, hashedPassword);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            message: 'Error changing password',
            error: error.message
        });
    }
}; 