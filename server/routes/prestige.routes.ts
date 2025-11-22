import type { Express } from "express";
import { db } from "../storage";
import { users, userPrestige, prestigeHistory, ownedEquipment, componentUpgrades } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";

export function registerPrestigeRoutes(app: Express): void {
  // Get user's prestige info
  app.get("/api/user/:userId/prestige", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      let prestige = await db.select().from(userPrestige)
        .where(eq(userPrestige.userId, user[0].telegramId!))
        .limit(1);

      if (prestige.length === 0) {
        // Create default prestige record
        const created = await db.insert(userPrestige).values({
          userId: user[0].telegramId!,
          prestigeLevel: 0,
          totalPrestiges: 0,
        }).returning();
        prestige = created;
      }

      const history = await db.select().from(prestigeHistory)
        .where(eq(prestigeHistory.userId, user[0].telegramId!))
        .orderBy(sql`${prestigeHistory.prestigedAt} DESC`)
        .limit(10);

      // Calculate eligibility (need 1M CS and 100 total hashrate)
      const eligible = user[0].csBalance >= 1000000 && user[0].totalHashrate >= 100;

      res.json({
        prestige: prestige[0],
        history,
        eligible,
        currentBoost: prestige[0].prestigeLevel * 5, // 5% per prestige level
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

        // Check eligibility
        if (user[0].csBalance < 1000000 || user[0].totalHashrate < 100) {
          throw new Error("Not eligible for prestige. Need 1M CS and 100 total hashrate.");
        }

        // Get prestige record
        let prestige = await tx.select().from(userPrestige)
          .where(eq(userPrestige.userId, user[0].telegramId!))
          .limit(1);

        if (prestige.length === 0) {
          const created = await tx.insert(userPrestige).values({
            userId: user[0].telegramId!,
            prestigeLevel: 0,
            totalPrestiges: 0,
          }).returning();
          prestige = created;
        }

        const currentPrestige = prestige[0];

        // Get equipment for history
        const equipment = await tx.select().from(ownedEquipment)
          .where(eq(ownedEquipment.userId, userId));

        // Record history
        await tx.insert(prestigeHistory).values({
          userId: user[0].telegramId!,
          fromLevel: currentPrestige.prestigeLevel,
          toLevel: currentPrestige.prestigeLevel + 1,
          csBalanceReset: user[0].csBalance,
          equipmentReset: JSON.stringify(equipment),
        });

        // Update prestige level
        await tx.update(userPrestige)
          .set({
            prestigeLevel: currentPrestige.prestigeLevel + 1,
            totalPrestiges: currentPrestige.totalPrestiges + 1,
            lastPrestigeAt: new Date(),
          })
          .where(eq(userPrestige.id, currentPrestige.id));

        // Reset user (keep CHST, reset CS and equipment)
        await tx.update(users)
          .set({
            csBalance: 0,
            totalHashrate: 0,
          })
          .where(eq(users.id, userId));

        // Delete equipment
        await tx.delete(ownedEquipment)
          .where(eq(ownedEquipment.userId, userId));

        // Delete component upgrades
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
      console.error("Execute prestige error:", error);
      res.status(500).json({ error: error.message || "Failed to execute prestige" });
    }
  });
}