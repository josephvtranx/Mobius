import React from 'react';
import SideNav from '../../../components/SideNav';
import ProfileCard from '../../../components/ProfileCard';

function RedPenReview() {
  return (
    <div className="page-container">
      {/* Header */}
      <h1>Red Pen Review</h1>
      

      {/* Profile card */}
      <ProfileCard />

      {/* Main Content */}
      <div className="main-content">
        <p>Red Pen Review page content will go here</p>
      </div>
    </div>
  );
}

export default RedPenReview;
