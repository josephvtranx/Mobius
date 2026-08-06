-- Up Migration

-- Real two-way messaging (distinct from notification_log, which is a
-- one-directional system-event log with no sender/body). 1:1 threads only —
-- the design shows no group-chat UX. last_read_at per participant is enough
-- to derive an unread count without per-message read rows.

CREATE TABLE conversations (
  conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  user_id         INT  NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  last_read_at    TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX idx_conversation_participants_user ON conversation_participants (user_id);

CREATE TABLE messages (
  message_id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  sender_id       INT  NOT NULL REFERENCES users(user_id),
  body            TEXT NOT NULL CHECK (length(btrim(body)) > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);

-- Down Migration

DROP TABLE messages;
DROP TABLE conversation_participants;
DROP TABLE conversations;
