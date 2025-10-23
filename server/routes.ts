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

/**
 * ROUTES.TS - Legacy Monolithic Routes File
 * 
 * STATUS: In migration to modular routing system
 * 
 * MIGRATED ROUTES (now in server/routes/):
 * ✅ Health checks → health.routes.ts
 * ✅ Authentication → auth.routes.ts
 * ✅ User profile routes → user.routes.ts (GET /api/user/:userId, GET /api/user/:userId/rank, POST /api/user/:userId/tutorial/complete, POST /api/user/:userId/reset)
 * ✅ Admin routes → admin.routes.ts (18 routes: settings, users, mining controls, bulk ops, jackpots, equipment, flash sales, seasons)
 * ✅ Social features → social.routes.ts
 * ✅ Mining routes → mining.routes.ts
 * ✅ Equipment routes → equipment.routes.ts
 * ✅ Announcements → announcements.routes.ts
 * ✅ Promo codes → promoCodes.routes.ts
 * ✅ Analytics → analytics.routes.ts
 * ✅ Events → events.routes.ts
 * ✅ Economy → economy.routes.ts
 * ✅ Segmentation → segmentation.routes.ts
 * 
 * REMAINING ROUTES (still in this file):
 * - Telegram bot authentication (POST /api/auth/telegram)
 * - User statistics (GET /api/user/:userId/statistics)
 * - Leaderboard routes (hashrate, balance, referrals)
 * - Equipment catalog and purchase routes
 * - Component upgrade routes
 * - Block and mining calendar routes
 * - Referral routes
 * - Network stats
 * - Cosmetics routes (catalog, purchase, equip)
 * - Packs routes (starter, pro, whale)
 * - Prestige system routes
 * - Subscription routes
 * - Daily login rewards
 * 
 * MIGRATION PLAN:
 * All modular routes are registered via registerModularRoutes() in routes/index.ts.
 * As routes are migrated from this file:
 * 1. Move to appropriate routes/*.routes.ts file
 * 2. Delete from this file (with comment noting where moved)
 * 3. Register in routes/index.ts
 * 4. Update this header documentation
 * 
 * GOAL: Eventually this file should only contain registerRoutes() which calls
 * registerModularRoutes(), with no route definitions of its own.
 */

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

  // Get user statistics
  app.get("/api/user/:userId/statistics", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    
    try {
      const { userStatistics } = await import("@shared/schema");
      
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
        const componentMultiplier: Record<string, number> = {
          "RAM": 0.8,
          "CPU": 1.2,
          "Storage": 0.6,
          "GPU": 1.5
        };
        const multiplier = componentMultiplier[componentType as string] || 1;

        const upgradeCostCS = Math.floor(baseCost * multiplier * Math.pow(1.15, currentLevel));
        
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

  // Admin routes for flash sales moved to admin.routes.ts

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
        .where(eq(packPurchases.userId, user.telegramId!))
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
            eq(packPurchases.userId, user[0].telegramId!),
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
          userId: user[0].telegramId!,
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
        .where(eq(userPrestige.userId, user.telegramId!))
        .limit(1);

      if (prestige.length === 0) {
        // Create default prestige record
        const created = await db.insert(userPrestige).values({
          userId: user.telegramId!,
          prestigeLevel: 0,
          totalPrestiges: 0,
        }).returning();
        prestige = created;
      }

      const history = await db.select().from(prestigeHistory)
        .where(eq(prestigeHistory.userId, user.telegramId!))
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
      const { equipmentTypes, userCosmetics, userStatistics } = await import("@shared/schema");

      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      await db.update(userSubscriptions)
        .set({ isActive: false, autoRenew: false })
        .where(eq(userSubscriptions.userId, user[0].telegramId));

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

