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
    body('group_id')
        .exists()
        .isInt()
        .withMessage('Subject group is required'),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string')
        .trim()
];

// Validation middleware for subject creation
const validateSubjectCreation = (req, res, next) => {
    const { name, group_id } = req.body;
    
    if (!name || !group_id) {
        return res.status(400).json({ 
            error: 'Name and group_id are required' 
        });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ 
            error: 'Name must be a non-empty string' 
        });
    }

    if (isNaN(parseInt(group_id))) {
        return res.status(400).json({ 
            error: 'group_id must be a valid integer' 
        });
    }

    next();
};

// Get all subject groups with their subjects
router.get('/subject-groups', async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            SELECT 
                sg.group_id,
                sg.name,
                sg.description,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'subject_id', s.subject_id,
                            'name', s.name
                        )
                    ) FILTER (WHERE s.subject_id IS NOT NULL),
                    '[]'::json
                ) as subjects
            FROM subject_groups sg
            LEFT JOIN subjects s ON sg.group_id = s.group_id
            GROUP BY sg.group_id, sg.name, sg.description
            ORDER BY sg.name
        `);

        console.log('Subject groups query result:', JSON.stringify(result.rows, null, 2));
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching subject groups:', error);
        res.status(500).json({ 
            error: 'Failed to fetch subject groups',
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// Get all subjects
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                s.*,
                COUNT(DISTINCT cs.session_id) as active_sessions
            FROM subjects s
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
                sg.name as group_name,
                COUNT(DISTINCT cs.session_id) as total_sessions,
                COUNT(DISTINCT cs.session_id) FILTER (WHERE cs.status = 'completed') as completed_sessions
            FROM subjects s
            LEFT JOIN subject_groups sg ON s.group_id = sg.group_id
            LEFT JOIN class_sessions cs ON s.subject_id = cs.subject_id
            WHERE s.subject_id = $1
            GROUP BY s.subject_id, sg.name
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

// Create a new subject
router.post('/', validateSubjectCreation, async (req, res) => {
    const client = await pool.connect();
    try {
        const { name, group_id } = req.body;
        
        // Check if subject already exists in this group
        const checkResult = await client.query(
            'SELECT * FROM subjects WHERE name = $1 AND group_id = $2',
            [name, group_id]
        );

        if (checkResult.rows.length > 0) {
            return res.status(400).json({ 
                error: 'A subject with this name already exists in this group' 
            });
        }

        // Verify the group exists
        const groupResult = await client.query(
            'SELECT * FROM subject_groups WHERE group_id = $1',
            [group_id]
        );

        if (groupResult.rows.length === 0) {
            return res.status(400).json({ 
                error: 'Invalid subject group' 
            });
        }

        const result = await client.query(
            'INSERT INTO subjects (name, group_id) VALUES ($1, $2) RETURNING *',
            [name, group_id]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating subject:', error);
        res.status(500).json({ 
            error: 'Failed to create subject',
            details: error.message 
        });
    } finally {
        client.release();
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