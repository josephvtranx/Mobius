import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

// Check if password was used before
export const checkPasswordHistory = async (userId, newPassword) => {
    try {
        // Get password history
        const result = await pool.query(
            'SELECT password_hash FROM password_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5',
            [userId]
        );

        // Check each historical password
        for (const row of result.rows) {
            const match = await bcrypt.compare(newPassword, row.password_hash);
            if (match) {
                return {
                    isValid: false,
                    error: 'Password was used recently. Please choose a different password'
                };
            }
        }

        return { isValid: true };
    } catch (error) {
        console.error('Error checking password history:', error);
        throw error;
    }
};

// Add password to history
export const addToPasswordHistory = async (userId, passwordHash) => {
    try {
        await pool.query(
            'INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)',
            [userId, passwordHash]
        );

        // Keep only last 5 passwords
        await pool.query(`
            DELETE FROM password_history 
            WHERE id NOT IN (
                SELECT id FROM password_history 
                WHERE user_id = $1 
                ORDER BY created_at DESC 
                LIMIT 5
            )
            AND user_id = $1
        `, [userId]);
    } catch (error) {
        console.error('Error adding to password history:', error);
        throw error;
    }
}; 