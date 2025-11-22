import type { Express } from "express";
import { storage, db } from "../storage";
import { users, userStatistics } from "@shared/schema";
import { eq } from "drizzle-orm";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";

export function registerStatisticsRoutes(app: Express): void {
  // Get user statistics
  app.get("/api/user/:userId/statistics", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    
    try {
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Get or create statistics record
      let stats = await db.select().from(userStatistics)
        .where(eq(userStatistics.userId, user.telegramId!))
        .limit(1);

      if (stats.length === 0) {
        // Create default statistics record
        await db.insert(userStatistics).values({
          userId: user.telegramId!,
          totalCsEarned: 0,
          totalChstEarned: 0,
          totalBlocksMined: 0,
          bestBlockReward: 0,
          highestHashrate: user.totalHashrate || 0,
          totalTonSpent: '0',
          totalCsSpent: 0,
          totalReferrals: 0,
          achievementsUnlocked: 0,
        });

        stats = await db.select().from(userStatistics)
          .where(eq(userStatistics.userId, user.telegramId!))
          .limit(1);
      }

      res.json(stats[0]);
    } catch (error: any) {
      console.error("Get user statistics error:", error);
      res.status(500).json({ error: "Failed to get user statistics" });
    }
  });
}