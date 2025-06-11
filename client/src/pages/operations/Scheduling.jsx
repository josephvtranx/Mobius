import React, { useState } from 'react';
import ProfileCard from '../../components/ProfileCard';
import SideNav from '../../components/SideNav';
import Events from '../../components/Events';
import PendingBlocks from '../../components/PendingBlocks';
import ActionButtons from '../../components/ActionButtons';
import CalendarWidget from '../../components/CalendarWidget';
import '../../css/Scheduling.css';

function Scheduling() {
  const [classType, setClassType] = useState('one-time');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="page-container">
      <div className="main">
        <section className="dashboard-main">
          <form className="create-class-form" onSubmit={handleSubmit}>
            <label>
              Student
              <input type="text" name="student" placeholder="Search student" />
            </label>

            <label>
              Subject
              <select name="subject">
                <option value="">Select subject</option>
                <option value="math">Mathematics</option>
                <option value="english">English</option>
                <option value="science">Science</option>
              </select>
            </label>

            <label>
              Instructor
              <input type="text" name="instructor" placeholder="Search instructor" />
            </label>

            <label>
              Location
              <input type="text" name="location" placeholder="e.g. Zoom, Room A" />
            </label>

            <label>
              Class Type
              <select 
                id="class-type" 
                value={classType} 
                onChange={(e) => setClassType(e.target.value)}
              >
                <option value="one-time">One-Time</option>
                <option value="recurring">Recurring</option>
              </select>
            </label>

            {classType === 'one-time' ? (
              <>
                <label>
                  Date
                  <input type="date" name="date" />
                </label>
                <label>
                  Start Time
                  <input type="time" name="start_time" />
                </label>
                <label>
                  End Time
                  <input type="time" name="end_time" />
                </label>
              </>
            ) : (
              <>
                <label>
                  Days of Week
                  <div className="checkbox-row">
                    <label><input type="checkbox" value="mon" />Mon</label>
                    <label><input type="checkbox" value="tue" />Tue</label>
                    <label><input type="checkbox" value="wed" />Wed</label>
                    <label><input type="checkbox" value="thu" />Thu</label>
                    <label><input type="checkbox" value="fri" />Fri</label>
                  </div>
                </label>
                <label>
                  Start Date
                  <input type="date" name="rec_start" />
                </label>
                <label>
                  End Date
                  <input type="date" name="rec_end" />
                </label>
                <label>
                  Start Time
                  <input type="time" name="rec_start_time" />
                </label>
                <label>
                  End Time
                  <input type="time" name="rec_end_time" />
                </label>
              </>
            )}

            <label>
              Notes
              <textarea name="notes" rows="3" placeholder="Additional details..." />
            </label>

            <button type="submit" className="btn">Create Class</button>
          </form>

          <hr style={{ margin: '2rem 0' }} />

          <section className="pending-classes">
            <h2 className="title">Pending Instructor Confirmations</h2>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Instructor</th>
                  <th>Subject</th>
                  <th>Start</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* We'll add dynamic rows here when we have the data */}
              </tbody>
            </table>
          </section>
        </section>

      </div>
    </div>
  );
}

export default Scheduling; 