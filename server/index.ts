// Crypto Hacker Heist - v1.0.1 (Deployment trigger)
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { miningService } from "./mining";
import { seedDatabase } from "./seedDatabase";
import { seedGameContent } from "./seedGameContent";
import { seedFeatureFlags } from "./seedFeatureFlags";
import { initializeBot } from "./bot";
import { applyPerformanceIndexes } from "./applyIndexes";
import { initializeDatabase, checkDatabaseHealth } from "./db";
import { startCronJobs } from "./cron";
import rateLimit from "express-rate-limit";
import { logger, setRequestId, withRequestId } from "./logger";
import { v4 as uuidv4 } from "uuid";

const app = express();
// Trust proxy for Render deployment (needed for rate limiting to work correctly)
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rate limiting - prevent API abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per 15 minutes per IP
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Don't rate limit health checks or static assets
    return req.path === '/healthz' || req.path === '/api/health' || !req.path.startsWith('/api/');
  }
});

// Stricter rate limit for expensive operations
const strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 requests per 5 minutes
  message: { error: 'Too many purchase attempts, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/user/:userId/equipment/purchase', strictLimiter);
app.use('/api/user/:userId/powerups/purchase', strictLimiter);
app.use('/api/user/:userId/packs/purchase', strictLimiter);

// Request ID middleware - add correlation ID to every request
app.use((req, res, next) => {
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  setRequestId(requestId);
  (req as any).id = requestId;
  
  // Add request ID to response headers for client correlation
  res.setHeader('X-Request-ID', requestId);
  
  next();
});

// Structured HTTP logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const logData = {
        method: req.method,
        path,
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
      };
      
      logger.info(`${req.method} ${path} ${res.statusCode} in ${duration}ms`, logData);
    }
  });

  next();
});

// Health check endpoints (before other routes)
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const isDatabaseHealthy = await checkDatabaseHealth();
    const uptime = process.uptime();
    
    if (isDatabaseHealthy) {
      res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime),
        database: 'connected' 
      });
    } else {
      res.status(503).json({ 
        status: 'degraded', 
        timestamp: new Date().toISOString(),
        uptime: Math.floor(uptime),
        database: 'disconnected', 
        message: 'Database connection failed' 
      });
    }
  } catch (error) {
    res.status(503).json({ 
      status: 'degraded', 
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: 'error', 
      message: 'Health check failed' 
    });
  }
});

app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const isDatabaseHealthy = await checkDatabaseHealth();
    
    if (isDatabaseHealthy) {
      res.status(200).json({ 
        status: 'healthy', 
        database: 'connected' 
      });
    } else {
      res.status(503).json({ 
        status: 'degraded', 
        database: 'disconnected', 
        message: 'Database connection failed' 
      });
    }
  } catch (error) {
    res.status(503).json({ 
      status: 'degraded', 
      database: 'error', 
      message: 'Health check failed' 
    });
  }
});

app.get('/api/health/mining', async (_req: Request, res: Response) => {
  try {
    const { getMiningHealth } = await import('./mining');
    const miningHealth = getMiningHealth();
    
    if (miningHealth.status === 'healthy') {
      res.status(200).json(miningHealth);
    } else {
      res.status(503).json(miningHealth);
    }
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      message: 'Unable to check mining health'
    });
  }
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    logger.error('Request error', err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    logger.info(`🚀 Server starting`, { port, environment: process.env.NODE_ENV });
    
    // Initialize database (non-fatal)
    initializeDatabase().catch(err => {
      logger.warn("Database initialization failed (non-fatal)", err);
    });
    
    // Seed database on startup (non-fatal - don't crash if it fails)
    seedDatabase().catch(err => {
      logger.warn("Database seeding failed (non-fatal)", err);
      logger.info("Server will continue running. Database will seed when connection is available");
    });
    
    // Apply performance indexes
    applyPerformanceIndexes().catch(err => {
      logger.warn("Index application failed (non-fatal)", err);
    });
    
    // Seed game content (challenges, achievements, cosmetics)
    seedGameContent().catch(err => {
      logger.warn("Game content seeding failed (non-fatal)", err);
    });
    
    // Seed feature flags for admin dashboard
    seedFeatureFlags().catch(err => {
      logger.warn("Feature flags seeding failed (non-fatal)", err);
    });
    
    // Start mining service (also non-fatal)
    miningService.start().catch(err => {
      logger.warn("Mining service failed to start (non-fatal)", err);
      logger.info("Server will continue running. Mining will start when database is available");
    });
    
    // Initialize Telegram bot (non-fatal)
    initializeBot().catch(err => {
      logger.warn("Bot initialization failed (non-fatal)", err);
      logger.info("Server will continue running. Bot commands will not be available");
    });
    
    // Start cron jobs for scheduled tasks (announcements, analytics, etc.)
    try {
      startCronJobs();
    } catch (err: any) {
      logger.warn("Cron jobs failed to start (non-fatal)", err);
      logger.info("Server will continue running. Scheduled tasks will not be available");
    }
    
    logger.info("Server initialized successfully", { timestamp: new Date().toISOString() });
  });
})();
