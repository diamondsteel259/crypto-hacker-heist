import type { Express } from "express";
import { storage } from "../storage";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";

export function registerMiningRoutes(app: Express) {
  // Get all blocks
  app.get("/api/blocks", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const blocks = await storage.getBlocks(limit);
    res.json(blocks);
  });

  // Get latest block
  app.get("/api/blocks/latest", async (req, res) => {
    const block = await storage.getLatestBlock();
    res.json(block);
  });

  // Get network stats
  app.get("/api/network-stats", async (req, res) => {
    const stats = await storage.getNetworkStats();
    res.json(stats);
  });

  // Get user network stats
  app.get("/api/user/:userId/network-stats", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const stats = await storage.getUserNetworkStats(req.params.userId);
    res.json(stats);
  });
}
