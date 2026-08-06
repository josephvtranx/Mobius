// Room directory (server: /api/rooms). The `rooms` table has existed since
// the v2 baseline (class_sessions.room_id FKs into it, bestFitRoom/
// roomCheck already use it for scheduling) but had no CRUD API of its own —
// staff had to type a raw numeric room_id with no way to see what it was.
import express from 'express';
import { body } from 'express-validator';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

const roomValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
  body('notes').optional({ nullable: true }).isString(),
];

router.get('/', authenticateToken, async (req, res) => {
  const activeOnly = req.query.active !== 'false';
  const { rows } = await req.db.query(
    `SELECT room_id, name, capacity, is_active, notes FROM rooms
      ${activeOnly ? 'WHERE is_active = true' : ''}
      ORDER BY name`);
  res.json(rows);
});

router.post('/', authenticateToken, authorizeRole('staff'), roomValidation, validateRequest, async (req, res) => {
  const { name, capacity, notes } = req.body;
  try {
    const { rows: [room] } = await req.db.query(
      `INSERT INTO rooms (name, capacity, notes) VALUES ($1, $2, $3) RETURNING *`,
      [name, capacity, notes ?? null]);
    res.status(201).json(room);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ message: 'A room with that name already exists' });
    throw err;
  }
});

router.patch('/:id', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const roomId = Number(req.params.id);
  if (!roomId) return res.status(400).json({ message: 'invalid room id' });
  const { name, capacity, notes, is_active } = req.body;
  const { rows: [room] } = await req.db.query(
    `UPDATE rooms SET
       name = COALESCE($1, name),
       capacity = COALESCE($2, capacity),
       notes = COALESCE($3, notes),
       is_active = COALESCE($4, is_active)
     WHERE room_id = $5 RETURNING *`,
    [name ?? null, capacity ?? null, notes ?? null, is_active ?? null, roomId]);
  if (!room) return res.status(404).json({ message: 'Room not found' });
  res.json(room);
});

export default router;
