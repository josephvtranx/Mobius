// v2 family schedule (design handoff README > Student app > "Reschedule
// flow (the core student action)"): session detail modal -> Request
// reschedule -> grid of tutor-suggested open slots -> confirm -> success.
// No reason field, no preferred-window input — 3 steps, not 4. The
// original session stays booked until the instructor confirms (INV-2).
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import studentViewService from '@/services/studentViewService';
import sessionServiceV2 from '@/services/sessionServiceV2';
import instructorCalendarService from '@/services/instructorCalendarService';
import instructorService from '@/services/instructorService';
import Modal from '@/components/Modal';
import { isoToLocal } from 'mobius-lms';
import '@/css/schedule.css';

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const fmt = (iso) => isoToLocal(iso).toFormat('ccc, LLL d · h:mm a');
const fmtTime = (iso) => isoToLocal(iso).toFormat('h:mm a');

function StudentSchedule() {
  const { studentId } = useParams();
  const [schedule, setSchedule] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [detailFor, setDetailFor] = useState(null);   // session shown in the detail modal
  const [step, setStep] = useState('detail');          // detail | pick | done
  const [slots, setSlots] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [tutorName, setTutorName] = useState('');
  const [result, setResult] = useState(null);

  const load = useCallback(() => {
    studentViewService.getSchedule(studentId).then(setSchedule)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load schedule'));
  }, [studentId]);
  useEffect(load, [load]);

  const openDetail = (session) => {
    setDetailFor(session);
    setStep('detail');
    setSlots(null);
    setChosen(null);
    setResult(null);
    setError('');
  };
  const closeModal = () => setDetailFor(null);

  const cancel = async () => {
    if (!window.confirm('Cancel this session? Inside the change window the credit is forfeited (you can appeal).')) return;
    setError('');
    try {
      const res = await sessionServiceV2.cancelSession(detailFor.session_id, Number(studentId));
      setNotice(`Cancelled — ${res.money_effect === 'credit_forfeited'
        ? 'past the change deadline: credit will not be used (a review request was filed for staff)'
        : 'credit will not be used'}`);
      closeModal();
      load();
    } catch (err) {
      setError(`${err.response?.data?.code ?? ''} ${err.response?.data?.message ?? 'Cancel failed'}`.trim());
    }
  };

  const startReschedule = async () => {
    setStep('pick');
    setError('');
    setSlots(null);
    try {
      const [{ slots: openSlots }, instructor] = await Promise.all([
        instructorCalendarService.getOpenSlots(
          detailFor.instructor_id,
          DateTime.utc().toISO(),
          DateTime.utc().plus({ days: 14 }).toISO(),
          BROWSER_TZ
        ),
        instructorService.getInstructorById(detailFor.instructor_id).catch(() => null),
      ]);
      setSlots(openSlots);
      setTutorName(instructor?.name ?? 'your tutor');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load open slots');
    }
  };

  const confirmReschedule = async () => {
    if (!chosen) return;
    setError('');
    const durationMs = DateTime.fromISO(detailFor.ends_at).diff(DateTime.fromISO(detailFor.starts_at)).toMillis();
    try {
      const start = DateTime.fromISO(chosen.starts_at);
      const res = await sessionServiceV2.requestReschedule(detailFor.session_id, {
        proposed_starts_at: start.toUTC().toISO(),
        proposed_ends_at: start.plus({ milliseconds: durationMs }).toUTC().toISO(),
      });
      setResult(res);
      setStep('done');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Reschedule request failed');
    }
  };

  if (error && !schedule) return <div className="hm-error">{error}</div>;
  if (!schedule) return <div className="hm-loading">Loading…</div>;

  return (
    <div className="hm-page">
      <h1 className="at-title">Upcoming sessions</h1>
      {notice && <div className="hm-card" style={{ color: 'var(--status-success)' }}>{notice}</div>}

      <ul className="hm-sessions">
        {schedule.sessions.map((s) => (
          <li key={s.session_id} className="hm-session" style={{ cursor: 'pointer' }} onClick={() => openDetail(s)}>
            <div className="hm-session-when">
              <span className="hm-session-day">{isoToLocal(s.starts_at).toFormat('ccc, LLL d')}</span>
              <span className="hm-session-time">{fmtTime(s.starts_at)} – {fmtTime(s.ends_at)}</span>
            </div>
            <div className="hm-session-what">
              <span className="hm-session-subject">{s.subject}</span>
              <span className="hm-session-meta">{s.class_type.replace('_', ' ')}</span>
            </div>
            {s.status === 'reschedule_requested' && <span className="hm-badge warn">awaiting confirmation</span>}
          </li>
        ))}
        {schedule.sessions.length === 0 && <div className="hm-empty">Nothing upcoming.</div>}
      </ul>

      <Modal isOpen={!!detailFor} onClose={closeModal}>
        {detailFor && step === 'detail' && (
          <div className="sc-modal">
            <h2>{detailFor.subject}</h2>
            <p className="at-subtitle">{fmt(detailFor.starts_at)} – {fmtTime(detailFor.ends_at)}</p>
            {error && <div className="hm-error">{error}</div>}
            {detailFor.status === 'reschedule_requested' ? (
              <p>A reschedule request is already pending for this session.</p>
            ) : (
              <div className="hm-actions">
                <button type="button" className="hm-btn" onClick={cancel}>Cancel session</button>
                {detailFor.class_type === 'one_on_one' && (
                  <button type="button" className="hm-btn primary" onClick={startReschedule}>Request reschedule</button>
                )}
              </div>
            )}
          </div>
        )}

        {detailFor && step === 'pick' && (
          <div className="sc-modal">
            <h2>Move this session</h2>
            <p className="at-subtitle">Suggested times {tutorName} has open. Pick one — they'll confirm.</p>
            {error && <div className="hm-error">{error}</div>}
            {slots === null ? (
              <div className="hm-loading">Loading open times…</div>
            ) : (
              <div className="sc-slot-grid">
                {slots.map((sl, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`sc-slot ${chosen === sl ? 'active' : ''}`}
                    onClick={() => setChosen(sl)}
                  >
                    {fmt(sl.starts_at)}
                  </button>
                ))}
                {slots.length === 0 && <div className="hm-empty">No open times in the next 14 days.</div>}
              </div>
            )}
            <div className="hm-actions">
              <button type="button" className="hm-btn" onClick={() => setStep('detail')}>Back</button>
              <button type="button" className="hm-btn primary" disabled={!chosen} onClick={confirmReschedule}>
                Confirm
              </button>
            </div>
          </div>
        )}

        {detailFor && step === 'done' && result && (
          <div className="sc-modal">
            <h2>Request sent</h2>
            <p>
              We asked {tutorName} to move {detailFor.subject} to {fmt(chosen.starts_at)}.
              You'll get a message once it's confirmed — your current session stays booked until then.
            </p>
            <div className="hm-actions">
              <button type="button" className="hm-btn primary" onClick={closeModal}>Done</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default StudentSchedule;
