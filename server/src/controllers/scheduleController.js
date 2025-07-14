import { validationResult } from 'express-validator';
import pool from '../config/db.js';
import {
    checkClassroomConflict,
    checkInstructorConflict,
    checkStudentConflict
} from '../helpers/conflictCheck.js';
import { assertUtcIso, toUtcIso } from "../lib/time.js";

// Helper function to get the next date for a given day of the week
const getNextDateForDay = (day) => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = toUtcIso(new Date());
    const targetDayIndex = daysOfWeek.indexOf(day);

    if (targetDayIndex === -1) {
        throw new Error(`Invalid day: ${day}`);
    }

    // Calculate the difference in days
    const currentDayIndex = today.getDay(); // getDay() returns 0 for Sunday, 1 for Monday, etc.
    let daysUntilTarget = (targetDayIndex - currentDayIndex + 7) % 7;

    // If the target day is today but the time has passed, move to next week
    if (daysUntilTarget === 0 && today.getTime() >= today.setHours(0, 0, 0, 0)) { // Check if current time is past midnight today
        daysUntilTarget = 7;
    }

    return toUtcIso(new Date(today.getTime() + daysUntilTarget * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
};

// Get all classes
const getClasses = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM classes');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).json({ error: 'Failed to retrieve classes' });
    }
};

// Create a new class
const createClass = async (req, res) => {
    const { title, description, capacity, instructor_ids, duration } = req.body; // Duration in hours

    try {
        // Step 1: Fetch instructor availability for future dates only
        console.log("Fetching instructor availability...");
        const instructorAvailabilityQuery = `
            SELECT instructor_id, date, start_time, end_time
            FROM instructor_availability
            WHERE instructor_id = ANY($1::int[])
              AND date >= CURRENT_DATE
            ORDER BY date, start_time
        `;
        const instructorAvailability = await pool.query(instructorAvailabilityQuery, [instructor_ids]);

        if (instructorAvailability.rowCount === 0) {
            console.error("No future availability found for the selected instructors");
            return res.status(400).json({ error: "No future availability found for the selected instructors" });
        }

        const availability = instructorAvailability.rows;
        console.log("Instructor availability fetched:", availability);

        // Step 2: Find suitable classrooms
        console.log("Fetching classrooms...");
        const classroomsQuery = `SELECT * FROM classrooms WHERE capacity >= $1`;
        const classrooms = await pool.query(classroomsQuery, [capacity]);

        if (classrooms.rowCount === 0) {
            console.error("No classrooms available with sufficient capacity");
            return res.status(400).json({ error: "No classrooms available with sufficient capacity" });
        }

        const availableClassrooms = classrooms.rows;
        console.log("Available classrooms fetched:", availableClassrooms);

        // Step 3: Iterate over instructor availability
        console.log("Iterating over instructor availability...");
        let selectedSchedule = null;

        for (let slot of availability) {
            console.log("Processing slot:", slot);
        
            const { date, start_time, end_time } = slot;
        
            // Extract date part and parse timestamps
            const dateOnly = typeof date === 'string' ? date.split('T')[0] : date;
            const startMoment = assertUtcIso(`${dateOnly} ${start_time}`);
            const endMoment = assertUtcIso(`${dateOnly} ${end_time}`);
        
            if (!startMoment.isValid() || !endMoment.isValid()) {
                console.error("Invalid date or time format:", { dateOnly, start_time, end_time });
                continue;
            }
        
            console.log("Start moment:", startMoment.toISOString());
            console.log("End moment:", endMoment.toISOString());
        
            // Iterate through possible start times within this slot
            let currentStart = startMoment.clone();
        
            while (currentStart.isBefore(endMoment)) {
                const requiredEndMoment = currentStart.clone().add(duration, 'hours');
        
                if (requiredEndMoment.isAfter(endMoment)) {
                    console.log("Required end time exceeds available slot:", requiredEndMoment.toISOString());
                    break; // Stop if the class would exceed the slot's end time
                }
        
                const startTimestamp = currentStart.toISOString();
                const endTimestamp = requiredEndMoment.toISOString();
        
                console.log("Checking instructor conflicts for:", { startTimestamp, endTimestamp });
        
                // Check instructor conflicts for the current time slot
                const instructorConflict = await checkInstructorConflict(
                    instructor_ids,
                    startTimestamp,
                    endTimestamp,
                    dateOnly
                );
        
                if (!instructorConflict) {
                    console.log("No instructor conflict. Checking classroom availability...");
                    // Check classroom availability for this time slot
                    for (let room of availableClassrooms) {
                        const classroomConflict = await checkClassroomConflict(
                            room.id,
                            startTimestamp,
                            endTimestamp,
                            dateOnly
                        );
        
                        if (!classroomConflict) {
                            selectedSchedule = {
                                classroom_id: room.id,
                                schedule_date: dateOnly,
                                start_time: startTimestamp,
                                end_time: endTimestamp,
                            };
                            break;
                        } else {
                            console.log("Classroom conflict detected for room:", room.id);
                        }
                    }
                } else {
                    console.log("Instructor conflict detected for slot:", { startTimestamp, endTimestamp });
                }
        
                if (selectedSchedule) break;
        
                // Move the start time forward by a reasonable increment (e.g., 15 minutes)
                currentStart.add(15, 'minutes');
            }
        
            if (selectedSchedule) break;
        }                

        if (!selectedSchedule) {
            console.error("Unable to find a suitable schedule");
            return res.status(400).json({ error: "Unable to find a suitable schedule" });
        }

        // Step 4: Create the Class
        const { classroom_id, schedule_date, start_time, end_time } = selectedSchedule;
        console.log("Creating class with schedule:", selectedSchedule);

        const createClassQuery = `
            INSERT INTO classes (title, description, start_time, end_time, schedule_day, classroom_id) 
            VALUES ($1, $2, $3, $4, TO_CHAR($3::timestamp, 'Day'), $5) RETURNING id
        `;
        const result = await pool.query(createClassQuery, [
            title, description, start_time, end_time, classroom_id
        ]);

        const class_id = result.rows[0].id;

        // Step 5: Assign instructors to the class
        const assignInstructorsQuery = `
            INSERT INTO class_instructors (class_id, instructor_id) 
            SELECT $1, unnest($2::int[])
        `;
        await pool.query(assignInstructorsQuery, [class_id, instructor_ids]);

        res.status(201).json({ message: "Class created successfully!", class_id });
    } catch (error) {
        console.error("Error in createClass:", error);
        res.status(500).json({ error: "Failed to create class" });
    }
};

