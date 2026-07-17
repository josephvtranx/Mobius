// "The Window" (spec 07): one knob, reschedule_window_hours, evaluated against
// a session's CURRENT scheduled start. Inside the window a student cancellation
// is cancelled_late (credit lost); outside it costs nothing. Staff are never
// bound by it.
import { DateTime } from 'luxon';

export function insideWindow(startsAt, settings, now = DateTime.utc().toISO()) {
  const start = typeof startsAt === 'string'
    ? DateTime.fromISO(startsAt)
    : DateTime.fromJSDate(startsAt);
  return DateTime.fromISO(now) >= start.minus({ hours: settings.reschedule_window_hours });
}
