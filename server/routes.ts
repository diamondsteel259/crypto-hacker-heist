import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, db } from "./storage";
import { insertUserSchema, insertOwnedEquipmentSchema } from "@shared/schema";
import { users, ownedEquipment, equipmentTypes, referrals, componentUpgrades, blockRewards, blocks, dailyClaims, userTasks, powerUpPurchases, lootBoxPurchases, activePowerUps, priceAlerts, autoUpgradeSettings, seasons, packPurchases, userPrestige, prestigeHistory, userSubscriptions, userStatistics, dailyLoginRewards, userStreaks, featureFlags } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { validateTelegramAuth, requireAdmin, verifyUserAccess, type AuthRequest } from "./middleware/auth";
import { verifyTONTransaction, getGameWalletAddress, isValidTONAddress, pollForTransaction } from "./tonVerification";
import { miningService } from "./mining";
import { getBotWebhookHandler } from "./bot";
import { registerModularRoutes } from "./routes/index";

// Helper function to calculate daily login rewards based on streak day
function calculateDailyLoginReward(streakDay: number): { cs: number; chst: number; item: string | null } {
  // Rewards escalate each day, with special bonuses on day 7, 14, 21, etc.
  const baseCs = 500;
  const baseChst = 10;
  
  // Calculate CS reward (increases by 500 each day)
  const cs = baseCs * streakDay;
  
  // Calculate CHST reward (increases by 10 each day)
  const chst = baseChst * streakDay;
  
  // Special items on milestone days
  let item: string | null = null;
  
  if (streakDay % 30 === 0) {
    // Every 30 days: Epic reward
    item = "epic_power_boost";
  } else if (streakDay % 14 === 0) {
    // Every 14 days: Rare reward
    item = "rare_power_boost";
  } else if (streakDay % 7 === 0) {
    // Every 7 days: Common reward
    item = "common_power_boost";
  }
  
  return { cs, chst, item };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Telegram bot webhook handler (for production)
  const botWebhook = getBotWebhookHandler();
  if (botWebhook) {
    app.post(botWebhook.path, botWebhook.handler);
    console.log(`🤖 Telegram webhook registered at ${botWebhook.path}`);
  }
  
  // Register all modular routes (health, auth, user, social, mining, equipment, announcements)
  registerModularRoutes(app);
  
  // Remaining routes that haven't been modularized yet follow below
  // TODO: Migrate these to separate route modules (shop, achievements, gamification)
  
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

  // Get user statistics
  app.get("/api/user/:userId/statistics", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    
    try {
      const { userStatistics } = await import("@shared/schema");
      
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Get or create statistics record
      let stats = await db.select().from(userStatistics)
        .where(eq(userStatistics.userId, user.telegramId))
        .limit(1);

      if (stats.length === 0) {
        // Create default statistics record
        await db.insert(userStatistics).values({
          userId: user.telegramId,
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
          .where(eq(userStatistics.userId, user.telegramId))
          .limit(1);
      }

      res.json(stats[0]);
    } catch (error: any) {
      console.error("Get user statistics error:", error);
      res.status(500).json({ error: "Failed to get user statistics" });
    }
  });

  // Leaderboard endpoints
  app.get("/api/leaderboard/hashrate", validateTelegramAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topMiners = await db.select({
        id: users.id,
        username: users.username,
        totalHashrate: users.totalHashrate,
        csBalance: users.csBalance,
        photoUrl: users.photoUrl,
      })
        .from(users)
        .orderBy(sql`${users.totalHashrate} DESC`)
        .limit(Math.min(limit, 100)); // Max 100 results

      res.json(topMiners);
    } catch (error: any) {
      console.error("Leaderboard hashrate error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/leaderboard/balance", validateTelegramAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topBalances = await db.select({
        id: users.id,
        username: users.username,
        csBalance: users.csBalance,
        totalHashrate: users.totalHashrate,
        photoUrl: users.photoUrl,
      })
        .from(users)
        .orderBy(sql`${users.csBalance} DESC`)
        .limit(Math.min(limit, 100)); // Max 100 results

      res.json(topBalances);
    } catch (error: any) {
      console.error("Leaderboard balance error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/leaderboard/referrals", validateTelegramAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Get users with referral counts
      const topReferrers = await db.select({
        id: users.id,
        username: users.username,
        photoUrl: users.photoUrl,
        referralCount: sql<number>`(SELECT COUNT(*) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId})`,
        totalBonus: sql<number>`(SELECT COALESCE(SUM(${referrals.bonusEarned}), 0) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId})`,
      })
        .from(users)
        .orderBy(sql`(SELECT COUNT(*) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId}) DESC`)
        .limit(Math.min(limit, 100));

      res.json(topReferrers);
    } catch (error: any) {
      console.error("Referral leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch referral leaderboard" });
    }
  });

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

  // Equipment catalog routes
  app.get("/api/equipment-types", async (req, res) => {
    try {
      const equipment = await storage.getAllEquipmentTypes();
      res.json(equipment);
    } catch (error) {
      console.error("Error loading equipment types:", error);
      res.status(500).json({ error: "Failed to load equipment types" });
    }
  });

  // Get active flash sales
  app.get("/api/flash-sales/active", validateTelegramAuth, async (req, res) => {
    try {
      const { flashSales } = await import("@shared/schema");
      const now = new Date();
      
      const activeSales = await db.select()
        .from(flashSales)
        .where(and(
          eq(flashSales.isActive, true),
          sql`${flashSales.startTime} <= ${now}`,
          sql`${flashSales.endTime} > ${now}`
        ));

      res.json(activeSales);
    } catch (error: any) {
      console.error("Get flash sales error:", error);
      res.status(500).json({ error: "Failed to fetch flash sales" });
    }
  });

  // Admin: Create flash sale
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

  // Admin: End flash sale early
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
    const { componentType, currency = "CS", tonTransactionHash, userWalletAddress, tonAmount } = req.body;

    if (!componentType || !["RAM", "CPU", "Storage", "GPU"].includes(componentType)) {
      return res.status(400).json({ message: "Invalid component type" });
    }

    if (!["CS", "TON"].includes(currency)) {
      return res.status(400).json({ message: "Invalid currency. Must be CS or TON" });
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
        const baseCost = owned[0].equipment_types.basePrice * 0.1; // 10% of equipment base price
        const componentMultiplier = {
          "RAM": 0.8,
          "CPU": 1.2,
          "Storage": 0.6,
          "GPU": 1.5
        }[componentType] || 1;

        const upgradeCostCS = Math.floor(baseCost * componentMultiplier * Math.pow(1.15, currentLevel));
        
        // Calculate cost in different currencies
        let upgradeCost = upgradeCostCS;
        if (currency === "TON") {
          upgradeCost = parseFloat((upgradeCostCS / 10000).toFixed(3)); // CS to TON conversion
        }

        // Handle TON payment
        if (currency === "TON") {
          if (!tonTransactionHash || !userWalletAddress || !tonAmount) {
            throw new Error("TON transaction details required");
          }

          // Verify TON amount matches upgrade cost
          if (parseFloat(tonAmount) < upgradeCost) {
            throw new Error(`Insufficient TON amount. Required: ${upgradeCost} TON`);
          }

          // Verify TON transaction
          const isValid = await verifyTONTransaction(
            tonTransactionHash,
            userWalletAddress,
            tonAmount
          );

          if (!isValid) {
            throw new Error("TON transaction verification failed");
          }
        } else {
          // Handle CS payment
          const user = await tx.select().from(users).where(eq(users.id, userId));
          const currentBalance = user[0].csBalance;

          if (currentBalance < upgradeCost) {
            throw new Error(`Insufficient ${currency} balance. Need ${upgradeCost} ${currency}`);
          }

          // Deduct balance
          await tx.update(users)
            .set({
              csBalance: sql`${users.csBalance} - ${upgradeCost}`
            })
            .where(eq(users.id, userId));
        }

        // Upgrade component
        const newLevel = currentLevel + 1;
        await tx.update(componentUpgrades)
          .set({
            currentLevel: newLevel,
            updatedAt: sql`NOW()`
          })
          .where(eq(componentUpgrades.id, component[0].id));

        // Calculate hashrate increase (5% per component level)
        const hashrateIncrease = owned[0].equipment_types.baseHashrate * 0.05 * owned[0].owned_equipment.quantity;
        
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
          currency,
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
    
    const parsed = insertOwnedEquipmentSchema.safeParse({ ...req.body, userId });
    if (!parsed.success) {
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
          throw new Error("Equipment type not found");
        }

        const et = equipmentType[0];

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

          if (currentBalance < et.basePrice) {
            throw new Error(`Insufficient ${et.currency} balance`);
          }
        } else {
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
        } else {
          // Free purchase - only update hashrate
          await tx.update(users)
            .set({
              totalHashrate: sql`${users.totalHashrate} + ${et.baseHashrate}`
            })
            .where(eq(users.id, userId));
        }

        // Verify the user's updated hashrate
        const updatedUser = await tx.select().from(users).where(eq(users.id, userId));

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

  // Mining Calendar - View upcoming blocks and estimated rewards
  app.get("/api/user/:userId/mining-calendar", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const hoursAhead = parseInt(req.query.hours as string) || 24;
    
    try {
      // Get user info
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get latest block to calculate upcoming blocks
      const latestBlock = await storage.getLatestBlock();
      const currentBlockNumber = latestBlock?.blockNumber || 0;

      // Get all active miners for network hashrate calculation
      const allUsers = await storage.getAllUsers();
      const activeMiners = allUsers.filter(u => u.totalHashrate > 0);
      
      // Calculate total network hashrate (without user's contribution to get peer hashrate)
      const peerHashrate = activeMiners
        .filter(u => u.id !== userId)
        .reduce((sum, u) => sum + u.totalHashrate, 0);
      const totalNetworkHashrate = peerHashrate + user.totalHashrate;

      // Calculate blocks for next X hours
      const BLOCK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
      const BLOCK_REWARD = 100000; // 100K CS
      const blocksAhead = Math.floor((hoursAhead * 60 * 60 * 1000) / BLOCK_INTERVAL_MS);
      
      const now = new Date();
      const upcomingBlocks = [];

      for (let i = 1; i <= blocksAhead; i++) {
        const blockNumber = currentBlockNumber + i;
        const estimatedTime = new Date(now.getTime() + (i * BLOCK_INTERVAL_MS));
        
        // Calculate user's share and estimated reward
        const userShare = totalNetworkHashrate > 0 ? user.totalHashrate / totalNetworkHashrate : 0;
        const estimatedReward = BLOCK_REWARD * userShare;
        
        // Calculate potential reward with power-ups
        const hashrateBoostReward = BLOCK_REWARD * ((user.totalHashrate * 1.5) / (totalNetworkHashrate + user.totalHashrate * 0.5));
        const luckBoostReward = estimatedReward * 1.5;
        
        upcomingBlocks.push({
          blockNumber,
          estimatedTime: estimatedTime.toISOString(),
          timeUntil: i * 5, // minutes
          estimatedReward: Math.floor(estimatedReward),
          userSharePercent: (userShare * 100).toFixed(4),
          potentialWithHashrateBoost: Math.floor(hashrateBoostReward),
          potentialWithLuckBoost: Math.floor(luckBoostReward),
          recommendPowerUp: i <= 12 && userShare > 0.01, // First hour and significant share
        });
      }

      res.json({
        currentBlock: currentBlockNumber,
        userHashrate: user.totalHashrate,
        networkHashrate: totalNetworkHashrate,
        userSharePercent: totalNetworkHashrate > 0 ? ((user.totalHashrate / totalNetworkHashrate) * 100).toFixed(4) : "0.00",
        blockInterval: "5 minutes",
        upcomingBlocks,
      });
    } catch (error: any) {
      console.error("Mining calendar error:", error);
      res.status(500).json({ error: error.message || "Failed to generate mining calendar" });
    }
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
      networkShare,
      userSharePercentage: networkShare
    });
  });

  // Public network stats endpoint (no auth required) for reward calculations
  app.get("/api/network-stats", async (req, res) => {
    const allUsers = await storage.getAllUsers();
    const activeMiners = allUsers.filter(u => u.totalHashrate > 0);
    const totalNetworkHashrate = activeMiners.reduce((sum, u) => sum + u.totalHashrate, 0);

    res.json({
      totalHashrate: totalNetworkHashrate,
      activeMiners: activeMiners.length,
      blockReward: 100000 // 100K CS per block
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

  // Feature flags routes
  app.get("/api/admin/feature-flags", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const flags = await db.select().from(featureFlags).orderBy(featureFlags.featureName);
      res.json(flags);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      res.status(500).json({ error: "Failed to fetch feature flags" });
    }
  });

  app.post("/api/admin/feature-flags/:key", validateTelegramAuth, requireAdmin, async (req: AuthRequest, res) => {
    const { key } = req.params;
    const { isEnabled } = req.body;
    
    if (typeof isEnabled !== 'boolean') {
      return res.status(400).json({ error: "isEnabled must be a boolean" });
    }

    try {
      const updated = await db.update(featureFlags)
        .set({ 
          isEnabled, 
          updatedAt: new Date(),
          updatedBy: req.telegramUser?.id?.toString() || 'unknown'
        })
        .where(eq(featureFlags.featureKey, key))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: "Feature flag not found" });
      }

      res.json(updated[0]);
    } catch (error) {
      console.error('Error updating feature flag:', error);
      res.status(500).json({ error: "Failed to update feature flag" });
    }
  });

  // Public endpoint to get enabled features (for navigation)
  app.get("/api/feature-flags", async (req, res) => {
    try {
      const flags = await db.select({
        featureKey: featureFlags.featureKey,
        isEnabled: featureFlags.isEnabled
      }).from(featureFlags);
      
      const enabledFeatures = flags.reduce((acc, flag) => {
        acc[flag.featureKey] = flag.isEnabled;
        return acc;
      }, {} as Record<string, boolean>);
      
      res.json(enabledFeatures);
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      // Return all enabled if error (fail-open)
      res.json({});
    }
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

  // Update user balances - admin only
  app.post("/api/admin/users/:userId/balance", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { csBalance, chstBalance } = req.body;

      if (csBalance === undefined && chstBalance === undefined) {
        return res.status(400).json({ error: "At least one balance must be provided" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Build update object with only provided values
      const updates: any = {};
      if (csBalance !== undefined) updates.csBalance = Math.max(0, Number(csBalance));
      if (chstBalance !== undefined) updates.chstBalance = Math.max(0, Number(chstBalance));

      await db.update(users)
        .set(updates)
        .where(eq(users.id, userId));

      const updatedUser = await storage.getUser(userId);
      res.json({ 
        success: true, 
        user: {
          id: updatedUser?.id,
          username: updatedUser?.username,
          csBalance: updatedUser?.csBalance,
          chstBalance: updatedUser?.chstBalance
        }
      });
    } catch (error: any) {
      console.error("Update balance error:", error);
      res.status(500).json({ error: "Failed to update balance" });
    }
  });

  // Get payment history for a specific user - admin only
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

  // Recalculate all users' hashrates from actual equipment - admin only
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

  // Get all jackpot wins (admin only)
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

  // Mark jackpot as paid (admin only)
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

  // Equipment price management endpoints
  app.post("/api/admin/equipment/:equipmentId/update", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { equipmentId } = req.params;
    const { basePrice, currency } = req.body;

    try {
      // Validate inputs
      if (basePrice !== undefined && (typeof basePrice !== 'number' || basePrice < 0)) {
        return res.status(400).json({ error: "Invalid price. Must be a positive number." });
      }

      if (currency !== undefined && !["CS", "TON"].includes(currency)) {
        return res.status(400).json({ error: "Invalid currency. Must be CS or TON." });
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
      const completed = await db.select().from(userTasks)
        .where(eq(userTasks.userId, user[0].telegramId));

      const completedTaskIds = completed.map(c => c.taskId);

      res.json({
        completed_task_ids: completedTaskIds,
        completed_count: completed.length,
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
            break;
          
          case "reach-1000-hashrate":
            if (user[0].totalHashrate < 1000) {
              conditionsMet = false;
              errorMsg = "You need at least 1,000 H/s total hashrate";
            }
            rewardCs = 2000;
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
            break;
          
          case "invite-1-friend":
            const referrals1 = await tx.select().from(referrals)
              .where(eq(referrals.referrerId, userId));
            if (referrals1.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 1 friend first";
            }
            rewardCs = 5000;
            break;
          
          case "invite-5-friends":
            const referrals5 = await tx.select().from(referrals)
              .where(eq(referrals.referrerId, userId));
            if (referrals5.length < 5) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 5 friends first";
            }
            rewardCs = 15000;
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
          })
          .where(eq(users.id, userId));

        // Record task completion
        await tx.insert(userTasks).values({
          userId: user[0].telegramId,
          taskId,
          rewardCs,
        });

        // Get updated balances
        const updatedUser = await tx.select().from(users).where(eq(users.id, userId));

        return {
          success: true,
          taskId,
          reward: {
            cs: rewardCs,
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
            break;
          
          case "reach-1000-hashrate":
            if (user[0].totalHashrate < 1000) {
              conditionsMet = false;
              errorMsg = "You need at least 1,000 H/s total hashrate";
            }
            rewardCs = 2000;
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
            break;
          
          case "invite-1-friend":
            const referrals1 = await tx.select().from(referrals)
              .where(eq(referrals.referrerId, userId));
            if (referrals1.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 1 friend first";
            }
            rewardCs = 5000;
            break;
          
          case "invite-5-friends":
            const referrals5 = await tx.select().from(referrals)
              .where(eq(referrals.referrerId, userId));
            if (referrals5.length < 5) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 5 friends first";
            }
            rewardCs = 15000;
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
          })
          .where(eq(users.id, userId));

        // Record task completion
        await tx.insert(userTasks).values({
          userId: user[0].telegramId,
          taskId,
          rewardCs,
        });

        // Get updated balances
        const updatedUser = await tx.select().from(users).where(eq(users.id, userId));

        return {
          success: true,
          taskId,
          reward: {
            cs: rewardCs,
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
            .set({
              csBalance: sql`${users.csBalance} + ${reward}`,
            })
            .where(eq(users.id, userId));
        } else {
          await tx.update(users)
            .set({
              chstBalance: sql`${users.chstBalance} + ${reward}`,
            })
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

      res.json({
        success: true,
        reward: result.reward,
        currency: result.currency,
        remaining_claims: result.remaining_claims,
        next_reset: result.next_reset,
        new_balance: result.new_balance,
      });
    } catch (error: any) {
      console.error("Daily claim error:", error);
      
      // Handle rate limit errors (429)
      if (error.statusCode === 429) {
        return res.status(429).json({ 
          error: error.message,
          remaining_claims: error.remaining_claims || 0,
          next_reset: error.next_reset
        });
      }
      
      // Handle validation errors (400)
      if (error.message && (error.message.includes('Invalid') || error.message.includes('not found'))) {
        return res.status(400).json({ error: error.message });
      }
      
      // Generic server error
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

    // Expanded power-up types validation
    const validPowerUps = [
      "hashrate-boost", 
      "luck-boost", 
      "cs-multiplier", 
      "mega-boost", 
      "chst-boost", 
      "duration-extender", 
      "auto-claim"
    ];
    
    if (!validPowerUps.includes(powerUpType)) {
      return res.status(400).json({ 
        error: "Invalid power-up type",
        validTypes: validPowerUps
      });
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
        const user = await tx.select().from(users).where(eq(users.id, userId)).for('update');
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

        // Verify transaction on TON blockchain with polling (waits up to 3 minutes)
        console.log(`⏳ Verifying TON transaction ${tonTransactionHash.substring(0, 12)}... (polling up to 3 minutes)`);
        const verification = await pollForTransaction(
          tonTransactionHash,
          tonAmount,
          gameWallet,
          userWalletAddress
        );

        if (!verification.verified) {
          console.error('TON verification failed:', verification.error);
          return res.status(400).json({
            error: verification.error || "Transaction not found on blockchain. It may still be processing or the hash is incorrect.",
            message: "Please ensure the transaction was sent and wait a moment before trying again.",
          });
        }


        // Determine rewards and boost parameters based on power-up type
        let rewardCs = 0;
        let rewardChst = 0;
        let boostPercentage = 0;
        let duration = 60 * 60 * 1000; // Default: 1 hour in milliseconds

        switch (powerUpType) {
          case "hashrate-boost":
            rewardCs = 100;
            boostPercentage = 50; // 50% hashrate boost
            duration = 60 * 60 * 1000; // 1 hour
            break;
            
          case "luck-boost":
            rewardCs = 50;
            boostPercentage = 20; // 20% luck boost
            duration = 60 * 60 * 1000; // 1 hour
            break;
            
          case "cs-multiplier":
            rewardCs = 200;
            boostPercentage = 100; // 2x CS earnings (100% increase)
            duration = 2 * 60 * 60 * 1000; // 2 hours
            break;
            
          case "mega-boost":
            rewardCs = 500;
            rewardChst = 50;
            boostPercentage = 75; // 75% combined boost to hashrate and luck
            duration = 3 * 60 * 60 * 1000; // 3 hours
            break;
            
          case "chst-boost":
            rewardChst = 100;
            boostPercentage = 50; // 50% more CHST from mining
            duration = 2 * 60 * 60 * 1000; // 2 hours
            break;
            
          case "duration-extender":
            rewardCs = 150;
            boostPercentage = 0; // No direct boost, extends other active boosts
            duration = 60 * 60 * 1000; // Extends by 1 hour
            
            // Extend all active power-ups by 1 hour
            const now = new Date();
            await tx.update(activePowerUps)
              .set({ 
                expiresAt: sql`${activePowerUps.expiresAt} + interval '1 hour'` 
              })
              .where(and(
                eq(activePowerUps.userId, user[0].telegramId),
                eq(activePowerUps.isActive, true),
                sql`${activePowerUps.expiresAt} > ${now}`
              ));
            break;
            
          case "auto-claim":
            rewardCs = 300;
            boostPercentage = 0; // Special boost - enables auto-claiming
            duration = 24 * 60 * 60 * 1000; // 24 hours
            break;
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
          boost_percentage: boostPercentage,
          duration_hours: duration / (60 * 60 * 1000),
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
          time_remaining_seconds: Math.floor(timeRemaining / 1000 / 60),
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

  // ==========================================
  // LOOT BOX / MYSTERY BOX ROUTES
  // ==========================================

  app.post("/api/user/:userId/lootbox/open", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { boxType, tonTransactionHash, userWalletAddress, tonAmount } = req.body;

    if (!boxType) {
      return res.status(400).json({ error: "Box type is required" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        if (!user[0]) throw new Error("User not found");

        // Define box types and their rewards
        const boxRewards: Record<string, { tonCost: number; minCS: number; maxCS: number; }> = {
          'basic': { tonCost: 0.5, minCS: 50000, maxCS: 55000 }, // 100-110% RTP
          'premium': { tonCost: 2, minCS: 200000, maxCS: 220000 },
          'epic': { tonCost: 5, minCS: 500000, maxCS: 550000 },
          'daily-task': { tonCost: 0, minCS: 5000, maxCS: 10000 }, // Free box
          'invite-friend': { tonCost: 0, minCS: 10000, maxCS: 15000 }, // Free box
        };

        const boxConfig = boxRewards[boxType];
        if (!boxConfig) {
          throw new Error("Invalid box type");
        }

        // Handle TON payment boxes
        if (boxConfig.tonCost > 0) {
          if (!tonTransactionHash || !userWalletAddress || !tonAmount) {
            throw new Error("TON transaction details required for paid boxes");
          }

          // Verify TON amount matches box cost
          if (parseFloat(tonAmount) < boxConfig.tonCost) {
            throw new Error(`Insufficient TON amount. Required: ${boxConfig.tonCost} TON`);
          }

          // Get game wallet address
          const gameWallet = getGameWalletAddress();

          // Check if transaction was already used
          const existingPurchase = await tx.select().from(lootBoxPurchases)
            .where(eq(lootBoxPurchases.tonTransactionHash, tonTransactionHash))
            .limit(1);

          if (existingPurchase.length > 0) {
            throw new Error("This transaction has already been used");
          }

          // Verify TON transaction with polling (wait up to 3 minutes)
          console.log(`⏳ Verifying loot box transaction ${tonTransactionHash.substring(0, 12)}...`);
          const verification = await pollForTransaction(
            tonTransactionHash,
            tonAmount,
            gameWallet,
            userWalletAddress
          );

          if (!verification.verified) {
            throw new Error(verification.error || "Transaction verification failed");
          }
        } else {
          // Free boxes - check if user has available boxes to open
          if (boxType === 'daily-task') {
            if (user[0].freeLootBoxes <= 0) {
              throw new Error("No free daily task loot boxes available. Complete tasks to earn more.");
            }
            // Decrement free loot box count
            await tx.update(users)
              .set({ freeLootBoxes: user[0].freeLootBoxes - 1 })
              .where(eq(users.id, userId));
          } else if (boxType === 'invite-friend') {
            if (user[0].inviteLootBoxes <= 0) {
              throw new Error("No invite reward loot boxes available. Invite friends to earn more.");
            }
            // Decrement invite loot box count
            await tx.update(users)
              .set({ inviteLootBoxes: user[0].inviteLootBoxes - 1 })
              .where(eq(users.id, userId));
          }
        }

        // Calculate random reward (CS currency)
        const csReward = Math.floor(
          boxConfig.minCS + Math.random() * (boxConfig.maxCS - boxConfig.minCS)
        );

        // Determine if user gets bonus items (10% chance for premium/epic)
        const bonusChance = boxType === 'epic' ? 0.2 : boxType === 'premium' ? 0.1 : 0;
        const getBonus = Math.random() < bonusChance;

        const rewards: any = {
          cs: csReward,
        };

        // Add bonus rewards
        if (getBonus) {
          const bonusType = Math.random();
          if (bonusType < 0.5) {
            // CHST bonus
            rewards.chst = Math.floor(csReward * 0.1); // 10% of CS reward in CHST
          } else {
            // Free spin bonus
            rewards.freeSpins = boxType === 'epic' ? 3 : 1;
          }
        }

        // Update user balance
        await tx.update(users)
          .set({
            csBalance: sql`${users.csBalance} + ${rewards.cs}`,
            ...(rewards.chst && { chstBalance: sql`${users.chstBalance} + ${rewards.chst}` }),
          })
          .where(eq(users.id, userId));

        // Record purchase if TON was paid
        if (boxConfig.tonCost > 0) {
          await tx.insert(lootBoxPurchases).values({
            userId: user[0].telegramId,
            boxType,
            tonAmount: tonAmount.toString(),
            tonTransactionHash,
            tonTransactionVerified: true,
            rewardsJson: JSON.stringify(rewards),
          });
        }

        // Get updated user balance
        const updatedUser = await tx.select().from(users)
          .where(eq(users.id, userId))
          .limit(1);

        return {
          success: true,
          rewards,
          newBalance: {
            cs: updatedUser[0].csBalance,
            chst: updatedUser[0].chstBalance,
          },
        };
      });

      res.json(result);
    } catch (error: any) {
      console.error("Loot box open error:", error);
      res.status(400).json({ error: error.message || "Failed to open loot box" });
    }
  });
  // ==========================================
  // SPIN WHEEL ROUTES
  // ==========================================

  // Get user's spin status (free spin available, paid spins count)
  app.get("/api/user/:userId/spin/status", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const { userSpins } = await import("@shared/schema");
      
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Get today's spin record
      const spinRecord = await db.select().from(userSpins)
        .where(and(
          eq(userSpins.userId, user[0].telegramId),
          eq(userSpins.spinDate, today)
        ))
        .limit(1);

      if (spinRecord.length === 0) {
        // No spins today - free spin available
        return res.json({
          freeSpinAvailable: true,
          freeSpinUsed: false,
          paidSpinsCount: 0,
        });
      }

      res.json({
        freeSpinAvailable: !spinRecord[0].freeSpinUsed,
        freeSpinUsed: spinRecord[0].freeSpinUsed,
        paidSpinsCount: spinRecord[0].paidSpinsCount,
      });
    } catch (error: any) {
      console.error("Get spin status error:", error);
      res.status(500).json({ error: "Failed to get spin status" });
    }
  });

  // Spin the wheel (free or paid)
  app.post("/api/user/:userId/spin", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { isFree, quantity, tonTransactionHash, userWalletAddress, tonAmount } = req.body;

    if (typeof isFree !== 'boolean') {
      return res.status(400).json({ error: "isFree parameter is required" });
    }

    const spinQuantity = quantity || 1;

    if (spinQuantity < 1 || spinQuantity > 20) {
      return res.status(400).json({ error: "Quantity must be between 1 and 20" });
    }

    try {
      const { userSpins, spinHistory, jackpotWins } = await import("@shared/schema");

      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users).where(eq(users.id, userId)).for('update');
        if (!user[0]) throw new Error("User not found");

        const today = new Date().toISOString().split('T')[0];

        // Get or create today's spin record
        let spinRecord = await tx.select().from(userSpins)
          .where(and(
            eq(userSpins.userId, user[0].telegramId),
            eq(userSpins.spinDate, today)
          ))
          .limit(1);

        if (isFree) {
          // Free spin logic
          if (spinRecord.length > 0 && spinRecord[0].freeSpinUsed) {
            throw new Error("Free spin already used today. Come back tomorrow!");
          }

          // Mark free spin as used
          if (spinRecord.length === 0) {
            await tx.insert(userSpins).values({
              userId: user[0].telegramId,
              spinDate: today,
              freeSpinUsed: true,
              paidSpinsCount: 0,
            });
          } else {
            await tx.update(userSpins)
              .set({ freeSpinUsed: true, lastSpinAt: new Date() })
              .where(and(
                eq(userSpins.userId, user[0].telegramId),
                eq(userSpins.spinDate, today)
              ));
          }
        } else {
          // Paid spin logic
          if (!tonTransactionHash || !userWalletAddress || !tonAmount) {
            throw new Error("TON transaction details required for paid spins");
          }

          // Validate pricing
          const pricing: Record<number, number> = {
            1: 0.1,
            10: 0.9,
            20: 1.7,
          };

          const expectedCost = pricing[spinQuantity];
          if (!expectedCost) {
            throw new Error("Invalid spin quantity. Must be 1, 10, or 20");
          }

          if (parseFloat(tonAmount) < expectedCost) {
            throw new Error(`Insufficient TON amount. Required: ${expectedCost} TON`);
          }

          // Get game wallet address
          const gameWallet = getGameWalletAddress();

          // Check if transaction was already used (prevent double-spend)
          const existingPurchase = await tx.select().from(spinHistory)
            .where(sql`prize_value = ${tonTransactionHash}`)
            .limit(1);

          if (existingPurchase.length > 0) {
            throw new Error("This transaction has already been used");
          }

          // Verify TON transaction with polling
          console.log(`⏳ Verifying spin wheel transaction ${tonTransactionHash.substring(0, 12)}...`);
          const verification = await pollForTransaction(
            tonTransactionHash,
            tonAmount,
            gameWallet,
            userWalletAddress
          );

          if (!verification.verified) {
            throw new Error(verification.error || "Transaction verification failed");
          }

          // Update paid spins count
          if (spinRecord.length === 0) {
            await tx.insert(userSpins).values({
              userId: user[0].telegramId,
              spinDate: today,
              freeSpinUsed: false,
              paidSpinsCount: spinQuantity,
            });
          } else {
            await tx.update(userSpins)
              .set({ 
                paidSpinsCount: spinRecord[0].paidSpinsCount + spinQuantity,
                lastSpinAt: new Date(),
              })
              .where(and(
                eq(userSpins.userId, user[0].telegramId),
                eq(userSpins.spinDate, today)
              ));
          }
        }

        // Execute spins and generate prizes
        const prizes: any[] = [];
        let totalCs = 0;
        let jackpotWon = false;

        for (let i = 0; i < spinQuantity; i++) {
          const prize = generateSpinPrize(isFree);
          prizes.push(prize);

          // Apply rewards
          if (prize.type === 'cs') {
            totalCs += prize.value;
          } else if (prize.type === 'jackpot') {
            jackpotWon = true;
            // Record jackpot win
            await tx.insert(jackpotWins).values({
              userId: user[0].telegramId,
              username: user[0].username || user[0].telegramId,
              walletAddress: userWalletAddress || null,
              amount: "1.0",
              paidOut: false,
            });
          } else if (prize.type === 'powerup') {
            // Grant power-up (add to active power-ups)
            const powerUpType = prize.value;
            const duration = 60 * 60 * 1000; // 1 hour
            const expiresAt = new Date(Date.now() + duration);
            
            await tx.insert(activePowerUps).values({
              userId: user[0].telegramId,
              powerUpType,
              boostPercentage: 50,
              expiresAt,
              isActive: true,
            });
          } else if (prize.type === 'equipment') {
            // Grant random basic equipment
            const equipmentId = prize.value;
            
            // Check if user already owns this equipment
            const existing = await tx.select().from(ownedEquipment)
              .where(and(
                eq(ownedEquipment.userId, user[0].telegramId),
                eq(ownedEquipment.equipmentTypeId, equipmentId)
              ))
              .limit(1);

            if (existing.length > 0) {
              // Increment quantity
              await tx.update(ownedEquipment)
                .set({ quantity: existing[0].quantity + 1 })
                .where(eq(ownedEquipment.id, existing[0].id));
            } else {
              // Add new equipment
              const equipmentInfo = await tx.select().from(equipmentTypes)
                .where(eq(equipmentTypes.id, equipmentId))
                .limit(1);

              if (equipmentInfo.length > 0) {
                await tx.insert(ownedEquipment).values({
                  userId: user[0].telegramId,
                  equipmentTypeId: equipmentId,
                  quantity: 1,
                  upgradeLevel: 0,
                  currentHashrate: equipmentInfo[0].baseHashrate,
                  acquiredVia: 'spin_wheel',
                });
              }
            }
          }

          // Record in spin history
          await tx.insert(spinHistory).values({
            userId: user[0].telegramId,
            prizeType: prize.type,
            prizeValue: prize.type === 'equipment' ? prize.value : prize.value.toString(),
            wasFree: isFree,
          });
        }

        // Update user balances
        if (totalCs > 0) {
          await tx.update(users)
            .set({
              csBalance: sql`${users.csBalance} + ${totalCs}`,
            })
            .where(eq(users.id, userId));
        }

        // Get updated user
        const updatedUser = await tx.select().from(users).where(eq(users.id, userId)).limit(1);

        return {
          success: true,
          prizes,
          summary: {
            total_cs: totalCs,
            jackpot_won: jackpotWon,
            spins_completed: spinQuantity,
          },
          message: jackpotWon 
            ? `🎰 JACKPOT! You won 1 TON! Contact admin for payout. Plus ${totalCs.toLocaleString()} CS!`
            : `You won ${totalCs.toLocaleString()} CS from ${spinQuantity} spin(s)!`,
          newBalance: {
            cs: updatedUser[0].csBalance,
            chst: updatedUser[0].chstBalance,
          },
        };
      });

      res.json(result);
    } catch (error: any) {
      console.error("Spin wheel error:", error);
      res.status(400).json({ error: error.message || "Failed to spin wheel" });
    }
  });

  // Helper function to generate spin prizes
  function generateSpinPrize(isFree: boolean): { type: string; value: any; display: string } {
    const roll = Math.random() * 100;

    // Jackpot: 0.1% chance (only for paid spins)
    if (!isFree && roll < 0.1) {
      return { type: 'jackpot', value: 1.0, display: '1 TON Jackpot!' };
    }

    // Equipment: 10% chance
    if (roll < 10.1) {
      const equipmentOptions = [
        'laptop-lenovo-e14',
        'laptop-dell-inspiron',
        'laptop-hp-pavilion',
        'gaming-acer-predator',
      ];
      const equipment = equipmentOptions[Math.floor(Math.random() * equipmentOptions.length)];
      return { type: 'equipment', value: equipment, display: 'Equipment' };
    }

    // Power-up: 20% chance
    if (roll < 30.1) {
      const powerUpOptions = ['hashrate-boost', 'luck-boost', 'cs-multiplier'];
      const powerUp = powerUpOptions[Math.floor(Math.random() * powerUpOptions.length)];
      return { type: 'powerup', value: powerUp, display: 'Power-Up Boost' };
    }

    // CS: 70% chance (remaining) - CHST will only appear after halving event
    const csOptions = [1000, 2500, 5000, 10000, 25000, 50000];
    const csAmount = csOptions[Math.floor(Math.random() * csOptions.length)];
    return { type: 'cs', value: csAmount, display: `${csAmount} CS` };
  }
  // ==========================================
  // DAILY CHALLENGES ROUTES
  // ==========================================

  // Get all available daily challenges
  app.get("/api/challenges", async (req, res) => {
    try {
      const { dailyChallenges: dailyChallengesTable } = await import("@shared/schema");
      const challenges = await db.select().from(dailyChallengesTable)
        .where(eq(dailyChallengesTable.isActive, true));
      res.json(challenges);
    } catch (error: any) {
      console.error("Get challenges error:", error);
      res.status(500).json({ error: "Failed to get challenges" });
    }
  });

  // Get user's daily challenge progress
  app.get("/api/user/:userId/challenges/today", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    
    try {
      const { userDailyChallenges, dailyChallenges: dailyChallengesTable } = await import("@shared/schema");
      
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Get all challenges
      const allChallenges = await db.select().from(dailyChallengesTable)
        .where(eq(dailyChallengesTable.isActive, true));

      // Get user's completed challenges for today
      const completed = await db.select().from(userDailyChallenges)
        .where(and(
          eq(userDailyChallenges.userId, user[0].telegramId),
          eq(userDailyChallenges.completedDate, today)
        ));

      const completedIds = completed.map(c => c.challengeId);

      res.json({
        challenges: allChallenges.map(challenge => ({
          ...challenge,
          completed: completedIds.includes(challenge.challengeId),
        })),
        completedCount: completed.length,
        totalCount: allChallenges.length,
      });
    } catch (error: any) {
      console.error("Get user challenges error:", error);
      res.status(500).json({ error: "Failed to get user challenges" });
    }
  });

  // Complete a daily challenge
  app.post("/api/user/:userId/challenges/:challengeId/complete", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, challengeId } = req.params;

    try {
      const { userDailyChallenges, dailyChallenges: dailyChallengesTable, userStatistics } = await import("@shared/schema");

      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users).where(eq(users.id, userId)).for('update');
        if (!user[0]) throw new Error("User not found");

        // Check challenge exists
        const challenge = await tx.select().from(dailyChallengesTable)
          .where(and(
            eq(dailyChallengesTable.challengeId, challengeId),
            eq(dailyChallengesTable.isActive, true)
          ))
          .limit(1);

        if (!challenge[0]) {
          throw new Error("Challenge not found");
        }

        const today = new Date().toISOString().split('T')[0];

        // Check if already completed today
        const existing = await tx.select().from(userDailyChallenges)
          .where(and(
            eq(userDailyChallenges.userId, user[0].telegramId),
            eq(userDailyChallenges.completedDate, today)
          ))
          .limit(1);

        if (existing[0]) {
          throw new Error("Challenge already completed today");
        }

        // Mark as completed
        await tx.insert(userDailyChallenges).values({
          userId: user[0].telegramId,
          challengeId,
          completedDate: today,
          rewardClaimed: true,
        });

        // Give rewards
        if (challenge[0].rewardCs > 0) {
          await tx.update(users)
            .set({ csBalance: sql`${users.csBalance} + ${challenge[0].rewardCs}` })
            .where(eq(users.id, userId));

          // Update statistics
          await tx.insert(userStatistics)
            .values({
              userId: user[0].telegramId,
              totalCsEarned: challenge[0].rewardCs,
            })
            .onConflictDoUpdate({
              target: userStatistics.userId,
              set: {
                totalCsEarned: sql`${userStatistics.totalCsEarned} + ${challenge[0].rewardCs}`,
                updatedAt: sql`NOW()`,
              },
            });
        }

        if (challenge[0].rewardChst && challenge[0].rewardChst > 0) {
          await tx.update(users)
            .set({ chstBalance: sql`${users.chstBalance} + ${challenge[0].rewardChst}` })
            .where(eq(users.id, userId));

          await tx.insert(userStatistics)
            .values({
              userId: user[0].telegramId,
              totalChstEarned: challenge[0].rewardChst,
            })
            .onConflictDoUpdate({
              target: userStatistics.userId,
              set: {
                totalChstEarned: sql`${userStatistics.totalChstEarned} + ${challenge[0].rewardChst}`,
                updatedAt: sql`NOW()`,
              },
            });
        }

        return {
          success: true,
          challenge: challenge[0],
          message: `Challenge completed! Earned ${challenge[0].rewardCs} CS`,
        };
      });

      res.json(result);
    } catch (error: any) {
      console.error("Complete challenge error:", error);
      res.status(400).json({ error: error.message || "Failed to complete challenge" });
    }
  });

  // ==========================================
  // ACHIEVEMENTS ROUTES
  // ==========================================

  // Get all achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const { achievements: achievementsTable } = await import("@shared/schema");
      const allAchievements = await db.select().from(achievementsTable)
        .where(eq(achievementsTable.isActive, true))
        .orderBy(achievementsTable.orderIndex);
      res.json(allAchievements);
    } catch (error: any) {
      console.error("Get achievements error:", error);
      res.status(500).json({ error: "Failed to get achievements" });
    }
  });

  // Get user's achievement progress
  app.get("/api/user/:userId/achievements", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const { achievements: achievementsTable, userAchievements } = await import("@shared/schema");

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get all achievements
      const allAchievements = await db.select().from(achievementsTable)
        .where(eq(achievementsTable.isActive, true))
        .orderBy(achievementsTable.orderIndex);

      // Get user's unlocked achievements
      const unlocked = await db.select().from(userAchievements)
        .where(eq(userAchievements.userId, user[0].telegramId));

      const unlockedIds = unlocked.map(u => u.achievementId);

      res.json({
        achievements: allAchievements.map(achievement => ({
          ...achievement,
          unlocked: unlockedIds.includes(achievement.achievementId),
          unlockedAt: unlocked.find(u => u.achievementId === achievement.achievementId)?.unlockedAt,
        })),
        unlockedCount: unlocked.length,
        totalCount: allAchievements.length,
      });
    } catch (error: any) {
      console.error("Get user achievements error:", error);
      res.status(500).json({ error: "Failed to get user achievements" });
    }
  });

  // Check and auto-unlock achievements for user
  app.post("/api/user/:userId/achievements/check", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const { achievements: achievementsTable, userAchievements, userStatistics } = await import("@shared/schema");

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user stats
      const stats = await db.select().from(userStatistics)
        .where(eq(userStatistics.userId, user[0].telegramId))
        .limit(1);

      // Get user's equipment count
      const equipment = await db.select().from(ownedEquipment)
        .where(eq(ownedEquipment.userId, userId));

      const uniqueEquipment = new Set(equipment.map(e => e.equipmentTypeId)).size;

      // Get referrals count
      const refCount = await db.select({ count: sql`COUNT(*)` }).from(referrals)
        .where(eq(referrals.referrerId, userId));

      // Check which achievements should be unlocked
      const newlyUnlocked = [];
      const allAchievements = await db.select().from(achievementsTable)
        .where(eq(achievementsTable.isActive, true));

      const existingAchievements = await db.select().from(userAchievements)
        .where(eq(userAchievements.userId, user[0].telegramId));

      const existingIds = existingAchievements.map(a => a.achievementId);

      for (const achievement of allAchievements) {
        if (existingIds.includes(achievement.achievementId)) continue;

        let shouldUnlock = false;

        // Check requirements
        switch (achievement.requirement) {
          case "own_1_equipment":
            shouldUnlock = equipment.length >= 1;
            break;
          case "hashrate_1000":
            shouldUnlock = user[0].totalHashrate >= 1000;
            break;
          case "hashrate_10000":
            shouldUnlock = user[0].totalHashrate >= 10000;
            break;
          case "hashrate_100000":
            shouldUnlock = user[0].totalHashrate >= 100000;
            break;
          case "own_10_different_equipment":
            shouldUnlock = uniqueEquipment >= 10;
            break;
          case "spend_10_ton":
            shouldUnlock = stats[0] && parseFloat(stats[0].totalTonSpent.toString()) >= 10;
            break;
          case "refer_10_friends":
            shouldUnlock = (refCount[0]?.count || 0) >= 10;
            break;
          case "mine_100_blocks":
            shouldUnlock = stats[0] && stats[0].totalBlocksMined >= 100;
            break;
        }

        if (shouldUnlock) {
          // Unlock achievement
          await db.insert(userAchievements).values({
            userId: user[0].telegramId,
            achievementId: achievement.achievementId,
            rewardClaimed: false,
          });

          newlyUnlocked.push(achievement);
        }
      }

      res.json({
        newlyUnlocked,
        message: newlyUnlocked.length > 0 ? `Unlocked ${newlyUnlocked.length} achievements!` : "No new achievements",
      });
    } catch (error: any) {
      console.error("Check achievements error:", error);
      res.status(500).json({ error: "Failed to check achievements" });
    }
  });

  // Claim achievement reward
  app.post("/api/user/:userId/achievements/:achievementId/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, achievementId } = req.params;

    try {
      const { achievements: achievementsTable, userAchievements, userStatistics } = await import("@shared/schema");

      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users).where(eq(users.id, userId)).for('update');
        if (!user[0]) throw new Error("User not found");

        // Check achievement exists and is unlocked
        const userAchievement = await tx.select().from(userAchievements)
          .where(and(
            eq(userAchievements.userId, user[0].telegramId),
            eq(userAchievements.achievementId, achievementId)
          ))
          .limit(1);

        if (!userAchievement[0]) {
          throw new Error("Achievement not unlocked");
        }

        if (userAchievement[0].rewardClaimed) {
          throw new Error("Reward already claimed");
        }

        // Get achievement details
        const achievement = await tx.select().from(achievementsTable)
          .where(eq(achievementsTable.achievementId, achievementId))
          .limit(1);

        if (!achievement[0]) {
          throw new Error("Achievement not found");
        }

        // Give rewards
        if (achievement[0].rewardCs && achievement[0].rewardCs > 0) {
          await tx.update(users)
            .set({ csBalance: sql`${users.csBalance} + ${achievement[0].rewardCs}` })
            .where(eq(users.id, userId));

          await tx.insert(userStatistics)
            .values({
              userId: user[0].telegramId,
              totalCsEarned: achievement[0].rewardCs,
            })
            .onConflictDoUpdate({
              target: userStatistics.userId,
              set: {
                totalCsEarned: sql`${userStatistics.totalCsEarned} + ${achievement[0].rewardCs}`,
                updatedAt: sql`NOW()`,
              },
            });
        }

        // Mark as claimed
        await tx.update(userAchievements)
          .set({ rewardClaimed: true })
          .where(and(
            eq(userAchievements.userId, user[0].telegramId),
            eq(userAchievements.achievementId, achievementId)
          ));

        return {
          success: true,
          achievement: achievement[0],
          message: `Claimed ${achievement[0].rewardCs} CS reward!`,
        };
      });

      res.json(result);
    } catch (error: any) {
      console.error("Claim achievement error:", error);
      res.status(400).json({ error: error.message || "Failed to claim achievement" });
    }
  });

  // ==========================================
  // COSMETICS ROUTES
  // ==========================================

  // Get user's cosmetic items
  app.get("/api/user/:userId/cosmetics", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const { userCosmetics } = await import("@shared/schema");

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      const owned = await db.select().from(userCosmetics)
        .where(eq(userCosmetics.userId, user[0].telegramId));

      res.json(owned);
    } catch (error: any) {
      console.error("Get user cosmetics error:", error);
      res.status(500).json({ error: "Failed to get user cosmetics" });
    }
  });

  // Create new cosmetic preset (save current setup)
  app.post("/api/user/:userId/cosmetics/presets", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { presetName } = req.body;

    if (!presetName || presetName.trim().length === 0) {
      return res.status(400).json({ error: "Preset name is required" });
    }

    if (presetName.length > 50) {
      return res.status(400).json({ error: "Preset name too long (max 50 characters)" });
    }

    try {
      const { equipmentPresets } = await import("@shared/schema");

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's current equipment
      const currentEquipment = await db.select().from(ownedEquipment)
        .where(eq(ownedEquipment.userId, userId));

      if (currentEquipment.length === 0) {
        return res.status(400).json({ error: "No equipment to save" });
      }

      // Create snapshot of current equipment
      const snapshot = currentEquipment.map(eq => ({
        equipmentTypeId: eq.equipmentTypeId,
        quantity: eq.quantity,
        upgradeLevel: eq.upgradeLevel,
      }));

      // Save preset
      const newPreset = await db.insert(equipmentPresets).values({
        userId: user[0].telegramId,
        presetName: presetName.trim(),
        equipmentSnapshot: JSON.stringify(snapshot),
      }).returning();

      res.json({
        success: true,
        preset: newPreset[0],
        message: `Preset "${presetName}" saved successfully`,
      });
    } catch (error: any) {
      console.error("Create equipment preset error:", error);
      res.status(500).json({ error: "Failed to create preset" });
    }
  });

  // Load equipment preset (informational only - shows what equipment is in the preset)
  app.get("/api/user/:userId/cosmetics/presets/:presetId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, presetId } = req.params;

    try {
      const { equipmentPresets } = await import("@shared/schema");

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      const preset = await db.select().from(equipmentPresets)
        .where(and(
          eq(equipmentPresets.id, parseInt(presetId)),
          eq(equipmentPresets.userId, user[0].telegramId)
        ))
        .limit(1);

      if (!preset[0]) {
        return res.status(404).json({ error: "Preset not found" });
      }

      // Parse the equipment snapshot
      const snapshot = JSON.parse(preset[0].equipmentSnapshot);

      res.json({
        preset: preset[0],
        equipment: snapshot,
      });
    } catch (error: any) {
      console.error("Get equipment preset error:", error);
      res.status(500).json({ error: "Failed to get preset" });
    }
  });

  // Delete equipment preset
  app.delete("/api/user/:userId/cosmetics/presets/:presetId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, presetId } = req.params;

    try {
      const { equipmentPresets } = await import("@shared/schema");

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if preset exists and belongs to user
      const preset = await db.select().from(equipmentPresets)
        .where(and(
          eq(equipmentPresets.id, parseInt(presetId)),
          eq(equipmentPresets.userId, user[0].telegramId)
        ))
        .limit(1);

      if (!preset[0]) {
        return res.status(404).json({ error: "Preset not found" });
      }

      // Delete preset
      await db.delete(equipmentPresets)
        .where(eq(equipmentPresets.id, parseInt(presetId)));

      res.json({
        success: true,
        message: `Preset "${preset[0].presetName}" deleted successfully`,
      });
    } catch (error: any) {
      console.error("Delete equipment preset error:", error);
      res.status(500).json({ error: "Failed to delete preset" });
    }
  });

  // ==========================================
  // PRICE ALERTS ROUTES
  // ==========================================

  // Get user's price alerts
  app.get("/api/user/:userId/price-alerts", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const alerts = await db.select().from(priceAlerts)
        .leftJoin(equipmentTypes, eq(priceAlerts.equipmentTypeId, equipmentTypes.id))
        .where(eq(priceAlerts.userId, user.telegramId))
        .orderBy(priceAlerts.createdAt);

      const alertsWithStatus = alerts.map((row) => ({
        ...row.price_alerts,
        equipment: row.equipment_types,
        canAfford: user.csBalance >= (row.equipment_types?.basePrice || 0),
      }));

      res.json(alertsWithStatus);
    } catch (error: any) {
      console.error("Get price alerts error:", error);
      res.status(500).json({ error: error.message || "Failed to get price alerts" });
    }
  });

  // Create price alert
  app.post("/api/user/:userId/price-alerts", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { equipmentTypeId } = req.body;

    if (!equipmentTypeId) {
      return res.status(400).json({ error: "Equipment type ID is required" });
    }

    try {
      const { equipmentTypes, userCosmetics, userStatistics } = await import("@shared/schema");

      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users).where(eq(users.id, userId)).for('update');
        if (!user[0]) throw new Error("User not found");

        // Check if alert already exists
        const existingAlert = await tx.select().from(priceAlerts)
          .where(and(
            eq(priceAlerts.userId, user[0].telegramId),
            eq(priceAlerts.equipmentTypeId, equipmentTypeId)
          ))
          .limit(1);

        if (existingAlert.length > 0) {
          throw new Error("Alert already exists for this equipment");
        }

        // Get equipment details
        const equipment = await tx.select().from(equipmentTypes)
          .where(and(
            eq(equipmentTypes.id, equipmentTypeId),
            eq(equipmentTypes.isActive, true)
          ))
          .limit(1);

        if (!equipment[0]) {
          throw new Error("Equipment not found");
        }

        // Create alert
        const newAlert = await tx.insert(priceAlerts).values({
          userId: user[0].telegramId,
          equipmentTypeId,
          targetPrice: equipment[0].basePrice,
          triggered: false,
        }).returning();

        return newAlert[0];
      });

      res.json({
        success: true,
        message: "Alert set for " + equipment[0].name,
        alert: result,
      });
    } catch (error: any) {
      console.error("Create price alert error:", error);
      res.status(500).json({ error: error.message || "Failed to create price alert" });
    }
  });

  // Delete price alert
  app.delete("/api/user/:userId/price-alerts/:alertId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, alertId } = req.params;

    try {
      const { equipmentTypes, userCosmetics, userStatistics } = await import("@shared/schema");

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify ownership
      const alert = await db.select().from(priceAlerts)
        .where(and(
          eq(priceAlerts.id, parseInt(alertId)),
          eq(priceAlerts.userId, user[0].telegramId)
        ))
        .limit(1);

      if (!alert[0]) {
        return res.status(404).json({ error: "Alert not found" });
      }

      await db.delete(priceAlerts)
        .where(eq(priceAlerts.id, parseInt(alertId)));

      res.json({
        success: true,
        message: "Alert deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete price alert error:", error);
      res.status(500).json({ error: error.message || "Failed to delete price alert" });
    }
  });

  // Check price alerts (returns alerts that can now be afforded)
  app.get("/api/user/:userId/price-alerts/check", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const alerts = await db.select().from(priceAlerts)
        .leftJoin(equipmentTypes, eq(priceAlerts.equipmentTypeId, equipmentTypes.id))
        .where(and(
          eq(priceAlerts.userId, user.telegramId),
          eq(priceAlerts.triggered, false)
        ));

      const triggeredAlerts = [];

      for (const row of alerts) {
        if (row.equipment_types && user.csBalance >= row.equipment_types.basePrice) {
          // Mark as triggered
          await db.update(priceAlerts)
            .set({
              triggered: true,
              triggeredAt: new Date(),
            })
            .where(eq(priceAlerts.id, row.price_alerts.id));

          triggeredAlerts.push({
            ...row.price_alerts,
            equipment: row.equipment_types,
          });
        }
      }

      res.json({
        triggered: triggeredAlerts.length > 0,
        alerts: triggeredAlerts,
      });
    } catch (error: any) {
      console.error("Check price alerts error:", error);
      res.status(500).json({ error: error.message || "Failed to check price alerts" });
    }
  });



  // ==========================================
  // AUTO-UPGRADE ROUTES
  // ==========================================

  // Get user's auto-upgrade settings
  app.get("/api/user/:userId/auto-upgrade/settings", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const settings = await db.select().from(autoUpgradeSettings)
        .leftJoin(ownedEquipment, eq(autoUpgradeSettings.ownedEquipmentId, ownedEquipment.id))
        .leftJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id))
        .leftJoin(componentUpgrades, and(
          eq(componentUpgrades.ownedEquipmentId, autoUpgradeSettings.ownedEquipmentId),
          eq(componentUpgrades.componentType, autoUpgradeSettings.componentType)
        ))
        .where(eq(autoUpgradeSettings.userId, user.telegramId))
        .orderBy(autoUpgradeSettings.createdAt);

      const settingsWithDetails = settings.map((row) => ({
        ...row.auto_upgrade_settings,
        equipment: row.owned_equipment,
        equipmentType: row.equipment_types,
        currentComponent: row.component_upgrades,
      }));

      res.json(settingsWithDetails);
    } catch (error: any) {
      console.error("Get auto-upgrade settings error:", error);
      res.status(500).json({ error: error.message || "Failed to get auto-upgrade settings" });
    }
  });

  // Create or update auto-upgrade setting
  app.post("/api/user/:userId/auto-upgrade/settings", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { ownedEquipmentId, componentType, targetLevel, enabled } = req.body;

    if (!ownedEquipmentId || !componentType || targetLevel === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (targetLevel < 0 || targetLevel > 10) {
      return res.status(400).json({ error: "Target level must be between 0 and 10" });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify equipment ownership
      const equipment = await db.select().from(ownedEquipment)
        .where(and(
          eq(ownedEquipment.id, ownedEquipmentId),
          eq(ownedEquipment.userId, userId)
        ))
        .limit(1);

      if (!equipment[0]) {
        return res.status(404).json({ error: "Equipment not found or not owned" });
      }

      // Check if setting already exists
      const existingSetting = await db.select().from(autoUpgradeSettings)
        .where(and(
          eq(autoUpgradeSettings.ownedEquipmentId, ownedEquipmentId),
          eq(autoUpgradeSettings.componentType, componentType)
        ))
        .limit(1);

      let setting;
      if (existingSetting.length > 0) {
        // Update existing
        const updated = await db.update(autoUpgradeSettings)
          .set({
            targetLevel,
            enabled: enabled !== undefined ? enabled : true,
            updatedAt: sql`NOW()`,
          })
          .where(eq(autoUpgradeSettings.id, existingSetting[0].id))
          .returning();
        setting = updated[0];
      } else {
        // Create new
        const created = await db.insert(autoUpgradeSettings).values({
          userId: user.telegramId,
          ownedEquipmentId,
          componentType,
          targetLevel,
          enabled: enabled !== undefined ? enabled : true,
        }).returning();
        setting = created[0];
      }

      res.json({
        success: true,
        message: "Auto-upgrade setting saved",
        setting,
      });
    } catch (error: any) {
      console.error("Save auto-upgrade setting error:", error);
      res.status(500).json({ error: error.message || "Failed to save auto-upgrade setting" });
    }
  });

  // Delete auto-upgrade setting
  app.delete("/api/user/:userId/auto-upgrade/settings/:settingId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, settingId } = req.params;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify ownership
      const setting = await db.select().from(autoUpgradeSettings)
        .where(and(
          eq(autoUpgradeSettings.id, parseInt(settingId)),
          eq(autoUpgradeSettings.userId, user.telegramId)
        ))
        .limit(1);

      if (!setting[0]) {
        return res.status(404).json({ error: "Setting not found" });
      }

      await db.delete(autoUpgradeSettings)
        .where(eq(autoUpgradeSettings.id, parseInt(settingId)));

      res.json({
        success: true,
        message: "Auto-upgrade setting deleted",
      });
    } catch (error: any) {
      console.error("Delete auto-upgrade setting error:", error);
      res.status(500).json({ error: error.message || "Failed to delete auto-upgrade setting" });
    }
  });

  // Execute auto-upgrade check (manual trigger or background task)
  app.post("/api/user/:userId/auto-upgrade/execute", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        
        if (!user[0]) throw new Error("User not found");

        // Get all enabled auto-upgrade settings
        const settings = await tx.select().from(autoUpgradeSettings)
          .leftJoin(componentUpgrades, and(
            eq(componentUpgrades.ownedEquipmentId, autoUpgradeSettings.ownedEquipmentId),
            eq(componentUpgrades.componentType, autoUpgradeSettings.componentType)
          ))
          .leftJoin(ownedEquipment, eq(ownedEquipment.id, autoUpgradeSettings.ownedEquipmentId))
          .where(and(
            eq(autoUpgradeSettings.userId, user[0].telegramId),
            eq(autoUpgradeSettings.enabled, true)
          ));

        const upgrades = [];
        let totalCost = 0;

        for (const row of settings) {
          const setting = row.auto_upgrade_settings;
          const component = row.component_upgrades;
          const equipment = row.owned_equipment;

          if (!component || !equipment) continue;

          const currentLevel = component.currentLevel;
          const targetLevel = setting.targetLevel;

          if (currentLevel >= targetLevel) continue; // Already at or above target

          // Calculate upgrade cost (100 CS per level)
          const upgradeCost = 100;

          if (user[0].csBalance >= upgradeCost + totalCost) {
            // Can afford this upgrade
            await tx.update(componentUpgrades)
              .set({
                currentLevel: currentLevel + 1,
                updatedAt: new Date(),
              })
              .where(eq(componentUpgrades.id, component.id));

            totalCost += upgradeCost;

            upgrades.push({
              equipmentId: equipment.id,
              componentType: setting.componentType,
              fromLevel: currentLevel,
              toLevel: currentLevel + 1,
              cost: upgradeCost,
            });
          }
        }

        if (totalCost > 0) {
          // Deduct total cost
          await tx.update(users)
            .set({
              csBalance: user[0].csBalance - totalCost,
            })
            .where(eq(users.id, userId));
        }

        return { upgrades, totalCost };
      });

      res.json({
        success: true,
        upgrades: result.upgrades,
        totalCost: result.totalCost,
        upgradesPerformed: result.upgrades.length,
      });

      // Invalidate cache
      if (result.upgrades.length > 0) {
      }
    } catch (error: any) {
      console.error("Execute auto-upgrade error:", error);
      res.status(500).json({ error: error.message || "Failed to execute auto-upgrade" });
    }
  });


  // ==========================================
  // SEASONS ADMIN ROUTES
  // ==========================================

  // Get all seasons
  app.get("/api/seasons", async (req, res) => {
    try {
      const allSeasons = await db.select().from(seasons)
        .orderBy(sql`${seasons.startDate} DESC`);

      res.json(allSeasons);
    } catch (error: any) {
      console.error("Get seasons error:", error);
      res.status(500).json({ error: error.message || "Failed to get seasons" });
    }
  });

  // Get active season
  app.get("/api/seasons/active", async (req, res) => {
    try {
      const now = new Date();
      const activeSeason = await db.select().from(seasons)
        .where(and(
          eq(seasons.isActive, true),
          sql`${seasons.startDate} <= ${now}`,
          sql`${seasons.endDate} >= ${now}`
        ))
        .limit(1);

      res.json(activeSeason[0] || null);
    } catch (error: any) {
      console.error("Get active season error:", error);
      res.status(500).json({ error: error.message || "Failed to get active season" });
    }
  });

  // Create season (admin only)
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

  // Update season (admin only)
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

  // Activate/Deactivate season (admin only)
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

  // Delete season (admin only)
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


  // ==========================================
  // STARTER/PRO/WHALE PACKS ROUTES
  // ==========================================

  // Get user's pack purchases
  app.get("/api/user/:userId/packs", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const purchases = await db.select().from(packPurchases)
        .where(eq(packPurchases.userId, user.telegramId))
        .orderBy(packPurchases.purchasedAt);

      res.json(purchases);
    } catch (error: any) {
      console.error("Get pack purchases error:", error);
      res.status(500).json({ error: error.message || "Failed to get pack purchases" });
    }
  });

  // Purchase pack with TON
  app.post("/api/user/:userId/packs/purchase", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { packType, tonTransactionHash, userWalletAddress, tonAmount } = req.body;

    if (!packType || !tonTransactionHash || !tonAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const validPacks = ["starter", "pro", "whale"];
    if (!validPacks.includes(packType)) {
      return res.status(400).json({ error: "Invalid pack type" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        
        if (!user[0]) throw new Error("User not found");

        // Check if pack already purchased
        const existing = await tx.select().from(packPurchases)
          .where(and(
            eq(packPurchases.userId, user[0].telegramId),
            eq(packPurchases.packType, packType)
          ))
          .limit(1);

        if (existing.length > 0) {
          throw new Error("You have already purchased this pack");
        }

        // Define pack rewards
        const packRewards = {
          starter: { cs: 50000, equipment: ["laptop-gaming"], chst: 0 },
          pro: { cs: 250000, equipment: ["pc-server-farm"], chst: 100 },
          whale: { cs: 1000000, equipment: ["asic-s19"], chst: 500 },
        };

        const rewards = packRewards[packType as keyof typeof packRewards];

        // Grant rewards
        await tx.update(users)
          .set({
            csBalance: sql`${users.csBalance} + ${rewards.cs}`,
            chstBalance: sql`${users.chstBalance} + ${rewards.chst}`
          })
          .where(eq(users.id, userId));

        // Grant equipment
        for (const equipId of rewards.equipment) {
          const equipType = await tx.select().from(equipmentTypes)
            .where(eq(equipmentTypes.id, equipId))
            .limit(1);

          if (equipType[0]) {
            const existing = await tx.select().from(ownedEquipment)
              .where(and(
                eq(ownedEquipment.userId, userId),
                eq(ownedEquipment.equipmentTypeId, equipId)
              ))
              .limit(1);

            if (existing.length > 0) {
              await tx.update(ownedEquipment)
                .set({ quantity: existing[0].quantity + 1 })
                .where(eq(ownedEquipment.id, existing[0].id));
            } else {
              await tx.insert(ownedEquipment).values({
                userId,
                equipmentTypeId: equipId,
                quantity: 1,
                upgradeLevel: 0,
                currentHashrate: equipType[0].baseHashrate,
              });
            }
          }
        }

        // Record purchase
        const purchase = await tx.insert(packPurchases).values({
          userId: user[0].telegramId,
          packType,
          tonAmount,
          tonTransactionHash,
          tonTransactionVerified: true,
          rewardsJson: JSON.stringify(rewards),
        }).returning();

        return { purchase: purchase[0], rewards };
      });


      res.json({
        success: true,
        message: "Pack purchased successfully!",
        purchase: result.purchase,
        rewards: result.rewards,
      });
    } catch (error: any) {
      console.error("Purchase pack error:", error);
      res.status(500).json({ error: error.message || "Failed to purchase pack" });
    }
  });

  // ==========================================
  // PRESTIGE SYSTEM ROUTES
  // ==========================================

  // Get user's prestige info
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
        // Create default prestige record
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

      // Calculate eligibility (need 1M CS and 100 total hashrate)
      const eligible = user.csBalance >= 1000000 && user.totalHashrate >= 100;

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

        // Get equipment for history
        const equipment = await tx.select().from(ownedEquipment)
          .where(eq(ownedEquipment.userId, userId));

        // Record history
        await tx.insert(prestigeHistory).values({
          userId: user[0].telegramId,
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

  // ==========================================
  // SUBSCRIPTION SYSTEM ROUTES
  // ==========================================

  // Get user's subscription
  app.get("/api/user/:userId/subscription", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const subscription = await db.select().from(userSubscriptions)
        .where(eq(userSubscriptions.userId, user.telegramId))
        .limit(1);

      if (subscription.length === 0) {
        return res.json({ subscribed: false, subscription: null });
      }

      const sub = subscription[0];
      const now = new Date();
      const isActive = sub.isActive && (!sub.endDate || new Date(sub.endDate) > now);

      res.json({
        subscribed: isActive,
        subscription: { ...sub, isActive },
      });
    } catch (error: any) {
      console.error("Get subscription error:", error);
      res.status(500).json({ error: error.message || "Failed to get subscription" });
    }
  });

  // Subscribe with TON
  app.post("/api/user/:userId/subscription/subscribe", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { subscriptionType, tonTransactionHash, tonAmount } = req.body;

    if (!subscriptionType || !tonTransactionHash || !tonAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const validTypes = ["monthly", "lifetime"];
    if (!validTypes.includes(subscriptionType)) {
      return res.status(400).json({ error: "Invalid subscription type" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        
        if (!user[0]) throw new Error("User not found");

        // Check existing subscription
        const existing = await tx.select().from(userSubscriptions)
          .where(eq(userSubscriptions.userId, user[0].telegramId))
          .limit(1);

        const now = new Date();
        let endDate = null;

        if (subscriptionType === "monthly") {
          endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
        }

        if (existing.length > 0) {
          // Update existing
          const updated = await tx.update(userSubscriptions)
            .set({
              subscriptionType,
              startDate: now,
              endDate,
              isActive: true,
              tonTransactionHash,
            })
            .where(eq(userSubscriptions.id, existing[0].id))
            .returning();

          return updated[0];
        } else {
          // Create new
          const created = await tx.insert(userSubscriptions).values({
            userId: user[0].telegramId,
            subscriptionType,
            startDate: now,
            endDate,
            isActive: true,
            tonTransactionHash,
          }).returning();

          return created[0];
        }
      });


      res.json({
        success: true,
        message: "Subscription activated!",
        subscription: result,
      });
    } catch (error: any) {
      console.error("Subscribe error:", error);
      res.status(500).json({ error: error.message || "Failed to subscribe" });
    }
  });

  // Cancel subscription
  app.post("/api/user/:userId/subscription/cancel", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await db.update(userSubscriptions)
        .set({ isActive: false, autoRenew: false })
        .where(eq(userSubscriptions.userId, user.telegramId));


      res.json({
        success: true,
        message: "Subscription cancelled",
      });
    } catch (error: any) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({ error: error.message || "Failed to cancel subscription" });
    }
  });

  // Daily Login Rewards - Get Status
  app.get("/api/user/:userId/daily-login/status", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's streak data
      const streakData = await db.select().from(userStreaks).where(eq(userStreaks.userId, user.telegramId)).limit(1);
      const currentStreak = streakData.length > 0 ? streakData[0].currentStreak : 0;

      // Check if user has claimed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysClaim = await db.select().from(dailyLoginRewards)
        .where(and(
          eq(dailyLoginRewards.userId, user.telegramId),
          sql`DATE(${dailyLoginRewards.claimedAt}) = DATE(${today})`
        ))
        .limit(1);

      const canClaim = todaysClaim.length === 0;
      const nextStreakDay = canClaim ? currentStreak + 1 : currentStreak;
      const nextReward = calculateDailyLoginReward(nextStreakDay);

      res.json({
        canClaim,
        currentStreak,
        nextReward,
        lastClaimDate: todaysClaim.length > 0 ? todaysClaim[0].claimedAt : null,
      });
    } catch (error: any) {
      console.error("Daily login status error:", error);
      res.status(500).json({ error: "Failed to get daily login status" });
    }
  });

  // Daily Login Rewards - Claim
  app.post("/api/user/:userId/daily-login/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if already claimed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysClaim = await db.select().from(dailyLoginRewards)
        .where(and(
          eq(dailyLoginRewards.userId, user.telegramId),
          sql`DATE(${dailyLoginRewards.claimedAt}) = DATE(${today})`
        ))
        .limit(1);

      if (todaysClaim.length > 0) {
        return res.status(400).json({ error: "Daily reward already claimed today" });
      }

      // Get or create streak data
      const streakData = await db.select().from(userStreaks).where(eq(userStreaks.userId, user.telegramId)).limit(1);
      let currentStreak = 0;
      
      if (streakData.length > 0) {
        const lastLoginDate = new Date(streakData[0].lastLoginDate);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if streak continues (claimed yesterday)
        if (lastLoginDate >= yesterday && lastLoginDate < today) {
          currentStreak = streakData[0].currentStreak + 1;
        } else {
          // Streak broken, reset to 1
          currentStreak = 1;
        }
      } else {
        // First time claiming
        currentStreak = 1;
      }

      // Calculate rewards
      const rewards = calculateDailyLoginReward(currentStreak);
      
      // Format today's date as YYYY-MM-DD
      const loginDateStr = today.toISOString().split('T')[0];

      // Update user balances and streak in a transaction
      await db.transaction(async (tx: any) => {
        // Record the claim
        await tx.insert(dailyLoginRewards).values({
          userId: user.telegramId,
          loginDate: loginDateStr,
          streakDay: currentStreak,
          rewardCs: rewards.cs,
          rewardChst: rewards.chst,
          rewardItem: rewards.item,
        });

        // Update user balances
        await tx.update(users)
          .set({
            csBalance: sql`${users.csBalance} + ${rewards.cs}`,
            chstBalance: sql`${users.chstBalance} + ${rewards.chst}`,
          })
          .where(eq(users.id, userId));

        // Update or insert streak data
        if (streakData.length > 0) {
          await tx.update(userStreaks)
            .set({
              currentStreak,
              longestStreak: sql`GREATEST(${userStreaks.longestStreak}, ${currentStreak})`,
              lastLoginDate: loginDateStr,
            })
            .where(eq(userStreaks.userId, user.telegramId));
        } else {
          await tx.insert(userStreaks).values({
            userId: user.telegramId,
            currentStreak,
            longestStreak: currentStreak,
            lastLoginDate: loginDateStr,
          });
        }
      });

      res.json({
        success: true,
        reward: rewards,
        streakDay: currentStreak,
        message: `Day ${currentStreak} reward claimed!`,
      });
    } catch (error: any) {
      console.error("Daily login claim error:", error);
      res.status(500).json({ error: "Failed to claim daily reward" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

