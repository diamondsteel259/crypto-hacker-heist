import { processScheduledAnnouncements } from "./services/announcements";
import { generateDailyReport, updateRetentionCohorts } from "./services/analytics";
import { processScheduledEvents } from "./services/events";
import { calculateDailyEconomyMetrics, calculateEconomySinks } from "./services/economy";
import { refreshAllSegments, sendReEngagementMessages } from "./services/segmentation";

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
  console.log("⏰ Starting cron jobs...");

  // Check for scheduled announcements every minute
  announcementInterval = setInterval(async () => {
    try {
      await processScheduledAnnouncements();
    } catch (error) {
      console.error("Announcement cron error:", error);
    }
  }, 60 * 1000); // Every 1 minute

  // Check for scheduled events every minute
  eventSchedulerInterval = setInterval(async () => {
    try {
      await processScheduledEvents();
    } catch (error) {
      console.error("Event scheduler cron error:", error);
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
        
        console.log(`📊 Generating daily analytics report for ${yesterday.toISOString().split('T')[0]}...`);
        await generateDailyReport(yesterday);
        console.log("✅ Daily analytics report generated");
      }
    } catch (error) {
      console.error("Daily analytics cron error:", error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  // Update retention cohorts daily at 1am UTC (check every hour)
  retentionCohortsInterval = setInterval(async () => {
    try {
      const now = new Date();
      
      // Check if it's 1am UTC
      if (now.getUTCHours() === 1 && now.getUTCMinutes() < 60) {
        console.log("📊 Updating retention cohorts...");
        await updateRetentionCohorts();
        console.log("✅ Retention cohorts updated");
      }
    } catch (error) {
      console.error("Retention cohorts cron error:", error);
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
        
        console.log(`💰 Calculating economy metrics for ${yesterday.toISOString().split('T')[0]}...`);
        await calculateDailyEconomyMetrics(yesterday);
        console.log("✅ Economy metrics calculated");
      }
    } catch (error) {
      console.error("Economy metrics cron error:", error);
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
        
        console.log(`💰 Calculating economy sinks for ${yesterday.toISOString().split('T')[0]}...`);
        await calculateEconomySinks(yesterday);
        console.log("✅ Economy sinks calculated");
      }
    } catch (error) {
      console.error("Economy sinks cron error:", error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  // Refresh user segments daily at 4am UTC (check every hour)
  segmentRefreshInterval = setInterval(async () => {
    try {
      const now = new Date();
      
      // Check if it's 4am UTC
      if (now.getUTCHours() === 4 && now.getUTCMinutes() < 60) {
        console.log("👥 Refreshing user segments...");
        await refreshAllSegments();
        console.log("✅ User segments refreshed");
      }
    } catch (error) {
      console.error("Segment refresh cron error:", error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  // Send re-engagement messages daily at 5am UTC (check every hour)
  reEngagementInterval = setInterval(async () => {
    try {
      const now = new Date();
      
      // Check if it's 5am UTC
      if (now.getUTCHours() === 5 && now.getUTCMinutes() < 60) {
        console.log("📧 Sending re-engagement messages...");
        await sendReEngagementMessages();
        console.log("✅ Re-engagement messages sent");
      }
    } catch (error) {
      console.error("Re-engagement cron error:", error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  // Update current day's DAU every hour for live dashboard
  hourlyDauInterval = setInterval(async () => {
    try {
      const today = new Date();
      console.log("📊 Updating today's analytics...");
      await generateDailyReport(today);
      console.log("✅ Today's analytics updated");
    } catch (error) {
      console.error("Hourly DAU cron error:", error);
    }
  }, 60 * 60 * 1000); // Every 1 hour

  console.log("✅ Cron jobs started:");
  console.log("  - Scheduled announcements: Every 1 minute");
  console.log("  - Event scheduler: Every 1 minute");
  console.log("  - Daily analytics report: Daily at midnight UTC");
  console.log("  - Retention cohorts: Daily at 1am UTC");
  console.log("  - Economy metrics: Daily at 2am UTC");
  console.log("  - Economy sinks: Daily at 2:30am UTC");
  console.log("  - User segment refresh: Daily at 4am UTC");
  console.log("  - Re-engagement messages: Daily at 5am UTC");
  console.log("  - Hourly DAU update: Every hour");
}

/**
 * Stop all cron jobs (for graceful shutdown)
 */
export function stopCronJobs(): void {
  console.log("⏰ Stopping cron jobs...");

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

  console.log("✅ Cron jobs stopped");
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
