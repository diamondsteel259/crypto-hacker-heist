import { storage, db } from "./storage";
import { blocks, blockRewards, users } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

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
      console.log(`User hashrates:`, allUsers.map(u => ({ id: u.id, hashrate: u.totalHashrate })));

      if (activeMiners.length === 0) {
        console.log(`Block #${blockNumber} skipped - no active miners.`);
        return;
      }

      const totalNetworkHashrate = activeMiners.reduce(
        (sum, user) => sum + user.totalHashrate, 
        0
      );

      await db.transaction(async (tx: any) => {
        const newBlock = await tx.insert(blocks).values({
          blockNumber,
          reward: BLOCK_REWARD,
          totalHashrate: totalNetworkHashrate,
          totalMiners: activeMiners.length,
          difficulty: 1,
        }).returning();

        const blockId = newBlock[0].id;

        for (const user of activeMiners) {
          const userShare = user.totalHashrate / totalNetworkHashrate;
          const userReward = BLOCK_REWARD * userShare;
          const sharePercent = userShare * 100;

          await tx.insert(blockRewards).values({
            userId: user.id,
            blockId,
            reward: userReward,
            hashrate: user.totalHashrate,
            sharePercent,
          });

          await tx.update(users)
            .set({ 
              csBalance: sql`${users.csBalance} + ${userReward}` 
            })
            .where(eq(users.id, user.id));
        }

        console.log(
          `Block #${blockNumber} mined! Reward: ${BLOCK_REWARD} CS distributed to ${activeMiners.length} miners. Total hashrate: ${totalNetworkHashrate.toFixed(2)} H/s`
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
