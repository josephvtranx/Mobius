import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const registryPool = new pg.Pool({
  connectionString: process.env.REGISTRY_URL,   // points to mobius_registry
  ssl: { rejectUnauthorized: false }            // required on Azure
}); 