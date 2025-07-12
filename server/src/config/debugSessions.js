import pool from './db.js';

async function debugSessions() {
  try {
    console.log('Debugging sessions for instructor 1...');
    
    // Get all sessions for instructor 1
    const result = await pool.query(`
      SELECT 
        session_id,
        instructor_id,
        student_id,
        session_start,
        session_end,
        session_date,
        start_time,
        end_time,
        status,
        location
      FROM class_sessions
      WHERE instructor_id = 1
      ORDER BY session_start ASC
    `);
    
    console.log(`\nFound ${result.rows.length} sessions for instructor 1:`);
    result.rows.forEach((session, index) => {
      console.log(`\n${index + 1}. Session ID: ${session.session_id}`);
      console.log(`   Status: ${session.status}`);
      console.log(`   Student ID: ${session.student_id}`);
      console.log(`   TIMESTAMPTZ: ${session.session_start} to ${session.session_end}`);
      console.log(`   Legacy: ${session.session_date} ${session.start_time} to ${session.end_time}`);
      console.log(`   Location: ${session.location}`);
    });
    
    // Check for sessions on the specific date (2025-07-10)
    console.log('\n=== Sessions on 2025-07-10 ===');
    const dateResult = await pool.query(`
      SELECT 
        session_id,
        instructor_id,
        student_id,
        session_start,
        session_end,
        status
      FROM class_sessions
      WHERE instructor_id = 1
      AND DATE(session_start) = '2025-07-10'
      ORDER BY session_start
    `);
    
    console.log(`Found ${dateResult.rows.length} sessions on 2025-07-10:`);
    dateResult.rows.forEach((session, index) => {
      console.log(`\n${index + 1}. Session ID: ${session.session_id}`);
      console.log(`   Student ID: ${session.student_id}`);
      console.log(`   Time: ${session.session_start} to ${session.session_end}`);
      console.log(`   Status: ${session.status}`);
    });
    
  } catch (error) {
    console.error('Error debugging sessions:', error);
  } finally {
    await pool.end();
  }
}

debugSessions(); 