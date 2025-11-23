import { logger } from "../logger";
import { db } from "../storage";
import { announcements, userAnnouncements, users } from "@shared/schema";
import { eq, and, sql, isNull, lte } from "drizzle-orm";
import { sendMessageToUser } from "../bot";

/**
 * Send announcement to all users via Telegram
 * Batch sending with rate limiting (30 messages/second as per Telegram limits)
 */
export async function sendAnnouncementToAllUsers(announcementId: number): Promise<{
  totalSent: number;
  failedUsers: string[];
}> {
  try {
    // Get announcement
    const announcement = await db.select()
      .from(announcements)
      .where(eq(announcements.id, announcementId))
      .limit(1);

    if (!announcement[0]) {
      throw new Error("Announcement not found");
    }

    const ann = announcement[0];

    // Get target users based on audience
    let targetUsers: any[] = [];

    if (ann.targetAudience === 'all') {
      targetUsers = await db.select({
        telegramId: users.telegramId,
        username: users.username,
      }).from(users);
    } else {
      // For now, send to all users regardless of segment
      // TODO: Implement user segmentation filtering
      targetUsers = await db.select({
        telegramId: users.telegramId,
        username: users.username,
      }).from(users);
    }

    logger.info(`📣 Sending announcement "${ann.title}" to ${targetUsers.length} users...`);

    let sentCount = 0;
    const failedUsers: string[] = [];
    const BATCH_SIZE = 30; // Telegram allows 30 messages/second
    const BATCH_DELAY = 1000; // 1 second delay between batches

    // Send in batches
    for (let i = 0; i < targetUsers.length; i += BATCH_SIZE) {
      const batch = targetUsers.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (user) => {
          try {
            if (!user.telegramId) {
              logger.warn(`Skipping user with no telegramId: ${user.username}`);
              return;
            }
            const message = `📢 *${ann.title}*\n\n${ann.message}`;
            await sendMessageToUser(user.telegramId, message);
            sentCount++;
          } catch (error: any) {
            logger.error(`Failed to send announcement to user ${user.telegramId}:`, error.message);
            if (user.telegramId) {
              failedUsers.push(user.telegramId);
            }
          }
        })
      );

      // Wait before next batch to respect rate limits
      if (i + BATCH_SIZE < targetUsers.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    // Update announcement with send stats
    await db.update(announcements)
      .set({
        sentAt: new Date(),
        totalRecipients: sentCount,
      })
      .where(eq(announcements.id, announcementId));

    logger.info(`✅ Announcement sent to ${sentCount}/${targetUsers.length} users (${failedUsers.length} failed)`);

    return {
      totalSent: sentCount,
      failedUsers,
    };
  } catch (error: any) {
    logger.error("Send announcement error:", error);
    throw error;
  }
}

/**
 * Check for scheduled announcements that need to be sent
 * Run this via cron every minute
 */
export async function processScheduledAnnouncements(): Promise<void> {
  try {
    const now = new Date();

    // Find announcements scheduled for now or earlier that haven't been sent
    const pendingAnnouncements = await db.select()
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, true),
          isNull(announcements.sentAt),
          lte(announcements.scheduledFor, now)
        )
      );

    logger.info(`⏰ Found ${pendingAnnouncements.length} scheduled announcements to send`);

    for (const announcement of pendingAnnouncements) {
      try {
        await sendAnnouncementToAllUsers(announcement.id);
      } catch (error: any) {
        logger.error(`Failed to send scheduled announcement ${announcement.id}:`, error.message);
      }
    }
  } catch (error: any) {
    logger.error("Process scheduled announcements error:", error);
  }
}

/**
 * Get active announcements for a user (unread + not expired)
 */
export async function getActiveAnnouncementsForUser(telegramId: string): Promise<any[]> {
  try {
    const now = new Date();

    // Get all active, sent announcements that aren't expired
    const activeAnnouncements = await db.select()
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, true),
          sql`${announcements.sentAt} IS NOT NULL`,
          sql`(${announcements.expiresAt} IS NULL OR ${announcements.expiresAt} > ${now})`
        )
      )
      .orderBy(sql`${announcements.priority} DESC, ${announcements.createdAt} DESC`);

    // Filter out announcements user has already read
    const readAnnouncementIds = await db.select({
      announcementId: userAnnouncements.announcementId,
    })
      .from(userAnnouncements)
      .where(eq(userAnnouncements.telegramId, telegramId));

    const readIds = new Set(readAnnouncementIds.map(r => r.announcementId));
    const unreadAnnouncements = activeAnnouncements.filter(a => !readIds.has(a.id));

    return unreadAnnouncements;
  } catch (error: any) {
    logger.error("Get active announcements error:", error);
    throw error;
  }
}

/**
 * Mark announcement as read by user
 */
export async function markAnnouncementAsRead(announcementId: number, telegramId: string): Promise<void> {
  try {
    // Check if already read
    const existing = await db.select()
      .from(userAnnouncements)
      .where(
        and(
          eq(userAnnouncements.announcementId, announcementId),
          eq(userAnnouncements.telegramId, telegramId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return; // Already marked as read
    }

    // Insert read record
    await db.insert(userAnnouncements).values({
      announcementId,
      telegramId,
    });

    // Increment read count on announcement
    await db.update(announcements)
      .set({
        readCount: sql`${announcements.readCount} + 1`,
      })
      .where(eq(announcements.id, announcementId));
  } catch (error: any) {
    logger.error("Mark announcement as read error:", error);
    throw error;
  }
}

/**
 * Get all announcements (for admin dashboard)
 */
export async function getAllAnnouncements(limit: number = 50): Promise<any[]> {
  try {
    const allAnnouncements = await db.select()
      .from(announcements)
      .orderBy(sql`${announcements.createdAt} DESC`)
      .limit(limit);

    return allAnnouncements;
  } catch (error: any) {
    logger.error("Get all announcements error:", error);
    throw error;
  }
}
