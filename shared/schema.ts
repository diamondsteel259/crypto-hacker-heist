import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, real, timestamp, boolean, unique, decimal, index, serial, date } from "drizzle-orm/pg-core";
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
  tutorialCompleted: boolean("tutorial_completed").notNull().default(false),
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

export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  featureKey: text("feature_key").notNull().unique(), // blocks, leaderboard, challenges, etc.
  featureName: text("feature_name").notNull(), // Display name
  isEnabled: boolean("is_enabled").notNull().default(true),
  description: text("description"), // What this feature does
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: text("updated_by"), // Admin user ID who made the change
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
  activatedAt: timestamp("activated_at").notNull(),
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

// Daily Login Rewards
export const dailyLoginRewards = pgTable("daily_login_rewards", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  loginDate: text("login_date").notNull(), // YYYY-MM-DD format
  streakDay: integer("streak_day").notNull(), // Which day of the streak (1-7+)
  rewardCs: integer("reward_cs").notNull().default(0),
  rewardChst: integer("reward_chst").notNull().default(0),
  rewardItem: text("reward_item"), // Special item on day 7
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
}, (table) => ({
  userDateUnique: unique().on(table.userId, table.loginDate),
  userLoginRewardIdx: index("daily_login_rewards_user_idx").on(table.userId, table.loginDate),
}));

// Flash Sales
export const flashSales = pgTable("flash_sales", {
  id: serial("id").primaryKey(),
  equipmentId: text("equipment_id").notNull().references(() => equipmentTypes.id),
  discountPercentage: integer("discount_percentage").notNull(), // 10-50%
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  equipmentIdx: index("flash_sales_equipment_idx").on(table.equipmentId),
  activeIdx: index("flash_sales_active_idx").on(table.isActive, table.endTime),
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

// Announcements System
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'info', 'warning', 'success', 'event', 'maintenance'
  priority: text("priority").notNull().default('normal'), // 'low', 'normal', 'high', 'critical'
  targetAudience: text("target_audience").notNull().default('all'), // 'all', 'active', 'whales', 'new_users', 'at_risk'
  scheduledFor: timestamp("scheduled_for"), // null = send immediately
  expiresAt: timestamp("expires_at"), // null = doesn't expire
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: text("created_by").notNull().references(() => users.telegramId),
  sentAt: timestamp("sent_at"),
  isActive: boolean("is_active").notNull().default(true),
  totalRecipients: integer("total_recipients").notNull().default(0),
  readCount: integer("read_count").notNull().default(0),
}, (table) => ({
  activeIdx: index("announcements_active_idx").on(table.isActive, table.scheduledFor),
  createdByIdx: index("announcements_created_by_idx").on(table.createdBy),
}));

export const userAnnouncements = pgTable("user_announcements", {
  id: serial("id").primaryKey(),
  announcementId: integer("announcement_id").notNull().references(() => announcements.id, { onDelete: 'cascade' }),
  telegramId: text("telegram_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  readAt: timestamp("read_at").notNull().defaultNow(),
}, (table) => ({
  userAnnouncementUnique: unique().on(table.announcementId, table.telegramId),
  userAnnouncementIdx: index("user_announcements_user_idx").on(table.telegramId),
  announcementIdx: index("user_announcements_announcement_idx").on(table.announcementId),
}));

// Promo Code System
export const promoCodes = pgTable("promo_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  rewardType: text("reward_type").notNull(), // 'cs', 'ton', 'equipment', 'powerup', 'lootbox', 'bundle'
  rewardAmount: decimal("reward_amount", { precision: 20, scale: 2 }),
  rewardData: text("reward_data"), // JSON for complex rewards (equipment ID, etc.)
  maxUses: integer("max_uses"), // null = unlimited
  currentUses: integer("current_uses").notNull().default(0),
  maxUsesPerUser: integer("max_uses_per_user").notNull().default(1),
  validFrom: timestamp("valid_from").notNull().defaultNow(),
  validUntil: timestamp("valid_until"), // null = never expires
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: text("created_by").notNull().references(() => users.telegramId),
  targetSegment: text("target_segment").notNull().default('all'), // 'all', 'new_users', 'returning_users'
}, (table) => ({
  codeIdx: index("promo_codes_code_idx").on(table.code),
  activeIdx: index("promo_codes_active_idx").on(table.isActive, table.validUntil),
  createdByIdx: index("promo_codes_created_by_idx").on(table.createdBy),
}));

