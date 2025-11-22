import { logger } from "../logger";
import type { Express } from "express";
import { storage, db } from "../storage";
import { users, referrals } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";

export function registerSocialRoutes(app: Express): void {
  // Leaderboard: Top hashrate
  app.get("/api/leaderboard/hashrate", validateTelegramAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topMiners = await db.select({
        id: users.id,
        username: users.username,
        totalHashrate: users.totalHashrate,
        csBalance: users.csBalance,
        photoUrl: users.photoUrl,
      })
        .from(users)
        .orderBy(sql`${users.totalHashrate} DESC`)
        .limit(Math.min(limit, 100)); // Max 100 results

      res.json(topMiners);
    } catch (error: any) {
      logger.error("Leaderboard hashrate error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Leaderboard: Top balance
  app.get("/api/leaderboard/balance", validateTelegramAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topBalances = await db.select({
        id: users.id,
        username: users.username,
        csBalance: users.csBalance,
        totalHashrate: users.totalHashrate,
        photoUrl: users.photoUrl,
      })
        .from(users)
        .orderBy(sql`${users.csBalance} DESC`)
        .limit(Math.min(limit, 100)); // Max 100 results

      res.json(topBalances);
    } catch (error: any) {
      logger.error("Leaderboard balance error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Leaderboard: Top referrers
  app.get("/api/leaderboard/referrals", validateTelegramAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      // Get users with referral counts
      const topReferrers = await db.select({
        id: users.id,
        username: users.username,
        photoUrl: users.photoUrl,
        referralCount: sql<number>`(SELECT COUNT(*) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId})`,
        totalBonus: sql<number>`(SELECT COALESCE(SUM(${referrals.bonusEarned}), 0) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId})`,
      })
        .from(users)
        .orderBy(sql`(SELECT COUNT(*) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId}) DESC`)
        .limit(Math.min(limit, 100));

      res.json(topReferrers);
    } catch (error: any) {
      logger.error("Leaderboard referrals error:", error);
      res.status(500).json({ error: "Failed to fetch referral leaderboard" });
    }
  });

  // Get user's referrals
  app.get("/api/user/:userId/referrals", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const referrals = await storage.getUserReferrals(req.params.userId);
    res.json(referrals);
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

  // User network stats (authenticated)
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
      networkShare,
      userSharePercentage: networkShare
    });
  });

  // Public network stats (no auth required) for reward calculations
  app.get("/api/network-stats", async (req, res) => {
    const allUsers = await storage.getAllUsers();
    const activeMiners = allUsers.filter(u => u.totalHashrate > 0);
    const totalNetworkHashrate = activeMiners.reduce((sum, u) => sum + u.totalHashrate, 0);

    res.json({
      totalHashrate: totalNetworkHashrate,
      activeMiners: activeMiners.length,
      timestamp: new Date().toISOString()
    });
  });
}
