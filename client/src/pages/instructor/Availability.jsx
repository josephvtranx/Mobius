// Instructor availability editor (design handoff README > Instructor app >
// Availability): weekly grid, cells cycle Unavailable -> Available; blocks
// where the instructor already teaches are locked.
//
// Real v2 endpoints (server/src/routes/instructorRoutes.js): instructor_
// availability rows are day_of_week + start_time/end_time RANGES, not
// per-hour cells. Toggles write at 1-hour granularity; toggling OFF an
// hour inside a wider row splits the row instead of deleting it wholesale
// (shrink to the left part via PUT, re-add the right part via POST) so a
// legacy 9–5 block survives clearing one lunch hour.
//
// "Already teaching" locks come from the instructor's own upcoming
// sessions (instructorCalendarService.getMySessions) rather than a
// dedicated "my classes" listing, which doesn't exist yet — this only
// reflects sessions within that query's window, not the full recurring
// pattern, so it's a best-effort lock, not exhaustive.
//
// The Time off section below the grid manages instructor_unavailability
// (one-off datetime blocks subtracted from the open-slots calendar,
// slotFinder.busyIntervals) — list + add + remove.
import { Fragment, useEffect, useMemo, useState } from 'react';
import authService from '@/services/authService';
import instructorService from '@/services/instructorService';
import instructorCalendarService from '@/services/instructorCalendarService';
import { isoToLocal, toUtcIso } from 'mobius-lms';
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
  const [timeOff, setTimeOff] = useState([]);      // instructor_unavailability rows
  const [toForm, setToForm] = useState({ start: '', end: '', reason: '' });
  const [toBusy, setToBusy] = useState(false);

  const load = () => {
    Promise.all([
      instructorService.getInstructorAvailability(instructorId),
      instructorCalendarService.getMySessions(14),
      instructorService.getUnavailability(instructorId),
    ])
      .then(([availRows, sessions, unavailRows]) => {
        setRows(availRows);
        setTimeOff(unavailRows);
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
        // Clearing an hour inside a wider row splits it rather than deleting
        // the whole range (times from the DB are HH:MM:SS — normalize).
        const hhmm = (t) => String(t).slice(0, 5);
        const leftEnd = `${pad(hour)}:00`;
        const rightStart = `${pad(hour + 1)}:00`;
        const hasLeft = hhmm(existing.start_time) < leftEnd;
        const hasRight = hhmm(existing.end_time) > rightStart;
        const carry = {
          day_of_week: existing.day_of_week,
          type: existing.type || 'default',
          status: 'active',
          ...(existing.start_date ? { start_date: existing.start_date } : {}),
          ...(existing.end_date ? { end_date: existing.end_date } : {}),
          ...(existing.notes ? { notes: existing.notes } : {}),
        };
        if (!hasLeft && !hasRight) {
          await instructorService.deleteAvailability(instructorId, existing.availability_id);
        } else if (hasLeft) {
          await instructorService.updateAvailability(instructorId, existing.availability_id,
            { ...carry, start_time: hhmm(existing.start_time), end_time: leftEnd });
          if (hasRight) {
            await instructorService.addAvailability(instructorId,
              { ...carry, start_time: rightStart, end_time: hhmm(existing.end_time) });
          }
        } else {
          await instructorService.updateAvailability(instructorId, existing.availability_id,
            { ...carry, start_time: rightStart, end_time: hhmm(existing.end_time) });
        }
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

      <section className="hm-card" style={{ marginTop: 24, padding: '18px 20px', maxWidth: 720 }}>
        <h2 style={{ fontSize: 16, marginBottom: 4 }}>Time off</h2>
        <p className="at-subtitle" style={{ marginBottom: 14 }}>
          Block specific dates and times (appointments, vacation). These are subtracted
          from your bookable calendar on top of the weekly grid above.
        </p>

        {timeOff.length === 0 && <div className="hm-kpi-label" style={{ marginBottom: 14 }}>No time off scheduled.</div>}
        {timeOff.map((r) => (
          <div key={r.unavail_id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--shell-line, #eee)' }}>
            <i className="fa-regular fa-calendar-minus" aria-hidden="true"></i>
            <div style={{ flex: 1 }}>
              {isoToLocal(r.start_datetime).toFormat('ccc, LLL d · h:mm a')}
              {' – '}
              {isoToLocal(r.end_datetime).toFormat('ccc, LLL d · h:mm a')}
              {r.reason && <span className="hm-kpi-label" style={{ marginLeft: 8 }}>{r.reason}</span>}
            </div>
            <button type="button" className="hm-btn" disabled={toBusy}
              onClick={async () => {
                setToBusy(true);
                setError('');
                try {
                  await instructorService.deleteUnavailability(instructorId, r.unavail_id);
                  load();
                } catch (err) {
                  setError(err.response?.data?.message || err.response?.data?.error || 'Could not remove that time off');
                } finally {
                  setToBusy(false);
                }
              }}>
              Remove
            </button>
          </div>
        ))}

        <form
          style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end', marginTop: 14 }}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!toForm.start || !toForm.end) return;
            if (toForm.end <= toForm.start) {
              setError('Time off must end after it starts');
              return;
            }
            setToBusy(true);
            setError('');
            try {
              await instructorService.addUnavailability(instructorId, {
                start_datetime: toUtcIso(toForm.start),
                end_datetime: toUtcIso(toForm.end),
                ...(toForm.reason ? { reason: toForm.reason } : {}),
              });
              setToForm({ start: '', end: '', reason: '' });
              load();
            } catch (err) {
              setError(err.response?.data?.message || err.response?.data?.error || 'Could not add that time off');
            } finally {
              setToBusy(false);
            }
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 13 }}>
            From
            <input type="datetime-local" required value={toForm.start}
              onChange={(e) => setToForm((f) => ({ ...f, start: e.target.value }))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 13 }}>
            To
            <input type="datetime-local" required value={toForm.end}
              onChange={(e) => setToForm((f) => ({ ...f, end: e.target.value }))} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', fontSize: 13, flex: 1, minWidth: 160 }}>
            Reason (optional)
            <input type="text" maxLength={200} placeholder="e.g. dentist, vacation" value={toForm.reason}
              onChange={(e) => setToForm((f) => ({ ...f, reason: e.target.value }))} />
          </label>
          <button type="submit" className="hm-btn primary" disabled={toBusy}>Add time off</button>
        </form>
      </section>
    </div>
  );
}

export default Availability;
