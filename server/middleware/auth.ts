import { Request, Response, NextFunction } from 'express';
import { validateTelegramWebAppData } from '../telegram-auth';
import type { User } from '@shared/schema';
import { 
  createUnauthorizedError, 
  createForbiddenError, 
  createNotFoundError,
  ApiErrorCode,
  ApiError
} from '../errors/apiErrors';

export interface AuthRequest extends Request {
  telegramUser?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  };
  user?: User;
}

export function validateTelegramAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    // Test environment bypass
    if (process.env.NODE_ENV === 'test' && req.headers['x-test-user-id']) {
      const testUserId = req.headers['x-test-user-id'] as string;
      // Don't parseInt - test users have string IDs
      req.telegramUser = {
        id: testUserId as any, // Cast to any to accept string IDs in tests
        first_name: 'Test',
        username: 'testuser',
      };
      return next();
    }

    const initData = req.headers['x-telegram-init-data'] as string;
    const botToken = process.env.BOT_TOKEN;

    if (!botToken) {
      throw new ApiError(
        ApiErrorCode.SERVICE_UNAVAILABLE,
        'Server configuration error',
        500
      );
    }

    if (!initData) {
      throw createUnauthorizedError('Telegram authentication required');
    }

    const telegramUser = validateTelegramWebAppData(initData, botToken);
    
    if (!telegramUser) {
      throw new ApiError(
        ApiErrorCode.INVALID_TELEGRAM_AUTH,
        'Invalid Telegram authentication',
        401
      );
    }

    req.telegramUser = {
      id: telegramUser.id,
      first_name: telegramUser.first_name,
      last_name: telegramUser.last_name,
      username: telegramUser.username,
      photo_url: telegramUser.photo_url,
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function optionalTelegramAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const initData = req.headers['x-telegram-init-data'] as string;
  const botToken = process.env.BOT_TOKEN;

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

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.telegramUser) {
      throw createUnauthorizedError('Authentication required');
    }

    const { storage } = await import('../storage');
    const user = await storage.getUserByTelegramId(String(req.telegramUser.id));
    
    // Auto-promote admin if ID is whitelisted via env
    const whitelist = process.env.ADMIN_WHITELIST || '';
    const isWhitelisted = whitelist.split(',').map(s => s.trim()).filter(Boolean).includes(String(req.telegramUser.id));
    if (user && isWhitelisted && !user.isAdmin) {
      await storage.setUserAdmin(user.id, true);
      user.isAdmin = true;
    }

    if (!user || !user.isAdmin) {
      throw new ApiError(
        ApiErrorCode.ADMIN_REQUIRED,
        'Admin access required',
        403
      );
    }

    // Attach user to request for use in admin routes
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
}

export async function verifyUserAccess(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.telegramUser) {
      throw createUnauthorizedError('Authentication required');
    }

    const { storage } = await import('../storage');
    const user = await storage.getUserByTelegramId(String(req.telegramUser.id));

    if (!user) {
      throw createNotFoundError('User not found');
    }

    const requestedUserId = req.params.userId;
    if (requestedUserId && requestedUserId !== user.id) {
      throw new ApiError(
        ApiErrorCode.ACCESS_DENIED,
        'Access denied - can only access your own data',
        403
      );
    }

    req.params.userId = user.id;
    next();
  } catch (error) {
    next(error);
  }
}
