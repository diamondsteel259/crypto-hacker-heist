import type { Express } from "express";
import { db } from "../storage";
import { users, dailyLoginRewards, userStreaks } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";

// Helper function to calculate daily login rewards based on streak day
function calculateDailyLoginReward(streakDay: number): { cs: number; chst: number; item: string | null } {
  // Rewards escalate each day, with special bonuses on day 7, 14, 21, etc.
  const baseCs = 500;
  const baseChst = 10;
  
  // Calculate CS reward (increases by 500 each day)
  const cs = baseCs * streakDay;
  
  // Calculate CHST reward (increases by 10 each day)
  const chst = baseChst * streakDay;
  
  // Special items on milestone days
  let item: string | null = null;
  
  if (streakDay % 30 === 0) {
    // Every 30 days: Epic reward
    item = "epic_power_boost";
  } else if (streakDay % 14 === 0) {
    // Every 14 days: Rare reward
    item = "rare_power_boost";
  } else if (streakDay % 7 === 0) {
    // Every 7 days: Common reward
    item = "common_power_boost";
  }
  
  return { cs, chst, item };
}

export function registerDailyLoginRoutes(app: Express): void {
  // Daily Login Rewards - Get Status
  app.get("/api/user/:userId/daily-login/status", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's streak data
      const streakData = await db.select().from(userStreaks).where(eq(userStreaks.userId, user[0].telegramId!)).limit(1);
      const currentStreak = streakData.length > 0 ? streakData[0].currentStreak : 0;

      // Check if user has claimed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysClaim = await db.select().from(dailyLoginRewards)
        .where(and(
          eq(dailyLoginRewards.userId, user[0].telegramId!),
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

  // Daily Login Rewards - Claim
  app.post("/api/user/:userId/daily-login/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;

    try {
      const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if already claimed today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaysClaim = await db.select().from(dailyLoginRewards)
        .where(and(
          eq(dailyLoginRewards.userId, user[0].telegramId!),
          sql`DATE(${dailyLoginRewards.claimedAt}) = DATE(${today})`
        ))
        .limit(1);

      if (todaysClaim.length > 0) {
        return res.status(400).json({ error: "Daily reward already claimed today" });
      }

      // Get or create streak data
      const streakData = await db.select().from(userStreaks).where(eq(userStreaks.userId, user[0].telegramId!)).limit(1);
      let currentStreak = 0;
      
      if (streakData.length > 0) {
        const lastLoginDate = new Date(streakData[0].lastLoginDate);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Check if streak continues (claimed yesterday)
        if (lastLoginDate >= yesterday && lastLoginDate < today) {
          currentStreak = streakData[0].currentStreak + 1;
        } else {
          // Streak broken, reset to 1
          currentStreak = 1;
        }
      } else {
        // First time claiming
        currentStreak = 1;
      }

      // Calculate rewards
      const rewards = calculateDailyLoginReward(currentStreak);
      
      // Format today's date as YYYY-MM-DD
      const loginDateStr = today.toISOString().split('T')[0];

      // Update user balances and streak in a transaction
      await db.transaction(async (tx: any) => {
        // Record the claim
        await tx.insert(dailyLoginRewards).values({
          userId: user[0].telegramId!,
          loginDate: loginDateStr,
          streakDay: currentStreak,
          rewardCs: rewards.cs,
          rewardChst: rewards.chst,
          rewardItem: rewards.item,
        });

        // Update user balances
        await tx.update(users)
          .set({
            csBalance: sql`${users.csBalance} + ${rewards.cs}`,
            chstBalance: sql`${users.chstBalance} + ${rewards.chst}`,
          })
          .where(eq(users.id, userId));

        // Update or insert streak data
        if (streakData.length > 0) {
          await tx.update(userStreaks)
            .set({
              currentStreak,
              longestStreak: sql`GREATEST(${userStreaks.longestStreak}, ${currentStreak})`,
              lastLoginDate: loginDateStr,
            })
            .where(eq(userStreaks.userId, user[0].telegramId!));
        } else {
          await tx.insert(userStreaks).values({
            userId: user[0].telegramId!,
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
}