import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, db } from "./storage";
import { insertUserSchema, insertOwnedEquipmentSchema } from "@shared/schema";
import { users, ownedEquipment, equipmentTypes, referrals, componentUpgrades } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { validateTelegramAuth, requireAdmin, verifyUserAccess, type AuthRequest } from "./middleware/auth";

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

  // Task system routes
  app.post("/api/user/:userId/tasks/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        if (!user[0]) throw new Error("User not found");

        let reward = 0;
        let message = "Task completed!";

        switch (taskId) {
          case "mine-first-block":
            // Check if user has any equipment
            const userEquipment = await tx.select().from(ownedEquipment)
              .where(eq(ownedEquipment.userId, userId));
            if (userEquipment.length === 0) {
              throw new Error("You need to purchase equipment first to mine blocks");
            }
            reward = 1000;
            message = "First block mined! You earned 1,000 CS!";
            break;
          
          case "reach-1000-hashrate":
            if (user[0].totalHashrate < 1000) {
              throw new Error("You need at least 1,000 H/s total hashrate");
            }
            reward = 2000;
            message = "Hashrate milestone reached! You earned 2,000 CS!";
            break;
          
          case "buy-first-asic":
            // Check if user has any ASIC equipment
            const asicEquipment = await tx.select()
              .from(ownedEquipment)
              .leftJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id))
              .where(and(
                eq(ownedEquipment.userId, userId),
                eq(equipmentTypes.category, "ASIC Rig")
              ));
            if (asicEquipment.length === 0) {
              throw new Error("You need to purchase an ASIC rig first");
            }
            reward = 0; // Free loot box instead of CS
            message = "ASIC acquired! You earned a free loot box!";
            break;
          
          case "invite-1-friend":
            // Check if user has referrals
            const referrals1 = await tx.select().from(referrals)
              .where(eq(referrals.referrerId, userId));
            if (referrals1.length === 0) {
              throw new Error("You need to invite at least 1 friend first");
            }
            reward = 5000;
            message = "Friend invited! You earned 5,000 CS!";
            break;
          
          case "invite-5-friends":
            // Check if user has 5+ referrals
            const referrals5 = await tx.select().from(referrals)
              .where(eq(referrals.referrerId, userId));
            if (referrals5.length < 5) {
              throw new Error("You need to invite at least 5 friends first");
            }
            reward = 0; // Premium loot box instead of CS
            message = "Network built! You earned a premium loot box!";
            break;
          
          default:
            throw new Error("Unknown task ID");
        }

        if (reward > 0) {
          await tx.update(users)
            .set({ 
              csBalance: sql`${users.csBalance} + ${reward}` 
            })
            .where(eq(users.id, userId));
        }

        return { success: true, reward, message };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to claim task" });
    }
  });

  // Power-up system routes
  app.post("/api/user/:userId/powerups/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { powerUpType } = req.body;

    if (!powerUpType) {
      return res.status(400).json({ message: "Power-up type is required" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        if (!user[0]) throw new Error("User not found");

        let amount = 0;
        let currency = "CS";
        let message = "Power-up claimed!";

        switch (powerUpType) {
          case "daily-cs":
            amount = 100; // 5 free CS per day = 100 CS per claim
            currency = "CS";
            message = "Daily CS power-up claimed! You received 100 CS!";
            break;
          
          case "daily-chst":
            amount = 50; // 5 free CHST per day = 50 CHST per claim
            currency = "CHST";
            message = "Daily CHST power-up claimed! You received 50 CHST!";
            break;
          
          case "hashrate-boost":
            // This would require TON payment verification
            amount = 500; // Temporary hashrate boost
            currency = "CS";
            message = "Hashrate boost activated! +500 H/s for 1 hour!";
            break;
          
          case "luck-boost":
            // This would require TON payment verification
            amount = 200; // Temporary luck boost
            currency = "CS";
            message = "Luck boost activated! +20% mining rewards for 1 hour!";
            break;
          
          default:
            throw new Error("Unknown power-up type");
        }

        if (currency === "CS") {
          await tx.update(users)
            .set({ 
              csBalance: sql`${users.csBalance} + ${amount}` 
            })
            .where(eq(users.id, userId));
        } else if (currency === "CHST") {
          await tx.update(users)
            .set({ 
              chstBalance: sql`${users.chstBalance} + ${amount}` 
            })
            .where(eq(users.id, userId));
        }

        return { success: true, amount, currency, message };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to claim power-up" });
    }
  });

  // Loot box system routes
  app.post("/api/user/:userId/lootboxes/open", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { boxType } = req.body;

    if (!boxType) {
      return res.status(400).json({ message: "Box type is required" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        if (!user[0]) throw new Error("User not found");

        // Simple loot box rewards system
        const rewards = [];
        let totalCS = 0;
        let totalCHST = 0;

        switch (boxType) {
          case "basic":
            // Basic box: 0.5 TON cost, 100-110% RTP
            totalCS = Math.floor(Math.random() * 200) + 100; // 100-300 CS
            rewards.push({ type: "CS", amount: totalCS });
            break;
          
          case "premium":
            // Premium box: 2 TON cost, 100-110% RTP
            totalCS = Math.floor(Math.random() * 500) + 300; // 300-800 CS
            totalCHST = Math.floor(Math.random() * 50) + 25; // 25-75 CHST
            rewards.push({ type: "CS", amount: totalCS });
            rewards.push({ type: "CHST", amount: totalCHST });
            break;
          
          case "epic":
            // Epic box: 5 TON cost, 100-110% RTP
            totalCS = Math.floor(Math.random() * 1000) + 500; // 500-1500 CS
            totalCHST = Math.floor(Math.random() * 100) + 50; // 50-150 CHST
            rewards.push({ type: "CS", amount: totalCS });
            rewards.push({ type: "CHST", amount: totalCHST });
            break;
          
          case "daily-task":
            // Free daily task box
            totalCS = Math.floor(Math.random() * 100) + 50; // 50-150 CS
            rewards.push({ type: "CS", amount: totalCS });
            break;
          
          case "invite-friend":
            // Free invite friend box
            totalCS = Math.floor(Math.random() * 200) + 100; // 100-300 CS
            rewards.push({ type: "CS", amount: totalCS });
            break;
          
          default:
            throw new Error("Unknown box type");
        }

        // Apply rewards to user
        if (totalCS > 0) {
          await tx.update(users)
            .set({ 
              csBalance: sql`${users.csBalance} + ${totalCS}` 
            })
            .where(eq(users.id, userId));
        }

        if (totalCHST > 0) {
          await tx.update(users)
            .set({ 
              chstBalance: sql`${users.chstBalance} + ${totalCHST}` 
            })
            .where(eq(users.id, userId));
        }

        return { success: true, rewards, message: "Loot box opened successfully!" };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to open loot box" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
