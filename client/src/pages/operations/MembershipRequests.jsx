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
import '@/css/membership-requests.css';

const initialsOf = (name) =>
  String(name || '?').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
const KIND_PILL = {
  join: { bg: '#e9f5ee', fg: '#2c8a5b', label: 'JOIN' },
  leave: { bg: '#fdf1ef', fg: '#9c3a31', label: 'LEAVE' },
};

function MembershipRequests() {
  const [pending, setPending] = useState(null);
  const [resolved, setResolved] = useState([]);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState('All');
  const [waive, setWaive] = useState({}); // request_id -> bool
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    classService.getMembershipRequests('pending').then(setPending)
      .catch((err) => setError({ message: err.response?.data?.message || 'Failed to load requests' }));
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
      setError({
        message: d?.message ?? 'Resolution failed',
        code: d?.code,
        classId: request.class_id,
      });
    } finally {
      setBusyId(null);
    }
  };

  if (error && !pending) return <div className="hm-page"><div className="hm-error">{error.message}</div></div>;
  if (!pending) return <div className="hm-page"><div className="hm-loading">Loading requests…</div></div>;

  const counts = { join: pending.filter((r) => r.kind === 'join').length, leave: pending.filter((r) => r.kind === 'leave').length };
  const shown = filter === 'All' ? pending : pending.filter((r) => r.kind === filter);

  const chip = (key, label, count) => {
    const on = filter === key;
    return (
      <button key={key} type="button" onClick={() => setFilter(key)}
        className={`mr-filter${on ? ' active' : ''}`} aria-pressed={on}>
        {label}
        <span>{count}</span>
      </button>
    );
  };

  return (
    <div className="hm-page mr-page">
      <div className="mr-toolbar">
        <div className="mr-filters" aria-label="Filter requests by type">
          {chip('All', 'All', pending.length)}
          {chip('join', 'Join', counts.join)}
          {chip('leave', 'Leave', counts.leave)}
        </div>
        <p className="mr-context">
          <i className="fa-regular fa-clock" aria-hidden="true" />
          <strong>{pending.length}</strong> awaiting review
          <span aria-hidden="true">·</span>
          Bookings and reschedules are handled in the <Link className="hm-link" to="/inbox">Inbox</Link>
        </p>
      </div>

      {error && (
        <div className="hm-error" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span>
            {error.code === 'CLASS_FULL'
              ? error.message.replace(/\s*[—-]\s*raise the limit\?\s*$/i, '')
              : error.message}
          </span>
          {error.classId && error.code === 'CLASS_FULL' && (
            <Link className="hm-link" to={`/operations/classes/${error.classId}?edit=capacity`}>
              Raise the limit? →
            </Link>
          )}
        </div>
      )}
      {notice && <div className="mr-notice"><i className="fa-solid fa-circle-check" aria-hidden="true" />{notice}</div>}

      {shown.length === 0 ? (
        <div className="hm-empty mr-empty">
          <i className="fa-solid fa-check-double" style={{ fontSize: 26, color: '#2c8a5b' }} />
          <div style={{ fontSize: 15.5, fontWeight: 600, marginTop: 14 }}>All caught up</div>
          <div style={{ fontSize: 13.5, color: '#7d6a5c', marginTop: 6 }}>
            {filter === 'All' ? 'Every request has been reviewed.' : `No pending ${filter} requests.`}
          </div>
        </div>
      ) : (
        <section className="mr-section">
          <header className="mr-section-head">
            <div>
              <h2>Awaiting review</h2>
              <p>{shown.length} {shown.length === 1 ? 'request' : 'requests'}</p>
            </div>
          </header>
          <div className="mr-list">
          {shown.map((r) => {
            const tint = tintFor(r.student_name);
            const pill = KIND_PILL[r.kind] ?? KIND_PILL.join;
            const busy = busyId === r.request_id;
            return (
              <article className="mr-request" key={r.request_id}>
                <span className="mr-avatar" style={{ background: tint.bg, color: tint.fg }}>
                  {initialsOf(r.student_name)}
                </span>
                <div className="mr-request-copy">
                  <div className="mr-request-line">
                    <strong>{r.student_name}</strong>{' '}
                    <span>wants to {r.kind === 'join' ? 'join' : 'leave'}</span>{' '}
                    <strong>{r.subject}</strong>{' '}
                    <span className="mr-class-type">{String(r.class_type).replace('_', ' ')}</span>
                  </div>
                  <div className="mr-request-meta">
                    {isoToLocal(r.created_at).toRelative()}{r.reason ? ` · "${r.reason}"` : ''}
                  </div>
                  {r.is_waitlist && (
                    <div className="mr-warning">
                      <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
                      Class was full when filed — approval re-checks seats.{' '}
                      <Link className="hm-link" to={`/operations/classes/${r.class_id}?edit=capacity`}>
                        Review capacity
                      </Link>
                    </div>
                  )}
                </div>
                <span className="mr-kind" style={{ background: pill.bg, color: pill.fg }}>
                  {pill.label.toLowerCase()}
                </span>
                <div className="mr-actions">
                  {r.kind === 'leave' && (
                    <label className="mr-waive" title="Sessions already inside the cancellation window forfeit their credits unless waived">
                      <input type="checkbox" checked={!!waive[r.request_id]}
                        onChange={(e) => setWaive((w) => ({ ...w, [r.request_id]: e.target.checked }))} />
                      Waive window
                    </label>
                  )}
                  <button type="button" className="hm-btn primary mr-action" disabled={busy}
                    onClick={resolve(r, 'approve')}>
                    <i className="fa-solid fa-check" aria-hidden="true" />Approve
                  </button>
                  <button type="button" className="hm-btn mr-action mr-decline" disabled={busy}
                    onClick={resolve(r, 'reject')}>
                    Decline
                  </button>
                </div>
              </article>
            );
          })}
          </div>
        </section>
      )}

      {resolved.length > 0 && (
        <section className="mr-section mr-resolved-section">
          <header className="mr-section-head">
            <div>
              <h2>Recently resolved</h2>
              <p>Latest decisions</p>
            </div>
          </header>
          <div className="mr-list">
          {resolved.map((r) => {
            const tint = tintFor(r.student_name);
            const approved = r.status === 'approved';
            return (
              <article className="mr-request mr-resolved" key={r.request_id}>
                <span className="mr-avatar small" style={{ background: tint.bg, color: tint.fg }}>
                  {initialsOf(r.student_name)}
                </span>
                <div className="mr-request-copy">
                  <div className="mr-request-line">
                    <strong>{r.student_name}</strong> <span>· {r.kind} · {r.subject}</span>
                  </div>
                  <div className={`mr-resolution ${approved ? 'approved' : 'declined'}`}>
                    <i className={`fa-solid ${approved ? 'fa-check' : 'fa-xmark'}`} aria-hidden="true" />
                    {approved ? 'Approved' : 'Declined'}
                    {r.resolved_at && <span> · {isoToLocal(r.resolved_at).toRelative()}</span>}
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        </section>
      )}
    </div>
  );
}

export default MembershipRequests;
