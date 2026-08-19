// Staff Attendance — an OVERSIGHT surface, not a marking queue (product
// decision 2026-08-15: marking attendance is the instructor's job; staff
// retain full view/edit power for corrections, excusals, and covering for
// an instructor). "Awaiting instructor" lists only sessions that have
// STARTED and are still unmarked — who owes a mark and for how long —
// with "Mark for them" as the explicitly-on-their-behalf escape hatch.
// The auto-complete job backstops anything unmarked past the knob hours.
//
// There's no direct "sessions across all classes in a date range" endpoint,
// so this fetches every class (staff-only) then each class's sessions and
// flattens — the same N+1-by-class pattern as the instructor's My classes.
// A session counts as "marked" once its status leaves 'scheduled' (the
// attendance route flips it to 'completed' when every roster student has a
// mark) — a real signal, not invented.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import classService from '@/services/classService';
import { isoToLocal } from 'mobius-lms';
import '@/css/attendance.css';
import '@/css/table.css';

const agoLabel = (iso) => {
  const hours = Math.floor(DateTime.now().diff(DateTime.fromISO(iso), 'hours').hours);
  if (hours < 1) return 'just ended';
  if (hours < 24) return `ended ${hours}h ago`;
  return `ended ${Math.floor(hours / 24)}d ago`;
};

function Attendance() {
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('awaiting');

  useEffect(() => {
    classService.getAllClasses()
      .then(async (classes) => {
        // getClass(id) (detail) doesn't return subject/instructor names, only
        // the list endpoint does — carry them over from the outer list.
        const details = await Promise.all(classes.map((c) => classService.getClass(c.class_id)));
        const flat = details.flatMap((cls, i) =>
          cls.sessions.map((s) => ({
            ...s,
            class_id: cls.class_id,
            subject: classes[i].subject,
            instructor: classes[i].instructor,
            class_type: cls.class_type,
            rosterCount: cls.roster.filter((r) => r.status === 'active').length,
          }))
        );
        flat.sort((a, b) => (a.starts_at < b.starts_at ? -1 : 1));
        setSessions(flat);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load sessions'));
  }, []);

  if (error) return <div className="at-page"><div className="hm-error">{error}</div></div>;
  if (!sessions) return <div className="at-page hm-loading">Loading…</div>;

  const now = DateTime.now();
  // Awaiting = started and still unmarked. Future scheduled sessions are
  // neither awaiting nor marked — they live on the Scheduling page.
  const awaiting = sessions.filter((s) => s.status === 'scheduled' && isoToLocal(s.starts_at) <= now);
  const marked = sessions.filter((s) => s.status !== 'scheduled');
  const shown = tab === 'awaiting' ? awaiting : marked;

  return (
    <div className="at-page" style={{ maxWidth: 900 }}>
      <h1 className="at-title">Attendance</h1>
      <p className="at-subtitle" style={{ marginTop: -6, marginBottom: 14 }}>
        Instructors mark their own sessions — this page is for oversight: see who still owes a
        mark, review what's marked, and correct or excuse where needed.
      </p>
      <div className="hm-actions" style={{ marginBottom: 14 }}>
        <button type="button" className={`hm-btn ${tab === 'awaiting' ? 'primary' : ''}`} onClick={() => setTab('awaiting')}>
          Awaiting instructor ({awaiting.length})
        </button>
        <button type="button" className={`hm-btn ${tab === 'marked' ? 'primary' : ''}`} onClick={() => setTab('marked')}>
          Marked ({marked.length})
        </button>
      </div>

      <div className="hm-table-wrap">
        <table className="hm-table">
          <thead>
            <tr>
              <th>When</th><th>Subject</th><th>Instructor</th><th>Roster</th>
              <th>{tab === 'awaiting' ? 'Overdue' : 'Status'}</th><th></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((s) => (
              <tr key={s.session_id}>
                <td>{isoToLocal(s.starts_at).toFormat('ccc, LLL d · h:mm a')}</td>
                <td>{s.subject}</td>
                <td>{s.instructor || '—'}</td>
                <td>{s.rosterCount}</td>
                <td>
                  {tab === 'awaiting'
                    ? <span className="status-pill status-pill--warning">{agoLabel(s.ends_at)}</span>
                    : <span className="status-pill status-pill--success">{s.status}</span>}
                </td>
                <td>
                  <Link className="hm-link" to={`/operations/classes/${s.class_id}/sessions/${s.session_id}/attendance`}>
                    {tab === 'awaiting' ? 'Mark for them' : 'Review / edit'}
                  </Link>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr><td colSpan="6">
                {tab === 'awaiting'
                  ? 'Nothing outstanding — instructors are on top of it.'
                  : 'No marked sessions yet.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;
