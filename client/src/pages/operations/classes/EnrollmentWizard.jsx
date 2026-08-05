// Staff enrollment wizard (design handoff README > Staff app > "New
// Student wizard"). Built as the design's "existing-student mode" only —
// the full 4-step brand-new-student flow (create a student + guardian
// account from inside this wizard) has no real staff-side endpoint: the
// only way a student account is created today is self-registration
// (pages/auth/register/user/StudentRegistration.jsx). Fabricating a
// student-creation form here would imply a capability that doesn't
// exist, so this wizard always starts from an existing student — which
// the design itself calls out as a real, supported mode ("skips step 1").
//
// "Smart Match" is real, not a fabricated ranking: instructors are
// filtered to ones whose real teachingSubjects (GET /instructors/roster)
// include the chosen subject, then each candidate's real open slots
// (instructorCalendarService.getOpenSlots) are fetched and shown — no
// invented rating/hours/retention numbers (they don't exist in this
// schema).
//
// The final step submits a real one-off booking (bookingService.createBooking
// — the same SCH-4 endpoint the student-facing BookSession.jsx uses,
// staff can specify any student_id). Package pricing / payment collection
// (the design's "Confirm & Pay" packages + Collect now/Send payment link)
// is explicitly PARKED pending the Top-Up spec per docs/client-ui-plan.md
// — shown as informational only (derived duration/end date), not wired
// to any real payment action.
import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import studentService from '@/services/studentService';
import subjectService from '@/services/subjectService';
import instructorService from '@/services/instructorService';
import instructorCalendarService from '@/services/instructorCalendarService';
import bookingService from '@/services/bookingService';
import Modal from '@/components/Modal';
import { packageDurationWeeks, packageEndDate } from '@/lib/derive';
import { isoToLocal } from 'mobius-lms';
import '@/css/schedule.css';
import '@/css/attendance.css';

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const fmt = (iso) => isoToLocal(iso).toFormat('ccc, LLL d · h:mm a');
const STEPS = ['Student & subject', 'Smart match', 'Confirm'];

