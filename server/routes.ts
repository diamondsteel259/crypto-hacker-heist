import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, db } from "./storage";
import { getBotWebhookHandler } from "./bot";

// Import route modules
import { registerAuthRoutes } from "./routes/auth.routes";
import { registerUserRoutes } from "./routes/user.routes";
import { registerAdminRoutes } from "./routes/admin.routes";
import { registerSocialRoutes } from "./routes/social.routes";
import { registerMiningRoutes } from "./routes/mining.routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health endpoint for Render
  app.get("/healthz", async (_req, res) => {
    res.status(200).json({ ok: true });
  });
  
  // Telegram bot webhook handler (for production)
  const botWebhook = getBotWebhookHandler();
  if (botWebhook) {
    app.post(botWebhook.path, botWebhook.handler);
  }

  // Register organized route modules
  registerAuthRoutes(app);
  registerUserRoutes(app);
  registerAdminRoutes(app);
  registerSocialRoutes(app);
  registerMiningRoutes(app);

  // TODO: Remaining routes to be extracted into modules
  // Equipment, Challenges, Achievements, Cosmetics, Power-ups, etc.
  // These will be moved to separate files in future refactoring

  return createServer(app);
}
