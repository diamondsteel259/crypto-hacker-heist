import { logger } from "../logger";
import { db } from "../storage";
import { scheduledEvents, eventParticipation, users, equipmentTypes, ownedEquipment, blocks } from "@shared/schema";
import { eq, and, sql, lte, gte, desc } from "drizzle-orm";
import { sendMessageToUser } from "../bot";

/**
 * Get all scheduled events (admin)
 */
export async function getAllEvents(): Promise<any[]> {
  try {
    const events = await db.select()
      .from(scheduledEvents)
      .orderBy(desc(scheduledEvents.startTime));

    return events;
  } catch (error: any) {
    logger.error("Get all events error:", error);
    throw error;
  }
}

/**
 * Get active events (user)
 */
export async function getActiveEvents(): Promise<any[]> {
  try {
    const now = new Date();

    const events = await db.select()
      .from(scheduledEvents)
      .where(
        and(
          eq(scheduledEvents.isActive, true),
          lte(scheduledEvents.startTime, now),
          gte(scheduledEvents.endTime, now)
        )
      )
      .orderBy(desc(scheduledEvents.priority));

    return events;
  } catch (error: any) {
    logger.error("Get active events error:", error);
    throw error;
  }
}

/**
 * Get upcoming events (user)
 */
export async function getUpcomingEvents(): Promise<any[]> {
  try {
    const now = new Date();

    const events = await db.select()
      .from(scheduledEvents)
      .where(
        and(
          eq(scheduledEvents.isActive, false),
          gte(scheduledEvents.startTime, now)
        )
      )
      .orderBy(scheduledEvents.startTime)
      .limit(10);

    return events;
  } catch (error: any) {
    logger.error("Get upcoming events error:", error);
    throw error;
  }
}

/**
 * Activate an event
 */
export async function activateEvent(eventId: number): Promise<void> {
  try {
    const event = await db.select()
      .from(scheduledEvents)
      .where(eq(scheduledEvents.id, eventId))
      .limit(1);

    if (event.length === 0) {
      throw new Error("Event not found");
    }

    const evt = event[0];

    // Mark event as active
    await db.update(scheduledEvents)
      .set({ isActive: true })
      .where(eq(scheduledEvents.id, eventId));

    // Send announcement to all users if not sent
    if (!evt.announcementSent) {
      await sendEventAnnouncement(evt, 'started');

      await db.update(scheduledEvents)
        .set({ announcementSent: true })
        .where(eq(scheduledEvents.id, eventId));
    }

    logger.info(`✅ Event activated: ${evt.name} (ID: ${eventId})`);
  } catch (error: any) {
    logger.error("Activate event error:", error);
    throw error;
  }
}

/**
 * Deactivate an event
 */
export async function deactivateEvent(eventId: number): Promise<void> {
  try {
    const event = await db.select()
      .from(scheduledEvents)
      .where(eq(scheduledEvents.id, eventId))
      .limit(1);

    if (event.length === 0) {
      throw new Error("Event not found");
    }

    const evt = event[0];

    // Mark event as inactive
    await db.update(scheduledEvents)
      .set({ isActive: false })
      .where(eq(scheduledEvents.id, eventId));

    // Handle event type-specific end logic
    const eventData = JSON.parse(evt.eventData);

    switch (evt.eventType) {
      case 'community_goal':
        await finalizeCommunityGoal(eventId, eventData);
        break;
      case 'tournament':
        await finalizeTournament(eventId, eventData);
        break;
      default:
        // No special end logic for multiplier, flash_sale, custom
        break;
    }

    // Send event ended announcement
    await sendEventAnnouncement(evt, 'ended');

    logger.info(`✅ Event deactivated: ${evt.name} (ID: ${eventId})`);
  } catch (error: any) {
    logger.error("Deactivate event error:", error);
    throw error;
  }
}

/**
 * Send announcement for event (started/ended)
 */
