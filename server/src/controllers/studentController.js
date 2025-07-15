export const getStudentRoster = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      console.error('Authentication error: No user found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('Fetching student roster for user:', req.user.user_id);
    
    const query = `
      WITH student_instructors AS (
        SELECT 
          cs.student_id,
          ARRAY_AGG(DISTINCT u.name) as instructor_names
        FROM class_series cs
        JOIN instructors i ON cs.instructor_id = i.instructor_id
        JOIN users u ON i.instructor_id = u.user_id
        GROUP BY cs.student_id
      ),
      student_classes AS (
        SELECT 
          cs.student_id,
          ARRAY_AGG(DISTINCT sub.name) as class_names,
          ARRAY_AGG(
            json_build_object(
              'days', cs.days_of_week,
              'session_start', cs.session_start,
              'session_end', cs.session_end,
              'subject_name', sub.name
            )
          ) as schedule
        FROM class_series cs
        JOIN subjects sub ON cs.subject_id = sub.subject_id
        WHERE cs.status != 'canceled'
        GROUP BY cs.student_id
      ),
      student_guardians AS (
        SELECT 
          sg.student_id,
          json_agg(
            json_build_object(
              'name', g.name,
              'email', g.email,
              'phone', g.phone
            ) ORDER BY g.name
          ) as guardian_data
        FROM student_guardian sg
        JOIN guardians g ON sg.guardian_id = g.guardian_id
        GROUP BY sg.student_id
      )
      SELECT 
        u.user_id as id,
        u.name,
        u.email as student_email,
        u.phone as student_phone,
        COALESCE(
          ARRAY(
            SELECT (guardian->>'name')::text 
            FROM json_array_elements(sg.guardian_data) AS guardian
          ), 
          ARRAY[]::text[]
        ) as parent_names,
        COALESCE(
          ARRAY(
            SELECT (guardian->>'email')::text 
            FROM json_array_elements(sg.guardian_data) AS guardian
          ), 
          ARRAY[]::text[]
        ) as parent_emails,
        COALESCE(
          ARRAY(
            SELECT (guardian->>'phone')::text 
            FROM json_array_elements(sg.guardian_data) AS guardian
          ), 
          ARRAY[]::text[]
        ) as parent_phones,
        s.status,
        COALESCE(si.instructor_names, ARRAY[]::text[]) as instructors,
        COALESCE(sc.class_names, ARRAY[]::text[]) as enrolled_classes,
        COALESCE(sc.schedule, ARRAY[]::json[]) as schedule
      FROM users u
      JOIN students s ON u.user_id = s.student_id
      LEFT JOIN student_guardians sg ON s.student_id = sg.student_id
      LEFT JOIN student_instructors si ON s.student_id = si.student_id
      LEFT JOIN student_classes sc ON s.student_id = sc.student_id
      WHERE u.role = 'student'
        AND u.is_active = true
      ORDER BY u.name;
    `;

    console.log('Executing query...');
    console.log('Database connection state:', req.db.totalCount, 'total connections,', req.db.idleCount, 'idle,', req.db.waitingCount, 'waiting');
    
    const result = await req.db.query(query);
    console.log('Query executed successfully. Number of results:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('No students found');
      return res.json([]);
    }
    
    // Process the results to handle arrays and null values
    const students = result.rows.map(student => ({
      id: student.id,
      name: student.name,
      studentEmail: student.student_email || '',
      studentPhone: student.student_phone || '',
      parentNames: student.parent_names || [],
      parentEmails: student.parent_emails || [],
      parentPhones: student.parent_phones || [],
      status: student.status || '',
      instructors: student.instructors || [],
      enrolledClasses: student.enrolled_classes || [],
      schedule: (student.schedule || []).map(s => {
        // s.days is an array of days, join as comma string for display
        return {
          days: Array.isArray(s.days) ? s.days.join(', ') : s.days,
          session_start: s.session_start,
          session_end: s.session_end,
          subject_name: s.subject_name
        };
      })
    }));

    console.log('Sample student data:', students[0]);
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