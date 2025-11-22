import type { Express } from "express";
import { db } from "../storage";
import { users, powerUpPurchases, activePowerUps } from "@shared/schema";
import { eq } from "drizzle-orm";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";
import { verifyTONTransaction } from "../tonVerification";

export function registerPowerUpsRoutes(app: Express): void {
  // Purchase power-up with TON
  app.post("/api/user/:userId/powerups/purchase", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { powerUpType, tonTransactionHash, userWalletAddress, tonAmount } = req.body;

    if (!powerUpType || !tonTransactionHash || !tonAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const validPowerUps = ["hashrate_boost", "luck_boost", "auto_miner"];
    if (!validPowerUps.includes(powerUpType)) {
      return res.status(400).json({ error: "Invalid power-up type" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users)
          .where(eq(users.id, userId))
          .for('update');
        
        if (!user[0]) throw new Error("User not found");

        // Verify TON transaction
        const isValid = await verifyTONTransaction(
          tonTransactionHash,
          userWalletAddress,
          tonAmount
        );

        if (!isValid) {
          throw new Error("TON transaction verification failed");
        }

        // Define power-up properties
        const powerUpConfig: Record<string, { boostPercentage: number; durationHours: number }> = {
          hashrate_boost: { boostPercentage: 50, durationHours: 1 },
          luck_boost: { boostPercentage: 50, durationHours: 1 },
          auto_miner: { boostPercentage: 20, durationHours: 24 },
        };

        const config = powerUpConfig[powerUpType];
        const now = new Date();
        const expiresAt = new Date(now.getTime() + config.durationHours * 60 * 60 * 1000);

        // Record purchase
        const purchase = await tx.insert(powerUpPurchases).values({
          userId: user[0].telegramId!,
          powerUpType,
          tonAmount,
          tonTransactionHash,
          tonTransactionVerified: true,
        }).returning();

        // Create active power-up
        const activePowerUp = await tx.insert(activePowerUps).values({
          userId: user[0].telegramId!,
          powerUpType,
          boostPercentage: config.boostPercentage,
          expiresAt,
          isActive: true,
        }).returning();

        return { purchase: purchase[0], activePowerUp: activePowerUp[0] };
      });

      res.json({
        success: true,
        message: "Power-up activated!",
        powerUpType,
        boost_percentage: result.activePowerUp.boostPercentage,
        expiresAt: result.activePowerUp.expiresAt,
        activePowerUp: result.activePowerUp,
      });
    } catch (error: any) {
      console.error("Purchase power-up error:", error);
      res.status(500).json({ error: error.message || "Failed to purchase power-up" });
    }
  });
}