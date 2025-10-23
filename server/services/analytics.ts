import { db } from "../storage";
import {
  dailyAnalytics,
  userSessions,
  retentionCohorts,
  users,
  blocks,
  powerUpPurchases,
  lootBoxPurchases,
  packPurchases
} from "@shared/schema";
import { eq, and, gte, lte, sql, count } from "drizzle-orm";

/**
 * Calculate Daily Active Users (DAU) for a specific date
 */
export async function calculateDAU(date: Date): Promise<number> {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Count unique users who had sessions on this day
    const result = await db.select({ count: sql<number>`COUNT(DISTINCT ${userSessions.telegramId})` })
      .from(userSessions)
      .where(
        and(
          gte(userSessions.startedAt, startOfDay),
          lte(userSessions.startedAt, endOfDay)
        )
      );

    return result[0]?.count || 0;
  } catch (error: any) {
    console.error("Calculate DAU error:", error);
    throw error;
  }
}

/**
 * Calculate Monthly Active Users (MAU) for a specific date (last 30 days from date)
 */
export async function calculateMAU(date: Date): Promise<number> {
  try {
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);

    // Count unique users who had sessions in the last 30 days
    const result = await db.select({ count: sql<number>`COUNT(DISTINCT ${userSessions.telegramId})` })
      .from(userSessions)
      .where(
        and(
          gte(userSessions.startedAt, startDate),
          lte(userSessions.startedAt, endDate)
        )
      );

    return result[0]?.count || 0;
  } catch (error: any) {
    console.error("Calculate MAU error:", error);
    throw error;
  }
}

/**
 * Calculate retention for a specific cohort and day offset
 */
export async function calculateRetention(cohortDate: string, dayOffset: number): Promise<number> {
  try {
    // Get users who signed up on cohortDate
    const cohortDateStart = new Date(cohortDate);
    cohortDateStart.setHours(0, 0, 0, 0);

    const cohortDateEnd = new Date(cohortDate);
    cohortDateEnd.setHours(23, 59, 59, 999);

    const cohortUsers = await db.select({ telegramId: users.telegramId })
      .from(users)
      .where(
        and(
          gte(users.createdAt, cohortDateStart),
          lte(users.createdAt, cohortDateEnd)
        )
      );

    const cohortSize = cohortUsers.length;
    if (cohortSize === 0) return 0;

    // Calculate target date (cohort date + dayOffset)
    const targetDate = new Date(cohortDate);
    targetDate.setDate(targetDate.getDate() + dayOffset);
    targetDate.setHours(0, 0, 0, 0);

    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);

    // Count how many of the cohort were active on target date
    const cohortTelegramIds = cohortUsers.map(u => u.telegramId).filter(id => id !== null);

    if (cohortTelegramIds.length === 0) return 0;

    const returnedUsers = await db.select({ count: sql<number>`COUNT(DISTINCT ${userSessions.telegramId})` })
      .from(userSessions)
      .where(
        and(
          sql`${userSessions.telegramId} IN (${sql.raw(cohortTelegramIds.map(id => `'${id}'`).join(','))})`,
          gte(userSessions.startedAt, targetDate),
          lte(userSessions.startedAt, targetDateEnd)
        )
      );

    const returnedCount = returnedUsers[0]?.count || 0;

    return returnedCount;
  } catch (error: any) {
    console.error("Calculate retention error:", error);
    throw error;
  }
}

/**
 * Generate comprehensive daily analytics report for a specific date
 */
