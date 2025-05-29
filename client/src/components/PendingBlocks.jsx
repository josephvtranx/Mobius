import React from 'react';

function PendingBlocks() {
  return (
    <div className="blocks-section">
      <div className="pending-blocks">
        <div className="pending-title">
          <h4>Pending Blocks</h4>
        </div>
        <div className="pending-item-container">
          <div className="pending-item">
            <span>2:00 PM - 3:00 PM</span>
          </div>
          <div className="pending-item">
            <span>4:30 PM - 5:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PendingBlocks;
