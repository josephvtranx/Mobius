-- Up Migration
-- Class announcement threads (messaging model decision, 2026-08-13):
-- conversations grow a kind. 'dm' = the existing two-person thread.
-- 'class' = one thread per class where the instructor/staff post and the
-- roster (students + their guardians) read. Access to 'class' threads is
-- DERIVED from enrollment/guardian links at read time — participants rows
-- are only used to track last_read_at for whoever has opened the thread,
-- so roster changes never need participant bookkeeping.
ALTER TABLE conversations
  ADD COLUMN kind TEXT NOT NULL DEFAULT 'dm' CHECK (kind IN ('dm','class')),
  ADD COLUMN class_id UUID REFERENCES classes(class_id) ON DELETE CASCADE;

-- One announcement thread per class.
CREATE UNIQUE INDEX idx_conversations_class ON conversations (class_id) WHERE class_id IS NOT NULL;

-- Down Migration
DROP INDEX idx_conversations_class;
ALTER TABLE conversations DROP COLUMN class_id, DROP COLUMN kind;
