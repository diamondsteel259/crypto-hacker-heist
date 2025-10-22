import type { Express } from "express";
import { validateTelegramAuth, requireAdmin } from "../middleware/auth";
import { storage, db } from "../storage";
import { 
  users, 
  ownedEquipment, 
  equipmentTypes, 
  referrals, 
  componentUpgrades, 
  blockRewards, 
  blocks, 
  dailyClaims, 
  powerUpPurchases, 
  lootBoxPurchases, 
  activePowerUps, 
  priceAlerts, 
  autoUpgradeSettings, 
  seasons,
  packPurchases,
  userPrestige,
  prestigeHistory,
  userSubscriptions,
  userStatistics
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { miningService } from "../mining";

export function registerAdminRoutes(app: Express) {
  // Flash sales management
  app.post("/api/admin/flash-sales", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { flashSales } = await import("@shared/schema");
      const { equipmentId, discountPercentage, durationHours } = req.body;

      if (!equipmentId || !discountPercentage || !durationHours) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (discountPercentage < 10 || discountPercentage > 50) {
        return res.status(400).json({ error: "Discount must be between 10% and 50%" });
      }

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

      const newSale = await db.insert(flashSales).values({
        equipmentId,
        discountPercentage,
        startTime,
        endTime,
        isActive: true,
      }).returning();

      res.json(newSale[0]);
    } catch (error: any) {
      console.error("Create flash sale error:", error);
      res.status(500).json({ error: "Failed to create flash sale" });
    }
  });

  app.post("/api/admin/flash-sales/:saleId/end", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { flashSales } = await import("@shared/schema");
      const { saleId } = req.params;

      await db.update(flashSales)
        .set({ isActive: false })
        .where(eq(flashSales.id, parseInt(saleId)));

      res.json({ success: true });
    } catch (error: any) {
      console.error("End flash sale error:", error);
      res.status(500).json({ error: "Failed to end flash sale" });
    }
  });

  // Settings management
  app.get("/api/admin/settings", validateTelegramAuth, requireAdmin, async (req, res) => {
    const settings = await storage.getAllGameSettings();
    res.json(settings);
  });

  app.post("/api/admin/settings", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { key, value } = req.body;
    if (!key || value === undefined) {
      return res.status(400).json({ error: "Key and value are required" });
    }
    const setting = await storage.setGameSetting(key, value);
    res.json(setting);
  });

  // User management
  app.get("/api/admin/users", validateTelegramAuth, requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post("/api/admin/users/:userId/admin", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { isAdmin } = req.body;
    await storage.setUserAdmin(req.params.userId, isAdmin);
    res.json({ success: true });
  });

  // Get payment history for a specific user
  app.get("/api/admin/users/:userId/payment-history", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;

      const [powerUps, lootBoxes, packs] = await Promise.all([
        db.select().from(powerUpPurchases).where(eq(powerUpPurchases.userId, userId)),
        db.select().from(lootBoxPurchases).where(eq(lootBoxPurchases.userId, userId)),
        db.select().from(packPurchases).where(eq(packPurchases.userId, userId)),
      ]);

      const powerUpPayments = powerUps.map((p) => ({
        id: `powerup-${p.id}`,
        type: "Power-Up" as const,
        itemName: p.powerUpType,
        tonAmount: p.tonAmount,
        transactionHash: p.tonTransactionHash,
        verified: p.tonTransactionVerified,
        rewards: {
          cs: p.rewardCs || 0,
          chst: p.rewardChst || 0,
        },
        purchasedAt: p.purchasedAt,
      }));

      const lootBoxPayments = lootBoxes.map((l) => {
        let rewards = { cs: 0, chst: 0, items: [] as string[] };
        try {
          const parsed = JSON.parse(l.rewardsJson);
          rewards = {
            cs: parsed.cs || 0,
            chst: parsed.chst || 0,
            items: parsed.items || [],
          };
        } catch (e) {
          console.error("Failed to parse loot box rewards:", e);
        }

        return {
          id: `lootbox-${l.id}`,
          type: "Loot Box" as const,
          itemName: l.boxType,
          tonAmount: l.tonAmount,
          transactionHash: l.tonTransactionHash,
          verified: l.tonTransactionVerified,
          rewards,
          purchasedAt: l.purchasedAt,
        };
      });

      const packPayments = packs.map((p) => {
        let rewards = { cs: 0, chst: 0, items: [] as string[] };
        try {
          const parsed = JSON.parse(p.rewardsJson);
          rewards = {
            cs: parsed.cs || 0,
            chst: parsed.chst || 0,
            items: parsed.items || [],
          };
        } catch (e) {
          console.error("Failed to parse pack rewards:", e);
        }

        return {
          id: `pack-${p.id}`,
          type: "Pack" as const,
          itemName: p.packType,
          tonAmount: p.tonAmount,
          transactionHash: p.tonTransactionHash,
          verified: p.tonTransactionVerified,
          rewards,
          purchasedAt: p.purchasedAt,
        };
      });

      const allPayments = [...powerUpPayments, ...lootBoxPayments, ...packPayments].sort(
        (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
      );

      const totalTonSpent = allPayments.reduce((sum, p) => sum + parseFloat(p.tonAmount), 0);

      res.json({
        userId,
        totalPayments: allPayments.length,
        totalTonSpent: totalTonSpent.toFixed(4),
        payments: allPayments,
      });
    } catch (error: any) {
      console.error("Payment history error:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });

  // Mining controls
  app.post("/api/admin/mining/pause", validateTelegramAuth, requireAdmin, async (req, res) => {
    await storage.setGameSetting('mining_paused', 'true');
    res.json({ success: true, paused: true });
  });

  app.post("/api/admin/mining/resume", validateTelegramAuth, requireAdmin, async (req, res) => {
    await storage.setGameSetting('mining_paused', 'false');
    res.json({ success: true, paused: false });
  });

  // Bulk reset all users
  app.delete("/api/admin/reset-all-users", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const result = await db.transaction(async (tx: any) => {
        const { 
          userDailyChallenges, userAchievements, userCosmetics, 
          userStreaks, userHourlyBonuses, userSpins, spinHistory,
          equipmentPresets
        } = await import("@shared/schema");

        await tx.delete(spinHistory);
        await tx.delete(userSpins);
        await tx.delete(userHourlyBonuses);
        await tx.delete(userStreaks);
        await tx.delete(activePowerUps);
        await tx.delete(powerUpPurchases);
        await tx.delete(lootBoxPurchases);
        await tx.delete(dailyClaims);
        await tx.delete(userDailyChallenges);
        await tx.delete(userAchievements);
        await tx.delete(userCosmetics);
        await tx.delete(equipmentPresets);
        await tx.delete(priceAlerts);
        await tx.delete(autoUpgradeSettings);
        await tx.delete(packPurchases);
        await tx.delete(prestigeHistory);
        await tx.delete(userPrestige);
        await tx.delete(userSubscriptions);
        await tx.delete(userStatistics);
        await tx.delete(blockRewards);
        await tx.delete(blocks);
        await tx.delete(componentUpgrades);
        await tx.delete(ownedEquipment);
        await tx.delete(referrals);

        const allUsers = await tx.select().from(users);
        const userCount = allUsers.length;

        await tx.update(users).set({
          csBalance: 0,
          chstBalance: 0,
          totalHashrate: 0,
        });

        return {
          success: true,
          users_reset: userCount,
          reset_at: new Date().toISOString(),
        };
      });

      await miningService.initializeBlockNumber();

      res.json(result);
    } catch (error: any) {
      console.error("Bulk reset error:", error);
      res.status(500).json({
        error: "Reset failed: Database transaction error",
        details: "All changes have been rolled back. Database is in original state.",
      });
    }
  });

  // Recalculate all users' hashrates
  app.post("/api/admin/recalculate-hashrates", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const result = await db.transaction(async (tx: any) => {
        const allUsers = await tx.select().from(users);
        let usersUpdated = 0;

        for (const user of allUsers) {
          const equipment = await tx.select()
            .from(ownedEquipment)
            .leftJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id))
            .where(eq(ownedEquipment.userId, user.telegramId));

          const actualHashrate = equipment.reduce((sum: number, row: any) => {
            return sum + (row.owned_equipment?.currentHashrate || 0);
          }, 0);

          if (user.totalHashrate !== actualHashrate) {
            await tx.update(users)
              .set({ totalHashrate: actualHashrate })
              .where(eq(users.telegramId, user.telegramId));

            usersUpdated++;
          }
        }

        return {
          success: true,
          totalUsers: allUsers.length,
          usersUpdated,
        };
      });

      console.log(`Hashrate recalculation complete: ${result.usersUpdated}/${result.totalUsers} users updated`);
      res.json(result);
    } catch (error: any) {
      console.error("Hashrate recalculation error:", error);
      res.status(500).json({
        error: "Hashrate recalculation failed",
        details: error.message,
      });
    }
  });

  // Jackpot management
  app.get("/api/admin/jackpots", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { jackpotWins } = await import("@shared/schema");
      
      const allJackpots = await db.select().from(jackpotWins)
        .orderBy(sql`${jackpotWins.wonAt} DESC`);

      const unpaidCount = allJackpots.filter(j => !j.paidOut).length;
      const totalPaidOut = allJackpots.filter(j => j.paidOut).length;

      res.json({
        success: true,
        jackpots: allJackpots,
        summary: {
          total_wins: allJackpots.length,
          unpaid: unpaidCount,
          paid: totalPaidOut,
        },
      });
    } catch (error: any) {
      console.error("Get jackpots error:", error);
      res.status(500).json({
        error: "Failed to fetch jackpots",
        details: error.message,
      });
    }
  });

  app.post("/api/admin/jackpots/:jackpotId/mark-paid", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { jackpotId } = req.params;
    const { notes } = req.body;
    
    try {
      const { jackpotWins } = await import("@shared/schema");
      const adminUser = req.user;

      const result = await db.transaction(async (tx: any) => {
        const jackpot = await tx.select().from(jackpotWins)
          .where(eq(jackpotWins.id, parseInt(jackpotId)))
          .limit(1);

        if (!jackpot[0]) {
          throw new Error("Jackpot not found");
        }

        if (jackpot[0].paidOut) {
          throw new Error("Jackpot already marked as paid");
        }

        await tx.update(jackpotWins)
          .set({
            paidOut: true,
            paidAt: new Date(),
            paidByAdmin: adminUser?.telegramId || 'unknown',
            notes: notes || null,
          })
          .where(eq(jackpotWins.id, parseInt(jackpotId)));

        const updated = await tx.select().from(jackpotWins)
          .where(eq(jackpotWins.id, parseInt(jackpotId)))
          .limit(1);

        return updated[0];
      });

      console.log(`Jackpot ${jackpotId} marked as paid by admin ${req.user?.telegramId}`);
      res.json({
        success: true,
        jackpot: result,
        message: "Jackpot marked as paid successfully",
      });
    } catch (error: any) {
      console.error("Mark jackpot paid error:", error);
      res.status(400).json({
        error: error.message || "Failed to mark jackpot as paid",
      });
    }
  });

  // Equipment management
  app.post("/api/admin/equipment/:equipmentId/update", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { equipmentId } = req.params;
    const { basePrice, currency } = req.body;

    try {
      if (basePrice !== undefined && (typeof basePrice !== 'number' || basePrice < 0)) {
        return res.status(400).json({ error: "Invalid price. Must be a positive number." });
      }

      if (currency !== undefined && !["CS", "CHST", "TON"].includes(currency)) {
        return res.status(400).json({ error: "Invalid currency. Must be CS, CHST, or TON." });
      }

      const equipment = await db.select().from(equipmentTypes).where(eq(equipmentTypes.id, equipmentId)).limit(1);
      if (!equipment[0]) {
        return res.status(404).json({ error: "Equipment not found" });
      }

      const updateData: any = {};
      if (basePrice !== undefined) updateData.basePrice = basePrice;
      if (currency !== undefined) updateData.currency = currency;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid update fields provided" });
      }

      await db.update(equipmentTypes)
        .set(updateData)
        .where(eq(equipmentTypes.id, equipmentId));

      const updatedEquipment = await db.select().from(equipmentTypes).where(eq(equipmentTypes.id, equipmentId)).limit(1);

      res.json({
        success: true,
        equipment: updatedEquipment[0],
        message: "Equipment updated successfully"
      });
    } catch (error: any) {
      console.error("Equipment update error:", error);
      res.status(500).json({ error: "Failed to update equipment" });
    }
  });
}