// Update a class
const updateClass = async (req, res) => {
    const { id } = req.params;
    const { title, description, start_time, end_time, schedule_day, classroom_id, instructor_ids } = req.body;

    try {
        // Check if Class Exists
        const classCheck = await pool.query(`SELECT * FROM classes WHERE id = $1`, [id]);
        if (classCheck.rowCount === 0) {
            return res.status(404).json({ error: "Class not found" });
        }

        // Check for Classroom Conflicts (Exclude Current Class)
        if (await checkClassroomConflict(classroom_id, start_time, end_time, schedule_day, id)) {
            return res.status(400).json({ error: "Classroom conflict detected" });
        }

        // Check for Instructor Conflicts (Exclude Current Class)
        if (await checkInstructorConflict(instructor_ids, start_time, end_time, schedule_day, id)) {
            return res.status(400).json({
                error: "Instructor conflict detected",
                instructors: instructor_ids
            });
        }

        // Update the Class
        const result = await pool.query(`
            UPDATE classes 
            SET title = $1, description = $2, start_time = $3, end_time = $4, 
                schedule_day = $5, classroom_id = $6 
            WHERE id = $7 
            RETURNING *;
        `, [title, description, start_time, end_time, schedule_day, classroom_id, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Class not found" });
        }

        // Update Instructors
        await pool.query(`DELETE FROM class_instructors WHERE class_id = $1`, [id]);
        await pool.query(`
            INSERT INTO class_instructors (class_id, instructor_id) 
            SELECT $1, unnest($2::int[])
        `, [id, instructor_ids]);

        res.status(200).json({ message: "Class updated successfully!" });
    } catch (error) {
        console.error('Database update failed:', error);
        res.status(500).json({ error: "Failed to update class" });
    }
};

// Delete a class
const deleteClass = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`DELETE FROM classes WHERE id = $1 RETURNING *`, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.status(200).json({ message: "Class deleted successfully!" });
    } catch (error) {
        console.error('Database deletion failed:', error);
        res.status(500).json({ error: "Failed to delete class" });
    }
};