export async function generateDailyReport(date: Date): Promise<any> {
  try {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate DAU
    const dau = await calculateDAU(date);

    // Calculate total users (cumulative up to this date)
    const totalUsersResult = await db.select({ count: count() })
      .from(users)
      .where(lte(users.createdAt, endOfDay));
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Calculate new users (signed up on this day)
    const newUsersResult = await db.select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, startOfDay),
          lte(users.createdAt, endOfDay)
        )
      );
    const newUsers = newUsersResult[0]?.count || 0;

    // Calculate returning users (active today but not new)
    const returningUsers = Math.max(0, dau - newUsers);

    // Calculate blocks mined today
    const blocksResult = await db.select({ count: count() })
      .from(blocks)
      .where(
        and(
          gte(blocks.timestamp, startOfDay),
          lte(blocks.timestamp, endOfDay)
        )
      );
    const totalBlocks = blocksResult[0]?.count || 0;

    // Calculate CS generated today (sum of block rewards)
    const csGeneratedResult = await db.select({ total: sql<number>`COALESCE(SUM(${blocks.reward}), 0)` })
      .from(blocks)
      .where(
        and(
          gte(blocks.timestamp, startOfDay),
          lte(blocks.timestamp, endOfDay)
        )
      );
    const csGeneratedToday = csGeneratedResult[0]?.total || 0;

    // Calculate CS spent today (we'd need a transactions table for this, for now use 0)
    const csSpentToday = 0; // TODO: Track CS spending in separate table

    // Calculate TON spent today
    const tonFromPowerUps = await db.select({ total: sql<number>`COALESCE(SUM(${powerUpPurchases.tonAmount}), 0)` })
      .from(powerUpPurchases)
      .where(
        and(
          gte(powerUpPurchases.purchasedAt, startOfDay),
          lte(powerUpPurchases.purchasedAt, endOfDay)
        )
      );

    const tonFromLootBoxes = await db.select({ total: sql<number>`COALESCE(SUM(${lootBoxPurchases.tonAmount}), 0)` })
      .from(lootBoxPurchases)
      .where(
        and(
          gte(lootBoxPurchases.purchasedAt, startOfDay),
          lte(lootBoxPurchases.purchasedAt, endOfDay)
        )
      );

    const tonFromPacks = await db.select({ total: sql<number>`COALESCE(SUM(${packPurchases.tonAmount}), 0)` })
      .from(packPurchases)
      .where(
        and(
          gte(packPurchases.purchasedAt, startOfDay),
          lte(packPurchases.purchasedAt, endOfDay)
        )
      );

    const totalTonSpent = (
      parseFloat(tonFromPowerUps[0]?.total?.toString() || '0') +
      parseFloat(tonFromLootBoxes[0]?.total?.toString() || '0') +
      parseFloat(tonFromPacks[0]?.total?.toString() || '0')
    ).toString();

    // Calculate purchase counts
    const powerUpPurchasesResult = await db.select({ count: count() })
      .from(powerUpPurchases)
      .where(
        and(
          gte(powerUpPurchases.purchasedAt, startOfDay),
          lte(powerUpPurchases.purchasedAt, endOfDay)
        )
      );
    const totalPowerUpPurchases = powerUpPurchasesResult[0]?.count || 0;

    const lootBoxPurchasesResult = await db.select({ count: count() })
      .from(lootBoxPurchases)
      .where(
        and(
          gte(lootBoxPurchases.purchasedAt, startOfDay),
          lte(lootBoxPurchases.purchasedAt, endOfDay)
        )
      );
    const totalLootBoxPurchases = lootBoxPurchasesResult[0]?.count || 0;

    const packPurchasesResult = await db.select({ count: count() })
      .from(packPurchases)
      .where(
        and(
          gte(packPurchases.purchasedAt, startOfDay),
          lte(packPurchases.purchasedAt, endOfDay)
        )
      );
    const totalPackPurchases = packPurchasesResult[0]?.count || 0;

    // Calculate average session duration
    const sessionsResult = await db.select({
      avgDuration: sql<number>`COALESCE(AVG(${userSessions.durationSeconds}), 0)`
    })
      .from(userSessions)
      .where(
        and(
          gte(userSessions.startedAt, startOfDay),
          lte(userSessions.startedAt, endOfDay),
          sql`${userSessions.durationSeconds} IS NOT NULL`
        )
      );
    const avgSessionDuration = Math.round(sessionsResult[0]?.avgDuration || 0);

    // Calculate average CS per user
    const avgCsPerUser = dau > 0 ? (csGeneratedToday / dau).toFixed(2) : '0.00';

    // Calculate total CS generated (all time up to this date)
    const totalCsGeneratedResult = await db.select({ total: sql<number>`COALESCE(SUM(${blocks.reward}), 0)` })
      .from(blocks)
      .where(lte(blocks.timestamp, endOfDay));
    const totalCsGenerated = totalCsGeneratedResult[0]?.total || 0;

    // Check if analytics row already exists for this date
    const existing = await db.select()
      .from(dailyAnalytics)
      .where(eq(dailyAnalytics.date, dateStr))
      .limit(1);

    const analyticsData = {
      date: dateStr,
      dau,
      newUsers,
      returningUsers,
      totalUsers,
      totalCsGenerated: totalCsGenerated.toString(),
      totalCsSpent: csSpentToday.toString(),
      totalTonSpent,
      totalBlocks,
      avgSessionDuration,
      avgCsPerUser,
      totalPowerUpPurchases,
      totalLootBoxPurchases,
      totalPackPurchases,
    };

    if (existing.length > 0) {
      // Update existing record
      await db.update(dailyAnalytics)
        .set(analyticsData)
        .where(eq(dailyAnalytics.date, dateStr));
    } else {
      // Insert new record
      await db.insert(dailyAnalytics).values(analyticsData);
    }

    return analyticsData;
  } catch (error: any) {
    console.error("Generate daily report error:", error);
    throw error;
  }
}

/**
 * Get analytics overview (latest stats)
 */
