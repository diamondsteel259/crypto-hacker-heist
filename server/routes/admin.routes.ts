import type { Express } from "express";
import { db } from "../storage";
import { storage } from "../storage";
import { 
  users, 
  equipmentTypes, 
  ownedEquipment,
  referrals,
  componentUpgrades,
  blockRewards,
  blocks,
  dailyClaims,
  powerUpPurchases,
  lootBoxPurchases,
  activePowerUps,
  packPurchases,
  userPrestige,
  prestigeHistory,
  userSubscriptions,
  userStatistics,
  seasons
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { validateTelegramAuth, requireAdmin } from "../middleware/auth";
import { miningService } from "../mining";

/**
 * Register all admin-only routes
 * All routes require validateTelegramAuth + requireAdmin middleware
 */
export function registerAdminRoutes(app: Express): void {
  
  // ==========================================
  // SETTINGS MANAGEMENT (2 routes)
  // ==========================================
  
  /**
   * GET /api/admin/settings
   * Get all game settings
   */
  app.get("/api/admin/settings", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllGameSettings();
      res.json(settings);
    } catch (error: any) {
      console.error("Get settings error:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  /**
   * POST /api/admin/settings
   * Create or update a game setting
   */
  app.post("/api/admin/settings", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return res.status(400).json({ error: "Key and value are required" });
      }
      const setting = await storage.setGameSetting(key, value);
      res.json(setting);
    } catch (error: any) {
      console.error("Update setting error:", error);
      res.status(500).json({ error: "Failed to update setting" });
    }
  });

  // ==========================================
  // USER MANAGEMENT (3 routes)
  // ==========================================
  
  /**
   * GET /api/admin/users
   * Get all users in the system
   */
  app.get("/api/admin/users", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error: any) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  /**
   * POST /api/admin/users/:userId/admin
   * Grant or revoke admin privileges for a user
   */
  app.post("/api/admin/users/:userId/admin", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { isAdmin } = req.body;
      await storage.setUserAdmin(req.params.userId, isAdmin);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Set admin error:", error);
      res.status(500).json({ error: "Failed to update admin status" });
    }
  });

  /**
   * GET /api/admin/users/:userId/payment-history
   * Get complete payment history for a specific user
   * Includes power-ups, loot boxes, and packs
   */
  app.get("/api/admin/users/:userId/payment-history", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;

      // Query all three payment tables
      const [powerUps, lootBoxes, packs] = await Promise.all([
        db.select().from(powerUpPurchases).where(eq(powerUpPurchases.userId, userId)),
        db.select().from(lootBoxPurchases).where(eq(lootBoxPurchases.userId, userId)),
        db.select().from(packPurchases).where(eq(packPurchases.userId, userId)),
      ]);

      // Transform power-up purchases
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

      // Transform loot box purchases
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

      // Transform pack purchases
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

      // Combine and sort by date (newest first)
      const allPayments = [...powerUpPayments, ...lootBoxPayments, ...packPayments].sort(
        (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
      );

      // Calculate total TON spent
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

  // ==========================================
  // MINING CONTROLS (2 routes)
  // ==========================================
  
  /**
   * POST /api/admin/mining/pause
   * Pause global mining operations
   */
  app.post("/api/admin/mining/pause", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      await storage.setGameSetting('mining_paused', 'true');
      res.json({ success: true, paused: true });
    } catch (error: any) {
      console.error("Pause mining error:", error);
      res.status(500).json({ error: "Failed to pause mining" });
    }
  });

  /**
   * POST /api/admin/mining/resume
   * Resume global mining operations
   */
  app.post("/api/admin/mining/resume", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      await storage.setGameSetting('mining_paused', 'false');
      res.json({ success: true, paused: false });
    } catch (error: any) {
      console.error("Resume mining error:", error);
      res.status(500).json({ error: "Failed to resume mining" });
    }
  });

  // ==========================================
  // BULK OPERATIONS (2 routes)
  // ==========================================
  
  /**
   * DELETE /api/admin/reset-all-users
   * Reset all users to starting state (keeps accounts, resets progress)
   * WARNING: This is a destructive operation
   */
  app.delete("/api/admin/reset-all-users", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const result = await db.transaction(async (tx: any) => {
        // Import all schema tables needed for reset
        const { 
          userDailyChallenges, userAchievements, userCosmetics, 
          userStreaks, userHourlyBonuses, userSpins, spinHistory,
          equipmentPresets, priceAlerts, autoUpgradeSettings,
          packPurchases, userPrestige, prestigeHistory, userSubscriptions, userStatistics
        } = await import("@shared/schema");

        // Delete all data in correct order (respecting foreign keys)
        // Order matters: delete child tables before parent tables
        
        // User-specific data first
        const deletedSpinHistory = await tx.delete(spinHistory);
        const deletedUserSpins = await tx.delete(userSpins);
        const deletedUserHourlyBonuses = await tx.delete(userHourlyBonuses);
        const deletedUserStreaks = await tx.delete(userStreaks);
        const deletedActivePowerUps = await tx.delete(activePowerUps);
        const deletedPowerUpPurchases = await tx.delete(powerUpPurchases);
        const deletedLootBoxPurchases = await tx.delete(lootBoxPurchases);
        const deletedDailyClaims = await tx.delete(dailyClaims);
        const deletedUserDailyChallenges = await tx.delete(userDailyChallenges);
        const deletedUserAchievements = await tx.delete(userAchievements);
        const deletedUserCosmetics = await tx.delete(userCosmetics);
        const deletedEquipmentPresets = await tx.delete(equipmentPresets);
        const deletedPriceAlerts = await tx.delete(priceAlerts);
        const deletedAutoUpgradeSettings = await tx.delete(autoUpgradeSettings);
        const deletedPackPurchases = await tx.delete(packPurchases);
        const deletedPrestigeHistory = await tx.delete(prestigeHistory);
        const deletedUserPrestige = await tx.delete(userPrestige);
        const deletedUserSubscriptions = await tx.delete(userSubscriptions);
        const deletedUserStatistics = await tx.delete(userStatistics);
        
        // Block rewards and blocks
        const deletedBlockRewards = await tx.delete(blockRewards);
        const deletedBlocks = await tx.delete(blocks);
        
        // Equipment-related
        const deletedComponentUpgrades = await tx.delete(componentUpgrades);
        const deletedOwnedEquipment = await tx.delete(ownedEquipment);
        
        // Referrals
        const deletedReferrals = await tx.delete(referrals);

        // Get user count before reset
        const allUsers = await tx.select().from(users);
        const userCount = allUsers.length;

        // Reset all users' balances, hashrate, and progress (keep accounts)
        await tx.update(users).set({
          csBalance: 0,
          chstBalance: 0,
          totalHashrate: 0,
        });

        return {
          success: true,
          users_reset: userCount,
          records_deleted: {
            spin_history: deletedSpinHistory.length || 0,
            user_spins: deletedUserSpins.length || 0,
            user_hourly_bonuses: deletedUserHourlyBonuses.length || 0,
            user_streaks: deletedUserStreaks.length || 0,
            active_power_ups: deletedActivePowerUps.length || 0,
            power_up_purchases: deletedPowerUpPurchases.length || 0,
            loot_box_purchases: deletedLootBoxPurchases.length || 0,
            daily_claims: deletedDailyClaims.length || 0,
            user_daily_challenges: deletedUserDailyChallenges.length || 0,
            user_achievements: deletedUserAchievements.length || 0,
            user_cosmetics: deletedUserCosmetics.length || 0,
            equipment_presets: deletedEquipmentPresets.length || 0,
            price_alerts: deletedPriceAlerts.length || 0,
            auto_upgrade_settings: deletedAutoUpgradeSettings.length || 0,
            pack_purchases: deletedPackPurchases.length || 0,
            prestige_history: deletedPrestigeHistory.length || 0,
            user_prestige: deletedUserPrestige.length || 0,
            user_subscriptions: deletedUserSubscriptions.length || 0,
            user_statistics: deletedUserStatistics.length || 0,
            block_rewards: deletedBlockRewards.length || 0,
            blocks: deletedBlocks.length || 0,
            component_upgrades: deletedComponentUpgrades.length || 0,
            owned_equipment: deletedOwnedEquipment.length || 0,
            referrals: deletedReferrals.length || 0,
          },
          reset_at: new Date().toISOString(),
        };
      });

      // Reset mining service block counter
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

  /**
   * POST /api/admin/recalculate-hashrates
   * Recalculate all users' hashrates from actual equipment
   * Useful for fixing sync issues
   */
  app.post("/api/admin/recalculate-hashrates", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const result = await db.transaction(async (tx: any) => {
        // Get all users
        const allUsers = await tx.select().from(users);
        let usersUpdated = 0;
        const updates = [];

        for (const user of allUsers) {
          // Get user's equipment
          const equipment = await tx.select()
            .from(ownedEquipment)
            .leftJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id))
            .where(eq(ownedEquipment.userId, user.telegramId));

          // Calculate total hashrate from equipment
          const actualHashrate = equipment.reduce((sum: number, row: any) => {
            return sum + (row.owned_equipment?.currentHashrate || 0);
          }, 0);

          // Update if there's a mismatch
          if (user.totalHashrate !== actualHashrate) {
            await tx.update(users)
              .set({ totalHashrate: actualHashrate })
              .where(eq(users.telegramId, user.telegramId));

            usersUpdated++;
            updates.push({
              userId: user.telegramId,
              username: user.username,
              oldHashrate: user.totalHashrate,
              newHashrate: actualHashrate,
              equipmentCount: equipment.length
            });
          }
        }

        return {
          success: true,
          totalUsers: allUsers.length,
          usersUpdated,
          updates: updates.slice(0, 20), // Return first 20 for logging
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

  // ==========================================
  // JACKPOT MANAGEMENT (2 routes)
  // ==========================================
  
  /**
   * GET /api/admin/jackpots
   * Get all jackpot wins with payment status
   */
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

  /**
   * POST /api/admin/jackpots/:jackpotId/mark-paid
   * Mark a jackpot as paid out
   */
  app.post("/api/admin/jackpots/:jackpotId/mark-paid", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { jackpotId } = req.params;
    const { notes } = req.body;
    
    try {
      const { jackpotWins } = await import("@shared/schema");
      const adminUser = req.user; // From auth middleware

      const result = await db.transaction(async (tx: any) => {
        // Get jackpot
        const jackpot = await tx.select().from(jackpotWins)
          .where(eq(jackpotWins.id, parseInt(jackpotId)))
          .limit(1);

        if (!jackpot[0]) {
          throw new Error("Jackpot not found");
        }

        if (jackpot[0].paidOut) {
          throw new Error("Jackpot already marked as paid");
        }

        // Mark as paid
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

  // ==========================================
  // EQUIPMENT MANAGEMENT (1 route)
  // ==========================================
  
  /**
   * POST /api/admin/equipment/:equipmentId/update
   * Update equipment pricing and currency
   */
  app.post("/api/admin/equipment/:equipmentId/update", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { equipmentId } = req.params;
    const { basePrice, currency } = req.body;

    try {
      // Validate inputs
      if (basePrice !== undefined && (typeof basePrice !== 'number' || basePrice < 0)) {
        return res.status(400).json({ error: "Invalid price. Must be a positive number." });
      }

      if (currency !== undefined && !["CS", "CHST", "TON"].includes(currency)) {
        return res.status(400).json({ error: "Invalid currency. Must be CS, CHST, or TON." });
      }

      // Check if equipment exists
      const equipment = await db.select().from(equipmentTypes).where(eq(equipmentTypes.id, equipmentId)).limit(1);
      if (!equipment[0]) {
        return res.status(404).json({ error: "Equipment not found" });
      }

      // Build update object with only provided fields
      const updateData: any = {};
      if (basePrice !== undefined) updateData.basePrice = basePrice;
      if (currency !== undefined) updateData.currency = currency;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid update fields provided" });
      }

      // Update equipment
      await db.update(equipmentTypes)
        .set(updateData)
        .where(eq(equipmentTypes.id, equipmentId));

      // Get updated equipment
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

  // ==========================================
  // FLASH SALES MANAGEMENT (2 routes)
  // ==========================================
  
  /**
   * POST /api/admin/flash-sales
   * Create a new flash sale for equipment
   */
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

  /**
   * POST /api/admin/flash-sales/:saleId/end
   * End a flash sale early
   */
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

  // ==========================================
  // SEASONS MANAGEMENT (4 routes)
  // ==========================================
  
  /**
   * POST /api/admin/seasons
   * Create a new season
   */
  app.post("/api/admin/seasons", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { seasonId, name, description, startDate, endDate, bonusMultiplier, specialRewards } = req.body;

    if (!seasonId || !name || !description || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Check for duplicate seasonId
      const existing = await db.select().from(seasons)
        .where(eq(seasons.seasonId, seasonId))
        .limit(1);

      if (existing.length > 0) {
        return res.status(400).json({ error: "Season ID already exists" });
      }

      const newSeason = await db.insert(seasons).values({
        seasonId,
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        bonusMultiplier: bonusMultiplier || 1.0,
        specialRewards: specialRewards || null,
        isActive: false,
      }).returning();

      res.json({
        success: true,
        message: "Season created successfully",
        season: newSeason[0],
      });
    } catch (error: any) {
      console.error("Create season error:", error);
      res.status(500).json({ error: error.message || "Failed to create season" });
    }
  });

  /**
   * PUT /api/admin/seasons/:seasonId
   * Update an existing season
   */
  app.put("/api/admin/seasons/:seasonId", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { seasonId } = req.params;
    const { name, description, startDate, endDate, bonusMultiplier, specialRewards } = req.body;

    try {
      const existing = await db.select().from(seasons)
        .where(eq(seasons.seasonId, seasonId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: "Season not found" });
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (startDate !== undefined) updateData.startDate = new Date(startDate);
      if (endDate !== undefined) updateData.endDate = new Date(endDate);
      if (bonusMultiplier !== undefined) updateData.bonusMultiplier = bonusMultiplier;
      if (specialRewards !== undefined) updateData.specialRewards = specialRewards;

      const updated = await db.update(seasons)
        .set(updateData)
        .where(eq(seasons.id, existing[0].id))
        .returning();

      res.json({
        success: true,
        message: "Season updated successfully",
        season: updated[0],
      });
    } catch (error: any) {
      console.error("Update season error:", error);
      res.status(500).json({ error: error.message || "Failed to update season" });
    }
  });

  /**
   * POST /api/admin/seasons/:seasonId/toggle
   * Activate or deactivate a season
   */
  app.post("/api/admin/seasons/:seasonId/toggle", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { seasonId } = req.params;
    const { isActive } = req.body;

    try {
      const existing = await db.select().from(seasons)
        .where(eq(seasons.seasonId, seasonId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: "Season not found" });
      }

      // If activating, deactivate all other seasons first
      if (isActive) {
        await db.update(seasons)
          .set({ isActive: false })
          .where(eq(seasons.isActive, true));
      }

      const updated = await db.update(seasons)
        .set({ isActive })
        .where(eq(seasons.id, existing[0].id))
        .returning();

      res.json({
        success: true,
        message: isActive ? "Season activated" : "Season deactivated",
        season: updated[0],
      });
    } catch (error: any) {
      console.error("Toggle season error:", error);
      res.status(500).json({ error: error.message || "Failed to toggle season" });
    }
  });

  /**
   * DELETE /api/admin/seasons/:seasonId
   * Delete a season
   */
  app.delete("/api/admin/seasons/:seasonId", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { seasonId } = req.params;

    try {
      const existing = await db.select().from(seasons)
        .where(eq(seasons.seasonId, seasonId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: "Season not found" });
      }

      await db.delete(seasons)
        .where(eq(seasons.id, existing[0].id));

      res.json({
        success: true,
        message: "Season deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete season error:", error);
      res.status(500).json({ error: error.message || "Failed to delete season" });
    }
  });

  console.log("Admin routes registered: 18 routes across 7 categories");
}
