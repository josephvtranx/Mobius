// v2 instructor inbox (template): pending reschedule requests (RSC-1) and
// pending self-serve bookings (SCH-4) awaiting a response. Staff also see
// everything here (they cover escalations).
import { useEffect, useState } from 'react';
import rescheduleService from '@/services/rescheduleService';
import bookingService from '@/services/bookingService';
import { isoToLocal } from 'mobius-lms';

function InstructorInbox() {
  const [requests, setRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () => {
    rescheduleService.getRequests().then(setRequests).catch(() => {});
    bookingService.getPending().then(setBookings).catch(() => {});
  };
  useEffect(load, []);

  const act = (fn) => async () => {
    setError('');
    setNotice('');
    try {
      const res = await fn();
      setNotice(JSON.stringify(res));
      load();
    } catch (err) {
      setError(`${err.response?.data?.message ?? 'Action failed'}`);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Inbox</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {notice && <p style={{ color: 'green', wordBreak: 'break-all' }}>{notice}</p>}

      <h2>Reschedule requests</h2>
      <table border="1" cellPadding="6">
        <thead><tr><th>Student</th><th>Subject</th><th>From</th><th>To</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.request_id}>
              <td>{r.student_name}</td>
              <td>{r.subject}</td>
              <td>{isoToLocal(r.original_starts_at)}</td>
              <td>{isoToLocal(r.proposed_starts_at)}</td>
              <td>{r.status}</td>
              <td>
                <button onClick={act(() => rescheduleService.respond(r.request_id, { action: 'accept' }))}>Accept</button>
                <button onClick={act(() => rescheduleService.respond(r.request_id, { action: 'reject' }))} style={{ marginLeft: 4 }}>Reject</button>
              </td>
            </tr>
          ))}
          {requests.length === 0 && <tr><td colSpan="6">Nothing pending.</td></tr>}
        </tbody>
      </table>

      <h2>Booking requests</h2>
      <table border="1" cellPadding="6">
        <thead><tr><th>Student</th><th>Subject</th><th>When</th><th>Respond by</th><th></th></tr></thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.class_id}>
              <td>{b.student_name}</td>
              <td>{b.subject}</td>
              <td>{isoToLocal(b.starts_at)} → {isoToLocal(b.ends_at)}</td>
              <td>{isoToLocal(b.expires_at)}</td>
              <td>
                <button onClick={act(() => bookingService.respond(b.class_id, { action: 'accept' }))}>Accept</button>
                <button onClick={act(() => bookingService.respond(b.class_id, { action: 'reject', reason: 'unavailable' }))} style={{ marginLeft: 4 }}>Reject</button>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && <tr><td colSpan="5">Nothing pending.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default InstructorInbox;
