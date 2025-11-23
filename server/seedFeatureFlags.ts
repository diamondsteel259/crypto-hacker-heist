/**
 * Seed initial feature flags for the app
 * Run this script after deploying the feature_flags table
 */

import { db } from './storage';
import { featureFlags } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { logger } from './logger';

const initialFeatureFlags = [
  {
    featureKey: 'blocks',
    featureName: 'Block Explorer',
    description: 'View mined blocks and your mining contributions',
    isEnabled: true,
  },
  {
    featureKey: 'leaderboard',
    featureName: 'Leaderboard',
    description: 'Compete with other players and see rankings',
    isEnabled: true,
  },
  {
    featureKey: 'challenges',
    featureName: 'Challenges',
    description: 'Daily challenges and tasks for rewards',
    isEnabled: true,
  },
  {
    featureKey: 'achievements',
    featureName: 'Achievements',
    description: 'Unlock achievements and earn bonuses',
    isEnabled: true,
  },
  {
    featureKey: 'cosmetics',
    featureName: 'Cosmetics Shop',
    description: 'Customize your appearance with cosmetic items',
    isEnabled: true,
  },
  {
    featureKey: 'statistics',
    featureName: 'Statistics',
    description: 'View detailed stats and analytics',
    isEnabled: true,
  },
  {
    featureKey: 'spin',
    featureName: 'Spin Wheel',
    description: 'Spin the wheel for prizes and rewards',
    isEnabled: true,
  },
  {
    featureKey: 'referrals',
    featureName: 'Referrals',
    description: 'Invite friends and earn referral bonuses',
    isEnabled: true,
  },
  {
    featureKey: 'packs',
    featureName: 'Premium Packs',
    description: 'Purchase starter and premium packs',
    isEnabled: true,
  },
  {
    featureKey: 'subscription',
    featureName: 'Subscription',
    description: 'Subscribe for exclusive benefits',
    isEnabled: true,
  },
];

export async function seedFeatureFlags() {
  logger.info('Seeding feature flags');

  try {
    for (const flag of initialFeatureFlags) {
      // Check if flag already exists
      const existing = await db
        .select()
        .from(featureFlags)
        .where(eq(featureFlags.featureKey, flag.featureKey))
        .limit(1);

      if (existing.length === 0) {
        // Insert new flag
        await db.insert(featureFlags).values(flag);
        logger.info("Feature flag created", { featureName: flag.featureName });
      } else {
        logger.debug("Feature flag already exists", { featureName: flag.featureName });
      }
    }

    logger.info('Feature flags seeded successfully');
    return true;
  } catch (error) {
    logger.error('Error seeding feature flags', error);
    return false;
  }
}

// Note: This function is called from server/index.ts at startup
// Direct execution removed to fix ES module compatibility