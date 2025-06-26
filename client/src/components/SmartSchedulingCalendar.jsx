import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addDays, addMinutes, differenceInMinutes } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import instructorService from '../services/instructorService';
import classSessionService from '../services/classSessionService';
import '../css/SmartSchedulingCalendar.css';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Create draggable calendar component
const DragAndDropCalendar = withDragAndDrop(Calendar);

function SmartSchedulingCalendar({ 
  studentPreferences,
  selectedInstructorId,
  onTimeSlotSelect, 
  selectedTimeSlot,
  studentId,
  subjectId,
  selectedStudent
}) {
  const [events, setEvents] = useState([]);
  const [availabilityEvents, setAvailabilityEvents] = useState([]);
  const [existingSessions, setExistingSessions] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityCache, setAvailabilityCache] = useState(new Map());

  // Helper to calculate end time
  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + durationMinutes);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // Helper to snap time to 15-minute increments
  const snapToTime = (date, increment = 15) => {
    const minutes = date.getMinutes();
    const snappedMinutes = Math.round(minutes / increment) * increment;
    const snappedDate = new Date(date);
    snappedDate.setMinutes(snappedMinutes, 0, 0);
    return snappedDate;
  };

  // Helper to check if a time slot is within instructor availability
  const isWithinAvailability = (start, end) => {
    if (!availabilityEvents.length) {
      console.log('No availability events found');
      return false;
    }
    
    const dayOfWeek = format(start, 'EEE').toLowerCase().substring(0, 3);
    const dayMap = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
    const dayIdx = dayMap[dayOfWeek];
    
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    
    console.log('Availability check:', {
      dayOfWeek,
      dayIdx,
      startMinutes,
      endMinutes,
      availabilityEvents: availabilityEvents.map(avail => ({
        dayIdx: avail.dayIdx,
        startMinutes: avail.startMinutes,
        endMinutes: avail.endMinutes
      }))
    });
    
    const isAvailable = availabilityEvents.some(avail => 
      avail.dayIdx === dayIdx &&
      startMinutes >= avail.startMinutes &&
      endMinutes <= avail.endMinutes
    );
    
    console.log('Availability result:', isAvailable);
    return isAvailable;
  };

  // Fetch existing sessions for conflict checking
  useEffect(() => {
    const fetchExistingSessions = async () => {
      if (!selectedInstructorId || !studentId) return;
      
      try {
        const sessions = await classSessionService.getInstructorSessions(selectedInstructorId);
        const formattedSessions = sessions.map(session => ({
          id: `session-${session.session_id}`,
          title: `${session.subject_name} - ${session.student.name}`,
          start: new Date(`${session.session_date}T${session.start_time}`),
          end: new Date(`${session.session_date}T${session.end_time}`),
          resource: session,
          type: 'existing-session',
          draggable: false
        }));
        setExistingSessions(formattedSessions);
      } catch (error) {
        console.error('Error fetching existing sessions:', error);
      }
    };

    fetchExistingSessions();
  }, [selectedInstructorId, studentId]);

  // Fetch availability for the selected instructor
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedInstructorId) {
        setAvailabilityEvents([]);
        return;
      }
      
      setIsLoadingAvailability(true);
      try {
        let instructorAvailability = availabilityCache.get(selectedInstructorId);

        if (!instructorAvailability) {
          instructorAvailability = await instructorService.getInstructorAvailability(selectedInstructorId);
          setAvailabilityCache(prev => new Map(prev).set(selectedInstructorId, instructorAvailability));
        }
        
        const events = instructorAvailability.map(slot => {
          const dayMap = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
          const dayIdx = dayMap[slot.day_of_week];
          if (dayIdx === undefined) return null;

          const [startHour, startMinute] = slot.start_time.split(':').map(Number);
          const [endHour, endMinute] = slot.end_time.split(':').map(Number);

          return {
            ...slot,
            dayIdx,
            startMinutes: startHour * 60 + startMinute,
            endMinutes: endHour * 60 + endMinute,
          };
        }).filter(Boolean);

        setAvailabilityEvents(events);
      } catch (error) {
        console.error(`Error fetching availability for instructor ${selectedInstructorId}:`, error);
        setAvailabilityEvents([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedInstructorId, availabilityCache]);

  // Generate all events (availability, existing sessions, and student preferences)
  useEffect(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const allEvents = [];

    // 1. Add instructor availability events (static, green)
    availabilityEvents.forEach(avail => {
      const dayIdx = avail.dayIdx;
      const eventDate = addDays(weekStart, dayIdx);
      
      const start = new Date(eventDate);
      start.setHours(Math.floor(avail.startMinutes / 60), avail.startMinutes % 60, 0, 0);
      
      const end = new Date(eventDate);
      end.setHours(Math.floor(avail.endMinutes / 60), avail.endMinutes % 60, 0, 0);

      allEvents.push({
        id: `avail-${dayIdx}`,
        title: `Available: ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`,
        start,
        end,
        type: 'availability',
        draggable: false,
        interactive: false, // Mark as non-interactive
        resource: avail
      });
    });

    // 2. Add existing sessions (static, yellow)
    allEvents.push(...existingSessions);

    // 3. Add student preference events (draggable, purple)
    if (studentPreferences) {
      const { preferredDays, preferredStartTime, duration } = studentPreferences;
      const preferredEndTime = calculateEndTime(preferredStartTime, duration);
      const dayMap = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };

      Object.entries(preferredDays)
        .filter(([_, isSelected]) => isSelected)
        .forEach(([day]) => {
          const dayIdx = dayMap[day];
          if (dayIdx === undefined) return;

          const [startHour, startMinute] = preferredStartTime.split(':').map(Number);
          const [endHour, endMinute] = preferredEndTime.split(':').map(Number);

          const eventDate = addDays(weekStart, dayIdx);
          const start = new Date(eventDate);
          start.setHours(startHour, startMinute, 0, 0);
          const end = new Date(eventDate);
          end.setHours(endHour, endMinute, 0, 0);

          // Create a simple test event that should be draggable
          allEvents.push({
            id: `pref-${day}`,
            title: `${selectedStudent?.name || 'Student'}: ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`,
            start,
            end,
            dayOfWeek: day,
            startTime: preferredStartTime,
            endTime: preferredEndTime,
            duration,
            type: 'preference',
            draggable: true, // Force draggable for testing
            resource: { dayOfWeek: day, duration }
          });
          
          console.log(`Created test preference event for ${day}:`, {
            id: `pref-${day}`,
            draggable: true,
            start: start.toISOString(),
            end: end.toISOString()
          });
        });
    }
    
    setEvents(allEvents);
  }, [studentPreferences, availabilityEvents, existingSessions, selectedStudent]);

  // Handle event drop (drag and drop)
  const handleEventDrop = useCallback(({ event, start, end }) => {
    console.log('handleEventDrop called:', { event, start, end });
    
    // For now, allow all preference events to be dragged
    if (event.type !== 'preference') {
      console.log('Event not preference type:', event.type);
      return;
    }

    // Check if the event is being moved to a different day
    const originalDate = format(event.start, 'yyyy-MM-dd');
    const newDate = format(start, 'yyyy-MM-dd');
    
    if (originalDate !== newDate) {
      // Silently prevent the drop by returning early
      console.log('Preventing cross-day drag');
      return;
    }

    // Snap to 15-minute increments
    const snappedStart = snapToTime(start, 15);
    const duration = differenceInMinutes(event.end, event.start);
    const snappedEnd = addMinutes(snappedStart, duration);

    console.log('Snapped times:', { snappedStart, snappedEnd, duration });

    // Update the event in state
    setEvents(prevEvents => 
      prevEvents.map(evt => 
        evt.id === event.id 
          ? { ...evt, start: snappedStart, end: snappedEnd }
          : evt
      )
    );

    // Call the parent callback
    const dayOfWeek = format(snappedStart, 'EEE').toLowerCase().substring(0, 3);
    const startTime = format(snappedStart, 'HH:mm');
    const endTime = format(snappedEnd, 'HH:mm');
    
    onTimeSlotSelect({
      instructor: { id: selectedInstructorId },
      date: format(snappedStart, 'yyyy-MM-dd'),
      startTime,
      endTime,
      dayOfWeek,
      duration: event.duration
    });
  }, [selectedInstructorId, onTimeSlotSelect]);

  // Handle event selection (click)
  const handleEventSelect = useCallback((event) => {
    console.log('Event selected:', event);
    
    // Only allow selection of preference events, ignore availability and existing sessions
    if (event.type === 'preference' && event.interactive !== false) {
      const startTime = format(event.start, 'HH:mm');
      const endTime = format(event.end, 'HH:mm');
      const dayOfWeek = format(event.start, 'EEE').toLowerCase().substring(0, 3);
      
      onTimeSlotSelect({
        instructor: { id: selectedInstructorId },
        date: format(event.start, 'yyyy-MM-dd'),
        startTime,
        endTime,
        dayOfWeek,
        duration: event.duration
      });
    }
  }, [selectedInstructorId, onTimeSlotSelect]);

  // Event styling
  const eventStyleGetter = useCallback((event) => {
    let style = {
      backgroundColor: '#c7d2fe',
      border: '2px solid #818cf8',
      borderRadius: '6px',
      color: '#374151',
      display: 'block',
      padding: '4px',
      cursor: 'grab',
      position: 'absolute',
      zIndex: 4,
      pointerEvents: 'auto',
      width: 'calc(100% - 8px)',
      left: '4px',
      right: '4px'
    };

    // Check if this event is the currently selected one
    const isSelected = selectedTimeSlot && 
      selectedTimeSlot.startTime === format(event.start, 'HH:mm') &&
      selectedTimeSlot.date === format(event.start, 'yyyy-MM-dd');

    if (isSelected) {
      style.border = '3px solid #3b82f6';
      style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
      style.zIndex = 5;
    }

    if (event.type === 'availability') {
      style.backgroundColor = '#dcfce7';
      style.borderColor = '#22c55e';
      style.color = '#166534';
      style.opacity = '0.4';
      style.zIndex = 0;
      style.pointerEvents = 'none';
      style.cursor = 'default';
      style.border = '1px solid #22c55e';
      style.fontSize = '8px';
      style.position = 'absolute';
      style.width = 'calc(100% - 2px)';
      style.left = '1px';
      style.right = '1px';
    } else if (event.type === 'existing-session') {
      style.backgroundColor = '#fef3c7';
      style.borderColor = '#f59e0b';
      style.color = '#92400e';
      style.zIndex = 2;
      style.cursor = 'default';
      style.pointerEvents = 'none';
      style.position = 'absolute';
      style.width = 'calc(100% - 8px)';
      style.left = '4px';
      style.right = '4px';
    }

    return { style };
  }, [selectedTimeSlot]);

  // Custom event component
  const components = {
    event: ({ event }) => {
      if (event.type === 'availability') {
        // Render availability events as simple background elements
        return (
          <div className="calendar-event availability-event">
            <div className="event-title">{event.title}</div>
          </div>
        );
      }
      
      // Render preference events normally
      return (
        <div className="calendar-event">
          <div className="event-title">{event.title}</div>
        </div>
      );
    }
  };

  // Update events when selectedTimeSlot changes (for manual edits)
  useEffect(() => {
    if (selectedTimeSlot && events.length > 0) {
      setEvents(prevEvents => 
        prevEvents.map(event => {
          if (event.type === 'preference' && 
              event.startTime === selectedTimeSlot.startTime &&
              format(event.start, 'yyyy-MM-dd') === selectedTimeSlot.date) {
            
            // Update the event with new start time and duration
            const [startHour, startMinute] = selectedTimeSlot.startTime.split(':').map(Number);
            const newStart = new Date(event.start);
            newStart.setHours(startHour, startMinute, 0, 0);
            
            const newEnd = new Date(newStart.getTime() + selectedTimeSlot.duration * 60000);
            
            return {
              ...event,
              start: newStart,
              end: newEnd,
              startTime: selectedTimeSlot.startTime,
              endTime: format(newEnd, 'HH:mm'),
              duration: selectedTimeSlot.duration,
              title: `${selectedStudent?.name || 'Student'}: ${format(newStart, 'h:mm a')} - ${format(newEnd, 'h:mm a')}`
            };
          }
          return event;
        })
      );
    }
  }, [selectedTimeSlot]);

  return (
    <div className="smart-scheduling-calendar">
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={['week']}
        defaultView="week"
        step={15}
        timeslots={2}
        selectable
        onEventDrop={handleEventDrop}
        onEventResize={handleEventDrop}
        onSelectEvent={handleEventSelect}
        resizable
        eventPropGetter={eventStyleGetter}
        components={components}
        tooltipAccessor={(event) => event.title}
        min={new Date(0, 0, 0, 6, 0, 0)} // 6 AM
        max={new Date(0, 0, 0, 21, 0, 0)} // 9 PM
        draggableAccessor={(event) => {
          console.log('Draggable check for event:', event.id, 'type:', event.type, 'draggable:', event.draggable);
          return event.type === 'preference' && event.draggable !== false;
        }}
        resizableAccessor={(event) => {
          return event.type === 'preference' && event.draggable !== false;
        }}
        onDragStartPreventDefault={false}
      />
      
      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color availability"></div>
          <span>Instructor Available (Background)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color preference"></div>
          <span>Student Preferred (Draggable)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color available"></div>
          <span>Available for Scheduling</span>
        </div>
        <div className="legend-item">
          <div className="legend-color conflict"></div>
          <span>Conflict/Unavailable</span>
        </div>
      </div>
    </div>
  );
}

export default SmartSchedulingCalendar; 