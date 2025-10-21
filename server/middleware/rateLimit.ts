import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

function createRateLimiter(windowMs: number, max: number, message: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Use IP address as key (or could use user ID if authenticated)
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    if (!store[key] || store[key].resetTime < now) {
      // Reset window
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return next();
    }

    if (store[key].count >= max) {
      return res.status(429).json({
        error: message,
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000),
      });
    }

    store[key].count++;
    next();
  };
}

// General API rate limit - 100 requests per minute
export const apiLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100,
  'Too many requests, please try again later'
);

// Strict limit for claim/purchase endpoints - 10 per minute
export const claimLimiter = createRateLimiter(
  60 * 1000,
  10,
  'Too many claim attempts, slow down'
);

// Admin endpoints limit - 20 per minute
export const adminLimiter = createRateLimiter(
  60 * 1000,
  20,
  'Admin rate limit exceeded'
);
