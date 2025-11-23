import { logger } from "../logger";
import { db } from "../storage";
import { promoCodes, promoCodeRedemptions, users, ownedEquipment, equipmentTypes, activePowerUps } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Generate a unique random promo code
 */
export function generateUniqueCode(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validate if a promo code can be used by a user
 */
export async function validatePromoCode(code: string, telegramId: string): Promise<{
  valid: boolean;
  error?: string;
  promoCode?: any;
}> {
  try {
    // Get promo code (case-insensitive)
    const promoCode = await db.select()
      .from(promoCodes)
      .where(sql`UPPER(${promoCodes.code}) = UPPER(${code})`)
      .limit(1);

    if (promoCode.length === 0) {
      return { valid: false, error: "Invalid promo code" };
    }

    const promo = promoCode[0];

    // Check if active
    if (!promo.isActive) {
      return { valid: false, error: "This promo code is no longer active" };
    }

    // Check if expired
    if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
      return { valid: false, error: "This promo code has expired" };
    }

    // Check if not yet valid
    if (new Date(promo.validFrom) > new Date()) {
      return { valid: false, error: "This promo code is not yet valid" };
    }

    // Check max uses
    if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
      return { valid: false, error: "This promo code has reached its maximum number of uses" };
    }

    // Check if user already used this code
    const userRedemption = await db.select()
      .from(promoCodeRedemptions)
      .where(
        and(
          eq(promoCodeRedemptions.promoCodeId, promo.id),
          eq(promoCodeRedemptions.telegramId, telegramId)
        )
      )
      .limit(1);

    if (userRedemption.length > 0) {
      return { valid: false, error: "You have already used this promo code" };
    }

    // Check per-user usage limit
    const userUseCount = await db.select({ count: sql<number>`COUNT(*)` })
      .from(promoCodeRedemptions)
      .where(
        and(
          eq(promoCodeRedemptions.promoCodeId, promo.id),
          eq(promoCodeRedemptions.telegramId, telegramId)
        )
      );

    if (userUseCount[0]?.count >= promo.maxUsesPerUser) {
      return { valid: false, error: "You have reached the maximum number of uses for this promo code" };
    }

    return { valid: true, promoCode: promo };
  } catch (error: any) {
    logger.error("Validate promo code error:", error);
    throw error;
  }
}

/**
 * Apply reward to user based on promo code type
 */
async function applyPromoReward(
  tx: any,
  userId: string,
  telegramId: string,
  rewardType: string,
  rewardAmount: string | null,
  rewardData: string | null
): Promise<any> {
  const reward: any = {};

  switch (rewardType) {
    case 'cs':
      // Grant CS
      const csAmount = parseFloat(rewardAmount || '0');
      await tx.update(users)
        .set({ csBalance: sql`${users.csBalance} + ${csAmount}` })
        .where(eq(users.id, userId));
      reward.cs = csAmount;
      break;

    case 'chst':
      // Grant CHST
      const chstAmount = parseFloat(rewardAmount || '0');
      await tx.update(users)
        .set({ chstBalance: sql`${users.chstBalance} + ${chstAmount}` })
        .where(eq(users.id, userId));
      reward.chst = chstAmount;
      break;

    case 'equipment':
      // Grant equipment
      const equipmentData = rewardData ? JSON.parse(rewardData) : {};
      const equipmentId = equipmentData.equipmentId;

      if (equipmentId) {
        // Get equipment type
        const equipmentType = await tx.select()
          .from(equipmentTypes)
          .where(eq(equipmentTypes.id, equipmentId))
          .limit(1);

        if (equipmentType.length > 0) {
          const et = equipmentType[0];

          // Check if user already owns this equipment
          const existing = await tx.select()
            .from(ownedEquipment)
            .where(
              and(
                eq(ownedEquipment.userId, userId),
                eq(ownedEquipment.equipmentTypeId, equipmentId)
              )
            )
            .limit(1);

          if (existing.length > 0) {
            // Increment quantity
            await tx.update(ownedEquipment)
              .set({
                quantity: sql`${ownedEquipment.quantity} + 1`,
                currentHashrate: sql`${ownedEquipment.currentHashrate} + ${et.baseHashrate}`
              })
              .where(eq(ownedEquipment.id, existing[0].id));
          } else {
            // Add new equipment
            await tx.insert(ownedEquipment).values({
              userId,
              equipmentTypeId: equipmentId,
              currentHashrate: et.baseHashrate,
              quantity: 1,
            });
          }

          // Update user total hashrate
          await tx.update(users)
            .set({ totalHashrate: sql`${users.totalHashrate} + ${et.baseHashrate}` })
            .where(eq(users.id, userId));

          reward.equipment = {
            id: equipmentId,
            name: et.name,
            hashrate: et.baseHashrate,
          };
        }
      }
      break;

    case 'powerup':
      // Grant power-up
      const powerupData = rewardData ? JSON.parse(rewardData) : {};
      const powerupType = powerupData.type || 'hashrate-boost';
      const boostPercentage = powerupData.boost || 50;
      const durationHours = powerupData.duration || 24;

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + durationHours);

      await tx.insert(activePowerUps).values({
        userId: telegramId,
        powerUpType: powerupType,
        boostPercentage,
        expiresAt,
        isActive: true,
      });

      reward.powerup = {
        type: powerupType,
        boost: boostPercentage,
        duration: durationHours,
      };
      break;

    case 'bundle':
      // Grant multiple rewards
      const bundleData = rewardData ? JSON.parse(rewardData) : {};
      reward.bundle = [];

      if (bundleData.cs) {
        await tx.update(users)
          .set({ csBalance: sql`${users.csBalance} + ${bundleData.cs}` })
          .where(eq(users.id, userId));
        reward.bundle.push({ type: 'cs', amount: bundleData.cs });
      }

      if (bundleData.chst) {
        await tx.update(users)
          .set({ chstBalance: sql`${users.chstBalance} + ${bundleData.chst}` })
          .where(eq(users.id, userId));
        reward.bundle.push({ type: 'chst', amount: bundleData.chst });
      }

      // Add more bundle items as needed
      break;

    default:
      throw new Error(`Unknown reward type: ${rewardType}`);
  }

  return reward;
}

