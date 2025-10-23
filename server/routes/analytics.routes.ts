import type { Express } from "express";
import { db } from "../storage";
import { dailyAnalytics, userSessions, users, powerUpPurchases, lootBoxPurchases, packPurchases } from "@shared/schema";
import { sql, gte, lte, and, count } from "drizzle-orm";
import { validateTelegramAuth, requireAdmin } from "../middleware/auth";
import {
  getAnalyticsOverview,
  getDailyAnalyticsHistory,
  getRetentionCohorts,
  generateDailyReport,
  updateRetentionCohorts,
} from "../services/analytics";

export function registerAnalyticsRoutes(app: Express): void {
  // Admin: Get analytics overview (DAU, MAU, retention, key metrics)
  app.get("/api/admin/analytics/overview", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const overview = await getAnalyticsOverview();
      res.json(overview);
    } catch (error: any) {
      console.error("Get analytics overview error:", error);
      res.status(500).json({ error: "Failed to fetch analytics overview" });
    }
  });

  // Admin: Get daily analytics history (for charts)
  app.get("/api/admin/analytics/daily", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const history = await getDailyAnalyticsHistory(days);
      res.json(history);
    } catch (error: any) {
      console.error("Get daily analytics error:", error);
      res.status(500).json({ error: "Failed to fetch daily analytics" });
    }
  });

  // Admin: Get retention cohort data
  app.get("/api/admin/analytics/retention", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const cohorts = await getRetentionCohorts();
      res.json(cohorts);
    } catch (error: any) {
      console.error("Get retention cohorts error:", error);
      res.status(500).json({ error: "Failed to fetch retention cohorts" });
    }
  });

  // Admin: Get revenue metrics (TON spent breakdown)
  app.get("/api/admin/analytics/revenue", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;

      // Get revenue for last N days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      // Calculate TON from power-ups
      const powerUpRevenue = await db.select({
        total: sql<number>`COALESCE(SUM(${powerUpPurchases.tonAmount}), 0)`,
        count: count(),
      })
        .from(powerUpPurchases)
        .where(
          and(
            gte(powerUpPurchases.purchasedAt, startDate),
            lte(powerUpPurchases.purchasedAt, endDate)
          )
        );

      // Calculate TON from loot boxes
      const lootBoxRevenue = await db.select({
        total: sql<number>`COALESCE(SUM(${lootBoxPurchases.tonAmount}), 0)`,
        count: count(),
      })
        .from(lootBoxPurchases)
        .where(
          and(
            gte(lootBoxPurchases.purchasedAt, startDate),
            lte(lootBoxPurchases.purchasedAt, endDate)
          )
        );

      // Calculate TON from packs
      const packRevenue = await db.select({
        total: sql<number>`COALESCE(SUM(${packPurchases.tonAmount}), 0)`,
        count: count(),
      })
        .from(packPurchases)
        .where(
          and(
            gte(packPurchases.purchasedAt, startDate),
            lte(packPurchases.purchasedAt, endDate)
          )
        );

      const totalTon = (
        parseFloat(powerUpRevenue[0]?.total?.toString() || '0') +
        parseFloat(lootBoxRevenue[0]?.total?.toString() || '0') +
        parseFloat(packRevenue[0]?.total?.toString() || '0')
      );

      const totalTransactions = (
        (powerUpRevenue[0]?.count || 0) +
        (lootBoxRevenue[0]?.count || 0) +
        (packRevenue[0]?.count || 0)
      );

      // Calculate active paying users
      const payingUsers = await db.select({
        count: sql<number>`COUNT(DISTINCT COALESCE(${powerUpPurchases.userId}, ${lootBoxPurchases.userId}, ${packPurchases.userId}))`
      })
        .from(powerUpPurchases)
        .leftJoin(lootBoxPurchases, sql`1=1`)
        .leftJoin(packPurchases, sql`1=1`)
        .where(
          sql`${powerUpPurchases.purchasedAt} >= ${startDate} AND ${powerUpPurchases.purchasedAt} <= ${endDate}
           OR ${lootBoxPurchases.purchasedAt} >= ${startDate} AND ${lootBoxPurchases.purchasedAt} <= ${endDate}
           OR ${packPurchases.purchasedAt} >= ${startDate} AND ${packPurchases.purchasedAt} <= ${endDate}`
        );

      // Get revenue per user (ARPU)
      const totalUsersResult = await db.select({ count: count() })
        .from(users);
      const totalUsers = totalUsersResult[0]?.count || 1;

      const arpu = totalUsers > 0 ? (totalTon / totalUsers).toFixed(6) : '0.000000';

      res.json({
        totalRevenue: totalTon.toFixed(6),
        totalTransactions,
        payingUsers: payingUsers[0]?.count || 0,
        arpu,
        breakdown: {
          powerUps: {
            revenue: parseFloat(powerUpRevenue[0]?.total?.toString() || '0').toFixed(6),
            count: powerUpRevenue[0]?.count || 0,
          },
          lootBoxes: {
            revenue: parseFloat(lootBoxRevenue[0]?.total?.toString() || '0').toFixed(6),
            count: lootBoxRevenue[0]?.count || 0,
          },
          packs: {
            revenue: parseFloat(packRevenue[0]?.total?.toString() || '0').toFixed(6),
            count: packRevenue[0]?.count || 0,
          },
        },
      });
    } catch (error: any) {
      console.error("Get revenue metrics error:", error);
      res.status(500).json({ error: "Failed to fetch revenue metrics" });
    }
  });

  // Admin: Get user segment breakdown (basic version - will be enhanced in segmentation feature)
  app.get("/api/admin/analytics/users/segments", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      // Calculate basic segments
      const now = new Date();
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      // Get all users with their last activity
      const allUsers = await db.select({
        telegramId: users.telegramId,
        createdAt: users.createdAt,
      })
        .from(users);

      let newUsers = 0;
      let activeUsers = 0;
      let atRiskUsers = 0;
      let churnedUsers = 0;

      for (const user of allUsers) {
        if (!user.telegramId) continue;

        // Check if new user (created within last 7 days)
        if (user.createdAt >= sevenDaysAgo) {
          newUsers++;
          continue;
        }

        // Get user's last session
        const lastSession = await db.select()
          .from(userSessions)
          .where(sql`${userSessions.telegramId} = ${user.telegramId}`)
          .orderBy(sql`${userSessions.startedAt} DESC`)
          .limit(1);

        if (lastSession.length === 0) {
          churnedUsers++;
          continue;
        }

        const lastActivity = lastSession[0].startedAt;

        if (lastActivity >= threeDaysAgo) {
          activeUsers++;
        } else if (lastActivity >= fourteenDaysAgo) {
          atRiskUsers++;
        } else {
          churnedUsers++;
        }
      }

      res.json({
        total: allUsers.length,
        segments: {
          new: newUsers,
          active: activeUsers,
          atRisk: atRiskUsers,
          churned: churnedUsers,
        },
      });
    } catch (error: any) {
      console.error("Get user segments error:", error);
      res.status(500).json({ error: "Failed to fetch user segments" });
    }
  });

  // Admin: Manually trigger daily report generation
  app.post("/api/admin/analytics/generate-report", validateTelegramAuth, requireAdmin, async (req, res) => {
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

      const report = await generateDailyReport(targetDate);

      res.json({
        success: true,
        report,
        message: `Daily report generated for ${report.date}`,
      });
    } catch (error: any) {
      console.error("Generate report error:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Admin: Manually trigger retention cohort update
  app.post("/api/admin/analytics/update-cohorts", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      await updateRetentionCohorts();

      res.json({
        success: true,
        message: "Retention cohorts updated successfully",
      });
    } catch (error: any) {
      console.error("Update cohorts error:", error);
      res.status(500).json({ error: "Failed to update retention cohorts" });
    }
  });
}
