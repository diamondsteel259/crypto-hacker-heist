import type { Express } from "express";
import { db } from "../storage";
import { scheduledEvents, insertScheduledEventSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import { validateTelegramAuth, requireAdmin, type AuthRequest } from "../middleware/auth";
import {
  getAllEvents,
  getActiveEvents,
  getUpcomingEvents,
  activateEvent,
  deactivateEvent,
  getEventParticipation,
  recordEventParticipation,
} from "../services/events";

export function registerEventsRoutes(app: Express): void {
  // Admin: Create scheduled event
  app.post("/api/admin/events", validateTelegramAuth, requireAdmin, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const parsed = insertScheduledEventSchema.safeParse({
        ...req.body,
        createdBy: req.telegramUser.id.toString(),
      });

      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid event data",
          details: parsed.error.errors,
        });
      }

      const data = parsed.data;

      // Validate event type
      const validTypes = ['multiplier', 'flash_sale', 'community_goal', 'tournament', 'custom'];
      if (!validTypes.includes(data.eventType)) {
        return res.status(400).json({ error: `Invalid event type. Must be one of: ${validTypes.join(', ')}` });
      }

      // Validate eventData is valid JSON
      try {
        JSON.parse(data.eventData);
      } catch (e) {
        return res.status(400).json({ error: "eventData must be valid JSON" });
      }

      // Create event
      const [newEvent] = await db.insert(scheduledEvents)
        .values(data)
        .returning();

      res.json({
        success: true,
        event: newEvent,
      });
    } catch (error: any) {
      console.error("Create event error:", error);
      res.status(500).json({ error: error.message || "Failed to create event" });
    }
  });

  // Admin: Get all events
  app.get("/api/admin/events", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const events = await getAllEvents();
      res.json(events);
    } catch (error: any) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // Admin: Update event (only if not started)
  app.put("/api/admin/events/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);

      // Check if event exists
      const existing = await db.select()
        .from(scheduledEvents)
        .where(eq(scheduledEvents.id, eventId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Don't allow editing active events
      if (existing[0].isActive) {
        return res.status(400).json({ error: "Cannot update active event" });
      }

      // Validate eventData if provided
      if (req.body.eventData) {
        try {
          JSON.parse(req.body.eventData);
        } catch (e) {
          return res.status(400).json({ error: "eventData must be valid JSON" });
        }
      }

      // Update event
      const [updated] = await db.update(scheduledEvents)
        .set({
          name: req.body.name !== undefined ? req.body.name : existing[0].name,
          description: req.body.description !== undefined ? req.body.description : existing[0].description,
          eventType: req.body.eventType !== undefined ? req.body.eventType : existing[0].eventType,
          eventData: req.body.eventData !== undefined ? req.body.eventData : existing[0].eventData,
          startTime: req.body.startTime !== undefined ? req.body.startTime : existing[0].startTime,
          endTime: req.body.endTime !== undefined ? req.body.endTime : existing[0].endTime,
          isRecurring: req.body.isRecurring !== undefined ? req.body.isRecurring : existing[0].isRecurring,
          recurrenceRule: req.body.recurrenceRule !== undefined ? req.body.recurrenceRule : existing[0].recurrenceRule,
          priority: req.body.priority !== undefined ? req.body.priority : existing[0].priority,
          bannerImage: req.body.bannerImage !== undefined ? req.body.bannerImage : existing[0].bannerImage,
        })
        .where(eq(scheduledEvents.id, eventId))
        .returning();

      res.json(updated);
    } catch (error: any) {
      console.error("Update event error:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  // Admin: Delete event (only if not started)
  app.delete("/api/admin/events/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);

      // Check if event exists and is not active
      const existing = await db.select()
        .from(scheduledEvents)
        .where(eq(scheduledEvents.id, eventId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }

      if (existing[0].isActive) {
        return res.status(400).json({ error: "Cannot delete active event. End it first." });
      }

      // Delete event
      await db.delete(scheduledEvents)
        .where(eq(scheduledEvents.id, eventId));

      res.json({ success: true, message: "Event deleted" });
    } catch (error: any) {
      console.error("Delete event error:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Admin: Force activate event now
  app.post("/api/admin/events/:id/activate", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);

      // Check if event exists
      const existing = await db.select()
        .from(scheduledEvents)
        .where(eq(scheduledEvents.id, eventId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }

      if (existing[0].isActive) {
        return res.status(400).json({ error: "Event is already active" });
      }

      // Activate event
      await activateEvent(eventId);

      res.json({
        success: true,
        message: "Event activated",
      });
    } catch (error: any) {
      console.error("Activate event error:", error);
      res.status(500).json({ error: error.message || "Failed to activate event" });
    }
  });

  // Admin: Force end event early
  app.post("/api/admin/events/:id/end", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);

      // Check if event exists
      const existing = await db.select()
        .from(scheduledEvents)
        .where(eq(scheduledEvents.id, eventId))
        .limit(1);

      if (existing.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }

      if (!existing[0].isActive) {
        return res.status(400).json({ error: "Event is not active" });
      }

      // Deactivate event
      await deactivateEvent(eventId);

      res.json({
        success: true,
        message: "Event ended",
      });
    } catch (error: any) {
      console.error("End event error:", error);
      res.status(500).json({ error: error.message || "Failed to end event" });
    }
  });

  // Admin: Get event participation/leaderboard
  app.get("/api/admin/events/:id/participation", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);

      const participation = await getEventParticipation(eventId);

      res.json(participation);
    } catch (error: any) {
      console.error("Get event participation error:", error);
      res.status(500).json({ error: "Failed to fetch event participation" });
    }
  });

  // User: Get active events
  app.get("/api/events/active", validateTelegramAuth, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const activeEvents = await getActiveEvents();
      res.json(activeEvents);
    } catch (error: any) {
      console.error("Get active events error:", error);
      res.status(500).json({ error: "Failed to fetch active events" });
    }
  });

  // User: Get upcoming events
  app.get("/api/events/upcoming", validateTelegramAuth, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const upcomingEvents = await getUpcomingEvents();
      res.json(upcomingEvents);
    } catch (error: any) {
      console.error("Get upcoming events error:", error);
      res.status(500).json({ error: "Failed to fetch upcoming events" });
    }
  });

  // User: Claim tournament/community goal reward
  app.post("/api/events/:id/claim-reward", validateTelegramAuth, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const eventId = parseInt(req.params.id);

      // This endpoint is primarily for manual claim if needed
      // Most rewards are auto-distributed in finalizeCommunityGoal/finalizeTournament
      res.json({
        success: true,
        message: "Rewards are automatically distributed when events end",
      });
    } catch (error: any) {
      console.error("Claim reward error:", error);
      res.status(500).json({ error: "Failed to claim reward" });
    }
  });
}
