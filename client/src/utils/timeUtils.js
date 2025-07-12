// Timezone utility functions for handling TIMESTAMPTZ operations

/**
 * Convert a local date and time to UTC ISO string
 * @param {Date} date - The date object
 * @param {string} time - Time string in HH:mm format
 * @returns {string} UTC ISO string
 */
export const localToUTC = (date, time) => {
  const [hours, minutes] = time.split(':').map(Number);
  const localDateTime = new Date(date);
  localDateTime.setHours(hours, minutes, 0, 0);
  return localDateTime.toISOString();
};

/**
 * Convert UTC ISO string to local date and time
 * @param {string} utcString - UTC ISO string
 * @returns {object} Object with date and time in local timezone
 */
export const utcToLocal = (utcString) => {
  const date = new Date(utcString);
  return {
    date: date.toISOString().split('T')[0],
    time: date.toTimeString().slice(0, 5),
    fullDate: date
  };
};

/**
 * Create session start and end timestamps from local date and time
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {string} startTime - Start time in HH:mm format
 * @param {number} durationMinutes - Duration in minutes
 * @returns {object} Object with session_start and session_end in UTC
 */
export const createSessionTimestamps = (date, startTime, durationMinutes) => {
  // Parse the date string and create a local date object
  const [year, month, day] = date.split('-').map(Number);
  const [startHour, startMinute] = startTime.split(':').map(Number);
  
  // Create session start timestamp in local time
  const sessionStart = new Date(year, month - 1, day, startHour, startMinute, 0, 0);
  
  // Create session end timestamp in local time
  const sessionEnd = new Date(sessionStart);
  sessionEnd.setMinutes(sessionEnd.getMinutes() + durationMinutes);
  
  // The key issue: when we create a Date with local time, JavaScript treats it as UTC
  // We need to adjust for the timezone offset to get the correct UTC time
  const timezoneOffset = sessionStart.getTimezoneOffset() * 60000; // Convert to milliseconds
  
  // Create UTC timestamps by adding the timezone offset
  const utcStart = new Date(sessionStart.getTime() + timezoneOffset);
  const utcEnd = new Date(sessionEnd.getTime() + timezoneOffset);
  
  console.log('createSessionTimestamps debug:', {
    input: { date, startTime, durationMinutes },
    localStart: sessionStart,
    localEnd: sessionEnd,
    utcStart: utcStart.toISOString(),
    utcEnd: utcEnd.toISOString(),
    timezoneOffset: sessionStart.getTimezoneOffset(),
    timezoneOffsetMs: timezoneOffset
  });
  
  return {
    session_start: utcStart.toISOString(),
    session_end: utcEnd.toISOString()
  };
};

/**
 * Format a UTC timestamp for display in local timezone
 * @param {string} utcString - UTC ISO string
 * @param {string} format - Format string (default: 'HH:mm')
 * @returns {string} Formatted time string
 */
export const formatLocalTime = (utcString, format = 'HH:mm') => {
  const date = new Date(utcString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  if (format === 'HH:mm') {
    return `${hours}:${minutes}`;
  }
  
  return date.toLocaleTimeString();
};

/**
 * Get the current user's timezone offset in minutes
 * @returns {number} Timezone offset in minutes
 */
export const getTimezoneOffset = () => {
  return new Date().getTimezoneOffset();
};

/**
 * Convert a local datetime to UTC for API calls
 * @param {Date} localDate - Local date object
 * @returns {string} UTC ISO string
 */
export const toUTC = (localDate) => {
  return localDate.toISOString();
};

/**
 * Convert UTC string from API to local datetime
 * @param {string} utcString - UTC ISO string from API
 * @returns {Date} Local date object
 */
export const fromUTC = (utcString) => {
  return new Date(utcString);
}; 