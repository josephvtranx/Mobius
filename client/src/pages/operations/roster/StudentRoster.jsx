import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../css/StudentRoster.css';
import ProfileCard from '../../../components/ProfileCard';

function StudentRoster() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/api/students/roster', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.data) {
          throw new Error('No data received from server');
        }

        const processedData = response.data.map(student => {
          console.log('Processing student:', student);
          return {
            id: student.id || '',
            name: student.name || '',
            studentEmail: student.studentEmail || '',
            studentPhone: student.studentPhone || '',
            parentNames: student.parentNames || [],
            parentEmails: student.parentEmails || [],
            parentPhones: student.parentPhones || [],
            instructors: student.instructors || [],
            status: student.status || '',
            enrolledClasses: student.enrolledClasses || [],
            schedule: student.schedule || []
          };
        });

        console.log('Processed data sample:', processedData[0]);
        setStudents(processedData);
      } catch (err) {
        console.error('Error fetching students:', err);
        
        if (err.response) {
          switch (err.response.status) {
            case 401:
              setError('Please log in to view the student roster');
              break;
            case 403:
              setError('You do not have permission to view the student roster');
              break;
            case 404:
              setError('Student roster not found');
              break;
            case 409:
              setError('There was a conflict with the data');
              break;
            case 500:
              setError('Server error. Please try again later');
              break;
            default:
              setError('Failed to fetch student data. Please try again later');
          }
        } else if (err.request) {
          setError('No response from server. Please check your connection');
        } else {
          setError('Failed to fetch student data. Please try again later');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return students;

    return [...students].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatSchedule = (schedule) => {
    if (!schedule || schedule.length === 0) return 'No schedule';
    return schedule.map(s => `${s.days} ${s.start_time}-${s.end_time}`).join(', ');
  };

  const getScheduledDays = (schedule) => {
    if (!schedule || schedule.length === 0) return new Set();
    
    const scheduledDays = new Set();
    schedule.forEach(s => {
      if (s.days) {
        // Handle both string format (comma-separated) and array format
        const days = typeof s.days === 'string' ? s.days.split(',').map(d => d.trim()) : s.days;
        days.forEach(day => {
          // Map day abbreviations to our button format
          const dayMap = {
            'mon': 'M',
            'tue': 'T', 
            'wed': 'W',
            'thu': 'Th',
            'fri': 'F',
            'sat': 'Sa',
            'sun': 'Su'
          };
          if (dayMap[day.toLowerCase()]) {
            scheduledDays.add(dayMap[day.toLowerCase()]);
          }
        });
      }
    });
    return scheduledDays;
  };

  const DayButtons = ({ schedule }) => {
    const scheduledDays = getScheduledDays(schedule);
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    return (
      <div className="day-buttons-container" style={{
        display: 'flex',
        gap: '4px',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      }}>
        {days.map((day, index) => {
          const isScheduled = scheduledDays.has(day);
          return (
            <div
              key={index}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: isScheduled ? '#374151' : '#e5e7eb',
                color: isScheduled ? 'white' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: isScheduled ? '600' : '400',
                border: '1px solid',
                borderColor: isScheduled ? '#374151' : '#d1d5db'
              }}
              title={isScheduled ? `Has classes on ${day}` : `No classes on ${day}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="main">
        <div className="main-student-roster">
          <div className="loading">Loading student data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main">
        <div className="main-student-roster">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  const sortedStudents = getSortedData();

  return (
    <div className="main">
      <div className="main-student-roster">
        <table className="roster-table">
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} className="sortable">
                Name {getSortIcon('name')}
              </th>
              <th>Student Contact</th>
              <th>Parents</th>
              <th>Instructors</th>
              <th>Status</th>
              <th>Enrolled Classes</th>
              <th style={{ textAlign: 'center' }}>Schedule</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((student) => (
              <React.Fragment key={student.id}>
                <tr 
                  className={`roster-row ${expandedRows[student.id] ? 'expanded' : ''}`}
                  onClick={() => toggleRow(student.id)}
                >
                  <td>{student.name}</td>
                  <td>
                    {student.studentEmail && (
                      <span className="email">{student.studentEmail}</span>
                    )}
                  </td>
                  <td>
                    <div className="parent-pills">
                      {student.parentNames.map((name, index) => (
                        <span key={index} className="parent-pill" data-parent-index={index}>
                          {name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{student.instructors.join(', ')}</td>
                  <td>{student.status}</td>
                  <td>{student.enrolledClasses.join(', ')}</td>
                  <td style={{ textAlign: 'center' }}>
                    <DayButtons schedule={student.schedule} />
                  </td>
                </tr>
                {expandedRows[student.id] && (
                  <>
                    {/* First row: Student contact + First parent contact */}
                    {(student.studentPhone || (student.parentNames.length > 0 && (student.parentEmails[0] || student.parentPhones[0]))) && (
                      <tr className="roster-subrow">
                        <td></td>
                        <td>
                          {student.studentPhone && (
                            <span className="contact-pill student-contact">{student.studentPhone}</span>
                          )}
                        </td>
                        <td>
                          {student.parentNames.length > 0 && (student.parentEmails[0] || student.parentPhones[0]) && (
                            <>
                              {student.parentEmails[0] && (
                                <span className="contact-pill" data-parent-index="0">{student.parentEmails[0]}</span>
                              )}
                              {student.parentPhones[0] && (
                                <span className="contact-pill" data-parent-index="0">{student.parentPhones[0]}</span>
                              )}
                            </>
                          )}
                        </td>
                        <td colSpan="4"></td>
                      </tr>
                    )}
                    {/* Additional parent contacts on separate rows */}
                    {student.parentNames.slice(1).map((parentName, index) => {
                      const actualIndex = index + 1;
                      return (
                        <tr key={`parent-${actualIndex}`} className="roster-subrow">
                          <td></td>
                          <td></td>
                          <td>
                            {student.parentEmails[actualIndex] && (
                              <span className="contact-pill" data-parent-index={actualIndex}>{student.parentEmails[actualIndex]}</span>
                            )}
                            {student.parentPhones[actualIndex] && (
                              <span className="contact-pill" data-parent-index={actualIndex}>{student.parentPhones[actualIndex]}</span>
                            )}
                          </td>
                          <td colSpan="4"></td>
                        </tr>
                      );
                    })}
                  </>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default StudentRoster;
