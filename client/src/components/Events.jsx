import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import eventService from '../services/eventService';
import { format } from 'date-fns';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          setError('No user found');
          return;
        }

        // Get upcoming events for the next 7 days
        const userEvents = await eventService.getUpcomingEvents(
          currentUser.user_id, 
          currentUser.role
        );

        // Sort events by date and time
        const sortedEvents = userEvents
          .filter(event => event.status === 'scheduled' || event.status === 'in_progress')
          .sort((a, b) => new Date(a.start) - new Date(b.start))
          .slice(0, 10); // Limit to 10 events for display

        setEvents(sortedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatEventTime = (startTime) => {
    try {
      const [hours, minutes] = startTime.split(':');
      const date = new Date();
      date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return format(date, 'h:mm a');
    } catch (error) {
      return startTime;
    }
  };

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d');
    } catch (error) {
      return dateString;
    }
  };

  const getEventTitle = (event) => {
    const currentUser = authService.getCurrentUser();
    
    switch (currentUser?.role) {
      case 'student':
        return `${event.title} with ${event.instructorName || 'Instructor'}`;
      case 'instructor':
        return `${event.title} - ${event.studentName || 'Student'}`;
      case 'staff':
        return `${event.title} - ${event.instructorName || 'Instructor'} & ${event.studentName || 'Student'}`;
      default:
        return event.title;
    }
  };

  if (loading) {
    return (
      <div className="events-section">
        <h3>Events</h3>
        <div className="events-loading">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="events-section">
        <h3>Events</h3>
        <div className="events-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="events-section">
      <h3>Events</h3>
      {events.length === 0 ? (
        <div className="events-empty">
          <p>No upcoming events</p>
        </div>
      ) : (
        <ul className="events-list">
          {events.map((event) => (
            <li key={event.id} className="event-item">
              <div className="event-header">
                <span className="event-date">{formatEventDate(event.date)}</span>
                <span className="event-time">{formatEventTime(event.startTime)}</span>
              </div>
              <h4 className="event-title">{getEventTitle(event)}</h4>
              {event.location && (
                <p className="event-location">{event.location}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Events; 