// Add a student to a class
const addStudentToClass = async (req, res) => {
    const { class_id, student_id } = req.body;
  
    try {
      // Check if the Class Exists
      const classCheck = await pool.query(`SELECT * FROM classes WHERE id = $1`, [class_id]);
      if (classCheck.rowCount === 0) {
        return res.status(404).json({ error: "Class not found" });
      }
      
      const { start_time, end_time, schedule_day } = classCheck.rows[0];
  
      // Check for Student Conflict
      if (await checkStudentConflict(student_id, start_time, end_time, schedule_day)) {
        return res.status(400).json({ error: "Student conflict detected" });
      }
  
      // Add Student to Class
      await pool.query(`
        INSERT INTO class_students (class_id, student_id) 
        VALUES ($1, $2)
      `, [class_id, student_id]);
  
      res.status(201).json({ message: "Student added to class successfully!" });
    } catch (error) {
      console.error('Error adding student to class:', error);
      res.status(500).json({ error: "Failed to add student to class" });
    }
  };

  // Get all students
  const getStudents = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM students');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Failed to retrieve students:', error);
      res.status(500).json({ error: 'Failed to retrieve students' });
    }
  };

  // Get student by id
  const getStudentById = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Failed to retrieve student:', error);
      res.status(500).json({ error: 'Failed to retrieve student' });
    }
  };

  // Update student
  const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
  
    try {
      const result = await pool.query(
        'UPDATE students SET name = $1, email = $2 WHERE id = $3 RETURNING *',
        [name, email, id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Failed to update student:', error);
      res.status(500).json({ error: 'Failed to update student' });
    }
  };

  // Delete a student
  const deleteStudent = async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(200).json({ message: 'Student deleted successfully!' });
    } catch (error) {
      console.error('Failed to delete student:', error);
      res.status(500).json({ error: 'Failed to delete student' });
    }
  };

  // Edit student enrollment
  const editStudentEnrollment = async (req, res) => {
    const { student_id, current_class_id, new_class_id } = req.body;

    console.log('Incoming Request Body:', req.body);

    try {
        // Validate and parse IDs
        const parsedStudentId = parseInt(student_id, 10);
        const parsedCurrentClassId = parseInt(current_class_id, 10);
        const parsedNewClassId = parseInt(new_class_id, 10);

        if (isNaN(parsedStudentId) || isNaN(parsedCurrentClassId) || isNaN(parsedNewClassId)) {
            console.error('Invalid input: student_id, current_class_id, or new_class_id is not an integer');
            return res.status(400).json({ error: 'Invalid input data: IDs must be integers' });
        }

        console.log('Parsed IDs:', { parsedStudentId, parsedCurrentClassId, parsedNewClassId });

        // Check if the new class exists
        const newClassCheck = await pool.query(`SELECT * FROM classes WHERE id = $1`, [parsedNewClassId]);
        if (newClassCheck.rowCount === 0) {
            console.error('New class not found:', parsedNewClassId);
            return res.status(404).json({ error: "New class not found" });
        }

        console.log('New class exists:', newClassCheck.rows[0]);

        const { start_time, end_time, schedule_day } = newClassCheck.rows[0];

        // Check for student conflicts using the helper function
        const conflictExists = await checkStudentConflict(parsedStudentId, start_time, end_time, schedule_day);

        if (conflictExists) {
            console.error('Conflict detected with existing classes');
            return res.status(400).json({ error: "Conflict detected with existing classes" });
        }

        console.log('No conflicts found. Proceeding to update enrollment.');

        // Remove the student from the current class
        await pool.query(`
            DELETE FROM class_students 
            WHERE student_id = $1 AND class_id = $2
        `, [parsedStudentId, parsedCurrentClassId]);

        console.log('Student removed from current class:', parsedCurrentClassId);

        // Add the student to the new class
        await pool.query(`
            INSERT INTO class_students (class_id, student_id) 
            VALUES ($1, $2)
        `, [parsedNewClassId, parsedStudentId]);

        console.log('Student added to new class:', parsedNewClassId);

        res.status(200).json({ message: "Student enrollment updated successfully!" });
    } catch (error) {
        console.error("Error in editStudentEnrollment:", error);
        res.status(500).json({ error: "Failed to update student enrollment" });
    }
};

