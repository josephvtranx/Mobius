import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mobius',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    
    // Read the seed data file
    const seedDataPath = path.join(__dirname, 'src', 'config', 'seedData.sql');
    const seedData = fs.readFileSync(seedDataPath, 'utf8');
    
    // Execute the seed data
    await pool.query(seedData);
    
    console.log('Database seeded successfully!');
    console.log('Sample data has been inserted:');
    console.log('- Payment methods');
    console.log('- Time packages');
    console.log('- Sample students');
    console.log('- Sample student time packages');
    console.log('- Sample payments');
    console.log('- Sample invoices');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase(); 