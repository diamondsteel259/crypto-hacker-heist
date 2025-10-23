import { db } from "../storage";
import { economyMetrics, economySinks, economyAlerts, users, blocks } from "@shared/schema";
import { eq, sql, lte, gte, and, desc } from "drizzle-orm";

/**
 * Calculate Gini coefficient for wealth inequality
 * 0 = perfect equality, 1 = perfect inequality
 */
function calculateGiniCoefficient(balances: number[]): number {
  if (balances.length === 0) return 0;

  // Sort balances in ascending order
  const sorted = balances.filter(b => b >= 0).sort((a, b) => a - b);
  const n = sorted.length;

  if (n === 0) return 0;

  // Calculate Gini coefficient using the formula:
  // G = (2 * sum(i * x_i)) / (n * sum(x_i)) - (n + 1) / n
  let sumWeighted = 0;
  let sumTotal = 0;

  for (let i = 0; i < n; i++) {
    sumWeighted += (i + 1) * sorted[i];
    sumTotal += sorted[i];
  }

  if (sumTotal === 0) return 0;

  const gini = (2 * sumWeighted) / (n * sumTotal) - (n + 1) / n;

  return Math.max(0, Math.min(1, gini)); // Clamp between 0 and 1
}

/**
 * Calculate wealth distribution (top 1%, top 10%)
 */
export async function calculateWealthDistribution(): Promise<{
  top1Percent: number;
  top10Percent: number;
  giniCoefficient: number;
}> {
  try {
    // Get all user balances
    const allUsers = await db.select({
      balance: users.csBalance,
    })
      .from(users);

    const balances = allUsers.map(u => u.balance || 0).sort((a, b) => b - a);
    const totalBalance = balances.reduce((sum, b) => sum + b, 0);

    if (totalBalance === 0 || balances.length === 0) {
      return { top1Percent: 0, top10Percent: 0, giniCoefficient: 0 };
    }

    // Calculate top 1% ownership
    const top1Count = Math.max(1, Math.ceil(balances.length * 0.01));
    const top1Sum = balances.slice(0, top1Count).reduce((sum, b) => sum + b, 0);
    const top1Percent = (top1Sum / totalBalance) * 100;

    // Calculate top 10% ownership
    const top10Count = Math.max(1, Math.ceil(balances.length * 0.10));
    const top10Sum = balances.slice(0, top10Count).reduce((sum, b) => sum + b, 0);
    const top10Percent = (top10Sum / totalBalance) * 100;

    // Calculate Gini coefficient
    const giniCoefficient = calculateGiniCoefficient(balances);

    return {
      top1Percent: parseFloat(top1Percent.toFixed(2)),
      top10Percent: parseFloat(top10Percent.toFixed(2)),
      giniCoefficient: parseFloat(giniCoefficient.toFixed(4)),
    };
  } catch (error: any) {
    console.error("Calculate wealth distribution error:", error);
    throw error;
  }
}

/**
 * Calculate daily economy metrics
 */
