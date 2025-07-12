import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import classSessionService from '../services/classSessionService';
import authService from '../services/authService';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../css/schedule-view-calendar.scss';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

// Custom Toolbar Component
const CustomToolbar = ({ date, onNavigate, onView, view }) => {
  console.log('CustomToolbar rendered with date:', date);
  
  const goToToday = () => {
    onNavigate('TODAY');
  };

  const goToPrevious = () => {
    onNavigate('PREV');
  };

  const goToNext = () => {
    onNavigate('NEXT');
  };

  const monthYear = format(date, 'MMMM yyyy');
  const month = format(date, 'MMMM');
  const year = format(date, 'yyyy');

  return (
    <div className="custom-toolbar">
      <div className="toolbar-left">
        <div className="month-year">
          <span className="month">{month}</span>{' '}
          <span className="year">{year}</span>
        </div>
      </div>
      <div className="toolbar-right">
        <button className="toolbar-btn" onClick={goToPrevious}>
          ‹
        </button>
        <button className="toolbar-btn" onClick={goToToday}>
          Today
        </button>
        <button className="toolbar-btn" onClick={goToNext}>
          ›
        </button>
      </div>
    </div>
  );
};

// Custom Header Component
const CustomHeader = ({ date, localizer }) => {
  console.log('CustomHeader rendered with date:', date);
  
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const dayNumber = format(date, 'd');
  const dayName = format(date, 'EEE');

  return (
    <div className={`custom-header ${isToday ? 'today' : ''}`}>
      <div className="day-number">{dayNumber}</div>
      <div className="day-name">{dayName}</div>
    </div>
  );
};

// Custom Event Component
const CustomEvent = ({ event }) => {
  const startTime = format(event.start, 'HH:mm');
  const endTime = format(event.end, 'HH:mm');
  const session = event.resource;
  const currentUser = authService.getCurrentUser();

  console.log('CustomEvent rendering:', {
    event,
    session,
    startTime,
    endTime,
    currentUser: currentUser?.role
  });

  // Determine what information to show based on user role
  const getEventContent = () => {
    if (!session) {
      console.warn('No session data in event:', event);
      return null;
    }

    const content = [];
    
    // Always show time range
    content.push(
      <div key="time" className="event-time-range">
        {startTime} - {endTime}
      </div>
    );

    // Show subject name
    if (session.subject_name) {
      content.push(
        <div key="subject" className="event-class-name">
          {session.subject_name}
        </div>
      );
    }

    // Show participant based on user role
    if (currentUser?.role === 'instructor') {
      // Instructor sees student name
      if (session.student?.name || session.student_name) {
        content.push(
          <div key="student" className="event-instructor">
            {session.student?.name || session.student_name}
          </div>
        );
      }
    } else if (currentUser?.role === 'student') {
      // Student sees instructor name
      if (session.instructor?.name || session.instructor_name) {
        content.push(
          <div key="instructor" className="event-instructor">
            {session.instructor?.name || session.instructor_name}
          </div>
        );
      }
    } else {
      // Staff sees both student and instructor
      if (session.student?.name || session.student_name) {
        content.push(
          <div key="student" className="event-instructor">
            Student: {session.student?.name || session.student_name}
          </div>
        );
      }
      if (session.instructor?.name || session.instructor_name) {
        content.push(
          <div key="instructor" className="event-instructor">
            Instructor: {session.instructor?.name || session.instructor_name}
          </div>
        );
      }
    }

    // Show location if available
    if (session.location) {
      content.push(
        <div key="location" className="event-location">
          {session.location}
        </div>
      );
    }

    console.log('Event content generated:', content);
    return content;
  };

  return (
    <div className="schedule-session-event">
      {getEventContent()}
    </div>
  );
};

