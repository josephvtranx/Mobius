// v2 record / "Instructor feedback" (spec 06 ACA-2), card design per the
// handoff (Mobius Student.dc.html "FEEDBACK" view): tutor-initials tile in
// the subject tint, subject · tutor, date · mode, star rating, note text,
// tag pills. Data honesty notes: `performance` is TEXT in the schema — it
// renders as stars only when it holds 1–5, otherwise as a text line;
// `improvements` becomes the design's tag pill. Attendance-only sessions
// (no note yet) still appear as compact rows — the deliberate no-shame
// state — and the real attendance % keeps its line under the title.
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import studentViewService from '@/services/studentViewService';
import instructorService from '@/services/instructorService';
import { isoToLocal } from 'mobius-lms';
import { isoToLocalDate } from '@/lib/timeDisplay';
import { attendanceRate } from '@/lib/derive';

const SUBJECT_TINTS = [
  { match: /math|algebra|calc|geometr/i, bg: '#e6f3f0', fg: '#2e9d8d' },
  { match: /chem/i, bg: '#eef1fb', fg: '#5b6bc0' },
  { match: /english|lit|read|essay|writ/i, bg: '#fbeef1', fg: '#b95a76' },
  { match: /sat|test|prep/i, bg: '#fff4e0', fg: '#9c6a1d' },
];
const tintFor = (subject) =>
  SUBJECT_TINTS.find((t) => t.match.test(subject)) ?? { bg: '#e6f3f0', fg: '#2e9d8d' };
const initialsOf = (name) =>
  String(name || '').split(' ').map((w) => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
const starsFor = (performance) => {
  const n = /^[1-5]$/.test(String(performance ?? '').trim()) ? Number(performance) : null;
  return n ? '★'.repeat(n) + '☆'.repeat(5 - n) : null;
};

function StudentRecord() {
  const { studentId } = useParams();
  const [record, setRecord] = useState(null);
  const [tutors, setTutors] = useState(new Map());
  const [error, setError] = useState('');

  useEffect(() => {
    studentViewService.getRecord(studentId)
      .then(async (rec) => {
        setRecord(rec);
        const ids = [...new Set(rec.entries.map((e) => e.instructor_id).filter(Boolean))];
        const found = await Promise.all(ids.map((id) => instructorService.getInstructorById(id).catch(() => null)));
        setTutors(new Map(ids.map((id, i) => [id, found[i]?.name])));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load feedback'));
  }, [studentId]);

  if (error && !record) {
    return (
      <div className="hm-page" style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '56px 20px', background: '#fdf1ef', border: '1px solid #f0d5d0', borderRadius: 16 }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 24, color: '#9c3a31' }} />
          <div style={{ fontSize: 15.5, fontWeight: 600, marginTop: 14, color: '#9c3a31' }}>Couldn't load feedback</div>
          <div style={{ fontSize: 13.5, color: '#64827e', marginTop: 6 }}>{error}</div>
        </div>
      </div>
    );
  }
  if (!record) return <div className="hm-loading">Loading…</div>;

  const { rate, marked } = attendanceRate(record.entries);
  const noted = record.entries.filter((e) => e.note);
  const attendanceOnly = record.entries.filter((e) => !e.note);

  return (
    <div className="hm-page" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 600, letterSpacing: '-.01em' }}>Instructor feedback</h1>
      <p style={{ margin: '0 0 20px', fontSize: 14, color: '#64827e' }}>
        Notes and ratings your tutors left after each session.
        {rate != null && <> Attendance so far: <strong>{rate}%</strong> across {marked} marked session{marked === 1 ? '' : 's'} (excused not counted).</>}
      </p>

      {record.entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '56px 20px', background: '#fff', border: '1px solid #e3eeec', borderRadius: 16 }}>
          <i className="fa-solid fa-comment-medical" style={{ fontSize: 26, color: '#9fb4b0' }} />
          <div style={{ fontSize: 15.5, fontWeight: 600, marginTop: 14 }}>No feedback yet</div>
          <div style={{ fontSize: 13.5, color: '#64827e', marginTop: 6 }}>After each session, your tutor leaves notes and a rating here.</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {noted.map((e) => {
          const tint = tintFor(e.subject);
          const tutor = tutors.get(e.instructor_id);
          const stars = starsFor(e.note.performance);
          return (
            <section key={e.session_id} className="hm-card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, background: tint.bg, color: tint.fg,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>
                  {tutor ? initialsOf(tutor) : <i className="fa-solid fa-comment-medical" />}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>
                    {e.subject}{tutor && <span style={{ fontWeight: 400, color: '#64827e', fontSize: 13 }}> · {tutor}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#9fb4b0', marginTop: 2 }}>
                    {isoToLocal(e.starts_at).toFormat('LLL d, yyyy')} · {e.class_type === 'one_on_one' ? '1:1 session' : 'Group session'}
                  </div>
                </div>
                {stars && <span style={{ marginLeft: 'auto', fontSize: 14, color: '#e0a83e', flexShrink: 0, letterSpacing: 1 }}>{stars}</span>}
              </div>
              {!stars && e.note.performance && (
                <p style={{ margin: '0 0 8px', fontSize: 13.5, lineHeight: 1.6, color: '#4a635f' }}>
                  <strong>Performance:</strong> {e.note.performance}
                </p>
              )}
              {e.note.free_notes && (
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: '#4a635f' }}>{e.note.free_notes}</p>
              )}
              {(e.note.improvements || e.note.edited_at) && (
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 13, alignItems: 'center' }}>
                  {e.note.improvements && (
                    <span style={{ fontSize: 11.5, fontWeight: 500, color: '#2e9d8d', background: '#e6f3f0', padding: '4px 11px', borderRadius: 999 }}>
                      Review: {e.note.improvements}
                    </span>
                  )}
                  {e.note.edited_at && (
                    <span style={{ fontSize: 11.5, color: '#9fb4b0' }}>
                      edited {isoToLocalDate(e.note.edited_at)}{e.note.edit_count > 1 ? ` (${e.note.edit_count} edits)` : ''}
                    </span>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {attendanceOnly.length > 0 && (
          <section className="hm-card" style={{ padding: '14px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: '#9fb4b0', marginBottom: 8 }}>
              Sessions without a note yet
            </div>
            {attendanceOnly.map((e) => (
              <div key={e.session_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                borderTop: '1px solid #eef5f3', fontSize: 13, color: '#4a635f' }}>
                <span style={{ fontWeight: 500 }}>{e.subject}</span>
                <span style={{ color: '#9fb4b0' }}>{isoToLocal(e.starts_at).toFormat('ccc, LLL d · h:mm a')}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 600, borderRadius: 999, padding: '3px 10px',
                  ...(e.attendance
                    ? e.attendance.status === 'absent'
                      ? { color: '#9c3a31', background: '#fdf1ef' }
                      : e.attendance.status === 'excused'
                        ? { color: '#5b6bc0', background: '#eef1fb' }
                        : { color: '#2c8a5b', background: '#e9f5ee' }
                    : { color: '#9c6a1d', background: '#fff4e0' }) }}>
                  {e.attendance ? e.attendance.status + (e.attendance.auto_completed ? ' (auto)' : '') : 'not marked'}
                </span>
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

export default StudentRecord;
