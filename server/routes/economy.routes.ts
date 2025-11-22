import { logger } from "../logger";
import type { Express } from "express";
import { validateTelegramAuth, requireAdmin, type AuthRequest } from "../middleware/auth";
import {
  getEconomyOverview,
  getEconomyHistory,
  calculateWealthDistribution,
  getEconomySinksBreakdown,
  getActiveAlerts,
  acknowledgeAlert,
  getEconomyRecommendations,
  calculateDailyEconomyMetrics,
  calculateEconomySinks,
} from "../services/economy";

export function registerEconomyRoutes(app: Express): void {
  // Admin: Get economy overview (current state)
  app.get("/api/admin/economy/overview", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const overview = await getEconomyOverview();

      // Get recommendations based on current metrics
      const recommendations = getEconomyRecommendations(overview);

      res.json({
        ...overview,
        recommendations,
      });
    } catch (error: any) {
      logger.error("Get economy overview error:", error);
      res.status(500).json({ error: "Failed to fetch economy overview" });
    }
  });

  // Admin: Get economy history (for charts)
  app.get("/api/admin/economy/history", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const history = await getEconomyHistory(days);

      res.json(history);
    } catch (error: any) {
      logger.error("Get economy history error:", error);
      res.status(500).json({ error: "Failed to fetch economy history" });
    }
  });

  // Admin: Get wealth distribution data
  app.get("/api/admin/economy/distribution", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const distribution = await calculateWealthDistribution();

      res.json(distribution);
    } catch (error: any) {
      logger.error("Get wealth distribution error:", error);
      res.status(500).json({ error: "Failed to fetch wealth distribution" });
    }
  });

  // Admin: Get economy sinks breakdown
  app.get("/api/admin/economy/sinks", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const sinks = await getEconomySinksBreakdown(days);

      // Aggregate by sink type for chart
      const aggregated: Record<string, { csSpent: number; transactionCount: number }> = {};

      for (const sink of sinks) {
        if (!aggregated[sink.sinkType]) {
          aggregated[sink.sinkType] = { csSpent: 0, transactionCount: 0 };
        }

        aggregated[sink.sinkType].csSpent += parseFloat(sink.csSpent?.toString() || '0');
        aggregated[sink.sinkType].transactionCount += sink.transactionCount || 0;
      }

      res.json({
        detailed: sinks,
        aggregated,
      });
    } catch (error: any) {
      logger.error("Get economy sinks error:", error);
      res.status(500).json({ error: "Failed to fetch economy sinks" });
    }
  });

  // Admin: Get active economy alerts
  app.get("/api/admin/economy/alerts", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const alerts = await getActiveAlerts();

      res.json(alerts);
    } catch (error: any) {
      logger.error("Get economy alerts error:", error);
      res.status(500).json({ error: "Failed to fetch economy alerts" });
    }
  });

  // Admin: Acknowledge alert
  app.post("/api/admin/economy/alerts/:id/acknowledge", validateTelegramAuth, requireAdmin, async (req: AuthRequest, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const alertId = parseInt(req.params.id);

      await acknowledgeAlert(alertId, req.telegramUser.id.toString());

      res.json({
        success: true,
        message: "Alert acknowledged",
      });
    } catch (error: any) {
      logger.error("Acknowledge alert error:", error);
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  });

  // Admin: Manually trigger economy metrics calculation
  app.post("/api/admin/economy/calculate-metrics", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const dateStr = req.body.date; // YYYY-MM-DD format

      let targetDate: Date;
      if (dateStr) {
        targetDate = new Date(dateStr);
      } else {
        // Default to yesterday
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - 1);
      }

      await calculateDailyEconomyMetrics(targetDate);
      await calculateEconomySinks(targetDate);

      res.json({
        success: true,
        message: `Economy metrics calculated for ${targetDate.toISOString().split('T')[0]}`,
      });
    } catch (error: any) {
      logger.error("Calculate metrics error:", error);
      res.status(500).json({ error: "Failed to calculate metrics" });
    }
  });

  // Admin: Get economy recommendations
  app.get("/api/admin/economy/recommendations", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const overview = await getEconomyOverview();
      const recommendations = getEconomyRecommendations(overview);

      res.json({
        recommendations,
        basedOn: {
          inflationRate: overview.inflationRatePercent,
          top10Ownership: overview.top10PercentOwnership,
          netCsChange: overview.netCsChange,
        },
      });
    } catch (error: any) {
      logger.error("Get recommendations error:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });
}
