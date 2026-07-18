// v2 create-class form (template — SCH-1 payload; plain markup, polish later).
// Group classes get student_limit; recurrence weekly|biweekly materializes
// server-side from recurrence_rule; 'none' = a single one-off 1:1 session.
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import classService from '@/services/classService';
import subjectService from '@/services/subjectService';
import instructorService from '@/services/instructorService';
import BydayEditor from './BydayEditor';
import { toUtcIso } from '@/lib/time';

const BROWSER_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

function CreateClass() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [instructors, setInstructors] = useState([]);
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
    <div style={{ padding: 24, maxWidth: 640 }}>
      <h1>New class (v2)</h1>
      <p><Link to="/operations/classes">← back to classes</Link></p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {warnings.map((w, i) => <p key={i} style={{ color: 'orange' }}>{w}</p>)}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
        <label>Recurrence:
          <select value={form.recurrence} onChange={set('recurrence')}>
            <option value="weekly">weekly</option>
            <option value="biweekly">biweekly</option>
            <option value="none">one-off (1:1 only)</option>
          </select>
        </label>
        {!oneOff && (
          <label>Type:
            <select value={form.class_type} onChange={set('class_type')}>
              <option value="group">group</option>
              <option value="one_on_one">one-on-one</option>
            </select>
          </label>
        )}
        {!oneOff && form.class_type === 'group' && (
          <label>Student limit:
            <input type="number" min="2" value={form.student_limit} onChange={set('student_limit')} />
          </label>
        )}
        <label>Subject:
          <select value={form.subject_id} onChange={set('subject_id')} required>
            <option value="">— pick —</option>
            {subjects.map((s) => (
              <option key={s.subject_id} value={s.subject_id}>{s.name}</option>
            ))}
          </select>
        </label>
        <label>Instructor:
          <select value={form.instructor_id} onChange={set('instructor_id')} required>
            <option value="">— pick —</option>
            {instructors.map((i) => (
              <option key={i.instructor_id ?? i.user_id} value={i.instructor_id ?? i.user_id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
        <label>Credits per session:
          <input type="number" min="0" value={form.session_credit_cost} onChange={set('session_credit_cost')} />
        </label>
        <label>Starts on:
          <input type="date" value={form.starts_on} onChange={set('starts_on')} required />
        </label>
        {!oneOff && (
          <>
            <label>
              <input type="checkbox" checked={form.open_ended}
                onChange={(e) => setForm((f) => ({ ...f, open_ended: e.target.checked }))} />
              open-ended (sessions materialize on a rolling horizon)
            </label>
            {!form.open_ended && (
              <label>Ends on:
                <input type="date" value={form.ends_on} onChange={set('ends_on')} />
              </label>
            )}
            <label>Timezone (academy wall clock):
              <input type="text" value={form.timezone} onChange={set('timezone')} />
            </label>
            <div>
              Weekly pattern:
              <BydayEditor byday={form.byday}
                onChange={(byday) => setForm((f) => ({ ...f, byday }))} />
            </div>
          </>
        )}
        {oneOff && (
          <>
            <label>Session start:
              <input type="datetime-local" value={form.oneoff_start} onChange={set('oneoff_start')} required />
            </label>
            <label>Session end:
              <input type="datetime-local" value={form.oneoff_end} onChange={set('oneoff_end')} required />
            </label>
          </>
        )}
        <label>Room id (optional — no rooms API yet; numeric id):
          <input type="number" value={form.default_room_id} onChange={set('default_room_id')} />
        </label>
        <button type="submit">Create class</button>
      </form>
    </div>
  );
}

export default CreateClass;
