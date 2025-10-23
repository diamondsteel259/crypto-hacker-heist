import type { Express } from "express";
import { storage } from "../storage";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";

export function registerMiningRoutes(app: Express): void {
  // Get recent blocks
  app.get("/api/blocks", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const blocks = await storage.getLatestBlocks(limit);
    res.json(blocks);
  });

  // Get latest block
  app.get("/api/blocks/latest", async (req, res) => {
    const block = await storage.getLatestBlock();
    res.json(block);
  });

  // User rewards
  app.get("/api/user/:userId/rewards", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const rewards = await storage.getUserBlockRewards(req.params.userId, limit);
    res.json(rewards);
  });

  // Mining Calendar - View upcoming blocks and estimated rewards
  app.get("/api/user/:userId/mining-calendar", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const hoursAhead = parseInt(req.query.hours as string) || 24;

    try {
      // Get user info
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get latest block to calculate upcoming blocks
      const latestBlock = await storage.getLatestBlock();
      const currentBlockNumber = latestBlock?.blockNumber || 0;

      // Get all active miners for network hashrate calculation
      const allUsers = await storage.getAllUsers();
      const activeMiners = allUsers.filter(u => u.totalHashrate > 0);

      // Calculate total network hashrate (without user's contribution to get peer hashrate)
      const peerHashrate = activeMiners
        .filter(u => u.id !== userId)
        .reduce((sum, u) => sum + u.totalHashrate, 0);
      const totalNetworkHashrate = peerHashrate + user.totalHashrate;

      // Calculate blocks for next X hours
      const BLOCK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
      const BLOCK_REWARD = 100000; // 100K CS
      const blocksAhead = Math.floor((hoursAhead * 60 * 60 * 1000) / BLOCK_INTERVAL_MS);

      const now = new Date();
      const upcomingBlocks = [];

      for (let i = 1; i <= blocksAhead; i++) {
        const blockNumber = currentBlockNumber + i;
        const estimatedTime = new Date(now.getTime() + (i * BLOCK_INTERVAL_MS));

        // Calculate user's share and estimated reward
        const userShare = totalNetworkHashrate > 0 ? user.totalHashrate / totalNetworkHashrate : 0;
        const estimatedReward = BLOCK_REWARD * userShare;

        // Calculate potential reward with power-ups
        const hashrateBoostReward = BLOCK_REWARD * ((user.totalHashrate * 1.5) / (totalNetworkHashrate + user.totalHashrate * 0.5));
        const luckBoostReward = estimatedReward * 1.5;

        upcomingBlocks.push({
          blockNumber,
          estimatedTime: estimatedTime.toISOString(),
          timeUntil: i * 5, // minutes
          estimatedReward: Math.floor(estimatedReward),
          userSharePercent: (userShare * 100).toFixed(4),
          potentialWithHashrateBoost: Math.floor(hashrateBoostReward),
          potentialWithLuckBoost: Math.floor(luckBoostReward),
          recommendPowerUp: i <= 12 && userShare > 0.01, // First hour and significant share
        });
      }

      res.json({
        currentBlock: currentBlockNumber,
        userHashrate: user.totalHashrate,
        networkHashrate: totalNetworkHashrate,
        userSharePercent: totalNetworkHashrate > 0 ? ((user.totalHashrate / totalNetworkHashrate) * 100).toFixed(4) : "0.00",
        blockInterval: "5 minutes",
        upcomingBlocks,
      });
    } catch (error: any) {
      console.error("Mining calendar error:", error);
      res.status(500).json({ error: error.message || "Failed to generate mining calendar" });
    }
  });
}
