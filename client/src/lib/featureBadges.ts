/**
 * Feature Badge Management
 * Manages "NEW" badges for features with time-based expiration and user-aware tracking
 */

const FEATURE_RELEASE_DATES: Record<string, Date> = {
  premiumPacks: new Date('2025-01-15'),
  subscription: new Date('2025-01-20'),
  // Add future features here with their release dates
};

const NEW_BADGE_DURATION_DAYS = 30;
const SEEN_FEATURES_KEY = 'chh_seen_features';

/**
 * Get seen features from localStorage
 */
function getSeenFeatures(): Record<string, number> {
  try {
    const stored = localStorage.getItem(SEEN_FEATURES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to read seen features:', error);
    return {};
  }
}

/**
 * Save seen features to localStorage
 */
function saveSeenFeatures(features: Record<string, number>): void {
  try {
    localStorage.setItem(SEEN_FEATURES_KEY, JSON.stringify(features));
  } catch (error) {
    console.error('Failed to save seen features:', error);
  }
}

/**
 * Check if a feature should show a "NEW" badge
 * A feature is "new" if:
 * 1. It was released less than 30 days ago AND
 * 2. The user hasn't seen it yet (or it's been less than 30 days since release even if seen)
 *
 * @param featureName - The name of the feature (must match a key in FEATURE_RELEASE_DATES)
 * @returns true if the feature should show a "NEW" badge
 */
export function isFeatureNew(featureName: string): boolean {
  const releaseDate = FEATURE_RELEASE_DATES[featureName];

  if (!releaseDate) {
    // Feature not in release dates, don't show badge
    return false;
  }

  const now = new Date();
  const daysSinceRelease = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));

  // If feature is older than 30 days, never show badge
  if (daysSinceRelease > NEW_BADGE_DURATION_DAYS) {
    return false;
  }

  // Check if user has seen this feature
  const seenFeatures = getSeenFeatures();
  const seenTimestamp = seenFeatures[featureName];

  if (!seenTimestamp) {
    // User has never seen this feature, show badge
    return true;
  }

  // User has seen it, but if they saw it before release (shouldn't happen but defensive)
  // or very recently, still show badge until 30 days after release
  return daysSinceRelease <= NEW_BADGE_DURATION_DAYS;
}

/**
 * Mark a feature as seen by the user
 * Stores the timestamp when the user first visited the feature
 *
 * @param featureName - The name of the feature to mark as seen
 */
export function markFeatureAsSeen(featureName: string): void {
  const seenFeatures = getSeenFeatures();

  // Only mark as seen if not already seen
  if (!seenFeatures[featureName]) {
    seenFeatures[featureName] = Date.now();
    saveSeenFeatures(seenFeatures);
  }
}

/**
 * Check if any features have new badges
 * Useful for showing a notification indicator on the "More" menu
 */
export function hasAnyNewFeatures(featureNames: string[]): boolean {
  return featureNames.some(name => isFeatureNew(name));
}

/**
 * Get count of new features
 * Useful for showing a count badge like "More (3)"
 */
export function getNewFeaturesCount(featureNames: string[]): number {
  return featureNames.filter(name => isFeatureNew(name)).length;
}

/**
 * Reset all seen features (useful for debugging or testing)
 */
export function resetSeenFeatures(): void {
  localStorage.removeItem(SEEN_FEATURES_KEY);
}
