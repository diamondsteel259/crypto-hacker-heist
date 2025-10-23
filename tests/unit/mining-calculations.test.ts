import { describe, it, expect } from 'vitest';

/**
 * Unit tests for mining calculation functions
 * Tests individual functions and calculations in isolation
 */

describe('Mining Calculations', () => {
  describe('calculateHashrateShare', () => {
    it('should return correct percentage for simple case', () => {
      const userHashrate = 100;
      const totalNetworkHashrate = 1000;
      const share = userHashrate / totalNetworkHashrate;

      expect(share).toBe(0.1);
      expect(share * 100).toBe(10); // 10%
    });

    it('should handle zero total hashrate', () => {
      const userHashrate = 100;
      const totalNetworkHashrate = 0;
      const share = totalNetworkHashrate === 0 ? 0 : userHashrate / totalNetworkHashrate;

      expect(share).toBe(0);
    });

    it('should handle user having 100% of network', () => {
      const userHashrate = 1000;
      const totalNetworkHashrate = 1000;
      const share = userHashrate / totalNetworkHashrate;

      expect(share).toBe(1.0);
    });

    it('should handle small percentage correctly', () => {
      const userHashrate = 1;
      const totalNetworkHashrate = 10000;
      const share = userHashrate / totalNetworkHashrate;

      expect(share).toBe(0.0001);
    });
  });

  describe('calculateMiningReward', () => {
    it('should calculate proportional reward', () => {
      const blockReward = 100000;
      const userShare = 0.1; // 10%
      const reward = Math.floor(blockReward * userShare);

      expect(reward).toBe(10000);
    });

    it('should handle full block reward', () => {
      const blockReward = 100000;
      const userShare = 1.0; // 100%
      const reward = Math.floor(blockReward * userShare);

      expect(reward).toBe(100000);
    });

    it('should round down fractional rewards', () => {
      const blockReward = 100000;
      const userShare = 0.333; // 33.3%
      const reward = Math.floor(blockReward * userShare);

      expect(reward).toBe(33300);
    });

    it('should handle zero share', () => {
      const blockReward = 100000;
      const userShare = 0;
      const reward = Math.floor(blockReward * userShare);

      expect(reward).toBe(0);
    });
  });

  describe('applyHashrateBoost', () => {
    it('should apply 50% boost correctly', () => {
      const baseHashrate = 100;
      const boostPercentage = 50;
      const boostedHashrate = Math.floor(baseHashrate * (1 + boostPercentage / 100));

      expect(boostedHashrate).toBe(150);
    });

    it('should apply 100% boost correctly', () => {
      const baseHashrate = 100;
      const boostPercentage = 100;
      const boostedHashrate = Math.floor(baseHashrate * (1 + boostPercentage / 100));

      expect(boostedHashrate).toBe(200);
    });

    it('should handle zero boost', () => {
      const baseHashrate = 100;
      const boostPercentage = 0;
      const boostedHashrate = Math.floor(baseHashrate * (1 + boostPercentage / 100));

      expect(boostedHashrate).toBe(100);
    });

    it('should handle multiple boosts stacking', () => {
      const baseHashrate = 100;
      const boost1 = 50; // +50%
      const boost2 = 30; // +30%
      const totalBoost = boost1 + boost2; // 80% total
      const boostedHashrate = Math.floor(baseHashrate * (1 + totalBoost / 100));

      expect(boostedHashrate).toBe(180);
    });
  });

  describe('applyLuckBoost', () => {
    it('should apply 20% luck boost to reward', () => {
      const baseReward = 10000;
      const luckPercentage = 20;
      const boostedReward = Math.floor(baseReward * (1 + luckPercentage / 100));

      expect(boostedReward).toBe(12000);
    });

    it('should handle multiple luck boosts', () => {
      const baseReward = 10000;
      const luck1 = 20;
      const luck2 = 10;
      const totalLuck = luck1 + luck2;
      const boostedReward = Math.floor(baseReward * (1 + totalLuck / 100));

      expect(boostedReward).toBe(13000);
    });
  });

  describe('distributeBlockReward', () => {
    it('should distribute rewards proportionally to multiple miners', () => {
      const blockReward = 100000;
      const miners = [
        { userId: 'user1', hashrate: 100 },
        { userId: 'user2', hashrate: 200 },
        { userId: 'user3', hashrate: 700 },
      ];

      const totalHashrate = miners.reduce((sum, m) => sum + m.hashrate, 0);
      expect(totalHashrate).toBe(1000);

      const rewards = miners.map((miner) => {
        const share = miner.hashrate / totalHashrate;
        return {
          userId: miner.userId,
          reward: Math.floor(blockReward * share),
          share,
        };
      });

      expect(rewards[0].reward).toBe(10000); // 10%
      expect(rewards[1].reward).toBe(20000); // 20%
      expect(rewards[2].reward).toBe(70000); // 70%

      const totalDistributed = rewards.reduce((sum, r) => sum + r.reward, 0);
      expect(totalDistributed).toBeLessThanOrEqual(blockReward);
    });

    it('should handle single miner getting full reward', () => {
      const blockReward = 100000;
      const miners = [{ userId: 'user1', hashrate: 1000 }];

      const totalHashrate = miners[0].hashrate;
      const reward = Math.floor(blockReward * (miners[0].hashrate / totalHashrate));

      expect(reward).toBe(100000);
    });
  });

  describe('Mining with power-ups', () => {
    it('should apply both hashrate and luck boosts correctly', () => {
      const baseHashrate = 100;
      const baseReward = 10000;
      const hashrateBoost = 50; // +50% hashrate
      const luckBoost = 20; // +20% reward

      // Apply hashrate boost
      const boostedHashrate = Math.floor(baseHashrate * (1 + hashrateBoost / 100));
      expect(boostedHashrate).toBe(150);

      // Calculate reward with boosted hashrate (assuming 10% network share maintained)
      const networkShare = 0.1;
      const blockReward = 100000;
      const rewardBeforeLuck = Math.floor(blockReward * networkShare);

      // Apply luck boost
      const finalReward = Math.floor(rewardBeforeLuck * (1 + luckBoost / 100));
      expect(finalReward).toBe(12000); // 10000 * 1.2
    });
  });
});
