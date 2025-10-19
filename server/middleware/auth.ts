import { Request, Response, NextFunction } from 'express';
import { validateTelegramWebAppData } from '../telegram-auth';

export interface AuthRequest extends Request {
  telegramUser?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  };
}

export function validateTelegramAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const initData = req.headers['x-telegram-init-data'] as string;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!initData) {
    return res.status(401).json({ error: 'Telegram authentication required' });
  }

  const telegramUser = validateTelegramWebAppData(initData, botToken);
  
  if (!telegramUser) {
    return res.status(401).json({ error: 'Invalid Telegram authentication' });
  }

  req.telegramUser = {
    id: telegramUser.id,
    first_name: telegramUser.first_name,
    last_name: telegramUser.last_name,
    username: telegramUser.username,
    photo_url: telegramUser.photo_url,
  };

  next();
}

export function optionalTelegramAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const initData = req.headers['x-telegram-init-data'] as string;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (initData && botToken) {
    const telegramUser = validateTelegramWebAppData(initData, botToken);
    if (telegramUser) {
      req.telegramUser = {
        id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
      };
    }
  }

  next();
}

// Admin whitelist from environment variable
function isWhitelistedAdmin(telegramId: string): boolean {
  const whitelist = process.env.ADMIN_WHITELIST || '';
  const whitelistedIds = whitelist.split(',').map(id => id.trim()).filter(Boolean);
  return whitelistedIds.includes(telegramId);
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.telegramUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const telegramId = String(req.telegramUser.id);
  const { storage } = await import('../storage');
  let user = await storage.getUserByTelegramId(telegramId);

  // Check if whitelisted
  const isWhitelisted = isWhitelistedAdmin(telegramId);
  
  // Auto-create user if whitelisted but doesn't exist yet
  if (isWhitelisted && !user) {
    const newUser = {
      telegramId,
      firstName: req.telegramUser.first_name || 'Admin',
      lastName: req.telegramUser.last_name,
      username: req.telegramUser.username || req.telegramUser.first_name || `admin_${telegramId}`,
      photoUrl: req.telegramUser.photo_url,
      isAdmin: true
    };
    user = await storage.createUser(newUser);
  }
  
  // Auto-grant admin in database if whitelisted but not admin in DB yet
  if (isWhitelisted && user && !user.isAdmin) {
    await storage.setUserAdmin(user.id, true);
    user.isAdmin = true;
  }

  const isDbAdmin = user && user.isAdmin;

  if (!isWhitelisted && !isDbAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}

export async function isUserAdmin(telegramId: string): Promise<boolean> {
  const { storage } = await import('../storage');
  const user = await storage.getUserByTelegramId(telegramId);
  return isWhitelistedAdmin(telegramId) || (user?.isAdmin || false);
}

export async function verifyUserAccess(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.telegramUser) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const telegramId = String(req.telegramUser.id);
  const { storage } = await import('../storage');
  let user = await storage.getUserByTelegramId(telegramId);

  // Auto-create user if whitelisted admin but doesn't exist yet
  if (!user && isWhitelistedAdmin(telegramId)) {
    const newUser = {
      telegramId,
      firstName: req.telegramUser.first_name || 'Admin',
      lastName: req.telegramUser.last_name,
      username: req.telegramUser.username || req.telegramUser.first_name || `admin_${telegramId}`,
      photoUrl: req.telegramUser.photo_url,
      isAdmin: true
    };
    user = await storage.createUser(newUser);
  }

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const requestedUserId = req.params.userId;
  if (requestedUserId && requestedUserId !== user.id) {
    return res.status(403).json({ error: 'Access denied - can only access your own data' });
  }

  req.params.userId = user.id;
  next();
}
