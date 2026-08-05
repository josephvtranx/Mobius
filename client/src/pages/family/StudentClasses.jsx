// v2 "My classes" (design handoff README > Student app > "My classes —
// enrolled cards: tutor, meeting time/room, next session"). There's no
// dedicated "my classes" endpoint, so this groups the real upcoming-
// sessions list (studentViewService.getSchedule) by class_id to find each
// class the student currently has sessions in, then looks up each
// class's instructor name. No progress-bar data exists in the schema, so
// that part of the design isn't shown rather than being invented.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import studentViewService from '@/services/studentViewService';
import instructorService from '@/services/instructorService';
import { isoToLocal } from 'mobius-lms';
import '@/css/my-classes.css';

function StudentClasses() {
  const { studentId } = useParams();
  const [classes, setClasses] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    studentViewService.getSchedule(studentId)
      .then(async (schedule) => {
        const byClass = new Map();
        for (const s of schedule.sessions) {
          if (!byClass.has(s.class_id)) byClass.set(s.class_id, { ...s, sessionCount: 0 });
          byClass.get(s.class_id).sessionCount += 1;
        }
        const list = [...byClass.values()];
        const instructorIds = [...new Set(list.map((c) => c.instructor_id))];
        const instructors = await Promise.all(
          instructorIds.map((id) => instructorService.getInstructorById(id).catch(() => null))
        );
        const nameById = new Map(instructorIds.map((id, i) => [id, instructors[i]?.name]));
        setClasses(list.map((c) => ({ ...c, instructorName: nameById.get(c.instructor_id) ?? 'TBD' })));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load your classes'));
  }, [studentId]);

  if (error) return <div className="hm-error">{error}</div>;
  if (!classes) return <div className="hm-loading">Loading…</div>;

  return (
    <div className="hm-page">
      <h1 className="at-title">My classes</h1>
      {classes.length === 0 && <div className="hm-empty">No upcoming classes — browse the catalog to join one.</div>}

      <div className="mc-list">
        {classes.map((c) => (
          <section key={c.class_id} className="hm-card mc-card">
            <div className="hm-card-head">
              <h2>{c.subject}</h2>
              <span className="hm-badge info">{c.class_type.replace('_', ' ')}</span>
            </div>
            <p className="at-subtitle">with {c.instructorName}</p>
            <p className="at-subtitle">
              Next session: {isoToLocal(c.starts_at).toFormat('ccc, LLL d · h:mm a')}
            </p>
            <div className="hm-card-foot">
              <Link className="hm-btn primary" to={`/family/students/${studentId}/schedule`}>View schedule</Link>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default StudentClasses;
