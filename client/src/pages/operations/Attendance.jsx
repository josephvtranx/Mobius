// Staff attendance is a read-only oversight surface. Instructors record what
// happened in the room; staff can browse ended sessions and inspect the saved
// student-by-student log, including who marked it and whether it was automatic.
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import Modal from '@/components/Modal';
import sessionServiceV2 from '@/services/sessionServiceV2';
import { lookFor } from '@/lib/subjectLooks';
import { isoToLocal } from 'mobius-lms';
import '@/css/attendance.css';

const STATUS_META = {
  present: { label: 'Present', tone: 'success' },
  absent_unexcused: { label: 'Absent', tone: 'error' },
  absent_excused: { label: 'Excused', tone: 'info' },
  cancelled_in_window: { label: 'Cancelled in time', tone: 'neutral' },
  cancelled_late: { label: 'Late cancellation', tone: 'warning' },
  instructor_cancelled: { label: 'Instructor cancelled', tone: 'neutral' },
};

function sourceLabel(session) {
  if (session.auto_completed && session.recorded_by) return `${session.recorded_by} + automatic updates`;
  if (session.auto_completed) return 'Automatic record';
  if (session.recorded_by) return `Recorded by ${session.recorded_by}`;
  return 'Awaiting instructor';
}

function sessionSummary(session) {
  const parts = [];
  if (session.present_count) parts.push(`${session.present_count} present`);
  if (session.absent_count) parts.push(`${session.absent_count} absent`);
  if (session.excused_count) parts.push(`${session.excused_count} excused`);
  if (session.cancelled_count) parts.push(`${session.cancelled_count} cancelled`);
  return parts.join(' · ') || `${session.recorded_count} recorded`;
}

