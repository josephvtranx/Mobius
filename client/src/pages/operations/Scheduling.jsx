// Staff Scheduling (design handoff: Mobius Staff.dc.html "## Scheduling" —
// person search (students + instructors) -> a real weekly time-grid
// calendar; selecting a student reveals "Add subject", opening the
// enrollment wizard in existing-student mode). Sessions come from the
// staff date-range query (GET /api/sessions?from=&to= filtered by
// student_id/instructor_id), so the week Prev/Today/Next controls really
// browse arbitrary past/future weeks. Cancelled/moved rows are hidden —
// this is a "what's on the calendar" surface, not an audit trail.
import { useEffect, useMemo, useRef, useState } from 'react';
import { DateTime } from 'luxon';
import EnrollmentWizard from './classes/EnrollmentWizard';
import studentService from '@/services/studentService';
import instructorService from '@/services/instructorService';
import sessionServiceV2 from '@/services/sessionServiceV2';
import { tintFor } from '@/lib/rosterColors';
import '@/css/home.css';
import '@/css/schedule.css';

const GRID_START_HOUR = 7;   // 7 AM
const GRID_END_HOUR = 21;    // 9 PM
const GRID_HOURS = GRID_END_HOUR - GRID_START_HOUR;
const HOUR_PX = 52;