export const promoCodeRedemptions = pgTable("promo_code_redemptions", {
  id: serial("id").primaryKey(),
  promoCodeId: integer("promo_code_id").notNull().references(() => promoCodes.id, { onDelete: 'cascade' }),
  telegramId: text("telegram_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
  rewardGiven: text("reward_given").notNull(), // JSON of what they received
  ipAddress: varchar("ip_address", { length: 45 }),
}, (table) => ({
  userPromoUnique: unique().on(table.promoCodeId, table.telegramId),
  userIdx: index("promo_code_redemptions_user_idx").on(table.telegramId),
  promoIdx: index("promo_code_redemptions_promo_idx").on(table.promoCodeId),
}));

// Analytics System
export const dailyAnalytics = pgTable("daily_analytics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  dau: integer("dau").notNull().default(0), // Daily Active Users
  newUsers: integer("new_users").notNull().default(0), // New signups
  returningUsers: integer("returning_users").notNull().default(0), // Users who came back
  totalUsers: integer("total_users").notNull().default(0), // Cumulative
  totalCsGenerated: decimal("total_cs_generated", { precision: 20, scale: 2 }).notNull().default('0'),
  totalCsSpent: decimal("total_cs_spent", { precision: 20, scale: 2 }).notNull().default('0'),
  totalTonSpent: decimal("total_ton_spent", { precision: 10, scale: 6 }).notNull().default('0'),
  totalBlocks: integer("total_blocks").notNull().default(0),
  avgSessionDuration: integer("avg_session_duration").notNull().default(0), // seconds
  avgCsPerUser: decimal("avg_cs_per_user", { precision: 15, scale: 2 }).notNull().default('0'),
  totalPowerUpPurchases: integer("total_power_up_purchases").notNull().default(0),
  totalLootBoxPurchases: integer("total_loot_box_purchases").notNull().default(0),
  totalPackPurchases: integer("total_pack_purchases").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("daily_analytics_date_idx").on(table.date),
}));

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  endedAt: timestamp("ended_at"),
  durationSeconds: integer("duration_seconds"),
  actionsPerformed: integer("actions_performed").notNull().default(0),
}, (table) => ({
  userSessionIdx: index("user_sessions_user_idx").on(table.telegramId, table.startedAt),
  startedAtIdx: index("user_sessions_started_at_idx").on(table.startedAt),
}));

export const retentionCohorts = pgTable("retention_cohorts", {
  id: serial("id").primaryKey(),
  cohortDate: date("cohort_date").notNull().unique(), // Signup date
  day0: integer("day0").notNull().default(0), // Users who signed up
  day1: integer("day1").notNull().default(0), // Came back day 1
  day3: integer("day3").notNull().default(0), // Came back day 3
  day7: integer("day7").notNull().default(0), // Came back day 7
  day14: integer("day14").notNull().default(0),
  day30: integer("day30").notNull().default(0),
}, (table) => ({
  cohortDateIdx: index("retention_cohorts_date_idx").on(table.cohortDate),
}));

// Event Scheduler System
export const scheduledEvents = pgTable("scheduled_events", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(), // 'multiplier', 'flash_sale', 'community_goal', 'tournament', 'custom'
  eventData: text("event_data").notNull(), // JSON string with type-specific config
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(false), // Auto-toggled by cron
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurrenceRule: varchar("recurrence_rule", { length: 100 }), // 'DAILY', 'WEEKLY_FRI', 'MONTHLY_1ST'
  priority: integer("priority").notNull().default(0), // For UI sorting
  bannerImage: text("banner_image"), // URL or base64
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: text("created_by").notNull().references(() => users.telegramId),
  announcementSent: boolean("announcement_sent").notNull().default(false),
}, (table) => ({
  activeIdx: index("scheduled_events_active_idx").on(table.isActive),
  startTimeIdx: index("scheduled_events_start_time_idx").on(table.startTime),
  endTimeIdx: index("scheduled_events_end_time_idx").on(table.endTime),
  eventTypeIdx: index("scheduled_events_type_idx").on(table.eventType),
}));

export const eventParticipation = pgTable("event_participation", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => scheduledEvents.id, { onDelete: 'cascade' }),
  telegramId: text("telegram_id").notNull().references(() => users.telegramId, { onDelete: 'cascade' }),
  contribution: decimal("contribution", { precision: 20, scale: 2 }).notNull().default('0'), // For community goals
  rank: integer("rank"), // For tournaments
  rewardClaimed: boolean("reward_claimed").notNull().default(false),
  participatedAt: timestamp("participated_at").notNull().defaultNow(),
}, (table) => ({
  userEventUnique: unique().on(table.eventId, table.telegramId),
  eventIdx: index("event_participation_event_idx").on(table.eventId),
  userIdx: index("event_participation_user_idx").on(table.telegramId),
}));

