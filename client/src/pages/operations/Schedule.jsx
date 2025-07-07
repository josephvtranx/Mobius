import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProfileCard from '../../components/ProfileCard';
import SideNav from '../../components/SideNav';
import Events from '../../components/Events';
import PendingBlocks from '../../components/PendingBlocks';
import ActionButtons from '../../components/ActionButtons';
import SmartSchedulingCalendar from '../../components/SmartSchedulingCalendar';
import authService from '../../services/authService';
import { startOfWeek, endOfWeek } from 'date-fns';

function Schedule() {
  // Get current user
  const [currentUser, setCurrentUser] = useState(null);

  // Track the visible range for the calendar
  const [calendarRange, setCalendarRange] = useState({
    start: startOfWeek(new Date(), { weekStartsOn: 0 }),
    end: endOfWeek(new Date(), { weekStartsOn: 0 })
  });

  // Get current user on component mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Pass a handler to update the visible range from the calendar
  const handleCalendarRangeChange = (range) => {
    if (Array.isArray(range)) {
      setCalendarRange({ start: range[0], end: range[range.length - 1] });
    } else if (range.start && range.end) {
      setCalendarRange({ start: range.start, end: range.end });
    }
  };

  return (
    <div className="main main--schedule">
      <aside className="mcal-sidebar">
        {/* Events Section */}
        <Events />
      
        {/* Pending Blocks */}
        <div className="blocks-section">
          <div className="pending-blocks">
            <div className="pending-title">
              <h4>Pending Blocks</h4>
            </div>
            <div className="pending-item-container">
              <PendingBlocks />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sidebar-actions">
          <button className="action-button reschedule">
            <i className="fas fa-calendar-alt"></i>
            Reschedule
          </button>
          <button className="action-button add-event">
            <i className="fas fa-plus"></i>
            Add Event
          </button>
          <button className="action-button import-export">
            <i className="fas fa-file-import"></i>
            Import/Export
          </button>
        </div>
      </aside>

      {/* Calendar View */}
      <div className="calendar-view-container">
        <DndProvider backend={HTML5Backend}>
          <SmartSchedulingCalendar
            studentPreferences={{
              preferredDays: {
                mon: false,
                tue: false,
                wed: false,
                thu: false,
                fri: false,
                sat: false,
                sun: false
              },
              preferredStartTime: '09:00',
              duration: 60
            }}
            selectedInstructorId={null}
            onTimeSlotSelect={() => {}}
            selectedTimeSlot={null}
            studentId={null}
            subjectId={null}
            selectedStudent={null}
            sessionCount={1}
            sessionType="one-time"
            calendarRange={calendarRange}
            anchorStartDate={calendarRange.start}
            onRangeChange={handleCalendarRangeChange}
            height={770}
            viewMode="schedule"
            currentUserId={currentUser?.user_id}
            onEventsUpdate={useCallback((events) => {
              // Handle events update if needed
              console.log('Calendar events updated:', events);
            }, [])}
          />
        </DndProvider>
      </div>
    </div>
  );
}

export default Schedule;