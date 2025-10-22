import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set. Database will not be available.');
}

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false }
});

export const db = drizzle(pool, { schema });

// Initialize database with pgcrypto extension
export async function initializeDatabase(): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('[DB] DATABASE_URL not set, skipping database initialization');
      return false;
    }

    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('[DB] Database initialized successfully');
    return true;
  } catch (error) {
    console.error('[DB] Database initialization failed:', error);
    console.error('[DB] Health endpoint will report unhealthy status');
    return false;
  }
}

// Check database health
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('[DB] Health check failed:', error);
    return false;
  }
}