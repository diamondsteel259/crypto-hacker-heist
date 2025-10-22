import { storage, db } from "./storage";
import { blocks, blockRewards, users, activePowerUps, ownedEquipment, equipmentTypes } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";

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
      const result = await db.transaction(async (tx: any) => {
        const allUsers = await tx.select().from(users);
        let usersUpdated = 0;

        for (const user of allUsers) {
          // Get user's equipment
          const equipment = await tx.select()
            .from(ownedEquipment)
            .leftJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id))
            .where(eq(ownedEquipment.userId, user.telegramId));

          // Calculate total hashrate from equipment
          const actualHashrate = equipment.reduce((sum: number, row: any) => {
            return sum + (row.owned_equipment?.currentHashrate || 0);
          }, 0);

          // Update if there's a mismatch
          if (user.totalHashrate !== actualHashrate) {
            await tx.update(users)
              .set({ totalHashrate: actualHashrate })
              .where(eq(users.telegramId, user.telegramId));
            usersUpdated++;
          }
        }

        return { totalUsers: allUsers.length, usersUpdated };
      });

      console.log(`Hashrate recalculation complete: ${result.usersUpdated}/${result.totalUsers} users updated`);
    } catch (error) {
      console.error("Hashrate recalculation error:", error);
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

      const allUsers = await storage.getAllUsers();
      const activeMiners = allUsers.filter(user => user.totalHashrate > 0);
      
      console.log(`Total users: ${allUsers.length}, Active miners: ${activeMiners.length}`);

      if (activeMiners.length === 0) {
        console.log(`Block #${blockNumber} skipped - no active miners.`);
        return;
      }

      // Get active power-ups for all users
      const now = new Date();
      const allActivePowerUps = await db.select().from(activePowerUps)
        .where(and(
          eq(activePowerUps.isActive, true),
          sql`${activePowerUps.expiresAt} > ${now}`
        ));

      // Create a map of user power-ups for fast lookup
      const userPowerUps = new Map<string, { hashrateBoost: number; luckBoost: number }>();
      
      for (const powerUp of allActivePowerUps) {
        const existing = userPowerUps.get(powerUp.userId) || { hashrateBoost: 0, luckBoost: 0 };
        
        if (powerUp.powerUpType === 'hashrate-boost') {
          existing.hashrateBoost += powerUp.boostPercentage;
        } else if (powerUp.powerUpType === 'luck-boost') {
          existing.luckBoost += powerUp.boostPercentage;
        }
        
        userPowerUps.set(powerUp.userId, existing);
      }

      // Calculate boosted hashrates for network total
      let totalNetworkHashrate = 0;
      const minerData = activeMiners.map(user => {
        const boosts = userPowerUps.get(user.telegramId) || { hashrateBoost: 0, luckBoost: 0 };
        const boostedHashrate = user.totalHashrate * (1 + boosts.hashrateBoost / 100);
        totalNetworkHashrate += boostedHashrate;
        
        return {
          user,
          boostedHashrate,
          luckBoost: boosts.luckBoost,
        };
      });

      await db.transaction(async (tx: any) => {
        const newBlock = await tx.insert(blocks).values({
          blockNumber,
          reward: BLOCK_REWARD,
          totalHashrate: totalNetworkHashrate,
          totalMiners: activeMiners.length,
          difficulty: 1,
        }).returning();

        const blockId = newBlock[0].id;

        for (const { user, boostedHashrate, luckBoost } of minerData) {
          const userShare = boostedHashrate / totalNetworkHashrate;
          let userReward = BLOCK_REWARD * userShare;
          
          // Apply luck boost to reward
          if (luckBoost > 0) {
            userReward = userReward * (1 + luckBoost / 100);
          }
          
          const sharePercent = userShare * 100;

          await tx.insert(blockRewards).values({
            userId: user.id,
            blockId,
            reward: userReward,
            hashrate: boostedHashrate,
            sharePercent,
          });

          await tx.update(users)
            .set({ 
              csBalance: sql`${users.csBalance} + ${userReward}` 
            })
            .where(eq(users.id, user.id));
        }

        // Auto-expire power-ups that have expired
        await tx.update(activePowerUps)
          .set({ isActive: false })
          .where(and(
            eq(activePowerUps.isActive, true),
            sql`${activePowerUps.expiresAt} <= ${now}`
          ));

        console.log(
          `Block #${blockNumber} mined! Reward: ${BLOCK_REWARD} CS distributed to ${activeMiners.length} miners. Total hashrate: ${totalNetworkHashrate.toFixed(2)} H/s (with boosts)`
        );
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
      
      throw error;
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
