import React from 'react';
import SideNav from '../../../components/SideNav';
import ProfileCard from '../../../components/ProfileCard';

function Assignments() {
  return (
    <div className="page-container">
      {/* Header */}
      <h1>Assignments</h1>
      
      {/* Sidebar Nav */}
      <SideNav />

      {/* Profile card */}
      <ProfileCard />

      {/* Main Content */}
      <div className="main-content">
        <p>Assignments page content will go here</p>
      </div>
    </div>
  );
}

export default Assignments; 