/**
 * Redeem promo code for a user
 */
export async function redeemPromoCode(
  code: string,
  telegramId: string,
  ipAddress?: string
): Promise<{
  success: boolean;
  reward: any;
  error?: string;
}> {
  try {
    // Validate code
    const validation = await validatePromoCode(code, telegramId);
    if (!validation.valid) {
      return { success: false, reward: null, error: validation.error };
    }

    const promo = validation.promoCode!;

    // Get user
    const user = await db.select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1);

    if (user.length === 0) {
      return { success: false, reward: null, error: "User not found" };
    }

    // Redeem in transaction
    const result = await db.transaction(async (tx: any) => {
      // Re-validate in transaction (prevent race conditions)
      const currentUses = await tx.select({ uses: promoCodes.currentUses })
        .from(promoCodes)
        .where(eq(promoCodes.id, promo.id))
        .for('update')
        .limit(1);

      if (promo.maxUses !== null && currentUses[0].uses >= promo.maxUses) {
        throw new Error("Promo code max uses reached");
      }

      // Apply reward
      const reward = await applyPromoReward(
        tx,
        user[0].id,
        telegramId,
        promo.rewardType,
        promo.rewardAmount,
        promo.rewardData
      );

      // Record redemption
      await tx.insert(promoCodeRedemptions).values({
        promoCodeId: promo.id,
        telegramId,
        rewardGiven: JSON.stringify(reward),
        ipAddress: ipAddress || null,
      });

      // Increment usage count
      await tx.update(promoCodes)
        .set({ currentUses: sql`${promoCodes.currentUses} + 1` })
        .where(eq(promoCodes.id, promo.id));

      return reward;
    });

    return { success: true, reward: result };
  } catch (error: any) {
    logger.error("Redeem promo code error:", error);
    return { success: false, reward: null, error: error.message || "Failed to redeem promo code" };
  }
}

/**
 * Get all promo codes (admin)
 */
export async function getAllPromoCodes(limit: number = 100): Promise<any[]> {
  try {
    const codes = await db.select()
      .from(promoCodes)
      .orderBy(sql`${promoCodes.createdAt} DESC`)
      .limit(limit);

    return codes;
  } catch (error: any) {
    logger.error("Get all promo codes error:", error);
    throw error;
  }
}

/**
 * Get redemptions for a promo code (admin)
 */
export async function getPromoCodeRedemptions(promoCodeId: number): Promise<any[]> {
  try {
    const redemptions = await db.select({
      id: promoCodeRedemptions.id,
      telegramId: promoCodeRedemptions.telegramId,
      username: users.username,
      redeemedAt: promoCodeRedemptions.redeemedAt,
      rewardGiven: promoCodeRedemptions.rewardGiven,
      ipAddress: promoCodeRedemptions.ipAddress,
    })
      .from(promoCodeRedemptions)
      .leftJoin(users, eq(users.telegramId, promoCodeRedemptions.telegramId))
      .where(eq(promoCodeRedemptions.promoCodeId, promoCodeId))
      .orderBy(sql`${promoCodeRedemptions.redeemedAt} DESC`);

    return redemptions;
  } catch (error: any) {
    logger.error("Get promo code redemptions error:", error);
    throw error;
  }
}
