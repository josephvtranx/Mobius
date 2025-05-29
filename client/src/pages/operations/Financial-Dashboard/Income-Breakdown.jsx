import React from 'react';
import SideNav from '../../../components/SideNav';
import ProfileCard from '../../../components/ProfileCard';

function IncomeBreakdown() {
  return (
    <div className="page-container">
      {/* Header */}
      <h1>Income Breakdown</h1>
      
      {/* Sidebar Nav */}
      <SideNav />

      {/* Profile card */}
      <ProfileCard />

      {/* Main Content */}
      <div className="main-content">
        <p>Income Breakdown dashboard content will go here</p>
      </div>
    </div>
  );
}

export default IncomeBreakdown;