export async function calculateDailyEconomyMetrics(date: Date): Promise<void> {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Calculate total CS in circulation (sum of all user balances)
    const circulationResult = await db.select({
      total: sql<number>`COALESCE(SUM(${users.csBalance}), 0)`,
    })
      .from(users);
    const totalCsInCirculation = circulationResult[0]?.total || 0;

    // Calculate total CS generated all-time (sum of all block rewards up to this date)
    const generatedResult = await db.select({
      total: sql<number>`COALESCE(SUM(${blocks.reward}), 0)`,
    })
      .from(blocks)
      .where(lte(blocks.timestamp, endOfDay));
    const totalCsGenerated = generatedResult[0]?.total || 0;

    // Calculate CS generated today
    const todayGeneratedResult = await db.select({
      total: sql<number>`COALESCE(SUM(${blocks.reward}), 0)`,
    })
      .from(blocks)
      .where(
        and(
          gte(blocks.timestamp, startOfDay),
          lte(blocks.timestamp, endOfDay)
        )
      );
    const csGeneratedToday = todayGeneratedResult[0]?.total || 0;

    // Calculate CS spent today (for now, assume it's the difference)
    // TODO: Track actual CS spending in transactions table
    const csSpentToday = 0;

    // Calculate net CS change
    const netCsChange = csGeneratedToday - csSpentToday;

    // Calculate inflation rate (daily generation / total in circulation * 100)
    const inflationRatePercent = totalCsInCirculation > 0
      ? (csGeneratedToday / totalCsInCirculation) * 100
      : 0;

    // Calculate average balance per user
    const totalUsersResult = await db.select({
      count: sql<number>`COUNT(*)`,
    })
      .from(users);
    const totalUsers = totalUsersResult[0]?.count || 1;
    const avgBalancePerUser = totalUsers > 0 ? totalCsInCirculation / totalUsers : 0;

    // Calculate median balance
    const allBalances = await db.select({ balance: users.csBalance })
      .from(users)
      .orderBy(users.csBalance);
    const medianIndex = Math.floor(allBalances.length / 2);
    const medianBalance = allBalances.length > 0
      ? (allBalances.length % 2 === 0
        ? ((allBalances[medianIndex - 1]?.balance || 0) + (allBalances[medianIndex]?.balance || 0)) / 2
        : allBalances[medianIndex]?.balance || 0)
      : 0;

    // Calculate wealth distribution
    const { top1Percent, top10Percent, giniCoefficient } = await calculateWealthDistribution();

    // Count active wallets (users with balance > 0)
    const activeWalletsResult = await db.select({
      count: sql<number>`COUNT(*)`,
    })
      .from(users)
      .where(sql`${users.csBalance} > 0`);
    const activeWallets = activeWalletsResult[0]?.count || 0;

    // Check if record exists
    const existing = await db.select()
      .from(economyMetrics)
      .where(eq(economyMetrics.date, dateStr))
      .limit(1);

    const metricsData = {
      date: dateStr,
      totalCsInCirculation: totalCsInCirculation.toString(),
      totalCsGenerated: totalCsGenerated.toString(),
      csGeneratedToday: csGeneratedToday.toString(),
      csSpentToday: csSpentToday.toString(),
      netCsChange: netCsChange.toString(),
      inflationRatePercent: inflationRatePercent.toFixed(4),
      avgBalancePerUser: avgBalancePerUser.toFixed(2),
      medianBalance: medianBalance.toFixed(2),
      top1PercentOwnership: top1Percent.toString(),
      top10PercentOwnership: top10Percent.toString(),
      giniCoefficient: giniCoefficient.toString(),
      activeWallets,
    };

    if (existing.length > 0) {
      await db.update(economyMetrics)
        .set(metricsData)
        .where(eq(economyMetrics.date, dateStr));
    } else {
      await db.insert(economyMetrics).values(metricsData);
    }

    console.log(`✅ Economy metrics calculated for ${dateStr}`);

    // Check for alerts
    await checkEconomyAlerts(dateStr, metricsData);
  } catch (error: any) {
    console.error("Calculate daily economy metrics error:", error);
    throw error;
  }
}

/**
 * Calculate economy sinks (where CS is being spent)
 */
export async function calculateEconomySinks(date: Date): Promise<void> {
  try {
    const dateStr = date.toISOString().split('T')[0];

    // TODO: Track actual CS sinks when transaction tracking is implemented
    // For now, we'll create placeholder records

    const sinkTypes = ['equipment', 'powerups', 'lootboxes', 'packs', 'upgrades', 'cosmetics', 'other'];

    for (const sinkType of sinkTypes) {
      const existing = await db.select()
        .from(economySinks)
        .where(
          and(
            eq(economySinks.date, dateStr),
            eq(economySinks.sinkType, sinkType)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await db.insert(economySinks).values({
          date: dateStr,
          sinkType,
          csSpent: '0',
          transactionCount: 0,
        });
      }
    }

    console.log(`✅ Economy sinks calculated for ${dateStr}`);
  } catch (error: any) {
    console.error("Calculate economy sinks error:", error);
    throw error;
  }
}

/**
 * Check for economy alerts and create them if thresholds are crossed
 */
async function checkEconomyAlerts(dateStr: string, metrics: any): Promise<void> {
  try {
    const alerts: Array<{ alertType: string; severity: string; message: string; metric: any }> = [];

    // Alert 1: High inflation (> 5%)
    const inflationRate = parseFloat(metrics.inflationRatePercent);
    if (inflationRate > 5) {
      alerts.push({
        alertType: 'high_inflation',
        severity: inflationRate > 10 ? 'critical' : 'warning',
        message: `Daily inflation rate is ${inflationRate.toFixed(2)}% (threshold: 5%). Consider adding more CS sinks or reducing mining rewards.`,
        metric: { inflationRate, threshold: 5 },
      });
    }

    // Alert 2: Negative sinks (CS generated > 2x CS spent for 3 days)
    // (Simplified: just check if spending is very low)
    const csGenerated = parseFloat(metrics.csGeneratedToday);
    const csSpent = parseFloat(metrics.csSpentToday);
    if (csGenerated > 0 && csSpent < csGenerated * 0.5) {
      alerts.push({
        alertType: 'negative_sinks',
        severity: 'warning',
        message: `CS spending is low. Generated: ${csGenerated.toFixed(0)}, Spent: ${csSpent.toFixed(0)}. Players may not be engaged with CS sinks.`,
        metric: { csGenerated, csSpent, ratio: csSpent / csGenerated },
      });
    }

    // Alert 3: Wealth concentration (top 10% owns > 80%)
    const top10Ownership = parseFloat(metrics.top10PercentOwnership);
    if (top10Ownership > 80) {
      alerts.push({
        alertType: 'wealth_concentration',
        severity: top10Ownership > 90 ? 'critical' : 'warning',
        message: `Top 10% of users own ${top10Ownership.toFixed(1)}% of all CS (threshold: 80%). Consider progressive pricing or wealth redistribution mechanics.`,
        metric: { top10Ownership, threshold: 80 },
      });
    }

    // Alert 4: Deflation (net CS change negative)
    const netChange = parseFloat(metrics.netCsChange);
    if (netChange < 0) {
      alerts.push({
        alertType: 'deflation',
        severity: 'info',
        message: `Net CS change is negative (${netChange.toFixed(0)}). More CS being removed than generated. This may be intentional or concerning.`,
        metric: { netChange },
      });
    }

    // Create alerts in database
    for (const alert of alerts) {
      await db.insert(economyAlerts).values({
        date: dateStr,
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        metric: JSON.stringify(alert.metric),
      });
    }

    if (alerts.length > 0) {
      console.log(`⚠️  Generated ${alerts.length} economy alerts for ${dateStr}`);
    }
  } catch (error: any) {
    console.error("Check economy alerts error:", error);
    // Don't throw - alert generation shouldn't break metrics calculation
  }
}

/**
 * Get economy overview
 */
export async function getEconomyOverview(): Promise<any> {
  try {
    // Get latest metrics
    const latest = await db.select()
      .from(economyMetrics)
      .orderBy(desc(economyMetrics.date))
      .limit(1);

    if (latest.length === 0) {
      return {
        totalCsInCirculation: '0',
        inflationRatePercent: '0',
        top10PercentOwnership: '0',
        giniCoefficient: '0',
        activeWallets: 0,
      };
    }

    return latest[0];
  } catch (error: any) {
    console.error("Get economy overview error:", error);
    throw error;
  }
}

/**
 * Get economy history for charts
 */
export async function getEconomyHistory(days: number = 30): Promise<any[]> {
  try {
    const history = await db.select()
      .from(economyMetrics)
      .orderBy(desc(economyMetrics.date))
      .limit(days);

    return history.reverse(); // Return in chronological order
  } catch (error: any) {
    console.error("Get economy history error:", error);
    throw error;
  }
}

/**
 * Get economy sinks breakdown
 */
export async function getEconomySinksBreakdown(days: number = 30): Promise<any[]> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sinks = await db.select()
      .from(economySinks)
      .where(
        and(
          gte(economySinks.date, startDate.toISOString().split('T')[0]),
          lte(economySinks.date, endDate.toISOString().split('T')[0])
        )
      )
      .orderBy(economySinks.date);

    return sinks;
  } catch (error: any) {
    console.error("Get economy sinks breakdown error:", error);
    throw error;
  }
}

