import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../css/InstructorRoster.css';

function InstructorRoster() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/instructors');
        // Ensure all required fields have default values
        const processedData = response.data.map(instructor => ({
          id: instructor.id || '',
          name: instructor.name || '',
          contact: instructor.contact || '',
          phone: instructor.phone || '',
          hourlyRate: instructor.hourlyRate || 0,
          totalHours: instructor.totalHours || 0,
          monthlySalary: instructor.monthlySalary || 0,
          classes: instructor.classes || [],
          schedule: instructor.schedule || []
        }));
        setInstructors(processedData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch instructor data. Please try again later.');
        console.error('Error fetching instructors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return instructors;

    return [...instructors].sort((a, b) => {
      const aValue = a[sortConfig.key] || 0;
      const bValue = b[sortConfig.key] || 0;
      
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

  const formatCurrency = (amount) => {
    return typeof amount === 'number' ? amount.toLocaleString() : '0';
  };

  if (loading) {
    return (
      <div className="main">
        <div className="main-student-roster">
          <h2>Instructor Roster</h2>
          <div className="loading">Loading instructor data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main">
        <div className="main-student-roster">
          <h2>Instructor Roster</h2>
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  const sortedInstructors = getSortedData();

  return (
    <div className="main">
      <div className="main-student-roster">
        <h2>Instructor Roster</h2>
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} className="sortable">
                Instructor Name {getSortIcon('name')}
              </th>
              <th onClick={() => requestSort('contact')} className="sortable">
                Instructor Contact {getSortIcon('contact')}
              </th>
              <th onClick={() => requestSort('hourlyRate')} className="sortable">
                Hourly Rate {getSortIcon('hourlyRate')}
              </th>
              <th onClick={() => requestSort('totalHours')} className="sortable">
                Total Hours {getSortIcon('totalHours')}
              </th>
              <th onClick={() => requestSort('monthlySalary')} className="sortable">
                Monthly Salary {getSortIcon('monthlySalary')}
              </th>
              <th>Classes Teaching</th>
              <th>Schedule</th>
            </tr>
          </thead>
          <tbody>
            {sortedInstructors.map((instructor) => (
              <tr key={instructor.id}>
                <td>{instructor.name}</td>
                <td>
                  <div className="contact-info">
                    {instructor.contact && <div className="email">{instructor.contact}</div>}
                    {instructor.phone && <div className="phone">{instructor.phone}</div>}
                  </div>
                </td>
                <td>${formatCurrency(instructor.hourlyRate)}</td>
                <td>{instructor.totalHours}</td>
                <td>${formatCurrency(instructor.monthlySalary)}</td>
                <td className="class-list">
                  {instructor.classes.map((classCode, idx) => (
                    <span key={idx} className="class-pill">
                      {classCode}
                    </span>
                  ))}
                </td>
                <td>
                  <div className="schedule">
                    {weekDays.map((day, idx) => (
                      <span
                        key={idx}
                        className={`day ${instructor.schedule.includes(day) ? 'filled' : ''}`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InstructorRoster;