// Economy Dashboard System
export const economyMetrics = pgTable("economy_metrics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  totalCsInCirculation: decimal("total_cs_in_circulation", { precision: 20, scale: 2 }).notNull().default('0'),
  totalCsGenerated: decimal("total_cs_generated", { precision: 20, scale: 2 }).notNull().default('0'), // All-time cumulative
  csGeneratedToday: decimal("cs_generated_today", { precision: 20, scale: 2 }).notNull().default('0'), // Daily generation
  csSpentToday: decimal("cs_spent_today", { precision: 20, scale: 2 }).notNull().default('0'), // Daily spending
  netCsChange: decimal("net_cs_change", { precision: 20, scale: 2 }).notNull().default('0'), // Generated - Spent
  inflationRatePercent: decimal("inflation_rate_percent", { precision: 10, scale: 4 }).notNull().default('0'), // (Today Gen / Total Circ) * 100
  avgBalancePerUser: decimal("avg_balance_per_user", { precision: 15, scale: 2 }).notNull().default('0'),
  medianBalance: decimal("median_balance", { precision: 15, scale: 2 }).notNull().default('0'),
  top1PercentOwnership: decimal("top1_percent_ownership", { precision: 10, scale: 2 }).notNull().default('0'), // % of total CS held by top 1%
  top10PercentOwnership: decimal("top10_percent_ownership", { precision: 10, scale: 2 }).notNull().default('0'),
  giniCoefficient: decimal("gini_coefficient", { precision: 5, scale: 4 }).notNull().default('0'), // Wealth inequality (0=equal, 1=one person has all)
  activeWallets: integer("active_wallets").notNull().default(0), // Users with balance > 0
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("economy_metrics_date_idx").on(table.date),
}));

export const economySinks = pgTable("economy_sinks", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  sinkType: text("sink_type").notNull(), // 'equipment', 'powerups', 'lootboxes', 'packs', 'upgrades', 'cosmetics', 'other'
  csSpent: decimal("cs_spent", { precision: 20, scale: 2 }).notNull().default('0'),
  transactionCount: integer("transaction_count").notNull().default(0),
}, (table) => ({
  dateSinkIdx: index("economy_sinks_date_sink_idx").on(table.date, table.sinkType),
}));

export const economyAlerts = pgTable("economy_alerts", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  alertType: text("alert_type").notNull(), // 'high_inflation', 'negative_sinks', 'wealth_concentration', 'deflation'
  severity: text("severity").notNull(), // 'info', 'warning', 'critical'
  message: text("message").notNull(),
  metric: text("metric"), // JSON of relevant data
  acknowledged: boolean("acknowledged").notNull().default(false),
  acknowledgedBy: text("acknowledged_by").references(() => users.telegramId),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  dateIdx: index("economy_alerts_date_idx").on(table.date),
  acknowledgedIdx: index("economy_alerts_acknowledged_idx").on(table.acknowledged),
}));

// User Segmentation System
export const userSegments = pgTable("user_segments", {
  id: serial("id").primaryKey(),
  telegramId: text("telegram_id").notNull().unique().references(() => users.telegramId, { onDelete: 'cascade' }),
  segment: text("segment").notNull(), // 'whale', 'dolphin', 'minnow', 'new_user', 'active', 'at_risk', 'churned', 'returning'
  lifetimeValue: decimal("lifetime_value", { precision: 15, scale: 2 }).notNull().default('0'), // Total TON spent
  lastActiveAt: timestamp("last_active_at"),
  daysSinceLastActive: integer("days_since_last_active").notNull().default(0),
  totalSessions: integer("total_sessions").notNull().default(0),
  avgSessionDuration: integer("avg_session_duration").notNull().default(0), // seconds
  retentionD7: boolean("retention_d7").notNull().default(false), // Came back after 7 days
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  telegramIdIdx: index("user_segments_telegram_id_idx").on(table.telegramId),
  segmentIdx: index("user_segments_segment_idx").on(table.segment),
}));