function ScheduleViewCalendar({ calendarRange, currentUserId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  const fetchUserSessions = useCallback(async () => {
    if (!currentUser || !currentUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let userSessions = [];

      console.log('Fetching sessions for user:', {
        userId: currentUserId,
        role: currentUser.role
      });

      // Fetch sessions based on user role
      if (currentUser.role === 'instructor') {
        userSessions = await classSessionService.getInstructorSessions(currentUserId);
      } else if (currentUser.role === 'student') {
        userSessions = await classSessionService.getStudentSessions(currentUserId);
      } else if (currentUser.role === 'staff') {
        // Staff can see all sessions
        userSessions = await classSessionService.getAllSessions();
      }

      console.log('Raw sessions data:', userSessions);

      // Convert sessions to calendar events with proper time formatting
      const calendarEvents = userSessions
        .filter(session => {
          // Filter out sessions without required fields
          return session.session_start && session.session_end;
        })
        .map(session => {
          // Handle TIMESTAMPTZ fields - use the same approach as SmartSchedulingCalendar
          let start, end;
          
          try {
            // Parse the TIMESTAMPTZ fields properly
            const sessionStart = new Date(session.session_start);
            const sessionEnd = new Date(session.session_end);
            const status = session.status || 'scheduled';
            
            // Validate dates
            if (isNaN(sessionStart.getTime()) || isNaN(sessionEnd.getTime())) {
              console.warn('Invalid date/time for session:', session);
              return null;
            }

            // Use the same time positioning logic as SmartSchedulingCalendar
            // Create new Date objects to avoid timezone issues
            start = new Date(sessionStart);
            end = new Date(sessionEnd);
            
            // Ensure we preserve the exact time but handle timezone correctly
            // This is the key fix - we need to set the time components explicitly
            const startHours = sessionStart.getHours();
            const startMinutes = sessionStart.getMinutes();
            const endHours = sessionEnd.getHours();
            const endMinutes = sessionEnd.getMinutes();
            
            // Set the time components explicitly to avoid timezone conversion issues
            start.setHours(startHours, startMinutes, 0, 0);
            end.setHours(endHours, endMinutes, 0, 0);
            
            console.log('Session time positioning:', {
              original: { start: sessionStart, end: sessionEnd },
              processed: { start, end },
              hours: { start: startHours, end: endHours },
              minutes: { start: startMinutes, end: endMinutes }
            });

            const eventData = {
              id: session.session_id,
              title: getSessionTitle(session),
              start,
              end,
              resource: session,
              className: getEventClassName(status),
              // Add additional properties for custom rendering
              session: session,
              startTime: `${String(startHours).padStart(2, '0')}:${String(startMinutes).padStart(2, '0')}`,
              endTime: `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`,
              subjectName: session.subject_name,
              studentName: session.student?.name || session.student_name,
              instructorName: session.instructor?.name || session.instructor_name,
              location: session.location
            };

            console.log('Created event data:', eventData);
            return eventData;
          } catch (error) {
            console.error('Error processing session time:', error, session);
            return null;
          }
        })
        .filter(Boolean); // Remove null entries

      console.log('Processed calendar events:', calendarEvents);
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      setError('Failed to load schedule. Please try again.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, currentUserId]);

  useEffect(() => {
    fetchUserSessions();
  }, [fetchUserSessions]);

  const getSessionTitle = (session) => {
    try {
      if (currentUser?.role === 'instructor') {
        const studentName = session.student?.name || session.student_name || 'Student';
        const subjectName = session.subject_name || 'Subject';
        return `${subjectName} - ${studentName}`;
      } else if (currentUser?.role === 'student') {
        const instructorName = session.instructor?.name || session.instructor_name || 'Instructor';
        const subjectName = session.subject_name || 'Subject';
        return `${subjectName} - ${instructorName}`;
      } else {
        const studentName = session.student?.name || session.student_name || 'Student';
        const instructorName = session.instructor?.name || session.instructor_name || 'Instructor';
        const subjectName = session.subject_name || 'Subject';
        return `${subjectName} - ${studentName} & ${instructorName}`;
      }
    } catch (error) {
      console.error('Error creating session title:', error);
      return 'Session';
    }
  };

  const getEventClassName = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'event-scheduled';
      case 'completed':
        return 'event-completed';
      case 'pending':
        return 'event-pending';
      default:
        return 'event-default';
    }
  };

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: '#3b82f6', // Default blue for scheduled
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0px',
      display: 'block',
      fontSize: '8px',
      fontWeight: '500',
      padding: '2px 4px',
      margin: '1px',
      minHeight: '20px'
    };

    // Apply colors based on session status
    if (event.className === 'event-completed') {
      style.backgroundColor = '#10b981'; // Green for completed
    } else if (event.className === 'event-pending') {
      style.backgroundColor = '#f59e0b'; // Orange for pending
    } else if (event.className === 'event-scheduled') {
      style.backgroundColor = '#3b82f6'; // Blue for scheduled
    } else {
      style.backgroundColor = '#6b7280'; // Gray for default
    }

    // Add hover effect
    style.cursor = 'default';
    style.transition = 'opacity 0.2s ease';

    return { style };
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '750px',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        Loading schedule...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '750px',
        fontSize: '16px',
        color: '#ef4444',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div>{error}</div>
        <button 
          onClick={fetchUserSessions}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="schedule-view-calendar" style={{ height: '750px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView="week"
        toolbar={true}
        components={{
          toolbar: CustomToolbar,
          header: CustomHeader,
          event: CustomEvent
        }}
        popup={true}
        selectable={false}
        resizable={false}
        showMultiDayTimes={true}
        step={30}
        timeslots={2}
        min={new Date(0, 0, 0, 6, 0, 0)} // 6 AM
        max={new Date(0, 0, 0, 22, 0, 0)} // 10 PM
        onNavigate={(newDate) => {
          // Handle navigation if needed
          console.log('Calendar navigated to:', newDate);
        }}
        onView={(newView) => {
          // Handle view change if needed
          console.log('Calendar view changed to:', newView);
        }}
      />
    </div>
  );
}

export default ScheduleViewCalendar; 