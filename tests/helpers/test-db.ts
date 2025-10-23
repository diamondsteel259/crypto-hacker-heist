import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load test environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.test') });

// Ensure we're using test database
if (!process.env.DATABASE_URL?.includes('test')) {
  throw new Error('DATABASE_URL must point to a test database (should contain "test" in the name)');
}

const testPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

export const testDb = drizzle(testPool, { schema });

let isInitialized = false;

/**
 * Setup test database - create schema and enable required extensions
 */
export async function setupTestDatabase() {
  if (isInitialized) return;

  try {
    // Enable pgcrypto extension
    await testPool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    // Check if tables already exist (from CI migration)
    const tableCheck = await testPool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    const tablesExist = tableCheck.rows[0]?.exists;

    if (!tablesExist) {
      // Only drop schema if no tables exist (local dev)
      console.log('[Test DB] No tables found, recreating schema...');
      await testPool.query(`
        DROP SCHEMA public CASCADE;
        CREATE SCHEMA public;
        GRANT ALL ON SCHEMA public TO PUBLIC;
      `);
      console.log('[Test DB] Schema recreated, migration needed');
    } else {
      console.log('[Test DB] Tables already exist from migration, skipping schema drop');
    }

    console.log('[Test DB] Database schema initialized');
    isInitialized = true;
  } catch (error) {
    console.error('[Test DB] Setup failed:', error);
    throw error;
  }
}

/**
 * Seed test database with initial data
 * This includes equipment types, game settings, etc.
 */
export async function seedTestData() {
  try {
    // Import seed function from main application
    const { seedDatabase } = await import('../../server/seedDatabase.js');

    // Seed database (equipment and settings)
    await seedDatabase();
    console.log('[Test DB] Database seeded with equipment and settings');
  } catch (error) {
    // Seed functions might not exist or fail, that's okay for tests
    console.warn('[Test DB] Seeding completed with warnings:', error instanceof Error ? error.message : String(error));
  }
}

/**
 * Clean up test database - drop all tables and close connections
 */
export async function cleanupTestDatabase() {
  try {
    await testPool.query('DROP SCHEMA public CASCADE;');
    await testPool.query('CREATE SCHEMA public;');
    await testPool.end();
    console.log('[Test DB] Database cleaned up');
  } catch (error) {
    console.error('[Test DB] Cleanup failed:', error);
    throw error;
  }
}

/**
 * Reset test database - clear all user data but keep seed data
 */
export async function resetTestDatabase() {
  try {
    // Delete in order to respect foreign key constraints
    await testDb.delete(schema.blockRewards);
    await testDb.delete(schema.blocks);
    await testDb.delete(schema.ownedEquipment);
    await testDb.delete(schema.referrals);
    await testDb.delete(schema.activePowerUps);
    await testDb.delete(schema.userAchievements);
    await testDb.delete(schema.userChallenges);
    await testDb.delete(schema.transactions);
    await testDb.delete(schema.dailyLogins);
    await testDb.delete(schema.announcements);
    await testDb.delete(schema.promoCodes);
    await testDb.delete(schema.users);

    console.log('[Test DB] Database reset - all user data cleared');
  } catch (error) {
    console.error('[Test DB] Reset failed:', error);
    // Some tables might not exist, continue anyway
  }
}

/**
 * Get test database connection
 */
export function getTestDbConnection() {
  return testDb;
}

/**
 * Get test database pool for direct queries
 */
export function getTestPool() {
  return testPool;
}

// Setup database before all tests
if (typeof beforeAll !== 'undefined') {
  beforeAll(async () => {
    await setupTestDatabase();
    await seedTestData();
  });
}

// Reset database before each test
if (typeof beforeEach !== 'undefined') {
  beforeEach(async () => {
    await resetTestDatabase();
  });
}

// Cleanup database after all tests
if (typeof afterAll !== 'undefined') {
  afterAll(async () => {
    await cleanupTestDatabase();
  });
}
