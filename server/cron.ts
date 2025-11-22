import { processScheduledAnnouncements } from "./services/announcements";
import { generateDailyReport, updateRetentionCohorts } from "./services/analytics";
import { processScheduledEvents } from "./services/events";
import { calculateDailyEconomyMetrics, calculateEconomySinks } from "./services/economy";
import { refreshAllSegments, sendReEngagementMessages } from "./services/segmentation";
import { logger } from "./logger";

/**
 * Cron job scheduler for background tasks
 * Runs periodic tasks like scheduled announcements, analytics generation, etc.
 */

let announcementInterval: NodeJS.Timeout | null = null;
let dailyAnalyticsInterval: NodeJS.Timeout | null = null;
let retentionCohortsInterval: NodeJS.Timeout | null = null;
let hourlyDauInterval: NodeJS.Timeout | null = null;
let eventSchedulerInterval: NodeJS.Timeout | null = null;
let economyMetricsInterval: NodeJS.Timeout | null = null;
let economySinksInterval: NodeJS.Timeout | null = null;
let segmentRefreshInterval: NodeJS.Timeout | null = null;
let reEngagementInterval: NodeJS.Timeout | null = null;

/**
 * Start all cron jobs
 */
export function startCronJobs(): void {
  logger.info("Starting cron jobs");

  // Check for scheduled announcements every minute
  announcementInterval = setInterval(async () => {
    try {
      await processScheduledAnnouncements();
    } catch (error) {
      logger.error("Announcement cron error", error);
    }
  }, 60 * 1000); // Every 1 minute

  // Check for scheduled events every minute
  eventSchedulerInterval = setInterval(async () => {
    try {
      await processScheduledEvents();
    } catch (error) {
      logger.error("Event scheduler cron error", error);
    }
  }, 60 * 1000); // Every 1 minute

  // Generate daily analytics report at midnight UTC (check every hour)
  dailyAnalyticsInterval = setInterval(async () => {
    try {
      const now = new Date();
      
      // Check if it's midnight UTC (hour 0)
      if (now.getUTCHours() === 0 && now.getUTCMinutes() < 60) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        logger.info("Generating daily analytics report", { date: yesterday.toISOString().split('T')[0] });
        await generateDailyReport(yesterday);
        logger.info("Daily analytics report generated");
      }
    } catch (error) {
      logger.error("Daily analytics cron error", error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  // Update retention cohorts daily at 1am UTC (check every hour)
  retentionCohortsInterval = setInterval(async () => {
    try {
      const now = new Date();
      
      // Check if it's 1am UTC
      if (now.getUTCHours() === 1 && now.getUTCMinutes() < 60) {
        logger.info("Updating retention cohorts");
        await updateRetentionCohorts();
        logger.info("Retention cohorts updated");
      }
    } catch (error) {
      logger.error("Retention cohorts cron error", error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  // Calculate economy metrics daily at 2am UTC (check every hour)
  economyMetricsInterval = setInterval(async () => {
    try {
      const now = new Date();
      
      // Check if it's 2am UTC
      if (now.getUTCHours() === 2 && now.getUTCMinutes() < 60) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        logger.info("Calculating economy metrics", { date: yesterday.toISOString().split('T')[0] });
        await calculateDailyEconomyMetrics(yesterday);
        logger.info("Economy metrics calculated");
      }
    } catch (error) {
      logger.error("Economy metrics cron error", error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  // Calculate economy sinks daily at 2:30am UTC (check every hour)
  economySinksInterval = setInterval(async () => {
    try {
      const now = new Date();
      
      // Check if it's 2:30am UTC (hour 2, minute >= 30)
      if (now.getUTCHours() === 2 && now.getUTCMinutes() >= 30 && now.getUTCMinutes() < 90) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        logger.info("Calculating economy sinks", { date: yesterday.toISOString().split('T')[0] });
        await calculateEconomySinks(yesterday);
        logger.info("Economy sinks calculated");
      }
    } catch (error) {
      logger.error("Economy sinks cron error", error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  // Refresh user segments daily at 4am UTC (check every hour)
  segmentRefreshInterval = setInterval(async () => {
    try {
      const now = new Date();
      
      // Check if it's 4am UTC
      if (now.getUTCHours() === 4 && now.getUTCMinutes() < 60) {
        logger.info("Refreshing user segments");
        await refreshAllSegments();
        logger.info("User segments refreshed");
      }
    } catch (error) {
      logger.error("Segment refresh cron error", error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  // Send re-engagement messages daily at 5am UTC (check every hour)
  reEngagementInterval = setInterval(async () => {
    try {
      const now = new Date();
      
      // Check if it's 5am UTC
      if (now.getUTCHours() === 5 && now.getUTCMinutes() < 60) {
        logger.info("Sending re-engagement messages");
        await sendReEngagementMessages();
        logger.info("Re-engagement messages sent");
      }
    } catch (error) {
      logger.error("Re-engagement cron error", error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  // Update current day's DAU every hour for live dashboard
  hourlyDauInterval = setInterval(async () => {
    try {
      const today = new Date();
      logger.info("Updating today's analytics");
      await generateDailyReport(today);
      logger.info("Today's analytics updated");
    } catch (error) {
      logger.error("Hourly DAU cron error", error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  logger.info("Cron jobs started", {
    jobs: [
      "Scheduled announcements: Every 1 minute",
      "Event scheduler: Every 1 minute",
      "Daily analytics report: Daily at midnight UTC",
      "Retention cohorts: Daily at 1am UTC",
      "Economy metrics: Daily at 2am UTC",
      "Economy sinks: Daily at 2:30am UTC",
      "User segment refresh: Daily at 4am UTC",
      "Re-engagement messages: Daily at 5am UTC",
      "Hourly DAU update: Every hour"
    ]
  });
}

/**
 * Stop all cron jobs (for graceful shutdown)
 */
export function stopCronJobs(): void {
  logger.info("Stopping cron jobs");

  if (announcementInterval) {
    clearInterval(announcementInterval);
    announcementInterval = null;
  }

  if (eventSchedulerInterval) {
    clearInterval(eventSchedulerInterval);
    eventSchedulerInterval = null;
  }

  if (dailyAnalyticsInterval) {
    clearInterval(dailyAnalyticsInterval);
    dailyAnalyticsInterval = null;
  }

  if (retentionCohortsInterval) {
    clearInterval(retentionCohortsInterval);
    retentionCohortsInterval = null;
  }

  if (economyMetricsInterval) {
    clearInterval(economyMetricsInterval);
    economyMetricsInterval = null;
  }

  if (economySinksInterval) {
    clearInterval(economySinksInterval);
    economySinksInterval = null;
  }

  if (segmentRefreshInterval) {
    clearInterval(segmentRefreshInterval);
    segmentRefreshInterval = null;
  }

  if (reEngagementInterval) {
    clearInterval(reEngagementInterval);
    reEngagementInterval = null;
  }

  if (hourlyDauInterval) {
    clearInterval(hourlyDauInterval);
    hourlyDauInterval = null;
  }

  logger.info("Cron jobs stopped");
}

/**
 * Graceful shutdown handlers
 */
process.once('SIGINT', () => {
  stopCronJobs();
});

process.once('SIGTERM', () => {
  stopCronJobs();
});
