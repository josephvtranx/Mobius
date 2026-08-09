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
import { directoryRegister, directoryRemove, directoryLookup } from '../db/userDirectory.js';
import { withTransaction } from '../helpers/withTransaction.js';

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
  // global uniqueness: creating a NEW guardian requires the email to be free
  // in the registry directory too (an existing guardian already has their row)
  if (!existingUser.length && await directoryLookup(email)) {
    return res.status(400).json({ message: `${email} belongs to an existing account at another institution` });
  }

  const { rows: primaryRows } = await req.db.query(
    `SELECT 1 FROM student_guardians WHERE student_id = $1 AND is_primary`, [student.student_id]);
  const hasPrimary = primaryRows.length > 0;
  if (is_primary === true && hasPrimary) {
    return res.status(409).json({ message: 'Student already has a primary guardian — use make-primary to reassign' });
  }

  const directoryEmails = []; // registry rows to undo on rollback
  try {
    const outcome = await withTransaction(req.db, async (client) => {
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
      await directoryRegister(email, tempHash, req.tenantCode);
      directoryEmails.push(email);
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
    return { link, credentials_issued: credentialsIssued };
    });
    res.status(201).json(outcome);
  } catch (err) {
    for (const dirEmail of directoryEmails) await directoryRemove(dirEmail);
    if (err.code === '23505') {
      return res.status(409).json({ message: 'This guardian is already linked to the student' });
    }
    throw err;
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

  const linked = await withTransaction(req.db, async (client) => {
    await client.query(
      `UPDATE student_guardians SET is_primary = false WHERE student_id = $1 AND is_primary`,
      [student.student_id]);
    const { rowCount } = await client.query(
      `UPDATE student_guardians SET is_primary = true WHERE student_id = $1 AND guardian_id = $2`,
      [student.student_id, guardianId]);
    if (!rowCount) {
      // throwing rolls the primary-clear back too
      const err = new Error('not linked');
      err.notLinked = true;
      throw err;
    }
    return true;
  }).catch((err) => {
    if (err.notLinked) return false;
    throw err;
  });
  if (!linked) return res.status(404).json({ message: 'That guardian is not linked to this student' });
  res.json({ student_id: student.student_id, primary_guardian_id: guardianId });
});

// ---------------------------------------------------------------------------
// GET /:id/schedule — upcoming sessions across the student's active
// enrollments (the family schedule surface; staff/self/linked guardian).
// ---------------------------------------------------------------------------
router.get('/:id/schedule', authenticateToken, async (req, res) => {
  const student = await loadStudent(req.db, req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  if (!await canActForStudent(req.db, req.user, student.student_id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const { rows } = await req.db.query(
    `SELECT cs.session_id, cs.starts_at, cs.ends_at, cs.status,
            c.class_id, c.class_type, c.instructor_id, sub.name AS subject
       FROM enrollments e
       JOIN classes c ON c.class_id = e.class_id AND c.status = 'active'
       JOIN subjects sub ON sub.subject_id = c.subject_id
       JOIN class_sessions cs ON cs.class_id = c.class_id
      WHERE e.student_id = $1 AND e.status = 'active'
        AND cs.status IN ('scheduled','reschedule_requested')
        AND cs.starts_at > CURRENT_TIMESTAMP
      ORDER BY cs.starts_at LIMIT $2`,
    [student.student_id, limit]);
  res.json({ student_id: student.student_id, sessions: rows });
});

// ---------------------------------------------------------------------------
// GET /:id/record — ACA-2: the session timeline (attendance + note verbatim,
// latest text with the visible "edited" stamp + edit timestamps). Version
// PAYLOADS are staff/audit-only; portals see timestamps. A noteless entry
// still carries subject/class — the deliberate no-shame empty state.
// ---------------------------------------------------------------------------
router.get('/:id/record', authenticateToken, async (req, res) => {
  const student = await loadStudent(req.db, req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  if (!await canActForStudent(req.db, req.user, student.student_id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  // Drive off the UNION of attendance rows AND note rows: a note written for
  // a session the student was never marked attended for (feedback can be
  // written on active enrollment alone — sessionRoutes PUT /:id/notes/:sid)
  // would otherwise be orphaned, since attendance and notes are separate
  // tables. Anchoring on either surfaces attended-but-noteless,
  // noted-but-unattended, and both. Both sa and n are LEFT JOINed back on.
  const { rows } = await req.db.query(
    `WITH student_sessions AS (
       SELECT session_id FROM session_attendance WHERE student_id = $1
       UNION
       SELECT session_id FROM session_notes WHERE student_id = $1
     )
     SELECT cs.session_id, cs.starts_at, cs.ends_at, cs.status AS session_status,
            sub.name AS subject, c.class_id, c.class_type,
            sa.status AS attendance_status, sa.auto_completed, sa.marked_at,
            n.performance, n.improvements, n.free_notes, n.edited_at, n.versions,
            n.created_at AS note_created_at
       FROM student_sessions ss
       JOIN class_sessions cs ON cs.session_id = ss.session_id
       JOIN classes c ON c.class_id = cs.class_id
       JOIN subjects sub ON sub.subject_id = c.subject_id
       LEFT JOIN session_attendance sa ON sa.session_id = ss.session_id AND sa.student_id = $1
       LEFT JOIN session_notes n ON n.session_id = ss.session_id AND n.student_id = $1
      ORDER BY cs.starts_at DESC LIMIT $2`,
    [student.student_id, limit]);

  const isStaff = req.user.role === 'staff';
  const entries = rows.map(r => ({
    session_id: r.session_id, starts_at: r.starts_at, ends_at: r.ends_at,
    session_status: r.session_status, subject: r.subject,
    class_id: r.class_id, class_type: r.class_type,
    attendance: r.attendance_status
      ? { status: r.attendance_status, auto_completed: r.auto_completed, marked_at: r.marked_at }
      : null,
    note: (r.performance || r.improvements || r.free_notes) ? {
      performance: r.performance, improvements: r.improvements, free_notes: r.free_notes,
      edited_at: r.edited_at,
      edit_count: (r.versions ?? []).length,
      edit_history: (r.versions ?? []).map(v => v.edited_at),
      ...(isStaff ? { versions: r.versions ?? [] } : {})
    } : null
  }));
  res.json({ student_id: student.student_id, entries });
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
