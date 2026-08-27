// Staff task inbox (server: /api/staff-tasks). staff_tasks is populated by
// many flows (billing/schedule jobs, membership + termination + unlock +
// appeal routes) but had NO generic list or resolve endpoint — only the
// aggregate counts in reportRoutes /dashboard. Five of the nine task kinds
// (auto_complete_verify, reschedule_escalation, booking_escalation,
// appeal_review, instructor_termination_request) had no code path that
// ever closed them, so they accumulated forever. This gives staff a real
// queue and a manual resolve (done/dismissed) for every kind — INV-6
// "humans execute consequences". join/leave tasks additionally auto-close
// when their membership request is approved/declined (see classRoutes).
import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

const OPEN_STATUSES = ['open', 'in_progress'];

// Enrich each task with a student name and class subject where the
// details JSON carries them (student_id is INT, class_id is UUID; both are
// optional per kind). Urgent first, then oldest first.
const LIST_SQL = `
  SELECT t.task_id, t.kind, t.urgency, t.subject_type, t.subject_id,
         t.details, t.status, t.created_at, t.resolved_at,
         c.class_id, session.session_id,
         su.name AS student_name,
         sub.name AS subject
    FROM staff_tasks t
    LEFT JOIN users su ON su.user_id::text = t.details->>'student_id'
    LEFT JOIN class_sessions session ON session.session_id::text = COALESCE(
      t.details->>'session_id', CASE WHEN t.subject_type IN ('session','class_session') THEN t.subject_id END)
    LEFT JOIN classes c ON c.class_id::text = COALESCE(
      t.details->>'class_id', session.class_id::text,
      CASE WHEN t.subject_type = 'class' THEN t.subject_id END)
    LEFT JOIN subjects sub ON sub.subject_id = c.subject_id
   WHERE t.status = ANY($1)
   ORDER BY (t.urgency = 'urgent') DESC, t.created_at ASC
   LIMIT 500`;

// GET /?status=open|in_progress|done|dismissed|all (default: open+in_progress)
router.get('/', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { status } = req.query;
  if (status !== undefined && !['open', 'in_progress', 'done', 'dismissed', 'all'].includes(status)) {
    return res.status(400).json({ message: 'Invalid task status' });
  }
  const statuses = status === 'all'
    ? ['open', 'in_progress', 'done', 'dismissed']
    : status ? [status] : OPEN_STATUSES;
  const { rows } = await req.db.query(LIST_SQL, [statuses]);
  const { rows: [counts] } = await req.db.query(
    `SELECT count(*) FILTER (WHERE status IN ('open','in_progress'))::int AS open_count,
            count(*) FILTER (WHERE status = ANY($1))::int AS total_count FROM staff_tasks`, [statuses]);
  res.json({ tasks: rows, ...counts });
});

// Lightweight badge count — the open/in-progress task total. Its own tiny
// endpoint so the sidebar badge doesn't pull the whole list on every load.
router.get('/count', authenticateToken, authorizeRole('staff'), async (req, res) => {
  const { rows: [{ n }] } = await req.db.query(
    `SELECT count(*)::int AS n FROM staff_tasks WHERE status IN ('open','in_progress')`);
  res.json({ open_count: n });
});

// POST /:id/resolve  body { action: 'done' | 'dismissed' }
router.post('/:id/resolve', authenticateToken, authorizeRole('staff'), async (req, res) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) {
    return res.status(400).json({ message: 'Invalid task id' });
  }
  const { action } = req.body;
  if (!['done', 'dismissed'].includes(action)) {
    return res.status(400).json({ message: "action must be 'done' or 'dismissed'" });
  }
  // Conditional update prevents two staff members overwriting each other's resolution.
  const { rows: [updated] } = await req.db.query(
    `UPDATE staff_tasks SET status = $1, resolved_by = $2, resolved_at = CURRENT_TIMESTAMP
      WHERE task_id = $3 AND status IN ('open','in_progress')
      RETURNING task_id, status, resolved_at`,
    [action, req.user.user_id, req.params.id]);
  if (!updated) {
    const { rows: [task] } = await req.db.query(
      `SELECT status FROM staff_tasks WHERE task_id = $1`, [req.params.id]);
    return res.status(task ? 409 : 404).json({
      message: task ? `Task is already ${task.status}. Refresh the inbox.` : 'Task not found'
    });
  }
  res.json(updated);
});

export default router;
