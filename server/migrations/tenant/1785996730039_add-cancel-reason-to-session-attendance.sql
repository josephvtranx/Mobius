-- Up Migration
-- RSC-2 cancel reason/note (design handoff: Mobius Guardian.dc.html "Report
-- Absence" modal — reason chips + a free-text note for the tutor). The
-- cancel endpoint (sessionRoutes.js POST /:id/cancel) only ever accepted
-- student_id; there was nowhere on session_attendance to put a reason even
-- if it had. Both are optional — cancels made outside this UI (e.g. staff
-- correcting attendance directly) never set them.
ALTER TABLE session_attendance
  ADD COLUMN cancel_reason TEXT CHECK (cancel_reason IN
             ('illness','transportation','schedule_conflict','family_emergency','other')),
  ADD COLUMN cancel_note TEXT;

-- Down Migration
ALTER TABLE session_attendance
  DROP COLUMN cancel_reason,
  DROP COLUMN cancel_note;
