// v2 self-serve one-off 1:1 booking (design handoff README > Student app >
// Class catalog / booking; spec 03 SCH-4): pick an instructor + subject,
// browse open windows, request a slot. The credit gate runs BEFORE any
// hold — shortfalls render verbatim with the top-up hint.
import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { useParams } from 'react-router-dom';
import bookingService from '@/services/bookingService';
import instructorCalendarService from '@/services/instructorCalendarService';
import instructorService from '@/services/instructorService';
import subjectService from '@/services/subjectService';
import { discretizeSlots } from '@/lib/slots';
import { isoToLocal } from 'mobius-lms';
import '@/css/schedule.css';

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const fmt = (iso) => isoToLocal(iso).toFormat('ccc, LLL d · h:mm a');

function BookSession() {
  const { studentId } = useParams();
  const [instructors, setInstructors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [instructorId, setInstructorId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState(60);
  const [slots, setSlots] = useState(null); // raw open WINDOWS from the server
  const [chosen, setChosen] = useState(null);

  // Windows -> concrete start times every 30 min that fit the duration
  const pickable = useMemo(
    () => (slots === null ? null : discretizeSlots(slots, duration)),
    [slots, duration]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    instructorService.getInstructorRoster().then(setInstructors).catch(() => {});
    subjectService.getAllSubjects().then(setSubjects).catch(() => {});
  }, []);

  const loadSlots = async (id) => {
    setError('');
    setSlots(null);
    setChosen(null);
    if (!id) return;
    try {
      const res = await instructorCalendarService.getOpenSlots(
        Number(id), DateTime.utc().toISO(), DateTime.utc().plus({ days: 14 }).toISO(), BROWSER_TZ
      );
      setSlots(res.slots);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load open slots');
    }
  };

  const pickInstructor = (id) => {
    setInstructorId(id);
    loadSlots(id);
  };

  const submit = async () => {
    if (!chosen || !subjectId) return;
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      const start = DateTime.fromISO(chosen.starts_at);
      const res = await bookingService.createBooking({
        instructor_id: Number(instructorId),
        subject_id: Number(subjectId),
        student_id: Number(studentId),
        starts_at: start.toUTC().toISO(),
        ends_at: start.plus({ minutes: Number(duration) }).toUTC().toISO(),
        tz: BROWSER_TZ,
      });
      setNotice(`Requested (${res.cost} credits when attended) — the instructor has until ${fmt(res.hold_expires_at)} to confirm.`);
      setChosen(null);
      loadSlots(instructorId);
    } catch (err) {
      const d = err.response?.data;
      setError(d?.code === 'INSUFFICIENT_CREDITS' ? d.message : (d?.message || 'Booking failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hm-page" style={{ maxWidth: 640 }}>
      <h1 className="at-title">Book a 1:1 session</h1>
      {error && <div className="hm-error">{error}</div>}
      {notice && <div className="hm-card" style={{ color: 'var(--status-success)' }}>{notice}</div>}

      <div className="hm-card">
        <label className="at-subtitle" style={{ display: 'block', marginBottom: 4 }}>Instructor</label>
        <select
          className="hm-btn"
          style={{ width: '100%', marginBottom: 14 }}
          value={instructorId}
          onChange={(e) => pickInstructor(e.target.value)}
        >
          <option value="">— pick —</option>
          {instructors.map((i) => (
            <option key={i.instructorId ?? i.id} value={i.instructorId ?? i.id}>{i.name}</option>
          ))}
        </select>

        <label className="at-subtitle" style={{ display: 'block', marginBottom: 4 }}>Subject</label>
        <select
          className="hm-btn"
          style={{ width: '100%', marginBottom: 14 }}
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
        >
          <option value="">— pick —</option>
          {subjects.map((s) => <option key={s.subject_id} value={s.subject_id}>{s.name}</option>)}
        </select>

        <label className="at-subtitle" style={{ display: 'block', marginBottom: 4 }}>Duration (minutes)</label>
        <input
          type="number" min="15" step="15" value={duration}
          onChange={(e) => { setDuration(e.target.value); setChosen(null); }}
          style={{ width: '100%', marginBottom: 14, padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)' }}
        />

        {instructorId && (
          <>
            <p className="at-subtitle" style={{ marginTop: 0 }}>Open times in the next 14 days — pick one:</p>
            {pickable === null ? (
              <div className="hm-loading">Loading…</div>
            ) : (
              <div className="sc-slot-grid">
                {pickable.map((sl) => (
                  <button
                    key={sl.starts_at}
                    type="button"
                    className={`sc-slot ${chosen === sl ? 'active' : ''}`}
                    onClick={() => setChosen(sl)}
                  >
                    {fmt(sl.starts_at)}
                  </button>
                ))}
                {pickable.length === 0 && (
                  <div className="hm-empty">
                    {slots.length === 0
                      ? 'No open windows in the next 14 days.'
                      : `No open times fit a ${duration}-minute session — try a shorter duration.`}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <button
          type="button"
          className="hm-btn primary"
          disabled={!chosen || !subjectId || submitting}
          onClick={submit}
          style={{ marginTop: 14 }}
        >
          {submitting ? 'Requesting…' : 'Request booking'}
        </button>
      </div>
    </div>
  );
}

export default BookSession;
