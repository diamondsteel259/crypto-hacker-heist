import type { Express } from "express";
import { storage, db } from "../storage";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";
import { users, ownedEquipment, blockRewards, referrals, userPrestige, prestigeHistory, componentUpgrades } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export function registerUserRoutes(app: Express) {
  // Get user profile
  app.get("/api/user/:userId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const user = await storage.getUser(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // Get user rank
  app.get("/api/user/:userId/rank", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const hashrateRank = await db.select({ count: sql`COUNT(*)` })
        .from(users)
        .where(sql`${users.totalHashrate} > ${user.totalHashrate}`);

      const balanceRank = await db.select({ count: sql`COUNT(*)` })
        .from(users)
        .where(sql`${users.csBalance} > ${user.csBalance}`);

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

  // User reset route
  app.post("/api/user/:userId/reset", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { confirmReset } = req.body;

    if (!confirmReset) {
      return res.status(400).json({ message: "Reset confirmation required" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        await tx.delete(ownedEquipment).where(eq(ownedEquipment.userId, userId));
        await tx.delete(blockRewards).where(eq(blockRewards.userId, userId));
        await tx.delete(referrals).where(eq(referrals.referrerId, userId));
        await tx.delete(referrals).where(eq(referrals.refereeId, userId));
        
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

  // Get prestige info
  app.get("/api/user/:userId/prestige", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      let prestige = await db.select().from(userPrestige)
        .where(eq(userPrestige.userId, user.telegramId))
        .limit(1);

      if (prestige.length === 0) {
        const created = await db.insert(userPrestige).values({
          userId: user.telegramId,
          prestigeLevel: 0,
          totalPrestiges: 0,
        }).returning();
        prestige = created;
      }

      const history = await db.select().from(prestigeHistory)
        .where(eq(prestigeHistory.userId, user.telegramId))
        .orderBy(sql`${prestigeHistory.prestigedAt} DESC`)
        .limit(10);

      const eligible = user.csBalance >= 1000000 && user.totalHashrate >= 100;

      res.json({
        prestige: prestige[0],
        history,
        eligible,
        currentBoost: prestige[0].prestigeLevel * 5,
      });
    } catch (error: any) {
      console.error("Get prestige error:", error);
      res.status(500).json({ error: error.message || "Failed to get prestige info" });
    }
  });

  // Execute prestige
  app.post("/api/user/:userId/prestige/execute", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        
        if (!user[0]) throw new Error("User not found");

        if (user[0].csBalance < 1000000 || user[0].totalHashrate < 100) {
          throw new Error("Not eligible for prestige. Need 1M CS and 100 total hashrate.");
        }

        let prestige = await tx.select().from(userPrestige)
          .where(eq(userPrestige.userId, user[0].telegramId))
          .limit(1);

        if (prestige.length === 0) {
          const created = await tx.insert(userPrestige).values({
            userId: user[0].telegramId,
            prestigeLevel: 0,
            totalPrestiges: 0,
          }).returning();
          prestige = created;
        }

        const currentPrestige = prestige[0];

        const equipment = await tx.select().from(ownedEquipment)
          .where(eq(ownedEquipment.userId, userId));

        await tx.insert(prestigeHistory).values({
          userId: user[0].telegramId,
          fromLevel: currentPrestige.prestigeLevel,
          toLevel: currentPrestige.prestigeLevel + 1,
          csBalanceReset: user[0].csBalance,
          equipmentReset: JSON.stringify(equipment),
        });

        await tx.update(userPrestige)
          .set({
            prestigeLevel: currentPrestige.prestigeLevel + 1,
            totalPrestiges: currentPrestige.totalPrestiges + 1,
            lastPrestigeAt: new Date(),
          })
          .where(eq(userPrestige.id, currentPrestige.id));

        await tx.update(users)
          .set({
            csBalance: 0,
            totalHashrate: 0,
          })
          .where(eq(users.id, userId));

        await tx.delete(ownedEquipment)
          .where(eq(ownedEquipment.userId, userId));

        await tx.delete(componentUpgrades)
          .where(sql`${componentUpgrades.ownedEquipmentId} IN (SELECT id FROM ${ownedEquipment} WHERE user_id = ${userId})`);

        return { newPrestigeLevel: currentPrestige.prestigeLevel + 1 };
      });

      res.json({
        success: true,
        message: `Prestige ${result.newPrestigeLevel} achieved!`,
        newPrestigeLevel: result.newPrestigeLevel,
        permanentBoost: result.newPrestigeLevel * 5,
      });
    } catch (error: any) {
      console.error("Prestige execution error:", error);
      res.status(500).json({ error: error.message || "Failed to execute prestige" });
    }
  });
}
