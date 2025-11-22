import { db } from "./db";
import { dailyChallenges, achievements, cosmeticItems } from "@shared/schema";
import { logger } from "./logger";

// Daily Challenges Data
export const dailyChallengesData = [
  {
    challengeId: "early-bird",
    name: "Early Bird",
    description: "Mine a block before 12PM",
    requirement: "mine_before_noon",
    rewardCs: 5000,
    rewardChst: null,
    rewardItem: null,
    isActive: true,
  },
  {
    challengeId: "night-owl",
    name: "Night Owl",
    description: "Mine a block after 12AM",
    requirement: "mine_after_midnight",
    rewardCs: 5000,
    rewardChst: null,
    rewardItem: null,
    isActive: true,
  },
  {
    challengeId: "power-user",
    name: "Power User",
    description: "Claim all 5 daily power-ups",
    requirement: "claim_5_daily_powerups",
    rewardCs: 2500,
    rewardChst: null,
    rewardItem: null,
    isActive: true,
  },
  {
    challengeId: "big-spender",
    name: "Big Spender",
    description: "Spend 50,000 CS in shop",
    requirement: "spend_50000_cs",
    rewardCs: 10000,
    rewardChst: null,
    rewardItem: null,
    isActive: true,
  },
  {
    challengeId: "networker",
    name: "Networker",
    description: "Refer 1 new friend today",
    requirement: "refer_1_friend",
    rewardCs: 0,
    rewardChst: null,
    rewardItem: "basic-loot-box",
    isActive: true,
  },
];

// Achievements Data
export const achievementsData = [
  {
    achievementId: "first-steps",
    name: "First Steps",
    description: "Own your first equipment",
    requirement: "own_1_equipment",
    category: "milestone",
    rewardCs: 1000,
    rewardChst: null,
    rewardItem: null,
    badgeIcon: "🎯",
    isActive: true,
    orderIndex: 1,
  },
  {
    achievementId: "getting-serious",
    name: "Getting Serious",
    description: "Reach 1,000 H/s",
    requirement: "hashrate_1000",
    category: "milestone",
    rewardCs: 5000,
    rewardChst: null,
    rewardItem: null,
    badgeIcon: "⚡",
    isActive: true,
    orderIndex: 2,
  },
  {
    achievementId: "power-miner",
    name: "Power Miner",
    description: "Reach 10,000 H/s",
    requirement: "hashrate_10000",
    category: "milestone",
    rewardCs: 25000,
    rewardChst: null,
    rewardItem: null,
    badgeIcon: "💪",
    isActive: true,
    orderIndex: 3,
  },
  {
    achievementId: "network-whale",
    name: "Network Whale",
    description: "Reach 100,000 H/s",
    requirement: "hashrate_100000",
    category: "milestone",
    rewardCs: 100000,
    rewardChst: null,
    rewardItem: null,
    badgeIcon: "🐋",
    isActive: true,
    orderIndex: 4,
  },
  {
    achievementId: "collector",
    name: "Collector",
    description: "Own 10 different equipment types",
    requirement: "own_10_different_equipment",
    category: "milestone",
    rewardCs: 0,
    rewardChst: null,
    rewardItem: "premium-loot-box",
    badgeIcon: "📦",
    isActive: true,
    orderIndex: 5,
  },
  {
    achievementId: "whale",
    name: "Whale",
    description: "Spend 10 TON total",
    requirement: "spend_10_ton",
    category: "spending",
    rewardCs: 0,
    rewardChst: null,
    rewardItem: "vip-badge",
    badgeIcon: "👑",
    isActive: true,
    orderIndex: 6,
  },
  {
    achievementId: "social-butterfly",
    name: "Social Butterfly",
    description: "Refer 10 friends",
    requirement: "refer_10_friends",
    category: "social",
    rewardCs: 50000,
    rewardChst: null,
    rewardItem: null,
    badgeIcon: "🦋",
    isActive: true,
    orderIndex: 7,
  },
  {
    achievementId: "block-hunter",
    name: "Block Hunter",
    description: "Mine 100 blocks",
    requirement: "mine_100_blocks",
    category: "mining",
    rewardCs: 0,
    rewardChst: null,
    rewardItem: "equipment-box",
    badgeIcon: "🎲",
    isActive: true,
    orderIndex: 8,
  },
];

