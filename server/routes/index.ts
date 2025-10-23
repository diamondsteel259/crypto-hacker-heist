import type { Express } from "express";
import { registerHealthRoutes } from "./health.routes";
import { registerAuthRoutes } from "./auth.routes";
import { registerUserRoutes } from "./user.routes";
import { registerAdminRoutes } from "./admin.routes";
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

  // Admin panel (settings, users, mining, jackpots, equipment, flash sales, seasons)
  registerAdminRoutes(app);

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

  // MIGRATION STATUS:
  // ✅ COMPLETED:
  //   - admin.routes.ts (18 routes) - migrated in code review fix
  //   - user.routes.ts (4 routes) - was already registered
  //   - health.routes.ts, auth.routes.ts, social.routes.ts, mining.routes.ts
  //   - equipment.routes.ts, announcements.routes.ts, promoCodes.routes.ts
  //   - analytics.routes.ts, events.routes.ts, economy.routes.ts, segmentation.routes.ts
  //
  // 🔄 TODO: Migrate remaining routes from routes.ts
  //   - shop.routes.ts (~25 routes: flash sales, powerups, lootboxes, packs, price alerts)
  //   - achievements.routes.ts (~8 routes: achievements, challenges, tasks)
  //   - gamification.routes.ts (~20 routes: seasons, cosmetics, prestige, daily login, subscription)
  //   - leaderboard.routes.ts (~6 routes: hashrate, balance, referrals leaderboards)
  //
  // See server/routes.ts header for detailed migration plan
}
