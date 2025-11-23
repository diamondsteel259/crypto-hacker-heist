import { logger } from "../logger";
import { db } from "../storage";
import { userSegments, users, userSessions, powerUpPurchases, lootBoxPurchases, packPurchases, segmentTargetedOffers } from "@shared/schema";
import { eq, sql, desc, and, lte, gte } from "drizzle-orm";
import { sendMessageToUser } from "../bot";

/**
 * Calculate user segment based on spending and activity
 */
export async function calculateUserSegment(telegramId: string): Promise<string> {
  try {
    // Get user data
    const user = await db.select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1);

    if (user.length === 0) {
      return 'new_user';
    }

    const userData = user[0];

    // Calculate lifetime value (total TON spent)
    const tonFromPowerUps = await db.select({
      total: sql<number>`COALESCE(SUM(${powerUpPurchases.tonAmount}), 0)`,
    })
      .from(powerUpPurchases)
      .where(eq(powerUpPurchases.userId, telegramId));

    const tonFromLootBoxes = await db.select({
      total: sql<number>`COALESCE(SUM(${lootBoxPurchases.tonAmount}), 0)`,
    })
      .from(lootBoxPurchases)
      .where(eq(lootBoxPurchases.userId, telegramId));

    const tonFromPacks = await db.select({
      total: sql<number>`COALESCE(SUM(${packPurchases.tonAmount}), 0)`,
    })
      .from(packPurchases)
      .where(eq(packPurchases.userId, telegramId));

    const lifetimeValue = (
      parseFloat(tonFromPowerUps[0]?.total?.toString() || '0') +
      parseFloat(tonFromLootBoxes[0]?.total?.toString() || '0') +
      parseFloat(tonFromPacks[0]?.total?.toString() || '0')
    );

    // Get last session
    const lastSession = await db.select()
      .from(userSessions)
      .where(eq(userSessions.telegramId, telegramId))
      .orderBy(desc(userSessions.startedAt))
      .limit(1);

    const now = new Date();
    const lastActiveAt = lastSession.length > 0 ? lastSession[0].startedAt : userData.createdAt;
    const daysSinceLastActive = Math.floor((now.getTime() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceCreated = Math.floor((now.getTime() - userData.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Get segment history to check if was churned
    const existingSegment = await db.select()
      .from(userSegments)
      .where(eq(userSegments.telegramId, telegramId))
      .limit(1);

    const wasChurned = existingSegment.length > 0 && existingSegment[0].segment === 'churned';

    // Segment priority:
    // 1. Whale/Dolphin/Minnow (spend-based) - highest priority
    // 2. New user (< 7 days old)
    // 3. Returning (was churned, now back)
    // 4. At-risk (7-14 days inactive)
    // 5. Churned (> 14 days inactive)
    // 6. Active (< 3 days inactive)

    let segment = 'active';

    // Spend-based segments (highest priority)
    if (lifetimeValue >= 50) {
      segment = 'whale';
    } else if (lifetimeValue >= 10) {
      segment = 'dolphin';
    } else if (lifetimeValue > 0) {
      segment = 'minnow';
    }
    // Activity-based segments (only if no spending)
    else if (daysSinceCreated < 7) {
      segment = 'new_user';
    } else if (daysSinceLastActive >= 14) {
      segment = 'churned';
    } else if (daysSinceLastActive >= 7 && daysSinceLastActive < 14) {
      segment = 'at_risk';
    } else if (daysSinceLastActive >= 3 && wasChurned) {
      segment = 'returning';
    } else if (daysSinceLastActive < 3) {
      segment = 'active';
    }

    return segment;
  } catch (error: any) {
    logger.error("Calculate user segment error:", error);
    throw error;
  }
}

/**
 * Refresh segment for a single user
 */
export async function refreshUserSegment(telegramId: string): Promise<void> {
  try {
    const segment = await calculateUserSegment(telegramId);

    // Calculate additional metrics
    const user = await db.select()
      .from(users)
      .where(eq(users.telegramId, telegramId))
      .limit(1);

    if (user.length === 0) return;

    // Get lifetime value
    const tonFromPowerUps = await db.select({
      total: sql<number>`COALESCE(SUM(${powerUpPurchases.tonAmount}), 0)`,
    })
      .from(powerUpPurchases)
      .where(eq(powerUpPurchases.userId, telegramId));

    const tonFromLootBoxes = await db.select({
      total: sql<number>`COALESCE(SUM(${lootBoxPurchases.tonAmount}), 0)`,
    })
      .from(lootBoxPurchases)
      .where(eq(lootBoxPurchases.userId, telegramId));

    const tonFromPacks = await db.select({
      total: sql<number>`COALESCE(SUM(${packPurchases.tonAmount}), 0)`,
    })
      .from(packPurchases)
      .where(eq(packPurchases.userId, telegramId));

    const lifetimeValue = (
      parseFloat(tonFromPowerUps[0]?.total?.toString() || '0') +
      parseFloat(tonFromLootBoxes[0]?.total?.toString() || '0') +
      parseFloat(tonFromPacks[0]?.total?.toString() || '0')
    );

    // Get session stats
    const sessions = await db.select()
      .from(userSessions)
      .where(eq(userSessions.telegramId, telegramId));

    const totalSessions = sessions.length;
    const avgSessionDuration = sessions.length > 0
      ? Math.floor(sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / sessions.length)
      : 0;

    const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
    const lastActiveAt = lastSession ? lastSession.startedAt : user[0].createdAt;
    const daysSinceLastActive = Math.floor((new Date().getTime() - lastActiveAt.getTime()) / (1000 * 60 * 60 * 24));

    // Check D7 retention
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const retentionD7 = sessions.some(s => s.startedAt >= sevenDaysAgo);

    // Update or insert segment
    const existing = await db.select()
      .from(userSegments)
      .where(eq(userSegments.telegramId, telegramId))
      .limit(1);

    const segmentData = {
      telegramId,
      segment,
      lifetimeValue: lifetimeValue.toFixed(2),
      lastActiveAt,
      daysSinceLastActive,
      totalSessions,
      avgSessionDuration,
      retentionD7,
    };

    if (existing.length > 0) {
      await db.update(userSegments)
        .set(segmentData)
        .where(eq(userSegments.telegramId, telegramId));
    } else {
      await db.insert(userSegments).values(segmentData);
    }
  } catch (error: any) {
    logger.error("Refresh user segment error:", error);
    throw error;
  }
}

/**
 * Refresh all user segments (run daily)
 */
export async function refreshAllSegments(): Promise<void> {
  try {
    logger.info("🔄 Refreshing all user segments...");

    // Get all users
    const allUsers = await db.select({ telegramId: users.telegramId })
      .from(users);

    let updated = 0;

    for (const user of allUsers) {
      if (user.telegramId) {
        try {
          await refreshUserSegment(user.telegramId);
          updated++;
        } catch (error) {
          logger.error(`Failed to refresh segment for ${user.telegramId}:`, error);
        }
      }
    }

    logger.info(`✅ Refreshed segments for ${updated} users`);
  } catch (error: any) {
    logger.error("Refresh all segments error:", error);
    throw error;
  }
}

/**
 * Get users in a specific segment
 */
export async function getUsersInSegment(segment: string): Promise<any[]> {
  try {
    const segmentUsers = await db.select({
      id: userSegments.id,
      telegramId: userSegments.telegramId,
      username: users.username,
      segment: userSegments.segment,
      lifetimeValue: userSegments.lifetimeValue,
      lastActiveAt: userSegments.lastActiveAt,
      daysSinceLastActive: userSegments.daysSinceLastActive,
      totalSessions: userSegments.totalSessions,
      avgSessionDuration: userSegments.avgSessionDuration,
      retentionD7: userSegments.retentionD7,
      updatedAt: userSegments.updatedAt,
    })
      .from(userSegments)
      .leftJoin(users, eq(users.telegramId, userSegments.telegramId))
      .where(eq(userSegments.segment, segment))
      .orderBy(desc(userSegments.lifetimeValue));

    return segmentUsers;
  } catch (error: any) {
    logger.error("Get users in segment error:", error);
    throw error;
  }
}

/**
 * Get segment overview (count per segment)
 */
export async function getSegmentOverview(): Promise<any> {
  try {
    const segments = await db.select({
      segment: userSegments.segment,
      count: sql<number>`COUNT(*)`,
    })
      .from(userSegments)
      .groupBy(userSegments.segment);

    const totalUsers = segments.reduce((sum, s) => sum + (s.count || 0), 0);

    const overview: Record<string, { count: number; percentage: number }> = {};

    for (const seg of segments) {
      overview[seg.segment] = {
        count: seg.count || 0,
        percentage: totalUsers > 0 ? ((seg.count || 0) / totalUsers) * 100 : 0,
      };
    }

    return {
      totalUsers,
      segments: overview,
    };
  } catch (error: any) {
    logger.error("Get segment overview error:", error);
    throw error;
  }
}

/**
 * Get targeted offers for a user's segment
 */
export async function getTargetedOffersForUser(telegramId: string): Promise<any[]> {
  try {
    // Get user segment
    const userSegment = await db.select()
      .from(userSegments)
      .where(eq(userSegments.telegramId, telegramId))
      .limit(1);

    if (userSegment.length === 0) {
      return [];
    }

    const segment = userSegment[0].segment;
    const now = new Date();

    // Get active offers for this segment
    const offers = await db.select()
      .from(segmentTargetedOffers)
      .where(
        and(
          eq(segmentTargetedOffers.targetSegment, segment),
          eq(segmentTargetedOffers.isActive, true),
          lte(segmentTargetedOffers.validFrom, now),
          sql`(${segmentTargetedOffers.validUntil} IS NULL OR ${segmentTargetedOffers.validUntil} >= ${now})`
        )
      );

    return offers;
  } catch (error: any) {
    logger.error("Get targeted offers for user error:", error);
    throw error;
  }
}

/**
 * Get all targeted offers (admin)
 */
export async function getAllTargetedOffers(): Promise<any[]> {
  try {
    const offers = await db.select()
      .from(segmentTargetedOffers)
      .orderBy(desc(segmentTargetedOffers.createdAt));

    return offers;
  } catch (error: any) {
    logger.error("Get all targeted offers error:", error);
    throw error;
  }
}

/**
 * Send re-engagement message to at-risk users
 */
export async function sendReEngagementMessages(): Promise<void> {
  try {
    logger.info("📧 Sending re-engagement messages...");

    // Get at-risk users (7-14 days inactive)
    const atRiskUsers = await getUsersInSegment('at_risk');

    let sent = 0;

    for (const user of atRiskUsers) {
      try {
        // Check if we sent a message recently (don't spam)
        // For now, just send the message

        const offers = await getTargetedOffersForUser(user.telegramId);
        let offerText = '';

        if (offers.length > 0) {
          const offer = offers[0];
          const offerData = JSON.parse(offer.offerData);
          offerText = `\n\n🎁 *Special Offer:* ${offerData.description || 'Exclusive reward waiting for you!'}`;
        }

        const message = `👋 *We miss you!*\n\nIt's been a while since you've played Crypto Hacker Heist. Come back and see what's new!${offerText}\n\nYour progress is waiting for you. 💎`;

        await sendMessageToUser(user.telegramId, message);
        sent++;

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logger.error(`Failed to send re-engagement to ${user.telegramId}:`, error);
      }
    }

    logger.info(`✅ Sent ${sent} re-engagement messages`);
  } catch (error: any) {
    logger.error("Send re-engagement messages error:", error);
    throw error;
  }
}

/**
 * Send final message to churned users
 */
export async function sendChurnedMessages(): Promise<void> {
  try {
    logger.info("📧 Sending churned user messages...");

    // Get churned users (> 14 days inactive)
    const churnedUsers = await getUsersInSegment('churned');

    // Only send to users who were recently marked as churned (14-15 days)
    const recentlyChurned = churnedUsers.filter(u => u.daysSinceLastActive >= 14 && u.daysSinceLastActive <= 15);

    let sent = 0;

    for (const user of recentlyChurned) {
      try {
        const offers = await getTargetedOffersForUser(user.telegramId);
        let offerText = '';

        if (offers.length > 0) {
          const offer = offers[0];
          const offerData = JSON.parse(offer.offerData);
          offerText = `\n\n🎁 *Come Back Offer:* ${offerData.description || 'Big reward if you return!'}`;
        }

        const message = `😢 *Last Chance!*\n\nWe noticed you haven't played in a while. We'd love to have you back!${offerText}\n\nDon't lose your progress! Your mining empire is waiting. ⛏️`;

        await sendMessageToUser(user.telegramId, message);
        sent++;

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        logger.error(`Failed to send churned message to ${user.telegramId}:`, error);
      }
    }

    logger.info(`✅ Sent ${sent} churned user messages`);
  } catch (error: any) {
    logger.error("Send churned messages error:", error);
    throw error;
  }
}