// Cosmetic Items Data
export const cosmeticItemsData = [
  // Backgrounds
  {
    itemId: "bg-matrix-rain",
    name: "Matrix Rain",
    description: "Classic green matrix falling code",
    category: "background",
    priceCs: 50000,
    priceChst: null,
    priceTon: "0.5",
    imageUrl: "/cosmetics/bg-matrix.png",
    isAnimated: true,
    isActive: true,
    orderIndex: 1,
  },
  {
    itemId: "bg-cyberpunk-city",
    name: "Cyberpunk City",
    description: "Neon-lit futuristic cityscape",
    category: "background",
    priceCs: 50000,
    priceChst: null,
    priceTon: "0.5",
    imageUrl: "/cosmetics/bg-cyberpunk.png",
    isAnimated: false,
    isActive: true,
    orderIndex: 2,
  },
  {
    itemId: "bg-bitcoin-gold",
    name: "Bitcoin Gold",
    description: "Golden Bitcoin background",
    category: "background",
    priceCs: 50000,
    priceChst: null,
    priceTon: "0.5",
    imageUrl: "/cosmetics/bg-bitcoin.png",
    isAnimated: false,
    isActive: true,
    orderIndex: 3,
  },
  {
    itemId: "bg-neon-grid",
    name: "Neon Grid",
    description: "Retro neon grid pattern",
    category: "background",
    priceCs: 50000,
    priceChst: null,
    priceTon: "0.5",
    imageUrl: "/cosmetics/bg-neon-grid.png",
    isAnimated: true,
    isActive: true,
    orderIndex: 4,
  },
  {
    itemId: "bg-ton-blue",
    name: "TON Blue",
    description: "Official TON blockchain theme",
    category: "background",
    priceCs: 50000,
    priceChst: null,
    priceTon: "0.5",
    imageUrl: "/cosmetics/bg-ton.png",
    isAnimated: false,
    isActive: true,
    orderIndex: 5,
  },

  // Name Colors
  {
    itemId: "color-matrix-green",
    name: "Matrix Green",
    description: "Classic hacker green text",
    category: "nameColor",
    priceCs: 100000,
    priceChst: null,
    priceTon: "1.0",
    imageUrl: null,
    isAnimated: false,
    isActive: true,
    orderIndex: 10,
  },
  {
    itemId: "color-ton-blue",
    name: "TON Blue",
    description: "Official TON blue color",
    category: "nameColor",
    priceCs: 100000,
    priceChst: null,
    priceTon: "1.0",
    imageUrl: null,
    isAnimated: false,
    isActive: true,
    orderIndex: 11,
  },
  {
    itemId: "color-gold",
    name: "Gold",
    description: "Luxurious golden text",
    category: "nameColor",
    priceCs: 100000,
    priceChst: null,
    priceTon: "1.0",
    imageUrl: null,
    isAnimated: false,
    isActive: true,
    orderIndex: 12,
  },
  {
    itemId: "color-rainbow",
    name: "Rainbow",
    description: "Animated rainbow gradient",
    category: "nameColor",
    priceCs: 100000,
    priceChst: null,
    priceTon: "1.0",
    imageUrl: null,
    isAnimated: true,
    isActive: true,
    orderIndex: 13,
  },

  // Animated Badges
  {
    itemId: "badge-bitcoin-spin",
    name: "Spinning Bitcoin",
    description: "Rotating Bitcoin icon",
    category: "badge",
    priceCs: null,
    priceChst: null,
    priceTon: "0.5",
    imageUrl: "/cosmetics/badge-bitcoin.gif",
    isAnimated: true,
    isActive: true,
    orderIndex: 20,
  },
  {
    itemId: "badge-ton-glow",
    name: "Glowing TON",
    description: "Glowing TON logo effect",
    category: "badge",
    priceCs: null,
    priceChst: null,
    priceTon: "1.0",
    imageUrl: "/cosmetics/badge-ton.gif",
    isAnimated: true,
    isActive: true,
    orderIndex: 21,
  },
  {
    itemId: "badge-fire",
    name: "Fire Effect",
    description: "Burning fire animation",
    category: "badge",
    priceCs: null,
    priceChst: null,
    priceTon: "1.5",
    imageUrl: "/cosmetics/badge-fire.gif",
    isAnimated: true,
    isActive: true,
    orderIndex: 22,
  },
  {
    itemId: "badge-lightning",
    name: "Lightning Effect",
    description: "Electric lightning bolts",
    category: "badge",
    priceCs: null,
    priceChst: null,
    priceTon: "2.0",
    imageUrl: "/cosmetics/badge-lightning.gif",
    isAnimated: true,
    isActive: true,
    orderIndex: 23,
  },
];

export async function seedGameContent() {
  logger.info("Seeding game content");

  try {
    // Seed daily challenges
    logger.info("Seeding daily challenges");
    for (const challenge of dailyChallengesData) {
      await db.insert(dailyChallenges)
        .values(challenge)
        .onConflictDoUpdate({
          target: dailyChallenges.challengeId,
          set: challenge,
        });
    }
    logger.info("Daily challenges seeded", { count: dailyChallengesData.length });

    // Seed achievements
    logger.info("Seeding achievements");
    for (const achievement of achievementsData) {
      await db.insert(achievements)
        .values(achievement)
        .onConflictDoUpdate({
          target: achievements.achievementId,
          set: achievement,
        });
    }
    logger.info("Achievements seeded", { count: achievementsData.length });

    // Seed cosmetic items
    logger.info("Seeding cosmetic items");
    for (const cosmetic of cosmeticItemsData) {
      await db.insert(cosmeticItems)
        .values(cosmetic)
        .onConflictDoUpdate({
          target: cosmeticItems.itemId,
          set: cosmetic,
        });
    }
    logger.info("Cosmetic items seeded", { count: cosmeticItemsData.length });

    logger.info("Game content seeding complete");
  } catch (error) {
    logger.error("Error seeding game content", error);
    throw error;
  }
}
