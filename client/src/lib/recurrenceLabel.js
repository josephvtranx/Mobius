// "Tue & Thu · 4:00 PM – 5:00 PM" from a class's recurrence rule; one-off
// classes (bookings) show their date instead. Rule times are wall times in
// the class's own timezone — displayed as stored, like the design handoff.
import { DateTime } from 'luxon';

const DAY_LABEL = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };
const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const clock = (hhmm) => DateTime.fromFormat(hhmm, 'HH:mm').toFormat('h:mm a');

export function scheduleLabel(c) {
  const byday = c.recurrence_rule?.byday;
  if (Array.isArray(byday) && byday.length) {
    const days = [...byday].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
    const prefix = c.recurrence === 'biweekly' ? 'Biweekly · ' : '';
    const sameTime = days.every((d) => d.start === days[0].start && d.end === days[0].end);
    if (sameTime) {
      return `${prefix}${days.map((d) => DAY_LABEL[d.day] ?? d.day).join(' & ')} · ${clock(days[0].start)} – ${clock(days[0].end)}`;
    }
    return prefix + days.map((d) => `${DAY_LABEL[d.day] ?? d.day} ${clock(d.start)}`).join(', ');
  }
  if (c.starts_on) return `One-off · ${DateTime.fromISO(c.starts_on).toFormat('ccc, LLL d')}`;
  return 'Unscheduled';
}
