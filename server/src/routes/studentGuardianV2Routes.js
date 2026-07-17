// Student ↔ guardian management (spec 05 GRD-2) + purchasing rights, schema v2.
// Mounted at /api/students alongside the legacy v1 router (no path overlap:
// legacy has no /:id/guardians or /:id/purchasing routes). Guardian accounts
// are staff-created here or via student signup — never self-registered;
// credentials are system-generated (delivery = Phase 7.6 notification service).
import express from 'express';
import { randomBytes } from 'crypto';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { hashPassword } from '../helpers/authHelpers.js';
import { canActForStudent } from '../helpers/authz.js';

const router = express.Router();

async function loadStudent(db, id) {
  const studentId = Number(id);
  if (!studentId) return null;
  const { rows } = await db.query(
    `SELECT s.student_id, s.can_purchase, u.name FROM students s
      JOIN users u ON u.user_id = s.student_id WHERE s.student_id = $1`, [studentId]);
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// GET /:id/guardians — staff, the student, or a linked guardian
// ---------------------------------------------------------------------------
router.get('/:id/guardians', authenticateToken, async (req, res) => {
  const student = await loadStudent(req.db, req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  if (!await canActForStudent(req.db, req.user, student.student_id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const { rows } = await req.db.query(
    `SELECT sg.guardian_id, sg.is_primary, sg.notification_prefs, sg.linked_at,
            g.relationship, u.user_id, u.name, u.email, u.phone
       FROM student_guardians sg
       JOIN guardians g ON g.guardian_id = sg.guardian_id
       JOIN users u ON u.user_id = g.user_id
      WHERE sg.student_id = $1
      ORDER BY sg.is_primary DESC, u.name`, [student.student_id]);
  res.json({ student_id: student.student_id, guardians: rows });
});

// ---------------------------------------------------------------------------
// POST /:id/guardians — staff links (or creates + links) a guardian.
// Dedupe by email: an existing guardian account is linked as-is with NO new
// credentials (GRD-2 AC); their portal simply gains the student.
// ---------------------------------------------------------------------------
router.post('/:id/guardians', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const student = await loadStudent(req.db, req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const { email, name, phone, relationship, is_primary } = req.body;
  if (!email) return res.status(400).json({ message: 'email is required (guardian account/dedupe key)' });

  const { rows: existingUser } = await req.db.query(
    `SELECT user_id, role FROM users WHERE email = $1`, [email]);
  if (existingUser.length && existingUser[0].role !== 'guardian') {
    return res.status(400).json({ message: `${email} belongs to an existing non-guardian account` });
  }
  if (!existingUser.length && !name) {
    return res.status(400).json({ message: 'name is required when creating a new guardian' });
  }

  const { rows: primaryRows } = await req.db.query(
    `SELECT 1 FROM student_guardians WHERE student_id = $1 AND is_primary`, [student.student_id]);
  const hasPrimary = primaryRows.length > 0;
  if (is_primary === true && hasPrimary) {
    return res.status(409).json({ message: 'Student already has a primary guardian — use make-primary to reassign' });
  }

  const client = await req.db.connect();
  try {
    await client.query('BEGIN');
    let guardianUserId;
    let credentialsIssued = false;
    if (existingUser.length) {
      guardianUserId = existingUser[0].user_id;
    } else {
      const tempHash = await hashPassword(randomBytes(12).toString('base64url'));
      const { rows: [gUser] } = await client.query(
        `INSERT INTO users (password_hash, name, email, phone, role, is_active)
         VALUES ($1, $2, $3, $4, 'guardian', true) RETURNING user_id`,
        [tempHash, name, email, phone ?? null]);
      guardianUserId = gUser.user_id;
      await client.query(
        `INSERT INTO notification_log (event_type, recipient_user_id, channel, subject_type, subject_id)
         VALUES ('credentials_issued', $1, 'in_app', 'user', $2)`,
        [guardianUserId, String(guardianUserId)]);
      credentialsIssued = true;
    }
    const { rows: [gRow] } = await client.query(
      `INSERT INTO guardians (user_id, relationship) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING guardian_id`,
      [guardianUserId, relationship ?? null]);

    // the first-ever guardian becomes primary automatically (billing contact)
    const makePrimary = is_primary === true || !hasPrimary;
    const { rows: [link] } = await client.query(
      `INSERT INTO student_guardians (student_id, guardian_id, is_primary, linked_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [student.student_id, gRow.guardian_id, makePrimary, req.user.user_id]);
    await client.query('COMMIT');
    res.status(201).json({ link, credentials_issued: credentialsIssued });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({ message: 'This guardian is already linked to the student' });
    }
    throw err;
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// POST /:id/guardians/:guardianId/make-primary — explicit primary reassignment
// (exactly-one-primary enforced by the partial unique index; clear-then-set)
// ---------------------------------------------------------------------------
router.post('/:id/guardians/:guardianId/make-primary', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const student = await loadStudent(req.db, req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const guardianId = Number(req.params.guardianId);
  if (!guardianId) return res.status(400).json({ message: 'invalid guardian id' });

  const client = await req.db.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE student_guardians SET is_primary = false WHERE student_id = $1 AND is_primary`,
      [student.student_id]);
    const { rowCount } = await client.query(
      `UPDATE student_guardians SET is_primary = true WHERE student_id = $1 AND guardian_id = $2`,
      [student.student_id, guardianId]);
    if (!rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'That guardian is not linked to this student' });
    }
    await client.query('COMMIT');
    res.json({ student_id: student.student_id, primary_guardian_id: guardianId });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id/purchasing — staff toggles students.can_purchase (spec 05:
// default false for minors, true for adult no-guardian students; the
// family-facing enforcement point lands with the Top-Up spec).
// ---------------------------------------------------------------------------
router.patch('/:id/purchasing', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const student = await loadStudent(req.db, req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  const { can_purchase } = req.body;
  if (typeof can_purchase !== 'boolean') {
    return res.status(400).json({ message: 'can_purchase must be a boolean' });
  }
  await req.db.query(
    `UPDATE students SET can_purchase = $1 WHERE student_id = $2`,
    [can_purchase, student.student_id]);
  res.json({ student_id: student.student_id, can_purchase });
});

export default router;