function EnrollmentWizard({ isOpen, onClose, onDone }) {
  const [step, setStep] = useState(0);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [sessionCount, setSessionCount] = useState(10);

  const [candidates, setCandidates] = useState(null);
  const [chosenInstructor, setChosenInstructor] = useState(null);
  const [chosenSlot, setChosenSlot] = useState(null);

  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setStep(0); setStudentId(''); setSubjectId(''); setCandidates(null);
    setChosenInstructor(null); setChosenSlot(null); setError(''); setNotice('');
    studentService.getAllStudents().then(setStudents).catch(() => {});
    subjectService.getAllSubjects().then(setSubjects).catch(() => {});
  }, [isOpen]);

  const subjectName = subjects.find((s) => String(s.subject_id) === String(subjectId))?.name;

  const findMatches = async () => {
    setError('');
    setStep(1);
    setCandidates(null);
    try {
      const roster = await instructorService.getInstructorRoster();
      const teaching = roster.filter((i) => (i.teachingSubjects || []).includes(subjectName));
      const from = DateTime.utc().toISO();
      const to = DateTime.utc().plus({ days: 14 }).toISO();
      const withSlots = await Promise.all(teaching.map(async (i) => {
        const id = i.instructorId ?? i.id;
        try {
          const res = await instructorCalendarService.getOpenSlots(id, from, to, BROWSER_TZ);
          return { id, name: i.name, slots: res.slots.slice(0, 8) };
        } catch {
          return { id, name: i.name, slots: [] };
        }
      }));
      setCandidates(withSlots.filter((c) => c.slots.length > 0));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not find matching instructors');
    }
  };

  const weeks = packageDurationWeeks(sessionCount, sessionsPerWeek);
  const endDate = chosenSlot ? packageEndDate(chosenSlot.starts_at, weeks) : null;

  const submit = async () => {
    if (!chosenInstructor || !chosenSlot) return;
    setError('');
    setSubmitting(true);
    try {
      const start = DateTime.fromISO(chosenSlot.starts_at);
      const end = DateTime.fromISO(chosenSlot.ends_at);
      const res = await bookingService.createBooking({
        instructor_id: chosenInstructor.id,
        subject_id: Number(subjectId),
        student_id: Number(studentId),
        starts_at: start.toUTC().toISO(),
        ends_at: end.toUTC().toISO(),
        tz: BROWSER_TZ,
      });
      setNotice(`Booked — ${res.cost} credits when attended. ${chosenInstructor.name} has until ${fmt(res.hold_expires_at)} to confirm.`);
      onDone?.();
    } catch (err) {
      const d = err.response?.data;
      setError(d?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="sc-modal" style={{ height: 560, maxHeight: '80vh', width: 640, maxWidth: '90%', display: 'flex', flexDirection: 'column' }}>
        <div className="hm-card-head">
          <h2>Enroll a student</h2>
          <span className="at-subtitle">Step {step + 1} of {STEPS.length} — {STEPS[step]}</span>
        </div>
        {error && <div className="hm-error">{error}</div>}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {step === 0 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <label className="at-subtitle">Student
                <select className="hm-btn" style={{ width: '100%', marginTop: 4 }} value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                  <option value="">— pick student —</option>
                  {students.map((s) => (
                    <option key={s.student_id ?? s.user_id} value={s.student_id ?? s.user_id}>{s.name}</option>
                  ))}
                </select>
              </label>
              <label className="at-subtitle">Subject
                <select className="hm-btn" style={{ width: '100%', marginTop: 4 }} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                  <option value="">— pick —</option>
                  {subjects.map((s) => <option key={s.subject_id} value={s.subject_id}>{s.name}</option>)}
                </select>
              </label>
              <label className="at-subtitle">Sessions per week
                <input type="number" min="1" max="4" value={sessionsPerWeek}
                  onChange={(e) => setSessionsPerWeek(Number(e.target.value) || 1)}
                  style={{ width: '100%', marginTop: 4, padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)' }} />
              </label>
            </div>
          )}

          {step === 1 && (
            <>
              <p className="at-subtitle">Instructors who teach {subjectName} with open times in the next 14 days:</p>
              {candidates === null ? (
                <div className="hm-loading">Searching…</div>
              ) : candidates.length === 0 ? (
                <div className="hm-empty">No instructor teaching this subject has open slots in the next 14 days.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {candidates.map((c) => (
                    <div key={c.id} className="hm-card" style={{ padding: 12 }}>
                      <b>{c.name}</b>
                      <div className="sc-slot-grid" style={{ marginTop: 8 }}>
                        {c.slots.map((sl, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`sc-slot ${chosenInstructor?.id === c.id && chosenSlot === sl ? 'active' : ''}`}
                            onClick={() => { setChosenInstructor(c); setChosenSlot(sl); }}
                          >
                            {fmt(sl.starts_at)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <div style={{ display: 'grid', gap: 12 }}>
              {notice ? (
                <div className="hm-card" style={{ color: 'var(--status-success)' }}>{notice}</div>
              ) : (
                <>
                  <div className="hm-card">
                    <p><b>Student:</b> {students.find((s) => String(s.student_id ?? s.user_id) === String(studentId))?.name}</p>
                    <p><b>Subject:</b> {subjectName}</p>
                    <p><b>Instructor:</b> {chosenInstructor?.name}</p>
                    <p><b>First session:</b> {chosenSlot && fmt(chosenSlot.starts_at)}</p>
                  </div>
                  <div className="hm-card">
                    <label className="at-subtitle">Package size (sessions)
                      <select className="hm-btn" style={{ width: '100%', marginTop: 4 }} value={sessionCount} onChange={(e) => setSessionCount(Number(e.target.value))}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                      </select>
                    </label>
                    <p className="at-subtitle" style={{ marginTop: 8 }}>
                      ~{weeks?.toFixed(1)} weeks at {sessionsPerWeek}x/week — runs through {endDate ? isoToLocal(endDate).toFormat('LLL d, yyyy') : '—'}
                    </p>
                    <p className="at-subtitle" style={{ marginTop: 8, color: 'var(--status-warning)' }}>
                      Package pricing and payment collection aren't available yet (parked for the Top-Up spec) —
                      this only books the first session above, credit-gated the same as any booking.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="hm-actions" style={{ marginTop: 12 }}>
          {step > 0 && !notice && <button type="button" className="hm-btn" onClick={() => setStep((s) => s - 1)}>Back</button>}
          {step === 0 && (
            <button type="button" className="hm-btn primary" disabled={!studentId || !subjectId} onClick={findMatches}>
              Find instructors
            </button>
          )}
          {step === 1 && (
            <button type="button" className="hm-btn primary" disabled={!chosenSlot} onClick={() => setStep(2)}>
              Continue
            </button>
          )}
          {step === 2 && !notice && (
            <button type="button" className="hm-btn primary" disabled={submitting} onClick={submit}>
              {submitting ? 'Booking…' : 'Book first session'}
            </button>
          )}
          {notice && <button type="button" className="hm-btn primary" onClick={onClose}>Done</button>}
        </div>
      </div>
    </Modal>
  );
}

export default EnrollmentWizard;
