import pool from '../config/db.js';

const getInstructorRoster = async (req, res) => {
  try {
    console.log('Fetching instructor roster...');
    
    const query = `
      SELECT 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        i.instructor_id,
        i.employment_type,
        i.salary,
        i.hourly_rate,
        i.age,
        i.gender,
        i.college_attended,
        i.major,
        COALESCE(
          (SELECT COUNT(*) FROM class_series cs WHERE cs.instructor_id = i.instructor_id AND cs.status IN ('confirmed', 'in_progress')),
          0
        ) as active_classes_count,
        ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as teaching_subjects,
        ARRAY_AGG(DISTINCT 
          CASE 
            WHEN cs.series_id IS NOT NULL THEN cs_subject.name
            WHEN css.session_id IS NOT NULL THEN css_subject.name
            ELSE NULL
          END
        ) FILTER (WHERE 
          (cs.series_id IS NOT NULL AND cs.status IN ('confirmed', 'in_progress')) OR
          (css.session_id IS NOT NULL AND css.status = 'scheduled')
        ) as active_class_names
      FROM users u
      JOIN instructors i ON u.user_id = i.instructor_id
      LEFT JOIN instructor_specialties ins ON i.instructor_id = ins.instructor_id
      LEFT JOIN subjects s ON ins.subject_id = s.subject_id
      LEFT JOIN class_series cs ON i.instructor_id = cs.instructor_id
      LEFT JOIN subjects cs_subject ON cs.subject_id = cs_subject.subject_id
      LEFT JOIN class_sessions css ON i.instructor_id = css.instructor_id
      LEFT JOIN subjects css_subject ON css.subject_id = css_subject.subject_id
      WHERE u.role = 'instructor' AND u.is_active = true
      GROUP BY 
        u.user_id,
        u.name,
        u.email,
        u.phone,
        i.instructor_id,
        i.employment_type,
        i.salary,
        i.hourly_rate,
        i.age,
        i.gender,
        i.college_attended,
        i.major
      ORDER BY u.name;
    `;

    console.log('Executing query...');
    const result = await pool.query(query);
    console.log('Query executed successfully. Number of results:', result.rows.length);
    
    // Transform the data to match the frontend structure
    const instructors = result.rows.map(instructor => {
      console.log('Processing instructor:', instructor.name, 'Employment type:', instructor.employment_type, 'Raw salary:', instructor.salary, 'Raw hourly_rate:', instructor.hourly_rate);
      return {
        id: instructor.user_id,
        name: instructor.name,
        email: instructor.email,
        phone: instructor.phone,
        employmentType: instructor.employment_type,
        salary: instructor.salary || 0,
        hourlyRate: instructor.hourly_rate || 0,
        age: instructor.age,
        gender: instructor.gender,
        college: instructor.college_attended,
        major: instructor.major,
        activeClasses: instructor.active_classes_count,
        activeClassNames: instructor.active_class_names || [],
        availabilitySlots: instructor.availability_slots,
        teachingSubjects: instructor.teaching_subjects || []
      };
    });

    console.log('Sending response with', instructors.length, 'instructors');
    console.log('Sample instructor data:', instructors[0]);
    res.json(instructors);
  } catch (error) {
    console.error('Error fetching instructor roster:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

const updateInstructor = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      employmentType, 
      salary, 
      hourlyRate, 
      subjectAssignments 
    } = req.body;

    console.log('Updating instructor:', id, 'with data:', req.body);

    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Update instructor employment details
      const updateQuery = `
        UPDATE instructors 
        SET 
          employment_type = $1,
          salary = $2,
          hourly_rate = $3
        WHERE instructor_id = $4
        RETURNING *
      `;
      
      const updateResult = await client.query(updateQuery, [
        employmentType, 
        salary || null, 
        hourlyRate || null, 
        id
      ]);

      if (updateResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Instructor not found' });
      }

      // Clear existing subject specialties
      await client.query(
        'DELETE FROM instructor_specialties WHERE instructor_id = $1',
        [id]
      );

      // Add new subject assignments if provided
      if (subjectAssignments && subjectAssignments.length > 0) {
        for (const assignment of subjectAssignments) {
          if (assignment.groupId && assignment.subjectIds && assignment.subjectIds.length > 0) {
            // Insert subject specialties for each selected subject
            for (const subjectId of assignment.subjectIds) {
              await client.query(
                'INSERT INTO instructor_specialties (instructor_id, subject_id) VALUES ($1, $2)',
                [id, subjectId]
              );
            }
          }
        }
      }

      await client.query('COMMIT');

      // Fetch updated instructor data
      const updatedInstructor = await client.query(`
        SELECT 
          u.user_id,
          u.name,
          u.email,
          u.phone,
          i.employment_type,
          i.salary,
          i.hourly_rate,
          ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL) as teaching_subjects
        FROM users u
        JOIN instructors i ON u.user_id = i.instructor_id
        LEFT JOIN instructor_specialties ins ON i.instructor_id = ins.instructor_id
        LEFT JOIN subjects s ON ins.subject_id = s.subject_id
        WHERE i.instructor_id = $1
        GROUP BY u.user_id, u.name, u.email, u.phone, i.employment_type, i.salary, i.hourly_rate
      `, [id]);

      res.json({
        message: 'Instructor updated successfully',
        instructor: {
          id: updatedInstructor.rows[0].user_id,
          name: updatedInstructor.rows[0].name,
          email: updatedInstructor.rows[0].email,
          phone: updatedInstructor.rows[0].phone,
          employmentType: updatedInstructor.rows[0].employment_type,
          salary: updatedInstructor.rows[0].salary,
          hourlyRate: updatedInstructor.rows[0].hourly_rate,
          teachingSubjects: updatedInstructor.rows[0].teaching_subjects || []
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error updating instructor:', error);
    res.status(500).json({ 
      error: 'Failed to update instructor',
      details: error.message 
    });
  }
};

export {
  getInstructorRoster,
  updateInstructor
}; 