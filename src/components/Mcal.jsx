import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventBox from './EventBox';

const initialEvents = [
];

const localizer = momentLocalizer(moment);

function Mcal() {
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // console.log('Key pressed:', event.key);
      if (event.key === 'Backspace' && selectedEvent) {
        deleteEvent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedEvent]);

  const addEvent = (event) => {
    const newEvent = {
      id: uuidv4(),
      title: event.title,
      start: new Date(),
      end: new Date(),
    };
    setEvents([...events, newEvent]);
  };

  const handleDrop = (event) => {
    const eventData = JSON.parse(event.dataTransfer.getData('eventData'));
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + 1);
    const newEvent = {
      id: uuidv4(),
      title: eventData.title,
      start: startDate,
      end: endDate,
    };
    setEvents([...events, newEvent]);
  };

  const deleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(e => e.id !== selectedEvent.id));
      setSelectedEvent(null);
    }
  };

  return (
    <div className="calendar-page">
      <EventBox addEvent={addEvent} />
      <div className="calendar-widget" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={event => setSelectedEvent(event)}
        />
      </div>
    </div>
  );
}

export default Mcal;
