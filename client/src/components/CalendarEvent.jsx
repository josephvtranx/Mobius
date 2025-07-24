import React from 'react';

export default function CalendarEvent({ event, ...rest }) {
  // Debug log
  console.debug('[CalendarEvent] event:', event, 'rest:', rest);

  return (
    <>
      {/* 🏷️  event block label */}
      <span className="event-title">{event.title}</span>
    </>
  );
} 