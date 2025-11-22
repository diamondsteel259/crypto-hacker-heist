import { logger } from "../logger";
import type { Express } from "express";
import { db } from "../storage";
import { segmentTargetedOffers, insertSegmentTargetedOfferSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { validateTelegramAuth, requireAdmin, type AuthRequest } from "../middleware/auth";
import {
  getSegmentOverview,
  getUsersInSegment,
  refreshAllSegments,
  getTargetedOffersForUser,
  getAllTargetedOffers,
  sendReEngagementMessages,
  sendChurnedMessages,
} from "../services/segmentation";

export function registerSegmentationRoutes(app: Express): void {
  // Admin: Get segment overview (count per segment)
  app.get("/api/admin/segments/overview", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const overview = await getSegmentOverview();
      res.json(overview);
    } catch (error: any) {
      logger.error("Get segment overview error:", error);
      res.status(500).json({ error: "Failed to fetch segment overview" });
    }
  });

  // Admin: Get users in a specific segment
  app.get("/api/admin/segments/:segment/users", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const segment = req.params.segment;

      const validSegments = ['whale', 'dolphin', 'minnow', 'new_user', 'active', 'at_risk', 'churned', 'returning'];
      if (!validSegments.includes(segment)) {
        return res.status(400).json({ error: `Invalid segment. Must be one of: ${validSegments.join(', ')}` });
      }

      const users = await getUsersInSegment(segment);
      res.json(users);
    } catch (error: any) {
      logger.error("Get users in segment error:", error);
      res.status(500).json({ error: "Failed to fetch users in segment" });
    }
  });

  // Admin: Manually trigger segment refresh
  app.post("/api/admin/segments/refresh", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      // Run in background (don't wait)
      refreshAllSegments().catch(error => {
        logger.error("Background segment refresh error:", error);
      });

      res.json({
        success: true,
        message: "Segment refresh started in background",
      });
    } catch (error: any) {
      logger.error("Refresh segments error:", error);
      res.status(500).json({ error: "Failed to trigger segment refresh" });
    }
  });

  // Admin: Create targeted offer
  app.post("/api/admin/segments/offers", validateTelegramAuth, requireAdmin, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const parsed = insertSegmentTargetedOfferSchema.safeParse({
        ...req.body,
        createdBy: req.telegramUser.id.toString(),
      });

      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid offer data",
          details: parsed.error.errors,
        });
      }

      const data = parsed.data;

      // Validate target segment
      const validSegments = ['whale', 'dolphin', 'minnow', 'new_user', 'active', 'at_risk', 'churned', 'returning'];
      if (!validSegments.includes(data.targetSegment)) {
        return res.status(400).json({ error: `Invalid target segment. Must be one of: ${validSegments.join(', ')}` });
      }

      // Validate offer type
      const validTypes = ['promo_code', 'flash_sale', 'bonus_cs', 'exclusive_equipment'];
      if (!validTypes.includes(data.offerType)) {
        return res.status(400).json({ error: `Invalid offer type. Must be one of: ${validTypes.join(', ')}` });
      }

      // Validate offerData is valid JSON
      try {
        JSON.parse(data.offerData);
      } catch (e) {
        return res.status(400).json({ error: "offerData must be valid JSON" });
      }

      // Create offer
      const [newOffer] = await db.insert(segmentTargetedOffers)
        .values(data)
        .returning();

      res.json({
        success: true,
        offer: newOffer,
      });
    } catch (error: any) {
      logger.error("Create targeted offer error:", error);
      res.status(500).json({ error: error.message || "Failed to create targeted offer" });
    }
  });

  // Admin: Get all targeted offers
  app.get("/api/admin/segments/offers", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const offers = await getAllTargetedOffers();
      res.json(offers);
    } catch (error: any) {
      logger.error("Get targeted offers error:", error);
      res.status(500).json({ error: "Failed to fetch targeted offers" });
    }
  });

  // Admin: Update targeted offer
  app.put("/api/admin/segments/offers/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);

      // Check if offer exists
      const existing = await db.select()
        .from(segmentTargetedOffers)
        .where(eq(segmentTargetedOffers.id, offerId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: "Offer not found" });
      }

      // Validate offerData if provided
      if (req.body.offerData) {
        try {
          JSON.parse(req.body.offerData);
        } catch (e) {
          return res.status(400).json({ error: "offerData must be valid JSON" });
        }
      }

      // Update offer
      const [updated] = await db.update(segmentTargetedOffers)
        .set({
          targetSegment: req.body.targetSegment !== undefined ? req.body.targetSegment : existing[0].targetSegment,
          offerType: req.body.offerType !== undefined ? req.body.offerType : existing[0].offerType,
          offerData: req.body.offerData !== undefined ? req.body.offerData : existing[0].offerData,
          validFrom: req.body.validFrom !== undefined ? req.body.validFrom : existing[0].validFrom,
          validUntil: req.body.validUntil !== undefined ? req.body.validUntil : existing[0].validUntil,
          isActive: req.body.isActive !== undefined ? req.body.isActive : existing[0].isActive,
        })
        .where(eq(segmentTargetedOffers.id, offerId))
        .returning();

      res.json(updated);
    } catch (error: any) {
      logger.error("Update targeted offer error:", error);
      res.status(500).json({ error: "Failed to update targeted offer" });
    }
  });

  // Admin: Delete targeted offer
  app.delete("/api/admin/segments/offers/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);

      await db.delete(segmentTargetedOffers)
        .where(eq(segmentTargetedOffers.id, offerId));

      res.json({ success: true, message: "Offer deleted" });
    } catch (error: any) {
      logger.error("Delete targeted offer error:", error);
      res.status(500).json({ error: "Failed to delete targeted offer" });
    }
  });

  // Admin: Manually trigger re-engagement messages
  app.post("/api/admin/segments/send-reengagement", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      // Run in background
      sendReEngagementMessages().catch(error => {
        logger.error("Background re-engagement send error:", error);
      });

      res.json({
        success: true,
        message: "Re-engagement messages being sent in background",
      });
    } catch (error: any) {
      logger.error("Send re-engagement error:", error);
      res.status(500).json({ error: "Failed to send re-engagement messages" });
    }
  });

  // Admin: Manually trigger churned user messages
  app.post("/api/admin/segments/send-churned", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      // Run in background
      sendChurnedMessages().catch(error => {
        logger.error("Background churned send error:", error);
      });

      res.json({
        success: true,
        message: "Churned user messages being sent in background",
      });
    } catch (error: any) {
      logger.error("Send churned messages error:", error);
      res.status(500).json({ error: "Failed to send churned messages" });
    }
  });

  // User: Get my targeted offers
  app.get("/api/segments/my-offers", validateTelegramAuth, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const offers = await getTargetedOffersForUser(req.telegramUser.id.toString());
      res.json(offers);
    } catch (error: any) {
      logger.error("Get my targeted offers error:", error);
      res.status(500).json({ error: "Failed to fetch targeted offers" });
    }
  });
}
