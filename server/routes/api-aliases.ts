import { logger } from "../logger";
import type { Express } from "express";
import { storage, db } from "../storage";
import { validateTelegramAuth } from "../middleware/auth";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";

/**
 * API Route Aliases for Frontend Compatibility
 *
 * This module provides alternate paths that the frontend may be calling
 * which don't match the backend route definitions. These aliases ensure
 * backwards compatibility without breaking existing route structure.
 *
 * Bug Fixes:
 * - Bug #1: Equipment types route mismatch (/api/equipment/types vs /api/equipment-types)
 * - Bug #2: Missing generic leaderboard endpoint (/api/leaderboard)
 */
export function registerApiAliases(app: Express): void {
  // ==========================================
  // Bug #1 Fix: Equipment Types Alias
  // ==========================================
  // Frontend calls: /api/equipment/types
  // Backend has: /api/equipment-types (in routes.ts line 241)
  // Solution: Add alias route that redirects to same logic
  app.get("/api/equipment/types", async (req, res) => {
    try {
      const equipment = await storage.getAllEquipmentTypes();
      res.json(equipment);
    } catch (error) {
      logger.error("Error loading equipment types:", error);
      res.status(500).json({ error: "Failed to load equipment types" });
    }
  });

  // ==========================================
  // Bug #2 Fix: Generic Leaderboard Endpoint
  // ==========================================
  // Frontend calls: /api/leaderboard (with optional sortBy query param)
  // Backend has: /api/leaderboard/hashrate, /api/leaderboard/balance, /api/leaderboard/referrals
  // Solution: Add generic endpoint that routes to appropriate leaderboard
  app.get("/api/leaderboard", validateTelegramAuth, async (req, res) => {
    try {
      const sortBy = (req.query.sortBy as string) || 'balance';
      const limit = parseInt(req.query.limit as string) || 10;

      if (sortBy === 'hashrate') {
        // Hashrate leaderboard
        const topMiners = await db.select({
          id: users.id,
          username: users.username,
          totalHashrate: users.totalHashrate,
          csBalance: users.csBalance,
          photoUrl: users.photoUrl,
        })
          .from(users)
          .orderBy(sql`${users.totalHashrate} DESC`)
          .limit(Math.min(limit, 100));

        return res.json(topMiners);
      }

      // Default: balance leaderboard
      const topBalances = await db.select({
        id: users.id,
        username: users.username,
        csBalance: users.csBalance,
        totalHashrate: users.totalHashrate,
        photoUrl: users.photoUrl,
      })
        .from(users)
        .orderBy(sql`${users.csBalance} DESC`)
        .limit(Math.min(limit, 100));

      res.json(topBalances);
    } catch (error: any) {
      logger.error("Leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
}
