import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, real, timestamp, boolean, unique, decimal, index, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  telegramId: text("telegram_id").unique(),
  username: text("username").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  photoUrl: text("photo_url"),
  csBalance: real("cs_balance").notNull().default(0),
  chstBalance: real("chst_balance").notNull().default(0),
  totalHashrate: real("total_hashrate").notNull().default(0),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  referralCodeIdx: index("users_referral_code_idx").on(table.referralCode),
}));

export const gameSettings = pgTable("game_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const equipmentTypes = pgTable("equipment_types", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  tier: text("tier").notNull(),
  category: text("category").notNull(),
  baseHashrate: real("base_hashrate").notNull(),
  basePrice: real("base_price").notNull(),
  currency: text("currency").notNull(),
  maxOwned: integer("max_owned").notNull(),
  orderIndex: integer("order_index").notNull(),
});

export const ownedEquipment = pgTable("owned_equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  equipmentTypeId: varchar("equipment_type_id").notNull().references(() => equipmentTypes.id),
  quantity: integer("quantity").notNull().default(1),
  upgradeLevel: integer("upgrade_level").notNull().default(0),
  currentHashrate: real("current_hashrate").notNull(),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
}, (table) => ({
  userEquipmentUnique: unique().on(table.userId, table.equipmentTypeId),
  userIdx: index("owned_equipment_user_idx").on(table.userId),
  equipmentTypeIdx: index("owned_equipment_type_idx").on(table.equipmentTypeId),
}));

export const blocks = pgTable("blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockNumber: integer("block_number").notNull().unique(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  reward: real("reward").notNull(),
  totalHashrate: real("total_hashrate").notNull(),
  totalMiners: integer("total_miners").notNull(),
  difficulty: integer("difficulty").notNull(),
});

export const blockRewards = pgTable("block_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockId: varchar("block_id").notNull().references(() => blocks.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  hashrate: real("hashrate").notNull(),
  sharePercent: real("share_percent").notNull(),
  reward: real("reward").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("block_rewards_user_idx").on(table.userId),
  blockIdx: index("block_rewards_block_idx").on(table.blockId),
}));

export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id),
  refereeId: varchar("referee_id").notNull().references(() => users.id),
  bonusEarned: real("bonus_earned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  referrerIdx: index("referrals_referrer_idx").on(table.referrerId),
  refereeIdx: index("referrals_referee_idx").on(table.refereeId),
}));

export const componentUpgrades = pgTable("component_upgrades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownedEquipmentId: varchar("owned_equipment_id").notNull().references(() => ownedEquipment.id),
  componentType: text("component_type").notNull(), // RAM, CPU, Storage, GPU
  currentLevel: integer("current_level").notNull().default(0),
  maxLevel: integer("max_level").notNull().default(10),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  equipmentComponentUnique: unique().on(table.ownedEquipmentId, table.componentType),
  equipmentIdx: index("component_upgrades_equipment_idx").on(table.ownedEquipmentId),
}));

export const userTasks = pgTable("user_tasks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  taskId: text("task_id").notNull(),
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
  rewardCs: integer("reward_cs").notNull(),
  rewardChst: integer("reward_chst").notNull(),
}, (table) => ({
  userTaskUnique: unique().on(table.userId, table.taskId),
  userTaskIdx: index("user_tasks_user_task_idx").on(table.userId, table.taskId),
}));

export const dailyClaims = pgTable("daily_claims", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  claimType: text("claim_type").notNull(),
  claimCount: integer("claim_count").notNull().default(0),
  lastClaimDate: text("last_claim_date").notNull(),
  userTimezoneOffset: integer("user_timezone_offset").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userClaimUnique: unique().on(table.userId, table.claimType, table.lastClaimDate),
  userClaimIdx: index("daily_claims_user_idx").on(table.userId, table.claimType, table.lastClaimDate),
}));

export const powerUpPurchases = pgTable("power_up_purchases", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  powerUpType: text("power_up_type").notNull(),
  tonAmount: decimal("ton_amount", { precision: 10, scale: 2 }).notNull(),
  tonTransactionHash: text("ton_transaction_hash").notNull().unique(),
  tonTransactionVerified: boolean("ton_transaction_verified").notNull().default(false),
  rewardCs: integer("reward_cs"),
  rewardChst: integer("reward_chst"),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("power_up_purchases_user_idx").on(table.userId),
  txHashIdx: index("power_up_purchases_tx_idx").on(table.tonTransactionHash),
}));

