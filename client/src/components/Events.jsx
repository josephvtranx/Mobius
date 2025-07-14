import React, { useState, useEffect } from 'react';
import classSessionService from '../services/classSessionService';
import { formatLocalTime, isoToLocal } from '../lib/time.js';
import '../css/Scheduling.css';

const Events = ({ calendarRange }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await classSessionService.getAllSessions();
        
        // Filter events based on calendar range if provided
        let filteredEvents = response;
        if (calendarRange && calendarRange.start && calendarRange.end) {
          filteredEvents = response.filter(event => {
            const eventStart = isoToLocal(event.session_start).toJSDate();
            return eventStart >= calendarRange.start && eventStart <= calendarRange.end;
          });
        }
        
        setEvents(filteredEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [calendarRange]);

  if (loading) return <div className="events-loading">Loading events...</div>;
  if (error) return <div className="events-error">{error}</div>;

  return (
    <div className="events-section">
      <h3>Upcoming Events</h3>
      {events.length === 0 ? (
        <p className="events-empty">No events scheduled</p>
      ) : (
      <ul className="events-list">
          {events.map((event) => (
            <li key={event.session_id} className="event-item">
              <div className="event-header">
                <span className="event-date">
                  {isoToLocal(event.session_start).toJSDate().toLocaleDateString()}
                </span>
                <span className="event-time">
                  {formatLocalTime(event.session_start)}
                </span>
              </div>
              <div className="event-title">{event.subject_name}</div>
              <div className="event-location">
                {event.student?.name || 'Unknown'} with {event.instructor?.name || 'Unknown'}
              </div>
        </li>
          ))}
      </ul>
      )}
    </div>
  );
};

export default Events; 