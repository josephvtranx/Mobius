// Session materialization from a class's recurrence (spec 01 §1, 03).
// recurrence_rule shape: { timezone: 'America/Los_Angeles',
//                          byday: [{ day: 'mon', start: '17:00', end: '18:30' }, …] }
// Times are the academy's wall-clock; luxon converts each occurrence to UTC,
// so DST transitions keep the local hour (a Mon 5pm class stays 5pm local).
import { DateTime } from 'luxon';

const DAY_NUM = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 }; // ISO weekday

export class RecurrenceError extends Error {}

// Returns [{ startsAt, endsAt }] as UTC ISO-Z strings, sorted ascending.
// Fixed-end classes (endsOn set) materialize fully; open-ended ones materialize
// horizonWeeks ahead (knob session_generation_horizon_weeks).
export function materializeOccurrences({ recurrence, recurrenceRule, startsOn, endsOn, horizonWeeks }) {
  if (recurrence === 'none') return []; // one-off: the single session is supplied explicitly
  if (recurrence === 'custom') {
    throw new RecurrenceError('custom recurrence is not supported yet (RRULE payload — planned)');
  }
  const tz = recurrenceRule?.timezone;
  const byday = recurrenceRule?.byday;
  if (!tz || !Array.isArray(byday) || byday.length === 0) {
    throw new RecurrenceError('recurrence_rule requires { timezone, byday: [{day, start, end}] }');
  }
  // a duplicated slot would materialize twice and trip the calendar unique
  // index, surfacing as a bogus "instructor already booked" 409
  const seen = new Set();
  for (const slot of byday) {
    const key = `${slot.day}|${slot.start}`;
    if (seen.has(key)) throw new RecurrenceError(`duplicate byday slot: ${slot.day} ${slot.start}`);
    seen.add(key);
  }

  const stepWeeks = recurrence === 'biweekly' ? 2 : 1;
  const windowStart = DateTime.fromISO(startsOn, { zone: tz }).startOf('day');
  if (!windowStart.isValid) throw new RecurrenceError(`invalid starts_on: ${startsOn}`);
  const windowEnd = endsOn
    ? DateTime.fromISO(endsOn, { zone: tz }).endOf('day')
    : windowStart.plus({ weeks: horizonWeeks }).endOf('day');
  if (!windowEnd.isValid || windowEnd < windowStart) {
    throw new RecurrenceError('ends_on must be on or after starts_on');
  }

  const out = [];
  for (let week = windowStart.startOf('week'); week <= windowEnd; week = week.plus({ weeks: stepWeeks })) {
    for (const slot of byday) {
      const dayNum = DAY_NUM[slot.day];
      if (!dayNum) throw new RecurrenceError(`invalid byday day: ${slot.day}`);
      const [sh, sm] = String(slot.start).split(':').map(Number);
      const [eh, em] = String(slot.end).split(':').map(Number);
      if ([sh, sm, eh, em].some(Number.isNaN)) {
        throw new RecurrenceError(`invalid time in byday slot: ${JSON.stringify(slot)}`);
      }
      const day = week.plus({ days: dayNum - 1 });
      const starts = day.set({ hour: sh, minute: sm, second: 0, millisecond: 0 });
      const ends = day.set({ hour: eh, minute: em, second: 0, millisecond: 0 });
      if (ends <= starts) throw new RecurrenceError('byday slot end must be after start');
      if (starts < windowStart || starts > windowEnd) continue;
      out.push({ startsAt: starts.toUTC().toISO(), endsAt: ends.toUTC().toISO() });
    }
  }
  out.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return out;
}
