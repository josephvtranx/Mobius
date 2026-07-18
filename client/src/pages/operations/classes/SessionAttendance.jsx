// v2 one-pass attendance + notes template (spec 04/06 ACA-1): one batch save
// writes attendance and per-student note templates together. Server results
// (deltas, balances, ATTENDANCE_BLOCKED / RECORD_LOCKED) render verbatim.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import classService from '@/services/classService';
import sessionServiceV2 from '@/services/sessionServiceV2';
import { isoToLocal } from 'mobius-lms';

const STATUSES = [
  'present', 'absent_unexcused', 'absent_excused',
  'cancelled_in_window', 'cancelled_late', 'instructor_cancelled'
];
const NOTE_FIELDS = ['performance', 'improvements', 'free_notes'];

function SessionAttendance() {
  const { classId, sessionId } = useParams();
  const [cls, setCls] = useState(null);
  const [marks, setMarks] = useState({});   // student_id -> { status, note }
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    classService.getClass(classId)
      .then((c) => {
        setCls(c);
        const initial = {};
        for (const r of c.roster) {
          if (r.status === 'active') initial[r.student_id] = { status: 'present', note: {} };
        }
        setMarks(initial);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load class'));
  }, [classId]);

  const session = cls?.sessions.find((s) => s.session_id === sessionId);

  const setStatus = (sid, status) =>
    setMarks((m) => ({ ...m, [sid]: { ...m[sid], status } }));
  const setNote = (sid, field, value) =>
    setMarks((m) => ({ ...m, [sid]: { ...m[sid], note: { ...m[sid].note, [field]: value } } }));

  const save = async () => {
    setError('');
    setResults(null);
    const payload = Object.entries(marks).map(([student_id, m]) => {
      const mark = { student_id: Number(student_id), status: m.status };
      if (NOTE_FIELDS.some((f) => m.note[f])) mark.note = m.note;
      return mark;
    });
    try {
      const res = await sessionServiceV2.markAttendance(sessionId, payload);
      setResults(res);
    } catch (err) {
      setError(`${err.response?.data?.code ?? ''} ${err.response?.data?.message ?? 'Save failed'}`);
    }
  };

  if (!cls) return <div style={{ padding: 24 }}>{error || 'Loading…'}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Attendance + notes</h1>
      <p><Link to={`/operations/classes/${classId}`}>← back to class</Link></p>
      {session && <p>Session: {isoToLocal(session.starts_at)} — {isoToLocal(session.ends_at)} ({session.status})</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="6">
        <thead>
          <tr><th>Student</th><th>Status</th><th>Performance</th><th>Improvements</th><th>Free notes</th></tr>
        </thead>
        <tbody>
          {cls.roster.filter((r) => marks[r.student_id]).map((r) => (
            <tr key={r.student_id}>
              <td>{r.name}</td>
              <td>
                <select value={marks[r.student_id].status}
                  onChange={(e) => setStatus(r.student_id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              {NOTE_FIELDS.map((f) => (
                <td key={f}>
                  <input type="text" value={marks[r.student_id].note[f] || ''}
                    onChange={(e) => setNote(r.student_id, f, e.target.value)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p><button onClick={save}>Save all</button></p>

      {results && (
        <div>
          <h2>Result — session {results.session_status}</h2>
          <table border="1" cellPadding="6">
            <thead><tr><th>Student</th><th>OK</th><th>Detail</th></tr></thead>
            <tbody>
              {results.results.map((r) => (
                <tr key={r.student_id}>
                  <td>{r.student_id}</td>
                  <td>{r.ok ? '✓' : '✗'}</td>
                  <td>
                    {r.ok
                      ? `${r.status} (Δ${r.delta} → balance ${r.balance})${r.note_saved ? ' · note saved' : ''}${r.note_error ? ` · note: ${r.note_error}` : ''}`
                      : `${r.code ?? ''} ${r.message ?? ''}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default SessionAttendance;
