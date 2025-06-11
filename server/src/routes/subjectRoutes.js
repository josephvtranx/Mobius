import express from 'express';
import { body } from 'express-validator';
import pool from '../config/db.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware
const subjectValidation = [
    body('name')
        .exists()
        .notEmpty()
        .withMessage('Subject name is required')
        .trim(),
    body('department')
        .optional()
        .isString()
        .withMessage('Department must be a string')
        .trim(),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .trim()
];

// Get all subjects
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                s.*,
                COUNT(DISTINCT is_join.instructor_id) as instructor_count,
                COUNT(DISTINCT cs.session_id) as active_sessions
            FROM subjects s
            LEFT JOIN instructor_specialties is_join ON s.subject_id = is_join.subject_id
            LEFT JOIN class_sessions cs ON s.subject_id = cs.subject_id 
                AND cs.status = 'scheduled'
            GROUP BY s.subject_id
            ORDER BY s.name
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
});

// Get single subject with details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
            SELECT 
                s.*,
                json_agg(DISTINCT jsonb_build_object(
                    'instructor_id', i.instructor_id,
                    'name', u.name,
                    'email', u.email
                )) FILTER (WHERE i.instructor_id IS NOT NULL) as instructors,
                COUNT(DISTINCT cs.session_id) as total_sessions,
                COUNT(DISTINCT cs.session_id) FILTER (WHERE cs.status = 'completed') as completed_sessions
            FROM subjects s
            LEFT JOIN instructor_specialties is_join ON s.subject_id = is_join.subject_id
            LEFT JOIN instructors i ON is_join.instructor_id = i.instructor_id
            LEFT JOIN users u ON i.user_id = u.user_id
            LEFT JOIN class_sessions cs ON s.subject_id = cs.subject_id
            WHERE s.subject_id = $1
            GROUP BY s.subject_id
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching subject:', error);
        res.status(500).json({ error: 'Failed to fetch subject' });
    }
});

// Create new subject
router.post('/', subjectValidation, validateRequest, async (req, res) => {
    try {
        const { name, department, description } = req.body;

        // Check if subject already exists
        const existingSubject = await pool.query(
            'SELECT subject_id FROM subjects WHERE LOWER(name) = LOWER($1)',
            [name]
        );

        if (existingSubject.rows.length > 0) {
            return res.status(400).json({ error: 'Subject already exists' });
        }

        const result = await pool.query(`
            INSERT INTO subjects (name, department, description)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [name, department, description]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({ error: 'Failed to create subject' });
    }
});

// Update subject
router.put('/:id', subjectValidation, validateRequest, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, department, description } = req.body;

        // Check if updated name conflicts with existing subject
        const existingSubject = await pool.query(
            'SELECT subject_id FROM subjects WHERE LOWER(name) = LOWER($1) AND subject_id != $2',
            [name, id]
        );

        if (existingSubject.rows.length > 0) {
            return res.status(400).json({ error: 'Subject name already exists' });
        }

        const result = await pool.query(`
            UPDATE subjects 
            SET name = $1, department = $2, description = $3
            WHERE subject_id = $4
            RETURNING *
        `, [name, department, description, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ error: 'Failed to update subject' });
    }
});

// Delete subject (only if no active sessions)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check for active sessions
        const activeSessions = await pool.query(`
            SELECT COUNT(*) as count 
            FROM class_sessions 
            WHERE subject_id = $1 AND status = 'scheduled'
        `, [id]);

        if (activeSessions.rows[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete subject with active sessions' 
            });
        }

        const result = await pool.query(`
            DELETE FROM subjects 
            WHERE subject_id = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Error deleting subject:', error);
        res.status(500).json({ error: 'Failed to delete subject' });
    }
});

// Assign instructor to subject
router.post('/:id/instructors', async (req, res) => {
    try {
        const { id } = req.params;
        const { instructor_id } = req.body;

        // Check if assignment already exists
        const existingAssignment = await pool.query(`
            SELECT * FROM instructor_specialties 
            WHERE subject_id = $1 AND instructor_id = $2
        `, [id, instructor_id]);

        if (existingAssignment.rows.length > 0) {
            return res.status(400).json({ 
                error: 'Instructor is already assigned to this subject' 
            });
        }

        const result = await pool.query(`
            INSERT INTO instructor_specialties (subject_id, instructor_id)
            VALUES ($1, $2)
            RETURNING *
        `, [id, instructor_id]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error assigning instructor:', error);
        res.status(500).json({ error: 'Failed to assign instructor' });
    }
});

// Remove instructor from subject
router.delete('/:id/instructors/:instructorId', async (req, res) => {
    try {
        const { id, instructorId } = req.params;

        // Check for active sessions
        const activeSessions = await pool.query(`
            SELECT COUNT(*) as count 
            FROM class_sessions 
            WHERE subject_id = $1 
            AND instructor_id = $2 
            AND status = 'scheduled'
        `, [id, instructorId]);

        if (activeSessions.rows[0].count > 0) {
            return res.status(400).json({ 
                error: 'Cannot remove instructor with active sessions' 
            });
        }

        const result = await pool.query(`
            DELETE FROM instructor_specialties 
            WHERE subject_id = $1 AND instructor_id = $2
            RETURNING *
        `, [id, instructorId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        res.json({ message: 'Instructor removed from subject successfully' });
    } catch (error) {
        console.error('Error removing instructor:', error);
        res.status(500).json({ error: 'Failed to remove instructor' });
    }
});

export default router; 