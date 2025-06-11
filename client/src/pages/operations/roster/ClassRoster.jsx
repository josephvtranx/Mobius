import React from 'react';

function ClassRoster() {
  const classes = [
    {
      code: 'M02',
      name: 'Advanced Mathematics',
      instructor: 'Ms. Smith',
      schedule: ['M', 'W', 'F'],
      time: '9:00 AM - 10:30 AM',
      capacity: 25,
      enrolled: 20,
      room: 'Room 201',
      status: 'Active'
    },
    {
      code: 'R10',
      name: 'Introduction to Physics',
      instructor: 'Mr. Johnson',
      schedule: ['T', 'T'],
      time: '11:00 AM - 12:30 PM',
      capacity: 30,
      enrolled: 28,
      room: 'Room 305',
      status: 'Active'
    },
    {
      code: 'W05',
      name: 'English Literature',
      instructor: 'Mrs. Lee',
      schedule: ['M', 'W'],
      time: '2:00 PM - 3:30 PM',
      capacity: 20,
      enrolled: 15,
      room: 'Room 102',
      status: 'Active'
    }
    // Add more classes as needed
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="main">
      <div className="main-class-roster">
        <h2>Class Roster</h2>
        <table>
          <thead>
            <tr>
              <th>Class Code</th>
              <th>Class Name</th>
              <th>Instructor</th>
              <th>Schedule</th>
              <th>Time</th>
              <th>Room</th>
              <th>Capacity</th>
              <th>Enrolled</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((classItem, index) => (
              <tr key={index}>
                <td>{classItem.code}</td>
                <td>{classItem.name}</td>
                <td>{classItem.instructor}</td>
                <td>
                  <div className="schedule">
                    {weekDays.map((day, idx) => (
                      <span
                        key={idx}
                        className={`day ${classItem.schedule.includes(day) ? 'filled' : ''}`}
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{classItem.time}</td>
                <td>{classItem.room}</td>
                <td>{classItem.capacity}</td>
                <td>{classItem.enrolled}</td>
                <td>
                  <span className={`status-pill ${classItem.status.toLowerCase()}`}>
                    {classItem.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClassRoster; 