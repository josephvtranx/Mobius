import React from 'react';

function Events() {
  return (
    <div className="events-section">
      <h3>Events</h3>
      <ul className="events-list">
        <li className="event-item">
          <span className="event-time">10:00 AM</span>
          <h4 className="event-title">Team Meeting</h4>
        </li>
        <li className="event-item">
          <span className="event-time">11:30 AM</span>
          <h4 className="event-title">Client Presentation</h4>
        </li>
        <li className="event-item">
          <span className="event-time">12:30 AM</span>
          <h4 className="event-title">Diddy time</h4>
        </li>
      </ul>
    </div>
  );
}

export default Events; 