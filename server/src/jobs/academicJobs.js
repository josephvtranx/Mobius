// Academic background jobs (spec 06/08) as plain exported functions —
// scheduler wiring is Phase 7.6. Same conventions as the other job files:
// (db, now?) with `now` a UTC ISO string used as a SQL parameter.
import { DateTime } from 'luxon';
import { getSettings } from '../helpers/institutionSettings.js';
import { logNotifications } from '../helpers/notify.js';

// Nudge, not gate (spec 06): sessions ended > attendance_autocomplete_hours
// ago that HAVE attendance marks but are missing notes (no row, or all
// template fields empty) → one reminder to the instructor per session,
// deduped via notification_log. Same timer as the auto-completer — one timer,
// two nudges. The payload carries session_id: the deep-link back to the
// attendance+notes surface, pre-filtered to missing entries.
export async function runNotesReminder(db, now = DateTime.utc().toISO()) {
  const settings = await getSettings(db);
  const cutoff = DateTime.fromISO(now).minus({ hours: settings.attendance_autocomplete_hours }).toISO();

  const { rows: sessions } = await db.query(
    `SELECT DISTINCT cs.session_id, cs.instructor_id, cs.starts_at
       FROM class_sessions cs
       JOIN session_attendance sa ON sa.session_id = cs.session_id
      WHERE cs.ends_at < $1
        AND EXISTS (SELECT 1 FROM session_attendance sa2
                     LEFT JOIN session_notes n ON n.session_id = sa2.session_id
                                              AND n.student_id = sa2.student_id
                     WHERE sa2.session_id = cs.session_id
                       AND (n.note_id IS NULL OR (n.performance IS NULL AND
                            n.improvements IS NULL AND n.free_notes IS NULL)))
        AND NOT EXISTS (SELECT 1 FROM notification_log nl
                         WHERE nl.event_type = 'notes_pending'
                           AND nl.subject_type = 'class_session'
                           AND nl.subject_id = cs.session_id::text)`,
    [cutoff]);

  for (const session of sessions) {
    await logNotifications(db, {
      eventType: 'notes_pending', recipientUserIds: [session.instructor_id],
      subjectType: 'class_session', subjectId: session.session_id,
      payload: { session_id: session.session_id, starts_at: session.starts_at }
    });
  }
  return { reminded: sessions.length };
}
