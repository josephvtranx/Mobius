// v2 class detail (design handoff: staff "Class detail" — roster, the
// 3-gate enroll errors, effective-dated recurrence editor, end/terminate
// with consequence copy, price editor). Server error codes render verbatim
// — the gate messages ARE the UX. Note: pending membership requests have
// no GET endpoint yet (they ride staff tasks); request-resolution UI lives
// on MembershipRequests.jsx.
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import classService from '@/services/classService';
import sessionServiceV2 from '@/services/sessionServiceV2';
import studentService from '@/services/studentService';
import BydayEditor from './BydayEditor';
import Modal from '@/components/Modal';
import { isoToLocal, toUtcIso } from 'mobius-lms';
import '@/css/attendance.css';
import '@/css/my-classes.css';
import '@/css/schedule.css';

const CANCEL_STATUSES = ['instructor_cancelled', 'cancelled_in_window', 'cancelled_late'];
const fmt = (iso) => isoToLocal(iso).toFormat('ccc, LLL d · h:mm a');
const fmtDate = (d) => (d ? String(d).slice(0, 10) : null);

function ClassDetail() {
  const { classId } = useParams();
  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [enrollId, setEnrollId] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [price, setPrice] = useState({ cost: '', effective: '' });
  const [terminateOpen, setTerminateOpen] = useState(false);
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

  const run = (fn, successText) => async () => {
    setError('');
    setNotice('');
    try {
      const result = await fn();
      setNotice(successText ?? JSON.stringify(result));
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    }
  };

  const terminate = async () => {
    setTerminateOpen(false);
    await run(() => classService.terminateClass(classId), 'Class terminated — future sessions removed, roster cleared.')();
  };

  if (!cls) return <div className="at-page">{error ? <div className="hm-error">{error}</div> : 'Loading…'}</div>;

  return (
    <div className="at-page" style={{ maxWidth: 900 }}>
      <p><Link to="/operations/classes" className="hm-link">← Back to classes</Link></p>
      <h1 className="at-title" style={{ textTransform: 'capitalize' }}>{cls.class_type} class</h1>
      <p className="at-subtitle">
        {cls.status} · {cls.session_credit_cost} credits/session · {cls.recurrence} ·
        limit {cls.student_limit} · starts {fmtDate(cls.starts_on)} ·
        {cls.ends_on ? ` ends ${fmtDate(cls.ends_on)}` : ' open-ended'}
      </p>
      {error && <div className="hm-error">{error}</div>}
      {notice && <div className="hm-card" style={{ color: 'var(--status-success)', wordBreak: 'break-word' }}>{notice}</div>}

      <section className="hm-card mc-card">
        <div className="hm-card-head"><h2>Roster</h2></div>
        <ul className="hm-list">
          {cls.roster.map((r) => (
            <li key={r.enrollment_id}>
              <span>{r.name}</span>
              <span className={`status-pill status-pill--${r.status === 'active' ? 'success' : 'warning'}`}>{r.status}</span>
            </li>
          ))}
          {cls.roster.length === 0 && <li><span>No students enrolled.</span></li>}
        </ul>
        <div className="hm-card-foot">
          <select className="hm-btn" value={enrollId} onChange={(e) => setEnrollId(e.target.value)}>
            <option value="">— pick student —</option>
            {students.map((s) => (
              <option key={s.student_id ?? s.user_id} value={s.student_id ?? s.user_id}>{s.name}</option>
            ))}
          </select>
          <button type="button" className="hm-btn primary" disabled={!enrollId}
            onClick={run(() => classService.enrollStudent(classId, Number(enrollId)), 'Student enrolled.')}>
            Enroll
          </button>
        </div>
      </section>

      <section className="hm-card mc-card">
        <div className="hm-card-head"><h2>Sessions</h2></div>
        <ul className="hm-list">
          {cls.sessions.map((s) => (
            <li key={s.session_id}>
              <span>{fmt(s.starts_at)} – {isoToLocal(s.ends_at).toFormat('h:mm a')} · {s.status}</span>
              <span className="hm-actions">
                <Link className="hm-link" to={`/operations/classes/${classId}/sessions/${s.session_id}/attendance`}>
                  Mark attendance
                </Link>
                {s.status === 'scheduled' && CANCEL_STATUSES.map((st) => (
                  <button key={st} type="button" className="hm-btn"
                    onClick={run(() => sessionServiceV2.staffCancel(s.session_id, { status: st, reason: 'staff console' }), 'Session cancelled.')}>
                    {st.replace('cancelled_', '').replace('_cancelled', '')}
                  </button>
                ))}
              </span>
            </li>
          ))}
          {cls.sessions.length === 0 && <li><span>No sessions scheduled.</span></li>}
        </ul>
      </section>

      <section className="hm-card mc-card">
        <div className="hm-card-head"><h2>Actions</h2></div>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <b>End class</b> (future-only)
            <div className="hm-actions" style={{ marginTop: 6 }}>
              <input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)' }} />
              <button type="button" className="hm-btn" disabled={!endsOn}
                onClick={run(() => classService.endClass(classId, endsOn), 'End date set.')}>
                End
              </button>
            </div>
          </div>

          <div>
            <b>Terminate</b> — immediate, cannot be undone
            <div className="hm-actions" style={{ marginTop: 6 }}>
              <button type="button" className="hm-btn" style={{ color: 'var(--status-error)' }} onClick={() => setTerminateOpen(true)}>
                Terminate now
              </button>
            </div>
          </div>

          <div>
            <b>Price change</b> (future-only)
            <div className="hm-actions" style={{ marginTop: 6 }}>
              <input type="number" placeholder="credits" value={price.cost}
                onChange={(e) => setPrice((p) => ({ ...p, cost: e.target.value }))}
                style={{ width: 100, padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)' }} />
              <input type="datetime-local" value={price.effective}
                onChange={(e) => setPrice((p) => ({ ...p, effective: e.target.value }))}
                style={{ padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)' }} />
              <button type="button" className="hm-btn" disabled={!price.cost || !price.effective}
                onClick={run(() => classService.setPrice(classId, Number(price.cost), toUtcIso(price.effective)), 'Price change scheduled.')}>
                Set price
              </button>
            </div>
          </div>

          {cls.recurrence !== 'none' && (
            <div>
              <b>Schedule change</b> (future-only; regenerates sessions from the effective date)
              <div style={{ marginTop: 6 }}>
                <BydayEditor byday={schedule.byday}
                  onChange={(byday) => setSchedule((s) => ({ ...s, byday }))} />
                <div className="hm-actions" style={{ marginTop: 6 }}>
                  effective from:
                  <input type="date" value={schedule.effective}
                    onChange={(e) => setSchedule((s) => ({ ...s, effective: e.target.value }))}
                    style={{ padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)' }} />
                  <button type="button" className="hm-btn" disabled={!schedule.effective}
                    onClick={run(() => classService.updateSchedule(classId, {
                      recurrence_rule: {
                        timezone: cls.recurrence_rule?.timezone
                          || Intl.DateTimeFormat().resolvedOptions().timeZone,
                        byday: schedule.byday
                      },
                      effective_from: schedule.effective
                    }), 'New schedule applied.')}>
                    Apply new pattern
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Modal isOpen={terminateOpen} onClose={() => setTerminateOpen(false)}>
        <div className="sc-modal">
          <h2>Terminate this class?</h2>
          <p>
            This removes every future session and clears the roster immediately.
            Past attendance and billing already recorded are not affected. This cannot be undone.
          </p>
          <div className="hm-actions">
            <button type="button" className="hm-btn" onClick={() => setTerminateOpen(false)}>Cancel</button>
            <button type="button" className="hm-btn primary" style={{ background: 'var(--status-error)', borderColor: 'var(--status-error)' }} onClick={terminate}>
              Terminate now
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ClassDetail;
