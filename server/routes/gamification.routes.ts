import type { Express } from "express";
import { validateTelegramAuth, verifyUserAccess, type AuthRequest } from "../middleware/auth";
import { db } from "../db";
import { userSpins, spinHistory, jackpotWins, users, userHourlyBonuses } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export function registerGamificationRoutes(app: Express): void {
  // Get spin status for today
  app.get("/api/user/:userId/spin/status", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { telegramUser } = req as AuthRequest;
      if (!telegramUser) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Get or create today's spin record
      let [spinRecord] = await db
        .select()
        .from(userSpins)
        .where(and(
          eq(userSpins.userId, telegramUser.id.toString()),
          eq(userSpins.spinDate, today)
        ))
        .limit(1);

      if (!spinRecord) {
        // Create new record for today
        [spinRecord] = await db
          .insert(userSpins)
          .values({
            userId: telegramUser.id.toString(),
            spinDate: today,
            freeSpinUsed: false,
            paidSpinsCount: 0,
          })
          .returning();
      }

      res.json({
        freeSpinAvailable: !spinRecord.freeSpinUsed,
        freeSpinUsed: spinRecord.freeSpinUsed,
        paidSpinsCount: spinRecord.paidSpinsCount || 0,
      });
    } catch (error: any) {
      console.error("Get spin status error:", error);
      res.status(500).json({ error: "Failed to get spin status" });
    }
  });

  // Spin the wheel
  app.post("/api/user/:userId/spin", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { telegramUser } = req as AuthRequest;
      if (!telegramUser) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { isFree, quantity = 1, tonTransactionHash, userWalletAddress, tonAmount } = req.body;
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Get or create today's spin record
      let [spinRecord] = await db
        .select()
        .from(userSpins)
        .where(and(
          eq(userSpins.userId, telegramUser.id.toString()),
          eq(userSpins.spinDate, today)
        ))
        .limit(1);

      if (!spinRecord) {
        [spinRecord] = await db
          .insert(userSpins)
          .values({
            userId: telegramUser.id.toString(),
            spinDate: today,
            freeSpinUsed: false,
            paidSpinsCount: 0,
          })
          .returning();
      }

      // Validate spin request
      if (isFree) {
        if (spinRecord.freeSpinUsed) {
          return res.status(400).json({ error: "Free spin already used today" });
        }
      } else {
        // Paid spins - verify TON transaction (simplified for now)
        if (!tonTransactionHash) {
          return res.status(400).json({ error: "Transaction hash required for paid spins" });
        }
      }

      // Perform spins
      const prizes: any[] = [];
      let totalCs = 0;
      let totalChst = 0;
      let jackpotWon = false;

      for (let i = 0; i < quantity; i++) {
        const prize = getRandomPrize(!isFree); // Paid spins can win jackpot
        prizes.push(prize);

        // Award prize
        if (prize.type === 'cs') {
          totalCs += prize.value;
        } else if (prize.type === 'chst') {
          totalChst += prize.value;
        } else if (prize.type === 'jackpot') {
          jackpotWon = true;
          // Record jackpot win
          await db.insert(jackpotWins).values({
            userId: telegramUser.id.toString(),
            username: telegramUser.username || telegramUser.firstName || 'Player',
            walletAddress: userWalletAddress || null,
            amount: '1.0',
            paidOut: false,
          });
        }

        // Record in history
        await db.insert(spinHistory).values({
          userId: telegramUser.id.toString(),
          prizeType: prize.type,
          prizeValue: prize.value.toString(),
          wasFree: isFree,
        });
      }

      // Update user balance
      if (totalCs > 0 || totalChst > 0) {
        await db
          .update(users)
          .set({
            csBalance: sql`${users.csBalance} + ${totalCs}`,
            chstBalance: sql`${users.chstBalance} + ${totalChst}`,
          })
          .where(eq(users.telegramId, telegramUser.id.toString()));
      }

      // Update spin record
      if (isFree) {
        await db
          .update(userSpins)
          .set({
            freeSpinUsed: true,
            lastSpinAt: new Date(),
          })
          .where(eq(userSpins.id, spinRecord.id));
      } else {
        await db
          .update(userSpins)
          .set({
            paidSpinsCount: spinRecord.paidSpinsCount + quantity,
            lastSpinAt: new Date(),
          })
          .where(eq(userSpins.id, spinRecord.id));
      }

      let message = `Won ${prizes.length} prize(s)!`;
      if (jackpotWon) {
        message = "🎰 JACKPOT! You won 1 TON! Admin will process your payout.";
      } else if (totalCs > 0 && totalChst > 0) {
        message = `Won ${totalCs.toLocaleString()} CS + ${totalChst.toLocaleString()} CHST!`;
      } else if (totalCs > 0) {
        message = `Won ${totalCs.toLocaleString()} CS!`;
      } else if (totalChst > 0) {
        message = `Won ${totalChst.toLocaleString()} CHST!`;
      }

      res.json({
        success: true,
        prizes,
        summary: {
          total_cs: totalCs,
          total_chst: totalChst,
          jackpot_won: jackpotWon,
          spins_completed: quantity,
        },
        message,
      });
    } catch (error: any) {
      console.error("Spin wheel error:", error);
      res.status(500).json({ error: error.message || "Failed to spin wheel" });
    }
  });

  // Get hourly bonus status
  app.get("/api/user/:userId/hourly-bonus/status", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { telegramUser } = req as AuthRequest;
      if (!telegramUser) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get last hourly bonus claim
      const [lastClaim] = await db
        .select()
        .from(userHourlyBonuses)
        .where(eq(userHourlyBonuses.userId, telegramUser.id.toString()))
        .orderBy(desc(userHourlyBonuses.claimedAt))
        .limit(1);

      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      let available = true;
      let nextAvailableAt = null;
      let minutesRemaining = 0;

      if (lastClaim) {
        const lastClaimTime = new Date(lastClaim.claimedAt).getTime();
        const timeSinceLast = now - lastClaimTime;

        if (timeSinceLast < oneHour) {
          available = false;
          const timeUntilNext = oneHour - timeSinceLast;
          minutesRemaining = Math.ceil(timeUntilNext / (60 * 1000));
          nextAvailableAt = new Date(lastClaimTime + oneHour).toISOString();
        }
      }

      res.json({
        available,
        nextAvailableAt,
        minutesRemaining,
      });
    } catch (error: any) {
      console.error("Get hourly bonus status error:", error);
      res.status(500).json({ error: "Failed to get hourly bonus status" });
    }
  });

  // Claim hourly bonus
  app.post("/api/user/:userId/hourly-bonus/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { telegramUser } = req as AuthRequest;
      if (!telegramUser) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Check if hourly bonus is available
      const [lastClaim] = await db
        .select()
        .from(userHourlyBonuses)
        .where(eq(userHourlyBonuses.userId, telegramUser.id.toString()))
        .orderBy(desc(userHourlyBonuses.claimedAt))
        .limit(1);

      const now = Date.now();
      const oneHour = 60 * 60 * 1000;

      if (lastClaim) {
        const lastClaimTime = new Date(lastClaim.claimedAt).getTime();
        const timeSinceLast = now - lastClaimTime;

        if (timeSinceLast < oneHour) {
          const minutesRemaining = Math.ceil((oneHour - timeSinceLast) / (60 * 1000));
          return res.status(400).json({
            error: `Please wait ${minutesRemaining} more minute(s)`
          });
        }
      }

      // Generate random reward (500-2000 CS)
      const reward = Math.floor(Math.random() * 1501) + 500;

      // Record claim
      await db.insert(userHourlyBonuses).values({
        userId: telegramUser.id.toString(),
        rewardAmount: reward,
      });

      // Update user balance
      await db
        .update(users)
        .set({
          csBalance: sql`${users.csBalance} + ${reward}`,
        })
        .where(eq(users.telegramId, telegramUser.id.toString()));

      res.json({
        success: true,
        reward,
        message: `Claimed ${reward.toLocaleString()} CS!`,
      });
    } catch (error: any) {
      console.error("Claim hourly bonus error:", error);
      res.status(500).json({ error: error.message || "Failed to claim hourly bonus" });
    }
  });
}

// Helper function to get random prize
function getRandomPrize(canWinJackpot: boolean) {
  const random = Math.random() * 100;

  // Jackpot (0.1% chance, only for paid spins)
  if (canWinJackpot && random < 0.1) {
    return {
      type: 'jackpot',
      value: 1,
      display: '1 TON Jackpot'
    };
  }

  // CS prizes (40% chance)
  if (random < 40.1) {
    const amounts = [1000, 2500, 5000, 10000, 25000];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    return {
      type: 'cs',
      value: amount,
      display: `${amount.toLocaleString()} CS`
    };
  }

  // CHST prizes (30% chance)
  if (random < 70.1) {
    const amounts = [50, 100, 200, 300, 500];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    return {
      type: 'chst',
      value: amount,
      display: `${amount} CHST`
    };
  }

  // Power-up (20% chance)
  if (random < 90.1) {
    return {
      type: 'powerup',
      value: 1,
      display: 'Power-Up Boost'
    };
  }

  // Equipment (10% chance)
  return {
    type: 'equipment',
    value: 1,
    display: 'Equipment Item'
  };
}
