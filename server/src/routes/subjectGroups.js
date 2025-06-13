import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET all subject groups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subject_groups ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subject groups:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST new subject group
router.post('/', authenticateToken, async (req, res) => {
  console.log('Received request to create subject group:', req.body); // Debug log
  const { name, description } = req.body;

  // Validate input
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    console.log('Validation failed: Name is required'); // Debug log
    return res.status(400).json({ message: 'Name is required' });
  }

  try {
    // Check if subject group with same name already exists
    console.log('Checking for existing subject group with name:', name.trim()); // Debug log
    const existingGroup = await pool.query(
      'SELECT * FROM subject_groups WHERE name = $1',
      [name.trim()]
    );

    if (existingGroup.rows.length > 0) {
      console.log('Subject group with this name already exists'); // Debug log
      return res.status(409).json({ message: 'A subject group with this name already exists' });
    }

    // Insert new subject group
    console.log('Inserting new subject group...'); // Debug log
    const result = await pool.query(
      'INSERT INTO subject_groups (name, description) VALUES ($1, $2) RETURNING *',
      [name.trim(), description ? description.trim() : null]
    );

    console.log('Successfully created subject group:', result.rows[0]); // Debug log
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating subject group:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router; 