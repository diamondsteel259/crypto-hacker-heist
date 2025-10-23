import type { Express } from "express";
import { storage, db } from "../storage";
import { users, ownedEquipment, blockRewards, referrals, userStreaks } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";

export function registerUserRoutes(app: Express): void {
  // Get user profile
  app.get("/api/user/:userId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const user = await storage.getUser(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // Get user balance
  app.get("/api/user/:userId/balance", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const user = await storage.getUser(req.params.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      res.json({
        csBalance: user.csBalance,
        chstBalance: user.chstBalance,
      });
    } catch (error: any) {
      console.error("Get balance error:", error);
      res.status(500).json({ error: "Failed to fetch balance" });
    }
  });

  // Get user rank (hashrate and balance) - returns simplified rank for compatibility
  app.get("/api/user/:userId/rank", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Get balance rank (primary ranking metric for tests)
      const balanceRank = await db.select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(sql`${users.csBalance} > ${user.csBalance}`);

      // Get hashrate rank
      const hashrateRank = await db.select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(sql`${users.totalHashrate} > ${user.totalHashrate}`);

      // Get total users
      const totalUsers = await db.select({ count: sql<number>`COUNT(*)` })
        .from(users);

      // Return both formats for compatibility
      res.json({
        rank: (balanceRank[0]?.count || 0) + 1, // Simplified format for tests
        hashrateRank: (hashrateRank[0]?.count || 0) + 1,
        balanceRank: (balanceRank[0]?.count || 0) + 1,
        totalUsers: totalUsers[0]?.count || 0,
        userId,
      });
    } catch (error: any) {
      console.error("User rank error:", error);
      res.status(500).json({ error: "Failed to fetch user rank" });
    }
  });

  // Get user network stats
  app.get("/api/user/:userId/network-stats", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Get total network hashrate
      const networkHashrateResult = await db.select({ 
        total: sql<number>`COALESCE(SUM(${users.totalHashrate}), 0)` 
      }).from(users);

      const networkHashrate = Number(networkHashrateResult[0]?.total || 0);
      const userHashrate = user.totalHashrate || 0;
      const networkShare = networkHashrate > 0 ? userHashrate / networkHashrate : 0;

      res.json({
        userHashrate,
        networkHashrate,
        networkShare,
      });
    } catch (error: any) {
      console.error("Network stats error:", error);
      res.status(500).json({ error: "Failed to fetch network stats" });
    }
  });

  // Get user streak status
  app.get("/api/user/:userId/streak", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Get streak data
      const streakData = await db.select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, user.telegramId!))
        .limit(1);

      const currentStreak = streakData.length > 0 ? streakData[0].currentStreak : 0;
      const longestStreak = streakData.length > 0 ? streakData[0].longestStreak : 0;
      const lastLoginDate = streakData.length > 0 ? streakData[0].lastLoginDate : null;

      res.json({
        currentStreak,
        longestStreak,
        lastLoginDate,
      });
    } catch (error: any) {
      console.error("Get streak error:", error);
      res.status(500).json({ error: "Failed to fetch streak" });
    }
  });

  // Streak check-in
  app.post("/api/user/:userId/streak/checkin", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const today = new Date().toISOString().split('T')[0];

      // Get current streak data
      const streakData = await db.select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, user.telegramId!))
        .limit(1);

      let currentStreak = 1;

      if (streakData.length > 0) {
        const lastLoginDate = new Date(streakData[0].lastLoginDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Check if already checked in today
        if (streakData[0].lastLoginDate === today) {
          return res.status(200).json({
            success: true,
            currentStreak: streakData[0].currentStreak,
            message: "Already checked in today",
          });
        }

        // Check if streak continues (checked in yesterday)
        if (streakData[0].lastLoginDate === yesterdayStr) {
          currentStreak = streakData[0].currentStreak + 1;
        } else {
          // Streak broken, reset to 1
          currentStreak = 1;
        }

        // Update streak
        await db.update(userStreaks)
          .set({
            currentStreak,
            longestStreak: sql`GREATEST(${userStreaks.longestStreak}, ${currentStreak})`,
            lastLoginDate: today,
          })
          .where(eq(userStreaks.userId, user.telegramId!));
      } else {
        // Create new streak
        await db.insert(userStreaks).values({
          userId: user.telegramId!,
          currentStreak: 1,
          longestStreak: 1,
          lastLoginDate: today,
        });
      }

      res.json({
        success: true,
        currentStreak,
        message: `Day ${currentStreak} check-in complete!`,
      });
    } catch (error: any) {
      console.error("Streak check-in error:", error);
      res.status(500).json({ error: "Failed to check in" });
    }
  });

  // Complete tutorial
  app.post("/api/user/:userId/tutorial/complete", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users).where(eq(users.id, userId)).for('update');
        if (!user[0]) throw new Error("User not found");

        if (user[0].tutorialCompleted) {
          return {
            success: true,
            message: "Tutorial already completed",
            alreadyCompleted: true,
          };
        }

        // Mark tutorial as completed and award bonus
        await tx.update(users)
          .set({
            tutorialCompleted: true,
            csBalance: sql`${users.csBalance} + 5000`,
          })
          .where(eq(users.id, userId));

        return {
          success: true,
          message: "Tutorial completed! Earned 5,000 CS bonus",
          bonus: 5000,
        };
      });

      res.json(result);
    } catch (error: any) {
      console.error("Tutorial completion error:", error);
      res.status(500).json({ error: error.message || "Failed to complete tutorial" });
    }
  });

  // Reset user game data
  app.post("/api/user/:userId/reset", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { confirmReset } = req.body;

    if (!confirmReset) {
      return res.status(400).json({ message: "Reset confirmation required" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        // Delete all user's equipment
        await tx.delete(ownedEquipment).where(eq(ownedEquipment.userId, userId));

        // Delete all user's block rewards
        await tx.delete(blockRewards).where(eq(blockRewards.userId, userId));

        // Delete all user's referrals (both as referrer and referee)
        await tx.delete(referrals).where(eq(referrals.referrerId, userId));
        await tx.delete(referrals).where(eq(referrals.refereeId, userId));

        // Reset user balances and hashrate
        await tx.update(users)
          .set({
            csBalance: 0,
            chstBalance: 0,
            totalHashrate: 0
          })
          .where(eq(users.id, userId));

        return { success: true, message: "Game data reset successfully" };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to reset game data" });
    }
  });
}
