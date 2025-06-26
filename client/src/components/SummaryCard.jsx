import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const SummaryCard = ({ 
  title, 
  value, 
  year, 
  percentChange, 
  isPositive, 
  chartData, 
  lineColor 
}) => {
  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `$${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `$${(val / 1000).toFixed(0)}k`;
      } else {
        return val.toString();
      }
    }
    return val;
  };

  return (
    <div className="summary-card">
      <div className="card-content">
        <div className="card-header">
          <span className="card-year">{year}</span>
        </div>
        
        <div className="card-main">
          <h3 className="card-title">{title}</h3>
          <p className="card-value">{formatValue(value)}</p>
          
          <div className={`card-trend ${isPositive ? 'positive' : 'negative'}`}>
            <span className="trend-arrow">
              {isPositive ? '↗' : '↘'}
            </span>
            <span className="trend-percentage">
              {isPositive ? '+' : ''}{percentChange}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="card-sparkline">
        <ResponsiveContainer width="100%" height={60}>
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={2}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SummaryCard; 