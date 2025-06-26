import React, { useState, useEffect } from 'react';
import attendanceService from '../services/attendanceService.js';
import '../css/AttendanceMarker.css';

function AttendanceMarker({ sessionId, studentId, onAttendanceMarked }) {
  const [attended, setAttended] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    // Fetch session info if needed
    if (sessionId) {
      fetchSessionInfo();
    }
  }, [sessionId]);

  const fetchSessionInfo = async () => {
    try {
      const attendance = await attendanceService.getSessionAttendance(sessionId);
      if (attendance.length > 0) {
        const existingAttendance = attendance.find(a => a.student_id === studentId);
        if (existingAttendance) {
          setAttended(existingAttendance.attended);
          setNotes(existingAttendance.notes || '');
        }
      }
    } catch (error) {
      console.error('Error fetching session info:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (attended === null) {
      setError('Please select attendance status');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await attendanceService.markAttendance(
        sessionId, 
        studentId, 
        attended, 
        notes.trim() || null
      );

      alert(result.message);
      
      if (onAttendanceMarked) {
        onAttendanceMarked(result);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to mark attendance');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAttended(null);
    setNotes('');
    setError(null);
  };

  return (
    <div className="attendance-marker">
      <h3>Mark Attendance</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Attendance Status:</label>
          <div className="attendance-options">
            <label className="attendance-option">
              <input
                type="radio"
                name="attended"
                value="true"
                checked={attended === true}
                onChange={() => setAttended(true)}
              />
              <span className="attendance-label attended">Present</span>
            </label>
            <label className="attendance-option">
              <input
                type="radio"
                name="attended"
                value="false"
                checked={attended === false}
                onChange={() => setAttended(false)}
              />
              <span className="attendance-label absent">Absent</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>
            Notes (optional):
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the session..."
              rows="3"
            />
          </label>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="attendance-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || attended === null}
          >
            {isSubmitting ? 'Marking...' : 'Mark Attendance'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export default AttendanceMarker; 