// Add instructor availability
const addAvailability = async (req, res) => {
    const { name, date, start_time, end_time } = req.body; // Extract name from body

    try {
        if (!name) {
            return res.status(400).json({ error: "Instructor name is required" });
        }

        // Fetch instructor ID by name
        const instructorQuery = `SELECT id FROM instructors WHERE name = $1`;
        const instructorResult = await pool.query(instructorQuery, [name]);

        if (instructorResult.rowCount === 0) {
            return res.status(404).json({ error: "Instructor not found" });
        }

        const instructorId = instructorResult.rows[0].id;

        // Insert availability
        const query = `
            INSERT INTO instructor_availability (instructor_id, date, start_time, end_time)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [instructorId, date, start_time, end_time];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Availability added successfully!",
            availability: result.rows[0],
        });
    } catch (error) {
        console.error("Error adding availability:", error);
        res.status(500).json({ error: error.message || "Failed to add availability" });
    }
};

// Edit an instructor availability
const updateAvailability = async (req, res) => {
    const { id, name, date, start_time, end_time } = req.body; // Extract id and other data from body

    try {
        if (!id) {
            return res.status(400).json({ error: "Availability ID is required" });
        }

        if (!name) {
            return res.status(400).json({ error: "Instructor name is required" });
        }

        // Fetch instructor ID by name
        const instructorQuery = `SELECT id FROM instructors WHERE name = $1`;
        const instructorResult = await pool.query(instructorQuery, [name]);

        console.log("Instructor Query Result:", instructorResult.rows);

        if (instructorResult.rowCount === 0) {
            return res.status(404).json({ error: "Instructor not found" });
        }

        const instructorId = instructorResult.rows[0].id;

        console.log("Instructor ID:", instructorId);

        const query = `
            UPDATE instructor_availability
            SET date = $1, start_time = $2, end_time = $3
            WHERE id = $4 AND instructor_id = $5
            RETURNING *;
        `;
        const values = [date, start_time, end_time, id, instructorId];

        console.log("Update Query Values:", values);

        const result = await pool.query(query, values);

        console.log("Update Query Result:", result.rows);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Availability not found or does not belong to the specified instructor" });
        }

        res.status(200).json({
            message: "Availability updated successfully!",
            availability: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({ error: error.message || "Failed to update availability" });
    }
};


// Delete an instructor availability
const deleteAvailability = async (req, res) => {
    const { id, name } = req.body; // Extract id and name from body

    try {
        if (!id) {
            return res.status(400).json({ error: "Availability ID is required" });
        }

        if (!name) {
            return res.status(400).json({ error: "Instructor name is required" });
        }

        // Fetch instructor ID by name
        const instructorQuery = `SELECT id FROM instructors WHERE name = $1`;
        const instructorResult = await pool.query(instructorQuery, [name]);

        if (instructorResult.rowCount === 0) {
            return res.status(404).json({ error: "Instructor not found" });
        }

        const instructorId = instructorResult.rows[0].id;

        // Delete availability
        const query = `
            DELETE FROM instructor_availability
            WHERE id = $1 AND instructor_id = $2
            RETURNING *;
        `;
        const values = [id, instructorId];
        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Availability not found or does not belong to the specified instructor" });
        }

        res.status(200).json({
            message: "Availability deleted successfully!",
        });
    } catch (error) {
        console.error("Error deleting availability:", error);
        res.status(500).json({ error: error.message || "Failed to delete availability" });
    }
};

// Get instructor availabilities
const getInstructorAvailabilities = async (req, res) => {
    try {
        const { name } = req.query; // Extract the instructor's name from query params
        let query = `
            SELECT ia.id, ia.instructor_id, i.name, ia.date, ia.start_time, ia.end_time
            FROM instructor_availability ia
            JOIN instructors i ON ia.instructor_id = i.id
        `;

        let values = [];
        if (name) {
            query += ` WHERE i.name = $1`;
            values.push(name);
        }

        query += ` ORDER BY ia.date, ia.start_time`;

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "No availabilities found" });
        }

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching instructor availabilities:", error);
        res.status(500).json({ error: "Failed to retrieve instructor availabilities" });
    }
};

// Export all controllers
export {
    getClasses,
    createClass,
    updateClass,
    deleteClass,
    addStudentToClass,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    editStudentEnrollment,
    addAvailability,
    updateAvailability,
    deleteAvailability,
    getInstructorAvailabilities
};

// Controller logic found above includes:
//  - Getting all classes in db
//  - Creating new class
//  - Updating existing class
//  - Deleting class

// This file contains the logic for handling requests to each route
