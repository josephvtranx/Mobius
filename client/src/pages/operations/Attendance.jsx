// Staff Attendance queue (design handoff README > Staff app > Attendance):
// session list with To-mark/Marked tabs, backed by the staff date-range
// session query (GET /api/sessions?from=&to=) in a single request — the
// window is the last 4 weeks through the next 2 (a marking queue, not an
// archive; older history lives on each class's detail page). A session
// counts as "marked" once its status leaves 'scheduled' (the attendance
// route flips it to 'completed' once every roster student has a mark) —
// a real signal, not invented.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import sessionServiceV2 from '@/services/sessionServiceV2';
import { isoToLocal } from 'mobius-lms';
import '@/css/attendance.css';
import '@/css/table.css';

function Attendance() {
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('to-mark');

  useEffect(() => {
    const now = DateTime.now();
    sessionServiceV2.listRange({
      from: now.minus({ weeks: 4 }).startOf('day').toUTC().toISO(),
      to: now.plus({ weeks: 2 }).endOf('day').toUTC().toISO(),
    })
      .then((res) => setSessions(res.sessions.map((s) => ({ ...s, rosterCount: s.roster_count }))))
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
