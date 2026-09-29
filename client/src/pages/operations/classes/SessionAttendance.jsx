// v2 one-pass attendance + notes (spec 04/06 ACA-1): one batch save writes
// attendance and per-student note templates together. Server results
// (deltas, balances, ATTENDANCE_BLOCKED / RECORD_LOCKED) render verbatim.
// Design: handoff README "Take attendance" — four-state marking grid,
// mark-all shortcuts, progress readout, live consequence line, and a
// Write-feedback follow-up. The real backend only supports three marks an
// instructor can choose here (present / absent_unexcused) — there's no "late"
// status in the schema, so that state from the prototype isn't offered. Staff
// are redirected to the read-only attendance log instead of this editor.
import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import classService from '@/services/classService';
import sessionServiceV2 from '@/services/sessionServiceV2';
import authService from '@/services/authService';
import { isoToLocal } from 'mobius-lms';
import '@/css/attendance.css';

const STATUS_META = {
  present: { label: 'Present', icon: 'fa-solid fa-check', tone: 'success' },
  absent_unexcused: { label: 'Absent', icon: 'fa-solid fa-xmark', tone: 'error' },
  absent_excused: { label: 'Excused', icon: 'fa-solid fa-notes-medical', tone: 'info' },
};
const NOTE_FIELDS = ['performance', 'improvements', 'free_notes'];