/**
 * Get active economy alerts
 */
export async function getActiveAlerts(): Promise<any[]> {
  try {
    const alerts = await db.select()
      .from(economyAlerts)
      .where(eq(economyAlerts.acknowledged, false))
      .orderBy(desc(economyAlerts.createdAt))
      .limit(50);

    return alerts;
  } catch (error: any) {
    console.error("Get active alerts error:", error);
    throw error;
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(alertId: number, adminTelegramId: string): Promise<void> {
  try {
    await db.update(economyAlerts)
      .set({
        acknowledged: true,
        acknowledgedBy: adminTelegramId,
      })
      .where(eq(economyAlerts.id, alertId));

    console.log(`✅ Alert ${alertId} acknowledged by ${adminTelegramId}`);
  } catch (error: any) {
    console.error("Acknowledge alert error:", error);
    throw error;
  }
}

/**
 * Get economy recommendations based on current metrics
 */
export function getEconomyRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];

  const inflationRate = parseFloat(metrics.inflationRatePercent || '0');
  const top10Ownership = parseFloat(metrics.top10PercentOwnership || '0');
  const netChange = parseFloat(metrics.netCsChange || '0');
  const csGenerated = parseFloat(metrics.csGeneratedToday || '0');
  const csSpent = parseFloat(metrics.csSpentToday || '0');

  // Inflation recommendations
  if (inflationRate > 5) {
    recommendations.push("⚠️ High inflation detected. Consider: (1) Adding more CS sinks (equipment, power-ups), (2) Reducing block rewards, (3) Implementing progressive pricing");
  }

  // Spending recommendations
  if (csGenerated > 0 && csSpent < csGenerated * 0.5) {
    recommendations.push("💡 Players aren't spending CS. Consider: (1) Running flash sales or events, (2) Adding new equipment tiers, (3) Implementing limited-time offers");
  }

  // Wealth concentration recommendations
  if (top10Ownership > 80) {
    recommendations.push("⚠️ Wealth too concentrated. Consider: (1) Daily/weekly CS caps, (2) Progressive pricing (costs scale with wealth), (3) Wealth redistribution events");
  }

  // Deflation recommendations
  if (netChange < 0) {
    recommendations.push("ℹ️ Deflation detected. If unintentional, consider: (1) Increasing mining rewards, (2) Reducing equipment prices, (3) Adding CS generation events");
  }

  // Healthy economy
  if (recommendations.length === 0) {
    recommendations.push("✅ Economy appears healthy! Inflation is under control, spending is balanced, and wealth distribution is reasonable.");
  }

  return recommendations;
}
