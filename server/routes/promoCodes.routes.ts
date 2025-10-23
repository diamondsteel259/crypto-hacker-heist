import type { Express } from "express";
import { db } from "../storage";
import { promoCodes, insertPromoCodeSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { validateTelegramAuth, requireAdmin, type AuthRequest } from "../middleware/auth";
import {
  generateUniqueCode,
  validatePromoCode,
  redeemPromoCode,
  getAllPromoCodes,
  getPromoCodeRedemptions,
} from "../services/promoCodes";

export function registerPromoCodeRoutes(app: Express): void {
  // Admin: Create promo code
  app.post("/api/admin/promo-codes", validateTelegramAuth, requireAdmin, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const data = req.body;

      // Generate code if not provided
      if (!data.code) {
        let uniqueCode = generateUniqueCode();
        // Ensure uniqueness
        let attempts = 0;
        while (attempts < 10) {
          const existing = await db.select()
            .from(promoCodes)
            .where(eq(promoCodes.code, uniqueCode))
            .limit(1);

          if (existing.length === 0) break;
          uniqueCode = generateUniqueCode();
          attempts++;
        }
        data.code = uniqueCode;
      }

      // Convert code to uppercase
      data.code = data.code.toUpperCase();

      // Validate reward type
      const validTypes = ['cs', 'chst', 'equipment', 'powerup', 'lootbox', 'bundle'];
      if (!validTypes.includes(data.rewardType)) {
        return res.status(400).json({ error: `Invalid reward type. Must be one of: ${validTypes.join(', ')}` });
      }

      const parsed = insertPromoCodeSchema.safeParse({
        ...data,
        createdBy: req.telegramUser.id.toString(),
      });

      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid promo code data",
          details: parsed.error.errors,
        });
      }

      // Create promo code
      const [newPromoCode] = await db.insert(promoCodes)
        .values(parsed.data)
        .returning();

      res.json({
        success: true,
        promoCode: newPromoCode,
      });
    } catch (error: any) {
      console.error("Create promo code error:", error);
      res.status(500).json({ error: error.message || "Failed to create promo code" });
    }
  });

  // Admin: Get all promo codes
  app.get("/api/admin/promo-codes", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const codes = await getAllPromoCodes(limit);
      res.json(codes);
    } catch (error: any) {
      console.error("Get promo codes error:", error);
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });

  // Admin: Update promo code
  app.put("/api/admin/promo-codes/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const promoCodeId = parseInt(req.params.id);

      // Check if exists
      const existing = await db.select()
        .from(promoCodes)
        .where(eq(promoCodes.id, promoCodeId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: "Promo code not found" });
      }

      // Note: Cannot change the code itself after creation to maintain audit trail
      const [updated] = await db.update(promoCodes)
        .set({
          description: req.body.description !== undefined ? req.body.description : existing[0].description,
          maxUses: req.body.maxUses !== undefined ? req.body.maxUses : existing[0].maxUses,
          maxUsesPerUser: req.body.maxUsesPerUser !== undefined ? req.body.maxUsesPerUser : existing[0].maxUsesPerUser,
          validFrom: req.body.validFrom !== undefined ? req.body.validFrom : existing[0].validFrom,
          validUntil: req.body.validUntil !== undefined ? req.body.validUntil : existing[0].validUntil,
          isActive: req.body.isActive !== undefined ? req.body.isActive : existing[0].isActive,
          targetSegment: req.body.targetSegment !== undefined ? req.body.targetSegment : existing[0].targetSegment,
        })
        .where(eq(promoCodes.id, promoCodeId))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Update promo code error:", error);
      res.status(500).json({ error: "Failed to update promo code" });
    }
  });

  // Admin: Deactivate promo code
  app.delete("/api/admin/promo-codes/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const promoCodeId = parseInt(req.params.id);

      // Soft delete: just deactivate
      await db.update(promoCodes)
        .set({ isActive: false })
        .where(eq(promoCodes.id, promoCodeId));

      res.json({ success: true, message: "Promo code deactivated" });
    } catch (error: any) {
      console.error("Deactivate promo code error:", error);
      res.status(500).json({ error: "Failed to deactivate promo code" });
    }
  });

  // Admin: Get redemptions for a promo code
  app.get("/api/admin/promo-codes/:id/redemptions", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const promoCodeId = parseInt(req.params.id);
      const redemptions = await getPromoCodeRedemptions(promoCodeId);
      res.json(redemptions);
    } catch (error: any) {
      console.error("Get redemptions error:", error);
      res.status(500).json({ error: "Failed to fetch redemptions" });
    }
  });

  // User: Validate promo code (check before redeeming)
  app.get("/api/promo-codes/validate", validateTelegramAuth, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const code = req.query.code as string;

      if (!code) {
        return res.status(400).json({ error: "Promo code is required" });
      }

      const validation = await validatePromoCode(code, req.telegramUser.id.toString());
      res.json(validation);
    } catch (error: any) {
      console.error("Validate promo code error:", error);
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });

  // User: Redeem promo code
  app.post("/api/promo-codes/redeem", validateTelegramAuth, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: "Promo code is required" });
      }

      // Get IP address for fraud detection
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.headers['x-real-ip'];

      const result = await redeemPromoCode(
        code,
        req.telegramUser.id.toString(),
        typeof ipAddress === 'string' ? ipAddress : undefined
      );

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        message: "Promo code redeemed successfully!",
        reward: result.reward,
      });
    } catch (error: any) {
      console.error("Redeem promo code error:", error);
      res.status(500).json({ error: error.message || "Failed to redeem promo code" });
    }
  });
}
