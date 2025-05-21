// src/components/ProfileCard.jsx

import React from 'react';

function ProfileCard() {
  return (
    <div className="profile-card">
      <div className="profile-header">
        <img src="./public/me.jpg" alt="Profile" className="profile-pic" />
        <div className="profile-info">
          <h2 className="profile-name">Yvonne An</h2>
          <p className="profile-role">Instructor @ Møbius Academy</p>
        </div>
        <div className="online-indicator"></div>
      </div>

      <div className="profile-buttons">
        <button className="btn setting-btn" onClick={() => console.log('Settings clicked')}>
          <i className="fa-solid fa-gear"></i>
          <span>Settings</span>
        </button>
        <button className="btn logout-btn" onClick={() => console.log('Logout clicked')}>
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileCard;