export const lootBoxPurchases = pgTable("loot_box_purchases", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  boxType: text("box_type").notNull(),
  tonAmount: decimal("ton_amount", { precision: 10, scale: 2 }).notNull(),
  tonTransactionHash: text("ton_transaction_hash").notNull().unique(),
  tonTransactionVerified: boolean("ton_transaction_verified").notNull().default(false),
  rewardsJson: text("rewards_json").notNull(),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("loot_box_purchases_user_idx").on(table.userId),
  txHashIdx: index("loot_box_purchases_tx_idx").on(table.tonTransactionHash),
}));

export const activePowerUps = pgTable("active_power_ups", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  powerUpType: text("power_up_type").notNull(),
  boostPercentage: integer("boost_percentage").notNull(),
  activatedAt: timestamp("activated_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").notNull().default(true),
}, (table) => ({
  userActiveIdx: index("active_power_ups_user_active_idx").on(table.userId, table.isActive, table.expiresAt),
}));

// Daily Challenges
export const dailyChallenges = pgTable("daily_challenges", {
  id: serial("id").primaryKey(),
  challengeId: text("challenge_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  requirement: text("requirement").notNull(),
  rewardCs: integer("reward_cs").notNull(),
  rewardChst: integer("reward_chst"),
  rewardItem: text("reward_item"), // Equipment or loot box ID
  isActive: boolean("is_active").notNull().default(true),
});

export const userDailyChallenges = pgTable("user_daily_challenges", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  challengeId: text("challenge_id").notNull(),
  completedDate: text("completed_date").notNull(), // YYYY-MM-DD format
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  rewardClaimed: boolean("reward_claimed").notNull().default(true),
}, (table) => ({
  userChallengeUnique: unique().on(table.userId, table.challengeId, table.completedDate),
  userChallengeIdx: index("user_daily_challenges_user_idx").on(table.userId, table.completedDate),
}));

// Achievement System
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  achievementId: text("achievement_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  requirement: text("requirement").notNull(),
  category: text("category").notNull(), // milestone, social, spending, mining
  rewardCs: integer("reward_cs"),
  rewardChst: integer("reward_chst"),
  rewardItem: text("reward_item"),
  badgeIcon: text("badge_icon"),
  isActive: boolean("is_active").notNull().default(true),
  orderIndex: integer("order_index").notNull().default(0),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  achievementId: text("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
  rewardClaimed: boolean("reward_claimed").notNull().default(true),
}, (table) => ({
  userAchievementUnique: unique().on(table.userId, table.achievementId),
  userAchievementIdx: index("user_achievements_user_idx").on(table.userId),
}));

// Seasons & Events
export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  seasonId: text("season_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  bonusMultiplier: real("bonus_multiplier").notNull().default(1.0),
  specialRewards: text("special_rewards"), // JSON string
  isActive: boolean("is_active").notNull().default(false),
});

// Cosmetic Items
export const cosmeticItems = pgTable("cosmetic_items", {
  id: serial("id").primaryKey(),
  itemId: text("item_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // background, nameColor, badge
  priceCs: integer("price_cs"),
  priceChst: integer("price_chst"),
  priceTon: decimal("price_ton", { precision: 10, scale: 2 }),
  imageUrl: text("image_url"),
  isAnimated: boolean("is_animated").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  orderIndex: integer("order_index").notNull().default(0),
});

export const userCosmetics = pgTable("user_cosmetics", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  cosmeticId: text("cosmetic_id").notNull(),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
  isEquipped: boolean("is_equipped").notNull().default(false),
}, (table) => ({
  userCosmeticUnique: unique().on(table.userId, table.cosmeticId),
  userCosmeticIdx: index("user_cosmetics_user_idx").on(table.userId),
}));

// Streak Tracking
export const userStreaks = pgTable("user_streaks", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }).unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastLoginDate: text("last_login_date").notNull(), // YYYY-MM-DD format
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userStreakIdx: index("user_streaks_user_idx").on(table.userId),
}));

// Hourly Bonuses
export const userHourlyBonuses = pgTable("user_hourly_bonuses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
  rewardAmount: integer("reward_amount").notNull(),
}, (table) => ({
  userHourlyIdx: index("user_hourly_bonuses_user_idx").on(table.userId, table.claimedAt),
}));

// Spin the Wheel
export const userSpins = pgTable("user_spins", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  spinDate: text("spin_date").notNull(), // YYYY-MM-DD format
  freeSpinUsed: boolean("free_spin_used").notNull().default(false),
  paidSpinsCount: integer("paid_spins_count").notNull().default(0),
  lastSpinAt: timestamp("last_spin_at").notNull().defaultNow(),
}, (table) => ({
  userSpinUnique: unique().on(table.userId, table.spinDate),
  userSpinIdx: index("user_spins_user_idx").on(table.userId, table.spinDate),
}));

