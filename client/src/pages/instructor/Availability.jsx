// Instructor availability editor (design handoff README > Instructor app >
// Availability): weekly grid, cells cycle Unavailable -> Available; blocks
// where the instructor already teaches are locked.
//
// Real v2 endpoints (server/src/routes/instructorRoutes.js): instructor_
// availability rows are day_of_week + start_time/end_time RANGES, not
// per-hour cells. This first pass keeps every toggle atomic at 1-hour
// granularity (one row per hour) rather than building range-merge logic —
// each cell is independently a valid availability row. Existing wider
// ranges still render correctly (a cell lights up if any row covers its
// hour); only round-tripping a toggle through a multi-hour legacy row is a
// known gap (deleting looks for an exact single-hour row match).
//
// "Already teaching" locks come from the instructor's own upcoming
// sessions (instructorCalendarService.getMySessions) rather than a
// dedicated "my classes" listing, which doesn't exist yet — this only
// reflects sessions within that query's window, not the full recurring
// pattern, so it's a best-effort lock, not exhaustive.
import { Fragment, useEffect, useMemo, useState } from 'react';
import authService from '@/services/authService';
import instructorService from '@/services/instructorService';
import instructorCalendarService from '@/services/instructorCalendarService';
import { isoToLocal } from 'mobius-lms';
import '@/css/availability.css';

const DAYS = [
  { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' }, { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' }, { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' }, { key: 'sun', label: 'Sun' },
];
const START_HOUR = 8;
const END_HOUR = 20; // exclusive
const pad = (n) => String(n).padStart(2, '0');
const hourKey = (day, hour) => `${day}_${hour}`;

function Availability() {
  const user = authService.getCurrentUser();
  const instructorId = user?.user_id;

  const [rows, setRows] = useState(null);        // raw availability rows from the server
  const [locked, setLocked] = useState(new Set()); // "day_hour" keys already booked with a real class
  const [busy, setBusy] = useState(null);          // "day_hour" currently saving
  const [error, setError] = useState('');

  const load = () => {
    Promise.all([
      instructorService.getInstructorAvailability(instructorId),
      instructorCalendarService.getMySessions(14),
    ])
      .then(([availRows, sessions]) => {
        setRows(availRows);
        const lockedSet = new Set();
        for (const s of sessions) {
          const start = isoToLocal(s.starts_at);
          const end = isoToLocal(s.ends_at);
          const day = DAYS[start.weekday - 1]?.key;
          if (!day) continue;
          for (let h = start.hour; h < end.hour; h++) lockedSet.add(hourKey(day, h));
        }
        setLocked(lockedSet);
      })
      .catch((err) => setError(err.response?.data?.message || err.response?.data?.error || 'Failed to load availability'));
  };

  useEffect(load, [instructorId]);

  // day_hour -> covering row (first match) so a toggle-off has something to delete
  const cellRow = useMemo(() => {
    const map = new Map();
    for (const r of rows ?? []) {
      if (r.status !== 'active') continue;
      const startHour = Number(r.start_time.split(':')[0]);
      const endHour = Number(r.end_time.split(':')[0]);
      for (let h = startHour; h < endHour; h++) map.set(hourKey(r.day_of_week, h), r);
    }
    return map;
  }, [rows]);

  if (error) return <div className="hm-error">{error}</div>;
  if (!rows) return <div className="hm-loading">Loading…</div>;

  const toggleCell = async (day, hour) => {
    const key = hourKey(day, hour);
    if (locked.has(key) || busy) return;
    setBusy(key);
    setError('');
    try {
      const existing = cellRow.get(key);
      if (existing) {
        await instructorService.deleteAvailability(instructorId, existing.availability_id);
      } else {
        await instructorService.addAvailability(instructorId, {
          day_of_week: day,
          start_time: `${pad(hour)}:00`,
          end_time: `${pad(hour + 1)}:00`,
          type: 'default',
          status: 'active',
        });
      }
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Could not update that slot');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="av-page">
      <h1 className="at-title">Availability</h1>
      <p className="at-subtitle">Click a cell to mark it available. Locked cells are hours you're already teaching.</p>
      {error && <div className="hm-error">{error}</div>}

      <div className="av-grid" style={{ gridTemplateColumns: `64px repeat(${DAYS.length}, 1fr)` }}>
        <div className="av-corner" />
        {DAYS.map((d) => <div key={d.key} className="av-day-head">{d.label}</div>)}

        {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i).map((hour) => (
          <Fragment key={hour}>
            <div className="av-hour-label">
              {hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? 'am' : 'pm'}
            </div>
            {DAYS.map((d) => {
              const key = hourKey(d.key, hour);
              const isLocked = locked.has(key);
              const isAvailable = cellRow.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  className={`av-cell ${isAvailable ? 'available' : ''} ${isLocked ? 'locked' : ''}`}
                  disabled={isLocked || busy === key}
                  title={isLocked ? 'Already teaching' : isAvailable ? 'Available — click to clear' : 'Unavailable — click to mark available'}
                  onClick={() => toggleCell(d.key, hour)}
                >
                  {isLocked && <i className="fa-solid fa-lock" aria-hidden="true"></i>}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default Availability;
