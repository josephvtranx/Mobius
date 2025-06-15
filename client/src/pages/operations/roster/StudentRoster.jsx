import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../css/StudentRoster.css';
import ProfileCard from '../../../components/ProfileCard';

function StudentRoster() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

        const processedData = response.data.map(student => ({
          id: student.id || '',
          name: student.name || '',
          contact: student.contact || '',
          phone: student.phone || '',
          status: student.status || '',
          age: student.age || '',
          grade: student.grade || '',
          gender: student.gender || '',
          school: student.school || '',
          paCode: student.paCode || '',
          guardians: student.guardians || [],
          enrolledClasses: student.enrolledClasses || []
        }));

        setStudents(processedData);
      } catch (err) {
        console.error('Error fetching students:', err);
        
        // Handle specific error cases
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

  if (loading) {
    return (
      <div className="main">
        <div className="main-student-roster">
          <h2>Student Roster</h2>
          <div className="loading">Loading student data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main">
        <div className="main-student-roster">
          <h2>Student Roster</h2>
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  const sortedStudents = getSortedData();

  return (
    <div className="main">
      <div className="main-student-roster">
        <h2>Student Roster</h2>
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} className="sortable">
                Student Name {getSortIcon('name')}
              </th>
              <th onClick={() => requestSort('contact')} className="sortable">
                Contact {getSortIcon('contact')}
              </th>
              <th onClick={() => requestSort('status')} className="sortable">
                Status {getSortIcon('status')}
              </th>
              <th onClick={() => requestSort('grade')} className="sortable">
                Grade {getSortIcon('grade')}
              </th>
              <th onClick={() => requestSort('school')} className="sortable">
                School {getSortIcon('school')}
              </th>
              <th>Guardians</th>
              <th>Enrolled Classes</th>
            </tr>
          </thead>
          <tbody>
            {sortedStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>
                  <div className="contact-info">
                    {student.contact && <div className="email">{student.contact}</div>}
                    {student.phone && <div className="phone">{student.phone}</div>}
                  </div>
                </td>
                <td>
                  <span className={`status ${student.status}`}>
                    {student.status}
                  </span>
                </td>
                <td>{student.grade}</td>
                <td>{student.school}</td>
                <td className="guardian-list">
                  {student.guardians.map((guardian, idx) => (
                    <span key={idx} className="guardian-pill">
                      {guardian}
                    </span>
                  ))}
                </td>
                <td className="class-list">
                  {student.enrolledClasses.map((classCode, idx) => (
                    <span key={idx} className="class-pill">
                      {classCode}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Profile card (bottom-left) */}
      <ProfileCard />
    </div>
  );
}

export default StudentRoster;
