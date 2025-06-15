import express from 'express';
import { getStaffRoster } from '../controllers/staffController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Staff roster route
router.get('/roster', authenticateToken, getStaffRoster);

export default router; 