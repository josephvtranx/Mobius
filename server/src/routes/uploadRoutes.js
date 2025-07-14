import express from 'express';
import upload from '../middleware/upload.js';
import auth from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Upload profile picture
router.post('/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const userId = req.user.user_id;
    const filename = req.file.filename;
    const imageUrl = `/uploads/${filename}`;

    // Update user's profile_pic_url in database
    const updateQuery = `
      UPDATE users 
      SET profile_pic_url = $1 
      WHERE user_id = $2
    `;
    
    await req.db.query(updateQuery, [imageUrl, userId]);

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      imageUrl: imageUrl,
      filename: filename
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
});

// Delete profile picture
router.delete('/profile-picture', auth, async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get current profile picture URL
    const getQuery = 'SELECT profile_pic_url FROM users WHERE user_id = $1';
    const result = await req.db.query(getQuery, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const currentImageUrl = result.rows[0].profile_pic_url;

    // Update database to remove profile picture
    const updateQuery = `
      UPDATE users 
      SET profile_pic_url = NULL 
      WHERE user_id = $1
    `;
    
    await req.db.query(updateQuery, [userId]);

    // Delete file from filesystem if it exists
    if (currentImageUrl) {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const filePath = path.join(__dirname, '../../uploads', path.basename(currentImageUrl));
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });

  } catch (error) {
    console.error('Profile picture deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile picture',
      error: error.message
    });
  }
});

export default router; 