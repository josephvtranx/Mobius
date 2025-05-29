import React from 'react';
import ProfileCard from '../components/ProfileCard';
import CalendarWidget from '../components/CalendarWidget'; 

function Home() {
  return (
    <div className="page-container">
      {/* Profile card (bottom-left) */}
      <ProfileCard />

      {/* Main dashboard content */}
      <main className="main-dashboard">
        <div className="dashboard-container">
          <div className="dashboard-main">
            {/* Header */}
            <div className="dashboard-header">
              <h1>Welcome back, Yvonne</h1>
              <div className="search-bar-home">
                <input type="text" placeholder="Find a Page" />
              </div>
            </div>

            {/* Dashboard content */}
            <div className="dashboard-content">
              {/* Recently Visited */}
              <div className="recently-visited">
                <h2>Recently Visited</h2>
                <div className="card">
                  <p>TEXT subject</p>
                  <span className="timestamp">2 hours ago</span>
                </div>
                <div className="card">
                  <p>
                    10/12 Test Results
                    <br />
                    <small>SAT Mock Test</small>
                  </p>
                  <span className="timestamp">28 mins ago</span>
                </div>
              </div>

              {/* Upcoming */}
              <div className="upcoming">
                <h2>Upcoming</h2>
                <div className="card">
                  <p>Assignment 3 Problemsets</p>
                  <span className="timestamp">2 hours ago</span>
                </div>
                <div className="card">
                  <p>
                    10/12 Test Results
                    <br />
                    <small>SAT Mock Test</small>
                  </p>
                  <span className="timestamp">27 hours ago</span>
                </div>
              </div>

              {/* Calendar Widget */}
              <CalendarWidget />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
