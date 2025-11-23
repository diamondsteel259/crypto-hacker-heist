import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';
import { logger } from './logger';

if (!process.env.DATABASE_URL) {
  logger.error('DATABASE_URL environment variable is not set. Database will not be available.');
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
      logger.error('DATABASE_URL not set, skipping database initialization');
      return false;
    }

    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    logger.info('Database initialized successfully');
    return true;
  } catch (error) {
    logger.error('Database initialization failed', error);
    logger.error('Health endpoint will report unhealthy status');
    return false;
  }
}

// Check database health
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Health check failed', error);
    return false;
  }
}