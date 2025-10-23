import { type InsertBlock, type InsertBlockReward } from '@shared/schema';

/**
 * Test block fixtures
 */

export const testBlock1: InsertBlock = {
  blockNumber: 1,
  reward: 100000,
  totalHashrate: 1000,
  minedAt: new Date(),
};

export const testBlock2: InsertBlock = {
  blockNumber: 2,
  reward: 100000,
  totalHashrate: 2500,
  minedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
};

export const testBlock3: InsertBlock = {
  blockNumber: 3,
  reward: 100000,
  totalHashrate: 5000,
  minedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
};

/**
 * Factory function to create test block
 */
export function createTestBlock(overrides?: Partial<InsertBlock>): InsertBlock {
  const blockNumber = Math.floor(Math.random() * 1000000);

  return {
    blockNumber,
    reward: 100000,
    totalHashrate: 1000,
    minedAt: new Date(),
    ...overrides,
  };
}

/**
 * Factory function to create block reward
 */
export function createTestBlockReward(
  blockId: string,
  userId: string,
  overrides?: Partial<InsertBlockReward>
): InsertBlockReward {
  return {
    blockId,
    userId,
    reward: 10000,
    hashrateContributed: 100,
    hashrateShare: 0.1, // 10%
    createdAt: new Date(),
    ...overrides,
  };
}

/**
 * Create block with rewards for multiple users
 */
export function createBlockWithRewards(
  blockOverrides?: Partial<InsertBlock>,
  usersWithHashrate?: Array<{ userId: string; hashrate: number }>
) {
  const totalHashrate = usersWithHashrate
    ? usersWithHashrate.reduce((sum, u) => sum + u.hashrate, 0)
    : 1000;

  const block = createTestBlock({
    totalHashrate,
    ...blockOverrides,
  });

  const rewards = usersWithHashrate?.map((user) => {
    const share = user.hashrate / totalHashrate;
    return {
      blockId: 'block_temp_id', // Will be replaced with actual block ID
      userId: user.userId,
      reward: Math.floor(100000 * share),
      hashrateContributed: user.hashrate,
      hashrateShare: share,
      createdAt: new Date(),
    };
  });

  return { block, rewards: rewards || [] };
}

/**
 * Block scenarios for testing
 */
export const blockScenarios = {
  // Single miner takes entire reward
  soloMining: (userId: string) => ({
    block: createTestBlock({ totalHashrate: 100 }),
    rewards: [
      createTestBlockReward('block_id', userId, {
        hashrateContributed: 100,
        hashrateShare: 1.0,
        reward: 100000,
      }),
    ],
  }),

  // Two miners split reward evenly
  evenSplit: (userId1: string, userId2: string) => ({
    block: createTestBlock({ totalHashrate: 200 }),
    rewards: [
      createTestBlockReward('block_id', userId1, {
        hashrateContributed: 100,
        hashrateShare: 0.5,
        reward: 50000,
      }),
      createTestBlockReward('block_id', userId2, {
        hashrateContributed: 100,
        hashrateShare: 0.5,
        reward: 50000,
      }),
    ],
  }),

  // Multiple miners with different contributions
  multiMiner: (users: Array<{ userId: string; hashrate: number }>) => {
    const totalHashrate = users.reduce((sum, u) => sum + u.hashrate, 0);
    return {
      block: createTestBlock({ totalHashrate }),
      rewards: users.map((user) => {
        const share = user.hashrate / totalHashrate;
        return createTestBlockReward('block_id', user.userId, {
          hashrateContributed: user.hashrate,
          hashrateShare: share,
          reward: Math.floor(100000 * share),
        });
      }),
    };
  },

  // Block with no participants (shouldn't happen in practice)
  emptyBlock: () => ({
    block: createTestBlock({ totalHashrate: 0, reward: 0 }),
    rewards: [],
  }),

  // Recent block (just mined)
  recentBlock: (userId: string) => ({
    block: createTestBlock({
      minedAt: new Date(),
      totalHashrate: 100,
    }),
    rewards: [
      createTestBlockReward('block_id', userId, {
        hashrateContributed: 100,
        hashrateShare: 1.0,
        reward: 100000,
      }),
    ],
  }),

  // Old block (mined hours ago)
  oldBlock: (userId: string) => ({
    block: createTestBlock({
      minedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      totalHashrate: 100,
    }),
    rewards: [
      createTestBlockReward('block_id', userId, {
        hashrateContributed: 100,
        hashrateShare: 1.0,
        reward: 100000,
      }),
    ],
  }),
};
