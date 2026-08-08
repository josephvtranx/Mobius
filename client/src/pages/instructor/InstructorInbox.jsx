// Instructor inbox (design handoff: Mobius Instructor.dc.html "Inbox"):
// pending reschedule requests (RSC-1) and pending self-serve bookings
// (SCH-4) awaiting a response. Staff see everything here too (they cover
// escalations). Rebuilt onto the shared hm-*/table.css design system —
// the previous version was bare template markup that dumped the raw API
// response via JSON.stringify as the success notice.
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import rescheduleService from '@/services/rescheduleService';
import bookingService from '@/services/bookingService';
import { isoToLocal } from 'mobius-lms';
import '@/css/home.css';
import '@/css/table.css';

const when = (iso) => (iso ? isoToLocal(iso).toFormat('ccc, LLL d · h:mm a') : '—');

function InstructorInbox() {
  const [requests, setRequests] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(null);

  const load = () => {
    rescheduleService.getRequests().then(setRequests).catch(() => setRequests([]));
    bookingService.getPending().then(setBookings).catch(() => setBookings([]));
  };
  useEffect(load, []);

  // key uniquely identifies the button so it can show a busy state; message
  // is the human-readable success line (no raw response dumped to screen).
  const act = (key, message, fn) => async () => {
    setError('');
    setNotice('');
    setBusy(key);
    try {
      await fn();
      setNotice(message);
      load();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Action failed');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="hm-page">
      <header className="hm-greeting">
        <h1>Inbox</h1>
        <p>Reschedule requests and self-serve bookings awaiting your response.</p>
      </header>

      {error && <div className="hm-error">{error}</div>}
      {notice && <div className="hm-warn-note" style={{ background: 'var(--status-success-bg)', color: 'var(--status-success)' }}>{notice}</div>}

      <section className="hm-card">
        <div className="hm-card-head"><h2>Reschedule requests</h2></div>
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead><tr><th>Student</th><th>Subject</th><th>From</th><th>To</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {(requests ?? []).map((r) => (
                <tr key={r.request_id}>
                  <td>{r.student_name}</td>
                  <td>{r.subject}</td>
                  <td>{when(r.original_starts_at)}</td>
                  <td>{when(r.proposed_starts_at)}</td>
                  <td><span className="hm-badge">{r.status}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="hm-btn primary" disabled={busy !== null}
                      onClick={act(`r-${r.request_id}-a`, 'Reschedule accepted.', () => rescheduleService.respond(r.request_id, { action: 'accept' }))}>
                      Accept
                    </button>{' '}
                    <button type="button" className="hm-btn" disabled={busy !== null}
                      onClick={act(`r-${r.request_id}-r`, 'Reschedule rejected.', () => rescheduleService.respond(r.request_id, { action: 'reject' }))}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {requests !== null && requests.length === 0 && <tr><td colSpan="6">Nothing pending.</td></tr>}
              {requests === null && <tr><td colSpan="6">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="hm-card">
        <div className="hm-card-head"><h2>Booking requests</h2></div>
        <div className="hm-table-wrap">
          <table className="hm-table">
            <thead><tr><th>Student</th><th>Subject</th><th>When</th><th>Respond by</th><th></th></tr></thead>
            <tbody>
              {(bookings ?? []).map((b) => (
                <tr key={b.class_id}>
                  <td>{b.student_name}</td>
                  <td>{b.subject}</td>
                  <td>{when(b.starts_at)} → {isoToLocal(b.ends_at).toFormat('h:mm a')}</td>
                  <td>{when(b.expires_at)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="hm-btn primary" disabled={busy !== null}
                      onClick={act(`b-${b.class_id}-a`, 'Booking accepted.', () => bookingService.respond(b.class_id, { action: 'accept' }))}>
                      Accept
                    </button>{' '}
                    <button type="button" className="hm-btn" disabled={busy !== null}
                      onClick={act(`b-${b.class_id}-r`, 'Booking rejected.', () => bookingService.respond(b.class_id, { action: 'reject', reason: 'unavailable' }))}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {bookings !== null && bookings.length === 0 && <tr><td colSpan="5">Nothing pending.</td></tr>}
              {bookings === null && <tr><td colSpan="5">Loading…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default InstructorInbox;
