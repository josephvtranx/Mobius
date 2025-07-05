import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SummaryCard from '../../../components/SummaryCard';
import '../../../css/FinancialDashboard.css';

function Overview() {
  const [timeFilter, setTimeFilter] = useState('month');

  // Mock data for summary tiles
  const summaryTilesData = [
    {
      title: "Total Students",
      value: 259,
      year: "2024",
      percentChange: 8.2,
      isPositive: true,
      lineColor: "#3b82f6",
      chartData: [
        { value: 220 }, { value: 225 }, { value: 230 }, { value: 235 },
        { value: 240 }, { value: 245 }, { value: 250 }, { value: 252 },
        { value: 255 }, { value: 257 }, { value: 258 }, { value: 259 }
      ]
    },
    {
      title: "Total Sessions",
      value: 14000,
      year: "2024",
      percentChange: 12.5,
      isPositive: true,
      lineColor: "#10b981",
      chartData: [
        { value: 1100 }, { value: 1150 }, { value: 1200 }, { value: 1250 },
        { value: 1300 }, { value: 1350 }, { value: 1400 }, { value: 1450 },
        { value: 1500 }, { value: 1550 }, { value: 1600 }, { value: 1650 }
      ]
    },
    {
      title: "Total Refunds",
      value: 12000,
      year: "2024",
      percentChange: -5.3,
      isPositive: false,
      lineColor: "#ef4444",
      chartData: [
        { value: 1500 }, { value: 1400 }, { value: 1300 }, { value: 1200 },
        { value: 1100 }, { value: 1000 }, { value: 900 }, { value: 800 },
        { value: 700 }, { value: 600 }, { value: 500 }, { value: 400 }
      ]
    }
  ];

  // Revenue vs Expenses data
  const financialData = [
    { month: 'Jan', revenue: 45000, expenses: 32000, netProfit: 13000 },
    { month: 'Feb', revenue: 52000, expenses: 35000, netProfit: 17000 },
    { month: 'Mar', revenue: 48000, expenses: 33000, netProfit: 15000 },
    { month: 'Apr', revenue: 55000, expenses: 38000, netProfit: 17000 },
    { month: 'May', revenue: 58000, expenses: 40000, netProfit: 18000 },
    { month: 'Jun', revenue: 62000, expenses: 42000, netProfit: 20000 },
    { month: 'Jul', revenue: 59000, expenses: 41000, netProfit: 18000 },
    { month: 'Aug', revenue: 65000, expenses: 44000, netProfit: 21000 },
    { month: 'Sep', revenue: 68000, expenses: 46000, netProfit: 22000 },
    { month: 'Oct', revenue: 72000, expenses: 48000, netProfit: 24000 },
    { month: 'Nov', revenue: 75000, expenses: 50000, netProfit: 25000 },
    { month: 'Dec', revenue: 80000, expenses: 52000, netProfit: 28000 }
  ];

  // Profitability summary data
  const profitabilityData = {
    ytdRevenue: 750000,
    ytdExpenses: 500000,
    netProfit: 250000,
    profitMargin: 33.3,
    currentMonthRevenue: 80000,
    currentMonthExpenses: 52000,
    currentMonthProfit: 28000
  };

  // Forecast readiness data
  const forecastData = {
    completionPercentage: 75,
    missingFields: ['Instructor Payouts', 'Expense Logs'],
    uploadedCategories: ['Revenue per Subject', 'Student Payments', 'Basic Expenses']
  };

  // Retention data
  const retentionData = {
    studentRetentionRate: 92.5,
    attendanceRate: 88.3,
    dropoutRate: 7.5,
    dropoutThreshold: 10
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (isPositive) => {
    return isPositive ? '↗' : '↘';
  };

  const getTrendColor = (isPositive) => {
    return isPositive ? '#10b981' : '#ef4444';
  };

  return (
    <div className="page-container">
      <div className="main">
        <section className="dashboard-main">
          {/* Summary Tiles */}
          <div className="summary-cards">
            {summaryTilesData.map((card, index) => (
              <SummaryCard
                key={index}
                title={card.title}
                value={card.value}
                year={card.year}
                percentChange={card.percentChange}
                isPositive={card.isPositive}
                chartData={card.chartData}
                lineColor={card.lineColor}
              />
            ))}
          </div>

          {/* Revenue vs Expenses Chart */}
          <div className="chart-container">
            <div className="chart-header">
              <h3>Revenue vs Expenses</h3>
              <div className="time-filter">
                <button 
                  className={timeFilter === 'month' ? 'active' : ''} 
                  onClick={() => setTimeFilter('month')}
                >
                  Month
                </button>
                <button 
                  className={timeFilter === 'quarter' ? 'active' : ''} 
                  onClick={() => setTimeFilter('quarter')}
                >
                  Quarter
                </button>
                <button 
                  className={timeFilter === 'year' ? 'active' : ''} 
                  onClick={() => setTimeFilter('year')}
                >
                  Year
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  name="Expenses"
                />
                <Line 
                  type="monotone" 
                  dataKey="netProfit" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Net Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Profitability Summary Cards */}
          <div className="profitability-section">
            <h3>Profitability Summary</h3>
            <div className="profitability-cards">
              <div className="profitability-card">
                <div className="card-header">
                  <h4>YTD Revenue</h4>
                  <span className="trend-icon" style={{ color: getTrendColor(true) }}>
                    {getTrendIcon(true)}
                  </span>
                </div>
                <div className="card-value">{formatCurrency(profitabilityData.ytdRevenue)}</div>
                <div className="card-subtitle">
                  Current Month: {formatCurrency(profitabilityData.currentMonthRevenue)}
                </div>
              </div>

              <div className="profitability-card">
                <div className="card-header">
                  <h4>YTD Expenses</h4>
                  <span className="trend-icon" style={{ color: getTrendColor(false) }}>
                    {getTrendIcon(false)}
                  </span>
                </div>
                <div className="card-value">{formatCurrency(profitabilityData.ytdExpenses)}</div>
                <div className="card-subtitle">
                  Current Month: {formatCurrency(profitabilityData.currentMonthExpenses)}
                </div>
              </div>

              <div className="profitability-card">
                <div className="card-header">
                  <h4>Net Profit</h4>
                  <span className="trend-icon" style={{ color: getTrendColor(true) }}>
                    {getTrendIcon(true)}
                  </span>
                </div>
                <div className="card-value">{formatCurrency(profitabilityData.netProfit)}</div>
                <div className="card-subtitle">
                  Current Month: {formatCurrency(profitabilityData.currentMonthProfit)}
                </div>
              </div>

              <div className="profitability-card">
                <div className="card-header">
                  <h4>Profit Margin</h4>
                  <span className="trend-icon" style={{ color: getTrendColor(true) }}>
                    {getTrendIcon(true)}
                  </span>
                </div>
                <div className="card-value">{formatPercentage(profitabilityData.profitMargin)}</div>
                <div className="card-subtitle">
                  Target: 30%
                </div>
              </div>
            </div>
          </div>

          {/* Forecast Readiness */}
          <div className="forecast-section">
            <h3>Forecast Readiness</h3>
            <div className="forecast-content">
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${forecastData.completionPercentage}%` }}
                  ></div>
                </div>
                <span className="progress-text">{forecastData.completionPercentage}% Complete</span>
              </div>
              
              <div className="data-categories">
                <div className="uploaded-categories">
                  <h4> Uploaded Categories</h4>
                  <ul>
                    {forecastData.uploadedCategories.map((category, index) => (
                      <li key={index}>{category}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="missing-categories">
                  <h4> Missing Categories</h4>
                  <ul>
                    {forecastData.missingFields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Retention Snapshot */}
          <div className="retention-section">
            <h3>Retention Snapshot</h3>
            <div className="retention-cards">
              <div className="retention-card">
                <h4>Student Retention Rate</h4>
                <div className="retention-value">{formatPercentage(retentionData.studentRetentionRate)}</div>
                <div className="retention-subtitle">Students staying enrolled</div>
              </div>

              <div className="retention-card">
                <h4>Attendance Rate</h4>
                <div className="retention-value">{formatPercentage(retentionData.attendanceRate)}</div>
                <div className="retention-subtitle">Across all sessions</div>
              </div>

              <div className={`retention-card ${retentionData.dropoutRate > retentionData.dropoutThreshold ? 'alert' : ''}`}>
                <h4>Dropout Rate</h4>
                <div className="retention-value">{formatPercentage(retentionData.dropoutRate)}</div>
                <div className="retention-subtitle">
                  {retentionData.dropoutRate > retentionData.dropoutThreshold 
                    ? ' Above threshold - Action needed' 
                    : 'Within acceptable range'
                  }
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Overview;
