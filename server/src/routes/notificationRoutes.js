// In-app notifications (server: /api/notifications). notify.js writes a
// channel='in_app' notification_log row for every automated side-effect
// (wallet credited, low/negative balance, price/schedule change, session
// cancelled, class terminated, membership request resolved, …) addressed
// to each recipient user — but nothing ever exposed them to the UI. This
// backs the header notification bell + feed for every role. Unread is
// derived from status (in_app rows are inserted 'queued'; opening the feed
// flips them to 'read').
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET / — the caller's recent in-app notifications, newest first.
router.get('/', authenticateToken, async (req, res) => {
  const { rows } = await req.db.query(
    `SELECT notification_id, event_type, subject_type, subject_id, payload,
            (status = 'read') AS read, created_at
       FROM notification_log
      WHERE recipient_user_id = $1 AND channel = 'in_app'
      ORDER BY created_at DESC
      LIMIT 50`,
    [req.user.user_id]);
  const unread = rows.filter((r) => !r.read).length;
  res.json({ notifications: rows, unread });
});

// GET /count — just the unread badge number.
router.get('/count', authenticateToken, async (req, res) => {
  const { rows: [{ n }] } = await req.db.query(
    `SELECT count(*)::int AS n FROM notification_log
      WHERE recipient_user_id = $1 AND channel = 'in_app' AND status <> 'read'`,
    [req.user.user_id]);
  res.json({ unread: n });
});

// POST /read — mark all the caller's in-app notifications read (or a subset
// via body.ids). Only touches the caller's own rows.
router.post('/read', authenticateToken, async (req, res) => {
  const { ids } = req.body;
  if (Array.isArray(ids) && ids.length) {
    await req.db.query(
      `UPDATE notification_log SET status = 'read'
        WHERE recipient_user_id = $1 AND channel = 'in_app' AND notification_id = ANY($2)`,
      [req.user.user_id, ids]);
  } else {
    await req.db.query(
      `UPDATE notification_log SET status = 'read'
        WHERE recipient_user_id = $1 AND channel = 'in_app' AND status <> 'read'`,
      [req.user.user_id]);
  }
  res.json({ ok: true });
});

export default router;
