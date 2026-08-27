// Requests (design handoff: Mobius Staff.dc.html REQUESTS view) — staff
// approve/reject join+leave membership requests (spec 03 SCH-3 / 07 RSC-4).
// Approvals re-run the SCH-2 gates (errors verbatim); leave approvals expose
// waive_window — the anti-loophole control (sessions already inside the
// Window forfeit unless waived). Deviations from the mock, on purpose:
// - Reschedule/booking approvals are a different domain (staff Inbox) — a
//   cross-link points there instead of mixing them in.
// - No "Undo" on resolved rows: no un-resolve endpoint exists (approval has
//   real side effects — enrollment, forfeits — an undo would need its own
//   spec'd inverse, not a status flip).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import classService from '@/services/classService';
import { tintFor } from '@/lib/rosterColors';
import { isoToLocal } from 'mobius-lms';
import '@/css/home.css';

const initialsOf = (name) =>
  String(name || '?').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
const KIND_PILL = {
  join: { bg: '#e9f5ee', fg: '#2c8a5b', label: 'JOIN' },
  leave: { bg: '#fdf1ef', fg: '#9c3a31', label: 'LEAVE' },
};

function MembershipRequests() {
  const [pending, setPending] = useState(null);
  const [resolved, setResolved] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('All');
  const [waive, setWaive] = useState({}); // request_id -> bool
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    classService.getMembershipRequests('pending').then(setPending)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load requests'));
    // Recent history — the endpoint takes comma-separated statuses.
    classService.getMembershipRequests('approved,rejected')
      .then((rows) => setResolved(
        [...rows].sort((x, y) => (x.resolved_at < y.resolved_at ? 1 : -1)).slice(0, 8)))
      .catch(() => {});
  };
  useEffect(load, []);

  const resolve = (request, action) => async () => {
    setError('');
    setNotice('');
    setBusyId(request.request_id);
    try {
      await classService.resolveMembershipRequest(request.request_id, {
        action,
        waive_window: request.kind === 'leave' ? !!waive[request.request_id] : undefined,
      });
      setNotice(`${request.student_name}'s ${request.kind} request ${action === 'approve' ? 'approved' : 'declined'}.`);
      load();
    } catch (err) {
      const d = err.response?.data;
      setError(d?.message ?? 'Resolution failed');
    } finally {
      setBusyId(null);
    }
  };

  if (error && !pending) return <div className="hm-page"><div className="hm-error">{error}</div></div>;
  if (!pending) return <div className="hm-page"><div className="hm-loading">Loading requests…</div></div>;

  const counts = { join: pending.filter((r) => r.kind === 'join').length, leave: pending.filter((r) => r.kind === 'leave').length };
  const shown = filter === 'All' ? pending : pending.filter((r) => r.kind === filter);

  const chip = (key, label, count) => {
    const on = filter === key;
    return (
      <button key={key} type="button" onClick={() => setFilter(key)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 999,
          fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
          border: `1px solid ${on ? '#c2703e' : '#ead9c8'}`, background: on ? '#c2703e' : '#fff', color: on ? '#fff' : '#5c4632' }}>
        {label}
        <span style={{ fontSize: 11, fontWeight: 600, minWidth: 18, height: 18, padding: '0 5px', borderRadius: 999,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: on ? 'rgba(255,255,255,.25)' : '#f6ecdf', color: on ? '#fff' : '#a3672a' }}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="hm-page" style={{ maxWidth: 1060, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {chip('All', 'All', pending.length)}
        {chip('join', 'Join', counts.join)}
        {chip('leave', 'Leave', counts.leave)}
        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: '#7d6a5c' }}>
          <i className="fa-regular fa-clock" style={{ marginRight: 6, color: '#c4a98e' }} />
          {pending.length} awaiting review · reschedules &amp; bookings live in the <Link className="hm-link" to="/inbox">Inbox</Link>
        </span>
      </div>

      {error && <div className="hm-error">{error}</div>}
      {notice && <div className="hm-card" style={{ color: 'var(--status-success, #2c8a5b)', padding: '10px 14px' }}>{notice}</div>}

      {shown.length === 0 ? (
        <div className="hm-empty" style={{ textAlign: 'center', padding: '56px 20px', background: '#fff',
          border: '1px solid #f0e3d8', borderRadius: 16 }}>
          <i className="fa-solid fa-check-double" style={{ fontSize: 26, color: '#2c8a5b' }} />
          <div style={{ fontSize: 15.5, fontWeight: 600, marginTop: 14 }}>All caught up</div>
          <div style={{ fontSize: 13.5, color: '#7d6a5c', marginTop: 6 }}>
            {filter === 'All' ? 'Every request has been reviewed.' : `No pending ${filter} requests.`}
          </div>
        </div>
      ) : (
        <section className="hm-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="hm-card-head" style={{ padding: '14px 18px', borderBottom: '1px solid #f5ebe1', margin: 0 }}>
            <h2>Pending</h2>
          </div>
          {shown.map((r) => {
            const tint = tintFor(r.student_name);
            const pill = KIND_PILL[r.kind] ?? KIND_PILL.join;
            const busy = busyId === r.request_id;
            return (
              <div key={r.request_id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                borderBottom: '1px solid #f5ebe1', flexWrap: 'wrap' }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: tint.bg, color: tint.fg,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
                  {initialsOf(r.student_name)}
                </span>
                <div style={{ minWidth: 200, flex: 1, lineHeight: 1.35 }}>
                  <div style={{ fontSize: 13.5 }}>
                    <strong>{r.student_name}</strong>{' '}
                    <span style={{ color: '#7d6a5c' }}>wants to {r.kind === 'join' ? 'join' : 'leave'}</span>{' '}
                    <strong>{r.subject}</strong>{' '}
                    <span style={{ color: '#a98d76' }}>({String(r.class_type).replace('_', ' ')})</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: '#c4a98e', marginTop: 4 }}>
                    {isoToLocal(r.created_at).toRelative()}{r.reason ? ` · "${r.reason}"` : ''}
                  </div>
                  {r.is_waitlist && (
                    <div style={{ fontSize: 11.5, color: '#9c6a1d', marginTop: 2 }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 5 }} />
                      Class was full when filed — approval re-checks seats.
                    </div>
                  )}
                </div>
                <span style={{ flexShrink: 0, fontSize: 10.5, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                  background: pill.bg, color: pill.fg, letterSpacing: '.05em' }}>
                  {pill.label}
                </span>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
                  {r.kind === 'leave' && (
                    <label title="Sessions already inside the cancellation window forfeit their credits unless waived"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#5c4632', cursor: 'pointer' }}>
                      <input type="checkbox" checked={!!waive[r.request_id]}
                        onChange={(e) => setWaive((w) => ({ ...w, [r.request_id]: e.target.checked }))} />
                      waive window
                    </label>
                  )}
                  <button type="button" className="hm-btn primary" style={{ height: 34, fontSize: 12.5 }} disabled={busy}
                    onClick={resolve(r, 'approve')}>
                    <i className="fa-solid fa-check" style={{ marginRight: 6 }} />Approve
                  </button>
                  <button type="button" className="hm-btn" style={{ height: 34, fontSize: 12.5 }} disabled={busy}
                    onClick={resolve(r, 'reject')}>
                    Decline
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {resolved.length > 0 && (
        <section className="hm-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="hm-card-head" style={{ padding: '14px 18px', borderBottom: '1px solid #f5ebe1', margin: 0 }}>
            <h2>Recently resolved</h2>
          </div>
          {resolved.map((r) => {
            const tint = tintFor(r.student_name);
            const approved = r.status === 'approved';
            return (
              <div key={r.request_id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px',
                borderBottom: '1px solid #f5ebe1', opacity: 0.72 }}>
                <span style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: tint.bg, color: tint.fg,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
                  {initialsOf(r.student_name)}
                </span>
                <div style={{ minWidth: 0, flex: 1, lineHeight: 1.3 }}>
                  <div style={{ fontSize: 13 }}>
                    <strong>{r.student_name}</strong> <span style={{ color: '#7d6a5c' }}>· {r.kind} · {r.subject}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, color: approved ? '#2c8a5b' : '#9c3a31' }}>
                    <i className={`fa-solid ${approved ? 'fa-check' : 'fa-xmark'}`} style={{ marginRight: 6 }} />
                    {approved ? 'Approved' : 'Declined'}
                    {r.resolved_at && <span style={{ fontWeight: 400, color: '#a98d76' }}> · {isoToLocal(r.resolved_at).toRelative()}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default MembershipRequests;
