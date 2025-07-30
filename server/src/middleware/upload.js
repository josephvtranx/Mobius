import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage with tenant-aware organization
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Optional: Create tenant-specific subdirectories
    // const tenantDir = req.session?.tenantCode ? 
    //   path.join(uploadDir, req.session.tenantCode) : uploadDir;
    // if (!fs.existsSync(tenantDir)) {
    //   fs.mkdirSync(tenantDir, { recursive: true });
    // }
    // cb(null, tenantDir);
    
    // For now, keep shared directory (simpler)
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with tenant prefix for better organization
    const tenantPrefix = req.session?.tenantCode ? `${req.session.tenantCode}-` : '';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${tenantPrefix}profile-${uniqueSuffix}${ext}`);
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only allow 1 file
  }
});

// Utility function to clean up orphaned files
export const cleanupOrphanedFiles = async (db) => {
  try {
    // Get all profile picture URLs from database
    const result = await db.query('SELECT profile_pic_url FROM users WHERE profile_pic_url IS NOT NULL');
    const dbFiles = result.rows.map(row => row.profile_pic_url);
    
    // Get all files in uploads directory
    const files = fs.readdirSync(uploadDir);
    
    // Find orphaned files (files not referenced in database)
    const orphanedFiles = files.filter(file => {
      const filePath = `/uploads/${file}`;
      return !dbFiles.includes(filePath);
    });
    
    // Delete orphaned files
    orphanedFiles.forEach(file => {
      const filePath = path.join(uploadDir, file);
      fs.unlinkSync(filePath);
      console.log(`Deleted orphaned file: ${file}`);
    });
    
    console.log(`Cleaned up ${orphanedFiles.length} orphaned files`);
  } catch (error) {
    console.error('Error cleaning up orphaned files:', error);
  }
};

export default upload; 