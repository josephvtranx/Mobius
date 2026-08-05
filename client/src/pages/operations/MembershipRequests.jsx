// v2 membership-request resolution (template — spec 03 SCH-3 / 07 RSC-4):
// staff approve/reject join+leave requests. Approvals re-run the SCH-2 gates
// (errors verbatim); leave approvals expose waive_window — the anti-loophole
// control (sessions already inside the Window forfeit unless waived).
import { useEffect, useState } from 'react';
import classService from '@/services/classService';
import { isoToLocal } from 'mobius-lms';
import '@/css/attendance.css';
import '@/css/table.css';

function MembershipRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [waive, setWaive] = useState({}); // request_id -> bool

  const load = () => {
    classService.getMembershipRequests('pending').then(setRequests)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load requests'));
  };
  useEffect(load, []);

  const resolve = (request, action) => async () => {
    setError('');
    setNotice('');
    try {
      await classService.resolveMembershipRequest(request.request_id, {
        action,
        waive_window: request.kind === 'leave' ? !!waive[request.request_id] : undefined
      });
      setNotice(`Request ${action}d.`);
      load();
    } catch (err) {
      const d = err.response?.data;
      setError(`${d?.code ?? ''} ${d?.message ?? 'Resolution failed'}`);
    }
  };

  return (
    <div className="at-page" style={{ maxWidth: 960 }}>
      <h1 className="at-title">Membership requests</h1>
      {error && <div className="hm-error">{error}</div>}
      {notice && <div className="hm-card" style={{ color: 'var(--status-success)' }}>{notice}</div>}
      <div className="hm-table-wrap">
        <table className="hm-table">
          <thead>
            <tr><th>Filed</th><th>Kind</th><th>Student</th><th>Class</th><th>Reason</th><th>Waitlist</th><th>Resolve</th></tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.request_id}>
                <td>{isoToLocal(r.created_at).toFormat('LLL d · h:mm a')}</td>
                <td><span className="status-pill status-pill--info">{r.kind}</span></td>
                <td>{r.student_name}</td>
                <td>{r.subject} ({r.class_type.replace('_', ' ')})</td>
                <td>{r.reason || '—'}</td>
                <td>{r.is_waitlist && <span className="status-pill status-pill--warning">waitlist</span>}</td>
                <td>
                  <div className="hm-actions" style={{ flexWrap: 'nowrap' }}>
                    {r.kind === 'leave' && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5 }}>
                        <input type="checkbox" checked={!!waive[r.request_id]}
                          onChange={(e) => setWaive((w) => ({ ...w, [r.request_id]: e.target.checked }))} />
                        waive window
                      </label>
                    )}
                    <button type="button" className="hm-btn primary" onClick={resolve(r, 'approve')}>Approve</button>
                    <button type="button" className="hm-btn" onClick={resolve(r, 'reject')}>Reject</button>
                  </div>
                </td>
              </tr>
            ))}
            {requests.length === 0 && <tr><td colSpan="7">No pending requests.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MembershipRequests;
