// Real two-way messaging (server: /api/messages). Polling-based (no
// websocket/realtime layer) — the client re-fetches an open thread and the
// conversation list on a timer.
//
// Messaging model (decision 2026-08-13, after paradigm research):
// - 'dm' conversations: two participants, relationship-gated (canMessage).
// - 'class' conversations: one announcement thread per class. Posting is
//   instructor-of-class or staff; reading is the roster (enrolled students +
//   their guardians). Access is DERIVED at read time, never stored — roster
//   changes need no participant bookkeeping. Participant rows on class
//   threads only track last_read_at for whoever opened them.
// - Safeguarding tier: staff may READ any thread, and a guardian may READ
//   their child's threads (oversight — shown read-only, and reading never
//   marks the child's own unread state). Messages are never deletable.
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { canMessage, getContacts } from '../helpers/messaging.js';
import { withTransaction } from '../helpers/withTransaction.js';

const router = express.Router();

// ---------------------------------------------------------------------------
// Access helpers
// ---------------------------------------------------------------------------
async function isParticipant(db, conversationId, userId) {
  const { rows } = await db.query(
    `SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2`,
    [conversationId, userId]);
  return rows.length > 0;
}

// { read, post } for a class announcement thread's class.
async function classAccess(db, user, classId) {
  if (user.role === 'staff') return { read: true, post: true };
  if (user.role === 'instructor') {
    const { rows } = await db.query(
      `SELECT 1 FROM classes WHERE class_id = $1 AND instructor_id = $2`, [classId, user.user_id]);
    return { read: rows.length > 0, post: rows.length > 0 };
  }
  if (user.role === 'student') {
    const { rows } = await db.query(
      `SELECT 1 FROM enrollments WHERE class_id = $1 AND student_id = $2 AND status = 'active'`,
      [classId, user.user_id]);
    return { read: rows.length > 0, post: false };
  }
  if (user.role === 'guardian') {
    const { rows } = await db.query(
      `SELECT 1 FROM enrollments e
         JOIN student_guardians sg ON sg.student_id = e.student_id
         JOIN guardians g ON g.guardian_id = sg.guardian_id
        WHERE e.class_id = $1 AND g.user_id = $2 AND e.status = 'active'`,
      [classId, user.user_id]);
    return { read: rows.length > 0, post: false };
  }
  return { read: false, post: false };
}

// Guardian oversight: is one of the caller's linked children a participant?
async function isGuardianOfParticipant(db, guardianUserId, conversationId) {
  const { rows } = await db.query(
    `SELECT 1 FROM conversation_participants cp
       JOIN student_guardians sg ON sg.student_id = cp.user_id
       JOIN guardians g ON g.guardian_id = sg.guardian_id
      WHERE cp.conversation_id = $1 AND g.user_id = $2 LIMIT 1`,
    [conversationId, guardianUserId]);
  return rows.length > 0;
}

// Resolves how the caller may interact with a conversation.
// mode: 'participant' | 'class' | 'oversight' | null; post: boolean
async function conversationAccess(db, user, conversationId) {
  const { rows: [conv] } = await db.query(
    `SELECT conversation_id, kind, class_id FROM conversations WHERE conversation_id = $1`,
    [conversationId]);
  if (!conv) return { mode: null };
  if (conv.kind === 'class') {
    const a = await classAccess(db, user, conv.class_id);
    if (a.read) return { mode: 'class', post: a.post, conv };
    return { mode: null };
  }
  if (await isParticipant(db, conversationId, user.user_id)) return { mode: 'participant', post: true, conv };
  if (user.role === 'staff') return { mode: 'oversight', post: false, conv };
  if (user.role === 'guardian' && await isGuardianOfParticipant(db, user.user_id, conversationId)) {
    return { mode: 'oversight', post: false, conv };
  }
  return { mode: null };
}

// ---------------------------------------------------------------------------
// GET /contacts — who the caller may start a new DM with.
// ---------------------------------------------------------------------------
router.get('/contacts', authenticateToken, async (req, res) => {
  const contacts = await getContacts(req.db, req.user);
  res.json(contacts);
});

