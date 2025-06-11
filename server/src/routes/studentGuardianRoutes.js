import express from 'express';
import { body } from 'express-validator';
import pool from '../config/db.js';
const router = express.Router();

// Validation middleware
const relationshipValidation = [
    body('student_id').isInt().withMessage('Valid student ID is required'),
    body('guardian_id').isInt().withMessage('Valid guardian ID is required')
];

// Get all student-guardian relationships
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                sg.*,
                s.name as student_name,
                g.name as guardian_name,
                g.relationship
            FROM student_guardian sg
            JOIN students s ON s.student_id = sg.student_id
            JOIN guardians g ON g.guardian_id = sg.guardian_id
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching student-guardian relationships:', error);
        res.status(500).json({ error: 'Failed to fetch relationships' });
    }
});

// Link a student to a guardian
router.post('/', relationshipValidation, async (req, res) => {
    try {
        const { student_id, guardian_id } = req.body;
        
        // First check if both student and guardian exist
        const studentExists = await pool.query('SELECT * FROM students WHERE student_id = $1', [student_id]);
        const guardianExists = await pool.query('SELECT * FROM guardians WHERE guardian_id = $1', [guardian_id]);
        
        if (studentExists.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        if (guardianExists.rows.length === 0) {
            return res.status(404).json({ error: 'Guardian not found' });
        }
        
        // Check if relationship already exists
        const existingRelation = await pool.query(
            'SELECT * FROM student_guardian WHERE student_id = $1 AND guardian_id = $2',
            [student_id, guardian_id]
        );
        
        if (existingRelation.rows.length > 0) {
            return res.status(400).json({ error: 'Relationship already exists' });
        }
        
        // Create the relationship
        const result = await pool.query(
            'INSERT INTO student_guardian (student_id, guardian_id) VALUES ($1, $2) RETURNING *',
            [student_id, guardian_id]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating student-guardian relationship:', error);
        res.status(500).json({ error: 'Failed to create relationship' });
    }
});

// Remove a student-guardian relationship
router.delete('/', relationshipValidation, async (req, res) => {
    try {
        const { student_id, guardian_id } = req.body;
        
        const result = await pool.query(
            'DELETE FROM student_guardian WHERE student_id = $1 AND guardian_id = $2 RETURNING *',
            [student_id, guardian_id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Relationship not found' });
        }
        
        res.json({ message: 'Relationship removed successfully' });
    } catch (error) {
        console.error('Error removing student-guardian relationship:', error);
        res.status(500).json({ error: 'Failed to remove relationship' });
    }
});

// Get all guardians for a specific student
router.get('/student/:student_id', async (req, res) => {
    try {
        const { student_id } = req.params;
        const result = await pool.query(`
            SELECT 
                g.*
            FROM guardians g
            JOIN student_guardian sg ON g.guardian_id = sg.guardian_id
            WHERE sg.student_id = $1
        `, [student_id]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching student\'s guardians:', error);
        res.status(500).json({ error: 'Failed to fetch student\'s guardians' });
    }
});

// Get all students for a specific guardian
router.get('/guardian/:guardian_id', async (req, res) => {
    try {
        const { guardian_id } = req.params;
        const result = await pool.query(`
            SELECT 
                s.*
            FROM students s
            JOIN student_guardian sg ON s.student_id = sg.student_id
            WHERE sg.guardian_id = $1
        `, [guardian_id]);
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching guardian\'s students:', error);
        res.status(500).json({ error: 'Failed to fetch guardian\'s students' });
    }
});

export default router; 