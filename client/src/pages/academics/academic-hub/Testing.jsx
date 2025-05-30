import React from 'react';
import SideNav from '../../../components/SideNav';
import ProfileCard from '../../../components/ProfileCard';

function Testing() {
  return (
    <div className="page-container">
      {/* Header */}
      <h1>Testing</h1>
      
      {/* Profile card */}
      <ProfileCard />

      {/* Main Content */}
      <div className="main-content">
        <p>Testing page content will go here</p>
      </div>
    </div>
  );
}

export default Testing;
