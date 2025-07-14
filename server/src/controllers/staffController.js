const getStaffRoster = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      console.error('Authentication error: No user found in request');
      return res.status(401).json({ error: 'Authentication required' });
    }

    console.log('Fetching staff roster for user:', req.user.user_id);
    
    const query = `
      WITH recent_time_logs AS (
        SELECT 
          staff_id,
          json_agg(
            jsonb_build_object(
              'log_id', log_id,
              'clock_in', clock_in,
              'clock_out', clock_out,
              'notes', notes
            ) ORDER BY clock_in DESC
          ) FILTER (WHERE log_id IS NOT NULL) as recent_logs
        FROM time_logs
        GROUP BY staff_id
      )
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        s.department,
        s.employment_status,
        COALESCE(s.salary, 0) as salary,
        COALESCE(s.hourly_rate, 0) as hourly_rate,
        COALESCE(s.total_hours_worked, 0) as total_hours_worked,
        s.age,
        s.gender,
        COALESCE(rtl.recent_logs, '[]'::json) as time_logs
      FROM users u
      INNER JOIN staff s ON u.user_id = s.staff_id
      LEFT JOIN recent_time_logs rtl ON s.staff_id = rtl.staff_id
      WHERE u.role = 'staff' 
        AND u.is_active = true
      ORDER BY u.name;
    `;

    console.log('Executing query...');
    console.log('Database connection state:', req.db.totalCount, 'total connections,', req.db.idleCount, 'idle,', req.db.waitingCount, 'waiting');
    
    const result = await req.db.query(query);
    console.log('Query executed successfully. Number of results:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('No staff found');
      return res.json([]);
    }
    
    // Transform the data to match the frontend structure
    const staff = result.rows.map(member => {
      console.log('Processing staff member:', member.name, 'Email:', member.email);
      return {
        id: member.user_id,
        name: member.name,
        contact: member.email || '',
        phone: member.phone || '',
        department: member.department || '',
        employmentStatus: member.employment_status,
        salary: member.salary,
        hourlyRate: member.hourly_rate,
        totalHoursWorked: member.total_hours_worked,
        age: member.age || '',
        gender: member.gender || '',
        timeLogs: member.time_logs || []
      };
    });

    console.log('Sending response with', staff.length, 'staff members');
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff roster:', {
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
  getStaffRoster
}; 