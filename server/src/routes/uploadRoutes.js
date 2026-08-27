import express from 'express';
import fs from 'node:fs/promises';
import upload, { removeProfileFile } from '../middleware/upload.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { withTransaction } from '../helpers/withTransaction.js';

const router = express.Router();
const receive = upload.single('profilePicture');
const imageType = (bytes) => {
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return 'png';
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'jpeg';
  if (['GIF87a', 'GIF89a'].includes(bytes.subarray(0,6).toString())) return 'gif';
  return null;
};

router.post('/profile-picture', authenticateToken, (req, res, next) => {
  receive(req, res, (err) => {
    if (!err) return next();
    res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({
      message: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : err.message,
    });
  });
}, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const imageUrl = `/uploads/${req.file.filename}`;
  let committed = false;
  try {
    const bytes = await fs.readFile(req.file.path);
    const actual = imageType(bytes);
    const claimed = req.file.mimetype.replace('image/', '').replace('jpg', 'jpeg');
    if (!actual || actual !== claimed) return res.status(400).json({ message: 'The file does not match a supported image format.' });
    const previous = await withTransaction(req.db, async (db) => {
      const { rows: [user] } = await db.query('SELECT profile_pic_url FROM users WHERE user_id=$1 FOR UPDATE', [req.user.user_id]);
      await db.query('UPDATE users SET profile_pic_url=$1 WHERE user_id=$2', [imageUrl, req.user.user_id]);
      return user.profile_pic_url;
    });
    committed = true;
    await removeProfileFile(previous, req.tenantCode, req.user.user_id);
    res.json({ success: true, imageUrl, filename: req.file.filename });
  } finally {
    if (!committed) await removeProfileFile(imageUrl, req.tenantCode, req.user.user_id);
  }
});

router.delete('/profile-picture', authenticateToken, async (req, res) => {
  const previous = await withTransaction(req.db, async (db) => {
    const { rows: [user] } = await db.query('SELECT profile_pic_url FROM users WHERE user_id=$1 FOR UPDATE', [req.user.user_id]);
    await db.query('UPDATE users SET profile_pic_url=NULL WHERE user_id=$1', [req.user.user_id]);
    return user.profile_pic_url;
  });
  await removeProfileFile(previous, req.tenantCode, req.user.user_id);
  res.json({ success: true, message: 'Profile picture deleted successfully' });
});

// A tenant cannot determine which shared-directory files other tenants use.
// Replacement/deletion perform targeted cleanup; bulk cleanup is intentionally disabled.
router.post('/cleanup', authenticateToken, authorizeRole('staff'), (_req, res) => {
  res.status(409).json({ message: 'Bulk cleanup is disabled for shared tenant storage. Profile replacement and deletion clean up their own files.' });
});
export default router;
