import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, db } from "./storage";
import { insertUserSchema, insertOwnedEquipmentSchema } from "@shared/schema";
import { users, ownedEquipment, equipmentTypes, referrals } from "@shared/schema";
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
    const equipmentTypes = await storage.getAllEquipmentTypes();
    res.json(equipmentTypes);
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
        if (!equipmentType[0]) throw new Error("Equipment type not found");

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

        if (!hasPrevious && et.orderIndex > 1) {
          throw new Error("Must purchase previous equipment in this category first");
        }

        const balanceField = et.currency === 'CS' ? 'csBalance' : 'chstBalance';
        const currentBalance = user[0][balanceField];

        if (currentBalance < et.basePrice) {
          throw new Error(`Insufficient ${et.currency} balance`);
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

        await tx.update(users)
          .set({
            [balanceField]: sql`${balanceField === 'csBalance' ? users.csBalance : users.chstBalance} - ${et.basePrice}`,
            totalHashrate: sql`${users.totalHashrate} + ${et.baseHashrate}`
          })
          .where(eq(users.id, userId));

        return equipment;
      });

      res.json(result);
    } catch (error: any) {
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

  const httpServer = createServer(app);

  return httpServer;
}
