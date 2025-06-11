import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Generate access token (short-lived)
export const generateAccessToken = (user) => {
    return jwt.sign(
        { 
            userId: user.user_id, 
            role: user.role,
            email: user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // Short lived - 15 minutes
    );
};

// Generate refresh token (long-lived)
export const generateRefreshToken = (user) => {
    return jwt.sign(
        { 
            userId: user.user_id,
            version: user.token_version || 0 // For token invalidation
        },
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
        { expiresIn: '7d' } // 7 days
    );
};

// Generate both tokens
export const generateTokens = (user) => {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user)
    };
};

// Verify access token
export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Hash password
export const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password with hash
export const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Generate password reset token
export const generatePasswordResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Sanitize user object (remove sensitive data)
export const sanitizeUser = (user) => {
    const { password_hash, token_version, ...sanitizedUser } = user;
    return sanitizedUser;
};

// Generate secure random string (useful for secrets, reset tokens, etc.)
export const generateSecureString = (bytes = 64) => {
    return crypto.randomBytes(bytes).toString('hex');
};

// Generate email verification token
export const generateEmailVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
}; 