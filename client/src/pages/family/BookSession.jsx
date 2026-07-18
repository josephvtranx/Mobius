// v2 self-serve one-off 1:1 booking (template — spec 03 SCH-4): pick an
// instructor + subject, browse open windows, request a slot. The credit gate
// runs BEFORE any hold — shortfalls render verbatim with the top-up hint.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import bookingService from '@/services/bookingService';
import instructorCalendarService from '@/services/instructorCalendarService';
import instructorService from '@/services/instructorService';
import subjectService from '@/services/subjectService';
import { isoToLocal } from '@/lib/time';

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

function BookSession() {
  const { studentId } = useParams();
  const [instructors, setInstructors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ instructor_id: '', subject_id: '', start: '', duration: 60 });
  const [slots, setSlots] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    instructorService.getInstructorRoster().then(setInstructors).catch(() => {});
    subjectService.getAllSubjects().then(setSubjects).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const loadSlots = async () => {
    setError('');
    setSlots(null);
    if (!form.instructor_id) return;
    try {
      const from = DateTime.utc().toISO();
      const to = DateTime.utc().plus({ days: 14 }).toISO();
      const res = await instructorCalendarService.getOpenSlots(Number(form.instructor_id), from, to, BROWSER_TZ);
      setSlots(res.slots);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load open slots');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      const start = DateTime.fromISO(form.start);
      const res = await bookingService.createBooking({
        instructor_id: Number(form.instructor_id),
        subject_id: Number(form.subject_id),
        student_id: Number(studentId),
        starts_at: start.toUTC().toISO(),
        ends_at: start.plus({ minutes: Number(form.duration) }).toUTC().toISO(),
        tz: BROWSER_TZ
      });
      setNotice(`Requested (${res.cost} credits when attended) — the instructor has until ${isoToLocal(res.hold_expires_at)} to confirm.`);
    } catch (err) {
      const d = err.response?.data;
      setError(d?.code === 'INSUFFICIENT_CREDITS'
        ? `${d.message}`
        : (d?.message || 'Booking failed'));
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 560 }}>
      <h1>Book a 1:1 session</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {notice && <p style={{ color: 'green' }}>{notice}</p>}
      <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
        <label>Instructor:
          <select value={form.instructor_id} onChange={set('instructor_id')} onBlur={loadSlots} required>
            <option value="">— pick —</option>
            {instructors.map((i) => (
              <option key={i.instructor_id ?? i.user_id} value={i.instructor_id ?? i.user_id}>{i.name}</option>
            ))}
          </select>
          <button type="button" onClick={loadSlots} style={{ marginLeft: 6 }}>Show open times</button>
        </label>
        {slots && (
          <ul style={{ maxHeight: 160, overflowY: 'auto', border: '1px solid #ddd', padding: 8 }}>
            {slots.map((sl, i) => (
              <li key={i}>{isoToLocal(sl.starts_at)} → {isoToLocal(sl.ends_at)}</li>
            ))}
            {slots.length === 0 && <li>No open windows in the next 14 days.</li>}
          </ul>
        )}
        <label>Subject:
          <select value={form.subject_id} onChange={set('subject_id')} required>
            <option value="">— pick —</option>
            {subjects.map((s) => <option key={s.subject_id} value={s.subject_id}>{s.name}</option>)}
          </select>
        </label>
        <label>Start:
          <input type="datetime-local" value={form.start} onChange={set('start')} required />
        </label>
        <label>Duration (minutes):
          <input type="number" min="15" step="15" value={form.duration} onChange={set('duration')} />
        </label>
        <button type="submit">Request booking</button>
      </form>
    </div>
  );
}

export default BookSession;
