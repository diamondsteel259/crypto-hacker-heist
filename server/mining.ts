import { storage, db } from "./storage";
import { blocks, blockRewards, users, activePowerUps, ownedEquipment, equipmentTypes } from "@shared/schema";
import { eq, sql, and, inArray, sum } from "drizzle-orm";
import { createMiningPausedError, createDatabaseError } from "./errors/apiErrors";
import { measurePerformance, DatabasePerformanceMonitor } from "./utils/performance";

const BLOCK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const BLOCK_REWARD = 100000; // 100K CS (Phase 1: Months 1-6)
const MAX_CONSECUTIVE_FAILURES = 5;
const MINING_TIMEOUT = 4 * 60 * 1000; // 4 minutes (less than block interval)

// Health monitoring state
let lastSuccessfulMine: Date | null = null;
let consecutiveFailures: number = 0;

export class MiningService {
  private intervalId: NodeJS.Timeout | null = null;
  private lastBlockNumber = 0;
  private isMining = false;
  private miningTimeoutId: NodeJS.Timeout | null = null;

  async start() {
    await this.initializeBlockNumber();
    await this.recalculateAllHashrates();
    
    this.intervalId = setInterval(async () => {
      try {
        await this.mineBlock();
      } catch (error) {
        console.error("Error mining block:", error);
      }
    }, BLOCK_INTERVAL);

    console.log(`Mining service started. Blocks will be mined every ${BLOCK_INTERVAL / 1000} seconds.`);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Mining service stopped.");
    }
  }

  async initializeBlockNumber() {
    const latestBlock = await storage.getLatestBlock();
    this.lastBlockNumber = latestBlock?.blockNumber ?? 0;
  }

  async recalculateAllHashrates() {
    console.log("Recalculating all user hashrates from equipment...");
    
    try {
      const result = await DatabasePerformanceMonitor.measureQuery('recalculateHashrates', async () => {
        return db.transaction(async (tx: any) => {
        // Batch 1: Get all users and their equipment hashrates in a single query
        const userHashrates = await tx
          .select({
            telegramId: users.telegramId,
            totalHashrate: sql<number>`COALESCE(SUM(${ownedEquipment.currentHashrate}), 0)`.as('totalHashrate'),
            currentTotalHashrate: users.totalHashrate,
          })
          .from(users)
          .leftJoin(ownedEquipment, eq(users.telegramId, ownedEquipment.userId))
          .groupBy(users.telegramId, users.totalHashrate);

        // Batch 2: Filter users who need updates and update them in bulk
        const usersToUpdate = userHashrates.filter(
          (user: any) => user.currentTotalHashrate !== user.totalHashrate
        );

        if (usersToUpdate.length === 0) {
          return { totalUsers: userHashrates.length, usersUpdated: 0 };
        }

        // Batch 3: Update all users in a single operation using CASE statement
        const updateCases = usersToUpdate
          .map((user: any) => `WHEN ${user.telegramId} THEN ${user.totalHashrate}`)
          .join(' ');

        await tx.execute(sql`
          UPDATE users 
          SET totalHashrate = CASE telegramId ${updateCases} END
          WHERE telegramId IN (${usersToUpdate.map((u: any) => u.telegramId).join(',')})
        `);

        return { 
          totalUsers: userHashrates.length, 
          usersUpdated: usersToUpdate.length 
        };
        });
      });

      console.log(`Hashrate recalculation complete: ${result.usersUpdated}/${result.totalUsers} users updated`);
    } catch (error: any) {
      console.error("Hashrate recalculation error:", error);
      throw createDatabaseError("Failed to recalculate user hashrates", {
        operation: "recalculateAllHashrates",
        originalError: error.message,
      });
    }
  }

  async mineBlock() {
    if (this.isMining) {
      console.log("Mining already in progress, skipping...");
      return;
    }

    const pauseSetting = await storage.getGameSetting('mining_paused');
    if (pauseSetting && pauseSetting.value === 'true') {
      console.log("Mining is paused by admin.");
      return;
    }

    this.isMining = true;
    
    // Timeout protection: Reset flag if mining takes too long
    this.miningTimeoutId = setTimeout(() => {
      if (this.isMining) {
        console.error('[MINING] Mining operation timed out, resetting flag');
        this.isMining = false;
      }
    }, MINING_TIMEOUT);
    
    try {
      const blockNumber = this.lastBlockNumber + 1;
      console.log(`Mining block #${blockNumber}...`);

      // Batch 1: Get active miners and their power-ups in a single query
      const now = new Date();
      const activeMinerData = await DatabasePerformanceMonitor.measureQuery('getActiveMiners', async () => {
        return db
          .select({
            user: users,
            hashrateBoost: sql<number>`COALESCE(SUM(CASE WHEN ${activePowerUps.powerUpType} = 'hashrate-boost' THEN ${activePowerUps.boostPercentage} ELSE 0 END), 0)`.as('hashrateBoost'),
            luckBoost: sql<number>`COALESCE(SUM(CASE WHEN ${activePowerUps.powerUpType} = 'luck-boost' THEN ${activePowerUps.boostPercentage} ELSE 0 END), 0)`.as('luckBoost'),
          })
          .from(users)
          .leftJoin(activePowerUps, and(
            eq(users.telegramId, activePowerUps.userId),
            eq(activePowerUps.isActive, true),
            sql`${activePowerUps.expiresAt} > ${now}`
          ))
          .where(sql`${users.totalHashrate} > 0`)
          .groupBy(users.id, users.telegramId, users.totalHashrate);
      });

      if (activeMinerData.length === 0) {
        console.log(`Block #${blockNumber} skipped - no active miners.`);
        return;
      }

      console.log(`Active miners: ${activeMinerData.length}`);

      // Batch 2: Calculate boosted hashrates and rewards
      let totalNetworkHashrate = 0;
      const minerRewards = activeMinerData.map(({ user, hashrateBoost, luckBoost }) => {
        const boostedHashrate = user.totalHashrate * (1 + hashrateBoost / 100);
        totalNetworkHashrate += boostedHashrate;
        
        return {
          userId: user.id,
          telegramId: user.telegramId,
          boostedHashrate,
          luckBoost,
        };
      });

      // Calculate rewards and prepare bulk insert data
      const rewardsToInsert = minerRewards.map(miner => {
        const userShare = totalNetworkHashrate > 0 ? miner.boostedHashrate / totalNetworkHashrate : 0;
        let userReward = BLOCK_REWARD * userShare;
        
        // Apply luck boost to reward
        if (miner.luckBoost > 0) {
          userReward = userReward * (1 + miner.luckBoost / 100);
        }
        
        const sharePercent = userShare * 100;

        return {
          userId: miner.userId,
          reward: userReward,
          hashrate: miner.boostedHashrate,
          sharePercent,
        };
      });

      // Batch 3: Execute all operations in a single transaction
      await DatabasePerformanceMonitor.measureQuery('mineBlockTransaction', async () => {
        return db.transaction(async (tx: any) => {
        // Insert the block
        const newBlock = await tx.insert(blocks).values({
          blockNumber,
          reward: BLOCK_REWARD,
          totalHashrate: totalNetworkHashrate,
          totalMiners: activeMinerData.length,
          difficulty: 1,
        }).returning();

        const blockId = newBlock[0].id;

        // Bulk insert all rewards
        const rewardInserts = rewardsToInsert.map(reward => ({
          userId: reward.userId,
          blockId,
          reward: reward.reward,
          hashrate: reward.hashrate,
          sharePercent: reward.sharePercent,
        }));

        await tx.insert(blockRewards).values(rewardInserts);

        // Bulk update user balances using CASE statement for better performance
        const balanceUpdateCases = rewardsToInsert
          .map(reward => `WHEN ${reward.userId} THEN ${users.csBalance} + ${reward.reward}`)
          .join(' ');

        await tx.execute(sql`
          UPDATE users 
          SET csBalance = CASE id ${balanceUpdateCases} END
          WHERE id IN (${rewardsToInsert.map(r => r.userId).join(',')})
        `);

        // Auto-expire power-ups that have expired
        await tx.update(activePowerUps)
          .set({ isActive: false })
          .where(and(
            eq(activePowerUps.isActive, true),
            sql`${activePowerUps.expiresAt} <= ${now}`
          ));

        console.log(
          `Block #${blockNumber} mined! Reward: ${BLOCK_REWARD} CS distributed to ${activeMinerData.length} miners. Total hashrate: ${totalNetworkHashrate.toFixed(2)} H/s (with boosts)`
        );
        });
      });

      this.lastBlockNumber = blockNumber;
      
      // Track success
      lastSuccessfulMine = new Date();
      consecutiveFailures = 0;
      console.log('[MINING] Block mined successfully');
    } catch (error: any) {
      // Track failure
      consecutiveFailures++;
      console.error('[MINING] Failed to mine block:', error);
      
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        console.error('[MINING CRITICAL] Mining has failed 5 times consecutively');
        // TODO: Send alert (email, Slack, monitoring service)
      }
      
      if (error.message?.includes('mining_paused')) {
        throw createMiningPausedError();
      }
      
      throw createDatabaseError("Failed to mine block", {
        blockNumber: this.lastBlockNumber + 1,
        operation: "mineBlock",
        originalError: error.message,
      });
    } finally {
      if (this.miningTimeoutId) {
        clearTimeout(this.miningTimeoutId);
        this.miningTimeoutId = null;
      }
      this.isMining = false;
    }
  }
}

export const miningService = new MiningService();

// Health check function for monitoring
export function getMiningHealth() {
  const now = Date.now();
  const fifteenMinutesAgo = now - (15 * 60 * 1000);
  
  const isHealthy = consecutiveFailures < 3 && 
    (lastSuccessfulMine === null || lastSuccessfulMine.getTime() > fifteenMinutesAgo);
  
  return {
    status: isHealthy ? 'healthy' : 'degraded',
    lastSuccessfulMine,
    consecutiveFailures,
    message: !isHealthy ? 'Mining has failed multiple times or not run recently' : undefined
  };
}
