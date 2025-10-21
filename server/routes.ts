import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, db } from "./storage";
import { insertUserSchema, insertOwnedEquipmentSchema } from "@shared/schema";
import { users, ownedEquipment, equipmentTypes, referrals, componentUpgrades, blockRewards, blocks, dailyClaims, userTasks, powerUpPurchases, lootBoxPurchases, activePowerUps } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { validateTelegramAuth, requireAdmin, verifyUserAccess, type AuthRequest } from "./middleware/auth";
import { verifyTONTransaction, getGameWalletAddress, isValidTONAddress } from "./tonVerification";
import { miningService } from "./mining";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health endpoint for Render
  app.get("/healthz", async (_req, res) => {
    res.status(200).json({ ok: true });
  });
  
  // Auth and user routes
  app.post("/api/auth/telegram", validateTelegramAuth, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let user = await storage.getUserByTelegramId(String(req.telegramUser.id));
    
    if (!user) {
      user = await storage.createUser({
        telegramId: String(req.telegramUser.id),
        username: req.telegramUser.username || `user_${req.telegramUser.id}`,
        firstName: req.telegramUser.first_name,
        lastName: req.telegramUser.last_name,
        photoUrl: req.telegramUser.photo_url,
      });
    } else {
      await storage.updateUserProfile(user.id, {
        username: req.telegramUser.username || user.username,
        firstName: req.telegramUser.first_name,
        lastName: req.telegramUser.last_name,
        photoUrl: req.telegramUser.photo_url,
      });
      user = await storage.getUser(user.id);
    }

    res.json(user);
  });

  app.get("/api/user/:userId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const user = await storage.getUser(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // Equipment catalog routes
  app.get("/api/equipment-types", async (req, res) => {
    try {
      const equipmentTypes = await storage.getAllEquipmentTypes();
      console.log(`Equipment types loaded: ${equipmentTypes.length}`);
      res.json(equipmentTypes);
    } catch (error) {
      console.error("Error loading equipment types:", error);
      res.status(500).json({ error: "Failed to load equipment types" });
    }
  });

  app.get("/api/equipment-types/:category/:tier", async (req, res) => {
    const { category, tier } = req.params;
    const equipmentTypes = await storage.getEquipmentTypesByCategoryAndTier(category, tier);
    res.json(equipmentTypes);
  });

  // User equipment routes
  app.get("/api/user/:userId/equipment", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const equipment = await storage.getUserEquipment(req.params.userId);
    res.json(equipment);
  });

  app.post("/api/user/:userId/equipment/upgrade", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { equipmentTypeId } = req.body;

    if (!equipmentTypeId) {
      return res.status(400).json({ message: "Equipment type ID is required" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        if (!user[0]) throw new Error("User not found");

        const equipmentType = await tx.select().from(equipmentTypes)
          .where(eq(equipmentTypes.id, equipmentTypeId));
        if (!equipmentType[0]) throw new Error("Equipment type not found");

        const owned = await tx.select().from(ownedEquipment)
          .where(and(
            eq(ownedEquipment.userId, userId),
            eq(ownedEquipment.equipmentTypeId, equipmentTypeId)
          ))
          .for('update');

        if (!owned[0]) throw new Error("You don't own this equipment");

        const currentLevel = owned[0].upgradeLevel;
        const maxLevel = 10;
        
        if (currentLevel >= maxLevel) {
          throw new Error("Equipment is already at maximum upgrade level");
        }

        const upgradeCost = Math.floor(equipmentType[0].basePrice * Math.pow(1.5, currentLevel + 1));
        
        if (user[0].csBalance < upgradeCost) {
          throw new Error(`Insufficient Cipher Shards. Need ${upgradeCost} CS`);
        }

        await tx.update(users)
          .set({ 
            csBalance: sql`${users.csBalance} - ${upgradeCost}`
          })
          .where(eq(users.id, userId));

        const newLevel = currentLevel + 1;
        const hashrateBefore = owned[0].currentHashrate;
        const hashrateIncrease = equipmentType[0].baseHashrate * 0.1 * owned[0].quantity;
        const newHashrate = hashrateBefore + hashrateIncrease;

        await tx.update(ownedEquipment)
          .set({
            upgradeLevel: newLevel,
            currentHashrate: newHashrate
          })
          .where(eq(ownedEquipment.id, owned[0].id));

        await tx.update(users)
          .set({
            totalHashrate: sql`${users.totalHashrate} + ${hashrateIncrease}`
          })
          .where(eq(users.id, userId));

        const updatedUser = await tx.select().from(users)
          .where(eq(users.id, userId));

        return {
          success: true,
          user: updatedUser[0],
          upgradeCost,
          newLevel,
          hashrateIncrease
        };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to upgrade equipment" });
    }
  });

  // Component upgrade routes
  app.get("/api/user/:userId/equipment/:equipmentId/components", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, equipmentId } = req.params;

    try {
      const components = await db.select()
        .from(componentUpgrades)
        .innerJoin(ownedEquipment, eq(componentUpgrades.ownedEquipmentId, ownedEquipment.id))
        .where(and(
          eq(ownedEquipment.userId, userId),
          eq(ownedEquipment.id, equipmentId)
        ));

      res.json(components);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to fetch component upgrades" });
    }
  });

  app.post("/api/user/:userId/equipment/:equipmentId/components/upgrade", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, equipmentId } = req.params;
    const { componentType, currency = "CS" } = req.body;

    if (!componentType || !["RAM", "CPU", "Storage", "GPU"].includes(componentType)) {
      return res.status(400).json({ message: "Invalid component type" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        // Get the owned equipment
        const owned = await tx.select()
          .from(ownedEquipment)
          .innerJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id))
          .where(and(
            eq(ownedEquipment.userId, userId),
            eq(ownedEquipment.id, equipmentId)
          ));

        if (!owned[0]) {
          throw new Error("Equipment not found");
        }

        // Get or create component upgrade
        let component = await tx.select()
          .from(componentUpgrades)
          .where(and(
            eq(componentUpgrades.ownedEquipmentId, equipmentId),
            eq(componentUpgrades.componentType, componentType)
          ));

        if (!component[0]) {
          // Create new component upgrade
          const newComponent = await tx.insert(componentUpgrades).values({
            ownedEquipmentId: equipmentId,
            componentType,
            currentLevel: 0,
            maxLevel: 10
          }).returning();
          component = newComponent;
        }

        const currentLevel = component[0].currentLevel;
        if (currentLevel >= component[0].maxLevel) {
          throw new Error("Component is already at maximum level");
        }

        // Calculate upgrade cost based on component type and level
        const baseCost = owned[0].equipmentType.basePrice * 0.1; // 10% of equipment base price
        const componentMultiplier = {
          "RAM": 0.8,
          "CPU": 1.2,
          "Storage": 0.6,
          "GPU": 1.5
        }[componentType] || 1;

        const upgradeCost = Math.floor(baseCost * componentMultiplier * Math.pow(1.15, currentLevel));

        // Check user balance
        const user = await tx.select().from(users).where(eq(users.id, userId));
        const balanceField = currency === "CS" ? "csBalance" : "chstBalance";
        const currentBalance = user[0][balanceField];

        if (currentBalance < upgradeCost) {
          throw new Error(`Insufficient ${currency} balance. Need ${upgradeCost} ${currency}`);
        }

        // Deduct balance and upgrade component
        const newLevel = currentLevel + 1;
        await tx.update(users)
          .set({
            [balanceField]: sql`${balanceField === "csBalance" ? users.csBalance : users.chstBalance} - ${upgradeCost}`
          })
          .where(eq(users.id, userId));

        await tx.update(componentUpgrades)
          .set({
            currentLevel: newLevel,
            updatedAt: sql`NOW()`
          })
          .where(eq(componentUpgrades.id, component[0].id));

        // Calculate hashrate increase (5% per component level)
        const hashrateIncrease = owned[0].equipmentType.baseHashrate * 0.05 * owned[0].ownedEquipment.quantity;
        
        // Update equipment hashrate
        await tx.update(ownedEquipment)
          .set({
            currentHashrate: sql`${ownedEquipment.currentHashrate} + ${hashrateIncrease}`
          })
          .where(eq(ownedEquipment.id, equipmentId));

        // Update user total hashrate
        await tx.update(users)
          .set({
            totalHashrate: sql`${users.totalHashrate} + ${hashrateIncrease}`
          })
          .where(eq(users.id, userId));

        return {
          success: true,
          componentType,
          newLevel,
          upgradeCost,
          hashrateIncrease,
          message: `${componentType} upgraded to level ${newLevel}! +${hashrateIncrease.toFixed(2)} GH/s`
        };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to upgrade component" });
    }
  });

  app.post("/api/user/:userId/equipment/purchase", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    console.log("Purchase request:", { userId, body: req.body });
    
    const parsed = insertOwnedEquipmentSchema.safeParse({ ...req.body, userId });
    if (!parsed.success) {
      console.log("Schema validation failed:", parsed.error);
      return res.status(400).json({ message: "Invalid equipment data", errors: parsed.error });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        if (!user[0]) throw new Error("User not found");

        const equipmentType = await tx.select().from(equipmentTypes)
          .where(eq(equipmentTypes.id, parsed.data.equipmentTypeId));
        if (!equipmentType[0]) {
          console.log("Equipment type not found:", parsed.data.equipmentTypeId);
          throw new Error("Equipment type not found");
        }

        const et = equipmentType[0];
        console.log("Equipment type found:", et);

        const categoryEquipment = await tx.select().from(equipmentTypes)
          .where(and(
            eq(equipmentTypes.category, et.category),
            eq(equipmentTypes.tier, et.tier)
          ))
          .orderBy(equipmentTypes.orderIndex);

        const userEquipment = await tx.select()
          .from(ownedEquipment)
          .where(eq(ownedEquipment.userId, userId))
          .for('update');

        const currentCategoryEquipment = categoryEquipment.filter((e: any) => 
          e.orderIndex < et.orderIndex
        );
        const hasPrevious = currentCategoryEquipment.every((prev: any) => 
          userEquipment.some((owned: any) => owned.equipmentTypeId === prev.id)
        );
        console.log("Previous equipment check:", { 
          currentCategoryEquipment: currentCategoryEquipment.length, 
          hasPrevious, 
          orderIndex: et.orderIndex 
        });

        // Only enforce progression for Basic and Gaming tiers, not ASIC/Server Farm
        if (!hasPrevious && et.orderIndex > 1 && (et.tier === 'Basic' || et.tier === 'Gaming')) {
          throw new Error("Must purchase previous equipment in this category first");
        }

        // Check if this is the first Basic Laptop (Lenovo ThinkPad E14) - should be free
        const isFirstBasicLaptop = parsed.data.equipmentTypeId === 'laptop-lenovo-e14';
        const ownedCount = userEquipment.filter((e: any) => e.equipmentTypeId === parsed.data.equipmentTypeId).length;
        const isFirstPurchase = ownedCount === 0;
        
        // Skip balance check for first Basic Laptop purchase
        if (!isFirstBasicLaptop || !isFirstPurchase) {
          const balanceField = et.currency === 'CS' ? 'csBalance' : 'chstBalance';
          const currentBalance = user[0][balanceField];
          console.log("Balance check:", { balanceField, currentBalance, requiredPrice: et.basePrice, currency: et.currency });

          if (currentBalance < et.basePrice) {
            throw new Error(`Insufficient ${et.currency} balance`);
          }
        } else {
          console.log("First Basic Laptop purchase - skipping balance check");
        }

        const owned = userEquipment.find((e: any) => e.equipmentTypeId === parsed.data.equipmentTypeId);
        if (owned && owned.quantity >= et.maxOwned) {
          throw new Error(`Maximum owned limit reached (${et.maxOwned})`);
        }

        let equipment;
        if (owned) {
          const updated = await tx.update(ownedEquipment)
            .set({
              quantity: sql`${ownedEquipment.quantity} + 1`,
              currentHashrate: sql`${ownedEquipment.currentHashrate} + ${et.baseHashrate}`
            })
            .where(eq(ownedEquipment.id, owned.id))
            .returning();
          equipment = updated[0];
        } else {
          const inserted = await tx.insert(ownedEquipment).values({
            userId,
            equipmentTypeId: parsed.data.equipmentTypeId,
            currentHashrate: et.baseHashrate,
          }).returning();
          equipment = inserted[0];
        }

        // Only deduct balance if not a free purchase
        if (!(isFirstBasicLaptop && isFirstPurchase)) {
          const balanceField = et.currency === 'CS' ? 'csBalance' : 'chstBalance';
          await tx.update(users)
            .set({
              [balanceField]: sql`${balanceField === 'csBalance' ? users.csBalance : users.chstBalance} - ${et.basePrice}`,
              totalHashrate: sql`${users.totalHashrate} + ${et.baseHashrate}`
            })
            .where(eq(users.id, userId));
          console.log(`Paid purchase: Updated user hashrate by +${et.baseHashrate}, deducted ${et.basePrice} ${et.currency}`);
        } else {
          // Free purchase - only update hashrate
          await tx.update(users)
            .set({
              totalHashrate: sql`${users.totalHashrate} + ${et.baseHashrate}`
            })
            .where(eq(users.id, userId));
          console.log(`Free purchase: Updated user hashrate by +${et.baseHashrate}`);
        }

        // Verify the user's updated hashrate
        const updatedUser = await tx.select().from(users).where(eq(users.id, userId));
        console.log(`User ${userId} now has hashrate: ${updatedUser[0]?.totalHashrate}`);

        return equipment;
      });

      res.json(result);
    } catch (error: any) {
      console.error("Purchase error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Block routes
  app.get("/api/blocks", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const blocks = await storage.getLatestBlocks(limit);
    res.json(blocks);
  });

  app.get("/api/blocks/latest", async (req, res) => {
    const block = await storage.getLatestBlock();
    res.json(block);
  });

  // Mining routes - removed public endpoint for security
  // Blocks are only mined by the scheduled background service

  // User rewards
  app.get("/api/user/:userId/rewards", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const rewards = await storage.getUserBlockRewards(req.params.userId, limit);
    res.json(rewards);
  });

  // Referral routes
  app.get("/api/user/:userId/referrals", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const referrals = await storage.getUserReferrals(req.params.userId);
    res.json(referrals);
  });

  app.post("/api/user/:userId/referrals/apply", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ message: "Referral code is required" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        if (!user[0]) throw new Error("User not found");

        if (user[0].referredBy) {
          throw new Error("You have already used a referral code");
        }

        const referrer = await tx.select().from(users)
          .where(eq(users.referralCode, referralCode))
          .for('update');
        if (!referrer[0]) throw new Error("Invalid referral code");

        if (referrer[0].id === userId) {
          throw new Error("You cannot use your own referral code");
        }

        const bonusAmount = 1000;

        await tx.update(users)
          .set({ 
            referredBy: referrer[0].id,
            csBalance: sql`${users.csBalance} + ${bonusAmount}`
          })
          .where(eq(users.id, userId));

        await tx.update(users)
          .set({
            csBalance: sql`${users.csBalance} + ${bonusAmount * 2}`
          })
          .where(eq(users.id, referrer[0].id));

        const [referral] = await tx.insert(referrals).values({
          referrerId: referrer[0].id,
          refereeId: userId,
          bonusEarned: bonusAmount * 2
        }).returning();

        return {
          success: true,
          referral,
          userBonus: bonusAmount,
          referrerBonus: bonusAmount * 2
        };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to apply referral code" });
    }
  });

  // Network stats endpoint
  app.get("/api/user/:userId/network-stats", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const userId = req.params.userId;
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allUsers = await storage.getAllUsers();
    const activeMiners = allUsers.filter(u => u.totalHashrate > 0);
    const totalNetworkHashrate = activeMiners.reduce((sum, u) => sum + u.totalHashrate, 0);
    const userHashrate = user.totalHashrate;
    const networkShare = totalNetworkHashrate > 0 ? (userHashrate / totalNetworkHashrate) * 100 : 0;

    res.json({
      totalNetworkHashrate,
      activeMiners: activeMiners.length,
      userHashrate,
      networkShare
    });
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

  // Admin routes
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

  app.get("/api/admin/users", validateTelegramAuth, requireAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.post("/api/admin/users/:userId/admin", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { isAdmin } = req.body;
    await storage.setUserAdmin(req.params.userId, isAdmin);
    res.json({ success: true });
  });

  app.post("/api/admin/mining/pause", validateTelegramAuth, requireAdmin, async (req, res) => {
    await storage.setGameSetting('mining_paused', 'true');
    res.json({ success: true, paused: true });
  });

  app.post("/api/admin/mining/resume", validateTelegramAuth, requireAdmin, async (req, res) => {
    await storage.setGameSetting('mining_paused', 'false');
    res.json({ success: true, paused: false });
  });

  // Bulk reset all users - admin only
  app.delete("/api/admin/reset-all-users", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const result = await db.transaction(async (tx: any) => {
        // Delete all data in correct order (respecting foreign keys)
        const deletedActivePowerUps = await tx.delete(activePowerUps);
        const deletedPowerUpPurchases = await tx.delete(powerUpPurchases);
        const deletedLootBoxPurchases = await tx.delete(lootBoxPurchases);
        const deletedDailyClaims = await tx.delete(dailyClaims);
        const deletedUserTasks = await tx.delete(userTasks);
        const deletedBlockRewards = await tx.delete(blockRewards);
        const deletedComponentUpgrades = await tx.delete(componentUpgrades);
        const deletedOwnedEquipment = await tx.delete(ownedEquipment);
        const deletedReferrals = await tx.delete(referrals);

        // Get user count before reset
        const allUsers = await tx.select().from(users);
        const userCount = allUsers.length;

        // Reset all users' balances and hashrate (keep accounts)
        await tx.update(users).set({
          csBalance: 0,
          chstBalance: 0,
          totalHashrate: 0,
        });

        return {
          success: true,
          users_reset: userCount,
          records_deleted: {
            active_power_ups: deletedActivePowerUps.length || 0,
            power_up_purchases: deletedPowerUpPurchases.length || 0,
            loot_box_purchases: deletedLootBoxPurchases.length || 0,
            daily_claims: deletedDailyClaims.length || 0,
            user_tasks: deletedUserTasks.length || 0,
            block_rewards: deletedBlockRewards.length || 0,
            component_upgrades: deletedComponentUpgrades.length || 0,
            owned_equipment: deletedOwnedEquipment.length || 0,
            referrals: deletedReferrals.length || 0,
          },
          reset_at: new Date().toISOString(),
        };
      });

      res.json(result);
    } catch (error: any) {
      console.error("Bulk reset error:", error);
      res.status(500).json({
        error: "Reset failed: Database transaction error",
        details: "All changes have been rolled back. Database is in original state.",
      });
    }
  });

  // Task system routes
  
  // Get user's completed tasks
  app.get("/api/user/:userId/tasks/status", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get all completed tasks
      const completedTasks = await db.select().from(userTasks)
        .where(eq(userTasks.userId, user[0].telegramId));

      const completedTaskIds = completedTasks.map(t => t.taskId);

      res.json({
        completed_task_ids: completedTaskIds,
        completed_count: completedTasks.length,
      });
    } catch (error: any) {
      console.error("Get task status error:", error);
      res.status(500).json({ error: "Failed to get task status" });
    }
  });

  // Backward-compatible task claim endpoint (taskId in body)
  app.post("/api/user/:userId/tasks/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        if (!user[0]) throw new Error("User not found");

        // Check if task already claimed
        const existing = await tx.select().from(userTasks)
          .where(and(
            eq(userTasks.userId, user[0].telegramId),
            eq(userTasks.taskId, taskId)
          ))
          .limit(1);

        if (existing.length > 0) {
          return res.status(400).json({
            error: "You've already completed this task.",
            claimed_at: existing[0].claimedAt,
          });
        }

        let rewardCs = 0;
        let rewardChst = 0;
        let conditionsMet = true;
        let errorMsg = "";

        switch (taskId) {
          case "mine-first-block":
            const userEquipment = await tx.select().from(ownedEquipment)
              .where(eq(ownedEquipment.userId, userId));
            if (userEquipment.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to purchase equipment first to mine blocks";
            }
            rewardCs = 1000;
            rewardChst = 10;
            break;
          
          case "reach-1000-hashrate":
            if (user[0].totalHashrate < 1000) {
              conditionsMet = false;
              errorMsg = "You need at least 1,000 H/s total hashrate";
            }
            rewardCs = 2000;
            rewardChst = 20;
            break;
          
          case "buy-first-asic":
            const asicEquipment = await tx.select()
              .from(ownedEquipment)
              .leftJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id))
              .where(and(
                eq(ownedEquipment.userId, userId),
                eq(equipmentTypes.category, "ASIC Rig")
              ));
            if (asicEquipment.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to purchase an ASIC rig first";
            }
            rewardCs = 3000;
            rewardChst = 30;
            break;
          
          case "invite-1-friend":
            const referrals1 = await tx.select().from(referrals)
              .where(eq(referrals.referrerId, userId));
            if (referrals1.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 1 friend first";
            }
            rewardCs = 5000;
            rewardChst = 50;
            break;
          
          case "invite-5-friends":
            const referrals5 = await tx.select().from(referrals)
              .where(eq(referrals.referrerId, userId));
            if (referrals5.length < 5) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 5 friends first";
            }
            rewardCs = 15000;
            rewardChst = 150;
            break;
          
          default:
            return res.status(400).json({ error: "Unknown task ID" });
        }

        if (!conditionsMet) {
          return res.status(400).json({
            error: "Task conditions not met.",
            message: errorMsg,
          });
        }

        // Grant rewards
        await tx.update(users)
          .set({ 
            csBalance: sql`${users.csBalance} + ${rewardCs}`,
            chstBalance: sql`${users.chstBalance} + ${rewardChst}`
          })
          .where(eq(users.id, userId));

        // Record task completion
        await tx.insert(userTasks).values({
          userId: user[0].telegramId,
          taskId,
          rewardCs,
          rewardChst,
        });

        // Get updated balances
        const updatedUser = await tx.select().from(users).where(eq(users.id, userId));

        return {
          success: true,
          taskId,
          reward: {
            cs: rewardCs,
            chst: rewardChst,
          },
          new_balance: {
            cs: updatedUser[0].csBalance,
            chst: updatedUser[0].chstBalance,
          },
          completed_at: new Date().toISOString(),
        };
      });

      if (typeof result === 'object' && 'success' in result) {
        res.json(result);
      }
    } catch (error: any) {
      console.error("Task claim error:", error);
      res.status(500).json({ error: error.message || "Failed to claim task" });
    }
  });

  // Claim task reward with completion tracking (taskId in URL - alternative endpoint)
  app.post("/api/user/:userId/tasks/:taskId/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, taskId } = req.params;

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        if (!user[0]) throw new Error("User not found");

        // Check if task already claimed
        const existing = await tx.select().from(userTasks)
          .where(and(
            eq(userTasks.userId, user[0].telegramId),
            eq(userTasks.taskId, taskId)
          ))
          .limit(1);

        if (existing.length > 0) {
          return res.status(400).json({
            error: "You've already completed this task.",
            claimed_at: existing[0].claimedAt,
          });
        }

        let rewardCs = 0;
        let rewardChst = 0;
        let conditionsMet = true;
        let errorMsg = "";

        switch (taskId) {
          case "mine-first-block":
            const userEquipment = await tx.select().from(ownedEquipment)
              .where(eq(ownedEquipment.userId, userId));
            if (userEquipment.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to purchase equipment first to mine blocks";
            }
            rewardCs = 1000;
            rewardChst = 10;
            break;
          
          case "reach-1000-hashrate":
            if (user[0].totalHashrate < 1000) {
              conditionsMet = false;
              errorMsg = "You need at least 1,000 H/s total hashrate";
            }
            rewardCs = 2000;
            rewardChst = 20;
            break;
          
          case "buy-first-asic":
            const asicEquipment = await tx.select()
              .from(ownedEquipment)
              .leftJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id))
              .where(and(
                eq(ownedEquipment.userId, userId),
                eq(equipmentTypes.category, "ASIC Rig")
              ));
            if (asicEquipment.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to purchase an ASIC rig first";
            }
            rewardCs = 3000;
            rewardChst = 30;
            break;
          
          case "invite-1-friend":
            const referrals1 = await tx.select().from(referrals)
              .where(eq(referrals.referrerId, userId));
            if (referrals1.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 1 friend first";
            }
            rewardCs = 5000;
            rewardChst = 50;
            break;
          
          case "invite-5-friends":
            const referrals5 = await tx.select().from(referrals)
              .where(eq(referrals.referrerId, userId));
            if (referrals5.length < 5) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 5 friends first";
            }
            rewardCs = 15000;
            rewardChst = 150;
            break;
          
          default:
            return res.status(400).json({ error: "Unknown task ID" });
        }

        if (!conditionsMet) {
          return res.status(400).json({
            error: "Task conditions not met.",
            message: errorMsg,
          });
        }

        // Grant rewards
        await tx.update(users)
          .set({ 
            csBalance: sql`${users.csBalance} + ${rewardCs}`,
            chstBalance: sql`${users.chstBalance} + ${rewardChst}`
          })
          .where(eq(users.id, userId));

        // Record task completion
        await tx.insert(userTasks).values({
          userId: user[0].telegramId,
          taskId,
          rewardCs,
          rewardChst,
        });

        // Get updated balances
        const updatedUser = await tx.select().from(users).where(eq(users.id, userId));

        return {
          success: true,
          taskId,
          reward: {
            cs: rewardCs,
            chst: rewardChst,
          },
          new_balance: {
            cs: updatedUser[0].csBalance,
            chst: updatedUser[0].chstBalance,
          },
          completed_at: new Date().toISOString(),
        };
      });

      if (typeof result === 'object' && 'success' in result) {
        res.json(result);
      }
    } catch (error: any) {
      console.error("Task claim error:", error);
      res.status(500).json({ error: error.message || "Failed to claim task" });
    }
  });

  // Power-up system routes - Daily free claims with limits
  app.post("/api/user/:userId/powerups/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { type, timezoneOffset } = req.body;

    if (!type || (type !== "cs" && type !== "chst")) {
      return res.status(400).json({ error: "Invalid claim type. Must be 'cs' or 'chst'." });
    }

    const offset = timezoneOffset || 0;
    
    // Validate timezone offset range
    if (offset < -720 || offset > 840) {
      return res.status(400).json({ error: "Invalid timezone offset" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        // Get user
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        if (!user[0]) throw new Error("User not found");

        // Calculate current date in user's timezone
        const now = Date.now();
        const offsetMs = -offset * 60 * 1000;
        const localTime = now + offsetMs;
        const localDate = new Date(localTime);
        const currentDate = `${localDate.getUTCFullYear()}-${String(localDate.getUTCMonth() + 1).padStart(2, '0')}-${String(localDate.getUTCDate()).padStart(2, '0')}`;

        // Query existing claim record
        const existingClaim = await tx.select().from(dailyClaims)
          .where(and(
            eq(dailyClaims.userId, user[0].telegramId),
            eq(dailyClaims.claimType, type)
          ))
          .limit(1);

        let claimCount = 0;
        let remainingClaims = 0;

        if (existingClaim.length === 0) {
          // First claim ever for this type
          await tx.insert(dailyClaims).values({
            userId: user[0].telegramId,
            claimType: type,
            claimCount: 1,
            lastClaimDate: currentDate,
            userTimezoneOffset: offset,
          });
          claimCount = 1;
          remainingClaims = 4;
        } else {
          const claim = existingClaim[0];
          
          if (claim.lastClaimDate !== currentDate) {
            // New day - reset counter
            await tx.update(dailyClaims)
              .set({
                claimCount: 1,
                lastClaimDate: currentDate,
                userTimezoneOffset: offset,
                updatedAt: new Date(),
              })
              .where(eq(dailyClaims.id, claim.id));
            claimCount = 1;
            remainingClaims = 4;
          } else {
            // Same day - check limit
            if (claim.claimCount >= 5) {
              // Calculate next reset time
              const nextDay = new Date(localDate);
              nextDay.setUTCDate(nextDay.getUTCDate() + 1);
              nextDay.setUTCHours(0, 0, 0, 0);
              const nextResetUtc = new Date(nextDay.getTime() - offsetMs);
              
              const error: any = new Error("Daily limit reached. You've claimed 5/5 times today.");
              error.statusCode = 429;
              error.remaining_claims = 0;
              error.next_reset = nextResetUtc.toISOString();
              throw error;
            }
            
            // Increment count
            await tx.update(dailyClaims)
              .set({
                claimCount: claim.claimCount + 1,
                updatedAt: new Date(),
              })
              .where(eq(dailyClaims.id, claim.id));
            claimCount = claim.claimCount + 1;
            remainingClaims = 5 - claimCount;
          }
        }

        // Grant reward
        const reward = type === "cs" ? 5 : 2;
        const currency = type === "cs" ? "CS" : "CHST";
        
        if (type === "cs") {
          await tx.update(users)
            .set({ csBalance: sql`${users.csBalance} + ${reward}` })
            .where(eq(users.id, userId));
        } else {
          await tx.update(users)
            .set({ chstBalance: sql`${users.chstBalance} + ${reward}` })
            .where(eq(users.id, userId));
        }

        // Get updated balance
        const updatedUser = await tx.select().from(users).where(eq(users.id, userId));

        // Calculate next reset
        const nextDay = new Date(localDate);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        nextDay.setUTCHours(0, 0, 0, 0);
        const nextResetUtc = new Date(nextDay.getTime() - offsetMs);

        return {
          success: true,
          reward,
          currency,
          remaining_claims: remainingClaims,
          next_reset: nextResetUtc.toISOString(),
          new_balance: type === "cs" ? updatedUser[0].csBalance : updatedUser[0].chstBalance,
        };
      });

      res.json(result);
    } catch (error: any) {
      console.error("Daily claim error:", error);
      res.status(500).json({ error: error.message || "Failed to claim reward" });
    }
  });

  // Premium power-up purchase with TON payment
  app.post("/api/user/:userId/powerups/purchase", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { powerUpType, tonTransactionHash, userWalletAddress, tonAmount } = req.body;

    if (!powerUpType || !tonTransactionHash || !userWalletAddress || !tonAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (powerUpType !== "hashrate-boost" && powerUpType !== "luck-boost") {
      return res.status(400).json({ error: "Invalid power-up type" });
    }

    // Validate TON addresses
    if (!isValidTONAddress(userWalletAddress)) {
      return res.status(400).json({ error: "Invalid user wallet address format" });
    }

    const gameWallet = getGameWalletAddress();
    if (!isValidTONAddress(gameWallet)) {
      return res.status(500).json({ error: "Game wallet not configured correctly" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        if (!user[0]) throw new Error("User not found");

        // Check if transaction hash already used
        const existingPurchase = await tx.select().from(powerUpPurchases)
          .where(eq(powerUpPurchases.tonTransactionHash, tonTransactionHash))
          .limit(1);

        if (existingPurchase.length > 0) {
          return res.status(400).json({
            error: "Transaction hash already used. Cannot reuse payment.",
          });
        }

        // Verify transaction on TON blockchain
        console.log(`Verifying TON transaction: ${tonTransactionHash} for ${tonAmount} TON`);
        const verification = await verifyTONTransaction(
          tonTransactionHash,
          tonAmount,
          gameWallet,
          userWalletAddress
        );

        if (!verification.verified) {
          console.error('TON verification failed:', verification.error);
          return res.status(400).json({
            error: verification.error || "Transaction verification failed",
          });
        }

        console.log('TON transaction verified successfully:', verification.transaction);

        // Determine rewards and boost parameters
        let rewardCs = 0;
        let rewardChst = 0;
        let boostPercentage = 0;
        const duration = 60 * 60 * 1000; // 1 hour in milliseconds

        if (powerUpType === "hashrate-boost") {
          rewardCs = 100;
          boostPercentage = 50; // 50% hashrate boost
        } else if (powerUpType === "luck-boost") {
          rewardCs = 50;
          boostPercentage = 20; // 20% luck boost
        }

        // Record purchase
        await tx.insert(powerUpPurchases).values({
          userId: user[0].telegramId,
          powerUpType,
          tonAmount: tonAmount.toString(),
          tonTransactionHash,
          tonTransactionVerified: true,
          rewardCs,
          rewardChst,
        });

        // Grant immediate rewards
        if (rewardCs > 0) {
          await tx.update(users)
            .set({ csBalance: sql`${users.csBalance} + ${rewardCs}` })
            .where(eq(users.id, userId));
        }

        // Activate power-up boost
        const now = new Date();
        const expiresAt = new Date(now.getTime() + duration);
        
        await tx.insert(activePowerUps).values({
          userId: user[0].telegramId,
          powerUpType,
          boostPercentage,
          activatedAt: now,
          expiresAt,
          isActive: true,
        });

        const updatedUser = await tx.select().from(users).where(eq(users.id, userId));

        return {
          success: true,
          powerUpType,
          reward: { cs: rewardCs, chst: rewardChst },
          boost_active: true,
          boost_percentage,
          activated_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          new_balance: {
            cs: updatedUser[0].csBalance,
            chst: updatedUser[0].chstBalance,
          },
          verification: {
            tx_hash: verification.transaction?.hash,
            verified: true,
          },
        };
      });

      if (typeof result === 'object' && 'success' in result) {
        res.json(result);
      }
    } catch (error: any) {
      console.error("Power-up purchase error:", error);
      res.status(500).json({ error: error.message || "Failed to purchase power-up" });
    }
  });

  // Get active power-ups for user
  app.get("/api/user/:userId/powerups/active", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      const now = new Date();

      // Get all active power-ups that haven't expired
      const activePowerUpsList = await db.select().from(activePowerUps)
        .where(and(
          eq(activePowerUps.userId, user[0].telegramId),
          eq(activePowerUps.isActive, true),
          sql`${activePowerUps.expiresAt} > ${now}`
        ));

      // Auto-deactivate expired power-ups
      await db.update(activePowerUps)
        .set({ isActive: false })
        .where(and(
          eq(activePowerUps.userId, user[0].telegramId),
          eq(activePowerUps.isActive, true),
          sql`${activePowerUps.expiresAt} <= ${now}`
        ));

      // Calculate total effects
      let totalHashrateBoost = 0;
      let totalLuckBoost = 0;

      const formattedPowerUps = activePowerUpsList.map(powerUp => {
        if (powerUp.powerUpType === "hashrate-boost") {
          totalHashrateBoost += powerUp.boostPercentage;
        } else if (powerUp.powerUpType === "luck-boost") {
          totalLuckBoost += powerUp.boostPercentage;
        }

        const timeRemaining = Math.max(0, powerUp.expiresAt.getTime() - now.getTime());

        return {
          id: powerUp.id,
          type: powerUp.powerUpType,
          boost_percentage: powerUp.boostPercentage,
          activated_at: powerUp.activatedAt.toISOString(),
          expires_at: powerUp.expiresAt.toISOString(),
          time_remaining_seconds: Math.floor(timeRemaining / 1000),
        };
      });

      res.json({
        active_power_ups: formattedPowerUps,
        effects: {
          total_hashrate_boost: totalHashrateBoost,
          total_luck_boost: totalLuckBoost,
        },
      });
    } catch (error: any) {
      console.error("Get active power-ups error:", error);
      res.status(500).json({ error: "Failed to get active power-ups" });
    }
  });

  // Loot box system routes
  app.post("/api/user/:userId/lootbox/open", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { boxType, tonTransactionHash, userWalletAddress, tonAmount } = req.body;

    if (!boxType) {
      return res.status(400).json({ error: "Box type is required" });
    }

    // Check if this box type requires TON payment
    const paidBoxTypes = ["basic", "advanced", "elite"];
    const requiresPayment = paidBoxTypes.includes(boxType);

    if (requiresPayment && (!tonTransactionHash || !userWalletAddress || !tonAmount)) {
      return res.status(400).json({ error: "Payment verification required for this loot box" });
    }

    // Validate TON addresses if payment required
    if (requiresPayment) {
      if (!isValidTONAddress(userWalletAddress)) {
        return res.status(400).json({ error: "Invalid user wallet address format" });
      }

      const gameWallet = getGameWalletAddress();
      if (!isValidTONAddress(gameWallet)) {
        return res.status(500).json({ error: "Game wallet not configured correctly" });
      }
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        if (!user[0]) throw new Error("User not found");

        // Verify TON transaction if required
        if (requiresPayment) {
          // Check if transaction hash already used
          const existingPurchase = await tx.select().from(lootBoxPurchases)
            .where(eq(lootBoxPurchases.tonTransactionHash, tonTransactionHash))
            .limit(1);

          if (existingPurchase.length > 0) {
            return res.status(400).json({
              error: "Transaction hash already used. Cannot reuse payment.",
            });
          }

          // Verify transaction on TON blockchain
          console.log(`Verifying loot box TON transaction: ${tonTransactionHash} for ${tonAmount} TON`);
          const gameWallet = getGameWalletAddress();
          const verification = await verifyTONTransaction(
            tonTransactionHash,
            tonAmount,
            gameWallet,
            userWalletAddress
          );

          if (!verification.verified) {
            console.error('TON verification failed:', verification.error);
            return res.status(400).json({
              error: verification.error || "Payment verification failed: Transaction not found on blockchain",
            });
          }

          console.log('Loot box TON transaction verified successfully:', verification.transaction);
        }

        // Generate loot box rewards based on type
        let totalCS = 0;
        let totalCHST = 0;
        const equipmentRewards = [];

        switch (boxType) {
          case "basic":
            // Basic box: 0.5 TON
            totalCS = Math.floor(Math.random() * 400) + 300; // 300-700 CS
            totalCHST = Math.floor(Math.random() * 20) + 10; // 10-30 CHST
            break;
          
          case "advanced":
            // Advanced box: 2 TON
            totalCS = Math.floor(Math.random() * 2000) + 2000; // 2000-4000 CS
            totalCHST = Math.floor(Math.random() * 100) + 100; // 100-200 CHST
            // 10% chance for equipment
            if (Math.random() < 0.1) {
              equipmentRewards.push({
                type_id: "gaming-laptop",
                name: "Gaming Laptop",
                quantity: 1,
              });
            }
            break;
          
          case "elite":
            // Elite box: 5 TON
            totalCS = Math.floor(Math.random() * 5000) + 5000; // 5000-10000 CS
            totalCHST = Math.floor(Math.random() * 300) + 200; // 200-500 CHST
            // 25% chance for equipment
            if (Math.random() < 0.25) {
              equipmentRewards.push({
                type_id: "asic-miner-s19",
                name: "ASIC Miner S19",
                quantity: 1,
              });
            }
            break;
          
          default:
            throw new Error("Unknown box type");
        }

        // Apply CS/CHST rewards
        if (totalCS > 0) {
          await tx.update(users)
            .set({ csBalance: sql`${users.csBalance} + ${totalCS}` })
            .where(eq(users.id, userId));
        }

        if (totalCHST > 0) {
          await tx.update(users)
            .set({ chstBalance: sql`${users.chstBalance} + ${totalCHST}` })
            .where(eq(users.id, userId));
        }

        // Store purchase if TON payment was made
        if (requiresPayment) {
          const rewardsJson = JSON.stringify({
            cs: totalCS,
            chst: totalCHST,
            equipment: equipmentRewards,
          });

          await tx.insert(lootBoxPurchases).values({
            userId: user[0].telegramId,
            boxType,
            tonAmount: tonAmount.toString(),
            tonTransactionHash,
            tonTransactionVerified: true,
            rewardsJson,
          });
        }

        // Get updated balances
        const updatedUser = await tx.select().from(users).where(eq(users.id, userId));

        return {
          success: true,
          boxType,
          rewards: {
            cs: totalCS,
            chst: totalCHST,
            equipment: equipmentRewards,
          },
          new_balance: {
            cs: updatedUser[0].csBalance,
            chst: updatedUser[0].chstBalance,
          },
          opened_at: new Date().toISOString(),
          verification: requiresPayment ? {
            verified: true,
            txHash: tonTransactionHash,
          } : undefined,
        };
      });

      if (typeof result === 'object' && 'success' in result) {
        res.json(result);
      }
    } catch (error: any) {
      console.error("Loot box open error:", error);
      res.status(500).json({ error: error.message || "Failed to open loot box" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
