// Instructor Feedback (design handoff README > Instructor app > Feedback):
// "To write / Sent" tabs with counts. The real API has no endpoint to list
// notes already written or to filter "present students with no note yet" —
// session_notes has no bulk-read route (only the per-student PUT used to
// write one), and there's no rating field in the schema (session_notes is
// performance/improvements/free_notes text only, no 1-5 stars). So this
// isn't literally the two-tab queue from the design: it's an honest
// "write feedback for a student in one of your classes' recent sessions"
// surface, with a same-visit "written just now" list standing in for
// "Sent" (real writes, just not persisted read-back — a page reload won't
// know what was already written before this session).
import { useEffect, useState } from 'react';
import authService from '@/services/authService';
import instructorService from '@/services/instructorService';
import sessionServiceV2 from '@/services/sessionServiceV2';
import { isoToLocal } from 'mobius-lms';
import { DateTime } from 'luxon';
import '@/css/attendance.css';
import '@/css/my-classes.css';

function NoteForm({ sessionId, studentId, onSaved }) {
  const [performance, setPerformance] = useState('');
  const [improvements, setImprovements] = useState('');
  const [freeNotes, setFreeNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    setError('');
    if (!performance && !improvements && !freeNotes) {
      setError('Write at least one field.');
      return;
    }
    setSaving(true);
    try {
      await sessionServiceV2.putNote(sessionId, studentId, {
        performance: performance || undefined,
        improvements: improvements || undefined,
        free_notes: freeNotes || undefined,
      });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save this note');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fb-note-form">
      {error && <div className="hm-error">{error}</div>}
      <input placeholder="Performance" value={performance} onChange={(e) => setPerformance(e.target.value)} />
      <input placeholder="Improvements" value={improvements} onChange={(e) => setImprovements(e.target.value)} />
      <textarea placeholder="Notes" rows={2} value={freeNotes} onChange={(e) => setFreeNotes(e.target.value)} />
      <button type="button" className="hm-btn primary" disabled={saving} onClick={save}>
        {saving ? 'Saving…' : 'Send feedback'}
      </button>
    </div>
  );
}

function Feedback() {
  const instructorId = authService.getCurrentUser()?.user_id;
  const [classes, setClasses] = useState(null);
  const [error, setError] = useState('');
  const [openFor, setOpenFor] = useState(null); // "sessionId:studentId"
  const [sentThisVisit, setSentThisVisit] = useState(new Set());

  useEffect(() => {
    instructorService.getMyClasses(instructorId)
      .then(setClasses)
      .catch((err) => setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load your classes'));
  }, [instructorId]);

  if (error) return <div className="hm-error">{error}</div>;
  if (!classes) return <div className="hm-loading">Loading…</div>;

  const now = DateTime.now();

  return (
    <div className="at-page">
      <h1 className="at-title">Feedback</h1>
      <p className="at-subtitle">
        Write feedback for a student from a recent session in one of your classes.
      </p>

      {classes.map((cls) => {
        const pastSessions = cls.sessions.filter((s) => isoToLocal(s.starts_at) < now);
        const recentSession = pastSessions[pastSessions.length - 1];
        const activeRoster = cls.roster.filter((r) => r.status === 'active');
        if (!recentSession || activeRoster.length === 0) return null;

        return (
          <section key={cls.class_id} className="hm-card mc-card">
            <div className="hm-card-head">
              <h2>{cls.subject ?? cls.class_type}</h2>
              <span className="at-subtitle">{isoToLocal(recentSession.starts_at).toFormat('ccc, LLL d')}</span>
            </div>

            {activeRoster.map((r) => {
              const key = `${recentSession.session_id}:${r.student_id}`;
              const sent = sentThisVisit.has(key);
              return (
                <div key={r.student_id} className="fb-student-row">
                  <span>{r.name}</span>
                  {sent ? (
                    <span className="fb-sent-tag">Sent ✓</span>
                  ) : (
                    <button type="button" className="hm-link" onClick={() => setOpenFor(openFor === key ? null : key)}>
                      {openFor === key ? 'Cancel' : 'Write feedback'}
                    </button>
                  )}
                  {openFor === key && !sent && (
                    <NoteForm
                      sessionId={recentSession.session_id}
                      studentId={r.student_id}
                      onSaved={() => {
                        setSentThisVisit((prev) => new Set(prev).add(key));
                        setOpenFor(null);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

export default Feedback;
