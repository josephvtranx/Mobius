import multer from 'multer';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// A sandbox must supply its own disposable directory; production retains the existing path.
if (process.env.MOBIUS_SANDBOX === '1' && !process.env.MOBIUS_SANDBOX_UPLOAD_DIR) {
  throw new Error('Sandbox upload directory is required');
}
export const uploadDir = process.env.MOBIUS_SANDBOX === '1'
  ? path.resolve(process.env.MOBIUS_SANDBOX_UPLOAD_DIR)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const extensions = { 'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png', 'image/gif': '.gif' };
const prefix = (tenantCode, userId) => `profile-${Buffer.from(tenantCode).toString('hex')}-${userId}-`;

// Only remove a file belonging to the authenticated tenant/user. Unknown
// historical names are retained rather than risking another tenant's media.
export async function removeProfileFile(imageUrl, tenantCode, userId) {
  if (!imageUrl?.startsWith('/uploads/') || !tenantCode) return;
  const filename = imageUrl.slice('/uploads/'.length);
  if (path.basename(filename) !== filename) return;
  const current = filename.startsWith(prefix(tenantCode, userId));
  const legacyPrefix = `${tenantCode}-profile-`;
  const legacy = filename.startsWith(legacyPrefix)
    && /^\d+-\d+\.(?:jpg|jpeg|png|gif)$/i.test(filename.slice(legacyPrefix.length));
  if (!current && !legacy) return;
  await fs.promises.unlink(path.join(uploadDir, filename)).catch((err) => {
    if (err.code !== 'ENOENT') console.error('Profile file cleanup failed:', err.code);
  });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, `${prefix(req.tenantCode, req.user.user_id)}${randomUUID()}${extensions[file.mimetype]}`),
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (extensions[file.mimetype]) return cb(null, true);
    const err = new Error('Only JPEG, PNG, and GIF images are allowed.');
    err.status = 400;
    cb(err);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});
export default upload;