function initials(name) {
  const parts = String(name ?? '').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

function weekOf(dt) {
  const start = dt.minus({ days: dt.weekday - 1 }).startOf('day');
  return { start, end: start.plus({ days: 7 }) };
}

// Session statuses that should paint a block on the calendar.
const VISIBLE_STATUS = new Set(['scheduled', 'reschedule_requested', 'completed']);

function Scheduling() {
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState(null); // { type, id, name }
  const [weekOffset, setWeekOffset] = useState(0); // whole weeks from the current one
  const [sessions, setSessions] = useState(null);
  const [error, setError] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    studentService.getAllStudents().then(setStudents).catch(() => {});
    instructorService.getAllInstructors().then(setInstructors).catch(() => {});
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const people = useMemo(() => [
    ...students.map((s) => ({ type: 'student', id: s.student_id ?? s.user_id, name: s.name, sub: 'Student' })),
    ...instructors.map((i) => ({ type: 'instructor', id: i.instructor_id ?? i.id, name: i.name, sub: 'Instructor' })),
  ], [students, instructors]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return people.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, people]);

  const load = (person) => {
    setSelected(person);
    setSessions(null);
    setError('');
    setQuery('');
    setSearchOpen(false);
  };

  const now = DateTime.now();
  const { start: weekStart, end: weekEnd } = weekOf(now.plus({ weeks: weekOffset }));

  const fetchSessions = () => {
    if (!selected) return;
    setSessions(null);
    setError('');
    sessionServiceV2.listRange({
      from: weekStart.toUTC().toISO(),
      to: weekEnd.toUTC().toISO(),
      ...(selected.type === 'student' ? { student_id: selected.id } : { instructor_id: selected.id }),
    })
      .then((res) => setSessions(res.sessions.filter((s) => VISIBLE_STATUS.has(s.status))))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load schedule'));
  };
  useEffect(fetchSessions, [selected, weekOffset]);
  const weekLabel = weekStart.month === weekEnd.minus({ days: 1 }).month
    ? `${weekStart.toFormat('LLL d')} – ${weekEnd.minus({ days: 1 }).toFormat('d, yyyy')}`
    : `${weekStart.toFormat('LLL d')} – ${weekEnd.minus({ days: 1 }).toFormat('LLL d, yyyy')}`;

  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart.plus({ days: i }));
  const weekSessions = (sessions ?? []).filter((s) => {
    const d = DateTime.fromISO(s.starts_at);
    return d >= weekStart && d < weekEnd;
  });
  const byDay = weekDays.map((day) =>
    weekSessions.filter((s) => DateTime.fromISO(s.starts_at).hasSame(day, 'day')));

  const tint = selected ? tintFor(selected.name) : null;

  return (
    <div className="hm-page">
      <div className="sch-topbar">
        <h1>{weekLabel}</h1>
        <div className="sch-nav">
          <button type="button" className="hm-btn" aria-label="Previous week" onClick={() => setWeekOffset((o) => o - 1)}>‹</button>
          <button type="button" className="hm-btn" disabled={weekOffset === 0} onClick={() => setWeekOffset(0)}>Today</button>
          <button type="button" className="hm-btn" aria-label="Next week" onClick={() => setWeekOffset((o) => o + 1)}>›</button>
        </div>

        <div className="sch-search" ref={searchRef}>
          <label className="sch-search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search a student or instructor…"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
            />
            {query && (
              <button type="button" className="sch-clear" onClick={() => setQuery('')} aria-label="Clear">
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            )}
          </label>
          {searchOpen && query && (
            <div className="sch-popover">
              {results.map((p) => {
                const t = tintFor(p.name);
                return (
                  <button key={`${p.type}-${p.id}`} type="button" className="sch-result" onClick={() => load(p)}>
                    <span className="sch-avatar" style={{ background: t.bg, color: t.fg }}>{initials(p.name)}</span>
                    <span className="sch-result-text">
                      <span className="sch-result-name">{p.name}</span>
                      <span className="sch-result-sub">{p.sub}</span>
                    </span>
                  </button>
                );
              })}
              {results.length === 0 && <div className="sch-no-results">No one matches "{query}"</div>}
            </div>
          )}
        </div>
      </div>

      {selected && (
        <div className="sch-selected">
          <span className="sch-avatar sch-avatar-lg" style={{ background: tint.bg, color: tint.fg }}>{initials(selected.name)}</span>
          <div className="sch-selected-text">
            <span className="sch-selected-name">{selected.name}</span>
            <span className="sch-selected-sub">{selected.sub ?? (selected.type === 'student' ? 'Student' : 'Instructor')} · {weekSessions.length} session{weekSessions.length === 1 ? '' : 's'} this week</span>
          </div>
          <div className="sch-selected-actions">
            {selected.type === 'student' && (
              <button type="button" className="hm-btn primary" onClick={() => setWizardOpen(true)}><i className="fa-solid fa-plus"></i> Add subject</button>
            )}
            <button type="button" className="hm-btn" onClick={() => load(null)}>Clear</button>
          </div>
        </div>
      )}

      {error && (
        <div className="hm-empty sch-state sch-state-error">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <div className="sch-state-title">Couldn't load the schedule</div>
          <div className="sch-state-sub">{error}</div>
        </div>
      )}

      {!error && !selected && (
        <div className="hm-empty sch-state">
          <i className="fa-solid fa-magnifying-glass"></i>
          <div className="sch-state-title">Search a schedule</div>
          <div className="sch-state-sub">Look up any student or instructor to see their week on the calendar.</div>
        </div>
      )}

      {!error && selected && sessions === null && (
        <div className="hm-loading">Loading…</div>
      )}

      {!error && selected && sessions !== null && weekSessions.length === 0 && (
        <div className="hm-empty sch-state">
          <i className="fa-regular fa-calendar"></i>
          <div className="sch-state-title">Nothing scheduled this week</div>
          <div className="sch-state-sub">No sessions for {selected.name} between {weekStart.toFormat('LLL d')} and {weekEnd.minus({ days: 1 }).toFormat('LLL d')}.</div>
        </div>
      )}

      {!error && selected && sessions !== null && weekSessions.length > 0 && (
        <section className="hm-card sch-cal">
          <div className="sch-cal-head">
            <div className="sch-cal-gutter"></div>
            {weekDays.map((d) => (
              <div key={d.toISODate()} className={`sch-cal-day-head ${d.hasSame(now, 'day') ? 'today' : ''}`}>
                <span className="sch-dow">{d.toFormat('ccc')}</span>
                <span className="sch-daynum">{d.toFormat('d')}</span>
              </div>
            ))}
          </div>
          <div className="sch-cal-body" style={{ height: GRID_HOURS * HOUR_PX }}>
            <div className="sch-cal-gutter sch-cal-hours">
              {Array.from({ length: GRID_HOURS + 1 }, (_, i) => (
                <span key={i} className="sch-hour-label" style={{ top: i * HOUR_PX }}>
                  {DateTime.fromObject({ hour: (GRID_START_HOUR + i) % 24 }).toFormat('h a')}
                </span>
              ))}
            </div>
            {byDay.map((daySessions, i) => (
              <div key={i} className="sch-cal-col">
                {daySessions.map((s) => {
                  const start = DateTime.fromISO(s.starts_at);
                  const end = DateTime.fromISO(s.ends_at);
                  const startHour = start.hour + start.minute / 60;
                  const endHour = end.hour + end.minute / 60;
                  const top = Math.max(0, (startHour - GRID_START_HOUR)) * HOUR_PX;
                  const height = Math.max(24, (endHour - startHour) * HOUR_PX);
                  const t = tintFor(s.subject);
                  return (
                    <div key={s.session_id} className="sch-block" style={{ top, height, background: t.bg, borderLeftColor: t.fg }}>
                      <div className="sch-block-subject" style={{ color: t.fg }}>{s.subject}</div>
                      <div className="sch-block-meta"><i className="fa-regular fa-clock"></i>{start.toFormat('h:mm a')} – {end.toFormat('h:mm a')}</div>
                      {s.status === 'reschedule_requested' && <div className="sch-block-meta">Reschedule requested</div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>
      )}

      {selected?.type === 'student' && (
        <EnrollmentWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          initialStudentId={selected.id}
          onDone={fetchSessions}
        />
      )}
    </div>
  );
}

export default Scheduling;
