// Staff Attendance queue (design handoff README > Staff app > Attendance):
// session list with To-mark/Marked tabs. There's no direct "sessions across
// all classes in a date range" endpoint, so this fetches every class
// (classService.getAllClasses, staff-only) then each class's full session
// list and flattens them — the same N+1-by-class-count pattern used for
// the instructor's My classes page. A session counts as "marked" once its
// status leaves 'scheduled' (the attendance route flips it to 'completed'
// once every roster student has a mark) — a real signal, not invented.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classService from '@/services/classService';
import { isoToLocal } from 'mobius-lms';
import '@/css/attendance.css';
import '@/css/table.css';

function Attendance() {
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('to-mark');

  useEffect(() => {
    classService.getAllClasses()
      .then(async (classes) => {
        // getClass(id) (detail) doesn't return a subject name, only the list
        // endpoint does — carry it over from the outer list instead.
        const details = await Promise.all(classes.map((c) => classService.getClass(c.class_id)));
        const flat = details.flatMap((cls, i) =>
          cls.sessions.map((s) => ({
            ...s,
            class_id: cls.class_id,
            subject: classes[i].subject,
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

  const toMark = sessions.filter((s) => s.status === 'scheduled');
  const marked = sessions.filter((s) => s.status !== 'scheduled');
  const shown = tab === 'to-mark' ? toMark : marked;

  return (
    <div className="at-page" style={{ maxWidth: 900 }}>
      <h1 className="at-title">Attendance</h1>
      <div className="hm-actions" style={{ marginBottom: 14 }}>
        <button type="button" className={`hm-btn ${tab === 'to-mark' ? 'primary' : ''}`} onClick={() => setTab('to-mark')}>
          To mark ({toMark.length})
        </button>
        <button type="button" className={`hm-btn ${tab === 'marked' ? 'primary' : ''}`} onClick={() => setTab('marked')}>
          Marked ({marked.length})
        </button>
      </div>

      <div className="hm-table-wrap">
        <table className="hm-table">
          <thead>
            <tr><th>When</th><th>Subject</th><th>Type</th><th>Roster</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {shown.map((s) => (
              <tr key={s.session_id}>
                <td>{isoToLocal(s.starts_at).toFormat('ccc, LLL d · h:mm a')}</td>
                <td>{s.subject}</td>
                <td style={{ textTransform: 'capitalize' }}>{s.class_type.replace(/_/g, ' ')}</td>
                <td>{s.rosterCount}</td>
                <td><span className={`status-pill status-pill--${s.status === 'scheduled' ? 'warning' : 'success'}`}>{s.status}</span></td>
                <td>
                  <Link className="hm-link" to={`/operations/classes/${s.class_id}/sessions/${s.session_id}/attendance`}>
                    {s.status === 'scheduled' ? 'Mark' : 'Review'}
                  </Link>
                </td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan="6">Nothing here.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Attendance;