export async function getAnalyticsOverview(): Promise<any> {
  try {
    const today = new Date();

    // Get latest daily analytics
    const latestAnalytics = await db.select()
      .from(dailyAnalytics)
      .orderBy(sql`${dailyAnalytics.date} DESC`)
      .limit(1);

    if (latestAnalytics.length === 0) {
      // No data yet, calculate for today
      await generateDailyReport(today);
      const freshData = await db.select()
        .from(dailyAnalytics)
        .orderBy(sql`${dailyAnalytics.date} DESC`)
        .limit(1);

      if (freshData.length === 0) {
        return {
          dau: 0,
          mau: 0,
          totalUsers: 0,
          retentionD7: 0,
          avgCsPerUser: '0.00',
        };
      }

      return freshData[0];
    }

    const latest = latestAnalytics[0];

    // Calculate MAU
    const mau = await calculateMAU(today);

    // Calculate D7 retention
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cohortDateStr = sevenDaysAgo.toISOString().split('T')[0];

    const d7Retention = await calculateRetention(cohortDateStr, 7);

    // Get cohort size for percentage
    const cohortDateStart = new Date(cohortDateStr);
    cohortDateStart.setHours(0, 0, 0, 0);

    const cohortDateEnd = new Date(cohortDateStr);
    cohortDateEnd.setHours(23, 59, 59, 999);

    const cohortSizeResult = await db.select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, cohortDateStart),
          lte(users.createdAt, cohortDateEnd)
        )
      );
    const cohortSize = cohortSizeResult[0]?.count || 0;

    const retentionD7Percent = cohortSize > 0 ? Math.round((d7Retention / cohortSize) * 100) : 0;

    return {
      ...latest,
      mau,
      retentionD7: retentionD7Percent,
    };
  } catch (error: any) {
    console.error("Get analytics overview error:", error);
    throw error;
  }
}

/**
 * Get daily analytics history for charts
 */
export async function getDailyAnalyticsHistory(days: number = 30): Promise<any[]> {
  try {
    const analytics = await db.select()
      .from(dailyAnalytics)
      .orderBy(sql`${dailyAnalytics.date} DESC`)
      .limit(days);

    return analytics.reverse(); // Return in chronological order
  } catch (error: any) {
    console.error("Get daily analytics history error:", error);
    throw error;
  }
}

/**
 * Get retention cohort data
 */
export async function getRetentionCohorts(): Promise<any[]> {
  try {
    const cohorts = await db.select()
      .from(retentionCohorts)
      .orderBy(sql`${retentionCohorts.cohortDate} DESC`)
      .limit(30);

    return cohorts;
  } catch (error: any) {
    console.error("Get retention cohorts error:", error);
    throw error;
  }
}

/**
 * Update retention cohorts (run daily)
 */
export async function updateRetentionCohorts(): Promise<void> {
  try {
    // Get all cohort dates (unique signup dates) from the last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const cohortDates = await db.select({
      date: sql<string>`DATE(${users.createdAt})`
    })
      .from(users)
      .where(gte(users.createdAt, sixtyDaysAgo))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    for (const cohort of cohortDates) {
      const cohortDate = cohort.date;

      // Calculate retention for each day offset
      const day0 = await calculateRetention(cohortDate, 0);
      const day1 = await calculateRetention(cohortDate, 1);
      const day3 = await calculateRetention(cohortDate, 3);
      const day7 = await calculateRetention(cohortDate, 7);
      const day14 = await calculateRetention(cohortDate, 14);
      const day30 = await calculateRetention(cohortDate, 30);

      // Check if cohort record exists
      const existing = await db.select()
        .from(retentionCohorts)
        .where(eq(retentionCohorts.cohortDate, cohortDate))
        .limit(1);

      const cohortData = {
        cohortDate,
        day0,
        day1,
        day3,
        day7,
        day14,
        day30,
      };

      if (existing.length > 0) {
        await db.update(retentionCohorts)
          .set(cohortData)
          .where(eq(retentionCohorts.cohortDate, cohortDate));
      } else {
        await db.insert(retentionCohorts).values(cohortData);
      }
    }

    console.log(`✅ Updated ${cohortDates.length} retention cohorts`);
  } catch (error: any) {
    console.error("Update retention cohorts error:", error);
    throw error;
  }
}

/**
 * Track user session (call this on user activity)
 */
export async function trackUserSession(telegramId: string): Promise<void> {
  try {
    // Check if there's an active session from the last hour
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const activeSessions = await db.select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.telegramId, telegramId),
          gte(userSessions.startedAt, oneHourAgo),
          sql`${userSessions.endedAt} IS NULL`
        )
      )
      .limit(1);

    if (activeSessions.length > 0) {
      // Update existing session
      const session = activeSessions[0];
      const now = new Date();
      const durationSeconds = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);

      await db.update(userSessions)
        .set({
          endedAt: now,
          durationSeconds,
          actionsPerformed: session.actionsPerformed + 1,
        })
        .where(eq(userSessions.id, session.id));
    } else {
      // Create new session
      await db.insert(userSessions).values({
        telegramId,
        actionsPerformed: 1,
      });
    }
  } catch (error: any) {
    console.error("Track user session error:", error);
    // Don't throw - session tracking should not break the main flow
  }
}
