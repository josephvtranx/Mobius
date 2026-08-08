-- Up Migration

-- Postgres does not auto-index the referencing (child) side of a foreign
-- key. An FK-index audit (2026-08-08) found 34 FK columns with no covering
-- leading-column index. This adds indexes for the ones on growable tables
-- and cascade/join paths — the worst being that deleting a users or
-- students row fans out an unindexed scan across ~20 child columns. Tiny
-- singleton/lookup tables (institution_settings, financial_periods,
-- instructor_group_specialties, students.pa_code_id, student_guardians
-- .linked_by) are intentionally skipped — the write cost isn't worth it
-- at their scale. IF NOT EXISTS keeps this safe to re-run.

-- Tier 1: high-growth tables + cascade/SET NULL paths
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_session ON time_logs (associated_session_id) WHERE associated_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_attendance_marked_by ON session_attendance (marked_by) WHERE marked_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ledger_created_by ON credit_ledger (created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_created_by ON session_notes (created_by);
-- full (non-partial) instructor index so cascade/joins over ended/expired
-- rows are covered, not just the status-filtered partial indexes above
CREATE INDEX IF NOT EXISTS idx_slot_holds_instructor ON slot_holds (instructor_id);
CREATE INDEX IF NOT EXISTS idx_classes_instructor_all ON classes (instructor_id);

-- Tier 2: medium-growth / operational + user-cascade fan-out
CREATE INDEX IF NOT EXISTS idx_enrollments_joined_by ON enrollments (joined_by) WHERE joined_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_enrollments_removed_by ON enrollments (removed_by) WHERE removed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_payments_payment ON invoice_payments (payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_link ON payments (link_id) WHERE link_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments (method_id) WHERE method_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_refunds_ledger ON refunds (ledger_entry_id) WHERE ledger_entry_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_time_requests_class ON instructor_time_requests (class_id) WHERE class_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_hold ON reschedule_requests (hold_id) WHERE hold_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_requested_by ON reschedule_requests (requested_by);
CREATE INDEX IF NOT EXISTS idx_reschedule_requests_responded_by ON reschedule_requests (responded_by) WHERE responded_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_membership_requests_requested_by ON class_membership_requests (requested_by);
CREATE INDEX IF NOT EXISTS idx_membership_requests_resolved_by ON class_membership_requests (resolved_by) WHERE resolved_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_classes_booking_hold ON classes (booking_hold_id) WHERE booking_hold_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_classes_created_by ON classes (created_by);
CREATE INDEX IF NOT EXISTS idx_classes_default_room ON classes (default_room_id) WHERE default_room_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_price_history_set_by ON class_price_history (set_by);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned_to ON staff_tasks (assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_tasks_resolved_by ON staff_tasks (resolved_by) WHERE resolved_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_links_created_by ON payment_links (created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_slot_holds_student ON slot_holds (held_for_student_id) WHERE held_for_student_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_slot_holds_created_by ON slot_holds (created_by) WHERE created_by IS NOT NULL;

-- Down Migration

DROP INDEX IF EXISTS idx_messages_sender;
DROP INDEX IF EXISTS idx_time_logs_session;
DROP INDEX IF EXISTS idx_attendance_marked_by;
DROP INDEX IF EXISTS idx_ledger_created_by;
DROP INDEX IF EXISTS idx_notes_created_by;
DROP INDEX IF EXISTS idx_slot_holds_instructor;
DROP INDEX IF EXISTS idx_classes_instructor_all;
DROP INDEX IF EXISTS idx_enrollments_joined_by;
DROP INDEX IF EXISTS idx_enrollments_removed_by;
DROP INDEX IF EXISTS idx_invoice_payments_payment;
DROP INDEX IF EXISTS idx_payments_link;
DROP INDEX IF EXISTS idx_payments_method;
DROP INDEX IF EXISTS idx_refunds_ledger;
DROP INDEX IF EXISTS idx_time_requests_class;
DROP INDEX IF EXISTS idx_reschedule_requests_hold;
DROP INDEX IF EXISTS idx_reschedule_requests_requested_by;
DROP INDEX IF EXISTS idx_reschedule_requests_responded_by;
DROP INDEX IF EXISTS idx_membership_requests_requested_by;
DROP INDEX IF EXISTS idx_membership_requests_resolved_by;
DROP INDEX IF EXISTS idx_classes_booking_hold;
DROP INDEX IF EXISTS idx_classes_created_by;
DROP INDEX IF EXISTS idx_classes_default_room;
DROP INDEX IF EXISTS idx_price_history_set_by;
DROP INDEX IF EXISTS idx_staff_tasks_assigned_to;
DROP INDEX IF EXISTS idx_staff_tasks_resolved_by;
DROP INDEX IF EXISTS idx_payment_links_created_by;
DROP INDEX IF EXISTS idx_slot_holds_student;
DROP INDEX IF EXISTS idx_slot_holds_created_by;
