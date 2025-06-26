import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import '../../../css/FinancialDashboard.css';

function CostBreakdown() {
  const [timeView, setTimeView] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('totalPay');

  // Mock data for expense categories
  const expenseCategories = [
    { name: 'Instructor Salaries', value: 12000, color: '#8884d8' },
    { name: 'Staff Payroll', value: 4500, color: '#82ca9d' },
    { name: 'Materials', value: 2500, color: '#ffc658' },
    { name: 'Marketing', value: 1800, color: '#ff7300' },
    { name: 'Rent', value: 2000, color: '#8dd1e1' },
    { name: 'Miscellaneous', value: 950, color: '#ff6b6b' }
  ];

  // Mock data for expenses over time
  const expensesOverTime = {
    monthly: [
      { month: 'Jan', 'Instructor Salaries': 11000, 'Staff Payroll': 4200, 'Materials': 2300, 'Marketing': 1700, 'Rent': 2000, 'Miscellaneous': 800 },
      { month: 'Feb', 'Instructor Salaries': 11500, 'Staff Payroll': 4300, 'Materials': 2400, 'Marketing': 1750, 'Rent': 2000, 'Miscellaneous': 850 },
      { month: 'Mar', 'Instructor Salaries': 11800, 'Staff Payroll': 4400, 'Materials': 2450, 'Marketing': 1800, 'Rent': 2000, 'Miscellaneous': 900 },
      { month: 'Apr', 'Instructor Salaries': 12000, 'Staff Payroll': 4500, 'Materials': 2500, 'Marketing': 1800, 'Rent': 2000, 'Miscellaneous': 950 },
      { month: 'May', 'Instructor Salaries': 12200, 'Staff Payroll': 4600, 'Materials': 2550, 'Marketing': 1850, 'Rent': 2000, 'Miscellaneous': 1000 },
      { month: 'Jun', 'Instructor Salaries': 12500, 'Staff Payroll': 4700, 'Materials': 2600, 'Marketing': 1900, 'Rent': 2000, 'Miscellaneous': 1050 }
    ],
    quarterly: [
      { quarter: 'Q1', 'Instructor Salaries': 34300, 'Staff Payroll': 12900, 'Materials': 7150, 'Marketing': 5250, 'Rent': 6000, 'Miscellaneous': 2550 },
      { quarter: 'Q2', 'Instructor Salaries': 36700, 'Staff Payroll': 13800, 'Materials': 7650, 'Marketing': 5550, 'Rent': 6000, 'Miscellaneous': 3000 }
    ]
  };

  // Mock data for payroll summary
  const payrollData = [
    { id: 1, name: 'Dr. Sarah Smith', role: 'Instructor', hoursWorked: 120, payType: 'Hourly', hourlyRate: 45, totalPay: 5400 },
    { id: 2, name: 'Prof. Michael Johnson', role: 'Instructor', hoursWorked: 110, payType: 'Hourly', hourlyRate: 42, totalPay: 4620 },
    { id: 3, name: 'Dr. Emily Davis', role: 'Instructor', hoursWorked: 95, payType: 'Hourly', hourlyRate: 40, totalPay: 3800 },
    { id: 4, name: 'Lisa Chen', role: 'Staff', hoursWorked: 160, payType: 'Hourly', hourlyRate: 18, totalPay: 2880 },
    { id: 5, name: 'Robert Wilson', role: 'Staff', hoursWorked: 160, payType: 'Hourly', hourlyRate: 16, totalPay: 2560 },
    { id: 6, name: 'Maria Garcia', role: 'Staff', hoursWorked: 140, payType: 'Hourly', hourlyRate: 17, totalPay: 2380 }
  ];

  // Mock data for cost per class breakdown
  const costPerClass = [
    { subject: 'Mathematics', avgCost: 85, instructor: 'Dr. Smith', sessions: 45 },
    { subject: 'Physics', avgCost: 78, instructor: 'Prof. Johnson', sessions: 38 },
    { subject: 'Chemistry', avgCost: 72, instructor: 'Dr. Davis', sessions: 42 },
    { subject: 'Biology', avgCost: 68, instructor: 'Prof. Brown', sessions: 35 },
    { subject: 'English', avgCost: 65, instructor: 'Dr. Wilson', sessions: 28 }
  ];

  // Mock data for expense trend summary
  const expenseSummary = {
    totalPayroll: 21640,
    ytdExpenses: 142500,
    avgCostPerSession: 73.8,
    revenueSpentPercentage: 68.5
  };

  const totalExpenses = expenseCategories.reduce((sum, item) => sum + item.value, 0);

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

  const sortedPayrollData = [...payrollData].sort((a, b) => {
    if (sortBy === 'totalPay') return b.totalPay - a.totalPay;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'role') return a.role.localeCompare(b.role);
    return 0;
  });

  const getRevenueSpentColor = (percentage) => {
    if (percentage > 80) return '#ef4444'; // Red
    if (percentage > 70) return '#f59e0b'; // Yellow
    return '#10b981'; // Green
  };

  const getRevenueSpentStatus = (percentage) => {
    if (percentage > 80) return 'High';
    if (percentage > 70) return 'Moderate';
    return 'Good';
  };

  return (
    <div className="page-container">
      <div className="main">
        <section className="dashboard-main">
          {/* Expense Categories Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Expense Categories</h3>
            </div>
            <div className="donut-chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={(entry) => setSelectedCategory(entry)}
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        opacity={selectedCategory && selectedCategory.name !== entry.name ? 0.5 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <div className="center-content">
                  <p className="total-expenses">{formatCurrency(totalExpenses)}</p>
                  <p className="total-label">Total Expenses</p>
                </div>
              </div>
            </div>
            <div className="chart-legend">
              {expenseCategories.map((item, index) => (
                <div 
                  key={index} 
                  className={`legend-item ${selectedCategory && selectedCategory.name === item.name ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(item)}
                >
                  <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-amount">{formatCurrency(item.value)}</span>
                  <span className="legend-percentage">{formatPercentage(item.value, totalExpenses)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses Over Time Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Expenses Over Time</h3>
              <div className="view-toggle">
                <button 
                  className={timeView === 'monthly' ? 'active' : ''} 
                  onClick={() => setTimeView('monthly')}
                >
                  Monthly
                </button>
                <button 
                  className={timeView === 'quarterly' ? 'active' : ''} 
                  onClick={() => setTimeView('quarterly')}
                >
                  Quarterly
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expensesOverTime[timeView]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={timeView === 'monthly' ? 'month' : 'quarter'} />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Legend />
                <Bar dataKey="Instructor Salaries" stackId="a" fill="#8884d8" />
                <Bar dataKey="Staff Payroll" stackId="a" fill="#82ca9d" />
                <Bar dataKey="Materials" stackId="a" fill="#ffc658" />
                <Bar dataKey="Marketing" stackId="a" fill="#ff7300" />
                <Bar dataKey="Rent" stackId="a" fill="#8dd1e1" />
                <Bar dataKey="Miscellaneous" stackId="a" fill="#ff6b6b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Trend Summary Cards */}
          <div className="expense-summary-section">
            <h3>Expense Summary</h3>
            <div className="expense-summary-cards">
              <div className="expense-summary-card">
                <div className="card-header">
                  <h4>Total Payroll This Month</h4>
                </div>
                <div className="card-value">{formatCurrency(expenseSummary.totalPayroll)}</div>
                <div className="card-subtitle">All instructors and staff</div>
              </div>

              <div className="expense-summary-card">
                <div className="card-header">
                  <h4>YTD Expenses</h4>
                </div>
                <div className="card-value">{formatCurrency(expenseSummary.ytdExpenses)}</div>
                <div className="card-subtitle">Year to date total</div>
              </div>

              <div className="expense-summary-card">
                <div className="card-header">
                  <h4>Avg Cost per Session</h4>
                </div>
                <div className="card-value">{formatCurrency(expenseSummary.avgCostPerSession)}</div>
                <div className="card-subtitle">Across all subjects</div>
              </div>

              <div className="expense-summary-card">
                <div className="card-header">
                  <h4>% of Revenue Spent</h4>
                </div>
                <div 
                  className="card-value" 
                  style={{ color: getRevenueSpentColor(expenseSummary.revenueSpentPercentage) }}
                >
                  {expenseSummary.revenueSpentPercentage}%
                </div>
                <div className="card-subtitle">
                  Status: {getRevenueSpentStatus(expenseSummary.revenueSpentPercentage)}
                </div>
              </div>
            </div>
          </div>

          {/* Payroll Summary Table */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Payroll Summary</h3>
              <div className="table-controls">
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="totalPay">Sort by Total Pay</option>
                  <option value="name">Sort by Name</option>
                  <option value="role">Sort by Role</option>
                </select>
              </div>
            </div>
            <div className="table-container">
              <table className="payroll-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Hours Worked</th>
                    <th>Pay Type</th>
                    <th>Hourly Rate</th>
                    <th>Total Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPayrollData.map(employee => (
                    <tr key={employee.id}>
                      <td>{employee.name}</td>
                      <td>
                        <span className={`role-badge ${employee.role.toLowerCase()}`}>
                          {employee.role}
                        </span>
                      </td>
                      <td>{employee.hoursWorked}</td>
                      <td>{employee.payType}</td>
                      <td>{formatCurrency(employee.hourlyRate)}</td>
                      <td>{formatCurrency(employee.totalPay)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5"><strong>Total Payroll</strong></td>
                    <td><strong>{formatCurrency(sortedPayrollData.reduce((sum, emp) => sum + emp.totalPay, 0))}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Cost per Class Breakdown */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Cost per Class Breakdown</h3>
            </div>
            <div className="cost-per-class-container">
              {costPerClass.map((item, index) => (
                <div key={index} className="cost-per-class-item">
                  <div className="class-info">
                    <div className="subject-name">{item.subject}</div>
                    <div className="instructor-name">{item.instructor}</div>
                    <div className="session-count">{item.sessions} sessions</div>
                  </div>
                  <div className="cost-bar-container">
                    <div 
                      className="cost-bar" 
                      style={{ 
                        width: `${(item.avgCost / Math.max(...costPerClass.map(c => c.avgCost))) * 100}%`,
                        backgroundColor: item.avgCost > 80 ? '#ef4444' : item.avgCost > 70 ? '#f59e0b' : '#10b981'
                      }}
                    ></div>
                    <span className="cost-amount">{formatCurrency(item.avgCost)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default CostBreakdown;
