import pool from './db.js';

async function checkSchema() {
  try {
    console.log('Checking database schema...');
    
    // Check if class_sessions table has the new TIMESTAMPTZ columns
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'class_sessions'
      AND column_name IN ('session_start', 'session_end', 'session_date', 'start_time', 'end_time')
      ORDER BY column_name
    `);
    
    console.log('Class sessions table columns:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check if there are any existing sessions
    const sessionCount = await pool.query(`
      SELECT COUNT(*) as count FROM class_sessions
    `);
    
    console.log(`\nTotal sessions in database: ${sessionCount.rows[0].count}`);
    
    // Check sample session data
    const sampleSessions = await pool.query(`
      SELECT session_id, session_start, session_end, session_date, start_time, end_time
      FROM class_sessions
      LIMIT 3
    `);
    
    console.log('\nSample session data:');
    sampleSessions.rows.forEach(session => {
      console.log(`  Session ${session.session_id}:`);
      console.log(`    session_start: ${session.session_start}`);
      console.log(`    session_end: ${session.session_end}`);
      console.log(`    session_date: ${session.session_date}`);
      console.log(`    start_time: ${session.start_time}`);
      console.log(`    end_time: ${session.end_time}`);
    });
    
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await pool.end();
  }
}

checkSchema(); 