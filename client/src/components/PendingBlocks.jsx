import React, { useState, useEffect } from 'react';
import classSessionService from '../services/classSessionService';
import { formatLocalTime } from '../lib/time.js';
import '../css/Scheduling.css';

const PendingBlocks = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await classSessionService.getAllSessions();
      
      // Filter for pending sessions
      const pending = response.filter(session => session.status === 'pending');
      setPendingRequests(pending);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
      setError('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (sessionId, newStatus) => {
    try {
      await classSessionService.updateSessionStatus(sessionId, newStatus);
      // Refresh the list
      fetchPendingRequests();
    } catch (err) {
      console.error('Error updating session status:', err);
      setError('Failed to update session status');
    }
  };

  if (loading) return <div className="pending-loading">Loading pending blocks...</div>;
  if (error) return <div className="pending-error">{error}</div>;

  return (
    <div className="blocks-section">
        <div className="pending-title">
          <h4>Pending Blocks</h4>
        </div>
      {pendingRequests.length === 0 ? (
        <p className="no-pending">No pending blocks</p>
      ) : (
        <div className="pending-item-container">
          {pendingRequests.map((request) => (
            <div key={request.session_id} className="pending-item">
              <div className="request-info">
                <div className="student-name">{request.student?.name || 'Unknown'}</div>
                <div className="subject">{request.subject_name}</div>
                <div className="time-info">
                  <span>{formatLocalTime(request.session_start)}</span>
                  <span> - </span>
                  <span>{formatLocalTime(request.session_end)}</span>
                </div>
              </div>
              <div className="request-actions">
                <button
                  className="accept-btn"
                  onClick={() => handleStatusUpdate(request.session_id, 'scheduled')}
                >
                  Accept
                </button>
                <button
                  className="decline-btn"
                  onClick={() => handleStatusUpdate(request.session_id, 'declined')}
                >
                  Decline
                </button>
          </div>
          </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingBlocks;
