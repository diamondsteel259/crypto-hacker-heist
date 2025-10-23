import type { Express } from "express";
import { storage, db } from "../storage";
import { users, ownedEquipment, blockRewards, referrals } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";

export function registerUserRoutes(app: Express): void {
  // Get user profile
  app.get("/api/user/:userId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const user = await storage.getUser(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // Get user rank (hashrate and balance)
  app.get("/api/user/:userId/rank", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Get hashrate rank
      const hashrateRank = await db.select({ count: sql`COUNT(*)` })
        .from(users)
        .where(sql`${users.totalHashrate} > ${user.totalHashrate}`);

      // Get balance rank
      const balanceRank = await db.select({ count: sql`COUNT(*)` })
        .from(users)
        .where(sql`${users.csBalance} > ${user.csBalance}`);

      // Get total users
      const totalUsers = await db.select({ count: sql`COUNT(*)` })
        .from(users);

      res.json({
        userId,
        hashrateRank: (hashrateRank[0]?.count || 0) + 1,
        balanceRank: (balanceRank[0]?.count || 0) + 1,
        totalUsers: totalUsers[0]?.count || 0,
      });
    } catch (error: any) {
      console.error("User rank error:", error);
      res.status(500).json({ error: "Failed to fetch user rank" });
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
