import React, { useState, useEffect } from 'react';
import CalendarWidget from '../components/CalendarWidget';
import authService from '../services/authService';
import classSeriesService from '../services/classSeriesService';

function Home() {
  const user = authService.getCurrentUser();
  const userName = user ? user.name : 'Guest';
  
  // State for pending classes
  const [pendingClasses, setPendingClasses] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);

  // Fetch pending classes on component mount
  useEffect(() => {
    fetchPendingClasses();
  }, []);

  const fetchPendingClasses = async () => {
    setIsLoadingPending(true);
    try {
      const data = await classSeriesService.getPendingClassSeries();
      setPendingClasses(data);
    } catch (error) {
      console.error('Error fetching pending classes:', error);
      setPendingClasses([]);
    } finally {
      setIsLoadingPending(false);
    }
  };



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
                {/* Pending Instructor Confirmations */}
                <div className="pending-confirmations">
                  <h2 className="section-title-pending">Pending Instructor Confirmations</h2>
                  {isLoadingPending ? (
                    <div className="loading">Loading...</div>
                  ) : pendingClasses.length > 0 ? (
                    <div className="pending-list">
                      {pendingClasses.slice(0, 3).map(classItem => (
                        <div key={classItem.series_id} className="card pending-card">
                          <div className="pending-info">
                            <p className="student-name">{classItem.student?.name || 'Unknown Student'}</p>
                            <p className="subject-info">
                              {classItem.subject_name} with {classItem.instructor?.name || 'Unknown Instructor'}
                            </p>
                            <p className="schedule-info">
                              {new Date(classItem.start_date).toLocaleDateString()} • {classItem.days_of_week?.join(', ') || 'TBD'}
                            </p>
                          </div>
                          <div className="pending-status">
                            <span className="pending-pill">Pending</span>
                          </div>
                        </div>
                      ))}
                      {pendingClasses.length > 3 && (
                        <div className="view-more">
                          <button 
                            className="btn-view-all"
                            onClick={() => window.location.href = '/operations/scheduling'}
                          >
                            View All ({pendingClasses.length} total)
                          </button>
                        </div>
                      )}
                  </div>
                  ) : (
                    <div className="no-pending">
                      <p>No pending instructor confirmations</p>
                  </div>
                  )}
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