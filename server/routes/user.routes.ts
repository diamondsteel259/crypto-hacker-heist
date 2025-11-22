import type { Express, Request, Response } from "express";
import { storage, db } from "../storage";
import { users, ownedEquipment, blockRewards, referrals, userStreaks, dailyLoginRewards } from "@shared/schema";
import { eq, sql, and } from "drizzle-orm";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";
import { asyncHandler, createSuccessResponse } from "../middleware/errorHandler";
import { createNotFoundError, createValidationError } from "../errors/apiErrors";

// Helper function to calculate daily login rewards based on streak day
function calculateDailyLoginReward(streakDay: number): { cs: number; chst: number; item: string | null } {
  const baseCs = 500;
  const baseChst = 10;
  
  const cs = baseCs * streakDay;
  const chst = baseChst * streakDay;
  
  let item: string | null = null;
  
  if (streakDay % 30 === 0) {
    item = "epic_power_boost";
  } else if (streakDay % 14 === 0) {
    item = "rare_power_boost";
  } else if (streakDay % 7 === 0) {
    item = "common_power_boost";
  }
  
  return { cs, chst, item };
}

export function registerUserRoutes(app: Express): void {
  // Get user profile
  app.get("/api/user/:userId", validateTelegramAuth, verifyUserAccess, asyncHandler(async (req: Request, res: Response) => {
    const user = await storage.getUser(req.params.userId);
    if (!user) throw createNotFoundError("User not found");
    res.json(createSuccessResponse(user));
  }));

  // Get user balance
  app.get("/api/user/:userId/balance", validateTelegramAuth, verifyUserAccess, asyncHandler(async (req: Request, res: Response) => {
    const user = await storage.getUser(req.params.userId);
    if (!user) throw createNotFoundError("User not found");
    
    res.json(createSuccessResponse({
      csBalance: user.csBalance,
      chstBalance: user.chstBalance,
    }));
  }));

  // Get user rank (hashrate and balance) - returns simplified rank for compatibility
  app.get("/api/user/:userId/rank", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Get balance rank (primary ranking metric for tests)
      const balanceRank = await db.select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(sql`${users.csBalance} > ${user.csBalance}`);

      // Get hashrate rank
      const hashrateRank = await db.select({ count: sql<number>`COUNT(*)` })
        .from(users)
        .where(sql`${users.totalHashrate} > ${user.totalHashrate}`);

      // Get total users
      const totalUsers = await db.select({ count: sql<number>`COUNT(*)` })
        .from(users);

      // Return both formats for compatibility
      res.json({
        rank: (balanceRank[0]?.count || 0) + 1, // Simplified format for tests
        hashrateRank: (hashrateRank[0]?.count || 0) + 1,
        balanceRank: (balanceRank[0]?.count || 0) + 1,
        totalUsers: totalUsers[0]?.count || 0,
        userId,
      });
    } catch (error: any) {
      console.error("User rank error:", error);
      res.status(500).json({ error: "Failed to fetch user rank" });
    }
  });

  // Get user network stats
  app.get("/api/user/:userId/network-stats", validateTelegramAuth, verifyUserAccess, asyncHandler(async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) throw createNotFoundError("User not found");

      // Get total network hashrate
      const networkHashrateResult = await db.select({ 
        total: sql<number>`COALESCE(SUM(${users.totalHashrate}), 0)` 
      }).from(users);

      const networkHashrate = Number(networkHashrateResult[0]?.total || 0);
      const userHashrate = user.totalHashrate || 0;
      const networkShare = networkHashrate > 0 ? userHashrate / networkHashrate : 0;

      res.json(createSuccessResponse({
        userHashrate,
        networkHashrate,
        networkShare,
      }));
    } catch (error: any) {
      console.error("Network stats error:", error);
      throw error; // Let error handler handle it
    }
  });

  // Get user streak status
  app.get("/api/user/:userId/streak", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      // Get streak data
      const streakData = await db.select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, user.telegramId!))
        .limit(1);

      const currentStreak = streakData.length > 0 ? streakData[0].currentStreak : 0;
      const longestStreak = streakData.length > 0 ? streakData[0].longestStreak : 0;
      const lastLoginDate = streakData.length > 0 ? streakData[0].lastLoginDate : null;

      res.json({
        currentStreak,
        longestStreak,
        lastLoginDate,
      });
    } catch (error: any) {
      console.error("Get streak error:", error);
      res.status(500).json({ error: "Failed to fetch streak" });
    }
  });

  // Streak check-in
  app.post("/api/user/:userId/streak/checkin", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });

      const today = new Date().toISOString().split('T')[0];

      // Get current streak data
      const streakData = await db.select()
        .from(userStreaks)
        .where(eq(userStreaks.userId, user.telegramId!))
        .limit(1);

      let currentStreak = 1;

      if (streakData.length > 0) {
        const lastLoginDate = new Date(streakData[0].lastLoginDate);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Check if already checked in today
        if (streakData[0].lastLoginDate === today) {
          return res.status(200).json({
            success: true,
            currentStreak: streakData[0].currentStreak,
            message: "Already checked in today",
          });
        }

        // Check if streak continues (checked in yesterday)
        if (streakData[0].lastLoginDate === yesterdayStr) {
          currentStreak = streakData[0].currentStreak + 1;
        } else {
          // Streak broken, reset to 1
          currentStreak = 1;
        }

        // Update streak
        await db.update(userStreaks)
          .set({
            currentStreak,
            longestStreak: sql`GREATEST(${userStreaks.longestStreak}, ${currentStreak})`,
            lastLoginDate: today,
          })
          .where(eq(userStreaks.userId, user.telegramId!));
      } else {
        // Create new streak
        await db.insert(userStreaks).values({
          userId: user.telegramId!,
          currentStreak: 1,
          longestStreak: 1,
          lastLoginDate: today,
        });
      }

      res.json({
        success: true,
        currentStreak,
        message: `Day ${currentStreak} check-in complete!`,
      });
    } catch (error: any) {
      console.error("Streak check-in error:", error);
      res.status(500).json({ error: "Failed to check in" });
    }
  });

  // Get daily login status
  app.get("/api/user/:userId/daily-login/status", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's streak data
      const streakData = await db.select().from(userStreaks).where(eq(userStreaks.userId, user.telegramId!)).limit(1);
      const currentStreak = streakData.length > 0 ? streakData[0].currentStreak : 0;

      // Check if user has claimed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysClaim = await db.select().from(dailyLoginRewards)
        .where(and(
          eq(dailyLoginRewards.userId, user.telegramId!),
          sql`DATE(${dailyLoginRewards.claimedAt}) = DATE(${today})`
        ))
        .limit(1);

      const canClaim = todaysClaim.length === 0;
      const nextStreakDay = canClaim ? currentStreak + 1 : currentStreak;
      const nextReward = calculateDailyLoginReward(nextStreakDay);

      res.json({
        canClaim,
        currentStreak,
        nextReward,
        lastClaimDate: todaysClaim.length > 0 ? todaysClaim[0].claimedAt : null,
      });
    } catch (error: any) {
      console.error("Daily login status error:", error);
      res.status(500).json({ error: "Failed to get daily login status" });
    }
  });

  // Claim daily login reward
  app.post("/api/user/:userId/daily-login/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if already claimed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysClaim = await db.select().from(dailyLoginRewards)
        .where(and(
          eq(dailyLoginRewards.userId, user.telegramId!),
          sql`DATE(${dailyLoginRewards.claimedAt}) = DATE(${today})`
        ))
        .limit(1);

      if (todaysClaim.length > 0) {
        return res.status(400).json({ message: "Daily reward already claimed today" });
      }

      // Get or create streak data
      const streakData = await db.select().from(userStreaks).where(eq(userStreaks.userId, user.telegramId!)).limit(1);
      let currentStreak = 0;
      
      if (streakData.length > 0) {
        const lastLoginDate = new Date(streakData[0].lastLoginDate);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLoginDate >= yesterday && lastLoginDate < today) {
          currentStreak = streakData[0].currentStreak + 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      // Calculate rewards
      const rewards = calculateDailyLoginReward(currentStreak);
      const loginDateStr = today.toISOString().split('T')[0];

      // Update user balances and streak in a transaction
      await db.transaction(async (tx: any) => {
        await tx.insert(dailyLoginRewards).values({
          userId: user.telegramId!,
          loginDate: loginDateStr,
          streakDay: currentStreak,
          rewardCs: rewards.cs,
          rewardChst: rewards.chst,
          rewardItem: rewards.item,
        });

        await tx.update(users)
          .set({
            csBalance: sql`${users.csBalance} + ${rewards.cs}`,
            chstBalance: sql`${users.chstBalance} + ${rewards.chst}`,
          })
          .where(eq(users.id, userId));

        if (streakData.length > 0) {
          await tx.update(userStreaks)
            .set({
              currentStreak,
              longestStreak: sql`GREATEST(${userStreaks.longestStreak}, ${currentStreak})`,
              lastLoginDate: loginDateStr,
            })
            .where(eq(userStreaks.userId, user.telegramId!));
        } else {
          await tx.insert(userStreaks).values({
            userId: user.telegramId!,
            currentStreak,
            longestStreak: currentStreak,
            lastLoginDate: loginDateStr,
          });
        }
      });

      res.json({
        success: true,
        reward: rewards,
        streakDay: currentStreak,
        message: `Day ${currentStreak} reward claimed!`,
      });
    } catch (error: any) {
      console.error("Daily login claim error:", error);
      res.status(500).json({ error: "Failed to claim daily reward" });
    }
  });

  // Complete tutorial
  app.post("/api/user/:userId/tutorial/complete", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users).where(eq(users.id, userId)).for('update');
        if (!user[0]) throw new Error("User not found");

        if (user[0].tutorialCompleted) {
          return {
            success: true,
            message: "Tutorial already completed",
            alreadyCompleted: true,
          };
        }

        // Mark tutorial as completed and award bonus
        await tx.update(users)
          .set({
            tutorialCompleted: true,
            csBalance: sql`${users.csBalance} + 5000`,
          })
          .where(eq(users.id, userId));

        return {
          success: true,
          message: "Tutorial completed! Earned 5,000 CS bonus",
          bonus: 5000,
        };
      });

      res.json(result);
    } catch (error: any) {
      console.error("Tutorial completion error:", error);
      res.status(500).json({ error: error.message || "Failed to complete tutorial" });
    }
  });

  // Reset user game data
  app.post("/api/user/:userId/reset", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { confirmReset } = req.body;

    if (!confirmReset) {
      return res.status(400).json({ message: "Reset confirmation required" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        // Delete all user's equipment
        await tx.delete(ownedEquipment).where(eq(ownedEquipment.userId, userId));

        // Delete all user's block rewards
        await tx.delete(blockRewards).where(eq(blockRewards.userId, userId));

        // Delete all user's referrals (both as referrer and referee)
        await tx.delete(referrals).where(eq(referrals.referrerId, userId));
        await tx.delete(referrals).where(eq(referrals.refereeId, userId));

        // Reset user balances and hashrate
        await tx.update(users)
          .set({
            csBalance: 0,
            chstBalance: 0,
            totalHashrate: 0
          })
          .where(eq(users.id, userId));

        return { success: true, message: "Game data reset successfully" };
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to reset game data" });
    }
  });
}
