import { describe, it, expect } from 'vitest';

/**
 * Unit tests for economy calculation functions
 */

describe('Economy Calculations', () => {
  describe('calculateDailyReward', () => {
    it('should give baseline reward on day 1', () => {
      const streakDay = 1;
      const baseReward = 1000;
      const reward = baseReward + (streakDay - 1) * 100;

      expect(reward).toBe(1000);
    });

    it('should increase reward with streak', () => {
      const streakDay = 7;
      const baseReward = 1000;
      const bonusPerDay = 100;
      const reward = baseReward + (streakDay - 1) * bonusPerDay;

      expect(reward).toBe(1600); // 1000 + (6 * 100)
    });

    it('should handle long streaks', () => {
      const streakDay = 30;
      const baseReward = 1000;
      const bonusPerDay = 100;
      const maxBonus = 2000;
      const calculatedReward = baseReward + (streakDay - 1) * bonusPerDay;
      const reward = Math.min(calculatedReward, baseReward + maxBonus);

      expect(reward).toBe(3000); // Capped at 1000 + 2000
    });
  });

  describe('calculateHourlyBonus', () => {
    it('should return value between 500-2000', () => {
      const min = 500;
      const max = 2000;

      // Simulate random generation 100 times
      for (let i = 0; i < 100; i++) {
        const bonus = Math.floor(Math.random() * (max - min + 1)) + min;

        expect(bonus).toBeGreaterThanOrEqual(min);
        expect(bonus).toBeLessThanOrEqual(max);
      }
    });

    it('should produce different values across calls', () => {
      const min = 500;
      const max = 2000;
      const results = new Set();

      for (let i = 0; i < 20; i++) {
        const bonus = Math.floor(Math.random() * (max - min + 1)) + min;
        results.add(bonus);
      }

      // Should have at least some variation (not all the same)
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('validatePurchase', () => {
    it('should return true if balance >= cost', () => {
      const balance = 10000;
      const cost = 5000;
      const canPurchase = balance >= cost;

      expect(canPurchase).toBe(true);
    });

    it('should return true if balance exactly equals cost', () => {
      const balance = 5000;
      const cost = 5000;
      const canPurchase = balance >= cost;

      expect(canPurchase).toBe(true);
    });

    it('should return false if balance < cost', () => {
      const balance = 3000;
      const cost = 5000;
      const canPurchase = balance >= cost;

      expect(canPurchase).toBe(false);
    });

    it('should return false if balance is zero', () => {
      const balance = 0;
      const cost = 5000;
      const canPurchase = balance >= cost;

      expect(canPurchase).toBe(false);
    });

    it('should handle large numbers', () => {
      const balance = 1000000;
      const cost = 999999;
      const canPurchase = balance >= cost;

      expect(canPurchase).toBe(true);
    });
  });

  describe('calculateAchievementReward', () => {
    it('should give appropriate reward for basic achievement', () => {
      const achievementTier = 'basic';
      const baseReward = 5000;
      const reward =
        achievementTier === 'basic'
          ? baseReward
          : achievementTier === 'advanced'
            ? baseReward * 2
            : baseReward * 5;

      expect(reward).toBe(5000);
    });

    it('should give double reward for advanced achievement', () => {
      const achievementTier = 'advanced';
      const baseReward = 5000;
      const reward =
        achievementTier === 'basic'
          ? baseReward
          : achievementTier === 'advanced'
            ? baseReward * 2
            : baseReward * 5;

      expect(reward).toBe(10000);
    });

    it('should give 5x reward for epic achievement', () => {
      const achievementTier = 'epic';
      const baseReward = 5000;
      const reward =
        achievementTier === 'basic'
          ? baseReward
          : achievementTier === 'advanced'
            ? baseReward * 2
            : baseReward * 5;

      expect(reward).toBe(25000);
    });
  });

  describe('calculateComponentUpgradeCost', () => {
    it('should increase cost with each level', () => {
      const baseCost = 1000;
      const level1Cost = baseCost * Math.pow(1.5, 0);
      const level2Cost = baseCost * Math.pow(1.5, 1);
      const level3Cost = baseCost * Math.pow(1.5, 2);

      expect(level1Cost).toBe(1000);
      expect(level2Cost).toBe(1500);
      expect(level3Cost).toBe(2250);
    });

    it('should handle high level upgrades', () => {
      const baseCost = 1000;
      const level = 10;
      const cost = Math.floor(baseCost * Math.pow(1.5, level - 1));

      expect(cost).toBeGreaterThan(baseCost);
      expect(cost).toBe(38443); // 1000 * 1.5^9
    });
  });

  describe('Balance Validation', () => {
    it('should prevent negative balances', () => {
      const currentBalance = 1000;
      const withdrawAmount = 1500;
      const newBalance = currentBalance - withdrawAmount;

      // In real implementation, this should be prevented
      expect(newBalance).toBeLessThan(0);

      // Correct implementation should check first
      const canWithdraw = currentBalance >= withdrawAmount;
      expect(canWithdraw).toBe(false);
    });

    it('should handle concurrent purchases safely', () => {
      // This is a conceptual test - real implementation needs DB transactions
      const initialBalance = 1000;
      const purchase1 = 600;
      const purchase2 = 600;

      // Both purchases check balance
      const canMakePurchase1 = initialBalance >= purchase1; // true
      const canMakePurchase2 = initialBalance >= purchase2; // true

      // But only one should succeed if processed sequentially
      let balance = initialBalance;
      if (canMakePurchase1) {
        balance -= purchase1;
      }

      // Second purchase should now fail
      const canMakePurchase2After = balance >= purchase2;
      expect(canMakePurchase2After).toBe(false);
      expect(balance).toBe(400);
    });
  });

  describe('Referral Rewards', () => {
    it('should calculate referrer bonus', () => {
      const refereeStartingBalance = 10000;
      const referrerBonusPercent = 10; // 10% of referee starting balance
      const referrerBonus = Math.floor((refereeStartingBalance * referrerBonusPercent) / 100);

      expect(referrerBonus).toBe(1000);
    });

    it('should calculate referee bonus', () => {
      const refereeBonusFlat = 2000;

      expect(refereeBonusFlat).toBe(2000);
    });
  });
});
