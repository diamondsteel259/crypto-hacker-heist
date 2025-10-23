import supertest from 'supertest';
import { type Application } from 'express';
import { type InsertUser, type User } from '@shared/schema';
import { testDb } from './test-db.js';
import { storage } from '../../server/storage.js';

export interface TestUserData {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  csBalance?: number;
  chstBalance?: number;
  totalHashrate?: number;
}

/**
 * Create a test user with optional overrides
 */
export async function createTestUser(overrides?: Partial<TestUserData>): Promise<User> {
  const defaultData: InsertUser = {
    telegramId: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    csBalance: 10000,
    chstBalance: 100,
    totalHashrate: 0,
    ...overrides
  };

  const user = await storage.createUser(defaultData);
  return user;
}

/**
 * Authenticate test user (simulate Telegram auth)
 * Returns user and request builder with auth headers
 */
export async function authenticateTestUser(
  app: Application,
  userData?: Partial<TestUserData>
): Promise<{ user: User; request: any }> {
  const user = await createTestUser(userData);
  
  // Return request builder that adds auth header to each request
  const request = {
    get: (path: string) => supertest(app).get(path).set('x-test-user-id', user.telegramId),
    post: (path: string) => supertest(app).post(path).set('x-test-user-id', user.telegramId),
    put: (path: string) => supertest(app).put(path).set('x-test-user-id', user.telegramId),
    delete: (path: string) => supertest(app).delete(path).set('x-test-user-id', user.telegramId),
    patch: (path: string) => supertest(app).patch(path).set('x-test-user-id', user.telegramId),
  };

  return { user, request };
}

/**
 * Purchase equipment for test user
 */
export async function purchaseTestEquipment(
  userId: string,
  equipmentTypeId: string
): Promise<void> {
  const equipmentType = await storage.getEquipmentType(equipmentTypeId);
  if (!equipmentType) {
    throw new Error(`Equipment type ${equipmentTypeId} not found`);
  }

  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // Deduct cost from user balance
  await storage.updateUserBalance(
    userId,
    user.csBalance - equipmentType.priceCS,
    user.chstBalance
  );

  // Add equipment to user's inventory
  await storage.purchaseEquipment({
    userId,
    equipmentTypeId,
    quantity: 1,
    baseHashrate: equipmentType.baseHashrate,
    currentHashrate: equipmentType.baseHashrate,
    purchasedAt: new Date(),
  });

  // Update user's total hashrate
  await storage.updateUserHashrate(userId, user.totalHashrate + equipmentType.baseHashrate);
}

/**
 * Manually trigger mining for tests (bypass interval)
 */
export async function mineTestBlock(): Promise<void> {
  const { mineBlock } = await import('../../server/mining.js');
  await mineBlock();
}

/**
 * Activate power-up for test user
 */
export async function activateTestPowerUp(
  userId: string,
  type: 'hashrate_boost' | 'luck_boost',
  durationMinutes: number = 60
): Promise<void> {
  const { activePowerUps } = await import('@shared/schema');
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

  await testDb.insert(activePowerUps).values({
    userId,
    type,
    boostPercentage: type === 'hashrate_boost' ? 50 : 20,
    activatedAt: new Date(),
    expiresAt,
  });
}

/**
 * Set user balance directly for testing
 */
export async function setUserBalance(
  userId: string,
  cs: number,
  chst: number
): Promise<void> {
  await storage.updateUserBalance(userId, cs, chst);
}

/**
 * Set user hashrate directly for testing
 */
export async function setUserHashrate(userId: string, hashrate: number): Promise<void> {
  await storage.updateUserHashrate(userId, hashrate);
}

/**
 * Get user's equipment list
 */
export async function getUserEquipment(userId: string) {
  return await storage.getUserEquipment(userId);
}

/**
 * Create test equipment type
 */
export async function createTestEquipmentType(overrides?: Partial<any>) {
  const { equipmentTypes } = await import('@shared/schema');

  const defaultEquipment = {
    name: `Test Equipment ${Date.now()}`,
    category: 'mining_rigs',
    tier: 'basic',
    baseHashrate: 50,
    priceCS: 1000,
    priceCHST: 0,
    priceTON: 0,
    description: 'Test equipment for automated tests',
    icon: '⚡',
    imageUrl: '',
    orderIndex: 999,
    ...overrides
  };

  const result = await testDb.insert(equipmentTypes).values(defaultEquipment).returning();
  return result[0];
}

/**
 * Create test block
 */
export async function createTestBlock(overrides?: Partial<any>) {
  const latestBlock = await storage.getLatestBlock();
  const blockNumber = latestBlock ? latestBlock.blockNumber + 1 : 1;

  const block = await storage.createBlock({
    blockNumber,
    reward: 100000,
    totalHashrate: 1000,
    minedAt: new Date(),
    ...overrides
  });

  return block;
}

/**
 * Create test referral
 */
export async function createTestReferral(referrerId: string, refereeId: string) {
  return await storage.createReferral(referrerId, refereeId);
}

/**
 * Wait for condition with timeout
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeoutMs: number = 5000,
  intervalMs: number = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Condition not met within ${timeoutMs}ms`);
}

/**
 * Helper to make authenticated API requests
 */
export function apiRequest(app: Application, userId: string) {
  return {
    get: (path: string) => 
      supertest(app)
        .get(path.replace(':userId', userId))
        .set('x-test-user-id', userId),
    post: (path: string) => 
      supertest(app)
        .post(path.replace(':userId', userId))
        .set('x-test-user-id', userId),
    put: (path: string) => 
      supertest(app)
        .put(path.replace(':userId', userId))
        .set('x-test-user-id', userId),
    delete: (path: string) => 
      supertest(app)
        .delete(path.replace(':userId', userId))
        .set('x-test-user-id', userId),
  };
}
