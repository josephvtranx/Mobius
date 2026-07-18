export const getStudentRoster = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      console.error('Authentication error: No user found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('Fetching student roster for user:', req.user.user_id);
    
    const query = `
      -- schema v2 (2026-07-17): enrollments/classes/guardian-logins replace
      -- the dropped class_series / guardian contact-blob model
      SELECT
        u.user_id AS id,
        u.name,
        u.email AS student_email,
        u.phone AS student_phone,
        s.status,
        COALESCE(g.names, ARRAY[]::text[]) AS parent_names,
        COALESCE(g.emails, ARRAY[]::text[]) AS parent_emails,
        COALESCE(g.phones, ARRAY[]::text[]) AS parent_phones,
        COALESCE(i.names, ARRAY[]::text[]) AS instructors,
        COALESCE(c.names, ARRAY[]::text[]) AS enrolled_classes,
        COALESCE(c.schedule, '[]'::json) AS schedule
      FROM users u
      JOIN students s ON u.user_id = s.student_id
      LEFT JOIN LATERAL (
        SELECT ARRAY_AGG(gu.name ORDER BY gu.name) AS names,
               ARRAY_AGG(gu.email::text ORDER BY gu.name) AS emails,
               ARRAY_AGG(gu.phone ORDER BY gu.name) AS phones
          FROM student_guardians sg
          JOIN guardians gg ON gg.guardian_id = sg.guardian_id
          JOIN users gu ON gu.user_id = gg.user_id
         WHERE sg.student_id = s.student_id
      ) g ON true
      LEFT JOIN LATERAL (
        SELECT ARRAY_AGG(DISTINCT iu.name) AS names
          FROM enrollments e
          JOIN classes c2 ON c2.class_id = e.class_id
          JOIN users iu ON iu.user_id = c2.instructor_id
         WHERE e.student_id = s.student_id AND e.status = 'active'
      ) i ON true
      LEFT JOIN LATERAL (
        SELECT ARRAY_AGG(DISTINCT sub.name) AS names,
               json_agg(json_build_object(
                 'subject_name', sub.name,
                 'days', (SELECT ARRAY_AGG(b->>'day')
                            FROM jsonb_array_elements(c2.recurrence_rule->'byday') b),
                 'start_time', c2.recurrence_rule->'byday'->0->>'start',
                 'end_time', c2.recurrence_rule->'byday'->0->>'end',
                 'start_date', c2.starts_on,
                 'end_date', c2.ends_on
               )) AS schedule
          FROM enrollments e
          JOIN classes c2 ON c2.class_id = e.class_id AND c2.status = 'active'
          JOIN subjects sub ON sub.subject_id = c2.subject_id
         WHERE e.student_id = s.student_id AND e.status = 'active'
      ) c ON true
      WHERE u.role = 'student' AND u.is_active = true
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
          start_date: s.start_date,
          end_date: s.end_date,
          start_time: s.start_time,
          end_time: s.end_time,
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