// v2 record timeline (template — spec 06 ACA-2): attendance + notes verbatim
// with the visible "edited" stamp; noteless entries show the subject (the
// deliberate no-shame empty state comes straight off the API).
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import studentViewService from '@/services/studentViewService';
import { isoToLocal } from 'mobius-lms';
import { isoToLocalDate } from '@/lib/timeDisplay';
import { attendanceRate } from '@/lib/derive';

function StudentRecord() {
  const { studentId } = useParams();
  const [record, setRecord] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    studentViewService.getRecord(studentId).then(setRecord)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load record'));
  }, [studentId]);

  if (error) return <div style={{ padding: 24, color: 'red' }}>{error}</div>;
  if (!record) return <div style={{ padding: 24 }}>Loading…</div>;

  const { rate, marked } = attendanceRate(record.entries);

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <h1>Session record</h1>
      {rate != null && (
        <p style={{ color: '#555', marginTop: -8, marginBottom: 16 }}>
          Attendance: {rate}% ({marked} marked session{marked === 1 ? '' : 's'}, excused not counted)
        </p>
      )}
      {record.entries.map((e) => (
        <div key={e.session_id} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
          <b>{isoToLocal(e.starts_at).toFormat('ccc, LLL d · h:mm a')}</b> · {e.subject}
          {e.attendance ? (
            <> · attendance: {e.attendance.status}{e.attendance.auto_completed ? ' (auto)' : ''}</>
          ) : ' · attendance not marked'}
          {e.note ? (
            <div style={{ marginTop: 4 }}>
              {e.note.performance && <p><b>Performance:</b> {e.note.performance}</p>}
              {e.note.improvements && <p><b>To improve:</b> {e.note.improvements}</p>}
              {e.note.free_notes && <p>{e.note.free_notes}</p>}
              {e.note.edited_at && (
                <p style={{ color: '#888', fontSize: '0.9em' }}>
                  edited {isoToLocalDate(e.note.edited_at)}
                  {e.note.edit_count > 1 ? ` (${e.note.edit_count} edits)` : ''}
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: '#888' }}>Class held — {e.subject}. No note for this session.</p>
          )}
        </div>
      ))}
      {record.entries.length === 0 && <p>No sessions recorded yet.</p>}
    </div>
  );
}

export default StudentRecord;
