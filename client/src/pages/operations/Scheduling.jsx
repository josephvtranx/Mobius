// Staff Scheduling (design handoff: Mobius Staff.dc.html "## Scheduling" —
// person search (students + instructors) -> their week; selecting a
// student reveals "Add subject", opening the enrollment wizard in
// existing-student mode). The previous version of this page was built
// entirely on classSeriesService/classSessionService/SmartSchedulingCalendar
// (legacy v1 — classService.js's own header comment calls these "old
// pages only"), which is why it failed against the real v2 schema. Rebuilt
// on the same real per-person calls used everywhere else: a student's week
// via studentViewService.getSchedule, an instructor's week via
// instructorService.getInstructorById's real upcoming_sessions (cross-
// referenced against classService.getAllClasses for subject names, since
// the raw session rows don't carry one).
import { useEffect, useState } from 'react';
import SearchableDropdown from '@/components/SearchableDropdown';
import EnrollmentWizard from './classes/EnrollmentWizard';
import studentService from '@/services/studentService';
import instructorService from '@/services/instructorService';
import studentViewService from '@/services/studentViewService';
import classService from '@/services/classService';
import { isoToLocal } from 'mobius-lms';
import '@/css/home.css';

function Scheduling() {
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selected, setSelected] = useState(null); // { type, id, name }
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    studentService.getAllStudents().then(setStudents).catch(() => {});
    instructorService.getAllInstructors().then(setInstructors).catch(() => {});
    classService.getAllClasses().then(setClasses).catch(() => {});
  }, []);

  const load = (person) => {
    setSelected(person);
    setSessions(null);
    setError('');
    if (!person) return;
    if (person.type === 'student') {
      studentViewService.getSchedule(person.id)
        .then((res) => setSessions(res.sessions))
        .catch((err) => setError(err.response?.data?.message || 'Failed to load schedule'));
    } else {
      instructorService.getInstructorById(person.id)
        .then((instructor) => {
          const classById = new Map(classes.map((c) => [String(c.class_id), c]));
          const rows = (instructor.upcoming_sessions || [])
            .filter((s) => s && s.starts_at)
            .map((s) => ({ ...s, subject: classById.get(String(s.class_id))?.subject ?? 'Unknown subject' }))
            .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
          setSessions(rows);
        })
        .catch((err) => setError(err.response?.data?.message || 'Failed to load schedule'));
    }
  };

  const options = [
    ...students.map((s) => ({ id: `student-${s.student_id ?? s.user_id}`, personId: s.student_id ?? s.user_id, type: 'student', name: s.name })),
    ...instructors.map((i) => ({ id: `instructor-${i.instructor_id ?? i.id}`, personId: i.instructor_id ?? i.id, type: 'instructor', name: i.name })),
  ];
  const optionGroups = {
    Students: options.filter((o) => o.type === 'student'),
    Instructors: options.filter((o) => o.type === 'instructor'),
  };

  return (
    <div className="hm-page">
      <header className="hm-greeting">
        <h1>Scheduling</h1>
        <p>Search a student or instructor to see their week.</p>
      </header>

      <div className="hm-card">
        <SearchableDropdown
          optionGroups={optionGroups}
          options={options}
          value={selected ? options.find((o) => o.id === `${selected.type}-${selected.id}`) : null}
          onChange={(opt) => load(opt ? { type: opt.type, id: opt.personId, name: opt.name } : null)}
          getOptionLabel={(o) => o.name}
          getOptionValue={(o) => o.id}
          placeholder="Search students or instructors…"
          aria-label="Search students or instructors"
        />
      </div>

      {error && <div className="hm-error">{error}</div>}

      {selected && (
        <div className="hm-card">
          <div className="hm-card-head">
            <h2>{selected.name}'s week</h2>
            {selected.type === 'student' && (
              <button type="button" className="hm-btn primary" onClick={() => setWizardOpen(true)}>+ Add subject</button>
            )}
          </div>
          {sessions === null ? (
            <div className="hm-loading">Loading…</div>
          ) : sessions.length === 0 ? (
            <div className="hm-empty">No upcoming sessions.</div>
          ) : (
            <ul className="hm-sessions">
              {sessions.map((s) => (
                <li key={s.session_id} className="hm-session">
                  <div className="hm-session-when">
                    <span className="hm-session-day">{isoToLocal(s.starts_at).toFormat('ccc, LLL d')}</span>
                    <span className="hm-session-time">{isoToLocal(s.starts_at).toFormat('h:mm a')} – {isoToLocal(s.ends_at).toFormat('h:mm a')}</span>
                  </div>
                  <div className="hm-session-what">
                    <span className="hm-session-subject">{s.subject}</span>
                  </div>
                  {s.status === 'reschedule_requested' && <span className="hm-badge warn">reschedule requested</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selected?.type === 'student' && (
        <EnrollmentWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          initialStudentId={selected.id}
          onDone={() => load(selected)}
        />
      )}
    </div>
  );
}

export default Scheduling;
