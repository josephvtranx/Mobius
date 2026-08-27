// v2 "My classes" — enrolled-class cards per the design handoff (Mobius
// Student.dc.html "MY CLASSES" view): tinted subject banner (icon tile +
// pill), tutor, meeting pattern · room, next session, progress bar, View
// schedule + message-tutor actions. There's no dedicated endpoint, so this
// groups the real upcoming-sessions list by class_id. The design's "level"
// pill has no schema source — the class type (Group / One-on-one) fills that
// slot. Progress has no course-progress source either; the bar shows the
// student's real attendance % for the class (attended ÷ marked, excused
// excluded — the handoff's own derivation) and hides until something is
// marked, rather than inventing numbers.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import studentViewService from '@/services/studentViewService';
import instructorService from '@/services/instructorService';
import messageService from '@/services/messageService';
import { isoToLocal } from 'mobius-lms';
import { lookFor } from '@/lib/subjectLooks';
import '@/css/my-classes.css';

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function StudentClasses() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      studentViewService.getSchedule(studentId),
      studentViewService.getRecord(studentId).catch(() => ({ entries: [] })),
    ])
      .then(async ([schedule, record]) => {
        const byClass = new Map();
        for (const s of schedule.sessions) {
          if (!byClass.has(s.class_id)) byClass.set(s.class_id, { ...s, sessions: [] });
          byClass.get(s.class_id).sessions.push(s);
        }
        // Attendance % per class from the record (attended ÷ marked, excused
        // excluded) — the design's derivation for a class progress figure.
        const att = new Map();
        for (const e of record.entries ?? []) {
          const status = e.attendance?.status;
          if (!status || status === 'excused') continue;
          const a = att.get(e.class_id) ?? { attended: 0, marked: 0 };
          a.marked += 1;
          if (status === 'present' || status === 'late') a.attended += 1;
          att.set(e.class_id, a);
        }
        const list = [...byClass.values()];
        const instructorIds = [...new Set(list.map((c) => c.instructor_id))];
        const instructors = await Promise.all(
          instructorIds.map((id) => instructorService.getInstructorById(id).catch(() => null))
        );
        const nameById = new Map(instructorIds.map((id, i) => [id, instructors[i]?.name]));
        setClasses(list.map((c) => {
          const days = [...new Set(c.sessions.map((s) => isoToLocal(s.starts_at).toFormat('ccc')))]
            .sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
          const a = att.get(c.class_id);
          return {
            ...c,
            instructorName: nameById.get(c.instructor_id) ?? 'TBD',
            when: `${days.join(' & ')} · ${isoToLocal(c.starts_at).toFormat('h:mm a')}`,
            room: c.sessions.find((s) => s.room)?.room ?? null,
            attendancePct: a && a.marked > 0 ? Math.round((a.attended / a.marked) * 100) : null,
          };
        }));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load your classes'));
  }, [studentId]);

  const messageTutor = async (instructorId) => {
    try {
      await messageService.startConversation(instructorId);
      navigate('/messages');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start conversation');
    }
  };

  const nextLabel = (iso) => {
    const d = isoToLocal(iso);
    const now = DateTime.now();
    const day = d.hasSame(now, 'day') ? 'Today'
      : d.hasSame(now.plus({ days: 1 }), 'day') ? 'Tomorrow'
      : d.toFormat('ccc');
    return `Next: ${day} · ${d.toFormat('h:mm a')}`;
  };

  if (error && !classes) return <div className="hm-error">{error}</div>;
  if (!classes) return <div className="hm-loading">Loading…</div>;

  return (
    <div className="hm-page" style={{ maxWidth: 1160, margin: '0 auto' }}>
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: '-.01em' }}>My classes</h1>
        <p style={{ margin: '7px 0 0', fontSize: 14, color: '#64827e' }}>
          The classes you're enrolled in this term. Want more? Browse the{' '}
          <Link to="/catalog" style={{ color: '#2e9d8d', fontWeight: 500 }}>class catalog</Link>.
        </p>
      </div>
      {error && <div className="hm-error" style={{ marginBottom: 14 }}>{error}</div>}
      {classes.length === 0 && <div className="hm-empty">No upcoming classes — browse the catalog to join one.</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 18 }}>
        {classes.map((c) => {
          const look = lookFor(c.subject);
          return (
            <div key={c.class_id} className="hm-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 70, background: look.band, display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '0 18px' }}>
                <span style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(255,255,255,.85)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: look.accent }}>
                  <i className={look.icon} />
                </span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: look.accent,
                  background: 'rgba(255,255,255,.85)', padding: '5px 11px', borderRadius: 999 }}>
                  {c.class_type === 'one_on_one' ? 'One-on-one' : 'Group'}
                </span>
              </div>
              <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{c.subject}</div>
                <div style={{ fontSize: 12.5, color: '#64827e', marginTop: 3 }}>{c.instructorName}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '13px 0 14px', fontSize: 12.5, color: '#4a635f' }}>
                  <span>
                    <i className="fa-regular fa-calendar" style={{ width: 16, color: '#9fb4b0' }} />
                    {c.when}{c.room ? ` · ${c.room}` : ''}
                  </span>
                  <span>
                    <i className="fa-regular fa-clock" style={{ width: 16, color: '#9fb4b0' }} />
                    {nextLabel(c.starts_at)}
                  </span>
                </div>
                {c.attendancePct != null && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                      <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: '#9fb4b0' }}>Progress</span>
                      <span style={{ fontSize: 12, color: '#64827e' }}>{c.attendancePct}% · attendance</span>
                    </div>
                    <div style={{ height: 7, borderRadius: 999, background: '#edf4f2', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 999, width: `${c.attendancePct}%`, background: look.accent }} />
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 'auto', display: 'flex', gap: 9 }}>
                  <Link className="hm-btn primary" to={`/family/students/${studentId}/schedule`}
                    style={{ flex: 1, justifyContent: 'center', height: 38 }}>
                    <i className="fa-regular fa-calendar" style={{ marginRight: 7 }} />View schedule
                  </Link>
                  <button type="button" className="hm-btn" onClick={() => messageTutor(c.instructor_id)}
                    title="Message tutor" style={{ width: 44, padding: 0, justifyContent: 'center' }}>
                    <i className="fa-regular fa-comment-dots" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StudentClasses;
