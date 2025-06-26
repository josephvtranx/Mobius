import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import '../../../css/FinancialDashboard.css';

function IncomeBreakdown() {
  const [revenueView, setRevenueView] = useState('subject');
  const [trendView, setTrendView] = useState('subject');
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Mock data for revenue composition
  const revenueComposition = [
    { name: 'Mathematics', value: 18000, color: '#8884d8', type: 'subject' },
    { name: 'Physics', value: 15000, color: '#82ca9d', type: 'subject' },
    { name: 'Chemistry', value: 12000, color: '#ffc658', type: 'subject' },
    { name: 'Biology', value: 8000, color: '#ff7300', type: 'subject' },
    { name: 'English', value: 6000, color: '#8dd1e1', type: 'subject' }
  ];

  // Mock data for monthly revenue trends
  const monthlyTrends = {
    subject: [
      { month: 'Jan', Mathematics: 3000, Physics: 2500, Chemistry: 2000, Biology: 1500, English: 1000 },
      { month: 'Feb', Mathematics: 3500, Physics: 2800, Chemistry: 2200, Biology: 1600, English: 1100 },
      { month: 'Mar', Mathematics: 3200, Physics: 2600, Chemistry: 2100, Biology: 1400, English: 900 },
      { month: 'Apr', Mathematics: 3800, Physics: 3000, Chemistry: 2400, Biology: 1700, English: 1200 },
      { month: 'May', Mathematics: 4000, Physics: 3200, Chemistry: 2500, Biology: 1800, English: 1300 },
      { month: 'Jun', Mathematics: 4200, Physics: 3400, Chemistry: 2600, Biology: 1900, English: 1400 }
    ],
    instructor: [
      { month: 'Jan', 'Dr. Smith': 4000, 'Prof. Johnson': 3500, 'Dr. Williams': 3000, 'Prof. Brown': 2500, 'Dr. Davis': 2000 },
      { month: 'Feb', 'Dr. Smith': 4500, 'Prof. Johnson': 3800, 'Dr. Williams': 3200, 'Prof. Brown': 2700, 'Dr. Davis': 2200 },
      { month: 'Mar', 'Dr. Smith': 4200, 'Prof. Johnson': 3600, 'Dr. Williams': 3100, 'Prof. Brown': 2600, 'Dr. Davis': 2100 },
      { month: 'Apr', 'Dr. Smith': 4800, 'Prof. Johnson': 4000, 'Dr. Williams': 3400, 'Prof. Brown': 2900, 'Dr. Davis': 2400 },
      { month: 'May', 'Dr. Smith': 5000, 'Prof. Johnson': 4200, 'Dr. Williams': 3600, 'Prof. Brown': 3100, 'Dr. Davis': 2600 },
      { month: 'Jun', 'Dr. Smith': 5200, 'Prof. Johnson': 4400, 'Dr. Williams': 3800, 'Prof. Brown': 3300, 'Dr. Davis': 2800 }
    ],
    classType: [
      { month: 'Jan', Private: 8000, Group: 5000, Online: 2000 },
      { month: 'Feb', Private: 8500, Group: 5300, Online: 2200 },
      { month: 'Mar', Private: 8200, Group: 5100, Online: 2100 },
      { month: 'Apr', Private: 8800, Group: 5500, Online: 2300 },
      { month: 'May', Private: 9000, Group: 5700, Online: 2400 },
      { month: 'Jun', Private: 9200, Group: 5900, Online: 2500 }
    ]
  };

  // Mock data for revenue table
  const revenueEntries = [
    { id: 1, student: 'Sarah Johnson', subject: 'Mathematics', instructor: 'Dr. Smith', amount: 150, date: '2024-06-15', classType: 'Private' },
    { id: 2, student: 'Mike Chen', subject: 'Physics', instructor: 'Prof. Johnson', amount: 120, date: '2024-06-14', classType: 'Group' },
    { id: 3, student: 'Emily Davis', subject: 'Chemistry', instructor: 'Dr. Williams', amount: 130, date: '2024-06-13', classType: 'Private' },
    { id: 4, student: 'Alex Thompson', subject: 'Biology', instructor: 'Prof. Brown', amount: 110, date: '2024-06-12', classType: 'Online' },
    { id: 5, student: 'Jessica Lee', subject: 'English', instructor: 'Dr. Davis', amount: 100, date: '2024-06-11', classType: 'Group' },
    { id: 6, student: 'David Wilson', subject: 'Mathematics', instructor: 'Dr. Smith', amount: 150, date: '2024-06-10', classType: 'Private' },
    { id: 7, student: 'Lisa Garcia', subject: 'Physics', instructor: 'Prof. Johnson', amount: 120, date: '2024-06-09', classType: 'Group' },
    { id: 8, student: 'Ryan Martinez', subject: 'Chemistry', instructor: 'Dr. Williams', amount: 130, date: '2024-06-08', classType: 'Private' }
  ];

  // Mock data for top earners
  const topInstructors = [
    { name: 'Dr. Smith', revenue: 12500, percentage: 27.8 },
    { name: 'Prof. Johnson', revenue: 10800, percentage: 24.0 },
    { name: 'Dr. Williams', revenue: 9200, percentage: 20.4 },
    { name: 'Prof. Brown', revenue: 7800, percentage: 17.3 },
    { name: 'Dr. Davis', revenue: 4700, percentage: 10.4 }
  ];

  const topSubjects = [
    { name: 'Mathematics', revenue: 18000, percentage: 40.0 },
    { name: 'Physics', revenue: 15000, percentage: 33.3 },
    { name: 'Chemistry', revenue: 12000, percentage: 26.7 }
  ];

  const totalRevenue = revenueComposition.reduce((sum, item) => sum + item.value, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value, total) => {
    return ((value / total) * 100).toFixed(1);
  };

  const filteredEntries = revenueEntries.filter(entry => {
    const matchesSearch = entry.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter === 'all' || entry.date.includes(dateFilter);
    return matchesSearch && matchesDate;
  });

  const tableTotal = filteredEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const getChartColors = () => {
    return ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#ff6b6b', '#4ecdc4', '#45b7d1'];
  };

  return (
    <div className="page-container">
      <div className="main">
        <section className="dashboard-main">
          {/* Revenue Composition Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Revenue Composition</h3>
              <div className="view-toggle">
                <button 
                  className={revenueView === 'subject' ? 'active' : ''} 
                  onClick={() => setRevenueView('subject')}
                >
                  By Subject
                </button>
                <button 
                  className={revenueView === 'instructor' ? 'active' : ''} 
                  onClick={() => setRevenueView('instructor')}
                >
                  By Instructor
                </button>
                <button 
                  className={revenueView === 'student' ? 'active' : ''} 
                  onClick={() => setRevenueView('student')}
                >
                  By Student
                </button>
              </div>
            </div>
            <div className="donut-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueComposition}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={(entry) => setSelectedSegment(entry)}
                  >
                    {revenueComposition.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        opacity={selectedSegment && selectedSegment.name !== entry.name ? 0.5 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <div className="center-content">
                  <p className="total-revenue">{formatCurrency(totalRevenue)}</p>
                  <p className="total-label">Total Revenue</p>
                </div>
              </div>
            </div>
            <div className="chart-legend">
              {revenueComposition.map((item, index) => (
                <div 
                  key={index} 
                  className={`legend-item ${selectedSegment && selectedSegment.name === item.name ? 'selected' : ''}`}
                  onClick={() => setSelectedSegment(item)}
                >
                  <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-amount">{formatCurrency(item.value)}</span>
                  <span className="legend-percentage">{formatPercentage(item.value, totalRevenue)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Monthly Revenue Trend</h3>
              <div className="view-toggle">
                <button 
                  className={trendView === 'subject' ? 'active' : ''} 
                  onClick={() => setTrendView('subject')}
                >
                  By Subject
                </button>
                <button 
                  className={trendView === 'instructor' ? 'active' : ''} 
                  onClick={() => setTrendView('instructor')}
                >
                  By Instructor
                </button>
                <button 
                  className={trendView === 'classType' ? 'active' : ''} 
                  onClick={() => setTrendView('classType')}
                >
                  By Class Type
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends[trendView]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                {trendView === 'subject' && (
                  <>
                    <Line type="monotone" dataKey="Mathematics" stroke="#8884d8" strokeWidth={3} />
                    <Line type="monotone" dataKey="Physics" stroke="#82ca9d" strokeWidth={3} />
                    <Line type="monotone" dataKey="Chemistry" stroke="#ffc658" strokeWidth={3} />
                    <Line type="monotone" dataKey="Biology" stroke="#ff7300" strokeWidth={3} />
                    <Line type="monotone" dataKey="English" stroke="#8dd1e1" strokeWidth={3} />
                  </>
                )}
                {trendView === 'instructor' && (
                  <>
                    <Line type="monotone" dataKey="Dr. Smith" stroke="#8884d8" strokeWidth={3} />
                    <Line type="monotone" dataKey="Prof. Johnson" stroke="#82ca9d" strokeWidth={3} />
                    <Line type="monotone" dataKey="Dr. Williams" stroke="#ffc658" strokeWidth={3} />
                    <Line type="monotone" dataKey="Prof. Brown" stroke="#ff7300" strokeWidth={3} />
                    <Line type="monotone" dataKey="Dr. Davis" stroke="#8dd1e1" strokeWidth={3} />
                  </>
                )}
                {trendView === 'classType' && (
                  <>
                    <Line type="monotone" dataKey="Private" stroke="#8884d8" strokeWidth={3} />
                    <Line type="monotone" dataKey="Group" stroke="#82ca9d" strokeWidth={3} />
                    <Line type="monotone" dataKey="Online" stroke="#ffc658" strokeWidth={3} />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Table */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Revenue Details</h3>
              <div className="table-controls">
                <input
                  type="text"
                  placeholder="Search students or instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <select 
                  value={dateFilter} 
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="date-filter-select"
                >
                  <option value="all">All Dates</option>
                  <option value="2024-06">June 2024</option>
                  <option value="2024-05">May 2024</option>
                  <option value="2024-04">April 2024</option>
                </select>
              </div>
            </div>
            <div className="table-container">
              <table className="revenue-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Subject</th>
                    <th>Instructor</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Class Type</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map(entry => (
                    <tr key={entry.id}>
                      <td>{entry.student}</td>
                      <td>{entry.subject}</td>
                      <td>{entry.instructor}</td>
                      <td>{formatCurrency(entry.amount)}</td>
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>
                        <span className={`class-type-badge ${entry.classType.toLowerCase()}`}>
                          {entry.classType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3"><strong>Total</strong></td>
                    <td><strong>{formatCurrency(tableTotal)}</strong></td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Top Earners Leaderboard */}
          <div className="leaderboard-section">
            <h3>Top Performers</h3>
            <div className="leaderboard-grid">
              <div className="leaderboard-card">
                <h4>Top Instructors by Revenue</h4>
                <div className="leaderboard-list">
                  {topInstructors.map((instructor, index) => (
                    <div key={index} className="leaderboard-item">
                      <div className="rank">#{index + 1}</div>
                      <div className="info">
                        <div className="name">{instructor.name}</div>
                        <div className="details">
                          <span className="amount">{formatCurrency(instructor.revenue)}</span>
                          <span className="percentage">{instructor.percentage}% of total</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="leaderboard-card">
                <h4>Top Subjects by Revenue</h4>
                <div className="leaderboard-list">
                  {topSubjects.map((subject, index) => (
                    <div key={index} className="leaderboard-item">
                      <div className="rank">#{index + 1}</div>
                      <div className="info">
                        <div className="name">{subject.name}</div>
                        <div className="details">
                          <span className="amount">{formatCurrency(subject.revenue)}</span>
                          <span className="percentage">{subject.percentage}% of total</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default IncomeBreakdown;
