import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { miningService } from "./mining";
import { seedDatabase } from "./seedDatabase";
import { seedGameContent } from "./seedGameContent";
import { initializeBot } from "./bot";
import { applyPerformanceIndexes } from "./applyIndexes";

// Crypto Hacker Heist - v1.0.1 (Deployment trigger)
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { miningService } from "./mining";
import { seedDatabase } from "./seedDatabase";
import { seedGameContent } from "./seedGameContent";
import { initializeBot } from "./bot";
import { applyPerformanceIndexes } from "./applyIndexes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
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
    log(`serving on port ${port}`);
    
    // Seed database on startup (non-fatal - don't crash if it fails)
    seedDatabase().catch(err => {
      console.error("⚠️  Database seeding failed (non-fatal):", err.message || err);
      console.log("✅ Server will continue running. Database will seed when connection is available.");
    });
    
    // Apply performance indexes
    applyPerformanceIndexes().catch(err => {
      console.error("⚠️  Index application failed (non-fatal):", err.message || err);
    });
    
    // Seed game content (challenges, achievements, cosmetics)
    seedGameContent().catch(err => {
      console.error("⚠️  Game content seeding failed (non-fatal):", err.message || err);
    });
    
    // Start mining service (also non-fatal)
    miningService.start().catch(err => {
      console.error("⚠️  Mining service failed to start (non-fatal):", err.message || err);
      console.log("✅ Server will continue running. Mining will start when database is available.");
    });
    
    // Initialize Telegram bot (non-fatal)
    initializeBot().catch(err => {
      console.error("⚠️  Bot initialization failed (non-fatal):", err.message || err);
      console.log("✅ Server will continue running. Bot commands will not be available.");
    });
    
    console.log("🚀 NEW DEPLOYMENT - " + new Date().toISOString());
  });
})();