function Attendance() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSession = searchParams.get('session');
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('recorded');
  const [day, setDay] = useState(DateTime.now().startOf('day'));
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState('');

  useEffect(() => {
    let active = true;
    setSessions(null);
    setError('');
    const from = day.startOf('day').toUTC().toISO();
    const to = day.plus({ days: 1 }).startOf('day').toUTC().toISO();
    sessionServiceV2.getAttendanceLogs(from, to)
      .then((data) => { if (active) setSessions(data.sessions); })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Failed to load attendance logs');
      });
    return () => { active = false; };
  }, [day]);

  useEffect(() => {
    if (!requestedSession) return undefined;
    let active = true;
    setSelected({ session_id: requestedSession });
    setDetail(null);
    setDetailError('');
    sessionServiceV2.getAttendanceLog(requestedSession)
      .then((data) => {
        if (!active) return;
        setSelected(data.session);
        setDetail(data);
        const sessionDay = isoToLocal(data.session.starts_at).startOf('day');
        setDay((current) => current.hasSame(sessionDay, 'day') ? current : sessionDay);
      })
      .catch((err) => {
        if (active) setDetailError(err.response?.data?.message || 'Failed to load attendance log');
      });
    return () => { active = false; };
  }, [requestedSession]);

  const closeLog = () => {
    setSelected(null);
    setDetail(null);
    setDetailError('');
    setSearchParams({});
  };

  const logs = sessions ?? [];
  const recorded = logs.filter((session) => session.recorded_count > 0);
  const awaiting = logs.filter((session) => session.recorded_count === 0);
  const needle = q.trim().toLowerCase();
  const shown = (tab === 'recorded' ? recorded : awaiting)
    .filter((session) => !needle || `${session.subject} ${session.instructor}`.toLowerCase().includes(needle));
  const isToday = day.hasSame(DateTime.now(), 'day');

  return (
    <main className="hm-page attendance-page">
      <div className="attendance-anchor">
        <div className="attendance-date-nav" aria-label="Choose attendance date">
          <button type="button" aria-label="Previous day"
            onClick={() => setDay((current) => current.minus({ days: 1 }))}>
            <i className="fa-solid fa-chevron-left" />
          </button>
          <div className="attendance-day">
            <strong>{isToday ? 'Today' : day.toFormat('cccc')}</strong>
            <span>{day.toFormat('LLL d, yyyy')}</span>
          </div>
          <button type="button" aria-label="Next day"
            onClick={() => setDay((current) => current.plus({ days: 1 }))}>
            <i className="fa-solid fa-chevron-right" />
          </button>
          {!isToday && (
            <button type="button" className="attendance-today"
              onClick={() => setDay(DateTime.now().startOf('day'))}>
              Go to today
            </button>
          )}
        </div>

        <div className="attendance-tools">
          <label className="attendance-search">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input type="text" placeholder="Find a class or instructor"
              aria-label="Find a class or instructor" value={q} onChange={(event) => setQ(event.target.value)} />
          </label>
          <div className="attendance-tabs" aria-label="Attendance log status">
            <button type="button" aria-pressed={tab === 'recorded'} onClick={() => setTab('recorded')}>
              Recorded <span>{recorded.length}</span>
            </button>
            <button type="button" aria-pressed={tab === 'awaiting'} onClick={() => setTab('awaiting')}>
              Awaiting <span>{awaiting.length}</span>
            </button>
          </div>
        </div>
      </div>

      {error && <div className="hm-error attendance-error">{error}</div>}
      {!error && sessions === null && <div className="attendance-loading">Loading attendance logs…</div>}

      {!error && sessions !== null && (
        <div className="attendance-list">
          {shown.map((session) => {
            const look = lookFor(session.subject);
            const recordedSession = session.recorded_count > 0;
            return (
              <section key={session.session_id} className="attendance-row attendance-log-row">
                <span className="attendance-subject-icon" style={{ background: look.band, color: look.accent }}>
                  <i className={look.icon} />
                </span>
                <div className="attendance-session">
                  <strong>{session.subject}</strong>
                  <span>
                    {isoToLocal(session.starts_at).toFormat('h:mm a')}
                    {session.room && ` · ${session.room}`}
                    {` · ${session.instructor}`}
                    {` · ${session.recorded_count || session.enrolled_count} student${(session.recorded_count || session.enrolled_count) === 1 ? '' : 's'}`}
                  </span>
                </div>
                <div className="attendance-log-summary">
                  <strong>{recordedSession ? sessionSummary(session) : 'No record submitted'}</strong>
                  <span>{sourceLabel(session)}</span>
                </div>
                <span className={`attendance-status attendance-status--${recordedSession ? (session.auto_completed ? 'neutral' : 'success') : 'warning'}`}>
                  {recordedSession ? 'Recorded' : 'Awaiting instructor'}
                </span>
                <div className="attendance-actions">
                  {recordedSession && (
                    <button type="button" className="hm-btn"
                      aria-label={`View ${session.subject} attendance log at ${isoToLocal(session.starts_at).toFormat('h:mm a')}`}
                      onClick={() => setSearchParams({ session: session.session_id })}>
                      View log
                    </button>
                  )}
                </div>
              </section>
            );
          })}

          {shown.length === 0 && (
            <div className="attendance-empty">
              <i className={`fa-solid ${tab === 'recorded' ? 'fa-clipboard-list' : 'fa-clock'}`} aria-hidden="true" />
              <strong>
                {needle
                  ? `No attendance logs match “${q.trim()}”`
                  : tab === 'recorded'
                    ? 'No attendance recorded for this day'
                    : 'No instructor records are outstanding'}
              </strong>
              <span>
                {needle
                  ? 'Try another class or instructor name.'
                  : tab === 'recorded'
                    ? 'Completed class records will appear here after the instructor submits attendance.'
                    : 'Any ended classes still waiting for attendance will appear here.'}
              </span>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={!!selected} onClose={closeLog}>
        <div className="attendance-log-modal">
          <div className="attendance-log-modal-head">
            <div>
              <span>Attendance log</span>
              <h2>{detail?.session?.subject || selected?.subject || 'Loading…'}</h2>
              {detail?.session && (
                <p>
                  {isoToLocal(detail.session.starts_at).toFormat('ccc, LLL d · h:mm a')}
                  {detail.session.room && ` · ${detail.session.room}`}
                  {` · ${detail.session.instructor}`}
                </p>
              )}
            </div>
            <button type="button" aria-label="Close attendance log" onClick={closeLog}>
              <i className="fa-solid fa-xmark" />
            </button>
          </div>

          {detailError && <div className="hm-error">{detailError}</div>}
          {!detail && !detailError && <div className="attendance-log-loading">Loading record…</div>}
          {detail && detail.records.length === 0 && (
            <div className="attendance-log-loading">No attendance was submitted for this class.</div>
          )}
          {detail?.records.length > 0 && (
            <div className="attendance-records">
              {detail.records.map((record) => {
                const meta = STATUS_META[record.status] ?? { label: record.status.replace(/_/g, ' '), tone: 'neutral' };
                return (
                  <div key={record.student_id} className="attendance-record">
                    <span className="attendance-record-avatar">{record.student.slice(0, 1).toUpperCase()}</span>
                    <div>
                      <strong>{record.student}</strong>
                      <span>
                        {record.auto_completed ? 'Automatic record' : `Recorded by ${record.marked_by || 'Unknown'}`}
                        {record.marked_at && ` · ${isoToLocal(record.marked_at).toFormat('h:mm a')}`}
                      </span>
                    </div>
                    <span className={`attendance-record-status attendance-record-status--${meta.tone}`}>
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </main>
  );
}

export default Attendance;
