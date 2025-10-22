// Shared helper functions for routes

/**
 * Calculate daily login rewards based on streak day
 * Rewards escalate each day, with special bonuses on day 7, 14, 30, etc.
 */
export function calculateDailyLoginReward(streakDay: number): { cs: number; chst: number; item: string | null } {
  const baseCs = 500;
  const baseChst = 10;
  
  // Calculate CS reward (increases by 500 each day)
  const cs = baseCs * streakDay;
  
  // Calculate CHST reward (increases by 10 each day)
  const chst = baseChst * streakDay;
  
  // Special items on milestone days
  let item: string | null = null;
  
  if (streakDay % 30 === 0) {
    item = "epic_power_boost";
  } else if (streakDay % 14 === 0) {
    item = "rare_power_boost";
  } else if (streakDay % 7 === 0) {
    item = "common_power_boost";
  }
  
  return { cs, chst, item };
}
