// v2 create-class form (SCH-1 payload). Group classes get student_limit;
// recurrence weekly|biweekly materializes server-side from recurrence_rule;
// 'none' = a single one-off 1:1 session. No design source (not part of the
// Claude Design export) — styled onto the shared hm-*/shell visual
// language rather than left as bare unstyled markup.
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import classService from '@/services/classService';
import subjectService from '@/services/subjectService';
import instructorService from '@/services/instructorService';
import roomService from '@/services/roomService';
import BydayEditor from './BydayEditor';
import { toUtcIso } from 'mobius-lms';
import '@/css/home.css';

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const fieldStyle = { width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--shell-border)', marginTop: 4 };

function CreateClass() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [form, setForm] = useState({
    class_type: 'group', subject_id: '', instructor_id: '', student_limit: 6,
    session_credit_cost: 5, recurrence: 'weekly',
    timezone: BROWSER_TZ,
    byday: [{ day: 'mon', start: '16:00', end: '17:00' }],
    starts_on: '', ends_on: '', open_ended: false,
    default_room_id: '',
    oneoff_start: '', oneoff_end: ''
  });

  useEffect(() => {
    subjectService.getAllSubjects().then(setSubjects).catch(() => {});
    instructorService.getInstructorRoster().then(setInstructors).catch(() => {});
    roomService.getAllRooms().then(setRooms).catch(() => {});
  }, []);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const oneOff = form.recurrence === 'none';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setWarnings([]);
    const payload = {
      class_type: oneOff ? 'one_on_one' : form.class_type,
      subject_id: Number(form.subject_id),
      instructor_id: Number(form.instructor_id),
      student_limit: (oneOff || form.class_type === 'one_on_one') ? 1 : Number(form.student_limit),
      session_credit_cost: Number(form.session_credit_cost),
      recurrence: form.recurrence,
      starts_on: form.starts_on,
      ends_on: form.open_ended ? null : (form.ends_on || null),
      default_room_id: form.default_room_id ? Number(form.default_room_id) : null
    };
    if (oneOff) {
      payload.sessions = [{
        starts_at: toUtcIso(form.oneoff_start),
        ends_at: toUtcIso(form.oneoff_end)
      }];
    } else {
      payload.recurrence_rule = { timezone: form.timezone, byday: form.byday };
    }
    try {
      const result = await classService.createClass(payload);
      setWarnings(result.warnings || []);
      navigate(`/operations/classes/${result.class.class_id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create class');
    }
  };

  return (
    <div className="hm-page" style={{ maxWidth: 640 }}>
      <p><Link to="/operations/classes" className="hm-link">← Back to classes</Link></p>
      <header className="hm-greeting">
        <h1>New class</h1>
      </header>

      {error && <div className="hm-error">{error}</div>}
      {warnings.map((w, i) => <div key={i} className="hm-warn-note">{w}</div>)}

      <form onSubmit={handleSubmit} className="hm-card" style={{ display: 'grid', gap: 14 }}>
        <label className="hm-kpi-label">Recurrence
          <select style={fieldStyle} value={form.recurrence} onChange={set('recurrence')}>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="none">One-off (1:1 only)</option>
          </select>
        </label>
        {!oneOff && (
          <label className="hm-kpi-label">Type
            <select style={fieldStyle} value={form.class_type} onChange={set('class_type')}>
              <option value="group">Group</option>
              <option value="one_on_one">One-on-one</option>
            </select>
          </label>
        )}
        {!oneOff && form.class_type === 'group' && (
          <label className="hm-kpi-label">Student limit
            <input style={fieldStyle} type="number" min="2" value={form.student_limit} onChange={set('student_limit')} />
          </label>
        )}
        <label className="hm-kpi-label">Subject
          <select style={fieldStyle} value={form.subject_id} onChange={set('subject_id')} required>
            <option value="">— pick —</option>
            {subjects.map((s) => (
              <option key={s.subject_id} value={s.subject_id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="hm-kpi-label">Instructor
          <select style={fieldStyle} value={form.instructor_id} onChange={set('instructor_id')} required>
            <option value="">— pick —</option>
            {instructors.map((i) => (
              <option key={i.instructor_id ?? i.user_id} value={i.instructor_id ?? i.user_id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
        <label className="hm-kpi-label">Credits per session
          <input style={fieldStyle} type="number" min="0" value={form.session_credit_cost} onChange={set('session_credit_cost')} />
        </label>
        <label className="hm-kpi-label">Starts on
          <input style={fieldStyle} type="date" value={form.starts_on} onChange={set('starts_on')} required />
        </label>
        {!oneOff && (
          <>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <input type="checkbox" checked={form.open_ended}
                onChange={(e) => setForm((f) => ({ ...f, open_ended: e.target.checked }))} />
              Open-ended (sessions materialize on a rolling horizon)
            </label>
            {!form.open_ended && (
              <label className="hm-kpi-label">Ends on
                <input style={fieldStyle} type="date" value={form.ends_on} onChange={set('ends_on')} />
              </label>
            )}
            <label className="hm-kpi-label">Timezone (academy wall clock)
              <input style={fieldStyle} type="text" value={form.timezone} onChange={set('timezone')} />
            </label>
            <div>
              <p className="hm-kpi-label" style={{ marginBottom: 6 }}>Weekly pattern</p>
              <BydayEditor byday={form.byday}
                onChange={(byday) => setForm((f) => ({ ...f, byday }))} />
            </div>
          </>
        )}
        {oneOff && (
          <>
            <label className="hm-kpi-label">Session start
              <input style={fieldStyle} type="datetime-local" value={form.oneoff_start} onChange={set('oneoff_start')} required />
            </label>
            <label className="hm-kpi-label">Session end
              <input style={fieldStyle} type="datetime-local" value={form.oneoff_end} onChange={set('oneoff_end')} required />
            </label>
          </>
        )}
        <label className="hm-kpi-label">Room (optional)
          <select style={fieldStyle} value={form.default_room_id} onChange={set('default_room_id')}>
            <option value="">— none —</option>
            {rooms.map((r) => (
              <option key={r.room_id} value={r.room_id}>{r.name} (seats {r.capacity})</option>
            ))}
          </select>
        </label>
        <div className="hm-actions">
          <button type="submit" className="hm-btn primary">Create class</button>
        </div>
      </form>
    </div>
  );
}

export default CreateClass;
