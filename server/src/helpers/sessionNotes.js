// Session-note writes (spec 06, INV-5): per-student per-session template,
// versioned edits, and the lock model. `locked_at` is a lock that TAKES EFFECT
// at that instant — a note is locked iff locked_at <= now; a FUTURE locked_at
// is an open ACA-4 unlock window (staff unlock stamps now+48h → auto-relock
// when it passes; runRecordLock only stamps NULL rows, so it never clobbers an
// open window). With no explicit stamp, the computed session-end + lock-days
// deadline applies — including to first writes.
import { DateTime } from 'luxon';

const toDt = (v) => (typeof v === 'string' ? DateTime.fromISO(v) : DateTime.fromJSDate(v));

export function noteLocked(note, session, settings, now = DateTime.utc().toISO()) {
  const nowDt = DateTime.fromISO(now);
  if (note && note.locked_at !== null && note.locked_at !== undefined) {
    return nowDt >= toDt(note.locked_at); // explicit stamp wins (incl. unlock windows)
  }
  return nowDt >= toDt(session.ends_at).plus({ days: settings.session_record_lock_days });
}

// Insert-or-edit inside the CALLER's transaction. Edits append the prior
// payload to `versions` (history is never rewritten — the portal shows the
// visible "edited" stamp) and refresh edited_at. Returns
// { ok:true, note, edited } or { ok:false, status, body } having written nothing.
export async function upsertNoteWithinTx(client, {
  session, studentId, fields, actorUserId, settings, now = DateTime.utc().toISO()
}) {
  const { rows: [existing] } = await client.query(
    `SELECT * FROM session_notes WHERE session_id = $1 AND student_id = $2 FOR UPDATE`,
    [session.session_id, studentId]);

  if (noteLocked(existing, session, settings, now)) {
    return { ok: false, status: 409, body: {
      code: 'RECORD_LOCKED',
      message: `This session's records are locked (${settings.session_record_lock_days}-day window) — file an unlock request`
    } };
  }

  const performance = fields.performance ?? null;
  const improvements = fields.improvements ?? null;
  const freeNotes = fields.free_notes ?? null;

  if (existing) {
    const versions = [...(existing.versions ?? []), {
      performance: existing.performance, improvements: existing.improvements,
      free_notes: existing.free_notes,
      edited_at: existing.edited_at ?? existing.created_at
    }];
    const { rows: [note] } = await client.query(
      `UPDATE session_notes
          SET performance = $1, improvements = $2, free_notes = $3,
              versions = $4, edited_at = CURRENT_TIMESTAMP
        WHERE note_id = $5 RETURNING *`,
      [performance, improvements, freeNotes, JSON.stringify(versions), existing.note_id]);
    return { ok: true, note, edited: true };
  }

  const { rows: [note] } = await client.query(
    `INSERT INTO session_notes (session_id, student_id, performance, improvements, free_notes, created_by)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [session.session_id, studentId, performance, improvements, freeNotes, actorUserId]);
  return { ok: true, note, edited: false };
}
