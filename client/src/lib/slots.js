// Discretize open availability windows into concrete pickable start times.
// The open-slots endpoint returns merged free WINDOWS ({starts_at, ends_at});
// slotFinder.js explicitly leaves discretization to the client. Before this
// helper both booking surfaces rendered one button per window, so a 4-hour
// window offered exactly one bookable start.
import { DateTime } from 'luxon';

// One start every `stepMinutes` (aligned to the viewer's wall clock), keeping
// only starts where start + duration still fits inside the window. A window
// whose start is off the step grid still offers its exact start (a 9:05–10:05
// window with a 60-min duration is bookable only at 9:05).
export function discretizeSlots(windows, durationMinutes, stepMinutes = 30) {
  const durMin = Math.max(1, Number(durationMinutes) || 60);
  const out = [];
  const seen = new Set();
  const push = (s) => {
    const key = s.toMillis();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      starts_at: s.toUTC().toISO(),
      ends_at: s.plus({ minutes: durMin }).toUTC().toISO(),
    });
  };
  for (const w of windows ?? []) {
    const wEnd = DateTime.fromISO(w.ends_at);
    let t = DateTime.fromISO(w.starts_at); // local zone — alignment is wall-clock
    const fits = (s) => s.plus({ minutes: durMin }) <= wEnd;
    const misaligned = t.minute % stepMinutes !== 0 || t.second !== 0 || t.millisecond !== 0;
    if (misaligned) {
      if (fits(t)) push(t);
      t = t.plus({ minutes: stepMinutes - (t.minute % stepMinutes) }).startOf('minute');
    }
    for (; fits(t); t = t.plus({ minutes: stepMinutes })) push(t);
  }
  return out.sort((a, b) => (a.starts_at < b.starts_at ? -1 : 1));
}