// ---------------------------------------------------------------------------
// GET /announceable — classes the caller may post announcements to (feeds
// the "New message" picker for instructors/staff).
// ---------------------------------------------------------------------------
router.get('/announceable', authenticateToken, async (req, res) => {
  if (req.user.role !== 'staff' && req.user.role !== 'instructor') return res.json([]);
  const { rows } = await req.db.query(
    `SELECT c.class_id, sub.name AS subject, c.class_type
       FROM classes c JOIN subjects sub ON sub.subject_id = c.subject_id
      WHERE c.status = 'active' AND c.class_type = 'group'
        ${req.user.role === 'instructor' ? 'AND c.instructor_id = $1' : ''}
      ORDER BY sub.name`,
    req.user.role === 'instructor' ? [req.user.user_id] : []);
  res.json(rows);
});

// ---------------------------------------------------------------------------
// GET /conversations — the caller's threads, newest first: their DMs, class
// announcement threads they can read, and (guardians) their children's DMs
// as read-only oversight rows.
// ---------------------------------------------------------------------------
router.get('/conversations', authenticateToken, async (req, res) => {
  const uid = req.user.user_id;
  const { rows: dms } = await req.db.query(
    `SELECT c.conversation_id, 'dm' AS kind, c.last_message_at,
            other_u.user_id AS other_user_id, other_u.name AS other_name, other_u.role AS other_role,
            lm.body AS last_message_body,
            (c.last_message_at > COALESCE(me.last_read_at, '-infinity'::timestamptz)
             AND lm.sender_id <> $1) AS unread,
            true AS can_post, false AS oversight, NULL::text AS child_name
       FROM conversation_participants me
       JOIN conversations c ON c.conversation_id = me.conversation_id AND c.kind = 'dm'
       JOIN conversation_participants other ON other.conversation_id = c.conversation_id AND other.user_id <> $1
       JOIN users other_u ON other_u.user_id = other.user_id
       LEFT JOIN LATERAL (
         SELECT body, sender_id FROM messages m
          WHERE m.conversation_id = c.conversation_id ORDER BY m.created_at DESC LIMIT 1
       ) lm ON true
      WHERE me.user_id = $1`, [uid]);

  // Class announcement threads (access derived per role).
  const classWhere = {
    staff: 'true',
    instructor: 'c2.instructor_id = $1',
    student: `EXISTS (SELECT 1 FROM enrollments e WHERE e.class_id = c2.class_id AND e.student_id = $1 AND e.status = 'active')`,
    guardian: `EXISTS (SELECT 1 FROM enrollments e JOIN student_guardians sg ON sg.student_id = e.student_id
                        JOIN guardians g ON g.guardian_id = sg.guardian_id
                       WHERE e.class_id = c2.class_id AND g.user_id = $1 AND e.status = 'active')`,
  }[req.user.role] ?? 'false';
  const canPostClass = req.user.role === 'staff' ? 'true' : req.user.role === 'instructor' ? 'c2.instructor_id = $1' : 'false';
  const { rows: classThreads } = await req.db.query(
    `SELECT c.conversation_id, 'class' AS kind, c.last_message_at, c.class_id,
            sub.name || ' · announcements' AS other_name, 'class' AS other_role,
            lm.body AS last_message_body,
            (c.last_message_at > COALESCE(me.last_read_at, '-infinity'::timestamptz)
             AND COALESCE(lm.sender_id, 0) <> $1 AND lm.body IS NOT NULL) AS unread,
            ${canPostClass} AS can_post, false AS oversight, NULL::text AS child_name
       FROM conversations c
       JOIN classes c2 ON c2.class_id = c.class_id
       JOIN subjects sub ON sub.subject_id = c2.subject_id
       LEFT JOIN conversation_participants me ON me.conversation_id = c.conversation_id AND me.user_id = $1
       LEFT JOIN LATERAL (
         SELECT body, sender_id FROM messages m
          WHERE m.conversation_id = c.conversation_id ORDER BY m.created_at DESC LIMIT 1
       ) lm ON true
      WHERE c.kind = 'class' AND ${classWhere}`, [uid]);

  // Guardian oversight: children's DM threads, read-only.
  let oversight = [];
  if (req.user.role === 'guardian') {
    ({ rows: oversight } = await req.db.query(
      `SELECT c.conversation_id, 'dm' AS kind, c.last_message_at,
              other_u.user_id AS other_user_id, other_u.name AS other_name, other_u.role AS other_role,
              lm.body AS last_message_body,
              false AS unread, false AS can_post, true AS oversight, child_u.name AS child_name
         FROM student_guardians sg
         JOIN guardians g ON g.guardian_id = sg.guardian_id AND g.user_id = $1
         JOIN users child_u ON child_u.user_id = sg.student_id
         JOIN conversation_participants child ON child.user_id = sg.student_id
         JOIN conversations c ON c.conversation_id = child.conversation_id AND c.kind = 'dm'
         JOIN conversation_participants other ON other.conversation_id = c.conversation_id AND other.user_id <> child.user_id
         JOIN users other_u ON other_u.user_id = other.user_id
         LEFT JOIN LATERAL (
           SELECT body, sender_id FROM messages m
            WHERE m.conversation_id = c.conversation_id ORDER BY m.created_at DESC LIMIT 1
         ) lm ON true`, [uid]));
  }

  const all = [...dms, ...classThreads, ...oversight]
    .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
  res.json(all);
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
       JOIN conversations c ON c.conversation_id = cp1.conversation_id AND c.kind = 'dm'
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

// ---------------------------------------------------------------------------
// POST /conversations/class/:classId — get-or-create the class's
// announcement thread (posting rights required).
// ---------------------------------------------------------------------------
router.post('/conversations/class/:classId', authenticateToken, async (req, res) => {
  const classId = req.params.classId;
  const access = await classAccess(req.db, req.user, classId);
  if (!access.post) return res.status(403).json({ message: 'Only the class instructor or staff can announce' });

  const { rows: [existing] } = await req.db.query(
    `SELECT conversation_id FROM conversations WHERE class_id = $1`, [classId]);
  if (existing) return res.json({ conversation_id: existing.conversation_id });

  const { rows: [conv] } = await req.db.query(
    `INSERT INTO conversations (kind, class_id) VALUES ('class', $1) RETURNING conversation_id`, [classId]);
  res.status(201).json(conv);
});

// ---------------------------------------------------------------------------
// GET /conversations/:id/messages — fetch a thread. Participants and class
// readers mark it read as a side effect; oversight reads (staff / guardian)
// never touch anyone's read state.
// ---------------------------------------------------------------------------
router.get('/conversations/:id/messages', authenticateToken, async (req, res) => {
  const conversationId = req.params.id;
  const access = await conversationAccess(req.db, req.user, conversationId);
  if (!access.mode) return res.status(403).json({ message: 'Not a participant in this conversation' });

  const { rows } = await req.db.query(
    `SELECT m.message_id, m.sender_id, u.name AS sender_name, m.body, m.created_at
       FROM messages m JOIN users u ON u.user_id = m.sender_id
      WHERE m.conversation_id = $1 ORDER BY m.created_at ASC`, [conversationId]);

  if (access.mode === 'participant') {
    await req.db.query(
      `UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP
        WHERE conversation_id = $1 AND user_id = $2`, [conversationId, req.user.user_id]);
  } else if (access.mode === 'class') {
    await req.db.query(
      `INSERT INTO conversation_participants (conversation_id, user_id, last_read_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (conversation_id, user_id) DO UPDATE SET last_read_at = CURRENT_TIMESTAMP`,
      [conversationId, req.user.user_id]);
  }
  res.json({ messages: rows, can_post: !!access.post, mode: access.mode });
});

// ---------------------------------------------------------------------------
// POST /conversations/:id/messages — send a message (DM participant, or
// class-thread poster).
// ---------------------------------------------------------------------------
router.post('/conversations/:id/messages', authenticateToken, async (req, res) => {
  const conversationId = req.params.id;
  const body = req.body.body?.trim();
  if (!body) return res.status(400).json({ message: 'body is required' });
  const access = await conversationAccess(req.db, req.user, conversationId);
  if (!access.mode || !access.post) {
    return res.status(403).json({ message: 'You cannot post in this conversation' });
  }

  const message = await withTransaction(req.db, async (client) => {
    const { rows: [msg] } = await client.query(
      `INSERT INTO messages (conversation_id, sender_id, body) VALUES ($1,$2,$3) RETURNING *`,
      [conversationId, req.user.user_id, body]);
    await client.query(
      `UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE conversation_id = $1`,
      [conversationId]);
    await client.query(
      `INSERT INTO conversation_participants (conversation_id, user_id, last_read_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (conversation_id, user_id) DO UPDATE SET last_read_at = CURRENT_TIMESTAMP`,
      [conversationId, req.user.user_id]);
    return msg;
  });
  res.status(201).json(message);
});

export default router;
