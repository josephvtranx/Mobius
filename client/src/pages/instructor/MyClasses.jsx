// Instructor "My classes" (design handoff README > Instructor app > My
// classes): roster grids showing each student's status. There's no "list
// classes I teach" endpoint, so instructorService.getMyClasses() derives it
// from GET /instructors/:id's session history (see that method's comment).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '@/services/authService';
import instructorService from '@/services/instructorService';
import { isoToLocal } from 'mobius-lms';
import { DateTime } from 'luxon';
import '@/css/attendance.css';
import '@/css/my-classes.css';

function MyClasses() {
  const instructorId = authService.getCurrentUser()?.user_id;
  const [classes, setClasses] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    instructorService.getMyClasses(instructorId)
      .then(setClasses)
      .catch((err) => setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load your classes'));
  }, [instructorId]);

  if (error) return <div className="hm-error">{error}</div>;
  if (!classes) return <div className="hm-loading">Loading…</div>;

  return (
    <div className="at-page">
      <h1 className="at-title">My classes</h1>
      {classes.length === 0 && <div className="hm-empty">You aren't teaching any classes yet.</div>}

      <div className="mc-list">
        {classes.map((cls) => {
          const now = DateTime.now();
          const nextSession = cls.sessions.find((s) => isoToLocal(s.starts_at) > now);
          const activeRoster = cls.roster.filter((r) => r.status === 'active');
          return (
            <section key={cls.class_id} className="hm-card mc-card">
              <div className="hm-card-head">
                <h2>{cls.subject ?? cls.class_type}</h2>
                <span className="hm-badge info">{activeRoster.length} enrolled</span>
              </div>

              {nextSession ? (
                <p className="at-subtitle">
                  Next session: {isoToLocal(nextSession.starts_at).toFormat('ccc, LLL d · h:mm a')}
                </p>
              ) : (
                <p className="at-subtitle">No upcoming sessions scheduled.</p>
              )}

              <ul className="hm-list">
                {activeRoster.map((r) => <li key={r.student_id}><span>{r.name}</span></li>)}
                {activeRoster.length === 0 && <li><span>No students enrolled.</span></li>}
              </ul>

              <div className="hm-card-foot">
                {nextSession && (
                  <Link
                    className="hm-btn primary"
                    to={`/operations/classes/${cls.class_id}/sessions/${nextSession.session_id}/attendance`}
                  >
                    Take attendance
                  </Link>
                )}
                <Link className="hm-btn" to="/instructor/feedback">Write feedback</Link>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default MyClasses;
