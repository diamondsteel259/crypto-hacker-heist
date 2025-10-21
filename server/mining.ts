import { storage, db } from "./storage";
import { blocks, blockRewards, users, activePowerUps } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";

const BLOCK_INTERVAL = 5 * 60 * 1000; // 5 minutes
const BLOCK_REWARD = 100000; // 100K CS (Phase 1: Months 1-6)

export class MiningService {
  private intervalId: NodeJS.Timeout | null = null;
  private lastBlockNumber = 0;
  private isMining = false;

  async start() {
    await this.initializeBlockNumber();
    
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
    } catch (error) {
      console.error("Error during block mining:", error);
      throw error;
    } finally {
      this.isMining = false;
    }
  }
}

export const miningService = new MiningService();
