import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, addDays, addMinutes, differenceInMinutes, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { enUS } from 'date-fns/locale';
import instructorService from '../services/instructorService';
import classSessionService from '../services/classSessionService';
import '../css/react-big-calendar-custom.scss';

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
  selectedStudent,
  sessionCount = 1,
  sessionType = 'one-time',
  onEventsUpdate,
  calendarRange,
  onRangeChange,
  anchorStartDate
}) {
  const [events, setEvents] = useState([]);
  const [availabilityEvents, setAvailabilityEvents] = useState([]);
  const [existingSessions, setExistingSessions] = useState([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [availabilityCache, setAvailabilityCache] = useState(new Map());
  const [sessionsCache, setSessionsCache] = useState(new Map());
  // Track modified preference events to preserve their positions across navigation
  const [modifiedPreferenceEvents, setModifiedPreferenceEvents] = useState(new Map());
  // Track the first week's time pattern to apply to all subsequent weeks
  const [firstWeekTimePattern, setFirstWeekTimePattern] = useState(new Map());
  // Use calendarRange from props if provided, otherwise fallback to internal state
  const visibleRange = calendarRange || { start: startOfWeek(new Date(), { weekStartsOn: 0 }), end: endOfWeek(new Date(), { weekStartsOn: 0 }) };

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

  // Helper to calculate available time slots by subtracting scheduled sessions
  const calculateAvailableSlots = (availabilityBlocks, scheduledSessions, weekStart) => {
    const availableSlots = [];
    
    console.log('calculateAvailableSlots called with:', {
      availabilityBlocks: availabilityBlocks.length,
      scheduledSessions: scheduledSessions.length,
      weekStart
    });
    
    availabilityBlocks.forEach(avail => {
      const dayIdx = avail.dayIdx;
      const eventDate = addDays(weekStart, dayIdx);
      const dateString = format(eventDate, 'yyyy-MM-dd');
      
      console.log(`Processing day ${dayIdx} (${dateString}) with availability: ${avail.startMinutes}-${avail.endMinutes}`);
      
      // Get scheduled sessions for this day
      const daySessions = scheduledSessions.filter(session => {
        // Filter out sessions with invalid dates
        if (!session.start || !session.end || isNaN(session.start.getTime()) || isNaN(session.end.getTime())) {
          console.warn('Skipping session with invalid dates:', session);
          return false;
        }
        
        const sessionDateString = format(session.start, 'yyyy-MM-dd');
        const matches = sessionDateString === dateString;
        console.log(`Session ${session.id} date: ${sessionDateString}, matches ${dateString}: ${matches}`);
        return matches;
      });
      
      console.log(`Found ${daySessions.length} sessions for ${dateString}:`, daySessions);
      
      if (daySessions.length === 0) {
        // No conflicts, add the full availability block (minimum 15 minutes)
        if ((avail.endMinutes - avail.startMinutes) >= 15) {
          const start = new Date(eventDate);
          start.setHours(Math.floor(avail.startMinutes / 60), avail.startMinutes % 60, 0, 0);
          
          const end = new Date(eventDate);
          end.setHours(Math.floor(avail.endMinutes / 60), avail.endMinutes % 60, 0, 0);
          
          console.log(`Creating full availability block: ${avail.startMinutes}-${avail.endMinutes} minutes`);
          
          availableSlots.push({
            id: `avail-${dayIdx}-full`,
            title: 'Available',
            start,
            end,
            type: 'availability',
            draggable: false,
            interactive: false,
            selectable: false,
            resizable: false,
            resource: avail,
            dayIdx
          });
        } else {
          console.log(`Skipping short full availability block: ${avail.endMinutes - avail.startMinutes} minutes`);
        }
      } else {
        // Sort sessions by start time
        const sortedSessions = daySessions.sort((a, b) => 
          new Date(`2000-01-01T${a.startTime}`) - new Date(`2000-01-01T${b.startTime}`)
        );
        
        let currentStart = avail.startMinutes;
        
        sortedSessions.forEach((session, index) => {
          console.log(`Processing session ${index}:`, session);
          
          // Parse session times from the Date objects instead of strings
          const sessionStartMinutes = session.start.getHours() * 60 + session.start.getMinutes();
          const sessionEndMinutes = session.end.getHours() * 60 + session.end.getMinutes();
          
          console.log(`Session ${index} time range: ${sessionStartMinutes}-${sessionEndMinutes} minutes`);
          
          // If there's available time before this session (minimum 15 minutes)
          if (currentStart < sessionStartMinutes && (sessionStartMinutes - currentStart) >= 15) {
            const start = new Date(eventDate);
            start.setHours(Math.floor(currentStart / 60), currentStart % 60, 0, 0);
            
            const end = new Date(eventDate);
            end.setHours(Math.floor(sessionStartMinutes / 60), sessionStartMinutes % 60, 0, 0);
            
            console.log(`Creating availability slot before session ${index}: ${currentStart}-${sessionStartMinutes} minutes`);
            
            availableSlots.push({
              id: `avail-${dayIdx}-before-${index}`,
              title: 'Available',
              start,
              end,
              type: 'availability',
              draggable: false,
              interactive: false,
              selectable: false,
              resizable: false,
              resource: avail,
              dayIdx
            });
          } else if (currentStart < sessionStartMinutes) {
            console.log(`Skipping short availability slot before session ${index}: ${sessionStartMinutes - currentStart} minutes`);
          }
          
          // Update current start to after this session
          currentStart = Math.max(currentStart, sessionEndMinutes);
        });
        
        // If there's available time after the last session (minimum 15 minutes)
        if (currentStart < avail.endMinutes && (avail.endMinutes - currentStart) >= 15) {
          const start = new Date(eventDate);
          start.setHours(Math.floor(currentStart / 60), currentStart % 60, 0, 0);
          
          const end = new Date(eventDate);
          end.setHours(Math.floor(avail.endMinutes / 60), avail.endMinutes % 60, 0, 0);
          
          console.log(`Creating availability slot after last session: ${currentStart}-${avail.endMinutes} minutes`);
          
          availableSlots.push({
            id: `avail-${dayIdx}-after`,
            title: 'Available',
            start,
            end,
            type: 'availability',
            draggable: false,
            interactive: false,
            selectable: false,
            resizable: false,
            resource: avail,
            dayIdx
          });
        } else if (currentStart < avail.endMinutes) {
          console.log(`Skipping short availability slot after last session: ${avail.endMinutes - currentStart} minutes`);
        }
      }
    });
    
    return availableSlots;
  };

  // Fetch existing sessions for conflict checking
  useEffect(() => {
    const fetchExistingSessions = async () => {
      if (!selectedInstructorId) return;
      
      try {
        let sessions = sessionsCache.get(selectedInstructorId);

        if (!sessions) {
          sessions = await classSessionService.getInstructorSessions(selectedInstructorId);
          console.log('Raw sessions from API:', sessions);
          console.log('First session details:', sessions[0]);
          if (sessions[0]) {
            console.log('Session date type:', typeof sessions[0].session_date);
            console.log('Session date value:', sessions[0].session_date);
            console.log('Start time type:', typeof sessions[0].start_time);
            console.log('Start time value:', sessions[0].start_time);
            console.log('End time type:', typeof sessions[0].end_time);
            console.log('End time value:', sessions[0].end_time);
          }
          setSessionsCache(prev => new Map(prev).set(selectedInstructorId, sessions));
        }

        const formattedSessions = sessions
          .filter(session => session.status === 'scheduled' || session.status === 'in_progress')
          .map(session => {
            console.log('Processing session:', session);
            console.log('Session data types:', {
              session_date: typeof session.session_date,
              start_time: typeof session.start_time,
              end_time: typeof session.end_time,
              session_date_value: session.session_date,
              start_time_value: session.start_time,
              end_time_value: session.end_time
            });
            
            // Parse the date and time properly
            let start, end;
            try {
              // Handle different date/time formats
              if (session.session_date && session.start_time && session.end_time) {
                // Validate time formats
                const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
                
                if (!timeRegex.test(session.start_time) || !timeRegex.test(session.end_time)) {
                  console.warn('Invalid time format:', { start_time: session.start_time, end_time: session.end_time });
                  return null;
                }
                
                // If start_time and end_time include seconds, remove them for consistency
                const startTime = session.start_time.split(':').slice(0, 2).join(':');
                const endTime = session.end_time.split(':').slice(0, 2).join(':');
                
                // Try different date formats
                let dateString = session.session_date;
                
                // If session_date is a Date object, convert to string
                if (session.session_date instanceof Date) {
                  dateString = session.session_date.toISOString().split('T')[0];
                }
                
                // If it's already a string, ensure it's in YYYY-MM-DD format
                if (typeof dateString === 'string') {
                  // If it's in a different format, try to parse it
                  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                    const parsedDate = new Date(dateString);
                    if (!isNaN(parsedDate.getTime())) {
                      dateString = parsedDate.toISOString().split('T')[0];
                    }
                  }
                } else if (dateString instanceof Date) {
                  // If it's already a Date object, convert to string
                  dateString = dateString.toISOString().split('T')[0];
                } else {
                  // If it's null, undefined, or some other type, try to create a valid date
                  console.warn('Invalid session_date format:', dateString);
                  return null;
                }
                
                const fullStartString = `${dateString}T${startTime}:00`;
                const fullEndString = `${dateString}T${endTime}:00`;
                
                console.log(`Attempting to parse: start="${fullStartString}", end="${fullEndString}"`);
                
                start = new Date(fullStartString);
                end = new Date(fullEndString);
                
                console.log(`Parsed dates - session_date: ${dateString}, start_time: ${startTime}, end_time: ${endTime}`);
                console.log(`Created start: ${start}, end: ${end}`);
                console.log(`Start valid: ${!isNaN(start.getTime())}, End valid: ${!isNaN(end.getTime())}`);
              } else {
                console.warn('Missing date/time data for session:', session);
                return null;
              }
            } catch (error) {
              console.error('Error parsing session dates:', error, session);
              return null;
            }
            
            return {
              id: `session-${session.session_id}`,
              title: `${session.subject_name} - ${session.student.name}`,
              start,
              end,
              resource: session,
              type: 'existing-session',
              draggable: false,
              sessionDate: session.session_date,
              startTime: session.start_time,
              endTime: session.end_time
            };
          })
          .filter(Boolean) // Remove any null entries
          .filter(session => {
            // Additional validation to ensure dates are valid
            const isValid = session.start && session.end && 
                           !isNaN(session.start.getTime()) && 
                           !isNaN(session.end.getTime());
            if (!isValid) {
              console.warn('Filtering out session with invalid dates:', session);
            }
            return isValid;
          });
        
        console.log('Final formatted sessions:', formattedSessions);
        setExistingSessions(formattedSessions);
      } catch (error) {
        console.error('Error fetching existing sessions:', error);
        setExistingSessions([]);
      }
    };

    fetchExistingSessions();
  }, [selectedInstructorId, sessionsCache]);

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
        
        console.log('Raw instructor availability:', instructorAvailability);
        
        const events = instructorAvailability.map(slot => {
          const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
          const dayIdx = dayMap[slot.day_of_week];
          console.log(`Processing slot: ${slot.day_of_week} -> dayIdx: ${dayIdx}`);
          
          if (dayIdx === undefined) {
            console.log(`Skipping slot with unknown day: ${slot.day_of_week}`);
            return null;
          }

          const [startHour, startMinute] = slot.start_time.split(':').map(Number);
          const [endHour, endMinute] = slot.end_time.split(':').map(Number);

          const event = {
            ...slot,
            dayIdx,
            startMinutes: startHour * 60 + startMinute,
            endMinutes: endHour * 60 + endMinute,
          };
          
          console.log(`Created availability event:`, event);
          return event;
        }).filter(Boolean);
        
        console.log('Final availability events:', events);

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

  // Generate all events (availability, existing sessions, and student preferences) for the visible range
  useEffect(() => {
    const { start: rangeStart, end: rangeEnd } = visibleRange;
    const allEvents = [];
    // 1. Calculate and add instructor availability events (subtracting scheduled sessions)
    let weekStart = startOfWeek(rangeStart, { weekStartsOn: 0 });
    while (weekStart <= rangeEnd) {
    const availableSlots = calculateAvailableSlots(availabilityEvents, existingSessions, weekStart);
    allEvents.push(...availableSlots);
      weekStart = addDays(weekStart, 7);
    }
    // 2. Add existing sessions that fall within the visible range
    allEvents.push(...existingSessions.filter(ev =>
      isWithinInterval(ev.start, { start: rangeStart, end: rangeEnd })
    ));
    // 3. Add student preference events: generate N sessions from anchorStartDate, only render those in visible range
    if (studentPreferences && anchorStartDate) {
      const { preferredDays, preferredStartTime, duration } = studentPreferences;
      const preferredEndTime = calculateEndTime(preferredStartTime, duration);
      const dayMap = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
      const selectedDays = Object.entries(preferredDays)
        .filter(([_, isSelected]) => isSelected)
        .map(([day, _]) => day);
      if (selectedDays.length > 0) {
        const sessionsToShow = sessionType === 'multiple' ? sessionCount : 1;
        
        // Generate all session dates by repeating the pattern across weeks
        let sessionDates = [];
        let currentDate = new Date(anchorStartDate);
        let sessionIndex = 0;
        let weekIndex = 0;
        
        while (sessionIndex < sessionsToShow) {
          // For each week, try to place sessions on the selected days
          const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
          
          // Go through each day of the week
          for (let dayOffset = 0; dayOffset < 7 && sessionIndex < sessionsToShow; dayOffset++) {
            const sessionDate = addDays(weekStart, dayOffset);
            const dayKey = Object.keys(dayMap).find(key => dayMap[key] === sessionDate.getDay());
            
            if (selectedDays.includes(dayKey)) {
              sessionDates.push({ 
                date: new Date(sessionDate), 
                dayKey,
                sessionNumber: sessionIndex + 1,
                weekIndex: weekIndex
              });
              sessionIndex++;
            }
          }
          
          // Move to next week if we haven't placed all sessions
          if (sessionIndex < sessionsToShow) {
            weekIndex++;
            currentDate = addDays(weekStart, 7);
          }
        }
        
        // Only render those sessions that fall within the visible range
        sessionDates.forEach((session) => {
          if (session.date >= rangeStart && session.date <= rangeEnd) {
            const eventId = `session-${session.sessionNumber}-${session.date.toISOString().split('T')[0]}`;
            
            // Check if we have a modified version of this event
            const modifiedEvent = modifiedPreferenceEvents.get(eventId);
            
            if (modifiedEvent) {
              // Use the modified event with preserved position/duration
              allEvents.push({
                ...modifiedEvent,
                id: eventId,
                title: selectedStudent?.name || 'Student',
                dayOfWeek: session.dayKey,
                sessionNumber: session.sessionNumber,
                type: 'preference',
                draggable: true,
                resource: { dayOfWeek: session.dayKey, duration: modifiedEvent.duration, sessionNumber: session.sessionNumber }
              });
            } else {
              // Check if we have a first week time pattern for this day
              const firstWeekPattern = firstWeekTimePattern.get(session.dayKey);
              const sessionWeekStart = startOfWeek(session.date, { weekStartsOn: 0 });
              const anchorWeekStart = startOfWeek(anchorStartDate, { weekStartsOn: 0 });
              const isFirstWeek = sessionWeekStart.getTime() === anchorWeekStart.getTime();
              
              if (firstWeekPattern && !isFirstWeek) {
                // Use the first week's time pattern for this day
                const [startHour, startMinute] = firstWeekPattern.startTime.split(':').map(Number);
                const [endHour, endMinute] = firstWeekPattern.endTime.split(':').map(Number);
                const start = new Date(session.date);
                start.setHours(startHour, startMinute, 0, 0);
                const end = new Date(session.date);
                end.setHours(endHour, endMinute, 0, 0);
                allEvents.push({
                  id: eventId,
                  title: selectedStudent?.name || 'Student',
                  start,
                  end,
                  dayOfWeek: session.dayKey,
                  startTime: firstWeekPattern.startTime,
                  endTime: firstWeekPattern.endTime,
                  duration: firstWeekPattern.duration,
                  sessionNumber: session.sessionNumber,
                  type: 'preference',
                  draggable: true,
                  resource: { dayOfWeek: session.dayKey, duration: firstWeekPattern.duration, sessionNumber: session.sessionNumber }
                });
              } else {
                // Generate new event with default position
            const [startHour, startMinute] = preferredStartTime.split(':').map(Number);
            const [endHour, endMinute] = preferredEndTime.split(':').map(Number);
                const start = new Date(session.date);
            start.setHours(startHour, startMinute, 0, 0);
                const end = new Date(session.date);
            end.setHours(endHour, endMinute, 0, 0);
            allEvents.push({
                  id: eventId,
              title: selectedStudent?.name || 'Student',
              start,
              end,
                  dayOfWeek: session.dayKey,
              startTime: preferredStartTime,
              endTime: preferredEndTime,
              duration,
                  sessionNumber: session.sessionNumber,
              type: 'preference',
              draggable: true,
                  resource: { dayOfWeek: session.dayKey, duration, sessionNumber: session.sessionNumber }
            });
          }
        }
      }
        });
    }
    }
    setEvents(allEvents);
  }, [studentPreferences, availabilityEvents, existingSessions, selectedStudent, sessionCount, sessionType, visibleRange, anchorStartDate]);

  // Notify parent component when events change
  useEffect(() => {
    if (onEventsUpdate) {
      onEventsUpdate(events);
    }
  }, [events, onEventsUpdate]);

  // Clear modified events when anchor date changes (Reset Blocks button)
  useEffect(() => {
    setModifiedPreferenceEvents(new Map());
    setFirstWeekTimePattern(new Map());
  }, [anchorStartDate]);

  // Function to refresh calendar data (can be called from parent)
  const refreshCalendarData = useCallback(async () => {
    if (selectedInstructorId) {
      // Clear caches to force fresh data fetch
      setAvailabilityCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(selectedInstructorId);
        return newCache;
      });
      setSessionsCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(selectedInstructorId);
        return newCache;
      });
    }
  }, [selectedInstructorId]);

  // Expose refresh function to parent component
  useEffect(() => {
    if (window.refreshCalendarData) {
      window.refreshCalendarData = refreshCalendarData;
    }
  }, [refreshCalendarData]);

  // Handle event drop (drag and drop)
  const handleEventDrop = useCallback(({ event, start, end }) => {
    // Only handle preference events
    if (event.type !== 'preference') {
      return;
    }

    // Check if the event is being moved to a different day
    const originalDate = format(event.start, 'yyyy-MM-dd');
    const newDate = format(start, 'yyyy-MM-dd');
    
    if (originalDate !== newDate) {
      // Prevent cross-day dragging
      return;
    }

    // Snap to 15-minute increments
    const snappedStart = snapToTime(start, 15);
    const duration = differenceInMinutes(event.end, event.start);
    const snappedEnd = addMinutes(snappedStart, duration);

    // Store the modified event for persistence across navigation
    setModifiedPreferenceEvents(prev => {
      const newMap = new Map(prev);
      newMap.set(event.id, {
        ...event,
        start: snappedStart,
        end: snappedEnd,
        startTime: format(snappedStart, 'HH:mm'),
        endTime: format(snappedEnd, 'HH:mm')
      });
      return newMap;
    });

    // Update the first week time pattern if this is a first week event
    const eventDate = new Date(snappedStart);
    const weekStart = startOfWeek(eventDate, { weekStartsOn: 0 });
    const anchorWeekStart = startOfWeek(anchorStartDate, { weekStartsOn: 0 });
    
    if (weekStart.getTime() === anchorWeekStart.getTime()) {
      // This is a first week event, update the pattern
      setFirstWeekTimePattern(prev => {
        const newPattern = new Map(prev);
        const dayKey = format(snappedStart, 'EEE').toLowerCase().substring(0, 3);
        newPattern.set(dayKey, {
          startTime: format(snappedStart, 'HH:mm'),
          endTime: format(snappedEnd, 'HH:mm'),
          duration: differenceInMinutes(snappedEnd, snappedStart)
        });
        return newPattern;
      });
    }

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
      duration: event.duration,
      sessionNumber: event.sessionNumber
    });
  }, [selectedInstructorId, onTimeSlotSelect]);

  // Handle event resize (drag edges to change height/duration)
  const handleEventResize = useCallback(({ event, start, end }) => {
    // Only allow resizing of preference events
    if (event.type !== 'preference') {
      return;
    }

    // Snap to 15-minute increments
    const snappedStart = snapToTime(start, 15);
    const snappedEnd = snapToTime(end, 15);

    // Store the modified event for persistence across navigation
    setModifiedPreferenceEvents(prev => {
      const newMap = new Map(prev);
      newMap.set(event.id, {
        ...event,
        start: snappedStart,
        end: snappedEnd,
        startTime: format(snappedStart, 'HH:mm'),
        endTime: format(snappedEnd, 'HH:mm'),
        duration: differenceInMinutes(snappedEnd, snappedStart)
      });
      return newMap;
    });

    // Update the first week time pattern if this is a first week event
    const eventDate = new Date(snappedStart);
    const weekStart = startOfWeek(eventDate, { weekStartsOn: 0 });
    const anchorWeekStart = startOfWeek(anchorStartDate, { weekStartsOn: 0 });
    
    if (weekStart.getTime() === anchorWeekStart.getTime()) {
      // This is a first week event, update the pattern
      setFirstWeekTimePattern(prev => {
        const newPattern = new Map(prev);
        const dayKey = format(snappedStart, 'EEE').toLowerCase().substring(0, 3);
        newPattern.set(dayKey, {
          startTime: format(snappedStart, 'HH:mm'),
          endTime: format(snappedEnd, 'HH:mm'),
          duration: differenceInMinutes(snappedEnd, snappedStart)
        });
        return newPattern;
      });
    }

    // Update the event in state
    setEvents(prevEvents => 
      prevEvents.map(evt => 
        evt.id === event.id 
          ? { ...evt, start: snappedStart, end: snappedEnd }
          : evt
      )
    );

    // Call the parent callback with new duration
    const dayOfWeek = format(snappedStart, 'EEE').toLowerCase().substring(0, 3);
    const startTime = format(snappedStart, 'HH:mm');
    const endTime = format(snappedEnd, 'HH:mm');
    const newDuration = differenceInMinutes(snappedEnd, snappedStart);
    
    onTimeSlotSelect({
      instructor: { id: selectedInstructorId },
      date: format(snappedStart, 'yyyy-MM-dd'),
      startTime,
      endTime,
      dayOfWeek,
      duration: newDuration,
      sessionNumber: event.sessionNumber
    });
  }, [selectedInstructorId, onTimeSlotSelect]);

  // Event styling
  const eventStyleGetter = useCallback((event) => {
    const style = {};
    let dataType = '';
    if (event.type === 'availability') {
      style.backgroundColor = '#CEECEA';
      style.borderColor = '#16a34a';
      style.color = 'white';
      style.borderRadius = '12px';
      style.pointerEvents = 'none';
      style.cursor = 'default';
      style.fontSize = '10px';
      style.fontWeight = '500';
      // Do NOT set position, width, left, right, etc.
      dataType = 'availability';
    } else if (event.type === 'preference') {
      style.backgroundColor = '#c7d2fe';
      style.borderColor = '#818cf8';
      style.color = '#3730a3';
      style.borderRadius = '12px';
      style.cursor = 'grab';
      style.fontSize = '10px';
      style.fontWeight = '500';
      dataType = 'preference';
    } else if (event.type === 'existing-session') {
      style.backgroundColor = 'rgb(254, 202, 202)';
      style.borderColor = '#dc2626';
      style.color = '#991b1b';
      style.borderRadius = '12px';
      style.cursor = 'default';
      style.pointerEvents = 'none';
      style.fontSize = '10px';
      style.fontWeight = '600';
      style.zIndex = 3;
      dataType = 'existing-session';
    }
    return {
      style,
      'data-event-type': dataType
    };
  }, []);

  // Custom event component
  const components = {
    event: ({ event }) => {
      if (event.type === 'availability') {
        // Render availability events as visible time blocks
        const startTime = format(event.start, 'h:mm a');
        const endTime = format(event.end, 'h:mm a');
        return (
          <div 
            className="calendar-event availability-event rbc-event-availability"
            style={{ 
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              padding: '2px'
            }}
            title={`Available: ${startTime} - ${endTime}`}
          >
            <div className="event-title" style={{ fontSize: '9px', fontWeight: '600' }}>
              Available
            </div>
            <div style={{ fontSize: '8px', opacity: '0.8' }}>
              {startTime} - {endTime}
            </div>
          </div>
        );
      }
      
      if (event.type === 'existing-session') {
        // Render existing sessions with student name and class/subject name
        const startTime = format(event.start, 'h:mm a');
        const endTime = format(event.end, 'h:mm a');
        const studentName = event.resource?.student?.name || 'Student';
        const subjectName = event.resource?.subject_name || 'Class';
        return (
          <div 
            className="calendar-event existing-session-event"
            style={{ 
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              padding: '2px'
            }}
            title={`${studentName}: ${subjectName} (${startTime} - ${endTime})`}
          >
            <div className="event-title" style={{ fontSize: '10px', fontWeight: '600' }}>
              {studentName}
            </div>
            <div style={{ fontSize: '8px', opacity: '0.8' }}>
              {subjectName}
            </div>
          </div>
        );
      }
      
      // Render preference events with click handling
      return (
        <div 
          className="calendar-event"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Only handle clicks for preference events
            if (event.type === 'preference') {
              const startTime = format(event.start, 'HH:mm');
              const endTime = format(event.end, 'HH:mm');
              const dayOfWeek = format(event.start, 'EEE').toLowerCase().substring(0, 3);
              
              onTimeSlotSelect({
                instructor: { id: selectedInstructorId },
                date: format(event.start, 'yyyy-MM-dd'),
                startTime,
                endTime,
                dayOfWeek,
                duration: event.duration,
                sessionNumber: event.sessionNumber
              });
            }
          }}
          style={{ cursor: 'grab' }}
        >
          <div className="event-title">{event.title}</div>
        </div>
      );
    },
    
    // Custom header component to show date on top of day
    header: ({ date, label }) => {
      const dayName = format(date, 'EEE'); // Mon, Tue, etc.
      const dayNumber = format(date, 'd');  // 22, 23, etc.
      
      // Check if this is today's date
      const today = new Date();
      const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      
      return (
        <div className={`custom-header ${isToday ? 'today' : ''}`}>
          <div className={`day-number ${isToday ? 'today-number' : ''}`}>{dayNumber}</div>
          <div className="day-name">{dayName}</div>
        </div>
      );
    },
    
    // Custom toolbar component
    toolbar: ({ onNavigate, label, onView, view, views, date }) => {
      // Use the date prop directly instead of parsing the label
      // This is more reliable as it's the actual date object from React Big Calendar
      const currentDate = date || new Date();
      const month = format(currentDate, 'MMMM');
      const year = format(currentDate, 'yyyy');
      
      return (
        <div className="custom-toolbar">
          <div className="toolbar-left">
            <span className="month-year">
              <span className="month">{month}</span> <span className="year">{year}</span>
            </span>
          </div>
          <div className="toolbar-right">
            <button onClick={() => onNavigate('PREV')} className="toolbar-btn">
              Back
            </button>
            <button onClick={() => onNavigate('TODAY')} className="toolbar-btn">
              Today
            </button>
            <button onClick={() => onNavigate('NEXT')} className="toolbar-btn">
              Next
            </button>
          </div>
        </div>
      );
    }
  };

  // Update events when selectedTimeSlot changes (for manual edits)
  // Removed to prevent infinite loop - selectedTimeSlot updates are handled in the parent component

  return (
    <div className="smart-scheduling-calendar">
      <DragAndDropCalendar
        key={`calendar-${selectedInstructorId}-${selectedStudent?.id}`}
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        views={['week', 'month']}
        defaultView="week"
        step={15}
        timeslots={2}
        selectable={false}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        resizable
        eventPropGetter={eventStyleGetter}
        components={components}
        formats={{
          timeGutterFormat: (date, culture, localizer) => {
            return localizer.format(date, 'h a', culture);
          }
        }}
        tooltipAccessor={(event) => {
          if (event.type === 'availability') return 'Available';
          if (event.type === 'existing-session') return event.title;
          return event.title;
        }}
        min={new Date(0, 0, 0, 6, 0, 0)} // 6 AM
        max={new Date(0, 0, 0, 21, 0, 0)} // 9 PM
        draggableAccessor={(event) => {
          return event.type === 'preference' && event.draggable !== false;
        }}
        resizableAccessor={(event) => {
          return event.type === 'preference' && event.draggable !== false;
        }}
        onDragStartPreventDefault={false}
        onRangeChange={onRangeChange}
      />
      
      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color availability" style={{ backgroundColor: '#dcfce7', borderColor: '#16a34a' }}></div>
          <span>Available Time Slots</span>
        </div>
        <div className="legend-item">
          <div className="legend-color preference" style={{ backgroundColor: '#c7d2fe', borderColor: '#818cf8' }}></div>
          <span>Student Preferred (Draggable)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color scheduled" style={{ backgroundColor: '#fecaca', borderColor: '#dc2626' }}></div>
          <span>Scheduled Classes</span>
        </div>
        <div className="legend-item">
          <div className="legend-color conflict" style={{ backgroundColor: '#f3f4f6', borderColor: '#9ca3af' }}></div>
          <span>Unavailable/Conflict</span>
        </div>
      </div>
    </div>
  );
}

export default SmartSchedulingCalendar; 