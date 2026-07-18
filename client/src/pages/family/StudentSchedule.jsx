// v2 family schedule (template): upcoming sessions with RSC-2 cancel (the
// server states the money effect) and the RSC-1 reschedule flow for 1:1
// sessions via the open-slots picker. Server messages verbatim.
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import studentViewService from '@/services/studentViewService';
import sessionServiceV2 from '@/services/sessionServiceV2';
import instructorCalendarService from '@/services/instructorCalendarService';
import { isoToLocal } from 'mobius-lms';

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

function StudentSchedule() {
  const { studentId } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pickerFor, setPickerFor] = useState(null); // session being rescheduled
  const [slots, setSlots] = useState([]);
  const [proposedStart, setProposedStart] = useState('');

  const load = useCallback(() => {
    studentViewService.getSchedule(studentId).then(setSchedule)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load schedule'));
  }, [studentId]);
  useEffect(load, [load]);

  const cancel = async (session) => {
    if (!window.confirm('Cancel this session? Inside the change window the credit is forfeited (you can appeal).')) return;
    setError('');
    setNotice('');
    try {
      const res = await sessionServiceV2.cancelSession(session.session_id, Number(studentId));
      setNotice(`Cancelled — ${res.money_effect === 'credit_forfeited'
        ? 'past the change deadline: credit forfeited (a review request was filed for staff)'
        : 'no charge'}`);
      load();
    } catch (err) {
      setError(`${err.response?.data?.code ?? ''} ${err.response?.data?.message ?? 'Cancel failed'}`);
    }
  };

  const openPicker = async (session) => {
    setError('');
    setNotice('');
    setPickerFor(session);
    setSlots([]);
    try {
      const from = DateTime.utc().toISO();
      const to = DateTime.utc().plus({ days: 14 }).toISO();
      const res = await instructorCalendarService.getOpenSlots(session.instructor_id, from, to, BROWSER_TZ);
      setSlots(res.slots);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load open slots');
    }
  };

  const submitReschedule = async () => {
    if (!pickerFor || !proposedStart) return;
    setError('');
    const durationMs = DateTime.fromISO(pickerFor.ends_at)
      .diff(DateTime.fromISO(pickerFor.starts_at)).toMillis();
    try {
      const start = DateTime.fromISO(proposedStart);
      const res = await sessionServiceV2.requestReschedule(pickerFor.session_id, {
        proposed_starts_at: start.toUTC().toISO(),
        proposed_ends_at: start.plus({ milliseconds: durationMs }).toUTC().toISO()
      });
      setNotice(`Reschedule requested (${res.request.status}) — the instructor has been asked to confirm.`);
      setPickerFor(null);
      setProposedStart('');
      load();
    } catch (err) {
      setError(`${err.response?.data?.message ?? 'Reschedule failed'}`);
    }
  };

  if (error && !schedule) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!schedule) return <div style={{ padding: 24 }}>Loading…</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Upcoming sessions</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {notice && <p style={{ color: 'green' }}>{notice}</p>}
      <table border="1" cellPadding="6">
        <thead><tr><th>When</th><th>Subject</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {schedule.sessions.map((s) => (
            <tr key={s.session_id}>
              <td>{isoToLocal(s.starts_at)} — {isoToLocal(s.ends_at)}</td>
              <td>{s.subject}</td>
              <td>{s.class_type}</td>
              <td>{s.status}</td>
              <td>
                {s.status === 'scheduled' && (
                  <>
                    <button onClick={() => cancel(s)}>Cancel</button>
                    {s.class_type === 'one_on_one' && (
                      <button onClick={() => openPicker(s)} style={{ marginLeft: 4 }}>Reschedule</button>
                    )}
                  </>
                )}
                {s.status === 'reschedule_requested' && 'awaiting instructor'}
              </td>
            </tr>
          ))}
          {schedule.sessions.length === 0 && <tr><td colSpan="5">Nothing upcoming.</td></tr>}
        </tbody>
      </table>

      {pickerFor && (
        <div style={{ border: '1px solid #999', padding: 12, marginTop: 16, maxWidth: 520 }}>
          <h3>Move the {isoToLocal(pickerFor.starts_at)} session</h3>
          <p>Open windows on the instructor's calendar (next 14 days):</p>
          <ul style={{ maxHeight: 160, overflowY: 'auto' }}>
            {slots.map((sl, i) => (
              <li key={i}>{isoToLocal(sl.starts_at)} → {isoToLocal(sl.ends_at)}</li>
            ))}
            {slots.length === 0 && <li>No open windows found.</li>}
          </ul>
          <label>
            New start:
            <input type="datetime-local" value={proposedStart}
              onChange={(e) => setProposedStart(e.target.value)} />
          </label>
          <button onClick={submitReschedule} style={{ marginLeft: 8 }}>Request</button>
          <button onClick={() => setPickerFor(null)} style={{ marginLeft: 4 }}>Close</button>
        </div>
      )}
    </div>
  );
}

export default StudentSchedule;
