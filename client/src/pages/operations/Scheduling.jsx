import React from 'react';
import Header from '../../components/Header';
import ProfileCard from '../../components/ProfileCard';
import SideNav from '../../components/SideNav';
import Events from '../../components/Events';
import PendingBlocks from '../../components/PendingBlocks';
import ActionButtons from '../../components/ActionButtons';

function Scheduling() {
  return (
    <>
      <Header />
      <ProfileCard />
      
      <div className="main">
        <aside className="main-sidebar">
          {/* Events Section */}
          <div className="events-section">
            <h3>Events</h3>
            <ul className="events-list">
              <li className="event-item">
                <span className="event-time">10:00 AM</span>
                <h4 className="event-title">Team Meeting</h4>
              </li>
              <li className="event-item">
                <span className="event-time">2:00 PM</span>
                <h4 className="event-title">Student Session</h4>
              </li>
              <li className="event-item">
                <span className="event-time">4:00 PM</span>
                <h4 className="event-title">Planning Review</h4>
              </li>
            </ul>
          </div>
        
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
      </div>
      </>

  );
}

export default Scheduling;
