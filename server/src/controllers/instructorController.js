const pool = require('../db/db');

const getInstructorRoster = async (req, res) => {
  try {
    console.log('Fetching instructor roster...');
    
    const query = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        s.hourly_rate,
        s.total_hours_worked,
        s.salary as monthly_salary,
        i.age,
        i.gender,
        i.college_attended,
        i.major,
        array_agg(DISTINCT cs.series_id) as class_series,
        array_agg(DISTINCT ia.day_of_week) as availability
      FROM users u
      JOIN instructors i ON u.user_id = i.instructor_id
      LEFT JOIN staff s ON u.user_id = s.staff_id
      LEFT JOIN instructor_availability ia ON i.instructor_id = ia.instructor_id
      LEFT JOIN class_series cs ON i.instructor_id = cs.instructor_id
      WHERE u.role = 'instructor' AND u.is_active = true
      GROUP BY 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        s.hourly_rate,
        s.total_hours_worked,
        s.salary,
        i.age,
        i.gender,
        i.college_attended,
        i.major;
    `;

    console.log('Executing query...');
    const result = await pool.query(query);
    console.log('Query executed successfully. Number of results:', result.rows.length);
    
    // Transform the data to match the frontend structure
    const instructors = result.rows.map(instructor => {
      console.log('Processing instructor:', instructor.name, 'Email:', instructor.email);
      return {
        id: instructor.user_id,
        name: instructor.name,
        contact: instructor.email, // Use email as the primary contact
        phone: instructor.phone || 'No phone number',
        hourlyRate: instructor.hourly_rate || 0,
        totalHours: instructor.total_hours_worked || 0,
        monthlySalary: instructor.monthly_salary || 0,
        age: instructor.age,
        gender: instructor.gender,
        college: instructor.college_attended,
        major: instructor.major,
        classes: instructor.class_series || [],
        schedule: instructor.availability || []
      };
    });

    console.log('Sending response with', instructors.length, 'instructors');
    res.json(instructors);
  } catch (error) {
    console.error('Error fetching instructor roster:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

module.exports = {
  getInstructorRoster
}; 