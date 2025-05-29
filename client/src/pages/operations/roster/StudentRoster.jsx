import React from 'react';
import SideNav from '../../../components/SideNav';
import ProfileCard from '../../../components/ProfileCard';


function StudentRoster() {
  return (
    <div className="page-container">
      <h1>Student Roster</h1>
      {/* Add your student roster content here */}

      {/* Sidebar Nav */}
      <SideNav />

      {/* Profile card (bottom-left) */}
      <ProfileCard />

      {/* Main dashboard content */}
    </div>
  );
}

export default StudentRoster;
