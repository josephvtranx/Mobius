import pool from '../config/db.js';

const getStudentRoster = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      console.error('Authentication error: No user found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('Fetching student roster for user:', req.user.user_id);
    
    const query = `
      WITH student_classes AS (
        SELECT 
          cs.student_id,
          array_agg(DISTINCT cs.series_id) as series_ids
        FROM class_sessions cs
        WHERE cs.status != 'canceled'
        GROUP BY cs.student_id
      )
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        s.status,
        s.age,
        s.grade,
        s.gender,
        s.school,
        s.pa_code,
        COALESCE(array_remove(array_agg(DISTINCT g.name), NULL), ARRAY[]::text[]) as guardians,
        COALESCE(sc.series_ids, ARRAY[]::integer[]) as enrolled_classes
      FROM users u
      JOIN students s ON u.user_id = s.student_id
      LEFT JOIN student_guardian sg ON s.student_id = sg.student_id
      LEFT JOIN guardians g ON sg.guardian_id = g.guardian_id
      LEFT JOIN student_classes sc ON s.student_id = sc.student_id
      WHERE u.role = 'student' 
        AND u.is_active = true
      GROUP BY 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        s.status,
        s.age,
        s.grade,
        s.gender,
        s.school,
        s.pa_code,
        sc.series_ids;
    `;

    console.log('Executing query...');
    console.log('Database connection state:', pool.totalCount, 'total connections,', pool.idleCount, 'idle,', pool.waitingCount, 'waiting');
    
    const result = await pool.query(query);
    console.log('Query executed successfully. Number of results:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('No students found');
      return res.json([]);
    }
    
    // Transform the data to match the frontend structure
    const students = result.rows.map(student => {
      console.log('Processing student:', student.name, 'Email:', student.email);
      return {
        id: student.user_id,
        name: student.name,
        contact: student.email || '',
        phone: student.phone || '',
        status: student.status,
        age: student.age,
        grade: student.grade,
        gender: student.gender,
        school: student.school,
        paCode: student.pa_code,
        guardians: student.guardians || [],
        enrolledClasses: student.enrolled_classes || []
      };
    });

    console.log('Sending response with', students.length, 'students');
    res.json(students);
  } catch (error) {
    console.error('Error fetching student roster:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
      position: error.position,
      where: error.where,
      user: req.user ? { id: req.user.user_id, role: req.user.role } : 'No user'
    });
    
    // Handle specific database errors
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Duplicate entry found' });
    }
    if (error.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: 'Invalid reference data' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export {
  getStudentRoster
}; 