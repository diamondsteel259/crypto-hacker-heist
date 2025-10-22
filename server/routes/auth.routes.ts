import type { Express } from "express";
import { storage } from "../storage";
import { validateTelegramAuth, type AuthRequest } from "../middleware/auth";

export function registerAuthRoutes(app: Express): void {
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
}
