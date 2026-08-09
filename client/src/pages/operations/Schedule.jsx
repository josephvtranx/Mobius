// Instructor "My schedule" (design handoff: Mobius Instructor.dc.html
// "Other views > My schedule" — teaching grid). The previous version of
// this page (ScheduleViewCalendar/Events/PendingBlocks, all backed by
// classSessionService) called endpoints that predate the v2 schema and
// always failed ("Failed to load schedule"). Rebuilt on the same real
// GET /instructors/me/sessions call instructor Home.jsx already uses,
// grouped by day rather than a calendar grid (no real calendar library
// wired to v2 data yet).
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import authService from '@/services/authService';
import instructorCalendarService from '@/services/instructorCalendarService';
import sessionServiceV2 from '@/services/sessionServiceV2';
import { isoToLocal } from 'mobius-lms';
import '@/css/home.css';

const label = (s) => String(s ?? '').replace(/_/g, ' ');

function Schedule() {
  const user = authService.getCurrentUser();
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');
  const [cancelId, setCancelId] = useState(null);   // session being cancelled
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = () => instructorCalendarService.getMySessions(30)
    .then(setSessions)
    .catch((err) => setError(err.response?.data?.message || 'Could not load your schedule'));

  useEffect(() => {
    if (user?.role !== 'instructor') return;
    load();
  }, [user?.role]);

  const submitCancel = async (sessionId) => {
    if (!reason.trim()) return;
    setBusy(true);
    setError('');
    try {
      await sessionServiceV2.instructorCancel(sessionId, reason.trim());
      setNotice('Session cancelled — enrolled families were notified and made whole automatically.');
      setCancelId(null);
      setReason('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel the session');
    } finally {
      setBusy(false);
    }
  };

  if (user?.role !== 'instructor') return <Navigate to="/home" replace />;
  if (error) return <div className="hm-page"><div className="hm-error">{error}</div></div>;
  if (!sessions) return <div className="hm-page"><div className="hm-loading">Loading your schedule…</div></div>;

  const days = new Map();
  for (const s of sessions) {
    const key = isoToLocal(s.starts_at).toISODate();
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(s);
  }
  const todayIso = DateTime.now().toISODate();

  return (
    <div className="hm-page">
      <header className="hm-greeting">
        <h1>My schedule</h1>
        <p>Teaching sessions for the next 30 days.</p>
      </header>

      {notice && <div className="hm-card" style={{ color: 'var(--status-success)' }}>{notice}</div>}

      {days.size === 0 ? (
        <div className="hm-empty">No sessions scheduled in the next 30 days.</div>
      ) : (
        <div className="hm-card">
          {[...days.entries()].map(([day, daySessions]) => (
            <div key={day} style={{ marginBottom: 18 }}>
              <p className="hm-kpi-label" style={{ marginBottom: 6, color: day === todayIso ? 'var(--shell-primary)' : undefined }}>
                {day === todayIso ? 'Today' : isoToLocal(daySessions[0].starts_at).toFormat('cccc, LLL d')}
              </p>
              <ul className="hm-sessions">
                {daySessions.map((s) => (
                  <li key={s.session_id} className={day === todayIso ? 'hm-session today' : 'hm-session'}>
                    <div className="hm-session-when">
                      <span className="hm-session-time">{isoToLocal(s.starts_at).toFormat('h:mm a')} – {isoToLocal(s.ends_at).toFormat('h:mm a')}</span>
                    </div>
                    <div className="hm-session-what">
                      <span className="hm-session-subject">{s.subject}</span>
                      <span className="hm-session-meta">{label(s.class_type)} · {s.enrolled} enrolled</span>
                    </div>
                    {s.status === 'reschedule_requested' && <span className="hm-badge warn">reschedule requested</span>}
                    {s.status === 'scheduled' && cancelId !== s.session_id && (
                      <button type="button" className="hm-btn ghost" onClick={() => { setCancelId(s.session_id); setReason(''); setError(''); }}>
                        Cancel
                      </button>
                    )}
                    {cancelId === s.session_id && (
                      <div className="hm-cancel-form" style={{ width: '100%', marginTop: 8 }}>
                        <textarea
                          rows={2}
                          placeholder="Reason for cancelling (required — families see this)"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                          <button type="button" className="hm-btn" disabled={busy || !reason.trim()} onClick={() => submitCancel(s.session_id)}>
                            {busy ? 'Cancelling…' : 'Confirm cancellation'}
                          </button>
                          <button type="button" className="hm-btn ghost" disabled={busy} onClick={() => { setCancelId(null); setReason(''); }}>
                            Keep session
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Schedule;
