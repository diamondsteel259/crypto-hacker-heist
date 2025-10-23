import type { Express } from "express";
import { getMiningHealth } from "../mining";

export function registerHealthRoutes(app: Express): void {
  // Health endpoint for Render
  app.get("/healthz", async (_req, res) => {
    res.status(200).json({ ok: true });
  });

  // Health check for server and database
  app.get("/api/health", async (_req, res) => {
    try {
      res.json({
        ok: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Health check error:", error);
      res.status(500).json({
        ok: false,
        error: "Health check failed",
        message: error.message
      });
    }
  });

  // Mining health check
  app.get("/api/health/mining", async (_req, res) => {
    try {
      const miningHealth = getMiningHealth();
      const isHealthy = miningHealth.consecutiveFailures < 3 &&
                        (miningHealth.lastSuccessfulMine !== null && Date.now() - miningHealth.lastSuccessfulMine.getTime() < 15 * 60 * 1000);

      res.json({
        ok: isHealthy,
        ...miningHealth,
      });
    } catch (error: any) {
      console.error("Mining health check error:", error);
      res.status(500).json({
        ok: false,
        error: "Mining health check failed",
        message: error.message
      });
    }
  });
}
