import { processScheduledAnnouncements } from "./services/announcements";

/**
 * Cron job scheduler for background tasks
 * Runs periodic tasks like scheduled announcements, analytics generation, etc.
 */

let announcementInterval: NodeJS.Timeout | null = null;

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

  console.log("✅ Cron jobs started:");
  console.log("  - Scheduled announcements: Every 1 minute");

  // TODO: Add more cron jobs as features are implemented:
  // - Daily analytics generation (midnight UTC)
  // - Retention cohort updates (daily at 1am UTC)
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