export const spinHistory = pgTable("spin_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  prizeType: text("prize_type").notNull(), // cs, chst, equipment, powerup
  prizeValue: text("prize_value").notNull(),
  wasFree: boolean("was_free").notNull(),
  spunAt: timestamp("spun_at").notNull().defaultNow(),
}, (table) => ({
  userSpinHistoryIdx: index("spin_history_user_idx").on(table.userId),
}));

// Jackpot Wins (Grand Prize from Spin Wheel)
export const jackpotWins = pgTable("jackpot_wins", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  username: text("username").notNull(),
  walletAddress: text("wallet_address"),
  amount: text("amount").notNull().default("1.0"), // 1 TON jackpot
  wonAt: timestamp("won_at").notNull().defaultNow(),
  paidOut: boolean("paid_out").notNull().default(false),
  paidAt: timestamp("paid_at"),
  paidByAdmin: text("paid_by_admin"),
  notes: text("notes"),
}, (table) => ({
  userJackpotIdx: index("jackpot_wins_user_idx").on(table.userId),
  paidOutIdx: index("jackpot_wins_paid_out_idx").on(table.paidOut),
}));

// Equipment Presets
export const equipmentPresets = pgTable("equipment_presets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  presetName: text("preset_name").notNull(),
  equipmentSnapshot: text("equipment_snapshot").notNull(), // JSON string of equipment IDs
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userPresetIdx: index("equipment_presets_user_idx").on(table.userId),
}));


// Price Alerts
export const priceAlerts = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  equipmentTypeId: varchar("equipment_type_id").notNull().references(() => equipmentTypes.id),
  targetPrice: real("target_price").notNull(),
  triggered: boolean("triggered").notNull().default(false),
  triggeredAt: timestamp("triggered_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userAlertIdx: index("price_alerts_user_idx").on(table.userId),
  userEquipmentAlertUnique: unique().on(table.userId, table.equipmentTypeId),
}));

// Auto-Upgrade Settings
export const autoUpgradeSettings = pgTable("auto_upgrade_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  ownedEquipmentId: varchar("owned_equipment_id").notNull().references(() => ownedEquipment.id, { onDelete: 'cascade' }),
  componentType: text("component_type").notNull(), // RAM, CPU, Storage, GPU
  targetLevel: integer("target_level").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userEquipmentComponentUnique: unique().on(table.ownedEquipmentId, table.componentType),
  userAutoUpgradeIdx: index("auto_upgrade_settings_user_idx").on(table.userId),
}));

// Starter Packs
export const packPurchases = pgTable("pack_purchases", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  packType: text("pack_type").notNull(), // starter, pro, whale
  tonAmount: decimal("ton_amount", { precision: 10, scale: 2 }).notNull(),
  tonTransactionHash: text("ton_transaction_hash").notNull().unique(),
  tonTransactionVerified: boolean("ton_transaction_verified").notNull().default(false),
  rewardsJson: text("rewards_json").notNull(), // JSON string of rewards granted
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("pack_purchases_user_idx").on(table.userId),
  packTypeIdx: index("pack_purchases_type_idx").on(table.packType),
  userPackUnique: unique().on(table.userId, table.packType), // One purchase per pack type per user
}));

// Prestige System
export const userPrestige = pgTable("user_prestige", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }).unique(),
  prestigeLevel: integer("prestige_level").notNull().default(0),
  totalPrestiges: integer("total_prestiges").notNull().default(0),
  lastPrestigeAt: timestamp("last_prestige_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userPrestigeIdx: index("user_prestige_user_idx").on(table.userId),
}));

export const prestigeHistory = pgTable("prestige_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  fromLevel: integer("from_level").notNull(),
  toLevel: integer("to_level").notNull(),
  csBalanceReset: real("cs_balance_reset").notNull(),
  equipmentReset: text("equipment_reset"), // JSON of equipment that was reset
  prestigedAt: timestamp("prestiged_at").notNull().defaultNow(),
}, (table) => ({
  userHistoryIdx: index("prestige_history_user_idx").on(table.userId),
}));



// Subscriptions
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }).unique(),
  subscriptionType: text("subscription_type").notNull(), // monthly, lifetime
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").notNull().default(true),
  tonTransactionHash: text("ton_transaction_hash"),
  autoRenew: boolean("auto_renew").notNull().default(false),
}, (table) => ({
  userSubscriptionIdx: index("user_subscriptions_user_idx").on(table.userId),
}));

