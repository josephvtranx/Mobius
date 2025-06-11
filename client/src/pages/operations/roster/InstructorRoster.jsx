import React from 'react';

function InstructorRoster() {
  const instructors = [
    {
      name: 'Ms. Smith',
      contact: 'ms.smith@example.com',
      hourlyRate: 50,
      totalHours: 160,
      monthlySalary: 8000,
      classes: ['M02', 'R10'],
      schedule: ['S', 'M', 'T', 'W', 'T', 'F']
    },
    {
      name: 'Mr. Johnson',
      contact: 'mr.johnson@example.com',
      hourlyRate: 45,
      totalHours: 140,
      monthlySalary: 6300,
      classes: ['W05', 'R11', 'T07'],
      schedule: ['T', 'T']
    },
    {
      name: 'Mrs. Lee',
      contact: 'mrs.lee@example.com',
      hourlyRate: 55,
      totalHours: 170,
      monthlySalary: 9350,
      classes: ['M01', 'T08', 'R15', 'W09'],
      schedule: ['M', 'T', 'W', 'T']
    }
    // Add more instructors as needed
  ];

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="main">
      <div className="main-student-roster">
        <h2>Instructor Roster</h2>
        <table>
          <thead>
            <tr>
              <th>Instructor Name</th>
              <th>Instructor Contact</th>
              <th>Hourly Rate</th>
              <th>Total Hours</th>
              <th>Monthly Salary</th>
              <th>Classes Teaching</th>
              <th>Schedule</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((instructor, index) => (
              <tr key={index}>
                <td>{instructor.name}</td>
                <td>{instructor.contact}</td>
                <td>${instructor.hourlyRate}</td>
                <td>{instructor.totalHours}</td>
                <td>${instructor.monthlySalary.toLocaleString()}</td>
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
