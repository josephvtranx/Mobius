import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../css/StaffRoster.css';

function StaffRoster() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'ascending'
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('/api/staff/roster', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.data) {
          throw new Error('No data received from server');
        }

        const processedData = response.data.map(member => ({
          id: member.id || '',
          name: member.name || '',
          contact: member.contact || '',
          phone: member.phone || '',
          department: member.department || '',
          employmentStatus: member.employmentStatus || '',
          salary: member.salary || 0,
          hourlyRate: member.hourlyRate || 0,
          totalHoursWorked: member.totalHoursWorked || 0,
          age: member.age || '',
          gender: member.gender || '',
          timeLogs: member.timeLogs || []
        }));

        setStaff(processedData);
      } catch (err) {
        console.error('Error fetching staff:', err);
        
        if (err.response) {
          switch (err.response.status) {
            case 401:
              setError('Please log in to view the staff roster');
              break;
            case 403:
              setError('You do not have permission to view the staff roster');
              break;
            case 404:
              setError('Staff roster not found');
              break;
            case 409:
              setError('There was a conflict with the data');
              break;
            case 500:
              setError('Server error. Please try again later');
              break;
            default:
              setError('Failed to fetch staff data. Please try again later');
          }
        } else if (err.request) {
          setError('No response from server. Please check your connection');
        } else {
          setError('Failed to fetch staff data. Please try again later');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return staff;

    return [...staff].sort((a, b) => {
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

  const formatCurrency = (amount) => {
    return typeof amount === 'number' ? amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    }) : '$0.00';
  };

  const formatHours = (hours) => {
    return typeof hours === 'number' ? hours.toFixed(1) : '0.0';
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="main">
        <div className="main-staff-roster">
          <div className="loading">Loading staff data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main">
        <div className="main-staff-roster">
          <div className="error">{error}</div>
        </div>
      </div>
    );
  }

  const sortedStaff = getSortedData();

  return (
    <div className="main">
      <div className="main-staff-roster">
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('name')} className="sortable">
                Staff Name {getSortIcon('name')}
              </th>
              <th onClick={() => requestSort('contact')} className="sortable">
                Contact {getSortIcon('contact')}
              </th>
              <th onClick={() => requestSort('department')} className="sortable">
                Department {getSortIcon('department')}
              </th>
              <th onClick={() => requestSort('employmentStatus')} className="sortable">
                Status {getSortIcon('employmentStatus')}
              </th>
              <th onClick={() => requestSort('salary')} className="sortable">
                Salary {getSortIcon('salary')}
              </th>
              <th onClick={() => requestSort('hourlyRate')} className="sortable">
                Hourly Rate {getSortIcon('hourlyRate')}
              </th>
              <th onClick={() => requestSort('totalHoursWorked')} className="sortable">
                Hours Worked {getSortIcon('totalHoursWorked')}
              </th>
              <th>Recent Time Logs</th>
            </tr>
          </thead>
          <tbody>
            {sortedStaff.map((member) => (
              <React.Fragment key={member.id}>
                <tr 
                  className={`roster-row ${expandedRows[member.id] ? 'expanded' : ''}`}
                  onClick={() => toggleRow(member.id)}
                >
                  <td>{member.name}</td>
                  <td>{member.contact}</td>
                  <td>{member.department}</td>
                  <td>
                    <span className={`status ${member.employmentStatus}`}>
                      {member.employmentStatus}
                    </span>
                  </td>
                  <td>{formatCurrency(member.salary)}</td>
                  <td>{formatCurrency(member.hourlyRate)}</td>
                  <td>{formatHours(member.totalHoursWorked)}</td>
                  <td className="time-logs">
                    {member.timeLogs.slice(0, 3).map((log, idx) => (
                      <div key={idx} className="time-log">
                        <div className="date">
                          {new Date(log.clock_in).toLocaleDateString()}
                        </div>
                        <div className="hours">
                          {log.clock_out 
                            ? `${new Date(log.clock_in).toLocaleTimeString()} - ${new Date(log.clock_out).toLocaleTimeString()}`
                            : `${new Date(log.clock_in).toLocaleTimeString()} (In Progress)`
                          }
                        </div>
                      </div>
                    ))}
                  </td>
                </tr>
                {expandedRows[member.id] && member.phone && (
                  <tr className="roster-subrow">
                    <td></td>
                    <td className="phone-cell">{member.phone}</td>
                    <td colSpan="6"></td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffRoster;
