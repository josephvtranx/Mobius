import pool from '../config/db.js';

// Classroom Conflict Check
const checkClassroomConflict = async (classroom_id, start_time, end_time, date, class_id = null) => {
    const query = `
        SELECT * 
        FROM classes
        WHERE classroom_id = $1
          AND DATE(start_time) = $2
          AND (
              (start_time, end_time) OVERLAPS ($3::timestamp, $4::timestamp)
          )
          ${class_id ? 'AND id != $5' : ''}
    `;

    const values = class_id
        ? [classroom_id, date, start_time, end_time, class_id]
        : [classroom_id, date, start_time, end_time];

    try {
        const result = await pool.query(query, values);
        return result.rowCount > 0; // True if conflict exists
    } catch (error) {
        console.error("Error in checkClassroomConflict:", error);
        throw new Error("Failed to check classroom conflicts");
    }
};


// Instructor Conflict Check
const checkInstructorConflict = async (instructor_ids, start_time, end_time, date) => {
    const query = `
        SELECT DISTINCT c.id
        FROM classes c
        JOIN class_instructors ci ON ci.class_id = c.id
        WHERE ci.instructor_id = ANY($1::int[])
          AND DATE(c.start_time) = $2
          AND (
              (c.start_time, c.end_time) OVERLAPS ($3::timestamp, $4::timestamp)
          )
    `;

    const values = [instructor_ids, date, start_time, end_time];

    try {
        console.log("Running checkInstructorConflict:");
        console.log("Instructor IDs:", instructor_ids);
        console.log("Date:", date);
        console.log("Start Time:", start_time);
        console.log("End Time:", end_time);
        console.log("Query:", query);
        console.log("Values:", values);

        const result = await pool.query(query, values);

        console.log("Conflicting Classes:", result.rows);

        return result.rowCount > 0; // True if conflicts exist
    } catch (error) {
        console.error("Error in checkInstructorConflict:", error);
        throw new Error("Failed to check instructor conflicts");
    }
};


// Student Conflict Check
const checkStudentConflict = async (student_id, start_time, end_time, schedule_day) => {
    const query = `
      SELECT DISTINCT c.id
      FROM classes c
      JOIN class_students cs ON c.id = cs.class_id
      WHERE cs.student_id = $1
        AND c.schedule_day = $2
        AND (
          (c.start_time, c.end_time) OVERLAPS ($3::timestamp, $4::timestamp)
        )
    `;
    const values = [student_id, schedule_day, start_time, end_time];
    
    const result = await pool.query(query, values);
    return result.rowCount > 0; // True if a conflict exists
  };

export {
  checkClassroomConflict,
  checkInstructorConflict,
  checkStudentConflict
};
