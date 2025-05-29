import React from 'react';

function ActionButtons() {
  return (
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
  );
}

export default ActionButtons; 