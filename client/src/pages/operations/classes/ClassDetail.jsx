// v2 class detail (template): facts + roster/enroll + sessions + staff actions
// (end / terminate / price / schedule edit). Server error codes render
// verbatim — the gate messages ARE the UX for now (polish later).
// Note: pending membership requests have no GET endpoint yet (they ride staff
// tasks); request-resolution UI lands with the family-surfaces slice.
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import classService from '@/services/classService';
import sessionServiceV2 from '@/services/sessionServiceV2';
import studentService from '@/services/studentService';
import BydayEditor from './BydayEditor';
import { isoToLocal, toUtcIso } from '@/lib/time';

const CANCEL_STATUSES = ['instructor_cancelled', 'cancelled_in_window', 'cancelled_late'];

function ClassDetail() {
  const { classId } = useParams();
  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [enrollId, setEnrollId] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [price, setPrice] = useState({ cost: '', effective: '' });
  const [schedule, setSchedule] = useState({
    byday: [{ day: 'mon', start: '16:00', end: '17:00' }], effective: ''
  });

  const load = useCallback(() => {
    classService.getClass(classId)
      .then(setCls)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load class'));
  }, [classId]);

  useEffect(() => {
    load();
    studentService.getAllStudents().then(setStudents).catch(() => {});
  }, [load]);

  const run = (fn) => async () => {
    setError('');
    setNotice('');
    try {
      const result = await fn();
      setNotice(JSON.stringify(result));
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    }
  };

  if (!cls) return <div style={{ padding: 24 }}>{error || 'Loading…'}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>{cls.class_type} class — {cls.status}</h1>
      <p><Link to="/operations/classes">← back to classes</Link></p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {notice && <p style={{ color: 'green', wordBreak: 'break-all' }}>{notice}</p>}
      <p>
        Cost: {cls.session_credit_cost} credits · Recurrence: {cls.recurrence} ·
        Limit: {cls.student_limit} · Starts: {String(cls.starts_on).slice(0, 10)} ·
        Ends: {cls.ends_on ? String(cls.ends_on).slice(0, 10) : 'open-ended'}
      </p>

      <h2>Roster</h2>
      <table border="1" cellPadding="6">
        <thead><tr><th>Student</th><th>Status</th></tr></thead>
        <tbody>
          {cls.roster.map((r) => (
            <tr key={r.enrollment_id}><td>{r.name}</td><td>{r.status}</td></tr>
          ))}
        </tbody>
      </table>
      <p>
        <select value={enrollId} onChange={(e) => setEnrollId(e.target.value)}>
          <option value="">— pick student —</option>
          {students.map((s) => (
            <option key={s.student_id ?? s.user_id} value={s.student_id ?? s.user_id}>
              {s.name}
            </option>
          ))}
        </select>
        <button onClick={run(() => classService.enrollStudent(classId, Number(enrollId)))}>
          Enroll
        </button>
      </p>

      <h2>Sessions</h2>
      <table border="1" cellPadding="6">
        <thead><tr><th>Starts</th><th>Ends</th><th>Status</th><th>Attendance</th><th>Staff cancel</th></tr></thead>
        <tbody>
          {cls.sessions.map((s) => (
            <tr key={s.session_id}>
              <td>{isoToLocal(s.starts_at)}</td>
              <td>{isoToLocal(s.ends_at)}</td>
              <td>{s.status}</td>
              <td>
                <Link to={`/operations/classes/${classId}/sessions/${s.session_id}/attendance`}>
                  mark
                </Link>
              </td>
              <td>
                {s.status === 'scheduled' && CANCEL_STATUSES.map((st) => (
                  <button key={st} style={{ marginRight: 4 }}
                    onClick={run(() => sessionServiceV2.staffCancel(s.session_id, { status: st, reason: 'staff console' }))}>
                    {st.replace('cancelled_', '').replace('_cancelled', '')}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Actions</h2>
      <div style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
        <div>
          <b>End class</b>: <input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
          <button onClick={run(() => classService.endClass(classId, endsOn))}>End</button>
        </div>
        <div>
          <b>Terminate</b>:
          <button onClick={() => {
            if (window.confirm('Terminate immediately? Future sessions are removed and the roster cleared.')) {
              run(() => classService.terminateClass(classId))();
            }
          }}>Terminate now</button>
        </div>
        <div>
          <b>Price change</b> (future-only):
          <input type="number" placeholder="credits" value={price.cost}
            onChange={(e) => setPrice((p) => ({ ...p, cost: e.target.value }))} />
          <input type="datetime-local" value={price.effective}
            onChange={(e) => setPrice((p) => ({ ...p, effective: e.target.value }))} />
          <button onClick={run(() => classService.setPrice(classId, Number(price.cost), toUtcIso(price.effective)))}>
            Set price
          </button>
        </div>
        {cls.recurrence !== 'none' && (
          <div>
            <b>Schedule change</b> (future-only; regenerates sessions from the effective date):
            <BydayEditor byday={schedule.byday}
              onChange={(byday) => setSchedule((s) => ({ ...s, byday }))} />
            effective from:
            <input type="date" value={schedule.effective}
              onChange={(e) => setSchedule((s) => ({ ...s, effective: e.target.value }))} />
            <button onClick={run(() => classService.updateSchedule(classId, {
              recurrence_rule: {
                timezone: cls.recurrence_rule?.timezone
                  || Intl.DateTimeFormat().resolvedOptions().timeZone,
                byday: schedule.byday
              },
              effective_from: schedule.effective
            }))}>
              Apply new pattern
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClassDetail;
