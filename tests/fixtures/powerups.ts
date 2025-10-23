/**
 * Test power-up fixtures
 */

export interface TestPowerUp {
  userId: string;
  type: 'hashrate_boost' | 'luck_boost';
  boostPercentage: number;
  activatedAt: Date;
  expiresAt: Date;
}

/**
 * Hashrate boost power-up (+50% hashrate)
 */
export function hashrateBoost(userId: string, durationMinutes: number = 60): TestPowerUp {
  const activatedAt = new Date();
  const expiresAt = new Date(activatedAt.getTime() + durationMinutes * 60 * 1000);

  return {
    userId,
    type: 'hashrate_boost',
    boostPercentage: 50,
    activatedAt,
    expiresAt,
  };
}

/**
 * Luck boost power-up (+20% reward)
 */
export function luckBoost(userId: string, durationMinutes: number = 30): TestPowerUp {
  const activatedAt = new Date();
  const expiresAt = new Date(activatedAt.getTime() + durationMinutes * 60 * 1000);

  return {
    userId,
    type: 'luck_boost',
    boostPercentage: 20,
    activatedAt,
    expiresAt,
  };
}

/**
 * Expired power-up (for testing cleanup)
 */
export function expiredPowerUp(userId: string, type: 'hashrate_boost' | 'luck_boost'): TestPowerUp {
  const activatedAt = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
  const expiresAt = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago (expired)

  return {
    userId,
    type,
    boostPercentage: type === 'hashrate_boost' ? 50 : 20,
    activatedAt,
    expiresAt,
  };
}

/**
 * About to expire power-up (5 seconds remaining)
 */
export function expiringPowerUp(userId: string, type: 'hashrate_boost' | 'luck_boost'): TestPowerUp {
  const activatedAt = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
  const expiresAt = new Date(Date.now() + 5 * 1000); // Expires in 5 seconds

  return {
    userId,
    type,
    boostPercentage: type === 'hashrate_boost' ? 50 : 20,
    activatedAt,
    expiresAt,
  };
}

/**
 * Factory function to create test power-up with custom duration
 */
export function createTestPowerUp(
  userId: string,
  type: 'hashrate_boost' | 'luck_boost',
  durationMinutes: number,
  startedMinutesAgo: number = 0
): TestPowerUp {
  const activatedAt = new Date(Date.now() - startedMinutesAgo * 60 * 1000);
  const expiresAt = new Date(activatedAt.getTime() + durationMinutes * 60 * 1000);

  return {
    userId,
    type,
    boostPercentage: type === 'hashrate_boost' ? 50 : 20,
    activatedAt,
    expiresAt,
  };
}

/**
 * Power-up scenarios for testing
 */
export const powerUpScenarios = {
  // Single active hashrate boost
  singleHashrateBoost: (userId: string) => [hashrateBoost(userId, 60)],

  // Single active luck boost
  singleLuckBoost: (userId: string) => [luckBoost(userId, 30)],

  // Both power-ups active (stacking)
  bothActive: (userId: string) => [hashrateBoost(userId, 60), luckBoost(userId, 30)],

  // Multiple hashrate boosts (if allowed to stack)
  multipleHashrateBoosts: (userId: string) => [
    hashrateBoost(userId, 60),
    hashrateBoost(userId, 120),
  ],

  // No active power-ups
  noPowerUps: () => [],

  // Mix of active and expired power-ups
  mixedActivExpired: (userId: string) => [
    hashrateBoost(userId, 60), // Active
    expiredPowerUp(userId, 'luck_boost'), // Expired
  ],

  // All expired power-ups
  allExpired: (userId: string) => [
    expiredPowerUp(userId, 'hashrate_boost'),
    expiredPowerUp(userId, 'luck_boost'),
  ],

  // About to expire (for testing auto-expiration)
  aboutToExpire: (userId: string) => [expiringPowerUp(userId, 'hashrate_boost')],

  // Long duration power-up
  longDuration: (userId: string) => [hashrateBoost(userId, 240)], // 4 hours

  // Short duration power-up (for faster testing)
  shortDuration: (userId: string) => [
    createTestPowerUp(userId, 'hashrate_boost', 1), // 1 minute
  ],

  // Power-up that was activated 30 minutes ago and has 30 minutes remaining
  halfExpired: (userId: string) => [createTestPowerUp(userId, 'hashrate_boost', 60, 30)],
};

/**
 * Calculate effective hashrate with power-up boosts
 */
export function calculateBoostedHashrate(
  baseHashrate: number,
  powerUps: TestPowerUp[]
): number {
  const hashrateBoosts = powerUps.filter((p) => p.type === 'hashrate_boost' && new Date() < p.expiresAt);
  const totalBoost = hashrateBoosts.reduce((sum, p) => sum + p.boostPercentage, 0);

  return Math.floor(baseHashrate * (1 + totalBoost / 100));
}

/**
 * Calculate effective reward with luck boosts
 */
export function calculateBoostedReward(baseReward: number, powerUps: TestPowerUp[]): number {
  const luckBoosts = powerUps.filter((p) => p.type === 'luck_boost' && new Date() < p.expiresAt);
  const totalBoost = luckBoosts.reduce((sum, p) => sum + p.boostPercentage, 0);

  return Math.floor(baseReward * (1 + totalBoost / 100));
}

/**
 * Check if power-up is currently active
 */
export function isPowerUpActive(powerUp: TestPowerUp): boolean {
  const now = new Date();
  return now >= powerUp.activatedAt && now < powerUp.expiresAt;
}

/**
 * Get remaining time in minutes
 */
export function getRemainingMinutes(powerUp: TestPowerUp): number {
  if (!isPowerUpActive(powerUp)) return 0;

  const now = new Date();
  const remainingMs = powerUp.expiresAt.getTime() - now.getTime();
  return Math.ceil(remainingMs / (60 * 1000));
}