export const segmentTargetedOffers = pgTable("segment_targeted_offers", {
  id: serial("id").primaryKey(),
  targetSegment: text("target_segment").notNull(), // 'whale', 'dolphin', 'minnow', 'new_user', 'at_risk', 'churned', 'returning'
  offerType: text("offer_type").notNull(), // 'promo_code', 'flash_sale', 'bonus_cs', 'exclusive_equipment'
  offerData: text("offer_data").notNull(), // JSON with offer details
  validFrom: timestamp("valid_from").notNull().defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: text("created_by").notNull().references(() => users.telegramId),
}, (table) => ({
  segmentIdx: index("segment_targeted_offers_segment_idx").on(table.targetSegment),
  activeIdx: index("segment_targeted_offers_active_idx").on(table.isActive),
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

// Daily Login Rewards schemas and types
export const insertDailyLoginRewardSchema = createInsertSchema(dailyLoginRewards).omit({ id: true, claimedAt: true });

export type DailyLoginReward = typeof dailyLoginRewards.$inferSelect;
export type InsertDailyLoginReward = z.infer<typeof insertDailyLoginRewardSchema>;

// Flash Sales schemas and types
export const insertFlashSaleSchema = createInsertSchema(flashSales).omit({ id: true, createdAt: true });

export type FlashSale = typeof flashSales.$inferSelect;
export type InsertFlashSale = z.infer<typeof insertFlashSaleSchema>;

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

// Feature Flags schemas and types
export const insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({ id: true, updatedAt: true });

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = z.infer<typeof insertFeatureFlagSchema>;

// Announcements schemas and types
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true, sentAt: true });
export const insertUserAnnouncementSchema = createInsertSchema(userAnnouncements).omit({ id: true, readAt: true });

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type UserAnnouncement = typeof userAnnouncements.$inferSelect;
export type InsertUserAnnouncement = z.infer<typeof insertUserAnnouncementSchema>;

// Promo Codes schemas and types
export const insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true, createdAt: true, currentUses: true });
export const insertPromoCodeRedemptionSchema = createInsertSchema(promoCodeRedemptions).omit({ id: true, redeemedAt: true });

export type PromoCode = typeof promoCodes.$inferSelect;
export type InsertPromoCode = z.infer<typeof insertPromoCodeSchema>;
export type PromoCodeRedemption = typeof promoCodeRedemptions.$inferSelect;
export type InsertPromoCodeRedemption = z.infer<typeof insertPromoCodeRedemptionSchema>;

// Analytics schemas and types
export const insertDailyAnalyticsSchema = createInsertSchema(dailyAnalytics).omit({ id: true, createdAt: true });
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true, startedAt: true });
export const insertRetentionCohortSchema = createInsertSchema(retentionCohorts).omit({ id: true });

export type DailyAnalytics = typeof dailyAnalytics.$inferSelect;
export type InsertDailyAnalytics = z.infer<typeof insertDailyAnalyticsSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type RetentionCohort = typeof retentionCohorts.$inferSelect;
export type InsertRetentionCohort = z.infer<typeof insertRetentionCohortSchema>;

// Event Scheduler schemas and types
export const insertScheduledEventSchema = createInsertSchema(scheduledEvents).omit({ id: true, createdAt: true });
export const insertEventParticipationSchema = createInsertSchema(eventParticipation).omit({ id: true, participatedAt: true });

export type ScheduledEvent = typeof scheduledEvents.$inferSelect;
export type InsertScheduledEvent = z.infer<typeof insertScheduledEventSchema>;
export type EventParticipation = typeof eventParticipation.$inferSelect;
export type InsertEventParticipation = z.infer<typeof insertEventParticipationSchema>;

// Economy Dashboard schemas and types
export const insertEconomyMetricsSchema = createInsertSchema(economyMetrics).omit({ id: true, createdAt: true });
export const insertEconomySinksSchema = createInsertSchema(economySinks).omit({ id: true });
export const insertEconomyAlertsSchema = createInsertSchema(economyAlerts).omit({ id: true, createdAt: true });

export type EconomyMetrics = typeof economyMetrics.$inferSelect;
export type InsertEconomyMetrics = z.infer<typeof insertEconomyMetricsSchema>;
export type EconomySinks = typeof economySinks.$inferSelect;
export type InsertEconomySinks = z.infer<typeof insertEconomySinksSchema>;
export type EconomyAlerts = typeof economyAlerts.$inferSelect;
export type InsertEconomyAlerts = z.infer<typeof insertEconomyAlertsSchema>;

// User Segmentation schemas and types
export const insertUserSegmentSchema = createInsertSchema(userSegments).omit({ id: true, updatedAt: true });
export const insertSegmentTargetedOfferSchema = createInsertSchema(segmentTargetedOffers).omit({ id: true, createdAt: true });

export type UserSegment = typeof userSegments.$inferSelect;
export type InsertUserSegment = z.infer<typeof insertUserSegmentSchema>;
export type SegmentTargetedOffer = typeof segmentTargetedOffers.$inferSelect;
export type InsertSegmentTargetedOffer = z.infer<typeof insertSegmentTargetedOfferSchema>;
