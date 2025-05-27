import React from 'react';
import SideNav from '../components/SideNav';
import ProfileCard from '../components/ProfileCard';


function StudentRoster() {
  return (
    <div className="page-container">
      {/* Sidebar Nav */}
      <SideNav />

      {/* Profile card (bottom-left) */}
      <ProfileCard />

      {/* Main dashboard content */}
    </div>
  );
}

export default StudentRoster;
