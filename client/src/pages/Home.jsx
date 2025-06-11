import React from 'react';
import CalendarWidget from '../components/CalendarWidget';
import authService from '../services/authService';

function Home() {
  const user = authService.getCurrentUser();
  const userName = user ? user.name : 'Guest';

  return (
    <div className="body body--home">
      <div className="page-container">
        {/* Main dashboard content */}
        <main className="main main--home">
          <div className="dashboard-container">
            <div className="dashboard-main">
              {/* Header */}
              <div className="dashboard-header">
                <h1>Welcome back, {userName}</h1>
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
                <CalendarWidget />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Home;