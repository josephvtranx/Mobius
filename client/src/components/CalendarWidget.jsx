// src/components/CalendarWidget.jsx
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../css/CalendarWidget.css'; 

function CalendarWidget() {

  const [date, setDate] = useState(new Date());

  return (
    <div className="calendar-widget">
      <div className="calendar-header">
        <span>{date.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
      </div>
      <Calendar
        onChange={setDate}
        value={date}
        className="calendar-core"
        calendarType="gregory"
      />
    </div>
  );
}

export default CalendarWidget;
