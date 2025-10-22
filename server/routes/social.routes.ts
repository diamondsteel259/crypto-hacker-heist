import type { Express } from "express";
import { storage, db } from "../storage";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";
import { users, referrals } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export function registerSocialRoutes(app: Express) {
  // Get hashrate leaderboard
  app.get("/api/leaderboard/hashrate", validateTelegramAuth, async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
      
      const topUsers = await db.select({
        id: users.telegramId,
        username: users.username,
        totalHashrate: users.totalHashrate,
        csBalance: users.csBalance,
        photoUrl: users.photoUrl,
      })
      .from(users)
      .orderBy(sql`${users.totalHashrate} DESC`)
      .limit(limit);

      res.json(topUsers);
    } catch (error: any) {
      console.error("Hashrate leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Get balance leaderboard
  app.get("/api/leaderboard/balance", validateTelegramAuth, async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
      
      const topUsers = await db.select({
        id: users.telegramId,
        username: users.username,
        csBalance: users.csBalance,
        totalHashrate: users.totalHashrate,
        photoUrl: users.photoUrl,
      })
      .from(users)
      .orderBy(sql`${users.csBalance} DESC`)
      .limit(limit);

      res.json(topUsers);
    } catch (error: any) {
      console.error("Balance leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Get referral leaderboard
  app.get("/api/leaderboard/referrals", validateTelegramAuth, async (req, res) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);

      const topReferrers = await db.select({
        id: users.telegramId,
        username: users.username,
        photoUrl: users.photoUrl,
        referralCount: sql<number>`(SELECT COUNT(*) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId})`,
        totalBonus: sql<number>`COALESCE((SELECT SUM(${referrals.bonusCs}) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId}), 0)`,
      })
      .from(users)
      .orderBy(sql`(SELECT COUNT(*) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId}) DESC`)
      .limit(limit);

      res.json(topReferrers);
    } catch (error: any) {
      console.error("Referral leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch referral leaderboard" });
    }
  });

  // Get user's referrals
  app.get("/api/user/:userId/referrals", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const referralList = await storage.getUserReferrals(req.params.userId);
    res.json(referralList);
  });

  // Apply referral code
  app.post("/api/user/:userId/referrals/apply", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { referralCode } = req.body;

    if (!referralCode) {
      return res.status(400).json({ message: "Referral code is required" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const referee = await tx.select().from(users).where(eq(users.id, userId)).for('update');
        if (!referee[0]) throw new Error("User not found");

        if (referee[0].referralCode === referralCode) {
          throw new Error("You cannot use your own referral code");
        }

        const existingReferral = await tx.select().from(referrals)
          .where(eq(referrals.refereeId, userId))
          .limit(1);

        if (existingReferral.length > 0) {
          throw new Error("You have already used a referral code");
        }

        const referrer = await tx.select().from(users)
          .where(eq(users.referralCode, referralCode))
          .for('update');

        if (!referrer[0]) {
          throw new Error("Invalid referral code");
        }

        await tx.insert(referrals).values({
          referrerId: referrer[0].id,
          refereeId: userId,
          bonusCs: 2000,
        });

        await tx.update(users)
          .set({ csBalance: sql`${users.csBalance} + 1000` })
          .where(eq(users.id, userId));

        await tx.update(users)
          .set({ csBalance: sql`${users.csBalance} + 2000` })
          .where(eq(users.id, referrer[0].id));

        return {
          success: true,
          message: "Referral code applied! You received 1,000 CS",
          referrerBonus: 2000,
        };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to apply referral code" });
    }
  });
}
