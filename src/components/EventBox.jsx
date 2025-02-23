import React from 'react';
import '../css/EventBox.css';

const events = [
  { title: 'SAT Math: Min', type: 'math' },
  { title: 'SAT Math: YJ', type: 'math' },
  { title: 'Consultation', type: 'consultation' },
  { title: 'Meetings', type: 'meetings' },
  { title: 'Exams', type: 'exams' },
];

function EventBox() {
  const handleDragStart = (event, eventData) => {
    event.dataTransfer.setData('eventData', JSON.stringify(eventData));
  };

  return (
    <div className="events-section">
      <h3>Events</h3>
        {events.map((event, index) => (
          <li key={index} className={`event-button`} draggable onDragStart={(e) => handleDragStart(e, event)}>
            <button className={`event-button ${event.type}`}>
              <h4>{event.title}</h4>
            </button>
          </li>
        ))}
    </div>
  );
}

export default EventBox; 