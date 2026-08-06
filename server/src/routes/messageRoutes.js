// Real two-way messaging (server: /api/messages). conversations/messages
// are brand new — unlike payroll/payments/rooms there was no unused
// schema for this feature at all. Polling-based (no websocket/realtime
// layer in this app) — the client re-fetches an open thread and the
// conversation list on a timer.
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { canMessage, getContacts } from '../helpers/messaging.js';
import { withTransaction } from '../helpers/withTransaction.js';

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /contacts — who the caller is allowed to start a new conversation
// with (staff: anyone; instructor/student/guardian: only real, active
// teaching relationships plus staff).
// ---------------------------------------------------------------------------
router.get('/contacts', authenticateToken, async (req, res) => {
  const contacts = await getContacts(req.db, req.user);
  res.json(contacts);
});

// ---------------------------------------------------------------------------
// GET /conversations — the caller's threads, newest first, with the other
// participant's name, a preview of the last message, and an unread flag
// derived from last_read_at (no stored unread counter to drift).
// ---------------------------------------------------------------------------
router.get('/conversations', authenticateToken, async (req, res) => {
  const { rows } = await req.db.query(
    `SELECT c.conversation_id, c.last_message_at, me.last_read_at,
            other_u.user_id AS other_user_id, other_u.name AS other_name, other_u.role AS other_role,
            lm.body AS last_message_body, lm.sender_id AS last_message_sender_id,
            (c.last_message_at > COALESCE(me.last_read_at, '-infinity'::timestamptz)
             AND lm.sender_id <> $1) AS unread
       FROM conversation_participants me
       JOIN conversations c ON c.conversation_id = me.conversation_id
       JOIN conversation_participants other ON other.conversation_id = c.conversation_id AND other.user_id <> $1
       JOIN users other_u ON other_u.user_id = other.user_id
       LEFT JOIN LATERAL (
         SELECT body, sender_id FROM messages m
          WHERE m.conversation_id = c.conversation_id ORDER BY m.created_at DESC LIMIT 1
       ) lm ON true
      WHERE me.user_id = $1
      ORDER BY c.last_message_at DESC`,
    [req.user.user_id]);
  res.json(rows);
});

// ---------------------------------------------------------------------------
// POST /conversations — start (or reuse) a 1:1 thread with recipient_user_id.
// ---------------------------------------------------------------------------
router.post('/conversations', authenticateToken, async (req, res) => {
  const recipientId = Number(req.body.recipient_user_id);
  if (!recipientId) return res.status(400).json({ message: 'recipient_user_id is required' });

  const { rows: [recipient] } = await req.db.query(
    `SELECT user_id, role FROM users WHERE user_id = $1 AND is_active = true`, [recipientId]);
  if (!recipient) return res.status(404).json({ message: 'Recipient not found' });
  if (!await canMessage(req.db, req.user, recipient)) {
    return res.status(403).json({ message: 'You are not able to message this person' });
  }

  const { rows: [existing] } = await req.db.query(
    `SELECT cp1.conversation_id
       FROM conversation_participants cp1
       JOIN conversation_participants cp2 ON cp2.conversation_id = cp1.conversation_id
      WHERE cp1.user_id = $1 AND cp2.user_id = $2
        AND (SELECT count(*) FROM conversation_participants WHERE conversation_id = cp1.conversation_id) = 2`,
    [req.user.user_id, recipientId]);
  if (existing) return res.json({ conversation_id: existing.conversation_id });

  const conversation = await withTransaction(req.db, async (client) => {
    const { rows: [conv] } = await client.query(
      `INSERT INTO conversations DEFAULT VALUES RETURNING conversation_id`);
    await client.query(
      `INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1,$2), ($1,$3)`,
      [conv.conversation_id, req.user.user_id, recipientId]);
    return conv;
  });
  res.status(201).json(conversation);
});

async function assertParticipant(db, conversationId, userId) {
  const { rows } = await db.query(
    `SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId]);
  return rows.length > 0;
}

// ---------------------------------------------------------------------------
// GET /conversations/:id/messages — fetch a thread (must be a participant);
// marks it read for the caller as a side effect of opening it.
// ---------------------------------------------------------------------------
router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
  const conversationId = req.params.id;
  if (!await assertParticipant(req.db, conversationId, req.user.user_id)) {
    return res.status(403).json({ message: 'Not a participant in this conversation' });
  }
  const { rows } = await req.db.query(
    `SELECT message_id, sender_id, body, created_at FROM messages
      WHERE conversation_id = $1 ORDER BY created_at ASC`, [conversationId]);
  await req.db.query(
    `UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = $1 AND user_id = $2`, [conversationId, req.user.user_id]);
  res.json(rows);
});

// ---------------------------------------------------------------------------
// POST /conversations/:id/messages — send a message (must be a participant).
// ---------------------------------------------------------------------------
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  const conversationId = req.params.id;
  const body = req.body.body?.trim();
  if (!body) return res.status(400).json({ message: 'body is required' });
  if (!await assertParticipant(req.db, conversationId, req.user.user_id)) {
    return res.status(403).json({ message: 'Not a participant in this conversation' });
  }

  const message = await withTransaction(req.db, async (client) => {
    const { rows: [msg] } = await client.query(
      `INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1,$2,$3) RETURNING *`,
      [conversationId, req.user.user_id, body]);
    await client.query(
      `UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE conversation_id = $1`,
      [conversationId]);
    await client.query(
      `UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP
        WHERE conversation_id = $1 AND user_id = $2`, [conversationId, req.user.user_id]);
    return msg;
  });
  res.status(201).json(message);
});

export default router;
