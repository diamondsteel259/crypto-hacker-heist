import type { Express } from "express";
import { db } from "../storage";
import { users, packPurchases, equipmentTypes, ownedEquipment } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";
import { verifyTONTransaction } from "../tonVerification";

export function registerPacksRoutes(app: Express): void {
  // Get user's pack purchases
  app.get("/api/user/:userId/packs", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      const purchases = await db.select().from(packPurchases)
        .where(eq(packPurchases.userId, user[0].telegramId!))
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
}