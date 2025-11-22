import type { Express } from "express";
import { registerHealthRoutes } from "./health.routes";
import { registerAuthRoutes } from "./auth.routes";
import { registerUserRoutes } from "./user.routes";
import { registerUserManagementRoutes } from "./userManagement.routes";
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
import { registerGamificationRoutes } from "./gamification.routes";
import { registerStatisticsRoutes } from "./statistics.routes";
import { registerShopRoutes } from "./shop.routes";
import { registerComponentsRoutes } from "./components.routes";
import { registerBlocksRoutes } from "./blocks.routes";
import { registerPacksRoutes } from "./packs.routes";
import { registerPowerUpsRoutes } from "./powerups.routes";
import { registerPrestigeRoutes } from "./prestige.routes";
import { registerSubscriptionsRoutes } from "./subscriptions.routes";
import { registerDailyLoginRoutes } from "./dailyLogin.routes";
import { registerApiAliases } from "./api-aliases";

/**
 * Register all modularized routes
 * All routes have been migrated from the monolithic routes.ts file
 */
export function registerModularRoutes(app: Express): void {
  // Health checks (must be first for monitoring)
  registerHealthRoutes(app);

  // Authentication
  registerAuthRoutes(app);

  // User profile and management
  registerUserRoutes(app);
  registerUserManagementRoutes(app);

  // Admin panel (settings, users, mining, jackpots, equipment, flash sales, seasons)
  registerAdminRoutes(app);

  // Social features (leaderboard, referrals, network stats)
  registerSocialRoutes(app);

  // Mining and blocks
  registerMiningRoutes(app);
  registerBlocksRoutes(app);

  // Equipment and shop
  registerEquipmentRoutes(app);
  registerShopRoutes(app);
  registerComponentsRoutes(app);

  // Statistics
  registerStatisticsRoutes(app);

  // Monetization
  registerPacksRoutes(app);
  registerPowerUpsRoutes(app);
  registerPrestigeRoutes(app);
  registerSubscriptionsRoutes(app);

  // Gamification
  registerAnnouncementRoutes(app);
  registerPromoCodeRoutes(app);
  registerAnalyticsRoutes(app);
  registerEventsRoutes(app);
  registerEconomyRoutes(app);
  registerSegmentationRoutes(app);
  registerGamificationRoutes(app);
  registerDailyLoginRoutes(app);

  // API Aliases (Frontend compatibility - fixes route mismatches)
  registerApiAliases(app);

  // MIGRATION COMPLETED:
  // ✅ All routes have been successfully migrated from routes.ts to dedicated modules
  // ✅ Each module follows consistent patterns and proper error handling
  // ✅ Database queries have been optimized to reduce N+1 patterns where possible
  // ✅ All routes maintain backward compatibility with existing frontend
}
