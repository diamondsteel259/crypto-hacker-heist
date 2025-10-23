import type { Express } from "express";
import { registerHealthRoutes } from "./health.routes";
import { registerAuthRoutes } from "./auth.routes";
import { registerUserRoutes } from "./user.routes";
import { registerSocialRoutes } from "./social.routes";
import { registerMiningRoutes } from "./mining.routes";
import { registerEquipmentRoutes } from "./equipment.routes";
import { registerAnnouncementRoutes } from "./announcements.routes";
import { registerPromoCodeRoutes } from "./promoCodes.routes";
import { registerAnalyticsRoutes } from "./analytics.routes";
import { registerEventsRoutes } from "./events.routes";
import { registerEconomyRoutes } from "./economy.routes";
import { registerSegmentationRoutes } from "./segmentation.routes";

/**
 * Register all modularized routes
 * Note: Additional routes (shop, achievements, gamification, admin) are still in main routes.ts
 * and will be gradually migrated to separate modules
 */
export function registerModularRoutes(app: Express): void {
  // Health checks (must be first for monitoring)
  registerHealthRoutes(app);

  // Authentication
  registerAuthRoutes(app);

  // User profile and management
  registerUserRoutes(app);

  // Social features (leaderboard, referrals, network stats)
  registerSocialRoutes(app);

  // Mining and blocks
  registerMiningRoutes(app);

  // Equipment (already modularized)
  registerEquipmentRoutes(app);

  // Announcements (NEW - broadcast system)
  registerAnnouncementRoutes(app);

  // Promo Codes (NEW - marketing codes with rewards)
  registerPromoCodeRoutes(app);

  // Analytics (NEW - DAU/MAU tracking, retention, revenue metrics)
  registerAnalyticsRoutes(app);

  // Events (NEW - automated limited-time events)
  registerEventsRoutes(app);

  // Economy (NEW - CS inflation monitoring, wealth distribution, alerts)
  registerEconomyRoutes(app);

  // Segmentation (NEW - user classification, targeted offers)
  registerSegmentationRoutes(app);

  // TODO: Migrate remaining routes from routes.ts
  // - shop.routes.ts (flash sales, powerups, lootboxes, packs, price alerts)
  // - achievements.routes.ts (achievements, challenges, tasks)
  // - gamification.routes.ts (seasons, cosmetics, prestige, daily login, subscription)
  // Admin routes already in admin.routes.ts but called separately
}
