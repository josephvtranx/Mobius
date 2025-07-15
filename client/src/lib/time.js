import { DateTime } from "luxon";

export function toUtcIso(input) {
  return (input instanceof Date
          ? DateTime.fromJSDate(input, { zone: "local" })
          : DateTime.fromISO(input,    { zone: "local" }))
        .toUTC()
        .toISO();              // ends with 'Z'
}

export function isoToLocal(isoUtc) {
  return DateTime.fromISO(isoUtc, { zone: "utc" })
                 .setZone(DateTime.local().zoneName);   // Luxon DT
}

// Convert UTC ISO string to local JavaScript Date object
export function isoToLocalDate(isoUtc) {
  return isoToLocal(isoUtc).toJSDate();
}

// Format a UTC ISO string for display in local time zone
export function formatLocalTime(isoString, format = 'HH:mm') {
  const dt = isoToLocal(isoString);
  if (format === 'HH:mm') return dt.toFormat('HH:mm');
  if (format === 'yyyy-MM-dd') return dt.toFormat('yyyy-MM-dd');
  // Add more formats as needed
  return dt.toLocaleString(DateTime.DATETIME_MED);
}

// Create session start/end UTC ISO timestamps from local date, time, and duration
export function createSessionTimestamps(date, startTime, durationMinutes) {
  // date: 'YYYY-MM-DD', startTime: 'HH:mm'
  const start = DateTime.fromISO(`${date}T${startTime}`, { zone: 'local' });
  const end = start.plus({ minutes: durationMinutes });
  return {
    session_start: start.toUTC().toISO(),
    session_end: end.toUTC().toISO(),
  };
}

// Convert session data from backend (UTC) to local time for calendar display
export function convertSessionToLocalTime(session) {
  if (!session.session_start || !session.session_end) {
    return session;
  }
  
  return {
    ...session,
    session_start: isoToLocalDate(session.session_start),
    session_end: isoToLocalDate(session.session_end)
  };
}

// Convert multiple sessions to local time
export function convertSessionsToLocalTime(sessions) {
  return sessions.map(session => convertSessionToLocalTime(session));
} 