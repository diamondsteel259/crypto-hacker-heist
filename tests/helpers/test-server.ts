import express, { type Request, Response, NextFunction, type Application } from "express";
import { Server } from 'http';
import { registerRoutes } from '../../server/routes.js';
import { checkDatabaseHealth } from '../../server/db.js';
import rateLimit from "express-rate-limit";

let testServer: Server | null = null;
let testApp: Application | null = null;
const TEST_PORT = parseInt(process.env.TEST_PORT || '5001', 10);

/**
 * Create Express app for testing without starting the server
 */
export async function createTestApp(): Promise<Application> {
  const app = express();

  // Trust proxy for rate limiting
  app.set('trust proxy', 1);
  app.set('env', 'test');

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Lenient rate limiting for tests
  const testLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Much higher limit for tests
    skip: (req) => {
      return req.path === '/healthz' || req.path === '/api/health' || !req.path.startsWith('/api/');
    }
  });

  app.use('/api/', testLimiter);

  // Health check endpoints
  app.get('/api/health', async (_req: Request, res: Response) => {
    try {
      const isDatabaseHealthy = await checkDatabaseHealth();

      if (isDatabaseHealthy) {
        res.status(200).json({
          status: 'healthy',
          database: 'connected',
          timestamp: new Date().toISOString()
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

  app.get('/healthz', (_req: Request, res: Response) => {
    res.status(200).json({ ok: true });
  });

  app.get('/api/health/mining', async (_req: Request, res: Response) => {
    try {
      const { getMiningHealth } = await import('../../server/mining.js');
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

  // Register all API routes
  await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  return app;
}

/**
 * Start test server instance on test port
 */
export async function startTestServer(): Promise<{ app: Application; server: Server; baseUrl: string }> {
  if (testServer) {
    return {
      app: testApp!,
      server: testServer,
      baseUrl: `http://localhost:${TEST_PORT}`
    };
  }

  testApp = await createTestApp();

  return new Promise((resolve, reject) => {
    testServer = testApp!.listen(TEST_PORT, '0.0.0.0', () => {
      console.log(`[Test Server] Running on port ${TEST_PORT}`);
      resolve({
        app: testApp!,
        server: testServer!,
        baseUrl: `http://localhost:${TEST_PORT}`
      });
    });

    testServer.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[Test Server] Port ${TEST_PORT} is already in use`);
        reject(new Error(`Port ${TEST_PORT} is already in use`));
      } else {
        reject(error);
      }
    });
  });
}

/**
 * Stop test server and cleanup
 */
export async function stopTestServer(): Promise<void> {
  if (testServer) {
    return new Promise((resolve, reject) => {
      testServer!.close((error) => {
        if (error) {
          console.error('[Test Server] Error closing server:', error);
          reject(error);
        } else {
          console.log('[Test Server] Stopped');
          testServer = null;
          testApp = null;
          resolve();
        }
      });
    });
  }
}

/**
 * Get test server base URL
 */
export function getTestServerUrl(): string {
  return `http://localhost:${TEST_PORT}`;
}

/**
 * Reset test server state (clear caches, reset mining service)
 */
export async function resetTestServerState(): Promise<void> {
  try {
    // Stop mining service if running
    const { miningService } = await import('../../server/mining.js');
    if (miningService) {
      miningService.stop();
    }
  } catch (error) {
    console.warn('[Test Server] Could not reset mining service:', error);
  }
}

/**
 * Get the Express app instance for testing
 */
export function getTestApp(): Application {
  if (!testApp) {
    throw new Error('Test server not started. Call startTestServer() first.');
  }
  return testApp;
}