function SessionAttendance() {
  const { classId, sessionId } = useParams();
  const role = authService.getCurrentUser()?.role;
  const allowedStatuses = ['present', 'absent_unexcused'];

  const [cls, setCls] = useState(null);
  const [marks, setMarks] = useState({});   // student_id -> { status, note, noteOpen }
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [unlock, setUnlock] = useState({}); // student_id -> 'busy' | 'requested' | error message

  // ACA-4: when a save reports a note couldn't be written because the
  // record is locked, the instructor can ask staff to unlock it.
  const requestUnlock = (studentId) => async () => {
    setUnlock((u) => ({ ...u, [studentId]: 'busy' }));
    try {
      await sessionServiceV2.requestNoteUnlock(sessionId, studentId);
      setUnlock((u) => ({ ...u, [studentId]: 'requested' }));
    } catch (err) {
      setUnlock((u) => ({ ...u, [studentId]: err.response?.data?.message || 'Request failed' }));
    }
  };

  useEffect(() => {
    classService.getClass(classId)
      .then((c) => {
        setCls(c);
        const initial = {};
        for (const r of c.roster) {
          if (r.status === 'active') initial[r.student_id] = { status: null, note: {}, noteOpen: false };
        }
        setMarks(initial);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load class'));
  }, [classId]);

  const session = cls?.sessions.find((s) => s.session_id === sessionId);
  const roster = cls?.roster.filter((r) => marks[r.student_id]) ?? [];
  const total = roster.length;
  const markedCount = roster.filter((r) => marks[r.student_id]?.status).length;
  const allMarked = total > 0 && markedCount === total;

  const setStatus = (sid, status) =>
    setMarks((m) => ({ ...m, [sid]: { ...m[sid], status } }));
  const setNote = (sid, field, value) =>
    setMarks((m) => ({ ...m, [sid]: { ...m[sid], note: { ...m[sid].note, [field]: value } } }));
  const toggleNote = (sid) =>
    setMarks((m) => ({ ...m, [sid]: { ...m[sid], noteOpen: !m[sid].noteOpen } }));
  const markAll = (status) =>
    setMarks((m) => {
      const next = { ...m };
      for (const r of roster) next[r.student_id] = { ...next[r.student_id], status };
      return next;
    });

  const absentCount = roster.filter((r) => marks[r.student_id]?.status === 'absent_unexcused').length;
  const excusedCount = roster.filter((r) => marks[r.student_id]?.status === 'absent_excused').length;
  const cost = cls?.session_credit_cost ?? 0;

  const save = async () => {
    setError('');
    setResults(null);
    setSaving(true);
    const payload = Object.entries(marks).map(([student_id, m]) => {
      const mark = { student_id: Number(student_id), status: m.status };
      if (NOTE_FIELDS.some((f) => m.note[f])) mark.note = m.note;
      return mark;
    });
    try {
      const res = await sessionServiceV2.markAttendance(sessionId, payload);
      setResults(res);
    } catch (err) {
      setError(`${err.response?.data?.code ?? ''} ${err.response?.data?.message ?? 'Save failed'}`.trim());
    } finally {
      setSaving(false);
    }
  };

  if (role === 'staff') {
    return <Navigate to={`/operations/attendance?session=${sessionId}`} replace />;
  }

  if (!cls) return <div className="at-page">{error ? <div className="hm-error">{error}</div> : 'Loading…'}</div>;

  return (
    <div className="at-page">
      <p><Link to={`/operations/classes/${classId}`} className="hm-link">← Back to class</Link></p>
      <h1 className="at-title">Take attendance</h1>
      {session && (
        <p className="at-subtitle">
          {isoToLocal(session.starts_at).toFormat('ccc, LLL d · h:mm a')} – {isoToLocal(session.ends_at).toFormat('h:mm a')}
        </p>
      )}
      {error && <div className="hm-error">{error}</div>}

      {!results && (
        <>
          <div className="at-toolbar">
            <div className="at-mark-all">
              <span>Mark all:</span>
              <button type="button" className="hm-btn" onClick={() => markAll('present')}>Present</button>
              <button type="button" className="hm-btn" onClick={() => markAll('absent_unexcused')}>Absent</button>
            </div>
            <div className="at-progress">{markedCount} of {total} marked</div>
          </div>

          <ul className="at-roster">
            {roster.map((r) => {
              const mark = marks[r.student_id];
              return (
                <li key={r.student_id} className="at-row">
                  <span className="at-name" id={`at-name-${r.student_id}`}>{r.name}</span>
                  <div className="at-states" role="radiogroup" aria-labelledby={`at-name-${r.student_id}`}>
                    {allowedStatuses.map((status) => {
                      const meta = STATUS_META[status];
                      const active = mark.status === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          aria-label={meta.label}
                          className={`at-state-btn at-state-btn--${meta.tone} ${active ? 'active' : ''}`}
                          title={meta.label}
                          onClick={() => setStatus(r.student_id, status)}
                        >
                          <i className={meta.icon} aria-hidden="true"></i>
                        </button>
                      );
                    })}
                    <button type="button" className="hm-link at-note-toggle" onClick={() => toggleNote(r.student_id)}>
                      {mark.noteOpen ? 'Hide note' : 'Add note'}
                    </button>
                  </div>
                  {mark.noteOpen && (
                    <div className="at-note">
                      <input placeholder="Performance" value={mark.note.performance || ''}
                        onChange={(e) => setNote(r.student_id, 'performance', e.target.value)} />
                      <input placeholder="Improvements" value={mark.note.improvements || ''}
                        onChange={(e) => setNote(r.student_id, 'improvements', e.target.value)} />
                      <input placeholder="Notes" value={mark.note.free_notes || ''}
                        onChange={(e) => setNote(r.student_id, 'free_notes', e.target.value)} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {(absentCount > 0 || excusedCount > 0) && (
            <p className="at-consequence">
              {absentCount > 0 && <>{absentCount} absence{absentCount === 1 ? '' : 's'} — billed {cost * absentCount} credits, deducted from the student's balance</>}
              {absentCount > 0 && excusedCount > 0 && ' · '}
              {excusedCount > 0 && <>{excusedCount} excused — no charge, credit returned</>}
            </p>
          )}

          <button type="button" className="hm-btn primary at-save" disabled={!allMarked || saving} onClick={save}>
            {saving ? 'Saving…' : 'Save all'}
          </button>
        </>
      )}

      {results && (
        <div className="at-results" role="status" aria-live="polite">
          <h2>Saved — session {results.session_status}</h2>
          <ul className="at-results-list">
            {results.results.map((r) => {
              const student = roster.find((x) => x.student_id === r.student_id);
              // A note that couldn't be written because the record is locked
              // surfaces either as r.note_error or a RECORD_LOCKED code.
              const locked = /lock/i.test(`${r.note_error ?? ''} ${r.code ?? ''}`);
              const u = unlock[r.student_id];
              return (
                <li key={r.student_id}>
                  <strong>{student?.name ?? r.student_id}</strong>{' — '}
                  {r.ok
                    ? `${STATUS_META[r.status]?.label ?? r.status} (Δ${r.delta} → balance ${r.balance})${r.note_saved ? ' · note saved' : ''}${r.note_error ? ` · note: ${r.note_error}` : ''}`
                    : `${r.code ?? ''} ${r.message ?? ''}`}
                  {locked && role !== 'staff' && (
                    u === 'requested'
                      ? <span className="hm-badge" style={{ marginLeft: 8 }}>unlock requested</span>
                      : u && u !== 'busy'
                        ? <span style={{ marginLeft: 8, color: 'var(--status-error)', fontSize: 12 }}>{u}</span>
                        : <button type="button" className="hm-link" style={{ marginLeft: 8 }}
                            disabled={u === 'busy'} onClick={requestUnlock(r.student_id)}>
                            {u === 'busy' ? 'Requesting…' : 'Request unlock'}
                          </button>
                  )}
                </li>
              );
            })}
          </ul>
          <Link to={`/operations/classes/${classId}`} className="hm-btn primary">Back to class</Link>
        </div>
      )}
    </div>
  );
}

export default SessionAttendance;