// User Statistics Enhancement
export const userStatistics = pgTable("user_statistics", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }).unique(),
  totalCsEarned: real("total_cs_earned").notNull().default(0),
  totalChstEarned: real("total_chst_earned").notNull().default(0),
  totalBlocksMined: integer("total_blocks_mined").notNull().default(0),
  bestBlockReward: real("best_block_reward").notNull().default(0),
  highestHashrate: real("highest_hashrate").notNull().default(0),
  totalTonSpent: decimal("total_ton_spent", { precision: 10, scale: 2 }).notNull().default('0'),
  totalCsSpent: real("total_cs_spent").notNull().default(0),
  totalReferrals: integer("total_referrals").notNull().default(0),
  achievementsUnlocked: integer("achievements_unlocked").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userStatsIdx: index("user_statistics_user_idx").on(table.userId),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  referralCode: true,
  csBalance: true,
  chstBalance: true,
  totalHashrate: true,
});

export const insertEquipmentTypeSchema = createInsertSchema(equipmentTypes);

export const insertOwnedEquipmentSchema = createInsertSchema(ownedEquipment).omit({
  id: true,
  purchasedAt: true,
  currentHashrate: true,
  quantity: true,
  upgradeLevel: true,
});

export const insertComponentUpgradeSchema = createInsertSchema(componentUpgrades).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserTaskSchema = createInsertSchema(userTasks).omit({
  id: true,
  claimedAt: true,
});

export const insertDailyClaimSchema = createInsertSchema(dailyClaims).omit({
  id: true,
  updatedAt: true,
});

export const insertPowerUpPurchaseSchema = createInsertSchema(powerUpPurchases).omit({
  id: true,
  purchasedAt: true,
});

export const insertLootBoxPurchaseSchema = createInsertSchema(lootBoxPurchases).omit({
  id: true,
  purchasedAt: true,
});

export const insertActivePowerUpSchema = createInsertSchema(activePowerUps).omit({
  id: true,
  activatedAt: true,
});

export const insertBlockSchema = createInsertSchema(blocks).omit({
  id: true,
  timestamp: true,
});

export const insertBlockRewardSchema = createInsertSchema(blockRewards).omit({
  id: true,
  createdAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
});

export const insertGameSettingSchema = createInsertSchema(gameSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type EquipmentType = typeof equipmentTypes.$inferSelect;
export type InsertEquipmentType = z.infer<typeof insertEquipmentTypeSchema>;

export type OwnedEquipment = typeof ownedEquipment.$inferSelect;
export type InsertOwnedEquipment = z.infer<typeof insertOwnedEquipmentSchema>;

export type Block = typeof blocks.$inferSelect;
export type InsertBlock = z.infer<typeof insertBlockSchema>;

export type BlockReward = typeof blockRewards.$inferSelect;
export type InsertBlockReward = z.infer<typeof insertBlockRewardSchema>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type GameSetting = typeof gameSettings.$inferSelect;
export type InsertGameSetting = z.infer<typeof insertGameSettingSchema>;

export type ComponentUpgrade = typeof componentUpgrades.$inferSelect;
export type InsertComponentUpgrade = z.infer<typeof insertComponentUpgradeSchema>;

export type UserTask = typeof userTasks.$inferSelect;
export type InsertUserTask = z.infer<typeof insertUserTaskSchema>;

export type DailyClaim = typeof dailyClaims.$inferSelect;
export type InsertDailyClaim = z.infer<typeof insertDailyClaimSchema>;

export type PowerUpPurchase = typeof powerUpPurchases.$inferSelect;
export type InsertPowerUpPurchase = z.infer<typeof insertPowerUpPurchaseSchema>;

export type LootBoxPurchase = typeof lootBoxPurchases.$inferSelect;
export type InsertLootBoxPurchase = z.infer<typeof insertLootBoxPurchaseSchema>;

export type ActivePowerUp = typeof activePowerUps.$inferSelect;
export type InsertActivePowerUp = z.infer<typeof insertActivePowerUpSchema>;

// Daily Challenges schemas and types
export const insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({ id: true });
export const insertUserDailyChallengeSchema = createInsertSchema(userDailyChallenges).omit({ id: true, completedAt: true });

export type DailyChallenge = typeof dailyChallenges.$inferSelect;
export type InsertDailyChallenge = z.infer<typeof insertDailyChallengeSchema>;
export type UserDailyChallenge = typeof userDailyChallenges.$inferSelect;
export type InsertUserDailyChallenge = z.infer<typeof insertUserDailyChallengeSchema>;

// Achievement schemas and types
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true, unlockedAt: true });

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

