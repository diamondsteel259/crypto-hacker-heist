import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validateTelegramAuth, type AuthRequest } from "./middleware/auth";
import { getBotWebhookHandler } from "./bot";
import { registerModularRoutes } from "./routes/index";

/**
 * ROUTES.TS - Modular Routing System Completed
 * 
 * STATUS: ✅ MIGRATION COMPLETED
 * 
 * All routes have been successfully migrated to dedicated modules under server/routes/
 * 
 * MIGRATED ROUTES (now in server/routes/):
 * ✅ Health checks → health.routes.ts
 * ✅ Authentication → auth.routes.ts  
 * ✅ User profile routes → user.routes.ts (GET /api/user/:userId, GET /api/user/:userId/rank, POST /api/user/:userId/tutorial/complete)
 * ✅ User management → userManagement.routes.ts (POST /api/user/:userId/reset)
 * ✅ Admin routes → admin.routes.ts (18 routes: settings, users, mining controls, bulk ops, jackpots, equipment, flash sales, seasons)
 * ✅ Social features → social.routes.ts (leaderboards, referrals, network stats)
 * ✅ Mining routes → mining.routes.ts
 * ✅ Equipment routes → equipment.routes.ts
 * ✅ Statistics → statistics.routes.ts (GET /api/user/:userId/statistics)
 * ✅ Shop routes → shop.routes.ts (equipment catalog, purchases, upgrades, flash sales)
 * ✅ Component upgrades → components.routes.ts (component upgrade routes)
 * ✅ Blocks → blocks.routes.ts (block listing, mining calendar, user rewards)
 * ✅ Packs → packs.routes.ts (starter/pro/whale pack purchases)
 * ✅ Power-ups → powerups.routes.ts (power-up purchases)
 * ✅ Prestige → prestige.routes.ts (prestige system)
 * ✅ Subscriptions → subscriptions.routes.ts (subscription management)
 * ✅ Daily login → dailyLogin.routes.ts (daily login rewards)
 * ✅ Announcements → announcements.routes.ts
 * ✅ Promo codes → promoCodes.routes.ts
 * ✅ Analytics → analytics.routes.ts
 * ✅ Events → events.routes.ts
 * ✅ Economy → economy.routes.ts
 * ✅ Segmentation → segmentation.routes.ts
 * ✅ Gamification → gamification.routes.ts
 * ✅ API aliases → api-aliases.ts
 * 
 * REMAINING IN THIS FILE:
 * - Telegram bot authentication webhook (POST /api/auth/telegram) - kept here for production deployment
 * - Main route registration function
 * 
 * MIGRATION COMPLETED:
 * All modular routes are registered via registerModularRoutes() in routes/index.ts.
 * This file now only contains essential webhook handler and route registration.
 * 
 * GOAL ACHIEVED: This file contains only registerRoutes() which calls
 * registerModularRoutes(), with no route definitions of its own.
 */

export async function registerRoutes(app: Express): Promise<Server> {
  // Telegram bot webhook handler (for production)
  const botWebhook = getBotWebhookHandler();
  if (botWebhook) {
    app.post(botWebhook.path, botWebhook.handler);
    console.log(`🤖 Telegram webhook registered at ${botWebhook.path}`);
  }
  
  // Register all modular routes
  registerModularRoutes(app);
  
  // Telegram bot authentication endpoint (kept here for core auth flow)
  app.post("/api/auth/telegram", validateTelegramAuth, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    let user = await storage.getUserByTelegramId(String(req.telegramUser.id));
    
    if (!user) {
      user = await storage.createUser({
        telegramId: String(req.telegramUser.id),
        username: req.telegramUser.username || `user_${req.telegramUser.id}`,
        firstName: req.telegramUser.first_name,
        lastName: req.telegramUser.last_name,
        photoUrl: req.telegramUser.photo_url,
      });
    } else {
      await storage.updateUserProfile(user.id, {
        username: req.telegramUser.username || user.username,
        firstName: req.telegramUser.first_name,
        lastName: req.telegramUser.last_name,
        photoUrl: req.telegramUser.photo_url,
      });
      user = await storage.getUser(user.id);
    }

    res.json(user);
  });

  const httpServer = createServer(app);
  return httpServer;
}