import type { Express } from "express";
import { db } from "../storage";
import { announcements, insertAnnouncementSchema } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { validateTelegramAuth, requireAdmin, verifyUserAccess, type AuthRequest } from "../middleware/auth";
import {
  sendAnnouncementToAllUsers,
  getActiveAnnouncementsForUser,
  markAnnouncementAsRead,
  getAllAnnouncements,
} from "../services/announcements";

export function registerAnnouncementRoutes(app: Express): void {
  // Admin: Create announcement
  app.post("/api/admin/announcements", validateTelegramAuth, requireAdmin, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const parsed = insertAnnouncementSchema.safeParse({
        ...req.body,
        createdBy: req.telegramUser.id.toString(),
      });

      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid announcement data",
          details: parsed.error.errors,
        });
      }

      const data = parsed.data;

      // Validate type and priority
      const validTypes = ['info', 'warning', 'success', 'event', 'maintenance'];
      const validPriorities = ['low', 'normal', 'high', 'critical'];
      const validAudiences = ['all', 'active', 'whales', 'new_users', 'at_risk'];

      if (!validTypes.includes(data.type)) {
        return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` });
      }

      if (!validPriorities.includes(data.priority)) {
        return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` });
      }

      if (!validAudiences.includes(data.targetAudience)) {
        return res.status(400).json({ error: `Invalid target audience. Must be one of: ${validAudiences.join(', ')}` });
      }

      // Create announcement
      const [newAnnouncement] = await db.insert(announcements)
        .values(data)
        .returning();

      // If no schedule or schedule is in the past, send immediately
      const shouldSendNow = !data.scheduledFor || new Date(data.scheduledFor) <= new Date();

      if (shouldSendNow) {
        // Send in background (don't await)
        sendAnnouncementToAllUsers(newAnnouncement.id).catch(error => {
          console.error("Failed to send announcement:", error);
        });
      }

      res.json({
        success: true,
        announcement: newAnnouncement,
        sendingNow: shouldSendNow,
      });
    } catch (error: any) {
      console.error("Create announcement error:", error);
      res.status(500).json({ error: error.message || "Failed to create announcement" });
    }
  });

  // Admin: Get all announcements
  app.get("/api/admin/announcements", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const allAnnouncements = await getAllAnnouncements(limit);
      res.json(allAnnouncements);
    } catch (error: any) {
      console.error("Get announcements error:", error);
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  // Admin: Update announcement (only if not sent)
  app.put("/api/admin/announcements/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const announcementId = parseInt(req.params.id);

      // Check if announcement exists and hasn't been sent
      const existing = await db.select()
        .from(announcements)
        .where(eq(announcements.id, announcementId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      if (existing[0].sentAt) {
        return res.status(400).json({ error: "Cannot update announcement that has already been sent" });
      }

      // Update announcement
      const [updated] = await db.update(announcements)
        .set({
          title: req.body.title || existing[0].title,
          message: req.body.message || existing[0].message,
          type: req.body.type || existing[0].type,
          priority: req.body.priority || existing[0].priority,
          targetAudience: req.body.targetAudience || existing[0].targetAudience,
          scheduledFor: req.body.scheduledFor !== undefined ? req.body.scheduledFor : existing[0].scheduledFor,
          expiresAt: req.body.expiresAt !== undefined ? req.body.expiresAt : existing[0].expiresAt,
          isActive: req.body.isActive !== undefined ? req.body.isActive : existing[0].isActive,
        })
        .where(eq(announcements.id, announcementId))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Update announcement error:", error);
      res.status(500).json({ error: "Failed to update announcement" });
    }
  });

  // Admin: Delete announcement
  app.delete("/api/admin/announcements/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const announcementId = parseInt(req.params.id);

      await db.delete(announcements)
        .where(eq(announcements.id, announcementId));

      res.json({ success: true, message: "Announcement deleted" });
    } catch (error: any) {
      console.error("Delete announcement error:", error);
      res.status(500).json({ error: "Failed to delete announcement" });
    }
  });

  // Admin: Force send scheduled announcement now
  app.post("/api/admin/announcements/:id/send", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const announcementId = parseInt(req.params.id);

      // Check if announcement exists
      const existing = await db.select()
        .from(announcements)
        .where(eq(announcements.id, announcementId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: "Announcement not found" });
      }

      if (existing[0].sentAt) {
        return res.status(400).json({ error: "Announcement has already been sent" });
      }

      // Send announcement
      const result = await sendAnnouncementToAllUsers(announcementId);

      res.json({
        success: true,
        totalSent: result.totalSent,
        failedCount: result.failedUsers.length,
      });
    } catch (error: any) {
      console.error("Force send announcement error:", error);
      res.status(500).json({ error: error.message || "Failed to send announcement" });
    }
  });

  // User: Get active announcements
  app.get("/api/announcements/active", validateTelegramAuth, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const activeAnnouncements = await getActiveAnnouncementsForUser(req.telegramUser.id.toString());
      res.json(activeAnnouncements);
    } catch (error: any) {
      console.error("Get active announcements error:", error);
      res.status(500).json({ error: "Failed to fetch active announcements" });
    }
  });

  // User: Mark announcement as read
  app.post("/api/announcements/:id/mark-read", validateTelegramAuth, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const announcementId = parseInt(req.params.id);
      await markAnnouncementAsRead(announcementId, req.telegramUser.id.toString());
      res.json({ success: true, message: "Announcement marked as read" });
    } catch (error: any) {
      console.error("Mark announcement as read error:", error);
      res.status(500).json({ error: "Failed to mark announcement as read" });
    }
  });
}
