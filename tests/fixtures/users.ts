import { type InsertUser, type User } from '@shared/schema';

/**
 * Test user fixtures
 */

export const testUser1: InsertUser = {
  telegramId: '1000001',
  username: 'testuser1',
  firstName: 'Test',
  lastName: 'User One',
  csBalance: 10000,
  chstBalance: 100,
  totalHashrate: 0,
};

export const testUser2: InsertUser = {
  telegramId: '1000002',
  username: 'testuser2',
  firstName: 'Test',
  lastName: 'User Two',
  csBalance: 50000,
  chstBalance: 500,
  totalHashrate: 100, // Has some equipment
};

export const testUser3: InsertUser = {
  telegramId: '1000003',
  username: 'testuser3',
  firstName: 'Test',
  lastName: 'User Three',
  csBalance: 100000,
  chstBalance: 1000,
  totalHashrate: 250, // Has more equipment
};

export const adminUser: InsertUser = {
  telegramId: '1000999',
  username: 'adminuser',
  firstName: 'Admin',
  lastName: 'User',
  csBalance: 1000000,
  chstBalance: 10000,
  totalHashrate: 0,
  isAdmin: true,
};

export const newUser: InsertUser = {
  telegramId: '1000004',
  username: 'newuser',
  firstName: 'New',
  lastName: 'User',
  csBalance: 10000, // Starting balance
  chstBalance: 0,
  totalHashrate: 0,
};

export const richUser: InsertUser = {
  telegramId: '1000005',
  username: 'richuser',
  firstName: 'Rich',
  lastName: 'User',
  csBalance: 10000000, // Very high balance for testing purchases
  chstBalance: 100000,
  totalHashrate: 1000,
};

export const poorUser: InsertUser = {
  telegramId: '1000006',
  username: 'pooruser',
  firstName: 'Poor',
  lastName: 'User',
  csBalance: 100, // Very low balance for testing insufficient funds
  chstBalance: 1,
  totalHashrate: 0,
};

/**
 * Factory function to create test user with custom overrides
 */
export function createTestUser(overrides?: Partial<InsertUser>): InsertUser {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000000);

  return {
    telegramId: `test_${timestamp}_${randomId}`,
    username: `testuser_${randomId}`,
    firstName: 'Test',
    lastName: 'User',
    csBalance: 10000,
    chstBalance: 100,
    totalHashrate: 0,
    ...overrides,
  };
}

/**
 * Create multiple test users at once
 */
export function createTestUsers(count: number, baseOverrides?: Partial<InsertUser>): InsertUser[] {
  return Array.from({ length: count }, (_, i) =>
    createTestUser({
      ...baseOverrides,
      telegramId: `test_${Date.now()}_${i}`,
      username: `testuser_${i}`,
      firstName: `Test${i}`,
    })
  );
}

/**
 * Test users with specific characteristics for different test scenarios
 */
export const testUserScenarios = {
  // User with no equipment or balance
  broke: createTestUser({
    csBalance: 0,
    chstBalance: 0,
    totalHashrate: 0,
  }),

  // User with starter equipment
  starter: createTestUser({
    csBalance: 10000,
    chstBalance: 100,
    totalHashrate: 50,
  }),

  // User with medium progress
  intermediate: createTestUser({
    csBalance: 50000,
    chstBalance: 500,
    totalHashrate: 200,
  }),

  // User with advanced progress
  advanced: createTestUser({
    csBalance: 200000,
    chstBalance: 2000,
    totalHashrate: 500,
  }),

  // User ready for prestige
  maxed: createTestUser({
    csBalance: 1000000,
    chstBalance: 10000,
    totalHashrate: 2000,
  }),
};
