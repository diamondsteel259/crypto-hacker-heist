import type { Express } from "express";
import { db } from "../storage";
import { users, userSubscriptions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";

export function registerSubscriptionsRoutes(app: Express): void {
  // Get user's subscription
  app.get("/api/user/:userId/subscription", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      const subscription = await db.select().from(userSubscriptions)
        .where(eq(userSubscriptions.userId, user[0].telegramId!))
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
          .where(eq(userSubscriptions.userId, user[0].telegramId!))
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
            userId: user[0].telegramId!,
            subscriptionType,
            startDate: now,
            endDate,
            isActive: true,
            tonTransactionHash,
          }).returning();

          return created;
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
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      await db.update(userSubscriptions)
        .set({ isActive: false, autoRenew: false })
        .where(eq(userSubscriptions.userId, user[0].telegramId!));

      res.json({
        success: true,
        message: "Subscription cancelled",
      });
    } catch (error: any) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({ error: error.message || "Failed to cancel subscription" });
    }
  });
}