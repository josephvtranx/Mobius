import React, { useState, useEffect } from 'react';
import ScheduleViewCalendar from '../../components/ScheduleViewCalendar';
import Events from '../../components/Events';
import PendingBlocks from '../../components/PendingBlocks';
import authService from '../../services/authService';
import { startOfWeek, endOfWeek } from 'date-fns';
import '../../css/index.css';
import '../../css/Scheduling.css';

function Schedule() {
  const [currentUser, setCurrentUser] = useState(null);
  const [calendarRange, setCalendarRange] = useState({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    console.log('Schedule: Current user loaded:', user);
    setCurrentUser(user);
  }, []);

  // Debug: Log current user and calendar range
  useEffect(() => {
    console.log('Schedule component debug:', {
      currentUser,
      calendarRange,
      currentUserId: currentUser?.user_id
    });
  }, [currentUser, calendarRange]);

  // Add error boundary for debugging
  if (!currentUser) {
    return (
      <div className="page-container">
        <div className="main">
          <section className="dashboard-main">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '400px',
              fontSize: '16px',
              color: '#6b7280'
            }}>
              Loading user data...
            </div>
          </section>
        </div>
      </div>
    );
    }

  return (
    <div className="page-container">
      <div className="main">
        <section className="dashboard-main">
          <div style={{ 
            display: 'flex', 
            gap: '2rem', 
            alignItems: 'flex-start',
            minHeight: 'calc(100vh - 200px)'
          }}>
            {/* Sidebar */}
      <aside className="mcal-sidebar">
              <Events calendarRange={calendarRange} />
              <PendingBlocks />
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
              <ScheduleViewCalendar
            calendarRange={calendarRange}
            currentUserId={currentUser?.user_id}
              />
              <div className="calendar-legend">
                <div className="legend-item legend-scheduled">
                  <div className="legend-color"></div>
                  <span>Scheduled</span>
                </div>
                <div className="legend-item legend-completed">
                  <div className="legend-color"></div>
                  <span>Completed</span>
                </div>
                <div className="legend-item legend-pending">
                  <div className="legend-color"></div>
                  <span>Pending</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Schedule;