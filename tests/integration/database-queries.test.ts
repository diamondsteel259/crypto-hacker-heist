import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startTestServer, stopTestServer } from '../helpers/test-server.js';
import {
  createTestUser,
  authenticateTestUser,
  setUserBalance,
  apiRequest,
} from '../helpers/api-helpers.js';
import { resetTestDatabase, getTestDbConnection } from '../helpers/test-db.js';
import { users, ownedEquipment, blocks, blockRewards, referrals, equipmentTypes } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import type { Application } from 'express';

/**
 * Comprehensive database query integration tests
 * Tests all major database operations to ensure queries execute correctly
 */

describe('Database Query Verification', () => {
  let app: Application;
  const db = getTestDbConnection();

  beforeAll(async () => {
    const server = await startTestServer();
    app = server.app;
  });

  afterAll(async () => {
    await stopTestServer();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  describe('User Table Queries', () => {
    it('should insert and retrieve user correctly', async () => {
      const user = await createTestUser({
        telegramId: '999999',
        username: 'dbtest_user',
        csBalance: 50000,
        totalHashrate: 100,
      });

      // Direct database query
      const retrieved = await db.select().from(users).where(eq(users.id, user.id)).limit(1);

      expect(retrieved).toHaveLength(1);
      expect(retrieved[0].telegramId).toBe('999999');
      expect(retrieved[0].username).toBe('dbtest_user');
      expect(retrieved[0].csBalance).toBe(50000);
      expect(retrieved[0].totalHashrate).toBe(100);
    });

    it('should update user balance atomically', async () => {
      const user = await createTestUser({ csBalance: 10000 });

      // Atomic update using SQL
      await db
        .update(users)
        .set({ csBalance: sql`${users.csBalance} + 5000` })
        .where(eq(users.id, user.id));

      const updated = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      expect(updated[0].csBalance).toBe(15000);
    });

    it('should handle concurrent balance updates correctly', async () => {
      const user = await createTestUser({ csBalance: 10000 });

      // Simulate concurrent updates
      const updates = Array(10).fill(null).map(() =>
        db.update(users)
          .set({ csBalance: sql`${users.csBalance} + 1000` })
          .where(eq(users.id, user.id))
      );

      await Promise.all(updates);

      const final = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      expect(final[0].csBalance).toBe(20000); // 10000 + (10 * 1000)
    });

    it('should query users by hashrate efficiently', async () => {
      // Create multiple users with different hashrates
      await createTestUser({ telegramId: '1', totalHashrate: 100 });
      await createTestUser({ telegramId: '2', totalHashrate: 500 });
      await createTestUser({ telegramId: '3', totalHashrate: 1000 });
      await createTestUser({ telegramId: '4', totalHashrate: 0 });

      const startTime = Date.now();
      const activeMiners = await db
        .select()
        .from(users)
        .where(sql`${users.totalHashrate} > 0`)
        .orderBy(sql`${users.totalHashrate} DESC`);
      const duration = Date.now() - startTime;

      expect(activeMiners).toHaveLength(3);
      expect(activeMiners[0].totalHashrate).toBe(1000);
      expect(duration).toBeLessThan(100); // Should be fast
    });
  });

  describe('Equipment Table Queries', () => {
    it('should retrieve equipment types with pagination', async () => {
      const equipment = await db
        .select()
        .from(equipmentTypes)
        .limit(10)
        .offset(0);

      expect(equipment.length).toBeGreaterThan(0);
      expect(equipment.length).toBeLessThanOrEqual(10);
    });

    it('should join owned equipment with equipment types', async () => {
      const user = await createTestUser();

      // Get equipment type first
      const eqTypes = await db.select().from(equipmentTypes).limit(1);

      if (eqTypes.length > 0) {
        // Insert owned equipment
        await db.insert(ownedEquipment).values({
          userId: user.telegramId,
          equipmentTypeId: eqTypes[0].id,
          quantity: 1,
          currentHashrate: eqTypes[0].baseHashrate,
          upgradeLevel: 0,
        });

        // Join query
        const owned = await db
          .select()
          .from(ownedEquipment)
          .leftJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id))
          .where(eq(ownedEquipment.userId, user.telegramId));

        expect(owned).toHaveLength(1);
        expect(owned[0].equipment_types).toBeTruthy();
        expect(owned[0].equipment_types?.name).toBe(eqTypes[0].name);
      }
    });

    it('should calculate total user hashrate from equipment', async () => {
      const user = await createTestUser();
      const eqTypes = await db.select().from(equipmentTypes).limit(3);

      // Insert multiple equipment items
      for (const eqType of eqTypes) {
        await db.insert(ownedEquipment).values({
          userId: user.telegramId,
          equipmentTypeId: eqType.id,
          quantity: 1,
          currentHashrate: eqType.baseHashrate,
          upgradeLevel: 0,
        });
      }

      // Calculate total hashrate
      const result = await db
        .select({ totalHashrate: sql<number>`SUM(${ownedEquipment.currentHashrate})` })
        .from(ownedEquipment)
        .where(eq(ownedEquipment.userId, user.telegramId));

      const calculatedHashrate = result[0]?.totalHashrate || 0;
      expect(calculatedHashrate).toBeGreaterThan(0);
    });
  });

  describe('Block and Reward Queries', () => {
    it('should insert block and distribute rewards in transaction', async () => {
      const user1 = await createTestUser({ totalHashrate: 100 });
      const user2 = await createTestUser({ totalHashrate: 200 });

      const blockData = await db.transaction(async (tx) => {
        // Insert block
        const [block] = await tx.insert(blocks).values({
          blockNumber: 1,
          reward: 100000,
          totalHashrate: 300,
          totalMiners: 2,
          difficulty: 1,
        }).returning();

        // Insert rewards for both users
        await tx.insert(blockRewards).values([
          {
            userId: user1.id,
            blockId: block.id,
            reward: 33333,
            hashrate: 100,
            sharePercent: 33.33,
          },
          {
            userId: user2.id,
            blockId: block.id,
            reward: 66667,
            hashrate: 200,
            sharePercent: 66.67,
          },
        ]);

        // Update user balances
        await tx
          .update(users)
          .set({ csBalance: sql`${users.csBalance} + 33333` })
          .where(eq(users.id, user1.id));

        await tx
          .update(users)
          .set({ csBalance: sql`${users.csBalance} + 66667` })
          .where(eq(users.id, user2.id));

        return block;
      });

      // Verify block was created
      const createdBlock = await db.select().from(blocks).where(eq(blocks.id, blockData.id));
      expect(createdBlock).toHaveLength(1);

      // Verify rewards were distributed
      const rewards = await db.select().from(blockRewards).where(eq(blockRewards.blockId, blockData.id));
      expect(rewards).toHaveLength(2);

      // Verify balances were updated
      const updatedUser1 = await db.select().from(users).where(eq(users.id, user1.id)).limit(1);
      const updatedUser2 = await db.select().from(users).where(eq(users.id, user2.id)).limit(1);

      expect(updatedUser1[0].csBalance).toBe(10000 + 33333);
      expect(updatedUser2[0].csBalance).toBe(10000 + 66667);
    });

    it('should query recent blocks efficiently', async () => {
      // Insert multiple blocks
      for (let i = 1; i <= 20; i++) {
        await db.insert(blocks).values({
          blockNumber: i,
          reward: 100000,
          totalHashrate: 1000,
          totalMiners: 5,
          difficulty: 1,
        });
      }

      const startTime = Date.now();
      const recentBlocks = await db
        .select()
        .from(blocks)
        .orderBy(sql`${blocks.minedAt} DESC`)
        .limit(10);
      const duration = Date.now() - startTime;

      expect(recentBlocks).toHaveLength(10);
      expect(recentBlocks[0].blockNumber).toBeGreaterThan(recentBlocks[9].blockNumber);
      expect(duration).toBeLessThan(100);
    });

    it('should aggregate user rewards across blocks', async () => {
      const user = await createTestUser();

      // Create multiple blocks with rewards
      for (let i = 1; i <= 5; i++) {
        const [block] = await db.insert(blocks).values({
          blockNumber: i,
          reward: 100000,
          totalHashrate: 1000,
          totalMiners: 1,
          difficulty: 1,
        }).returning();

        await db.insert(blockRewards).values({
          userId: user.id,
          blockId: block.id,
          reward: 10000,
          hashrate: 100,
          sharePercent: 10,
        });
      }

      // Aggregate query
      const result = await db
        .select({
          totalRewards: sql<number>`SUM(${blockRewards.reward})`,
          blockCount: sql<number>`COUNT(*)`,
        })
        .from(blockRewards)
        .where(eq(blockRewards.userId, user.id));

      expect(result[0].totalRewards).toBe(50000);
      expect(result[0].blockCount).toBe(5);
    });
  });

  describe('Referral Queries', () => {
    it('should create and query referral relationships', async () => {
      const referrer = await createTestUser({ telegramId: '111' });
      const referred = await createTestUser({ telegramId: '222' });

      // Create referral
      await db.insert(referrals).values({
        referrerId: referrer.id,
        referredId: referred.id,
        rewardGiven: true,
      });

      // Query referrals
      const userReferrals = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referrerId, referrer.id));

      expect(userReferrals).toHaveLength(1);
      expect(userReferrals[0].referredId).toBe(referred.id);
    });

    it('should count referrals efficiently', async () => {
      const referrer = await createTestUser({ telegramId: '111' });

      // Create 10 referrals
      for (let i = 0; i < 10; i++) {
        const referred = await createTestUser({ telegramId: `ref_${i}` });
        await db.insert(referrals).values({
          referrerId: referrer.id,
          referredId: referred.id,
          rewardGiven: true,
        });
      }

      const startTime = Date.now();
      const result = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(referrals)
        .where(eq(referrals.referrerId, referrer.id));
      const duration = Date.now() - startTime;

      expect(result[0].count).toBe(10);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Leaderboard Queries', () => {
    it('should query top users by balance efficiently', async () => {
      // Create users with different balances
      await createTestUser({ telegramId: '1', csBalance: 1000 });
      await createTestUser({ telegramId: '2', csBalance: 5000 });
      await createTestUser({ telegramId: '3', csBalance: 10000 });
      await createTestUser({ telegramId: '4', csBalance: 3000 });

      const startTime = Date.now();
      const leaderboard = await db
        .select()
        .from(users)
        .orderBy(sql`${users.csBalance} DESC`)
        .limit(10);
      const duration = Date.now() - startTime;

      expect(leaderboard[0].csBalance).toBe(10000);
      expect(leaderboard[1].csBalance).toBe(5000);
      expect(duration).toBeLessThan(100);
    });

    it('should query top users by hashrate efficiently', async () => {
      await createTestUser({ telegramId: '1', totalHashrate: 100 });
      await createTestUser({ telegramId: '2', totalHashrate: 500 });
      await createTestUser({ telegramId: '3', totalHashrate: 1000 });

      const startTime = Date.now();
      const leaderboard = await db
        .select()
        .from(users)
        .where(sql`${users.totalHashrate} > 0`)
        .orderBy(sql`${users.totalHashrate} DESC`)
        .limit(10);
      const duration = Date.now() - startTime;

      expect(leaderboard[0].totalHashrate).toBe(1000);
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Database Performance', () => {
    it('should handle bulk inserts efficiently', async () => {
      const startTime = Date.now();

      // Bulk insert 100 users
      const userValues = Array.from({ length: 100 }, (_, i) => ({
        telegramId: `bulk_${i}`,
        username: `bulk_user_${i}`,
        csBalance: 10000,
        chstBalance: 0,
        totalHashrate: 0,
      }));

      await db.insert(users).values(userValues);

      const duration = Date.now() - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(2000);

      // Verify count
      const result = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(users);

      expect(result[0].count).toBeGreaterThanOrEqual(100);
    });

    it('should handle complex joins without timeout', async () => {
      const user = await createTestUser();
      const eqTypes = await db.select().from(equipmentTypes).limit(5);

      // Insert equipment
      for (const eqType of eqTypes) {
        await db.insert(ownedEquipment).values({
          userId: user.telegramId,
          equipmentTypeId: eqType.id,
          quantity: 1,
          currentHashrate: eqType.baseHashrate,
          upgradeLevel: 0,
        });
      }

      const startTime = Date.now();

      // Complex join query
      const result = await db
        .select({
          userId: users.id,
          username: users.username,
          equipmentName: equipmentTypes.name,
          hashrate: ownedEquipment.currentHashrate,
        })
        .from(users)
        .leftJoin(ownedEquipment, eq(users.telegramId, ownedEquipment.userId))
        .leftJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id))
        .where(eq(users.id, user.id));

      const duration = Date.now() - startTime;

      expect(result.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Transaction Rollback', () => {
    it('should rollback on error in transaction', async () => {
      const user = await createTestUser({ csBalance: 10000 });

      try {
        await db.transaction(async (tx) => {
          // Update balance
          await tx
            .update(users)
            .set({ csBalance: sql`${users.csBalance} + 5000` })
            .where(eq(users.id, user.id));

          // Throw error to trigger rollback
          throw new Error('Test rollback');
        });
      } catch (error) {
        // Expected error
      }

      // Balance should remain unchanged
      const result = await db.select().from(users).where(eq(users.id, user.id)).limit(1);
      expect(result[0].csBalance).toBe(10000);
    });
  });
});
