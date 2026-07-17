// Remove: import pool from './db.js';

async function checkInstructorAvailability(db) {
  try {
    console.log('Checking availability for instructor 1...');
    
    // Check all availability slots for instructor 1
    const availabilityResult = await db.query(`
      SELECT 
        availability_id,
        day_of_week,
        start_time,
        end_time,
        status,
        type,
        notes
      FROM instructor_availability
      WHERE instructor_id = 1
      ORDER BY 
        CASE day_of_week 
          WHEN 'sun' THEN 1 
          WHEN 'mon' THEN 2 
          WHEN 'tue' THEN 3 
          WHEN 'wed' THEN 4 
          WHEN 'thu' THEN 5 
          WHEN 'fri' THEN 6 
          WHEN 'sat' THEN 7 
        END,
        start_time
    `);
    
    console.log('\nInstructor 1 Availability:');
    if (availabilityResult.rows.length === 0) {
      console.log('❌ No availability slots configured!');
    } else {
      availabilityResult.rows.forEach(slot => {
        console.log(`✅ ${slot.day_of_week.toUpperCase()}: ${slot.start_time} - ${slot.end_time} (${slot.status})`);
      });
    }
    
    // Check instructor unavailability
    const unavailabilityResult = await db.query(`
      SELECT 
        unavail_id,
        start_datetime,
        end_datetime,
        reason
      FROM instructor_unavailability
      WHERE instructor_id = 1
      ORDER BY start_datetime
    `);
    
    console.log('\nInstructor 1 Unavailability:');
    if (unavailabilityResult.rows.length === 0) {
      console.log('✅ No unavailability periods configured');
    } else {
      unavailabilityResult.rows.forEach(unavail => {
        console.log(`❌ ${unavail.start_datetime} - ${unavail.end_datetime}: ${unavail.reason}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking instructor availability:', error);
  } finally {
    // await pool.end(); // This line is removed as per the edit hint
  }
}

// checkInstructorAvailability(); // This line is removed as per the edit hint
// The function needs to be called with a database instance, e.g., req.db
// Example usage (assuming this function is part of a route handler):
// app.get('/check-instructor-availability', async (req, res) => {
//   try {
//     await checkInstructorAvailability(req.db);
//     res.send('Availability checked.');
//   } catch (error) {
//     console.error('Error in route:', error);
//     res.status(500).send('Internal Server Error');
//   }
// }); 