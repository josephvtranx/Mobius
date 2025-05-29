import React from 'react';
import SideNav from '../../components/SideNav';
import ProfileCard from '../../components/ProfileCard';
import Header from '../../components/Header';

function InstructorHome() {
  return (
    <>
      <Header />
      <SideNav />
      <ProfileCard />
      
      {/* Main Content */}
      <div className="main main--instructor-home">
        <div className="dashboard-grid">
          {/* Calendar Section */}
          <div className="calendar-section">
            <h2 className="section-title">January 2025</h2>
            <img src="/public/calendar-placeholder.png" alt="Calendar" className="calendar-img"/>
          </div>
        
          {/* Payment Summary */}
          <div className="payment-summary">
            <h2 className="section-title">Payment</h2>
            <div className="payment-info">
              <div>
                <h3 className="hours">150 hrs</h3>
                <p className="subtext">this month</p>
              </div>
              <div className="next-pay">
                <p>Next Payday: <strong>Nov 15</strong></p>
                <p>Expected Amount: <strong>$4,200</strong></p>
              </div>
            </div>
            <div className="payment-chart">
              <img src="/public/payment-chart-placeholder.png" alt="Monthly Earnings Chart"/>
            </div>
          </div>
        
          {/* Notifications */}
          <div className="notifications">
            <div className="notifications-header">
              <h2 className="section-title">Recent Notifications</h2>
              <a href="#" className="view-all">All Notifications</a>
            </div>
            <ul className="notification-list">
              <li>
                <div className="notif-icon">
                  <i className="fa-solid fa-book-open-reader"></i>
                </div>
                <div className="notif-content">
                  <h4>Student Progress Update</h4>
                  <p>Emily Smith has completed the "Linear Equations" module with 85% accuracy.</p>
                </div>
                <div className="notif-date">Nov 17, 2024</div>
              </li>
      
              <li>
                <div className="notif-icon">
                  <i className="fa-solid fa-book-open-reader"></i>
                </div>
                <div className="notif-content">
                  <h4>Class Update</h4>
                  <p>Ryan Patel scored 90% on the "Reading Comprehension" practice test. Consider scheduling a mock exam for next week.</p>
                </div>
                <div className="notif-date">Nov 15, 2024</div>
              </li>
      
              <li>
                <div className="notif-icon">
                  <i className="fa-solid fa-dollar-sign"></i>
                </div>
                <div className="notif-content">
                  <h4>Payment</h4>
                  <p>Your payment of $1,250 for Nov 1–15, 2024, has been successfully deposited.</p>
                </div>
                <div className="notif-date">Nov 14, 2024</div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default InstructorHome; 