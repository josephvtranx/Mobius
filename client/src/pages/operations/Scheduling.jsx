// Staff Scheduling — an academy-wide resource day by default, with an agenda
// alternative. Search narrows the same master schedule to a student
// or instructor without changing the calendar interaction model.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateTime } from 'luxon';
import Modal from '@/components/Modal';
import AddSubjectModal from './classes/AddSubjectModal';
import studentService from '@/services/studentService';
import instructorService from '@/services/instructorService';
import studentViewService from '@/services/studentViewService';
import classService from '@/services/classService';
import roomService from '@/services/roomService';
import { tintFor } from '@/lib/rosterColors';
import '@/css/home.css';
import '@/css/schedule.css';

const GRID_START_HOUR = 7;
const GRID_END_HOUR = 21;
const HOUR_PX = 52;

function initials(name) {
  const parts = String(name ?? '').trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

function weekOf(dt) {
  const start = dt.minus({ days: dt.weekday - 1 }).startOf('day');
  return { start, end: start.plus({ days: 7 }) };
}

function eventGeometry(session, gridStartHour = GRID_START_HOUR) {
  const start = DateTime.fromISO(session.starts_at);
  const end = DateTime.fromISO(session.ends_at);
  const startHour = start.hour + start.minute / 60;
  const endHour = end.hour + end.minute / 60;
  return {
    start,
    end,
    topHours: Math.max(0, startHour - gridStartHour),
    durationHours: endHour - startHour,
  };
}

// Assign simultaneous events to horizontal lanes so none can cover another.
// A connected overlap cluster shares one lane count, keeping widths stable.
function layoutOverlaps(sessions) {
  const sorted = [...sessions].sort((left, right) =>
    DateTime.fromISO(left.starts_at).toMillis() - DateTime.fromISO(right.starts_at).toMillis());
  const clusters = [];
  let cluster = [];
  let clusterEnd = Number.NEGATIVE_INFINITY;

  const flush = () => {
    if (cluster.length) clusters.push(cluster);
    cluster = [];
    clusterEnd = Number.NEGATIVE_INFINITY;
  };

  for (const session of sorted) {
    const start = DateTime.fromISO(session.starts_at).toMillis();
    const end = DateTime.fromISO(session.ends_at).toMillis();
    if (cluster.length && start >= clusterEnd) flush();
    cluster.push(session);
    clusterEnd = Math.max(clusterEnd, end);
  }
  flush();

  return clusters.flatMap((items) => {
    const laneEnds = [];
    const placed = items.map((session) => {
      const start = DateTime.fromISO(session.starts_at).toMillis();
      const end = DateTime.fromISO(session.ends_at).toMillis();
      let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
      if (lane === -1) lane = laneEnds.length;
      laneEnds[lane] = end;
      return { session, lane };
    });
    return placed.map((entry) => ({ ...entry, laneCount: laneEnds.length }));
  });
}

function CalendarEvent({ entry, secondary, onOpen, gridStartHour = GRID_START_HOUR }) {
  const { session, lane, laneCount } = entry;
  const { start, end, topHours, durationHours } = eventGeometry(session, gridStartHour);
  const tint = tintFor(session.subject);
  const laneWidth = 100 / laneCount;
  const timeLabel = start.minute === 0 && end.minute === 0
    ? `${start.toFormat('h')}–${end.toFormat('h a')}`
    : `${start.toFormat('h:mm')}–${end.toFormat('h:mm a')}`;
  return (
    <button
      type="button"
      className="sch-block"
      style={{
        top: `calc(${topHours} * var(--sch-hour-height, ${HOUR_PX}px))`,
        height: `max(30px, calc(${durationHours} * var(--sch-hour-height, ${HOUR_PX}px)))`,
        left: `calc(${lane * laneWidth}% + 4px)`,
        width: `calc(${laneWidth}% - 8px)`,
        right: 'auto',
        background: tint.bg,
        borderLeftColor: tint.fg,
      }}
      aria-label={`Open ${session.subject} session details`}
      onClick={() => onOpen(session)}
    >
      <div className="sch-block-subject" style={{ color: tint.fg }}>{session.subject}</div>
      <div className="sch-block-meta"><i className="fa-regular fa-clock" />{timeLabel}</div>
      {secondary && <div className="sch-block-meta"><i className="fa-regular fa-user" />{secondary}</div>}
      {session.status === 'reschedule_requested' && <div className="sch-block-alert">Reschedule requested</div>}
    </button>
  );
}

function Scheduling() {
  const [students, setStudents] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [sessions, setSessions] = useState(null);
  const [studentSessions, setStudentSessions] = useState([]);
  const [error, setError] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [detailFor, setDetailFor] = useState(null);
  const [weekRevision, setWeekRevision] = useState(0);
  const [selectedDateIso, setSelectedDateIso] = useState(() => DateTime.now().toISODate());
  const [view, setView] = useState('day');
  const [scrollEdges, setScrollEdges] = useState({ left: false, right: false });
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const resourceScrollRef = useRef(null);

  const selectedDate = DateTime.fromISO(selectedDateIso).startOf('day');
  const { start: weekStart } = weekOf(selectedDate);
  const weekStartIso = weekStart.toISODate();
  const weekDays = Array.from({ length: 7 }, (_, index) => weekStart.plus({ days: index }));
  const now = DateTime.now();

  useEffect(() => {
    studentService.getAllStudents().then(setStudents).catch(() => {});
    instructorService.getAllInstructors().then(setInstructors).catch(() => {});
    roomService.getAllRooms().then(setRooms).catch(() => {});
  }, []);

  useEffect(() => {
    let current = true;
    const rangeStart = DateTime.fromISO(weekStartIso).startOf('day');
    const rangeEnd = rangeStart.plus({ days: 7 });
    setSessions(null);
    setError('');
    classService.getSchedule(rangeStart.toUTC().toISO(), rangeEnd.toUTC().toISO())
      .then((result) => { if (current) setSessions(result.sessions); })
      .catch((err) => {
        if (current) setError(err.response?.data?.message || 'Failed to load the academy schedule');
      });
    return () => { current = false; };
  }, [weekStartIso, weekRevision]);

  useEffect(() => {
    const onClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const people = useMemo(() => [
    ...students.map((student) => ({
      type: 'student', id: student.student_id ?? student.user_id, name: student.name, sub: 'Student'
    })),
    ...instructors.map((instructor) => ({
      type: 'instructor', id: instructor.instructor_id ?? instructor.id, name: instructor.name, sub: 'Instructor'
    })),
  ], [students, instructors]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const normalizedQuery = query.toLowerCase();
    return people
      .filter((person) => String(person.name ?? '').toLowerCase().includes(normalizedQuery))
      .slice(0, 8);
  }, [query, people]);

  const selectPerson = (person) => {
    setSelected(person);
    setQuery('');
    setSearchOpen(false);
    setStudentSessions([]);
    if (person?.type === 'student') {
      studentViewService.getSchedule(person.id)
        .then((result) => setStudentSessions(result.sessions))
        .catch(() => {});
    }
  };

  const visibleSessions = (sessions ?? []).filter((session) => {
    if (!selected) return true;
    if (selected.type === 'instructor') {
      return String(session.instructor_id) === String(selected.id);
    }
    return (session.student_ids ?? []).some((id) => String(id) === String(selected.id));
  });
  const sessionsByDay = weekDays.map((day) =>
    visibleSessions.filter((session) => DateTime.fromISO(session.starts_at).hasSame(day, 'day')));
  const daySessions = visibleSessions.filter((session) =>
    DateTime.fromISO(session.starts_at).hasSame(selectedDate, 'day'));
  const displayedSessions = selected ? visibleSessions : daySessions;
  const displayCount = displayedSessions.length;
  const dayScopeLabel = selectedDate.hasSame(now, 'day')
    ? 'today'
    : `on ${selectedDate.toFormat('EEEE')}`;
  const scheduleScopeLabel = selected ? 'this week' : dayScopeLabel;
  const countLabel = `${displayCount} session${displayCount === 1 ? '' : 's'} ${scheduleScopeLabel}`;
  const firstGridStart = displayedSessions.length
    ? Math.min(...displayedSessions.map((session) => DateTime.fromISO(session.starts_at).hour))
    : GRID_START_HOUR;
  const lastGridEnd = displayedSessions.length
    ? Math.max(...displayedSessions.map((session) => Math.ceil(
      DateTime.fromISO(session.ends_at).hour + DateTime.fromISO(session.ends_at).minute / 60)))
    : GRID_END_HOUR;
  const dayGridStartHour = Math.max(GRID_START_HOUR, firstGridStart - 1);
  const dayGridEndHour = Math.min(GRID_END_HOUR, Math.max(lastGridEnd + 1, dayGridStartHour + 4));
  const dayGridHours = dayGridEndHour - dayGridStartHour;

  const roomResources = rooms
    .filter((room) => room.is_active !== false)
    .map((room) => ({ id: room.room_id, label: room.name, detail: `Seats ${room.capacity}`, type: 'room' }));
  if (daySessions.some((session) => session.room_id == null)) {
    roomResources.push({ id: null, label: 'Unassigned', detail: 'Room needed', type: 'room' });
  }
  const resourceColumnWidth = 180;

  const matchesRoom = (session, room) => room.id == null
    ? session.room_id == null
    : String(session.room_id) === String(room.id);

  const weekEnd = weekStart.plus({ days: 6 });
  const weekTitle = weekStart.month === weekEnd.month
    ? `${weekStart.toFormat('LLL d')}–${weekEnd.toFormat('d, yyyy')}`
    : `${weekStart.toFormat('LLL d')}–${weekEnd.toFormat('LLL d, yyyy')}`;
  const title = selected ? weekTitle : selectedDate.toFormat('ccc, LLL d, yyyy');
  const selectedTint = selected ? tintFor(selected.name) : null;
  const calendarResources = selected
    ? weekDays.map((day, index) => ({
      id: day.toISODate(),
      label: day.toFormat('cccc'),
      detail: `${day.toFormat('LLL d')} · ${sessionsByDay[index].length} session${sessionsByDay[index].length === 1 ? '' : 's'}`,
      day,
      type: 'day',
    }))
    : roomResources;
  const resourceColumnMinWidth = selected ? 140 : resourceColumnWidth;
  const agendaDays = selected
    ? weekDays.filter((day, index) => sessionsByDay[index].length > 0)
    : [selectedDate];

  const clearPersonFilter = () => {
    selectPerson(null);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  useEffect(() => {
    const scroller = resourceScrollRef.current;
    if (!scroller || view !== 'day') return undefined;

    const updateEdges = () => {
      const left = scroller.scrollLeft > 1;
      const right = scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 1;
      setScrollEdges((current) => current.left === left && current.right === right
        ? current
        : { left, right });
    };

    updateEdges();
    scroller.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateEdges);
    observer?.observe(scroller);
    if (scroller.firstElementChild) observer?.observe(scroller.firstElementChild);

    return () => {
      scroller.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
      observer?.disconnect();
    };
  }, [view, sessions, calendarResources.length, selectedDateIso, selected?.id]);

  return (
    <div className={`hm-page sch-page ${view === 'day' ? 'sch-page-day' : ''}`}>
      <div className="sch-topbar">
        <div className="sch-heading">
          <h1>{title}</h1>
          {!selected && sessions !== null && !error && (
            <span>Academy · {countLabel}</span>
          )}
        </div>

        <div className="sch-view-toggle" aria-label="Calendar view">
          {['day', 'agenda'].map((option) => (
            <button key={option} type="button" className={view === option ? 'active' : ''}
              aria-pressed={view === option} onClick={() => setView(option)}>
              {selected && option === 'day' ? 'Week' : option[0].toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        <div className="sch-search-actions">
          {selected?.type === 'student' && (
            <button type="button" className="hm-btn primary sch-add-subject" onClick={() => setWizardOpen(true)}>
              <i className="fa-solid fa-plus" /> Add subject
            </button>
          )}
          <div className={`sch-search ${selected ? 'has-filter' : ''}`} ref={searchRef}>
            <div className="sch-search-box">
              <i className="fa-solid fa-magnifying-glass" />
              {selected ? (
                <div className="sch-active-filter">
                  <span
                    className="sch-active-filter-avatar"
                    style={{ background: selectedTint.bg, color: selectedTint.fg }}
                  >
                    {initials(selected.name)}
                  </span>
                  <span className="sch-active-filter-copy">
                    <strong>{selected.name}</strong>
                    <small>{selected.sub} · {countLabel}</small>
                  </span>
                  <button
                    type="button"
                    className="sch-active-filter-clear"
                    aria-label={`Clear ${selected.name} filter`}
                    title="Clear filter"
                    onClick={clearPersonFilter}
                  >
                    <i className="fa-solid fa-xmark" />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    ref={searchInputRef}
                    type="text"
                    aria-label="Filter by student or instructor"
                    placeholder="Filter by student or instructor…"
                    value={query}
                    onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
                    onFocus={() => setSearchOpen(true)}
                  />
                  {query && (
                    <button type="button" className="sch-clear" onClick={() => setQuery('')} aria-label="Clear search">
                      <i className="fa-solid fa-circle-xmark" />
                    </button>
                  )}
                </>
              )}
            </div>
            {searchOpen && query && !selected && (
              <div className="sch-popover">
                {results.map((person) => {
                  const tint = tintFor(person.name);
                  return (
                    <button key={`${person.type}-${person.id}`} type="button" className="sch-result" onClick={() => selectPerson(person)}>
                      <span className="sch-avatar" style={{ background: tint.bg, color: tint.fg }}>{initials(person.name)}</span>
                      <span className="sch-result-text">
                        <span className="sch-result-name">{person.name}</span>
                        <span className="sch-result-sub">{person.sub}</span>
                      </span>
                    </button>
                  );
                })}
                {results.length === 0 && <div className="sch-no-results">No one matches “{query}”</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {!selected && (
        <div className="sch-week-strip" aria-label="Week dates">
          {weekDays.map((day, index) => {
            const active = day.hasSame(selectedDate, 'day');
            const today = day.hasSame(now, 'day');
            const dayCount = sessionsByDay[index].length;
            return (
              <button key={day.toISODate()} type="button" className={`${active ? 'active' : ''} ${today ? 'today' : ''}`}
                aria-pressed={active} onClick={() => setSelectedDateIso(day.toISODate())}>
                <span className="sch-week-dow">{day.toFormat('ccc')}</span>
                <span className="sch-week-date">{day.toFormat('d')}</span>
                <span className="sch-week-count">{dayCount} session{dayCount === 1 ? '' : 's'}</span>
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="hm-empty sch-state sch-state-error">
          <i className="fa-solid fa-triangle-exclamation" />
          <div className="sch-state-title">Couldn’t load the schedule</div>
          <div className="sch-state-sub">{error}</div>
        </div>
      )}

      {!error && sessions === null && <div className="hm-loading">Loading academy schedule…</div>}

      {!error && sessions !== null && displayCount === 0 && (
        <div className="hm-empty sch-state">
          <i className="fa-regular fa-calendar" />
          <div className="sch-state-title">Nothing scheduled {scheduleScopeLabel}</div>
          <div className="sch-state-sub">
            {selected ? `No sessions for ${selected.name} in this view.` : 'The academy has no sessions in this view.'}
          </div>
        </div>
      )}

      {!error && sessions !== null && displayCount > 0 && view === 'day' && (
        <section className={`hm-card sch-resource-cal ${selected ? 'sch-person-week' : ''} ${scrollEdges.left ? 'can-scroll-left' : ''} ${scrollEdges.right ? 'can-scroll-right' : ''}`}>
          <div className="sch-resource-scroll" ref={resourceScrollRef}>
            <div className="sch-resource-grid" style={{ minWidth: 60 + calendarResources.length * resourceColumnMinWidth }}>
              <div className="sch-resource-head" style={{ gridTemplateColumns: `60px repeat(${calendarResources.length}, minmax(${resourceColumnMinWidth}px, 1fr))` }}>
                <div className="sch-resource-corner"><i className="fa-regular fa-clock" /></div>
                {calendarResources.map((resource) => (
                  <div
                    key={`${resource.type}-${resource.id ?? 'none'}`}
                    className={`sch-resource-label ${resource.day?.hasSame(now, 'day') ? 'today' : ''}`}
                  >
                    <strong>{resource.label}</strong>
                    <span>{resource.detail}</span>
                  </div>
                ))}
              </div>
              <div
                className="sch-resource-body"
                style={{
                  '--sch-hour-height': `max(${HOUR_PX}px, calc((100dvh - ${selected ? 250 : 322}px) / ${dayGridHours}))`,
                  height: `calc(${dayGridHours} * var(--sch-hour-height))`,
                  gridTemplateColumns: `60px repeat(${calendarResources.length}, minmax(${resourceColumnMinWidth}px, 1fr))`,
                }}
              >
                <div className="sch-cal-gutter sch-cal-hours">
                  {Array.from({ length: dayGridHours + 1 }, (_, index) => (
                    <span key={index} className="sch-hour-label" style={{ top: `calc(${index} * var(--sch-hour-height))` }}>
                      {DateTime.fromObject({ hour: (dayGridStartHour + index) % 24 }).toFormat('h a')}
                    </span>
                  ))}
                </div>
                {calendarResources.map((resource) => {
                  const resourceSessions = selected
                    ? visibleSessions.filter((session) => DateTime.fromISO(session.starts_at).hasSame(resource.day, 'day'))
                    : daySessions.filter((session) => matchesRoom(session, resource));
                  return (
                    <div key={`${resource.type}-${resource.id ?? 'none'}`} className="sch-resource-col">
                      {layoutOverlaps(resourceSessions).map((entry) => (
                        <CalendarEvent
                          key={entry.session.session_id}
                          entry={entry}
                          gridStartHour={dayGridStartHour}
                          onOpen={setDetailFor}
                          secondary={selected
                            ? [selected.type === 'student' ? entry.session.instructor : null, entry.session.room || 'Unassigned room']
                              .filter(Boolean).join(' · ')
                            : entry.session.instructor}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {!error && sessions !== null && displayCount > 0 && view === 'agenda' && (
        <section className="sch-agenda">
          {agendaDays.map((day) => {
            const agendaSessions = visibleSessions.filter((session) =>
              DateTime.fromISO(session.starts_at).hasSame(day, 'day'));
            return (
              <div key={day.toISODate()} className={`sch-agenda-day ${day.hasSame(now, 'day') ? 'today' : ''}`}>
                {selected && (
                  <div className="sch-agenda-day-head">
                    <div>
                      <strong>{day.toFormat('EEEE')}</strong>
                      <span>{day.toFormat('LLLL d')}</span>
                      {day.hasSame(now, 'day') && <em>Today</em>}
                    </div>
                    <span className="sch-agenda-count">{agendaSessions.length} session{agendaSessions.length === 1 ? '' : 's'}</span>
                  </div>
                )}
                {agendaSessions.map((session) => {
                  const start = DateTime.fromISO(session.starts_at);
                  const end = DateTime.fromISO(session.ends_at);
                  const tint = tintFor(session.subject);
                  return (
                    <Link key={session.session_id} to={`/operations/classes/${session.class_id}`} className="sch-agenda-row">
                      <span className="sch-agenda-time">{start.toFormat('h:mm a')}<small>{end.toFormat('h:mm a')}</small></span>
                      <span className="sch-agenda-mark" style={{ background: tint.fg }} />
                      <span className="sch-agenda-main"><strong>{session.subject}</strong></span>
                      <span className="sch-agenda-instructor"><i className="fa-regular fa-user" />{session.instructor}</span>
                      <span className="sch-agenda-room"><i className="fa-solid fa-location-dot" />{session.room || 'Unassigned room'}</span>
                      {session.status !== 'scheduled' && <span className="sch-agenda-status">{session.status.replace(/_/g, ' ')}</span>}
                      <i className="fa-solid fa-chevron-right sch-agenda-arrow" />
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </section>
      )}

      {selected?.type === 'student' && (
        <AddSubjectModal
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          student={{ student_id: selected.id, name: selected.name }}
          studentSessions={studentSessions}
          onDone={() => {
            setWeekRevision((revision) => revision + 1);
            studentViewService.getSchedule(selected.id)
              .then((result) => setStudentSessions(result.sessions))
              .catch(() => {});
          }}
        />
      )}

      <Modal isOpen={!!detailFor} onClose={() => setDetailFor(null)}>
        {detailFor && (() => {
          const start = DateTime.fromISO(detailFor.starts_at);
          const end = DateTime.fromISO(detailFor.ends_at);
          const tint = tintFor(detailFor.subject);
          const statusLabel = detailFor.status.replace(/_/g, ' ');
          const classTypeLabel = detailFor.class_type === 'one_on_one' ? 'Private session' : 'Group class';
          const studentCount = detailFor.student_ids?.length ?? 0;
          return (
            <div className="sch-session-modal">
              <div className="sch-session-modal-head">
                <span className="sch-session-modal-icon" style={{ background: tint.bg, color: tint.fg }}>
                  <i className="fa-solid fa-calendar-day" />
                </span>
                <div>
                  <h2>{detailFor.subject}</h2>
                  <div className="sch-session-modal-subline">
                    <span>{classTypeLabel}</span>
                    <span className={`sch-session-status status-${detailFor.status}`}>{statusLabel}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="sch-session-modal-close"
                  aria-label="Close session details"
                  onClick={() => setDetailFor(null)}
                >
                  <i className="fa-solid fa-xmark" />
                </button>
              </div>

              <div className="sch-session-details">
                <div className="sch-session-when">
                  <i className="fa-regular fa-clock" />
                  <span>
                    <small>{start.toFormat('cccc, LLLL d')}</small>
                    <strong>{start.toFormat('h:mm')}–{end.toFormat('h:mm a')}</strong>
                  </span>
                </div>
                <div className="sch-session-meta">
                  <span><i className="fa-regular fa-user" /><small>Instructor</small><strong>{detailFor.instructor}</strong></span>
                  <span><i className="fa-solid fa-location-dot" /><small>Room</small><strong>{detailFor.room || 'Unassigned room'}</strong></span>
                  <span><i className="fa-solid fa-users" /><small>Enrollment</small><strong>{studentCount} student{studentCount === 1 ? '' : 's'}</strong></span>
                </div>
              </div>

              <div className="sch-session-modal-actions">
                <button type="button" className="hm-btn" onClick={() => setDetailFor(null)}>Close</button>
                <Link
                  to={`/operations/classes/${detailFor.class_id}`}
                  className="hm-btn primary"
                  onClick={() => setDetailFor(null)}
                >
                  View class <i className="fa-solid fa-arrow-right" />
                </Link>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}

export default Scheduling;