async function sendEventAnnouncement(event: any, status: 'started' | 'ended'): Promise<void> {
  try {
    // Get all users
    const allUsers = await db.select({ telegramId: users.telegramId })
      .from(users);

    const message = status === 'started'
      ? `🎉 *Event Started: ${event.name}*\n\n${event.description || 'A special event is now active!'}\n\nOpen the game to participate!`
      : `🏁 *Event Ended: ${event.name}*\n\nThank you for participating! Check your rewards.`;

    // Send in batches (30 messages/second rate limit)
    const BATCH_SIZE = 30;
    const BATCH_DELAY = 1000;

    for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
      const batch = allUsers.slice(i, i + BATCH_SIZE);

      await Promise.all(batch.map(async (user) => {
        if (user.telegramId) {
          try {
            await sendMessageToUser(user.telegramId, message);
          } catch (error) {
            // Skip failed sends
            logger.error(`Failed to send event announcement to ${user.telegramId}:`, error);
          }
        }
      }));

      // Delay between batches
      if (i + BATCH_SIZE < allUsers.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    logger.info(`✅ Event announcement sent to ${allUsers.length} users`);
  } catch (error: any) {
    logger.error("Send event announcement error:", error);
    // Don't throw - announcement failure shouldn't break event activation
  }
}

/**
 * Check for events that should start or end
 */
export async function processScheduledEvents(): Promise<void> {
  try {
    const now = new Date();

    // Find events that should start (not active, start time passed, end time not passed)
    const eventsToStart = await db.select()
      .from(scheduledEvents)
      .where(
        and(
          eq(scheduledEvents.isActive, false),
          lte(scheduledEvents.startTime, now),
          gte(scheduledEvents.endTime, now)
        )
      );

    for (const event of eventsToStart) {
      await activateEvent(event.id);
    }

    // Find events that should end (active, end time passed)
    const eventsToEnd = await db.select()
      .from(scheduledEvents)
      .where(
        and(
          eq(scheduledEvents.isActive, true),
          lte(scheduledEvents.endTime, now)
        )
      );

    for (const event of eventsToEnd) {
      await deactivateEvent(event.id);
    }

    if (eventsToStart.length > 0 || eventsToEnd.length > 0) {
      logger.info(`✅ Processed ${eventsToStart.length} event starts, ${eventsToEnd.length} event ends`);
    }
  } catch (error: any) {
    logger.error("Process scheduled events error:", error);
    throw error;
  }
}

/**
 * Record user participation in an event
 */
export async function recordEventParticipation(
  eventId: number,
  telegramId: string,
  contribution?: number
): Promise<void> {
  try {
    // Check if already participating
    const existing = await db.select()
      .from(eventParticipation)
      .where(
        and(
          eq(eventParticipation.eventId, eventId),
          eq(eventParticipation.telegramId, telegramId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update contribution if provided
      if (contribution !== undefined) {
        await db.update(eventParticipation)
          .set({
            contribution: sql`${eventParticipation.contribution} + ${contribution}`,
          })
          .where(eq(eventParticipation.id, existing[0].id));
      }
    } else {
      // Create new participation record
      await db.insert(eventParticipation).values({
        eventId,
        telegramId,
        contribution: contribution?.toString() || '0',
      });
    }
  } catch (error: any) {
    logger.error("Record event participation error:", error);
    throw error;
  }
}

/**
 * Update community goal progress
 */
export async function updateCommunityGoalProgress(
  eventId: number,
  telegramId: string,
  contribution: number
): Promise<void> {
  try {
    await recordEventParticipation(eventId, telegramId, contribution);
  } catch (error: any) {
    logger.error("Update community goal progress error:", error);
    throw error;
  }
}

/**
 * Finalize community goal event (distribute rewards)
 */
async function finalizeCommunityGoal(eventId: number, eventData: any): Promise<void> {
  try {
    // Get all participants
    const participants = await db.select()
      .from(eventParticipation)
      .where(eq(eventParticipation.eventId, eventId));

    // Calculate total contribution
    const totalContribution = participants.reduce((sum, p) => sum + parseFloat(p.contribution?.toString() || '0'), 0);

    // Check if goal reached
    const goalReached = totalContribution >= (eventData.targetCS || 0);

    if (goalReached && eventData.reward) {
      // Distribute reward to all participants
      for (const participant of participants) {
        try {
          // Apply reward based on reward type
          if (eventData.rewardType === 'cs') {
            await db.update(users)
              .set({ csBalance: sql`${users.csBalance} + ${eventData.rewardAmount || 0}` })
              .where(eq(users.telegramId, participant.telegramId));
          } else if (eventData.rewardType === 'equipment' && eventData.rewardId) {
            // Grant equipment to user
            const user = await db.select()
              .from(users)
              .where(eq(users.telegramId, participant.telegramId))
              .limit(1);

            if (user.length > 0) {
              const equipment = await db.select()
                .from(equipmentTypes)
                .where(eq(equipmentTypes.id, eventData.rewardId))
                .limit(1);

              if (equipment.length > 0) {
                const et = equipment[0];

                // Check if user already owns this equipment
                const existing = await db.select()
                  .from(ownedEquipment)
                  .where(
                    and(
                      eq(ownedEquipment.userId, user[0].id),
                      eq(ownedEquipment.equipmentTypeId, eventData.rewardId)
                    )
                  )
                  .limit(1);

                if (existing.length > 0) {
                  await db.update(ownedEquipment)
                    .set({
                      quantity: sql`${ownedEquipment.quantity} + 1`,
                      currentHashrate: sql`${ownedEquipment.currentHashrate} + ${et.baseHashrate}`,
                    })
                    .where(eq(ownedEquipment.id, existing[0].id));
                } else {
                  await db.insert(ownedEquipment).values({
                    userId: user[0].id,
                    equipmentTypeId: eventData.rewardId,
                    currentHashrate: et.baseHashrate,
                    quantity: 1,
                  });
                }

                // Update user total hashrate
                await db.update(users)
                  .set({ totalHashrate: sql`${users.totalHashrate} + ${et.baseHashrate}` })
                  .where(eq(users.id, user[0].id));
              }
            }
          }

          // Mark reward as claimed
          await db.update(eventParticipation)
            .set({ rewardClaimed: true })
            .where(
              and(
                eq(eventParticipation.eventId, eventId),
                eq(eventParticipation.telegramId, participant.telegramId)
              )
            );

          // Send reward notification
          const rewardMessage = `🎉 *Community Goal Completed!*\n\nYou've received your reward: ${eventData.reward}\n\nThank you for participating!`;
          await sendMessageToUser(participant.telegramId, rewardMessage);
        } catch (error) {
          logger.error(`Failed to distribute reward to ${participant.telegramId}:`, error);
        }
      }

      logger.info(`✅ Community goal rewards distributed to ${participants.length} participants`);
    } else {
      logger.info(`⚠️ Community goal not reached. Target: ${eventData.targetCS}, Actual: ${totalContribution}`);
    }
  } catch (error: any) {
    logger.error("Finalize community goal error:", error);
    throw error;
  }
}

/**
 * Finalize tournament event (calculate winners and distribute prizes)
 */
async function finalizeTournament(eventId: number, eventData: any): Promise<void> {
  try {
    const event = await db.select()
      .from(scheduledEvents)
      .where(eq(scheduledEvents.id, eventId))
      .limit(1);

    if (event.length === 0) return;

    const evt = event[0];

    // Get all participants sorted by contribution (represents score/metric)
    const participants = await db.select()
      .from(eventParticipation)
      .where(eq(eventParticipation.eventId, eventId))
      .orderBy(desc(eventParticipation.contribution));

    // Assign ranks
    for (let i = 0; i < participants.length; i++) {
      await db.update(eventParticipation)
        .set({ rank: i + 1 })
        .where(eq(eventParticipation.id, participants[i].id));
    }

    // Distribute prizes based on rank
    if (eventData.prizes && Array.isArray(eventData.prizes)) {
      for (const prize of eventData.prizes) {
        // prize format: {rank: 1, cs: 1000000} or {ranks: [2,3,4], cs: 500000}
        const targetRanks = prize.rank ? [prize.rank] : (prize.ranks || []);

        for (const rank of targetRanks) {
          const winner = participants.find((p, idx) => idx + 1 === rank);

          if (winner && prize.cs) {
            // Award CS
            await db.update(users)
              .set({ csBalance: sql`${users.csBalance} + ${prize.cs}` })
              .where(eq(users.telegramId, winner.telegramId));

            // Mark reward as claimed
            await db.update(eventParticipation)
              .set({ rewardClaimed: true })
              .where(eq(eventParticipation.id, winner.id));

            // Send winner notification
            const message = `🏆 *Tournament Completed!*\n\nYou ranked #${rank} in "${evt.name}"!\n\nYour prize: ${prize.cs.toLocaleString()} CS\n\nCongratulations!`;
            await sendMessageToUser(winner.telegramId, message);
          }
        }
      }

      logger.info(`✅ Tournament prizes distributed to top ${eventData.prizes.length} winners`);
    }
  } catch (error: any) {
    logger.error("Finalize tournament error:", error);
    throw error;
  }
}

/**
 * Get event participation for a specific event (admin)
 */
export async function getEventParticipation(eventId: number): Promise<any[]> {
  try {
    const participation = await db.select({
      id: eventParticipation.id,
      telegramId: eventParticipation.telegramId,
      username: users.username,
      contribution: eventParticipation.contribution,
      rank: eventParticipation.rank,
      rewardClaimed: eventParticipation.rewardClaimed,
      participatedAt: eventParticipation.participatedAt,
    })
      .from(eventParticipation)
      .leftJoin(users, eq(users.telegramId, eventParticipation.telegramId))
      .where(eq(eventParticipation.eventId, eventId))
      .orderBy(desc(eventParticipation.contribution));

    return participation;
  } catch (error: any) {
    logger.error("Get event participation error:", error);
    throw error;
  }
}

/**
 * Check if multiplier event is active (used in mining service)
 */
export async function getActiveMultiplier(): Promise<number> {
  try {
    const activeEvents = await getActiveEvents();

    for (const event of activeEvents) {
      if (event.eventType === 'multiplier') {
        const eventData = JSON.parse(event.eventData);
        if (eventData.multiplier && eventData.affectsCS) {
          return eventData.multiplier;
        }
      }
    }

    return 1; // No multiplier active
  } catch (error: any) {
    logger.error("Get active multiplier error:", error);
    return 1;
  }
}

/**
 * Get active flash sales (used in equipment pricing)
 */
export async function getActiveFlashSales(): Promise<any[]> {
  try {
    const activeEvents = await getActiveEvents();
    const flashSales = [];

    for (const event of activeEvents) {
      if (event.eventType === 'flash_sale') {
        const eventData = JSON.parse(event.eventData);
        flashSales.push({
          eventId: event.id,
          equipmentIds: eventData.equipmentIds || [],
          category: eventData.category || null,
          discountPercent: eventData.discountPercent || 0,
        });
      }
    }

    return flashSales;
  } catch (error: any) {
    logger.error("Get active flash sales error:", error);
    return [];
  }
}