// Season schemas and types
export const insertSeasonSchema = createInsertSchema(seasons).omit({ id: true });

export type Season = typeof seasons.$inferSelect;
export type InsertSeason = z.infer<typeof insertSeasonSchema>;

// Cosmetic schemas and types
export const insertCosmeticItemSchema = createInsertSchema(cosmeticItems).omit({ id: true });
export const insertUserCosmeticSchema = createInsertSchema(userCosmetics).omit({ id: true, purchasedAt: true });

export type CosmeticItem = typeof cosmeticItems.$inferSelect;
export type InsertCosmeticItem = z.infer<typeof insertCosmeticItemSchema>;
export type UserCosmetic = typeof userCosmetics.$inferSelect;
export type InsertUserCosmetic = z.infer<typeof insertUserCosmeticSchema>;

// Streak schemas and types
export const insertUserStreakSchema = createInsertSchema(userStreaks).omit({ id: true, updatedAt: true });

export type UserStreak = typeof userStreaks.$inferSelect;
export type InsertUserStreak = z.infer<typeof insertUserStreakSchema>;

// Hourly bonus schemas and types
export const insertUserHourlyBonusSchema = createInsertSchema(userHourlyBonuses).omit({ id: true, claimedAt: true });

export type UserHourlyBonus = typeof userHourlyBonuses.$inferSelect;
export type InsertUserHourlyBonus = z.infer<typeof insertUserHourlyBonusSchema>;

// Spin schemas and types
export const insertUserSpinSchema = createInsertSchema(userSpins).omit({ id: true, lastSpinAt: true });
export const insertSpinHistorySchema = createInsertSchema(spinHistory).omit({ id: true, spunAt: true });

export type UserSpin = typeof userSpins.$inferSelect;
export type InsertUserSpin = z.infer<typeof insertUserSpinSchema>;
export type SpinHistory = typeof spinHistory.$inferSelect;
export type InsertSpinHistory = z.infer<typeof insertSpinHistorySchema>;

// Jackpot wins schemas and types
export const insertJackpotWinSchema = createInsertSchema(jackpotWins).omit({ id: true, wonAt: true });

export type JackpotWin = typeof jackpotWins.$inferSelect;
export type InsertJackpotWin = z.infer<typeof insertJackpotWinSchema>;

// Equipment Preset schemas and types
export const insertEquipmentPresetSchema = createInsertSchema(equipmentPresets).omit({ id: true, createdAt: true, updatedAt: true });

export type EquipmentPreset = typeof equipmentPresets.$inferSelect;
export type InsertEquipmentPreset = z.infer<typeof insertEquipmentPresetSchema>;

// Price Alert schemas and types
export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({ id: true, createdAt: true, triggeredAt: true });

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;


// Auto-Upgrade Settings schemas and types
export const insertAutoUpgradeSettingSchema = createInsertSchema(autoUpgradeSettings).omit({ id: true, createdAt: true, updatedAt: true });

export type AutoUpgradeSetting = typeof autoUpgradeSettings.$inferSelect;
export type InsertAutoUpgradeSetting = z.infer<typeof insertAutoUpgradeSettingSchema>;


// Pack Purchase schemas and types
export const insertPackPurchaseSchema = createInsertSchema(packPurchases).omit({ id: true, purchasedAt: true });

export type PackPurchase = typeof packPurchases.$inferSelect;
export type InsertPackPurchase = z.infer<typeof insertPackPurchaseSchema>;

// Prestige schemas and types
export const insertUserPrestigeSchema = createInsertSchema(userPrestige).omit({ id: true, createdAt: true });
export const insertPrestigeHistorySchema = createInsertSchema(prestigeHistory).omit({ id: true, prestigedAt: true });

export type UserPrestige = typeof userPrestige.$inferSelect;
export type InsertUserPrestige = z.infer<typeof insertUserPrestigeSchema>;
export type PrestigeHistory = typeof prestigeHistory.$inferSelect;
export type InsertPrestigeHistory = z.infer<typeof insertPrestigeHistorySchema>;


// Subscription schemas and types
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({ id: true, startDate: true });

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;

// Statistics schemas and types
export const insertUserStatisticsSchema = createInsertSchema(userStatistics).omit({ id: true, createdAt: true, updatedAt: true });

export type UserStatistics = typeof userStatistics.$inferSelect;
export type InsertUserStatistics = z.infer<typeof insertUserStatisticsSchema>;
