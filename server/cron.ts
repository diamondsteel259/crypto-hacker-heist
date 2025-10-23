import { processScheduledAnnouncements } from "./services/announcements";
import { generateDailyReport, updateRetentionCohorts } from "./services/analytics";

/**
 * Cron job scheduler for background tasks
 * Runs periodic tasks like scheduled announcements, analytics generation, etc.
 */

let announcementInterval: NodeJS.Timeout | null = null;
let dailyAnalyticsInterval: NodeJS.Timeout | null = null;
let retentionCohortsInterval: NodeJS.Timeout | null = null;
let hourlyDauInterval: NodeJS.Timeout | null = null;

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
  console.log("  - Daily analytics report: Daily at midnight UTC");
  console.log("  - Retention cohorts: Daily at 1am UTC");
  console.log("  - Hourly DAU update: Every hour");

  // TODO: Add more cron jobs as features are implemented:
  // - Economy metrics calculation (daily at 2am UTC)
  // - User segmentation refresh (daily at 4am UTC)
  // - Event scheduler checks (every minute)
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

  if (dailyAnalyticsInterval) {
    clearInterval(dailyAnalyticsInterval);
    dailyAnalyticsInterval = null;
  }

  if (retentionCohortsInterval) {
    clearInterval(retentionCohortsInterval);
    retentionCohortsInterval = null;
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
