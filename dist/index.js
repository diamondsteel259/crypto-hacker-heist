var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  achievements: () => achievements,
  activePowerUps: () => activePowerUps,
  announcements: () => announcements,
  autoUpgradeSettings: () => autoUpgradeSettings,
  blockRewards: () => blockRewards,
  blocks: () => blocks,
  componentUpgrades: () => componentUpgrades,
  cosmeticItems: () => cosmeticItems,
  dailyAnalytics: () => dailyAnalytics,
  dailyChallenges: () => dailyChallenges,
  dailyClaims: () => dailyClaims,
  dailyLoginRewards: () => dailyLoginRewards,
  economyAlerts: () => economyAlerts,
  economyMetrics: () => economyMetrics,
  economySinks: () => economySinks,
  equipmentPresets: () => equipmentPresets,
  equipmentTypes: () => equipmentTypes,
  eventParticipation: () => eventParticipation,
  featureFlags: () => featureFlags,
  flashSales: () => flashSales,
  gameSettings: () => gameSettings,
  insertAchievementSchema: () => insertAchievementSchema,
  insertActivePowerUpSchema: () => insertActivePowerUpSchema,
  insertAnnouncementSchema: () => insertAnnouncementSchema,
  insertAutoUpgradeSettingSchema: () => insertAutoUpgradeSettingSchema,
  insertBlockRewardSchema: () => insertBlockRewardSchema,
  insertBlockSchema: () => insertBlockSchema,
  insertComponentUpgradeSchema: () => insertComponentUpgradeSchema,
  insertCosmeticItemSchema: () => insertCosmeticItemSchema,
  insertDailyAnalyticsSchema: () => insertDailyAnalyticsSchema,
  insertDailyChallengeSchema: () => insertDailyChallengeSchema,
  insertDailyClaimSchema: () => insertDailyClaimSchema,
  insertDailyLoginRewardSchema: () => insertDailyLoginRewardSchema,
  insertEconomyAlertsSchema: () => insertEconomyAlertsSchema,
  insertEconomyMetricsSchema: () => insertEconomyMetricsSchema,
  insertEconomySinksSchema: () => insertEconomySinksSchema,
  insertEquipmentPresetSchema: () => insertEquipmentPresetSchema,
  insertEquipmentTypeSchema: () => insertEquipmentTypeSchema,
  insertEventParticipationSchema: () => insertEventParticipationSchema,
  insertFeatureFlagSchema: () => insertFeatureFlagSchema,
  insertFlashSaleSchema: () => insertFlashSaleSchema,
  insertGameSettingSchema: () => insertGameSettingSchema,
  insertJackpotWinSchema: () => insertJackpotWinSchema,
  insertLootBoxPurchaseSchema: () => insertLootBoxPurchaseSchema,
  insertOwnedEquipmentSchema: () => insertOwnedEquipmentSchema,
  insertPackPurchaseSchema: () => insertPackPurchaseSchema,
  insertPowerUpPurchaseSchema: () => insertPowerUpPurchaseSchema,
  insertPrestigeHistorySchema: () => insertPrestigeHistorySchema,
  insertPriceAlertSchema: () => insertPriceAlertSchema,
  insertPromoCodeRedemptionSchema: () => insertPromoCodeRedemptionSchema,
  insertPromoCodeSchema: () => insertPromoCodeSchema,
  insertReferralSchema: () => insertReferralSchema,
  insertRetentionCohortSchema: () => insertRetentionCohortSchema,
  insertScheduledEventSchema: () => insertScheduledEventSchema,
  insertSeasonSchema: () => insertSeasonSchema,
  insertSegmentTargetedOfferSchema: () => insertSegmentTargetedOfferSchema,
  insertSpinHistorySchema: () => insertSpinHistorySchema,
  insertUserAchievementSchema: () => insertUserAchievementSchema,
  insertUserAnnouncementSchema: () => insertUserAnnouncementSchema,
  insertUserCosmeticSchema: () => insertUserCosmeticSchema,
  insertUserDailyChallengeSchema: () => insertUserDailyChallengeSchema,
  insertUserHourlyBonusSchema: () => insertUserHourlyBonusSchema,
  insertUserPrestigeSchema: () => insertUserPrestigeSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserSegmentSchema: () => insertUserSegmentSchema,
  insertUserSessionSchema: () => insertUserSessionSchema,
  insertUserSpinSchema: () => insertUserSpinSchema,
  insertUserStatisticsSchema: () => insertUserStatisticsSchema,
  insertUserStreakSchema: () => insertUserStreakSchema,
  insertUserSubscriptionSchema: () => insertUserSubscriptionSchema,
  insertUserTaskSchema: () => insertUserTaskSchema,
  jackpotWins: () => jackpotWins,
  lootBoxPurchases: () => lootBoxPurchases,
  ownedEquipment: () => ownedEquipment,
  packPurchases: () => packPurchases,
  powerUpPurchases: () => powerUpPurchases,
  prestigeHistory: () => prestigeHistory,
  priceAlerts: () => priceAlerts,
  promoCodeRedemptions: () => promoCodeRedemptions,
  promoCodes: () => promoCodes,
  referrals: () => referrals,
  retentionCohorts: () => retentionCohorts,
  scheduledEvents: () => scheduledEvents,
  seasons: () => seasons,
  segmentTargetedOffers: () => segmentTargetedOffers,
  spinHistory: () => spinHistory,
  userAchievements: () => userAchievements,
  userAnnouncements: () => userAnnouncements,
  userCosmetics: () => userCosmetics,
  userDailyChallenges: () => userDailyChallenges,
  userHourlyBonuses: () => userHourlyBonuses,
  userPrestige: () => userPrestige,
  userSegments: () => userSegments,
  userSessions: () => userSessions,
  userSpins: () => userSpins,
  userStatistics: () => userStatistics,
  userStreaks: () => userStreaks,
  userSubscriptions: () => userSubscriptions,
  userTasks: () => userTasks,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, real, timestamp, boolean, unique, decimal, index, serial, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users, gameSettings, featureFlags, equipmentTypes, ownedEquipment, blocks, blockRewards, referrals, componentUpgrades, userTasks, dailyClaims, powerUpPurchases, lootBoxPurchases, activePowerUps, dailyChallenges, userDailyChallenges, achievements, userAchievements, seasons, cosmeticItems, userCosmetics, userStreaks, dailyLoginRewards, flashSales, userHourlyBonuses, userSpins, spinHistory, jackpotWins, equipmentPresets, priceAlerts, autoUpgradeSettings, packPurchases, userPrestige, prestigeHistory, userSubscriptions, userStatistics, announcements, userAnnouncements, promoCodes, promoCodeRedemptions, dailyAnalytics, userSessions, retentionCohorts, scheduledEvents, eventParticipation, economyMetrics, economySinks, economyAlerts, userSegments, segmentTargetedOffers, insertUserSchema, insertEquipmentTypeSchema, insertOwnedEquipmentSchema, insertComponentUpgradeSchema, insertUserTaskSchema, insertDailyClaimSchema, insertPowerUpPurchaseSchema, insertLootBoxPurchaseSchema, insertActivePowerUpSchema, insertBlockSchema, insertBlockRewardSchema, insertReferralSchema, insertGameSettingSchema, insertDailyChallengeSchema, insertUserDailyChallengeSchema, insertAchievementSchema, insertUserAchievementSchema, insertSeasonSchema, insertCosmeticItemSchema, insertUserCosmeticSchema, insertUserStreakSchema, insertDailyLoginRewardSchema, insertFlashSaleSchema, insertUserHourlyBonusSchema, insertUserSpinSchema, insertSpinHistorySchema, insertJackpotWinSchema, insertEquipmentPresetSchema, insertPriceAlertSchema, insertAutoUpgradeSettingSchema, insertPackPurchaseSchema, insertUserPrestigeSchema, insertPrestigeHistorySchema, insertUserSubscriptionSchema, insertUserStatisticsSchema, insertFeatureFlagSchema, insertAnnouncementSchema, insertUserAnnouncementSchema, insertPromoCodeSchema, insertPromoCodeRedemptionSchema, insertDailyAnalyticsSchema, insertUserSessionSchema, insertRetentionCohortSchema, insertScheduledEventSchema, insertEventParticipationSchema, insertEconomyMetricsSchema, insertEconomySinksSchema, insertEconomyAlertsSchema, insertUserSegmentSchema, insertSegmentTargetedOfferSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
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
      freeLootBoxes: integer("free_loot_boxes").notNull().default(0),
      inviteLootBoxes: integer("invite_loot_boxes").notNull().default(0),
      isAdmin: boolean("is_admin").notNull().default(false),
      tutorialCompleted: boolean("tutorial_completed").notNull().default(false),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      referralCodeIdx: index("users_referral_code_idx").on(table.referralCode)
    }));
    gameSettings = pgTable("game_settings", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      key: text("key").notNull().unique(),
      value: text("value").notNull(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    });
    featureFlags = pgTable("feature_flags", {
      id: serial("id").primaryKey(),
      featureKey: text("feature_key").notNull().unique(),
      // blocks, leaderboard, challenges, etc.
      featureName: text("feature_name").notNull(),
      // Display name
      isEnabled: boolean("is_enabled").notNull().default(true),
      description: text("description"),
      // What this feature does
      updatedAt: timestamp("updated_at").notNull().defaultNow(),
      updatedBy: text("updated_by")
      // Admin user ID who made the change
    });
    equipmentTypes = pgTable("equipment_types", {
      id: varchar("id").primaryKey(),
      name: text("name").notNull(),
      tier: text("tier").notNull(),
      category: text("category").notNull(),
      baseHashrate: real("base_hashrate").notNull(),
      basePrice: real("base_price").notNull(),
      currency: text("currency").notNull(),
      maxOwned: integer("max_owned").notNull(),
      orderIndex: integer("order_index").notNull()
    });
    ownedEquipment = pgTable("owned_equipment", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      equipmentTypeId: varchar("equipment_type_id").notNull().references(() => equipmentTypes.id),
      quantity: integer("quantity").notNull().default(1),
      upgradeLevel: integer("upgrade_level").notNull().default(0),
      currentHashrate: real("current_hashrate").notNull(),
      purchasedAt: timestamp("purchased_at").notNull().defaultNow()
    }, (table) => ({
      userEquipmentUnique: unique().on(table.userId, table.equipmentTypeId),
      userIdx: index("owned_equipment_user_idx").on(table.userId),
      equipmentTypeIdx: index("owned_equipment_type_idx").on(table.equipmentTypeId)
    }));
    blocks = pgTable("blocks", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      blockNumber: integer("block_number").notNull().unique(),
      timestamp: timestamp("timestamp").notNull().defaultNow(),
      reward: real("reward").notNull(),
      totalHashrate: real("total_hashrate").notNull(),
      totalMiners: integer("total_miners").notNull(),
      difficulty: integer("difficulty").notNull()
    });
    blockRewards = pgTable("block_rewards", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      blockId: varchar("block_id").notNull().references(() => blocks.id),
      userId: varchar("user_id").notNull().references(() => users.id),
      hashrate: real("hashrate").notNull(),
      sharePercent: real("share_percent").notNull(),
      reward: real("reward").notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      userIdx: index("block_rewards_user_idx").on(table.userId),
      blockIdx: index("block_rewards_block_idx").on(table.blockId)
    }));
    referrals = pgTable("referrals", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      referrerId: varchar("referrer_id").notNull().references(() => users.id),
      refereeId: varchar("referee_id").notNull().references(() => users.id),
      bonusEarned: real("bonus_earned").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      referrerIdx: index("referrals_referrer_idx").on(table.referrerId),
      refereeIdx: index("referrals_referee_idx").on(table.refereeId)
    }));
    componentUpgrades = pgTable("component_upgrades", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      ownedEquipmentId: varchar("owned_equipment_id").notNull().references(() => ownedEquipment.id),
      componentType: text("component_type").notNull(),
      // RAM, CPU, Storage, GPU
      currentLevel: integer("current_level").notNull().default(0),
      maxLevel: integer("max_level").notNull().default(10),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => ({
      equipmentComponentUnique: unique().on(table.ownedEquipmentId, table.componentType),
      equipmentIdx: index("component_upgrades_equipment_idx").on(table.ownedEquipmentId)
    }));
    userTasks = pgTable("user_tasks", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      taskId: text("task_id").notNull(),
      claimedAt: timestamp("claimed_at").notNull().defaultNow(),
      rewardCs: integer("reward_cs").notNull(),
      rewardChst: integer("reward_chst").notNull()
    }, (table) => ({
      userTaskUnique: unique().on(table.userId, table.taskId),
      userTaskIdx: index("user_tasks_user_task_idx").on(table.userId, table.taskId)
    }));
    dailyClaims = pgTable("daily_claims", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      claimType: text("claim_type").notNull(),
      claimCount: integer("claim_count").notNull().default(0),
      lastClaimDate: text("last_claim_date").notNull(),
      userTimezoneOffset: integer("user_timezone_offset").notNull(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => ({
      userClaimUnique: unique().on(table.userId, table.claimType, table.lastClaimDate),
      userClaimIdx: index("daily_claims_user_idx").on(table.userId, table.claimType, table.lastClaimDate)
    }));
    powerUpPurchases = pgTable("power_up_purchases", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      powerUpType: text("power_up_type").notNull(),
      tonAmount: decimal("ton_amount", { precision: 10, scale: 2 }).notNull(),
      tonTransactionHash: text("ton_transaction_hash").notNull().unique(),
      tonTransactionVerified: boolean("ton_transaction_verified").notNull().default(false),
      rewardCs: integer("reward_cs"),
      rewardChst: integer("reward_chst"),
      purchasedAt: timestamp("purchased_at").notNull().defaultNow()
    }, (table) => ({
      userIdx: index("power_up_purchases_user_idx").on(table.userId),
      txHashIdx: index("power_up_purchases_tx_idx").on(table.tonTransactionHash)
    }));
    lootBoxPurchases = pgTable("loot_box_purchases", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      boxType: text("box_type").notNull(),
      tonAmount: decimal("ton_amount", { precision: 10, scale: 2 }).notNull(),
      tonTransactionHash: text("ton_transaction_hash").notNull().unique(),
      tonTransactionVerified: boolean("ton_transaction_verified").notNull().default(false),
      rewardsJson: text("rewards_json").notNull(),
      purchasedAt: timestamp("purchased_at").notNull().defaultNow()
    }, (table) => ({
      userIdx: index("loot_box_purchases_user_idx").on(table.userId),
      txHashIdx: index("loot_box_purchases_tx_idx").on(table.tonTransactionHash)
    }));
    activePowerUps = pgTable("active_power_ups", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      powerUpType: text("power_up_type").notNull(),
      boostPercentage: integer("boost_percentage").notNull(),
      activatedAt: timestamp("activated_at").notNull(),
      expiresAt: timestamp("expires_at").notNull(),
      isActive: boolean("is_active").notNull().default(true)
    }, (table) => ({
      userActiveIdx: index("active_power_ups_user_active_idx").on(table.userId, table.isActive, table.expiresAt)
    }));
    dailyChallenges = pgTable("daily_challenges", {
      id: serial("id").primaryKey(),
      challengeId: text("challenge_id").notNull().unique(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      requirement: text("requirement").notNull(),
      rewardCs: integer("reward_cs").notNull(),
      rewardChst: integer("reward_chst"),
      rewardItem: text("reward_item"),
      // Equipment or loot box ID
      isActive: boolean("is_active").notNull().default(true)
    });
    userDailyChallenges = pgTable("user_daily_challenges", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      challengeId: text("challenge_id").notNull(),
      completedDate: text("completed_date").notNull(),
      // YYYY-MM-DD format
      completedAt: timestamp("completed_at").notNull().defaultNow(),
      rewardClaimed: boolean("reward_claimed").notNull().default(true)
    }, (table) => ({
      userChallengeUnique: unique().on(table.userId, table.challengeId, table.completedDate),
      userChallengeIdx: index("user_daily_challenges_user_idx").on(table.userId, table.completedDate)
    }));
    achievements = pgTable("achievements", {
      id: serial("id").primaryKey(),
      achievementId: text("achievement_id").notNull().unique(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      requirement: text("requirement").notNull(),
      category: text("category").notNull(),
      // milestone, social, spending, mining
      rewardCs: integer("reward_cs"),
      rewardChst: integer("reward_chst"),
      rewardItem: text("reward_item"),
      badgeIcon: text("badge_icon"),
      isActive: boolean("is_active").notNull().default(true),
      orderIndex: integer("order_index").notNull().default(0)
    });
    userAchievements = pgTable("user_achievements", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      achievementId: text("achievement_id").notNull(),
      unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
      rewardClaimed: boolean("reward_claimed").notNull().default(true)
    }, (table) => ({
      userAchievementUnique: unique().on(table.userId, table.achievementId),
      userAchievementIdx: index("user_achievements_user_idx").on(table.userId)
    }));
    seasons = pgTable("seasons", {
      id: serial("id").primaryKey(),
      seasonId: text("season_id").notNull().unique(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      bonusMultiplier: real("bonus_multiplier").notNull().default(1),
      specialRewards: text("special_rewards"),
      // JSON string
      isActive: boolean("is_active").notNull().default(false)
    });
    cosmeticItems = pgTable("cosmetic_items", {
      id: serial("id").primaryKey(),
      itemId: text("item_id").notNull().unique(),
      name: text("name").notNull(),
      description: text("description"),
      category: text("category").notNull(),
      // background, nameColor, badge
      priceCs: integer("price_cs"),
      priceChst: integer("price_chst"),
      priceTon: decimal("price_ton", { precision: 10, scale: 2 }),
      imageUrl: text("image_url"),
      isAnimated: boolean("is_animated").notNull().default(false),
      isActive: boolean("is_active").notNull().default(true),
      orderIndex: integer("order_index").notNull().default(0)
    });
    userCosmetics = pgTable("user_cosmetics", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      cosmeticId: text("cosmetic_id").notNull(),
      purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
      isEquipped: boolean("is_equipped").notNull().default(false)
    }, (table) => ({
      userCosmeticUnique: unique().on(table.userId, table.cosmeticId),
      userCosmeticIdx: index("user_cosmetics_user_idx").on(table.userId)
    }));
    userStreaks = pgTable("user_streaks", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }).unique(),
      currentStreak: integer("current_streak").notNull().default(0),
      longestStreak: integer("longest_streak").notNull().default(0),
      lastLoginDate: text("last_login_date").notNull(),
      // YYYY-MM-DD format
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => ({
      userStreakIdx: index("user_streaks_user_idx").on(table.userId)
    }));
    dailyLoginRewards = pgTable("daily_login_rewards", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      loginDate: text("login_date").notNull(),
      // YYYY-MM-DD format
      streakDay: integer("streak_day").notNull(),
      // Which day of the streak (1-7+)
      rewardCs: integer("reward_cs").notNull().default(0),
      rewardChst: integer("reward_chst").notNull().default(0),
      rewardItem: text("reward_item"),
      // Special item on day 7
      claimedAt: timestamp("claimed_at").notNull().defaultNow()
    }, (table) => ({
      userDateUnique: unique().on(table.userId, table.loginDate),
      userLoginRewardIdx: index("daily_login_rewards_user_idx").on(table.userId, table.loginDate)
    }));
    flashSales = pgTable("flash_sales", {
      id: serial("id").primaryKey(),
      equipmentId: text("equipment_id").notNull().references(() => equipmentTypes.id),
      discountPercentage: integer("discount_percentage").notNull(),
      // 10-50%
      startTime: timestamp("start_time").notNull(),
      endTime: timestamp("end_time").notNull(),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      equipmentIdx: index("flash_sales_equipment_idx").on(table.equipmentId),
      activeIdx: index("flash_sales_active_idx").on(table.isActive, table.endTime)
    }));
    userHourlyBonuses = pgTable("user_hourly_bonuses", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      claimedAt: timestamp("claimed_at").notNull().defaultNow(),
      rewardAmount: integer("reward_amount").notNull()
    }, (table) => ({
      userHourlyIdx: index("user_hourly_bonuses_user_idx").on(table.userId, table.claimedAt)
    }));
    userSpins = pgTable("user_spins", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      spinDate: text("spin_date").notNull(),
      // YYYY-MM-DD format
      freeSpinUsed: boolean("free_spin_used").notNull().default(false),
      paidSpinsCount: integer("paid_spins_count").notNull().default(0),
      lastSpinAt: timestamp("last_spin_at").notNull().defaultNow()
    }, (table) => ({
      userSpinUnique: unique().on(table.userId, table.spinDate),
      userSpinIdx: index("user_spins_user_idx").on(table.userId, table.spinDate)
    }));
    spinHistory = pgTable("spin_history", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      prizeType: text("prize_type").notNull(),
      // cs, chst, equipment, powerup
      prizeValue: text("prize_value").notNull(),
      wasFree: boolean("was_free").notNull(),
      spunAt: timestamp("spun_at").notNull().defaultNow()
    }, (table) => ({
      userSpinHistoryIdx: index("spin_history_user_idx").on(table.userId)
    }));
    jackpotWins = pgTable("jackpot_wins", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      username: text("username").notNull(),
      walletAddress: text("wallet_address"),
      amount: text("amount").notNull().default("1.0"),
      // 1 TON jackpot
      wonAt: timestamp("won_at").notNull().defaultNow(),
      paidOut: boolean("paid_out").notNull().default(false),
      paidAt: timestamp("paid_at"),
      paidByAdmin: text("paid_by_admin"),
      notes: text("notes")
    }, (table) => ({
      userJackpotIdx: index("jackpot_wins_user_idx").on(table.userId),
      paidOutIdx: index("jackpot_wins_paid_out_idx").on(table.paidOut)
    }));
    equipmentPresets = pgTable("equipment_presets", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      presetName: text("preset_name").notNull(),
      equipmentSnapshot: text("equipment_snapshot").notNull(),
      // JSON string of equipment IDs
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => ({
      userPresetIdx: index("equipment_presets_user_idx").on(table.userId)
    }));
    priceAlerts = pgTable("price_alerts", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      equipmentTypeId: varchar("equipment_type_id").notNull().references(() => equipmentTypes.id),
      targetPrice: real("target_price").notNull(),
      triggered: boolean("triggered").notNull().default(false),
      triggeredAt: timestamp("triggered_at"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      userAlertIdx: index("price_alerts_user_idx").on(table.userId),
      userEquipmentAlertUnique: unique().on(table.userId, table.equipmentTypeId)
    }));
    autoUpgradeSettings = pgTable("auto_upgrade_settings", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      ownedEquipmentId: varchar("owned_equipment_id").notNull().references(() => ownedEquipment.id, { onDelete: "cascade" }),
      componentType: text("component_type").notNull(),
      // RAM, CPU, Storage, GPU
      targetLevel: integer("target_level").notNull(),
      enabled: boolean("enabled").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => ({
      userEquipmentComponentUnique: unique().on(table.ownedEquipmentId, table.componentType),
      userAutoUpgradeIdx: index("auto_upgrade_settings_user_idx").on(table.userId)
    }));
    packPurchases = pgTable("pack_purchases", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      packType: text("pack_type").notNull(),
      // starter, pro, whale
      tonAmount: decimal("ton_amount", { precision: 10, scale: 2 }).notNull(),
      tonTransactionHash: text("ton_transaction_hash").notNull().unique(),
      tonTransactionVerified: boolean("ton_transaction_verified").notNull().default(false),
      rewardsJson: text("rewards_json").notNull(),
      // JSON string of rewards granted
      purchasedAt: timestamp("purchased_at").notNull().defaultNow()
    }, (table) => ({
      userIdx: index("pack_purchases_user_idx").on(table.userId),
      packTypeIdx: index("pack_purchases_type_idx").on(table.packType),
      userPackUnique: unique().on(table.userId, table.packType)
      // One purchase per pack type per user
    }));
    userPrestige = pgTable("user_prestige", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }).unique(),
      prestigeLevel: integer("prestige_level").notNull().default(0),
      totalPrestiges: integer("total_prestiges").notNull().default(0),
      lastPrestigeAt: timestamp("last_prestige_at"),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      userPrestigeIdx: index("user_prestige_user_idx").on(table.userId)
    }));
    prestigeHistory = pgTable("prestige_history", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      fromLevel: integer("from_level").notNull(),
      toLevel: integer("to_level").notNull(),
      csBalanceReset: real("cs_balance_reset").notNull(),
      equipmentReset: text("equipment_reset"),
      // JSON of equipment that was reset
      prestigedAt: timestamp("prestiged_at").notNull().defaultNow()
    }, (table) => ({
      userHistoryIdx: index("prestige_history_user_idx").on(table.userId)
    }));
    userSubscriptions = pgTable("user_subscriptions", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }).unique(),
      subscriptionType: text("subscription_type").notNull(),
      // monthly, lifetime
      startDate: timestamp("start_date").notNull().defaultNow(),
      endDate: timestamp("end_date"),
      isActive: boolean("is_active").notNull().default(true),
      tonTransactionHash: text("ton_transaction_hash"),
      autoRenew: boolean("auto_renew").notNull().default(false)
    }, (table) => ({
      userSubscriptionIdx: index("user_subscriptions_user_idx").on(table.userId)
    }));
    userStatistics = pgTable("user_statistics", {
      id: serial("id").primaryKey(),
      userId: text("user_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }).unique(),
      totalCsEarned: real("total_cs_earned").notNull().default(0),
      totalChstEarned: real("total_chst_earned").notNull().default(0),
      totalBlocksMined: integer("total_blocks_mined").notNull().default(0),
      bestBlockReward: real("best_block_reward").notNull().default(0),
      highestHashrate: real("highest_hashrate").notNull().default(0),
      totalTonSpent: decimal("total_ton_spent", { precision: 10, scale: 2 }).notNull().default("0"),
      totalCsSpent: real("total_cs_spent").notNull().default(0),
      totalReferrals: integer("total_referrals").notNull().default(0),
      achievementsUnlocked: integer("achievements_unlocked").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => ({
      userStatsIdx: index("user_statistics_user_idx").on(table.userId)
    }));
    announcements = pgTable("announcements", {
      id: serial("id").primaryKey(),
      title: varchar("title", { length: 200 }).notNull(),
      message: text("message").notNull(),
      type: text("type").notNull(),
      // 'info', 'warning', 'success', 'event', 'maintenance'
      priority: text("priority").notNull().default("normal"),
      // 'low', 'normal', 'high', 'critical'
      targetAudience: text("target_audience").notNull().default("all"),
      // 'all', 'active', 'whales', 'new_users', 'at_risk'
      scheduledFor: timestamp("scheduled_for"),
      // null = send immediately
      expiresAt: timestamp("expires_at"),
      // null = doesn't expire
      createdAt: timestamp("created_at").notNull().defaultNow(),
      createdBy: text("created_by").notNull().references(() => users.telegramId),
      sentAt: timestamp("sent_at"),
      isActive: boolean("is_active").notNull().default(true),
      totalRecipients: integer("total_recipients").notNull().default(0),
      readCount: integer("read_count").notNull().default(0)
    }, (table) => ({
      activeIdx: index("announcements_active_idx").on(table.isActive, table.scheduledFor),
      createdByIdx: index("announcements_created_by_idx").on(table.createdBy)
    }));
    userAnnouncements = pgTable("user_announcements", {
      id: serial("id").primaryKey(),
      announcementId: integer("announcement_id").notNull().references(() => announcements.id, { onDelete: "cascade" }),
      telegramId: text("telegram_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      readAt: timestamp("read_at").notNull().defaultNow()
    }, (table) => ({
      userAnnouncementUnique: unique().on(table.announcementId, table.telegramId),
      userAnnouncementIdx: index("user_announcements_user_idx").on(table.telegramId),
      announcementIdx: index("user_announcements_announcement_idx").on(table.announcementId)
    }));
    promoCodes = pgTable("promo_codes", {
      id: serial("id").primaryKey(),
      code: varchar("code", { length: 50 }).notNull().unique(),
      description: text("description"),
      rewardType: text("reward_type").notNull(),
      // 'cs', 'ton', 'equipment', 'powerup', 'lootbox', 'bundle'
      rewardAmount: decimal("reward_amount", { precision: 20, scale: 2 }),
      rewardData: text("reward_data"),
      // JSON for complex rewards (equipment ID, etc.)
      maxUses: integer("max_uses"),
      // null = unlimited
      currentUses: integer("current_uses").notNull().default(0),
      maxUsesPerUser: integer("max_uses_per_user").notNull().default(1),
      validFrom: timestamp("valid_from").notNull().defaultNow(),
      validUntil: timestamp("valid_until"),
      // null = never expires
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      createdBy: text("created_by").notNull().references(() => users.telegramId),
      targetSegment: text("target_segment").notNull().default("all")
      // 'all', 'new_users', 'returning_users'
    }, (table) => ({
      codeIdx: index("promo_codes_code_idx").on(table.code),
      activeIdx: index("promo_codes_active_idx").on(table.isActive, table.validUntil),
      createdByIdx: index("promo_codes_created_by_idx").on(table.createdBy)
    }));
    promoCodeRedemptions = pgTable("promo_code_redemptions", {
      id: serial("id").primaryKey(),
      promoCodeId: integer("promo_code_id").notNull().references(() => promoCodes.id, { onDelete: "cascade" }),
      telegramId: text("telegram_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      redeemedAt: timestamp("redeemed_at").notNull().defaultNow(),
      rewardGiven: text("reward_given").notNull(),
      // JSON of what they received
      ipAddress: varchar("ip_address", { length: 45 })
    }, (table) => ({
      userPromoUnique: unique().on(table.promoCodeId, table.telegramId),
      userIdx: index("promo_code_redemptions_user_idx").on(table.telegramId),
      promoIdx: index("promo_code_redemptions_promo_idx").on(table.promoCodeId)
    }));
    dailyAnalytics = pgTable("daily_analytics", {
      id: serial("id").primaryKey(),
      date: date("date").notNull().unique(),
      dau: integer("dau").notNull().default(0),
      // Daily Active Users
      newUsers: integer("new_users").notNull().default(0),
      // New signups
      returningUsers: integer("returning_users").notNull().default(0),
      // Users who came back
      totalUsers: integer("total_users").notNull().default(0),
      // Cumulative
      totalCsGenerated: decimal("total_cs_generated", { precision: 20, scale: 2 }).notNull().default("0"),
      totalCsSpent: decimal("total_cs_spent", { precision: 20, scale: 2 }).notNull().default("0"),
      totalTonSpent: decimal("total_ton_spent", { precision: 10, scale: 6 }).notNull().default("0"),
      totalBlocks: integer("total_blocks").notNull().default(0),
      avgSessionDuration: integer("avg_session_duration").notNull().default(0),
      // seconds
      avgCsPerUser: decimal("avg_cs_per_user", { precision: 15, scale: 2 }).notNull().default("0"),
      totalPowerUpPurchases: integer("total_power_up_purchases").notNull().default(0),
      totalLootBoxPurchases: integer("total_loot_box_purchases").notNull().default(0),
      totalPackPurchases: integer("total_pack_purchases").notNull().default(0),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      dateIdx: index("daily_analytics_date_idx").on(table.date)
    }));
    userSessions = pgTable("user_sessions", {
      id: serial("id").primaryKey(),
      telegramId: text("telegram_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      startedAt: timestamp("started_at").notNull().defaultNow(),
      endedAt: timestamp("ended_at"),
      durationSeconds: integer("duration_seconds"),
      actionsPerformed: integer("actions_performed").notNull().default(0)
    }, (table) => ({
      userSessionIdx: index("user_sessions_user_idx").on(table.telegramId, table.startedAt),
      startedAtIdx: index("user_sessions_started_at_idx").on(table.startedAt)
    }));
    retentionCohorts = pgTable("retention_cohorts", {
      id: serial("id").primaryKey(),
      cohortDate: date("cohort_date").notNull().unique(),
      // Signup date
      day0: integer("day0").notNull().default(0),
      // Users who signed up
      day1: integer("day1").notNull().default(0),
      // Came back day 1
      day3: integer("day3").notNull().default(0),
      // Came back day 3
      day7: integer("day7").notNull().default(0),
      // Came back day 7
      day14: integer("day14").notNull().default(0),
      day30: integer("day30").notNull().default(0)
    }, (table) => ({
      cohortDateIdx: index("retention_cohorts_date_idx").on(table.cohortDate)
    }));
    scheduledEvents = pgTable("scheduled_events", {
      id: serial("id").primaryKey(),
      name: varchar("name", { length: 200 }).notNull(),
      description: text("description"),
      eventType: text("event_type").notNull(),
      // 'multiplier', 'flash_sale', 'community_goal', 'tournament', 'custom'
      eventData: text("event_data").notNull(),
      // JSON string with type-specific config
      startTime: timestamp("start_time").notNull(),
      endTime: timestamp("end_time").notNull(),
      isActive: boolean("is_active").notNull().default(false),
      // Auto-toggled by cron
      isRecurring: boolean("is_recurring").notNull().default(false),
      recurrenceRule: varchar("recurrence_rule", { length: 100 }),
      // 'DAILY', 'WEEKLY_FRI', 'MONTHLY_1ST'
      priority: integer("priority").notNull().default(0),
      // For UI sorting
      bannerImage: text("banner_image"),
      // URL or base64
      createdAt: timestamp("created_at").notNull().defaultNow(),
      createdBy: text("created_by").notNull().references(() => users.telegramId),
      announcementSent: boolean("announcement_sent").notNull().default(false)
    }, (table) => ({
      activeIdx: index("scheduled_events_active_idx").on(table.isActive),
      startTimeIdx: index("scheduled_events_start_time_idx").on(table.startTime),
      endTimeIdx: index("scheduled_events_end_time_idx").on(table.endTime),
      eventTypeIdx: index("scheduled_events_type_idx").on(table.eventType)
    }));
    eventParticipation = pgTable("event_participation", {
      id: serial("id").primaryKey(),
      eventId: integer("event_id").notNull().references(() => scheduledEvents.id, { onDelete: "cascade" }),
      telegramId: text("telegram_id").notNull().references(() => users.telegramId, { onDelete: "cascade" }),
      contribution: decimal("contribution", { precision: 20, scale: 2 }).notNull().default("0"),
      // For community goals
      rank: integer("rank"),
      // For tournaments
      rewardClaimed: boolean("reward_claimed").notNull().default(false),
      participatedAt: timestamp("participated_at").notNull().defaultNow()
    }, (table) => ({
      userEventUnique: unique().on(table.eventId, table.telegramId),
      eventIdx: index("event_participation_event_idx").on(table.eventId),
      userIdx: index("event_participation_user_idx").on(table.telegramId)
    }));
    economyMetrics = pgTable("economy_metrics", {
      id: serial("id").primaryKey(),
      date: date("date").notNull().unique(),
      totalCsInCirculation: decimal("total_cs_in_circulation", { precision: 20, scale: 2 }).notNull().default("0"),
      totalCsGenerated: decimal("total_cs_generated", { precision: 20, scale: 2 }).notNull().default("0"),
      // All-time cumulative
      csGeneratedToday: decimal("cs_generated_today", { precision: 20, scale: 2 }).notNull().default("0"),
      // Daily generation
      csSpentToday: decimal("cs_spent_today", { precision: 20, scale: 2 }).notNull().default("0"),
      // Daily spending
      netCsChange: decimal("net_cs_change", { precision: 20, scale: 2 }).notNull().default("0"),
      // Generated - Spent
      inflationRatePercent: decimal("inflation_rate_percent", { precision: 10, scale: 4 }).notNull().default("0"),
      // (Today Gen / Total Circ) * 100
      avgBalancePerUser: decimal("avg_balance_per_user", { precision: 15, scale: 2 }).notNull().default("0"),
      medianBalance: decimal("median_balance", { precision: 15, scale: 2 }).notNull().default("0"),
      top1PercentOwnership: decimal("top1_percent_ownership", { precision: 10, scale: 2 }).notNull().default("0"),
      // % of total CS held by top 1%
      top10PercentOwnership: decimal("top10_percent_ownership", { precision: 10, scale: 2 }).notNull().default("0"),
      giniCoefficient: decimal("gini_coefficient", { precision: 5, scale: 4 }).notNull().default("0"),
      // Wealth inequality (0=equal, 1=one person has all)
      activeWallets: integer("active_wallets").notNull().default(0),
      // Users with balance > 0
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      dateIdx: index("economy_metrics_date_idx").on(table.date)
    }));
    economySinks = pgTable("economy_sinks", {
      id: serial("id").primaryKey(),
      date: date("date").notNull(),
      sinkType: text("sink_type").notNull(),
      // 'equipment', 'powerups', 'lootboxes', 'packs', 'upgrades', 'cosmetics', 'other'
      csSpent: decimal("cs_spent", { precision: 20, scale: 2 }).notNull().default("0"),
      transactionCount: integer("transaction_count").notNull().default(0)
    }, (table) => ({
      dateSinkIdx: index("economy_sinks_date_sink_idx").on(table.date, table.sinkType)
    }));
    economyAlerts = pgTable("economy_alerts", {
      id: serial("id").primaryKey(),
      date: date("date").notNull(),
      alertType: text("alert_type").notNull(),
      // 'high_inflation', 'negative_sinks', 'wealth_concentration', 'deflation'
      severity: text("severity").notNull(),
      // 'info', 'warning', 'critical'
      message: text("message").notNull(),
      metric: text("metric"),
      // JSON of relevant data
      acknowledged: boolean("acknowledged").notNull().default(false),
      acknowledgedBy: text("acknowledged_by").references(() => users.telegramId),
      createdAt: timestamp("created_at").notNull().defaultNow()
    }, (table) => ({
      dateIdx: index("economy_alerts_date_idx").on(table.date),
      acknowledgedIdx: index("economy_alerts_acknowledged_idx").on(table.acknowledged)
    }));
    userSegments = pgTable("user_segments", {
      id: serial("id").primaryKey(),
      telegramId: text("telegram_id").notNull().unique().references(() => users.telegramId, { onDelete: "cascade" }),
      segment: text("segment").notNull(),
      // 'whale', 'dolphin', 'minnow', 'new_user', 'active', 'at_risk', 'churned', 'returning'
      lifetimeValue: decimal("lifetime_value", { precision: 15, scale: 2 }).notNull().default("0"),
      // Total TON spent
      lastActiveAt: timestamp("last_active_at"),
      daysSinceLastActive: integer("days_since_last_active").notNull().default(0),
      totalSessions: integer("total_sessions").notNull().default(0),
      avgSessionDuration: integer("avg_session_duration").notNull().default(0),
      // seconds
      retentionD7: boolean("retention_d7").notNull().default(false),
      // Came back after 7 days
      updatedAt: timestamp("updated_at").notNull().defaultNow()
    }, (table) => ({
      telegramIdIdx: index("user_segments_telegram_id_idx").on(table.telegramId),
      segmentIdx: index("user_segments_segment_idx").on(table.segment)
    }));
    segmentTargetedOffers = pgTable("segment_targeted_offers", {
      id: serial("id").primaryKey(),
      targetSegment: text("target_segment").notNull(),
      // 'whale', 'dolphin', 'minnow', 'new_user', 'at_risk', 'churned', 'returning'
      offerType: text("offer_type").notNull(),
      // 'promo_code', 'flash_sale', 'bonus_cs', 'exclusive_equipment'
      offerData: text("offer_data").notNull(),
      // JSON with offer details
      validFrom: timestamp("valid_from").notNull().defaultNow(),
      validUntil: timestamp("valid_until"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      createdBy: text("created_by").notNull().references(() => users.telegramId)
    }, (table) => ({
      segmentIdx: index("segment_targeted_offers_segment_idx").on(table.targetSegment),
      activeIdx: index("segment_targeted_offers_active_idx").on(table.isActive)
    }));
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      referralCode: true,
      csBalance: true,
      chstBalance: true,
      totalHashrate: true
    });
    insertEquipmentTypeSchema = createInsertSchema(equipmentTypes);
    insertOwnedEquipmentSchema = createInsertSchema(ownedEquipment).omit({
      id: true,
      purchasedAt: true,
      currentHashrate: true,
      quantity: true,
      upgradeLevel: true
    });
    insertComponentUpgradeSchema = createInsertSchema(componentUpgrades).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUserTaskSchema = createInsertSchema(userTasks).omit({
      id: true,
      claimedAt: true
    });
    insertDailyClaimSchema = createInsertSchema(dailyClaims).omit({
      id: true,
      updatedAt: true
    });
    insertPowerUpPurchaseSchema = createInsertSchema(powerUpPurchases).omit({
      id: true,
      purchasedAt: true
    });
    insertLootBoxPurchaseSchema = createInsertSchema(lootBoxPurchases).omit({
      id: true,
      purchasedAt: true
    });
    insertActivePowerUpSchema = createInsertSchema(activePowerUps).omit({
      id: true,
      activatedAt: true
    });
    insertBlockSchema = createInsertSchema(blocks).omit({
      id: true,
      timestamp: true
    });
    insertBlockRewardSchema = createInsertSchema(blockRewards).omit({
      id: true,
      createdAt: true
    });
    insertReferralSchema = createInsertSchema(referrals).omit({
      id: true,
      createdAt: true
    });
    insertGameSettingSchema = createInsertSchema(gameSettings).omit({
      id: true,
      updatedAt: true
    });
    insertDailyChallengeSchema = createInsertSchema(dailyChallenges).omit({ id: true });
    insertUserDailyChallengeSchema = createInsertSchema(userDailyChallenges).omit({ id: true, completedAt: true });
    insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
    insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true, unlockedAt: true });
    insertSeasonSchema = createInsertSchema(seasons).omit({ id: true });
    insertCosmeticItemSchema = createInsertSchema(cosmeticItems).omit({ id: true });
    insertUserCosmeticSchema = createInsertSchema(userCosmetics).omit({ id: true, purchasedAt: true });
    insertUserStreakSchema = createInsertSchema(userStreaks).omit({ id: true, updatedAt: true });
    insertDailyLoginRewardSchema = createInsertSchema(dailyLoginRewards).omit({ id: true, claimedAt: true });
    insertFlashSaleSchema = createInsertSchema(flashSales).omit({ id: true, createdAt: true });
    insertUserHourlyBonusSchema = createInsertSchema(userHourlyBonuses).omit({ id: true, claimedAt: true });
    insertUserSpinSchema = createInsertSchema(userSpins).omit({ id: true, lastSpinAt: true });
    insertSpinHistorySchema = createInsertSchema(spinHistory).omit({ id: true, spunAt: true });
    insertJackpotWinSchema = createInsertSchema(jackpotWins).omit({ id: true, wonAt: true });
    insertEquipmentPresetSchema = createInsertSchema(equipmentPresets).omit({ id: true, createdAt: true, updatedAt: true });
    insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({ id: true, createdAt: true, triggeredAt: true });
    insertAutoUpgradeSettingSchema = createInsertSchema(autoUpgradeSettings).omit({ id: true, createdAt: true, updatedAt: true });
    insertPackPurchaseSchema = createInsertSchema(packPurchases).omit({ id: true, purchasedAt: true });
    insertUserPrestigeSchema = createInsertSchema(userPrestige).omit({ id: true, createdAt: true });
    insertPrestigeHistorySchema = createInsertSchema(prestigeHistory).omit({ id: true, prestigedAt: true });
    insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({ id: true, startDate: true });
    insertUserStatisticsSchema = createInsertSchema(userStatistics).omit({ id: true, createdAt: true, updatedAt: true });
    insertFeatureFlagSchema = createInsertSchema(featureFlags).omit({ id: true, updatedAt: true });
    insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true, sentAt: true });
    insertUserAnnouncementSchema = createInsertSchema(userAnnouncements).omit({ id: true, readAt: true });
    insertPromoCodeSchema = createInsertSchema(promoCodes).omit({ id: true, createdAt: true, currentUses: true });
    insertPromoCodeRedemptionSchema = createInsertSchema(promoCodeRedemptions).omit({ id: true, redeemedAt: true });
    insertDailyAnalyticsSchema = createInsertSchema(dailyAnalytics).omit({ id: true, createdAt: true });
    insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true, startedAt: true });
    insertRetentionCohortSchema = createInsertSchema(retentionCohorts).omit({ id: true });
    insertScheduledEventSchema = createInsertSchema(scheduledEvents).omit({ id: true, createdAt: true });
    insertEventParticipationSchema = createInsertSchema(eventParticipation).omit({ id: true, participatedAt: true });
    insertEconomyMetricsSchema = createInsertSchema(economyMetrics).omit({ id: true, createdAt: true });
    insertEconomySinksSchema = createInsertSchema(economySinks).omit({ id: true });
    insertEconomyAlertsSchema = createInsertSchema(economyAlerts).omit({ id: true, createdAt: true });
    insertUserSegmentSchema = createInsertSchema(userSegments).omit({ id: true, updatedAt: true });
    insertSegmentTargetedOfferSchema = createInsertSchema(segmentTargetedOffers).omit({ id: true, createdAt: true });
  }
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
async function initializeDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("[DB] DATABASE_URL not set, skipping database initialization");
      return false;
    }
    await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
    console.log("[DB] Database initialized successfully");
    return true;
  } catch (error) {
    console.error("[DB] Database initialization failed:", error);
    console.error("[DB] Health endpoint will report unhealthy status");
    return false;
  }
}
async function checkDatabaseHealth() {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch (error) {
    console.error("[DB] Health check failed:", error);
    return false;
  }
}
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL environment variable is not set. Database will not be available.");
    }
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false }
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DbStorage: () => DbStorage,
  db: () => db,
  storage: () => storage
});
import { eq, desc, and } from "drizzle-orm";
import { randomUUID } from "crypto";
var DbStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_db();
    DbStorage = class {
      async getUser(id) {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
      }
      async getUserByTelegramId(telegramId) {
        const result = await db.select().from(users).where(eq(users.telegramId, telegramId));
        return result[0];
      }
      async createUser(insertUser) {
        const referralCode = randomUUID().slice(0, 8);
        const result = await db.insert(users).values({
          ...insertUser,
          referralCode
        }).returning();
        return result[0];
      }
      async updateUserBalance(userId, csBalance, chstBalance) {
        await db.update(users).set({ csBalance, chstBalance }).where(eq(users.id, userId));
      }
      async updateUserHashrate(userId, totalHashrate) {
        await db.update(users).set({ totalHashrate }).where(eq(users.id, userId));
      }
      async getAllUsers() {
        return await db.select().from(users);
      }
      async getAllEquipmentTypes() {
        return await db.select().from(equipmentTypes).orderBy(equipmentTypes.category, equipmentTypes.orderIndex);
      }
      async getEquipmentTypesByCategoryAndTier(category, tier) {
        return await db.select().from(equipmentTypes).where(and(
          eq(equipmentTypes.category, category),
          eq(equipmentTypes.tier, tier)
        )).orderBy(equipmentTypes.orderIndex);
      }
      async getEquipmentType(id) {
        const result = await db.select().from(equipmentTypes).where(eq(equipmentTypes.id, id));
        return result[0];
      }
      async getUserEquipment(userId) {
        const result = await db.select().from(ownedEquipment).leftJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id)).where(eq(ownedEquipment.userId, userId));
        return result.map((row) => ({
          ...row.owned_equipment,
          equipmentType: row.equipment_types
        }));
      }
      async getSpecificEquipment(userId, equipmentTypeId) {
        const result = await db.select().from(ownedEquipment).where(and(
          eq(ownedEquipment.userId, userId),
          eq(ownedEquipment.equipmentTypeId, equipmentTypeId)
        ));
        return result[0];
      }
      async purchaseEquipment(equipment2) {
        const existing = await this.getSpecificEquipment(equipment2.userId, equipment2.equipmentTypeId);
        if (existing) {
          const result2 = await db.update(ownedEquipment).set({
            quantity: existing.quantity + 1,
            currentHashrate: existing.currentHashrate + equipment2.currentHashrate
          }).where(eq(ownedEquipment.id, existing.id)).returning();
          return result2[0];
        }
        const result = await db.insert(ownedEquipment).values(equipment2).returning();
        return result[0];
      }
      async upgradeEquipment(equipmentId, newLevel, newHashrate) {
        await db.update(ownedEquipment).set({
          upgradeLevel: newLevel,
          currentHashrate: newHashrate
        }).where(eq(ownedEquipment.id, equipmentId));
      }
      async getLatestBlocks(limit) {
        return await db.select().from(blocks).orderBy(desc(blocks.blockNumber)).limit(limit);
      }
      async getLatestBlock() {
        const result = await db.select().from(blocks).orderBy(desc(blocks.blockNumber)).limit(1);
        return result[0];
      }
      async createBlock(block) {
        const result = await db.insert(blocks).values(block).returning();
        return result[0];
      }
      async getBlockById(id) {
        const result = await db.select().from(blocks).where(eq(blocks.id, id));
        return result[0];
      }
      async getUserBlockRewards(userId, limit) {
        const query = db.select().from(blockRewards).leftJoin(blocks, eq(blockRewards.blockId, blocks.id)).where(eq(blockRewards.userId, userId)).orderBy(desc(blockRewards.createdAt));
        const result = limit ? await query.limit(limit) : await query;
        return result.map((row) => ({
          ...row.block_rewards,
          block: row.blocks
        }));
      }
      async createBlockReward(reward) {
        const result = await db.insert(blockRewards).values(reward).returning();
        return result[0];
      }
      async getUserReferrals(userId) {
        const result = await db.select().from(referrals).leftJoin(users, eq(referrals.refereeId, users.id)).where(eq(referrals.referrerId, userId));
        return result.map((row) => ({
          ...row.referrals,
          referee: row.users
        }));
      }
      async createReferral(referrerId, refereeId) {
        const result = await db.insert(referrals).values({
          referrerId,
          refereeId
        }).returning();
        return result[0];
      }
      async updateReferralBonus(referralId, bonus) {
        await db.update(referrals).set({ bonusEarned: bonus }).where(eq(referrals.id, referralId));
      }
      async getGameSetting(key) {
        const result = await db.select().from(gameSettings).where(eq(gameSettings.key, key));
        return result[0];
      }
      async setGameSetting(key, value) {
        const existing = await this.getGameSetting(key);
        if (existing) {
          const result2 = await db.update(gameSettings).set({ value, updatedAt: /* @__PURE__ */ new Date() }).where(eq(gameSettings.key, key)).returning();
          return result2[0];
        }
        const result = await db.insert(gameSettings).values({ key, value }).returning();
        return result[0];
      }
      async getAllGameSettings() {
        return await db.select().from(gameSettings);
      }
      async updateUserProfile(userId, data) {
        await db.update(users).set(data).where(eq(users.id, userId));
      }
      async setUserAdmin(userId, isAdmin) {
        await db.update(users).set({ isAdmin }).where(eq(users.id, userId));
      }
    };
    storage = new DbStorage();
  }
});

// server/mining.ts
var mining_exports = {};
__export(mining_exports, {
  MiningService: () => MiningService,
  getMiningHealth: () => getMiningHealth,
  miningService: () => miningService
});
import { eq as eq2, sql as sql3, and as and2 } from "drizzle-orm";
function getMiningHealth() {
  const now = Date.now();
  const fifteenMinutesAgo = now - 15 * 60 * 1e3;
  const isHealthy = consecutiveFailures < 3 && (lastSuccessfulMine === null || lastSuccessfulMine.getTime() > fifteenMinutesAgo);
  return {
    status: isHealthy ? "healthy" : "degraded",
    lastSuccessfulMine,
    consecutiveFailures,
    message: !isHealthy ? "Mining has failed multiple times or not run recently" : void 0
  };
}
var BLOCK_INTERVAL, BLOCK_REWARD, MAX_CONSECUTIVE_FAILURES, MINING_TIMEOUT, lastSuccessfulMine, consecutiveFailures, MiningService, miningService;
var init_mining = __esm({
  "server/mining.ts"() {
    "use strict";
    init_storage();
    init_schema();
    BLOCK_INTERVAL = 5 * 60 * 1e3;
    BLOCK_REWARD = 1e5;
    MAX_CONSECUTIVE_FAILURES = 5;
    MINING_TIMEOUT = 4 * 60 * 1e3;
    lastSuccessfulMine = null;
    consecutiveFailures = 0;
    MiningService = class {
      intervalId = null;
      lastBlockNumber = 0;
      isMining = false;
      miningTimeoutId = null;
      async start() {
        await this.initializeBlockNumber();
        await this.recalculateAllHashrates();
        this.intervalId = setInterval(async () => {
          try {
            await this.mineBlock();
          } catch (error) {
            console.error("Error mining block:", error);
          }
        }, BLOCK_INTERVAL);
        console.log(`Mining service started. Blocks will be mined every ${BLOCK_INTERVAL / 1e3} seconds.`);
      }
      stop() {
        if (this.intervalId) {
          clearInterval(this.intervalId);
          this.intervalId = null;
          console.log("Mining service stopped.");
        }
      }
      async initializeBlockNumber() {
        const latestBlock = await storage.getLatestBlock();
        this.lastBlockNumber = latestBlock?.blockNumber ?? 0;
      }
      async recalculateAllHashrates() {
        console.log("Recalculating all user hashrates from equipment...");
        try {
          const result = await db.transaction(async (tx) => {
            const allUsers = await tx.select().from(users);
            let usersUpdated = 0;
            for (const user of allUsers) {
              const equipment2 = await tx.select().from(ownedEquipment).leftJoin(equipmentTypes, eq2(ownedEquipment.equipmentTypeId, equipmentTypes.id)).where(eq2(ownedEquipment.userId, user.telegramId));
              const actualHashrate = equipment2.reduce((sum, row) => {
                return sum + (row.owned_equipment?.currentHashrate || 0);
              }, 0);
              if (user.totalHashrate !== actualHashrate) {
                await tx.update(users).set({ totalHashrate: actualHashrate }).where(eq2(users.telegramId, user.telegramId));
                usersUpdated++;
              }
            }
            return { totalUsers: allUsers.length, usersUpdated };
          });
          console.log(`Hashrate recalculation complete: ${result.usersUpdated}/${result.totalUsers} users updated`);
        } catch (error) {
          console.error("Hashrate recalculation error:", error);
        }
      }
      async mineBlock() {
        if (this.isMining) {
          console.log("Mining already in progress, skipping...");
          return;
        }
        const pauseSetting = await storage.getGameSetting("mining_paused");
        if (pauseSetting && pauseSetting.value === "true") {
          console.log("Mining is paused by admin.");
          return;
        }
        this.isMining = true;
        this.miningTimeoutId = setTimeout(() => {
          if (this.isMining) {
            console.error("[MINING] Mining operation timed out, resetting flag");
            this.isMining = false;
          }
        }, MINING_TIMEOUT);
        try {
          const blockNumber = this.lastBlockNumber + 1;
          console.log(`Mining block #${blockNumber}...`);
          const allUsers = await storage.getAllUsers();
          const activeMiners = allUsers.filter((user) => user.totalHashrate > 0);
          console.log(`Total users: ${allUsers.length}, Active miners: ${activeMiners.length}`);
          if (activeMiners.length === 0) {
            console.log(`Block #${blockNumber} skipped - no active miners.`);
            return;
          }
          const now = /* @__PURE__ */ new Date();
          const allActivePowerUps = await db.select().from(activePowerUps).where(and2(
            eq2(activePowerUps.isActive, true),
            sql3`${activePowerUps.expiresAt} > ${now}`
          ));
          const userPowerUps = /* @__PURE__ */ new Map();
          for (const powerUp of allActivePowerUps) {
            const existing = userPowerUps.get(powerUp.userId) || { hashrateBoost: 0, luckBoost: 0 };
            if (powerUp.powerUpType === "hashrate-boost") {
              existing.hashrateBoost += powerUp.boostPercentage;
            } else if (powerUp.powerUpType === "luck-boost") {
              existing.luckBoost += powerUp.boostPercentage;
            }
            userPowerUps.set(powerUp.userId, existing);
          }
          let totalNetworkHashrate = 0;
          const minerData = activeMiners.map((user) => {
            const boosts = userPowerUps.get(user.telegramId) || { hashrateBoost: 0, luckBoost: 0 };
            const boostedHashrate = user.totalHashrate * (1 + boosts.hashrateBoost / 100);
            totalNetworkHashrate += boostedHashrate;
            return {
              user,
              boostedHashrate,
              luckBoost: boosts.luckBoost
            };
          });
          await db.transaction(async (tx) => {
            const newBlock = await tx.insert(blocks).values({
              blockNumber,
              reward: BLOCK_REWARD,
              totalHashrate: totalNetworkHashrate,
              totalMiners: activeMiners.length,
              difficulty: 1
            }).returning();
            const blockId = newBlock[0].id;
            for (const { user, boostedHashrate, luckBoost } of minerData) {
              const userShare = boostedHashrate / totalNetworkHashrate;
              let userReward = BLOCK_REWARD * userShare;
              if (luckBoost > 0) {
                userReward = userReward * (1 + luckBoost / 100);
              }
              const sharePercent = userShare * 100;
              await tx.insert(blockRewards).values({
                userId: user.id,
                blockId,
                reward: userReward,
                hashrate: boostedHashrate,
                sharePercent
              });
              await tx.update(users).set({
                csBalance: sql3`${users.csBalance} + ${userReward}`
              }).where(eq2(users.id, user.id));
            }
            await tx.update(activePowerUps).set({ isActive: false }).where(and2(
              eq2(activePowerUps.isActive, true),
              sql3`${activePowerUps.expiresAt} <= ${now}`
            ));
            console.log(
              `Block #${blockNumber} mined! Reward: ${BLOCK_REWARD} CS distributed to ${activeMiners.length} miners. Total hashrate: ${totalNetworkHashrate.toFixed(2)} H/s (with boosts)`
            );
          });
          this.lastBlockNumber = blockNumber;
          lastSuccessfulMine = /* @__PURE__ */ new Date();
          consecutiveFailures = 0;
          console.log("[MINING] Block mined successfully");
        } catch (error) {
          consecutiveFailures++;
          console.error("[MINING] Failed to mine block:", error);
          if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
            console.error("[MINING CRITICAL] Mining has failed 5 times consecutively");
          }
          throw error;
        } finally {
          if (this.miningTimeoutId) {
            clearTimeout(this.miningTimeoutId);
            this.miningTimeoutId = null;
          }
          this.isMining = false;
        }
      }
    };
    miningService = new MiningService();
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_schema();
init_schema();
import { createServer } from "http";
import { eq as eq17, and as and12, sql as sql14 } from "drizzle-orm";

// server/telegram-auth.ts
import crypto from "crypto";
function validateTelegramWebAppData(initData, botToken) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");
    if (!hash) {
      return null;
    }
    urlParams.delete("hash");
    const dataCheckString = Array.from(urlParams.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join("\n");
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    if (calculatedHash !== hash) {
      return null;
    }
    const userParam = urlParams.get("user");
    if (!userParam) {
      return null;
    }
    const user = JSON.parse(userParam);
    const authDate = parseInt(urlParams.get("auth_date") || "0");
    const maxAge = 7 * 24 * 60 * 60;
    if (Date.now() / 1e3 - authDate > maxAge) {
      return null;
    }
    return {
      ...user,
      auth_date: authDate,
      hash
    };
  } catch (error) {
    console.error("Telegram auth validation error:", error);
    return null;
  }
}

// server/middleware/auth.ts
function validateTelegramAuth(req, res, next) {
  const initData = req.headers["x-telegram-init-data"];
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    console.error("BOT_TOKEN not configured");
    return res.status(500).json({ error: "Server configuration error" });
  }
  if (!initData) {
    return res.status(401).json({ error: "Telegram authentication required" });
  }
  const telegramUser = validateTelegramWebAppData(initData, botToken);
  if (!telegramUser) {
    return res.status(401).json({ error: "Invalid Telegram authentication" });
  }
  req.telegramUser = {
    id: telegramUser.id,
    first_name: telegramUser.first_name,
    last_name: telegramUser.last_name,
    username: telegramUser.username,
    photo_url: telegramUser.photo_url
  };
  next();
}
async function requireAdmin(req, res, next) {
  if (!req.telegramUser) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
  const user = await storage2.getUserByTelegramId(String(req.telegramUser.id));
  const whitelist = process.env.ADMIN_WHITELIST || "";
  const isWhitelisted = whitelist.split(",").map((s) => s.trim()).filter(Boolean).includes(String(req.telegramUser.id));
  if (user && isWhitelisted && !user.isAdmin) {
    await storage2.setUserAdmin(user.id, true);
    user.isAdmin = true;
  }
  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
async function verifyUserAccess(req, res, next) {
  if (!req.telegramUser) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
  const user = await storage2.getUserByTelegramId(String(req.telegramUser.id));
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const requestedUserId = req.params.userId;
  if (requestedUserId && requestedUserId !== user.id) {
    return res.status(403).json({ error: "Access denied - can only access your own data" });
  }
  req.params.userId = user.id;
  next();
}

// server/tonVerification.ts
async function verifyTONTransaction(txHash, expectedAmount, recipientAddress, senderAddress) {
  try {
    const apiKey = process.env.TON_API_KEY;
    const baseUrl = "https://toncenter.com/api/v3";
    const headers = {
      "Content-Type": "application/json"
    };
    if (apiKey) {
      headers["X-API-Key"] = apiKey;
    }
    const url = `${baseUrl}/transactions?account=${recipientAddress}&limit=100&sort=desc`;
    const response = await fetch(url, {
      method: "GET",
      headers
    });
    if (!response.ok) {
      console.error("TON API response not OK:", response.status, response.statusText);
      return {
        verified: false,
        error: "Failed to connect to TON blockchain API"
      };
    }
    const data = await response.json();
    if (!data.transactions || !Array.isArray(data.transactions)) {
      console.error("Invalid TON API response structure:", data);
      return {
        verified: false,
        error: "Invalid response from TON blockchain API"
      };
    }
    const expectedNanotons = BigInt(Math.floor(expectedAmount * 1e9));
    const tolerance = BigInt(1e6);
    for (const tx of data.transactions) {
      const txHashMatch = tx.hash === txHash || tx.transaction_id === txHash;
      if (!txHashMatch) continue;
      const inMsg = tx.in_msg;
      if (!inMsg) continue;
      const fromAddress = inMsg.source;
      const toAddress = inMsg.destination;
      const value = BigInt(inMsg.value || "0");
      if (toAddress !== recipientAddress) {
        console.log(`Address mismatch: expected ${recipientAddress}, got ${toAddress}`);
        continue;
      }
      if (senderAddress && fromAddress !== senderAddress) {
        console.log(`Sender mismatch: expected ${senderAddress}, got ${fromAddress}`);
        continue;
      }
      const amountDiff = value > expectedNanotons ? value - expectedNanotons : expectedNanotons - value;
      if (amountDiff > tolerance) {
        console.log(`Amount mismatch: expected ${expectedAmount} TON (${expectedNanotons}), got ${Number(value) / 1e9} TON (${value})`);
        return {
          verified: false,
          error: `Amount mismatch: expected ${expectedAmount} TON, received ${Number(value) / 1e9} TON`
        };
      }
      console.log("\u2705 TON transaction verified:", {
        hash: tx.hash,
        from: fromAddress,
        to: toAddress,
        amount: `${Number(value) / 1e9} TON`
      });
      return {
        verified: true,
        transaction: {
          hash: tx.hash,
          from: fromAddress,
          to: toAddress,
          value: value.toString(),
          timestamp: tx.utime || Math.floor(Date.now() / 1e3)
        }
      };
    }
    console.log(`Transaction ${txHash} not found in recent transactions`);
    return {
      verified: false,
      error: "Transaction not found on blockchain. It may still be processing or the hash is incorrect."
    };
  } catch (error) {
    console.error("TON verification error:", error);
    return {
      verified: false,
      error: `Verification service error: ${error.message}`
    };
  }
}
function getGameWalletAddress() {
  const address = process.env.GAME_TON_WALLET_ADDRESS?.trim();
  if (!address) {
    console.warn("\u26A0\uFE0F  GAME_TON_WALLET_ADDRESS not set in environment variables");
    return "EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqIw";
  }
  return address;
}
function isValidTONAddress(address) {
  if (!address) return false;
  const trimmedAddress = address.trim();
  if (/^[EUk0]Q[A-Za-z0-9_-]{46}$/.test(trimmedAddress)) {
    return true;
  }
  if (/^-?\d+:[a-fA-F0-9]{64}$/.test(trimmedAddress)) {
    return true;
  }
  return false;
}
async function pollForTransaction(txHash, expectedAmount, recipientAddress, senderAddress, timeoutMs = 3e5, intervalMs = 5e3) {
  const startTime = Date.now();
  const endTime = startTime + timeoutMs;
  let attempts = 0;
  const maxAttempts = Math.ceil(timeoutMs / intervalMs);
  console.log(`\u{1F50D} Polling for TON transaction ${txHash.substring(0, 12)}... (${maxAttempts} attempts over ${timeoutMs / 1e3}s)`);
  while (Date.now() < endTime) {
    attempts++;
    console.log(`\u{1F504} Verification attempt ${attempts}/${maxAttempts}...`);
    const result = await verifyTONTransaction(
      txHash,
      expectedAmount,
      recipientAddress,
      senderAddress
    );
    if (result.verified) {
      console.log(`\u2705 Transaction verified on attempt ${attempts} (took ${Math.floor((Date.now() - startTime) / 1e3)}s)`);
      return result;
    }
    if (result.error && !result.error.includes("not found") && !result.error.includes("processing")) {
      console.log(`\u274C Transaction verification failed with error: ${result.error}`);
      return result;
    }
    if (attempts >= maxAttempts) {
      console.log(`\u23F1\uFE0F Transaction not confirmed after ${attempts} attempts (${Math.floor((Date.now() - startTime) / 1e3)}s)`);
      return {
        verified: false,
        error: `Transaction not confirmed within ${timeoutMs / 1e3} seconds. The payment may still be processing on the blockchain. Please contact support with your transaction hash if the issue persists.`
      };
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return {
    verified: false,
    error: "Transaction verification timeout"
  };
}

// server/routes.ts
init_mining();

// server/bot.ts
init_schema();
init_db();
import { Telegraf } from "telegraf";
import { eq as eq3 } from "drizzle-orm";
var BOT_TOKEN = process.env.BOT_TOKEN;
var WEB_APP_URL = process.env.WEB_APP_URL || "https://crypto-hacker-heist.onrender.com";
var ADMIN_WHITELIST = process.env.ADMIN_WHITELIST?.split(",").map((id) => parseInt(id.trim())) || [];
var WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN || "https://crypto-hacker-heist.onrender.com";
var USE_WEBHOOKS = process.env.NODE_ENV === "production";
if (!BOT_TOKEN) {
  console.warn("\u26A0\uFE0F  BOT_TOKEN not set - Bot commands will not work");
}
var bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null;
async function initializeBot() {
  if (!bot) {
    console.log("\u{1F916} Bot not initialized - BOT_TOKEN not provided");
    return;
  }
  bot.start(async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    try {
      const user = await db.select().from(users).where(eq3(users.telegramId, userId.toString())).limit(1);
      if (user.length === 0) {
        await ctx.reply(
          "\u{1F3AE} Welcome to Crypto Hacker Heist!\n\nThis is a Telegram mini-app game where you mine cryptocurrency and build your mining empire.\n\nUse /play to launch the game!",
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u{1F3AE} Launch Game", web_app: { url: `${WEB_APP_URL}/` } }]
              ]
            }
          }
        );
      } else {
        await ctx.reply(
          `\u{1F3AE} Welcome back, ${user[0].username}!

\u{1F4B0} CS Balance: ${user[0].csBalance.toLocaleString()}
\u26A1 Hashrate: ${user[0].totalHashrate.toFixed(2)} GH/s

Use /play to continue your mining empire!`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "\u{1F3AE} Launch Game", web_app: { url: `${WEB_APP_URL}/` } }]
              ]
            }
          }
        );
      }
    } catch (error) {
      console.error("Error in start command:", error);
      await ctx.reply("\u274C Error loading game data. Please try again later.");
    }
  });
  bot.command("play", async (ctx) => {
    await ctx.reply(
      "\u{1F3AE} Launching Crypto Hacker Heist...",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "\u{1F680} Start Mining!", web_app: { url: `${WEB_APP_URL}/` } }]
          ]
        }
      }
    );
  });
  bot.command("admin", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;
    if (!ADMIN_WHITELIST.includes(userId)) {
      await ctx.reply("\u274C Access denied. Admin privileges required.");
      return;
    }
    await ctx.reply(
      "\u{1F527} Admin Dashboard",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "\u2699\uFE0F Admin Panel", web_app: { url: `${WEB_APP_URL}/admin` } }]
          ]
        }
      }
    );
  });
  bot.command("help", async (ctx) => {
    await ctx.reply(
      "\u{1F3AE} Crypto Hacker Heist - Help\n\nAvailable commands:\n/start - Welcome message and game info\n/play - Launch the game mini-app\n/help - Show this help message\n\nGame features:\n\u2022 Mine cryptocurrency (CS/CHST)\n\u2022 Buy and upgrade mining equipment\n\u2022 Complete daily tasks\n\u2022 Open loot boxes\n\u2022 Invite friends for rewards\n\nUse /play to start playing!",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "\u{1F3AE} Launch Game", web_app: { url: `${WEB_APP_URL}/` } }]
          ]
        }
      }
    );
  });
  bot.on("web_app_data", async (ctx) => {
    console.log("Web app data received:", ctx.webAppData);
  });
  bot.catch((err, ctx) => {
    console.error("Bot error:", err);
    ctx.reply("\u274C An error occurred. Please try again later.");
  });
  try {
    if (USE_WEBHOOKS) {
      console.log("\u{1F916} Starting bot with webhooks...");
      const webhookPath = `/telegram-webhook/${BOT_TOKEN}`;
      await bot.telegram.setWebhook(`${WEBHOOK_DOMAIN}${webhookPath}`);
      console.log(`\u{1F916} Webhook set to: ${WEBHOOK_DOMAIN}${webhookPath}`);
      console.log("\u{1F916} Bot configured for webhooks (webhook handler needs to be registered in routes)");
    } else {
      console.log("\u{1F916} Starting bot with long polling...");
      await bot.launch();
      console.log("\u{1F916} Bot started successfully with polling");
    }
  } catch (error) {
    console.error("Failed to start bot:", error);
    if (error.response?.error_code === 409) {
      console.error("\u26A0\uFE0F  Bot conflict (409): Another instance is running. This is normal during deployments.");
      console.log("\u{1F4A1} Tip: The bot will work once the old instance stops. Commands may be delayed by 1-2 minutes.");
    } else if (error.code === "ETELEGRAM") {
      console.error("\u26A0\uFE0F  Telegram API error. Check your BOT_TOKEN.");
    }
  }
  process.once("SIGINT", () => {
    if (bot) {
      console.log("\u{1F916} Stopping bot...");
      bot.stop("SIGINT");
    }
  });
  process.once("SIGTERM", () => {
    if (bot) {
      console.log("\u{1F916} Stopping bot...");
      bot.stop("SIGTERM");
    }
  });
}
async function sendMessageToUser(telegramId, message) {
  if (!bot) {
    throw new Error("Bot not initialized");
  }
  try {
    await bot.telegram.sendMessage(telegramId, message, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "\u{1F3AE} Open Game", web_app: { url: WEB_APP_URL } }]
        ]
      }
    });
  } catch (error) {
    if (error.response?.error_code === 403) {
      throw new Error(`User ${telegramId} has blocked the bot`);
    }
    throw error;
  }
}
function getBotWebhookHandler() {
  if (!bot || !BOT_TOKEN) {
    return null;
  }
  return {
    path: `/telegram-webhook/${BOT_TOKEN}`,
    handler: bot.webhookCallback(`/telegram-webhook/${BOT_TOKEN}`)
  };
}

// server/routes/health.routes.ts
init_mining();
function registerHealthRoutes(app2) {
  app2.get("/healthz", async (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app2.get("/api/health", async (_req, res) => {
    try {
      res.json({
        ok: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({
        ok: false,
        error: "Health check failed",
        message: error.message
      });
    }
  });
  app2.get("/api/health/mining", async (_req, res) => {
    try {
      const miningHealth = getMiningHealth();
      const isHealthy = miningHealth.consecutiveFailures < 3 && Date.now() - miningHealth.lastSuccessfulMine < 15 * 60 * 1e3;
      res.json({
        ok: isHealthy,
        ...miningHealth
      });
    } catch (error) {
      console.error("Mining health check error:", error);
      res.status(500).json({
        ok: false,
        error: "Mining health check failed",
        message: error.message
      });
    }
  });
}

// server/routes/auth.routes.ts
init_storage();
function registerAuthRoutes(app2) {
  app2.post("/api/auth/telegram", validateTelegramAuth, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    let user = await storage.getUserByTelegramId(String(req.telegramUser.id));
    if (!user) {
      user = await storage.createUser({
        telegramId: String(req.telegramUser.id),
        username: req.telegramUser.username || `user_${req.telegramUser.id}`,
        firstName: req.telegramUser.first_name,
        lastName: req.telegramUser.last_name,
        photoUrl: req.telegramUser.photo_url
      });
    } else {
      await storage.updateUserProfile(user.id, {
        username: req.telegramUser.username || user.username,
        firstName: req.telegramUser.first_name,
        lastName: req.telegramUser.last_name,
        photoUrl: req.telegramUser.photo_url
      });
      user = await storage.getUser(user.id);
    }
    res.json(user);
  });
}

// server/routes/user.routes.ts
init_storage();
init_schema();
import { eq as eq4, sql as sql4 } from "drizzle-orm";
function registerUserRoutes(app2) {
  app2.get("/api/user/:userId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const user = await storage.getUser(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });
  app2.get("/api/user/:userId/rank", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const hashrateRank = await db.select({ count: sql4`COUNT(*)` }).from(users).where(sql4`${users.totalHashrate} > ${user.totalHashrate}`);
      const balanceRank = await db.select({ count: sql4`COUNT(*)` }).from(users).where(sql4`${users.csBalance} > ${user.csBalance}`);
      const totalUsers = await db.select({ count: sql4`COUNT(*)` }).from(users);
      res.json({
        userId,
        hashrateRank: (hashrateRank[0]?.count || 0) + 1,
        balanceRank: (balanceRank[0]?.count || 0) + 1,
        totalUsers: totalUsers[0]?.count || 0
      });
    } catch (error) {
      console.error("User rank error:", error);
      res.status(500).json({ error: "Failed to fetch user rank" });
    }
  });
  app2.post("/api/user/:userId/tutorial/complete", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq4(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        if (user[0].tutorialCompleted) {
          return {
            success: true,
            message: "Tutorial already completed",
            alreadyCompleted: true
          };
        }
        await tx.update(users).set({
          tutorialCompleted: true,
          csBalance: sql4`${users.csBalance} + 5000`
        }).where(eq4(users.id, userId));
        return {
          success: true,
          message: "Tutorial completed! Earned 5,000 CS bonus",
          bonus: 5e3
        };
      });
      res.json(result);
    } catch (error) {
      console.error("Tutorial completion error:", error);
      res.status(500).json({ error: error.message || "Failed to complete tutorial" });
    }
  });
  app2.post("/api/user/:userId/reset", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { confirmReset } = req.body;
    if (!confirmReset) {
      return res.status(400).json({ message: "Reset confirmation required" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        await tx.delete(ownedEquipment).where(eq4(ownedEquipment.userId, userId));
        await tx.delete(blockRewards).where(eq4(blockRewards.userId, userId));
        await tx.delete(referrals).where(eq4(referrals.referrerId, userId));
        await tx.delete(referrals).where(eq4(referrals.refereeId, userId));
        await tx.update(users).set({
          csBalance: 0,
          chstBalance: 0,
          totalHashrate: 0
        }).where(eq4(users.id, userId));
        return { success: true, message: "Game data reset successfully" };
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to reset game data" });
    }
  });
}

// server/routes/social.routes.ts
init_storage();
init_schema();
import { eq as eq5, sql as sql5 } from "drizzle-orm";
function registerSocialRoutes(app2) {
  app2.get("/api/leaderboard/hashrate", validateTelegramAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const topMiners = await db.select({
        id: users.id,
        username: users.username,
        totalHashrate: users.totalHashrate,
        csBalance: users.csBalance,
        photoUrl: users.photoUrl
      }).from(users).orderBy(sql5`${users.totalHashrate} DESC`).limit(Math.min(limit, 100));
      res.json(topMiners);
    } catch (error) {
      console.error("Leaderboard hashrate error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/leaderboard/balance", validateTelegramAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const topBalances = await db.select({
        id: users.id,
        username: users.username,
        csBalance: users.csBalance,
        totalHashrate: users.totalHashrate,
        photoUrl: users.photoUrl
      }).from(users).orderBy(sql5`${users.csBalance} DESC`).limit(Math.min(limit, 100));
      res.json(topBalances);
    } catch (error) {
      console.error("Leaderboard balance error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/leaderboard/referrals", validateTelegramAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const topReferrers = await db.select({
        id: users.id,
        username: users.username,
        photoUrl: users.photoUrl,
        referralCount: sql5`(SELECT COUNT(*) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId})`,
        totalBonus: sql5`(SELECT COALESCE(SUM(${referrals.bonusEarned}), 0) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId})`
      }).from(users).orderBy(sql5`(SELECT COUNT(*) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId}) DESC`).limit(Math.min(limit, 100));
      res.json(topReferrers);
    } catch (error) {
      console.error("Leaderboard referrals error:", error);
      res.status(500).json({ error: "Failed to fetch referral leaderboard" });
    }
  });
  app2.get("/api/user/:userId/referrals", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const referrals2 = await storage.getUserReferrals(req.params.userId);
    res.json(referrals2);
  });
  app2.post("/api/user/:userId/referrals/apply", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { referralCode } = req.body;
    if (!referralCode) {
      return res.status(400).json({ message: "Referral code is required" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        if (user[0].referredBy) {
          throw new Error("You have already used a referral code");
        }
        const referrer = await tx.select().from(users).where(eq5(users.referralCode, referralCode)).for("update");
        if (!referrer[0]) throw new Error("Invalid referral code");
        if (referrer[0].id === userId) {
          throw new Error("You cannot use your own referral code");
        }
        const bonusAmount = 1e3;
        await tx.update(users).set({
          referredBy: referrer[0].id,
          csBalance: sql5`${users.csBalance} + ${bonusAmount}`
        }).where(eq5(users.id, userId));
        await tx.update(users).set({
          csBalance: sql5`${users.csBalance} + ${bonusAmount * 2}`
        }).where(eq5(users.id, referrer[0].id));
        const [referral] = await tx.insert(referrals).values({
          referrerId: referrer[0].id,
          refereeId: userId,
          bonusEarned: bonusAmount * 2
        }).returning();
        return {
          success: true,
          referral,
          userBonus: bonusAmount,
          referrerBonus: bonusAmount * 2
        };
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to apply referral code" });
    }
  });
  app2.get("/api/user/:userId/network-stats", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const userId = req.params.userId;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const allUsers = await storage.getAllUsers();
    const activeMiners = allUsers.filter((u) => u.totalHashrate > 0);
    const totalNetworkHashrate = activeMiners.reduce((sum, u) => sum + u.totalHashrate, 0);
    const userHashrate = user.totalHashrate;
    const networkShare = totalNetworkHashrate > 0 ? userHashrate / totalNetworkHashrate * 100 : 0;
    res.json({
      totalNetworkHashrate,
      activeMiners: activeMiners.length,
      userHashrate,
      networkShare,
      userSharePercentage: networkShare
    });
  });
  app2.get("/api/network-stats", async (req, res) => {
    const allUsers = await storage.getAllUsers();
    const activeMiners = allUsers.filter((u) => u.totalHashrate > 0);
    const totalNetworkHashrate = activeMiners.reduce((sum, u) => sum + u.totalHashrate, 0);
    res.json({
      totalHashrate: totalNetworkHashrate,
      activeMiners: activeMiners.length,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
}

// server/routes/mining.routes.ts
init_storage();
function registerMiningRoutes(app2) {
  app2.get("/api/blocks", async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const blocks3 = await storage.getLatestBlocks(limit);
    res.json(blocks3);
  });
  app2.get("/api/blocks/latest", async (req, res) => {
    const block = await storage.getLatestBlock();
    res.json(block);
  });
  app2.get("/api/user/:userId/rewards", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const rewards = await storage.getUserBlockRewards(req.params.userId, limit);
    res.json(rewards);
  });
  app2.get("/api/user/:userId/mining-calendar", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const hoursAhead = parseInt(req.query.hours) || 24;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const latestBlock = await storage.getLatestBlock();
      const currentBlockNumber = latestBlock?.blockNumber || 0;
      const allUsers = await storage.getAllUsers();
      const activeMiners = allUsers.filter((u) => u.totalHashrate > 0);
      const peerHashrate = activeMiners.filter((u) => u.id !== userId).reduce((sum, u) => sum + u.totalHashrate, 0);
      const totalNetworkHashrate = peerHashrate + user.totalHashrate;
      const BLOCK_INTERVAL_MS = 5 * 60 * 1e3;
      const BLOCK_REWARD2 = 1e5;
      const blocksAhead = Math.floor(hoursAhead * 60 * 60 * 1e3 / BLOCK_INTERVAL_MS);
      const now = /* @__PURE__ */ new Date();
      const upcomingBlocks = [];
      for (let i = 1; i <= blocksAhead; i++) {
        const blockNumber = currentBlockNumber + i;
        const estimatedTime = new Date(now.getTime() + i * BLOCK_INTERVAL_MS);
        const userShare = totalNetworkHashrate > 0 ? user.totalHashrate / totalNetworkHashrate : 0;
        const estimatedReward = BLOCK_REWARD2 * userShare;
        const hashrateBoostReward = BLOCK_REWARD2 * (user.totalHashrate * 1.5 / (totalNetworkHashrate + user.totalHashrate * 0.5));
        const luckBoostReward = estimatedReward * 1.5;
        upcomingBlocks.push({
          blockNumber,
          estimatedTime: estimatedTime.toISOString(),
          timeUntil: i * 5,
          // minutes
          estimatedReward: Math.floor(estimatedReward),
          userSharePercent: (userShare * 100).toFixed(4),
          potentialWithHashrateBoost: Math.floor(hashrateBoostReward),
          potentialWithLuckBoost: Math.floor(luckBoostReward),
          recommendPowerUp: i <= 12 && userShare > 0.01
          // First hour and significant share
        });
      }
      res.json({
        currentBlock: currentBlockNumber,
        userHashrate: user.totalHashrate,
        networkHashrate: totalNetworkHashrate,
        userSharePercent: totalNetworkHashrate > 0 ? (user.totalHashrate / totalNetworkHashrate * 100).toFixed(4) : "0.00",
        blockInterval: "5 minutes",
        upcomingBlocks
      });
    } catch (error) {
      console.error("Mining calendar error:", error);
      res.status(500).json({ error: error.message || "Failed to generate mining calendar" });
    }
  });
}

// server/routes/equipment.routes.ts
init_storage();
init_schema();
init_schema();
import { eq as eq6, sql as sql6 } from "drizzle-orm";
function registerEquipmentRoutes(app2) {
  app2.get("/api/equipment-types", async (req, res) => {
    try {
      const equipment2 = await storage.getAllEquipmentTypes();
      res.json(equipment2);
    } catch (error) {
      console.error("Error loading equipment types:", error);
      res.status(500).json({ error: "Failed to load equipment types" });
    }
  });
  app2.get("/api/equipment-types/:category/:tier", async (req, res) => {
    const { category, tier } = req.params;
    const equipmentTypes2 = await storage.getEquipmentTypesByCategoryAndTier(category, tier);
    res.json(equipmentTypes2);
  });
  app2.get("/api/user/:userId/equipment", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const equipment2 = await storage.getUserEquipment(req.params.userId);
    res.json(equipment2);
  });
  app2.post("/api/user/:userId/equipment/purchase", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const parsed = insertOwnedEquipmentSchema.safeParse({ ...req.body, userId });
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid equipment data", errors: parsed.error });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq6(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const equipmentType = await tx.select().from(equipmentTypes).where(eq6(equipmentTypes.id, parsed.data.equipmentTypeId));
        if (!equipmentType[0]) throw new Error("Equipment type not found");
        const et = equipmentType[0];
        const userEquipment = await tx.select().from(ownedEquipment).where(eq6(ownedEquipment.userId, userId)).for("update");
        const isFirstBasicLaptop = parsed.data.equipmentTypeId === "laptop-lenovo-e14";
        const ownedCount = userEquipment.filter((e) => e.equipmentTypeId === parsed.data.equipmentTypeId).length;
        const isFirstPurchase = ownedCount === 0;
        if (!isFirstBasicLaptop || !isFirstPurchase) {
          const balanceField = et.currency === "CS" ? "csBalance" : "chstBalance";
          if (user[0][balanceField] < et.basePrice) {
            throw new Error(`Insufficient ${et.currency} balance`);
          }
        }
        const owned = userEquipment.find((e) => e.equipmentTypeId === parsed.data.equipmentTypeId);
        if (owned && owned.quantity >= et.maxOwned) {
          throw new Error(`Maximum owned limit reached (${et.maxOwned})`);
        }
        let equipment2;
        if (owned) {
          const updated = await tx.update(ownedEquipment).set({
            quantity: sql6`${ownedEquipment.quantity} + 1`,
            currentHashrate: sql6`${ownedEquipment.currentHashrate} + ${et.baseHashrate}`
          }).where(eq6(ownedEquipment.id, owned.id)).returning();
          equipment2 = updated[0];
        } else {
          const inserted = await tx.insert(ownedEquipment).values({
            userId,
            equipmentTypeId: parsed.data.equipmentTypeId,
            currentHashrate: et.baseHashrate
          }).returning();
          equipment2 = inserted[0];
        }
        if (!(isFirstBasicLaptop && isFirstPurchase)) {
          const balanceField = et.currency === "CS" ? "csBalance" : "chstBalance";
          await tx.update(users).set({
            [balanceField]: sql6`${balanceField === "csBalance" ? users.csBalance : users.chstBalance} - ${et.basePrice}`,
            totalHashrate: sql6`${users.totalHashrate} + ${et.baseHashrate}`
          }).where(eq6(users.id, userId));
        } else {
          await tx.update(users).set({ totalHashrate: sql6`${users.totalHashrate} + ${et.baseHashrate}` }).where(eq6(users.id, userId));
        }
        return equipment2;
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
}

// server/routes/announcements.routes.ts
init_storage();
init_schema();
import { eq as eq8 } from "drizzle-orm";

// server/services/announcements.ts
init_storage();
init_schema();
import { eq as eq7, and as and4, sql as sql7, isNull, lte } from "drizzle-orm";
async function sendAnnouncementToAllUsers(announcementId) {
  try {
    const announcement = await db.select().from(announcements).where(eq7(announcements.id, announcementId)).limit(1);
    if (!announcement[0]) {
      throw new Error("Announcement not found");
    }
    const ann = announcement[0];
    let targetUsers = [];
    if (ann.targetAudience === "all") {
      targetUsers = await db.select({
        telegramId: users.telegramId,
        username: users.username
      }).from(users);
    } else {
      targetUsers = await db.select({
        telegramId: users.telegramId,
        username: users.username
      }).from(users);
    }
    console.log(`\u{1F4E3} Sending announcement "${ann.title}" to ${targetUsers.length} users...`);
    let sentCount = 0;
    const failedUsers = [];
    const BATCH_SIZE = 30;
    const BATCH_DELAY = 1e3;
    for (let i = 0; i < targetUsers.length; i += BATCH_SIZE) {
      const batch = targetUsers.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(async (user) => {
          try {
            const message = `\u{1F4E2} *${ann.title}*

${ann.message}`;
            await sendMessageToUser(user.telegramId, message);
            sentCount++;
          } catch (error) {
            console.error(`Failed to send announcement to user ${user.telegramId}:`, error.message);
            failedUsers.push(user.telegramId);
          }
        })
      );
      if (i + BATCH_SIZE < targetUsers.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
      }
    }
    await db.update(announcements).set({
      sentAt: /* @__PURE__ */ new Date(),
      totalRecipients: sentCount
    }).where(eq7(announcements.id, announcementId));
    console.log(`\u2705 Announcement sent to ${sentCount}/${targetUsers.length} users (${failedUsers.length} failed)`);
    return {
      totalSent: sentCount,
      failedUsers
    };
  } catch (error) {
    console.error("Send announcement error:", error);
    throw error;
  }
}
async function processScheduledAnnouncements() {
  try {
    const now = /* @__PURE__ */ new Date();
    const pendingAnnouncements = await db.select().from(announcements).where(
      and4(
        eq7(announcements.isActive, true),
        isNull(announcements.sentAt),
        lte(announcements.scheduledFor, now)
      )
    );
    console.log(`\u23F0 Found ${pendingAnnouncements.length} scheduled announcements to send`);
    for (const announcement of pendingAnnouncements) {
      try {
        await sendAnnouncementToAllUsers(announcement.id);
      } catch (error) {
        console.error(`Failed to send scheduled announcement ${announcement.id}:`, error.message);
      }
    }
  } catch (error) {
    console.error("Process scheduled announcements error:", error);
  }
}
async function getActiveAnnouncementsForUser(telegramId) {
  try {
    const now = /* @__PURE__ */ new Date();
    const activeAnnouncements = await db.select().from(announcements).where(
      and4(
        eq7(announcements.isActive, true),
        sql7`${announcements.sentAt} IS NOT NULL`,
        sql7`(${announcements.expiresAt} IS NULL OR ${announcements.expiresAt} > ${now})`
      )
    ).orderBy(sql7`${announcements.priority} DESC, ${announcements.createdAt} DESC`);
    const readAnnouncementIds = await db.select({
      announcementId: userAnnouncements.announcementId
    }).from(userAnnouncements).where(eq7(userAnnouncements.telegramId, telegramId));
    const readIds = new Set(readAnnouncementIds.map((r) => r.announcementId));
    const unreadAnnouncements = activeAnnouncements.filter((a) => !readIds.has(a.id));
    return unreadAnnouncements;
  } catch (error) {
    console.error("Get active announcements error:", error);
    throw error;
  }
}
async function markAnnouncementAsRead(announcementId, telegramId) {
  try {
    const existing = await db.select().from(userAnnouncements).where(
      and4(
        eq7(userAnnouncements.announcementId, announcementId),
        eq7(userAnnouncements.telegramId, telegramId)
      )
    ).limit(1);
    if (existing.length > 0) {
      return;
    }
    await db.insert(userAnnouncements).values({
      announcementId,
      telegramId
    });
    await db.update(announcements).set({
      readCount: sql7`${announcements.readCount} + 1`
    }).where(eq7(announcements.id, announcementId));
  } catch (error) {
    console.error("Mark announcement as read error:", error);
    throw error;
  }
}
async function getAllAnnouncements(limit = 50) {
  try {
    const allAnnouncements = await db.select().from(announcements).orderBy(sql7`${announcements.createdAt} DESC`).limit(limit);
    return allAnnouncements;
  } catch (error) {
    console.error("Get all announcements error:", error);
    throw error;
  }
}

// server/routes/announcements.routes.ts
function registerAnnouncementRoutes(app2) {
  app2.post("/api/admin/announcements", validateTelegramAuth, requireAdmin, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const parsed = insertAnnouncementSchema.safeParse({
        ...req.body,
        createdBy: req.telegramUser.id.toString()
      });
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid announcement data",
          details: parsed.error.errors
        });
      }
      const data = parsed.data;
      const validTypes = ["info", "warning", "success", "event", "maintenance"];
      const validPriorities = ["low", "normal", "high", "critical"];
      const validAudiences = ["all", "active", "whales", "new_users", "at_risk"];
      if (!validTypes.includes(data.type)) {
        return res.status(400).json({ error: `Invalid type. Must be one of: ${validTypes.join(", ")}` });
      }
      if (!validPriorities.includes(data.priority)) {
        return res.status(400).json({ error: `Invalid priority. Must be one of: ${validPriorities.join(", ")}` });
      }
      if (!validAudiences.includes(data.targetAudience)) {
        return res.status(400).json({ error: `Invalid target audience. Must be one of: ${validAudiences.join(", ")}` });
      }
      const [newAnnouncement] = await db.insert(announcements).values(data).returning();
      const shouldSendNow = !data.scheduledFor || new Date(data.scheduledFor) <= /* @__PURE__ */ new Date();
      if (shouldSendNow) {
        sendAnnouncementToAllUsers(newAnnouncement.id).catch((error) => {
          console.error("Failed to send announcement:", error);
        });
      }
      res.json({
        success: true,
        announcement: newAnnouncement,
        sendingNow: shouldSendNow
      });
    } catch (error) {
      console.error("Create announcement error:", error);
      res.status(500).json({ error: error.message || "Failed to create announcement" });
    }
  });
  app2.get("/api/admin/announcements", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const allAnnouncements = await getAllAnnouncements(limit);
      res.json(allAnnouncements);
    } catch (error) {
      console.error("Get announcements error:", error);
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });
  app2.put("/api/admin/announcements/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const announcementId = parseInt(req.params.id);
      const existing = await db.select().from(announcements).where(eq8(announcements.id, announcementId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Announcement not found" });
      }
      if (existing[0].sentAt) {
        return res.status(400).json({ error: "Cannot update announcement that has already been sent" });
      }
      const [updated] = await db.update(announcements).set({
        title: req.body.title || existing[0].title,
        message: req.body.message || existing[0].message,
        type: req.body.type || existing[0].type,
        priority: req.body.priority || existing[0].priority,
        targetAudience: req.body.targetAudience || existing[0].targetAudience,
        scheduledFor: req.body.scheduledFor !== void 0 ? req.body.scheduledFor : existing[0].scheduledFor,
        expiresAt: req.body.expiresAt !== void 0 ? req.body.expiresAt : existing[0].expiresAt,
        isActive: req.body.isActive !== void 0 ? req.body.isActive : existing[0].isActive
      }).where(eq8(announcements.id, announcementId)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Update announcement error:", error);
      res.status(500).json({ error: "Failed to update announcement" });
    }
  });
  app2.delete("/api/admin/announcements/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const announcementId = parseInt(req.params.id);
      await db.delete(announcements).where(eq8(announcements.id, announcementId));
      res.json({ success: true, message: "Announcement deleted" });
    } catch (error) {
      console.error("Delete announcement error:", error);
      res.status(500).json({ error: "Failed to delete announcement" });
    }
  });
  app2.post("/api/admin/announcements/:id/send", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const announcementId = parseInt(req.params.id);
      const existing = await db.select().from(announcements).where(eq8(announcements.id, announcementId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Announcement not found" });
      }
      if (existing[0].sentAt) {
        return res.status(400).json({ error: "Announcement has already been sent" });
      }
      const result = await sendAnnouncementToAllUsers(announcementId);
      res.json({
        success: true,
        totalSent: result.totalSent,
        failedCount: result.failedUsers.length
      });
    } catch (error) {
      console.error("Force send announcement error:", error);
      res.status(500).json({ error: error.message || "Failed to send announcement" });
    }
  });
  app2.get("/api/announcements/active", validateTelegramAuth, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const activeAnnouncements = await getActiveAnnouncementsForUser(req.telegramUser.id.toString());
      res.json(activeAnnouncements);
    } catch (error) {
      console.error("Get active announcements error:", error);
      res.status(500).json({ error: "Failed to fetch active announcements" });
    }
  });
  app2.post("/api/announcements/:id/mark-read", validateTelegramAuth, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const announcementId = parseInt(req.params.id);
      await markAnnouncementAsRead(announcementId, req.telegramUser.id.toString());
      res.json({ success: true, message: "Announcement marked as read" });
    } catch (error) {
      console.error("Mark announcement as read error:", error);
      res.status(500).json({ error: "Failed to mark announcement as read" });
    }
  });
}

// server/routes/promoCodes.routes.ts
init_storage();
init_schema();
import { eq as eq10 } from "drizzle-orm";

// server/services/promoCodes.ts
init_storage();
init_schema();
import { eq as eq9, and as and6, sql as sql8 } from "drizzle-orm";
function generateUniqueCode(length = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
async function validatePromoCode(code, telegramId) {
  try {
    const promoCode = await db.select().from(promoCodes).where(sql8`UPPER(${promoCodes.code}) = UPPER(${code})`).limit(1);
    if (promoCode.length === 0) {
      return { valid: false, error: "Invalid promo code" };
    }
    const promo = promoCode[0];
    if (!promo.isActive) {
      return { valid: false, error: "This promo code is no longer active" };
    }
    if (promo.validUntil && new Date(promo.validUntil) < /* @__PURE__ */ new Date()) {
      return { valid: false, error: "This promo code has expired" };
    }
    if (new Date(promo.validFrom) > /* @__PURE__ */ new Date()) {
      return { valid: false, error: "This promo code is not yet valid" };
    }
    if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
      return { valid: false, error: "This promo code has reached its maximum number of uses" };
    }
    const userRedemption = await db.select().from(promoCodeRedemptions).where(
      and6(
        eq9(promoCodeRedemptions.promoCodeId, promo.id),
        eq9(promoCodeRedemptions.telegramId, telegramId)
      )
    ).limit(1);
    if (userRedemption.length > 0) {
      return { valid: false, error: "You have already used this promo code" };
    }
    const userUseCount = await db.select({ count: sql8`COUNT(*)` }).from(promoCodeRedemptions).where(
      and6(
        eq9(promoCodeRedemptions.promoCodeId, promo.id),
        eq9(promoCodeRedemptions.telegramId, telegramId)
      )
    );
    if (userUseCount[0]?.count >= promo.maxUsesPerUser) {
      return { valid: false, error: "You have reached the maximum number of uses for this promo code" };
    }
    return { valid: true, promoCode: promo };
  } catch (error) {
    console.error("Validate promo code error:", error);
    throw error;
  }
}
async function applyPromoReward(tx, userId, telegramId, rewardType, rewardAmount, rewardData) {
  const reward = {};
  switch (rewardType) {
    case "cs":
      const csAmount = parseFloat(rewardAmount || "0");
      await tx.update(users).set({ csBalance: sql8`${users.csBalance} + ${csAmount}` }).where(eq9(users.id, userId));
      reward.cs = csAmount;
      break;
    case "chst":
      const chstAmount = parseFloat(rewardAmount || "0");
      await tx.update(users).set({ chstBalance: sql8`${users.chstBalance} + ${chstAmount}` }).where(eq9(users.id, userId));
      reward.chst = chstAmount;
      break;
    case "equipment":
      const equipmentData = rewardData ? JSON.parse(rewardData) : {};
      const equipmentId = equipmentData.equipmentId;
      if (equipmentId) {
        const equipmentType = await tx.select().from(equipmentTypes).where(eq9(equipmentTypes.id, equipmentId)).limit(1);
        if (equipmentType.length > 0) {
          const et = equipmentType[0];
          const existing = await tx.select().from(ownedEquipment).where(
            and6(
              eq9(ownedEquipment.userId, userId),
              eq9(ownedEquipment.equipmentTypeId, equipmentId)
            )
          ).limit(1);
          if (existing.length > 0) {
            await tx.update(ownedEquipment).set({
              quantity: sql8`${ownedEquipment.quantity} + 1`,
              currentHashrate: sql8`${ownedEquipment.currentHashrate} + ${et.baseHashrate}`
            }).where(eq9(ownedEquipment.id, existing[0].id));
          } else {
            await tx.insert(ownedEquipment).values({
              userId,
              equipmentTypeId: equipmentId,
              currentHashrate: et.baseHashrate,
              quantity: 1
            });
          }
          await tx.update(users).set({ totalHashrate: sql8`${users.totalHashrate} + ${et.baseHashrate}` }).where(eq9(users.id, userId));
          reward.equipment = {
            id: equipmentId,
            name: et.name,
            hashrate: et.baseHashrate
          };
        }
      }
      break;
    case "powerup":
      const powerupData = rewardData ? JSON.parse(rewardData) : {};
      const powerupType = powerupData.type || "hashrate-boost";
      const boostPercentage = powerupData.boost || 50;
      const durationHours = powerupData.duration || 24;
      const expiresAt = /* @__PURE__ */ new Date();
      expiresAt.setHours(expiresAt.getHours() + durationHours);
      await tx.insert(activePowerUps).values({
        userId: telegramId,
        powerUpType: powerupType,
        boostPercentage,
        expiresAt,
        isActive: true
      });
      reward.powerup = {
        type: powerupType,
        boost: boostPercentage,
        duration: durationHours
      };
      break;
    case "bundle":
      const bundleData = rewardData ? JSON.parse(rewardData) : {};
      reward.bundle = [];
      if (bundleData.cs) {
        await tx.update(users).set({ csBalance: sql8`${users.csBalance} + ${bundleData.cs}` }).where(eq9(users.id, userId));
        reward.bundle.push({ type: "cs", amount: bundleData.cs });
      }
      if (bundleData.chst) {
        await tx.update(users).set({ chstBalance: sql8`${users.chstBalance} + ${bundleData.chst}` }).where(eq9(users.id, userId));
        reward.bundle.push({ type: "chst", amount: bundleData.chst });
      }
      break;
    default:
      throw new Error(`Unknown reward type: ${rewardType}`);
  }
  return reward;
}
async function redeemPromoCode(code, telegramId, ipAddress) {
  try {
    const validation = await validatePromoCode(code, telegramId);
    if (!validation.valid) {
      return { success: false, reward: null, error: validation.error };
    }
    const promo = validation.promoCode;
    const user = await db.select().from(users).where(eq9(users.telegramId, telegramId)).limit(1);
    if (user.length === 0) {
      return { success: false, reward: null, error: "User not found" };
    }
    const result = await db.transaction(async (tx) => {
      const currentUses = await tx.select({ uses: promoCodes.currentUses }).from(promoCodes).where(eq9(promoCodes.id, promo.id)).for("update").limit(1);
      if (promo.maxUses !== null && currentUses[0].uses >= promo.maxUses) {
        throw new Error("Promo code max uses reached");
      }
      const reward = await applyPromoReward(
        tx,
        user[0].id,
        telegramId,
        promo.rewardType,
        promo.rewardAmount,
        promo.rewardData
      );
      await tx.insert(promoCodeRedemptions).values({
        promoCodeId: promo.id,
        telegramId,
        rewardGiven: JSON.stringify(reward),
        ipAddress: ipAddress || null
      });
      await tx.update(promoCodes).set({ currentUses: sql8`${promoCodes.currentUses} + 1` }).where(eq9(promoCodes.id, promo.id));
      return reward;
    });
    return { success: true, reward: result };
  } catch (error) {
    console.error("Redeem promo code error:", error);
    return { success: false, reward: null, error: error.message || "Failed to redeem promo code" };
  }
}
async function getAllPromoCodes(limit = 100) {
  try {
    const codes = await db.select().from(promoCodes).orderBy(sql8`${promoCodes.createdAt} DESC`).limit(limit);
    return codes;
  } catch (error) {
    console.error("Get all promo codes error:", error);
    throw error;
  }
}
async function getPromoCodeRedemptions(promoCodeId) {
  try {
    const redemptions = await db.select({
      id: promoCodeRedemptions.id,
      telegramId: promoCodeRedemptions.telegramId,
      username: users.username,
      redeemedAt: promoCodeRedemptions.redeemedAt,
      rewardGiven: promoCodeRedemptions.rewardGiven,
      ipAddress: promoCodeRedemptions.ipAddress
    }).from(promoCodeRedemptions).leftJoin(users, eq9(users.telegramId, promoCodeRedemptions.telegramId)).where(eq9(promoCodeRedemptions.promoCodeId, promoCodeId)).orderBy(sql8`${promoCodeRedemptions.redeemedAt} DESC`);
    return redemptions;
  } catch (error) {
    console.error("Get promo code redemptions error:", error);
    throw error;
  }
}

// server/routes/promoCodes.routes.ts
function registerPromoCodeRoutes(app2) {
  app2.post("/api/admin/promo-codes", validateTelegramAuth, requireAdmin, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const data = req.body;
      if (!data.code) {
        let uniqueCode = generateUniqueCode();
        let attempts = 0;
        while (attempts < 10) {
          const existing = await db.select().from(promoCodes).where(eq10(promoCodes.code, uniqueCode)).limit(1);
          if (existing.length === 0) break;
          uniqueCode = generateUniqueCode();
          attempts++;
        }
        data.code = uniqueCode;
      }
      data.code = data.code.toUpperCase();
      const validTypes = ["cs", "chst", "equipment", "powerup", "lootbox", "bundle"];
      if (!validTypes.includes(data.rewardType)) {
        return res.status(400).json({ error: `Invalid reward type. Must be one of: ${validTypes.join(", ")}` });
      }
      const parsed = insertPromoCodeSchema.safeParse({
        ...data,
        createdBy: req.telegramUser.id.toString()
      });
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid promo code data",
          details: parsed.error.errors
        });
      }
      const [newPromoCode] = await db.insert(promoCodes).values(parsed.data).returning();
      res.json({
        success: true,
        promoCode: newPromoCode
      });
    } catch (error) {
      console.error("Create promo code error:", error);
      res.status(500).json({ error: error.message || "Failed to create promo code" });
    }
  });
  app2.get("/api/admin/promo-codes", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const codes = await getAllPromoCodes(limit);
      res.json(codes);
    } catch (error) {
      console.error("Get promo codes error:", error);
      res.status(500).json({ error: "Failed to fetch promo codes" });
    }
  });
  app2.put("/api/admin/promo-codes/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const promoCodeId = parseInt(req.params.id);
      const existing = await db.select().from(promoCodes).where(eq10(promoCodes.id, promoCodeId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Promo code not found" });
      }
      const [updated] = await db.update(promoCodes).set({
        description: req.body.description !== void 0 ? req.body.description : existing[0].description,
        maxUses: req.body.maxUses !== void 0 ? req.body.maxUses : existing[0].maxUses,
        maxUsesPerUser: req.body.maxUsesPerUser !== void 0 ? req.body.maxUsesPerUser : existing[0].maxUsesPerUser,
        validFrom: req.body.validFrom !== void 0 ? req.body.validFrom : existing[0].validFrom,
        validUntil: req.body.validUntil !== void 0 ? req.body.validUntil : existing[0].validUntil,
        isActive: req.body.isActive !== void 0 ? req.body.isActive : existing[0].isActive,
        targetSegment: req.body.targetSegment !== void 0 ? req.body.targetSegment : existing[0].targetSegment
      }).where(eq10(promoCodes.id, promoCodeId)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Update promo code error:", error);
      res.status(500).json({ error: "Failed to update promo code" });
    }
  });
  app2.delete("/api/admin/promo-codes/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const promoCodeId = parseInt(req.params.id);
      await db.update(promoCodes).set({ isActive: false }).where(eq10(promoCodes.id, promoCodeId));
      res.json({ success: true, message: "Promo code deactivated" });
    } catch (error) {
      console.error("Deactivate promo code error:", error);
      res.status(500).json({ error: "Failed to deactivate promo code" });
    }
  });
  app2.get("/api/admin/promo-codes/:id/redemptions", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const promoCodeId = parseInt(req.params.id);
      const redemptions = await getPromoCodeRedemptions(promoCodeId);
      res.json(redemptions);
    } catch (error) {
      console.error("Get redemptions error:", error);
      res.status(500).json({ error: "Failed to fetch redemptions" });
    }
  });
  app2.get("/api/promo-codes/validate", validateTelegramAuth, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const code = req.query.code;
      if (!code) {
        return res.status(400).json({ error: "Promo code is required" });
      }
      const validation = await validatePromoCode(code, req.telegramUser.id.toString());
      res.json(validation);
    } catch (error) {
      console.error("Validate promo code error:", error);
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });
  app2.post("/api/promo-codes/redeem", validateTelegramAuth, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Promo code is required" });
      }
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
      const result = await redeemPromoCode(
        code,
        req.telegramUser.id.toString(),
        typeof ipAddress === "string" ? ipAddress : void 0
      );
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      res.json({
        success: true,
        message: "Promo code redeemed successfully!",
        reward: result.reward
      });
    } catch (error) {
      console.error("Redeem promo code error:", error);
      res.status(500).json({ error: error.message || "Failed to redeem promo code" });
    }
  });
}

// server/routes/analytics.routes.ts
init_storage();
init_schema();
import { sql as sql10, gte as gte2, lte as lte3, and as and8, count as count2 } from "drizzle-orm";

// server/services/analytics.ts
init_storage();
init_schema();
import { eq as eq11, and as and7, gte, lte as lte2, sql as sql9, count } from "drizzle-orm";
async function calculateDAU(date2) {
  try {
    const startOfDay = new Date(date2);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date2);
    endOfDay.setHours(23, 59, 59, 999);
    const result = await db.select({ count: sql9`COUNT(DISTINCT ${userSessions.telegramId})` }).from(userSessions).where(
      and7(
        gte(userSessions.startedAt, startOfDay),
        lte2(userSessions.startedAt, endOfDay)
      )
    );
    return result[0]?.count || 0;
  } catch (error) {
    console.error("Calculate DAU error:", error);
    throw error;
  }
}
async function calculateMAU(date2) {
  try {
    const endDate = new Date(date2);
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date(date2);
    startDate.setDate(startDate.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    const result = await db.select({ count: sql9`COUNT(DISTINCT ${userSessions.telegramId})` }).from(userSessions).where(
      and7(
        gte(userSessions.startedAt, startDate),
        lte2(userSessions.startedAt, endDate)
      )
    );
    return result[0]?.count || 0;
  } catch (error) {
    console.error("Calculate MAU error:", error);
    throw error;
  }
}
async function calculateRetention(cohortDate, dayOffset) {
  try {
    const cohortDateStart = new Date(cohortDate);
    cohortDateStart.setHours(0, 0, 0, 0);
    const cohortDateEnd = new Date(cohortDate);
    cohortDateEnd.setHours(23, 59, 59, 999);
    const cohortUsers = await db.select({ telegramId: users.telegramId }).from(users).where(
      and7(
        gte(users.createdAt, cohortDateStart),
        lte2(users.createdAt, cohortDateEnd)
      )
    );
    const cohortSize = cohortUsers.length;
    if (cohortSize === 0) return 0;
    const targetDate = new Date(cohortDate);
    targetDate.setDate(targetDate.getDate() + dayOffset);
    targetDate.setHours(0, 0, 0, 0);
    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);
    const cohortTelegramIds = cohortUsers.map((u) => u.telegramId).filter((id) => id !== null);
    if (cohortTelegramIds.length === 0) return 0;
    const returnedUsers = await db.select({ count: sql9`COUNT(DISTINCT ${userSessions.telegramId})` }).from(userSessions).where(
      and7(
        sql9`${userSessions.telegramId} IN (${sql9.raw(cohortTelegramIds.map((id) => `'${id}'`).join(","))})`,
        gte(userSessions.startedAt, targetDate),
        lte2(userSessions.startedAt, targetDateEnd)
      )
    );
    const returnedCount = returnedUsers[0]?.count || 0;
    return returnedCount;
  } catch (error) {
    console.error("Calculate retention error:", error);
    throw error;
  }
}
async function generateDailyReport(date2) {
  try {
    const dateStr = date2.toISOString().split("T")[0];
    const startOfDay = new Date(date2);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date2);
    endOfDay.setHours(23, 59, 59, 999);
    const dau = await calculateDAU(date2);
    const totalUsersResult = await db.select({ count: count() }).from(users).where(lte2(users.createdAt, endOfDay));
    const totalUsers = totalUsersResult[0]?.count || 0;
    const newUsersResult = await db.select({ count: count() }).from(users).where(
      and7(
        gte(users.createdAt, startOfDay),
        lte2(users.createdAt, endOfDay)
      )
    );
    const newUsers = newUsersResult[0]?.count || 0;
    const returningUsers = Math.max(0, dau - newUsers);
    const blocksResult = await db.select({ count: count() }).from(blocks).where(
      and7(
        gte(blocks.timestamp, startOfDay),
        lte2(blocks.timestamp, endOfDay)
      )
    );
    const totalBlocks = blocksResult[0]?.count || 0;
    const csGeneratedResult = await db.select({ total: sql9`COALESCE(SUM(${blocks.reward}), 0)` }).from(blocks).where(
      and7(
        gte(blocks.timestamp, startOfDay),
        lte2(blocks.timestamp, endOfDay)
      )
    );
    const csGeneratedToday = csGeneratedResult[0]?.total || 0;
    const csSpentToday = 0;
    const tonFromPowerUps = await db.select({ total: sql9`COALESCE(SUM(${powerUpPurchases.tonAmount}), 0)` }).from(powerUpPurchases).where(
      and7(
        gte(powerUpPurchases.purchasedAt, startOfDay),
        lte2(powerUpPurchases.purchasedAt, endOfDay)
      )
    );
    const tonFromLootBoxes = await db.select({ total: sql9`COALESCE(SUM(${lootBoxPurchases.tonAmount}), 0)` }).from(lootBoxPurchases).where(
      and7(
        gte(lootBoxPurchases.purchasedAt, startOfDay),
        lte2(lootBoxPurchases.purchasedAt, endOfDay)
      )
    );
    const tonFromPacks = await db.select({ total: sql9`COALESCE(SUM(${packPurchases.tonAmount}), 0)` }).from(packPurchases).where(
      and7(
        gte(packPurchases.purchasedAt, startOfDay),
        lte2(packPurchases.purchasedAt, endOfDay)
      )
    );
    const totalTonSpent = (parseFloat(tonFromPowerUps[0]?.total?.toString() || "0") + parseFloat(tonFromLootBoxes[0]?.total?.toString() || "0") + parseFloat(tonFromPacks[0]?.total?.toString() || "0")).toString();
    const powerUpPurchasesResult = await db.select({ count: count() }).from(powerUpPurchases).where(
      and7(
        gte(powerUpPurchases.purchasedAt, startOfDay),
        lte2(powerUpPurchases.purchasedAt, endOfDay)
      )
    );
    const totalPowerUpPurchases = powerUpPurchasesResult[0]?.count || 0;
    const lootBoxPurchasesResult = await db.select({ count: count() }).from(lootBoxPurchases).where(
      and7(
        gte(lootBoxPurchases.purchasedAt, startOfDay),
        lte2(lootBoxPurchases.purchasedAt, endOfDay)
      )
    );
    const totalLootBoxPurchases = lootBoxPurchasesResult[0]?.count || 0;
    const packPurchasesResult = await db.select({ count: count() }).from(packPurchases).where(
      and7(
        gte(packPurchases.purchasedAt, startOfDay),
        lte2(packPurchases.purchasedAt, endOfDay)
      )
    );
    const totalPackPurchases = packPurchasesResult[0]?.count || 0;
    const sessionsResult = await db.select({
      avgDuration: sql9`COALESCE(AVG(${userSessions.durationSeconds}), 0)`
    }).from(userSessions).where(
      and7(
        gte(userSessions.startedAt, startOfDay),
        lte2(userSessions.startedAt, endOfDay),
        sql9`${userSessions.durationSeconds} IS NOT NULL`
      )
    );
    const avgSessionDuration = Math.round(sessionsResult[0]?.avgDuration || 0);
    const avgCsPerUser = dau > 0 ? (csGeneratedToday / dau).toFixed(2) : "0.00";
    const totalCsGeneratedResult = await db.select({ total: sql9`COALESCE(SUM(${blocks.reward}), 0)` }).from(blocks).where(lte2(blocks.timestamp, endOfDay));
    const totalCsGenerated = totalCsGeneratedResult[0]?.total || 0;
    const existing = await db.select().from(dailyAnalytics).where(eq11(dailyAnalytics.date, dateStr)).limit(1);
    const analyticsData = {
      date: dateStr,
      dau,
      newUsers,
      returningUsers,
      totalUsers,
      totalCsGenerated: totalCsGenerated.toString(),
      totalCsSpent: csSpentToday.toString(),
      totalTonSpent,
      totalBlocks,
      avgSessionDuration,
      avgCsPerUser,
      totalPowerUpPurchases,
      totalLootBoxPurchases,
      totalPackPurchases
    };
    if (existing.length > 0) {
      await db.update(dailyAnalytics).set(analyticsData).where(eq11(dailyAnalytics.date, dateStr));
    } else {
      await db.insert(dailyAnalytics).values(analyticsData);
    }
    return analyticsData;
  } catch (error) {
    console.error("Generate daily report error:", error);
    throw error;
  }
}
async function getAnalyticsOverview() {
  try {
    const today = /* @__PURE__ */ new Date();
    const latestAnalytics = await db.select().from(dailyAnalytics).orderBy(sql9`${dailyAnalytics.date} DESC`).limit(1);
    if (latestAnalytics.length === 0) {
      await generateDailyReport(today);
      const freshData = await db.select().from(dailyAnalytics).orderBy(sql9`${dailyAnalytics.date} DESC`).limit(1);
      if (freshData.length === 0) {
        return {
          dau: 0,
          mau: 0,
          totalUsers: 0,
          retentionD7: 0,
          avgCsPerUser: "0.00"
        };
      }
      return freshData[0];
    }
    const latest = latestAnalytics[0];
    const mau = await calculateMAU(today);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cohortDateStr = sevenDaysAgo.toISOString().split("T")[0];
    const d7Retention = await calculateRetention(cohortDateStr, 7);
    const cohortDateStart = new Date(cohortDateStr);
    cohortDateStart.setHours(0, 0, 0, 0);
    const cohortDateEnd = new Date(cohortDateStr);
    cohortDateEnd.setHours(23, 59, 59, 999);
    const cohortSizeResult = await db.select({ count: count() }).from(users).where(
      and7(
        gte(users.createdAt, cohortDateStart),
        lte2(users.createdAt, cohortDateEnd)
      )
    );
    const cohortSize = cohortSizeResult[0]?.count || 0;
    const retentionD7Percent = cohortSize > 0 ? Math.round(d7Retention / cohortSize * 100) : 0;
    return {
      ...latest,
      mau,
      retentionD7: retentionD7Percent
    };
  } catch (error) {
    console.error("Get analytics overview error:", error);
    throw error;
  }
}
async function getDailyAnalyticsHistory(days = 30) {
  try {
    const analytics = await db.select().from(dailyAnalytics).orderBy(sql9`${dailyAnalytics.date} DESC`).limit(days);
    return analytics.reverse();
  } catch (error) {
    console.error("Get daily analytics history error:", error);
    throw error;
  }
}
async function getRetentionCohorts() {
  try {
    const cohorts = await db.select().from(retentionCohorts).orderBy(sql9`${retentionCohorts.cohortDate} DESC`).limit(30);
    return cohorts;
  } catch (error) {
    console.error("Get retention cohorts error:", error);
    throw error;
  }
}
async function updateRetentionCohorts() {
  try {
    const sixtyDaysAgo = /* @__PURE__ */ new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const cohortDates = await db.select({
      date: sql9`DATE(${users.createdAt})`
    }).from(users).where(gte(users.createdAt, sixtyDaysAgo)).groupBy(sql9`DATE(${users.createdAt})`).orderBy(sql9`DATE(${users.createdAt})`);
    for (const cohort of cohortDates) {
      const cohortDate = cohort.date;
      const day0 = await calculateRetention(cohortDate, 0);
      const day1 = await calculateRetention(cohortDate, 1);
      const day3 = await calculateRetention(cohortDate, 3);
      const day7 = await calculateRetention(cohortDate, 7);
      const day14 = await calculateRetention(cohortDate, 14);
      const day30 = await calculateRetention(cohortDate, 30);
      const existing = await db.select().from(retentionCohorts).where(eq11(retentionCohorts.cohortDate, cohortDate)).limit(1);
      const cohortData = {
        cohortDate,
        day0,
        day1,
        day3,
        day7,
        day14,
        day30
      };
      if (existing.length > 0) {
        await db.update(retentionCohorts).set(cohortData).where(eq11(retentionCohorts.cohortDate, cohortDate));
      } else {
        await db.insert(retentionCohorts).values(cohortData);
      }
    }
    console.log(`\u2705 Updated ${cohortDates.length} retention cohorts`);
  } catch (error) {
    console.error("Update retention cohorts error:", error);
    throw error;
  }
}

// server/routes/analytics.routes.ts
function registerAnalyticsRoutes(app2) {
  app2.get("/api/admin/analytics/overview", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const overview = await getAnalyticsOverview();
      res.json(overview);
    } catch (error) {
      console.error("Get analytics overview error:", error);
      res.status(500).json({ error: "Failed to fetch analytics overview" });
    }
  });
  app2.get("/api/admin/analytics/daily", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 30;
      const history = await getDailyAnalyticsHistory(days);
      res.json(history);
    } catch (error) {
      console.error("Get daily analytics error:", error);
      res.status(500).json({ error: "Failed to fetch daily analytics" });
    }
  });
  app2.get("/api/admin/analytics/retention", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const cohorts = await getRetentionCohorts();
      res.json(cohorts);
    } catch (error) {
      console.error("Get retention cohorts error:", error);
      res.status(500).json({ error: "Failed to fetch retention cohorts" });
    }
  });
  app2.get("/api/admin/analytics/revenue", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 30;
      const startDate = /* @__PURE__ */ new Date();
      startDate.setDate(startDate.getDate() - days);
      startDate.setHours(0, 0, 0, 0);
      const endDate = /* @__PURE__ */ new Date();
      endDate.setHours(23, 59, 59, 999);
      const powerUpRevenue = await db.select({
        total: sql10`COALESCE(SUM(${powerUpPurchases.tonAmount}), 0)`,
        count: count2()
      }).from(powerUpPurchases).where(
        and8(
          gte2(powerUpPurchases.purchasedAt, startDate),
          lte3(powerUpPurchases.purchasedAt, endDate)
        )
      );
      const lootBoxRevenue = await db.select({
        total: sql10`COALESCE(SUM(${lootBoxPurchases.tonAmount}), 0)`,
        count: count2()
      }).from(lootBoxPurchases).where(
        and8(
          gte2(lootBoxPurchases.purchasedAt, startDate),
          lte3(lootBoxPurchases.purchasedAt, endDate)
        )
      );
      const packRevenue = await db.select({
        total: sql10`COALESCE(SUM(${packPurchases.tonAmount}), 0)`,
        count: count2()
      }).from(packPurchases).where(
        and8(
          gte2(packPurchases.purchasedAt, startDate),
          lte3(packPurchases.purchasedAt, endDate)
        )
      );
      const totalTon = parseFloat(powerUpRevenue[0]?.total?.toString() || "0") + parseFloat(lootBoxRevenue[0]?.total?.toString() || "0") + parseFloat(packRevenue[0]?.total?.toString() || "0");
      const totalTransactions = (powerUpRevenue[0]?.count || 0) + (lootBoxRevenue[0]?.count || 0) + (packRevenue[0]?.count || 0);
      const payingUsers = await db.select({
        count: sql10`COUNT(DISTINCT COALESCE(${powerUpPurchases.userId}, ${lootBoxPurchases.userId}, ${packPurchases.userId}))`
      }).from(powerUpPurchases).leftJoin(lootBoxPurchases, sql10`1=1`).leftJoin(packPurchases, sql10`1=1`).where(
        sql10`${powerUpPurchases.purchasedAt} >= ${startDate} AND ${powerUpPurchases.purchasedAt} <= ${endDate}
           OR ${lootBoxPurchases.purchasedAt} >= ${startDate} AND ${lootBoxPurchases.purchasedAt} <= ${endDate}
           OR ${packPurchases.purchasedAt} >= ${startDate} AND ${packPurchases.purchasedAt} <= ${endDate}`
      );
      const totalUsersResult = await db.select({ count: count2() }).from(users);
      const totalUsers = totalUsersResult[0]?.count || 1;
      const arpu = totalUsers > 0 ? (totalTon / totalUsers).toFixed(6) : "0.000000";
      res.json({
        totalRevenue: totalTon.toFixed(6),
        totalTransactions,
        payingUsers: payingUsers[0]?.count || 0,
        arpu,
        breakdown: {
          powerUps: {
            revenue: parseFloat(powerUpRevenue[0]?.total?.toString() || "0").toFixed(6),
            count: powerUpRevenue[0]?.count || 0
          },
          lootBoxes: {
            revenue: parseFloat(lootBoxRevenue[0]?.total?.toString() || "0").toFixed(6),
            count: lootBoxRevenue[0]?.count || 0
          },
          packs: {
            revenue: parseFloat(packRevenue[0]?.total?.toString() || "0").toFixed(6),
            count: packRevenue[0]?.count || 0
          }
        }
      });
    } catch (error) {
      console.error("Get revenue metrics error:", error);
      res.status(500).json({ error: "Failed to fetch revenue metrics" });
    }
  });
  app2.get("/api/admin/analytics/users/segments", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const now = /* @__PURE__ */ new Date();
      const threeDaysAgo = new Date(now);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const allUsers = await db.select({
        telegramId: users.telegramId,
        createdAt: users.createdAt
      }).from(users);
      let newUsers = 0;
      let activeUsers = 0;
      let atRiskUsers = 0;
      let churnedUsers = 0;
      for (const user of allUsers) {
        if (!user.telegramId) continue;
        if (user.createdAt >= sevenDaysAgo) {
          newUsers++;
          continue;
        }
        const lastSession = await db.select().from(userSessions).where(sql10`${userSessions.telegramId} = ${user.telegramId}`).orderBy(sql10`${userSessions.startedAt} DESC`).limit(1);
        if (lastSession.length === 0) {
          churnedUsers++;
          continue;
        }
        const lastActivity = lastSession[0].startedAt;
        if (lastActivity >= threeDaysAgo) {
          activeUsers++;
        } else if (lastActivity >= fourteenDaysAgo) {
          atRiskUsers++;
        } else {
          churnedUsers++;
        }
      }
      res.json({
        total: allUsers.length,
        segments: {
          new: newUsers,
          active: activeUsers,
          atRisk: atRiskUsers,
          churned: churnedUsers
        }
      });
    } catch (error) {
      console.error("Get user segments error:", error);
      res.status(500).json({ error: "Failed to fetch user segments" });
    }
  });
  app2.post("/api/admin/analytics/generate-report", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const dateStr = req.body.date;
      let targetDate;
      if (dateStr) {
        targetDate = new Date(dateStr);
      } else {
        targetDate = /* @__PURE__ */ new Date();
        targetDate.setDate(targetDate.getDate() - 1);
      }
      const report = await generateDailyReport(targetDate);
      res.json({
        success: true,
        report,
        message: `Daily report generated for ${report.date}`
      });
    } catch (error) {
      console.error("Generate report error:", error);
      res.status(500).json({ error: "Failed to generate report" });
    }
  });
  app2.post("/api/admin/analytics/update-cohorts", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      await updateRetentionCohorts();
      res.json({
        success: true,
        message: "Retention cohorts updated successfully"
      });
    } catch (error) {
      console.error("Update cohorts error:", error);
      res.status(500).json({ error: "Failed to update retention cohorts" });
    }
  });
}

// server/routes/events.routes.ts
init_storage();
init_schema();
import { eq as eq13 } from "drizzle-orm";

// server/services/events.ts
init_storage();
init_schema();
import { eq as eq12, and as and9, sql as sql11, lte as lte4, gte as gte3, desc as desc2 } from "drizzle-orm";
async function getAllEvents() {
  try {
    const events = await db.select().from(scheduledEvents).orderBy(desc2(scheduledEvents.startTime));
    return events;
  } catch (error) {
    console.error("Get all events error:", error);
    throw error;
  }
}
async function getActiveEvents() {
  try {
    const now = /* @__PURE__ */ new Date();
    const events = await db.select().from(scheduledEvents).where(
      and9(
        eq12(scheduledEvents.isActive, true),
        lte4(scheduledEvents.startTime, now),
        gte3(scheduledEvents.endTime, now)
      )
    ).orderBy(desc2(scheduledEvents.priority));
    return events;
  } catch (error) {
    console.error("Get active events error:", error);
    throw error;
  }
}
async function getUpcomingEvents() {
  try {
    const now = /* @__PURE__ */ new Date();
    const events = await db.select().from(scheduledEvents).where(
      and9(
        eq12(scheduledEvents.isActive, false),
        gte3(scheduledEvents.startTime, now)
      )
    ).orderBy(scheduledEvents.startTime).limit(10);
    return events;
  } catch (error) {
    console.error("Get upcoming events error:", error);
    throw error;
  }
}
async function activateEvent(eventId) {
  try {
    const event = await db.select().from(scheduledEvents).where(eq12(scheduledEvents.id, eventId)).limit(1);
    if (event.length === 0) {
      throw new Error("Event not found");
    }
    const evt = event[0];
    await db.update(scheduledEvents).set({ isActive: true }).where(eq12(scheduledEvents.id, eventId));
    if (!evt.announcementSent) {
      await sendEventAnnouncement(evt, "started");
      await db.update(scheduledEvents).set({ announcementSent: true }).where(eq12(scheduledEvents.id, eventId));
    }
    console.log(`\u2705 Event activated: ${evt.name} (ID: ${eventId})`);
  } catch (error) {
    console.error("Activate event error:", error);
    throw error;
  }
}
async function deactivateEvent(eventId) {
  try {
    const event = await db.select().from(scheduledEvents).where(eq12(scheduledEvents.id, eventId)).limit(1);
    if (event.length === 0) {
      throw new Error("Event not found");
    }
    const evt = event[0];
    await db.update(scheduledEvents).set({ isActive: false }).where(eq12(scheduledEvents.id, eventId));
    const eventData = JSON.parse(evt.eventData);
    switch (evt.eventType) {
      case "community_goal":
        await finalizeCommunityGoal(eventId, eventData);
        break;
      case "tournament":
        await finalizeTournament(eventId, eventData);
        break;
      default:
        break;
    }
    await sendEventAnnouncement(evt, "ended");
    console.log(`\u2705 Event deactivated: ${evt.name} (ID: ${eventId})`);
  } catch (error) {
    console.error("Deactivate event error:", error);
    throw error;
  }
}
async function sendEventAnnouncement(event, status) {
  try {
    const allUsers = await db.select({ telegramId: users.telegramId }).from(users);
    const message = status === "started" ? `\u{1F389} *Event Started: ${event.name}*

${event.description || "A special event is now active!"}

Open the game to participate!` : `\u{1F3C1} *Event Ended: ${event.name}*

Thank you for participating! Check your rewards.`;
    const BATCH_SIZE = 30;
    const BATCH_DELAY = 1e3;
    for (let i = 0; i < allUsers.length; i += BATCH_SIZE) {
      const batch = allUsers.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map(async (user) => {
        if (user.telegramId) {
          try {
            await sendMessageToUser(user.telegramId, message);
          } catch (error) {
            console.error(`Failed to send event announcement to ${user.telegramId}:`, error);
          }
        }
      }));
      if (i + BATCH_SIZE < allUsers.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
      }
    }
    console.log(`\u2705 Event announcement sent to ${allUsers.length} users`);
  } catch (error) {
    console.error("Send event announcement error:", error);
  }
}
async function processScheduledEvents() {
  try {
    const now = /* @__PURE__ */ new Date();
    const eventsToStart = await db.select().from(scheduledEvents).where(
      and9(
        eq12(scheduledEvents.isActive, false),
        lte4(scheduledEvents.startTime, now),
        gte3(scheduledEvents.endTime, now)
      )
    );
    for (const event of eventsToStart) {
      await activateEvent(event.id);
    }
    const eventsToEnd = await db.select().from(scheduledEvents).where(
      and9(
        eq12(scheduledEvents.isActive, true),
        lte4(scheduledEvents.endTime, now)
      )
    );
    for (const event of eventsToEnd) {
      await deactivateEvent(event.id);
    }
    if (eventsToStart.length > 0 || eventsToEnd.length > 0) {
      console.log(`\u2705 Processed ${eventsToStart.length} event starts, ${eventsToEnd.length} event ends`);
    }
  } catch (error) {
    console.error("Process scheduled events error:", error);
    throw error;
  }
}
async function finalizeCommunityGoal(eventId, eventData) {
  try {
    const participants = await db.select().from(eventParticipation).where(eq12(eventParticipation.eventId, eventId));
    const totalContribution = participants.reduce((sum, p) => sum + parseFloat(p.contribution?.toString() || "0"), 0);
    const goalReached = totalContribution >= (eventData.targetCS || 0);
    if (goalReached && eventData.reward) {
      for (const participant of participants) {
        try {
          if (eventData.rewardType === "cs") {
            await db.update(users).set({ csBalance: sql11`${users.csBalance} + ${eventData.rewardAmount || 0}` }).where(eq12(users.telegramId, participant.telegramId));
          } else if (eventData.rewardType === "equipment" && eventData.rewardId) {
            const user = await db.select().from(users).where(eq12(users.telegramId, participant.telegramId)).limit(1);
            if (user.length > 0) {
              const equipment2 = await db.select().from(equipmentTypes).where(eq12(equipmentTypes.id, eventData.rewardId)).limit(1);
              if (equipment2.length > 0) {
                const et = equipment2[0];
                const existing = await db.select().from(ownedEquipment).where(
                  and9(
                    eq12(ownedEquipment.userId, user[0].id),
                    eq12(ownedEquipment.equipmentTypeId, eventData.rewardId)
                  )
                ).limit(1);
                if (existing.length > 0) {
                  await db.update(ownedEquipment).set({
                    quantity: sql11`${ownedEquipment.quantity} + 1`,
                    currentHashrate: sql11`${ownedEquipment.currentHashrate} + ${et.baseHashrate}`
                  }).where(eq12(ownedEquipment.id, existing[0].id));
                } else {
                  await db.insert(ownedEquipment).values({
                    userId: user[0].id,
                    equipmentTypeId: eventData.rewardId,
                    currentHashrate: et.baseHashrate,
                    quantity: 1
                  });
                }
                await db.update(users).set({ totalHashrate: sql11`${users.totalHashrate} + ${et.baseHashrate}` }).where(eq12(users.id, user[0].id));
              }
            }
          }
          await db.update(eventParticipation).set({ rewardClaimed: true }).where(
            and9(
              eq12(eventParticipation.eventId, eventId),
              eq12(eventParticipation.telegramId, participant.telegramId)
            )
          );
          const rewardMessage = `\u{1F389} *Community Goal Completed!*

You've received your reward: ${eventData.reward}

Thank you for participating!`;
          await sendMessageToUser(participant.telegramId, rewardMessage);
        } catch (error) {
          console.error(`Failed to distribute reward to ${participant.telegramId}:`, error);
        }
      }
      console.log(`\u2705 Community goal rewards distributed to ${participants.length} participants`);
    } else {
      console.log(`\u26A0\uFE0F Community goal not reached. Target: ${eventData.targetCS}, Actual: ${totalContribution}`);
    }
  } catch (error) {
    console.error("Finalize community goal error:", error);
    throw error;
  }
}
async function finalizeTournament(eventId, eventData) {
  try {
    const event = await db.select().from(scheduledEvents).where(eq12(scheduledEvents.id, eventId)).limit(1);
    if (event.length === 0) return;
    const evt = event[0];
    const participants = await db.select().from(eventParticipation).where(eq12(eventParticipation.eventId, eventId)).orderBy(desc2(eventParticipation.contribution));
    for (let i = 0; i < participants.length; i++) {
      await db.update(eventParticipation).set({ rank: i + 1 }).where(eq12(eventParticipation.id, participants[i].id));
    }
    if (eventData.prizes && Array.isArray(eventData.prizes)) {
      for (const prize of eventData.prizes) {
        const targetRanks = prize.rank ? [prize.rank] : prize.ranks || [];
        for (const rank of targetRanks) {
          const winner = participants.find((p, idx) => idx + 1 === rank);
          if (winner && prize.cs) {
            await db.update(users).set({ csBalance: sql11`${users.csBalance} + ${prize.cs}` }).where(eq12(users.telegramId, winner.telegramId));
            await db.update(eventParticipation).set({ rewardClaimed: true }).where(eq12(eventParticipation.id, winner.id));
            const message = `\u{1F3C6} *Tournament Completed!*

You ranked #${rank} in "${evt.name}"!

Your prize: ${prize.cs.toLocaleString()} CS

Congratulations!`;
            await sendMessageToUser(winner.telegramId, message);
          }
        }
      }
      console.log(`\u2705 Tournament prizes distributed to top ${eventData.prizes.length} winners`);
    }
  } catch (error) {
    console.error("Finalize tournament error:", error);
    throw error;
  }
}
async function getEventParticipation(eventId) {
  try {
    const participation = await db.select({
      id: eventParticipation.id,
      telegramId: eventParticipation.telegramId,
      username: users.username,
      contribution: eventParticipation.contribution,
      rank: eventParticipation.rank,
      rewardClaimed: eventParticipation.rewardClaimed,
      participatedAt: eventParticipation.participatedAt
    }).from(eventParticipation).leftJoin(users, eq12(users.telegramId, eventParticipation.telegramId)).where(eq12(eventParticipation.eventId, eventId)).orderBy(desc2(eventParticipation.contribution));
    return participation;
  } catch (error) {
    console.error("Get event participation error:", error);
    throw error;
  }
}

// server/routes/events.routes.ts
function registerEventsRoutes(app2) {
  app2.post("/api/admin/events", validateTelegramAuth, requireAdmin, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const parsed = insertScheduledEventSchema.safeParse({
        ...req.body,
        createdBy: req.telegramUser.id.toString()
      });
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid event data",
          details: parsed.error.errors
        });
      }
      const data = parsed.data;
      const validTypes = ["multiplier", "flash_sale", "community_goal", "tournament", "custom"];
      if (!validTypes.includes(data.eventType)) {
        return res.status(400).json({ error: `Invalid event type. Must be one of: ${validTypes.join(", ")}` });
      }
      try {
        JSON.parse(data.eventData);
      } catch (e) {
        return res.status(400).json({ error: "eventData must be valid JSON" });
      }
      const [newEvent] = await db.insert(scheduledEvents).values(data).returning();
      res.json({
        success: true,
        event: newEvent
      });
    } catch (error) {
      console.error("Create event error:", error);
      res.status(500).json({ error: error.message || "Failed to create event" });
    }
  });
  app2.get("/api/admin/events", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const events = await getAllEvents();
      res.json(events);
    } catch (error) {
      console.error("Get events error:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });
  app2.put("/api/admin/events/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const existing = await db.select().from(scheduledEvents).where(eq13(scheduledEvents.id, eventId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (existing[0].isActive) {
        return res.status(400).json({ error: "Cannot update active event" });
      }
      if (req.body.eventData) {
        try {
          JSON.parse(req.body.eventData);
        } catch (e) {
          return res.status(400).json({ error: "eventData must be valid JSON" });
        }
      }
      const [updated] = await db.update(scheduledEvents).set({
        name: req.body.name !== void 0 ? req.body.name : existing[0].name,
        description: req.body.description !== void 0 ? req.body.description : existing[0].description,
        eventType: req.body.eventType !== void 0 ? req.body.eventType : existing[0].eventType,
        eventData: req.body.eventData !== void 0 ? req.body.eventData : existing[0].eventData,
        startTime: req.body.startTime !== void 0 ? req.body.startTime : existing[0].startTime,
        endTime: req.body.endTime !== void 0 ? req.body.endTime : existing[0].endTime,
        isRecurring: req.body.isRecurring !== void 0 ? req.body.isRecurring : existing[0].isRecurring,
        recurrenceRule: req.body.recurrenceRule !== void 0 ? req.body.recurrenceRule : existing[0].recurrenceRule,
        priority: req.body.priority !== void 0 ? req.body.priority : existing[0].priority,
        bannerImage: req.body.bannerImage !== void 0 ? req.body.bannerImage : existing[0].bannerImage
      }).where(eq13(scheduledEvents.id, eventId)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Update event error:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });
  app2.delete("/api/admin/events/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const existing = await db.select().from(scheduledEvents).where(eq13(scheduledEvents.id, eventId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (existing[0].isActive) {
        return res.status(400).json({ error: "Cannot delete active event. End it first." });
      }
      await db.delete(scheduledEvents).where(eq13(scheduledEvents.id, eventId));
      res.json({ success: true, message: "Event deleted" });
    } catch (error) {
      console.error("Delete event error:", error);
      res.status(500).json({ error: "Failed to delete event" });
    }
  });
  app2.post("/api/admin/events/:id/activate", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const existing = await db.select().from(scheduledEvents).where(eq13(scheduledEvents.id, eventId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (existing[0].isActive) {
        return res.status(400).json({ error: "Event is already active" });
      }
      await activateEvent(eventId);
      res.json({
        success: true,
        message: "Event activated"
      });
    } catch (error) {
      console.error("Activate event error:", error);
      res.status(500).json({ error: error.message || "Failed to activate event" });
    }
  });
  app2.post("/api/admin/events/:id/end", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const existing = await db.select().from(scheduledEvents).where(eq13(scheduledEvents.id, eventId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Event not found" });
      }
      if (!existing[0].isActive) {
        return res.status(400).json({ error: "Event is not active" });
      }
      await deactivateEvent(eventId);
      res.json({
        success: true,
        message: "Event ended"
      });
    } catch (error) {
      console.error("End event error:", error);
      res.status(500).json({ error: error.message || "Failed to end event" });
    }
  });
  app2.get("/api/admin/events/:id/participation", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const participation = await getEventParticipation(eventId);
      res.json(participation);
    } catch (error) {
      console.error("Get event participation error:", error);
      res.status(500).json({ error: "Failed to fetch event participation" });
    }
  });
  app2.get("/api/events/active", validateTelegramAuth, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const activeEvents = await getActiveEvents();
      res.json(activeEvents);
    } catch (error) {
      console.error("Get active events error:", error);
      res.status(500).json({ error: "Failed to fetch active events" });
    }
  });
  app2.get("/api/events/upcoming", validateTelegramAuth, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const upcomingEvents = await getUpcomingEvents();
      res.json(upcomingEvents);
    } catch (error) {
      console.error("Get upcoming events error:", error);
      res.status(500).json({ error: "Failed to fetch upcoming events" });
    }
  });
  app2.post("/api/events/:id/claim-reward", validateTelegramAuth, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const eventId = parseInt(req.params.id);
      res.json({
        success: true,
        message: "Rewards are automatically distributed when events end"
      });
    } catch (error) {
      console.error("Claim reward error:", error);
      res.status(500).json({ error: "Failed to claim reward" });
    }
  });
}

// server/services/economy.ts
init_storage();
init_schema();
import { eq as eq14, sql as sql12, lte as lte5, gte as gte4, and as and10, desc as desc3 } from "drizzle-orm";
function calculateGiniCoefficient(balances) {
  if (balances.length === 0) return 0;
  const sorted = balances.filter((b) => b >= 0).sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return 0;
  let sumWeighted = 0;
  let sumTotal = 0;
  for (let i = 0; i < n; i++) {
    sumWeighted += (i + 1) * sorted[i];
    sumTotal += sorted[i];
  }
  if (sumTotal === 0) return 0;
  const gini = 2 * sumWeighted / (n * sumTotal) - (n + 1) / n;
  return Math.max(0, Math.min(1, gini));
}
async function calculateWealthDistribution() {
  try {
    const allUsers = await db.select({
      balance: users.csBalance
    }).from(users);
    const balances = allUsers.map((u) => u.balance || 0).sort((a, b) => b - a);
    const totalBalance = balances.reduce((sum, b) => sum + b, 0);
    if (totalBalance === 0 || balances.length === 0) {
      return { top1Percent: 0, top10Percent: 0, giniCoefficient: 0 };
    }
    const top1Count = Math.max(1, Math.ceil(balances.length * 0.01));
    const top1Sum = balances.slice(0, top1Count).reduce((sum, b) => sum + b, 0);
    const top1Percent = top1Sum / totalBalance * 100;
    const top10Count = Math.max(1, Math.ceil(balances.length * 0.1));
    const top10Sum = balances.slice(0, top10Count).reduce((sum, b) => sum + b, 0);
    const top10Percent = top10Sum / totalBalance * 100;
    const giniCoefficient = calculateGiniCoefficient(balances);
    return {
      top1Percent: parseFloat(top1Percent.toFixed(2)),
      top10Percent: parseFloat(top10Percent.toFixed(2)),
      giniCoefficient: parseFloat(giniCoefficient.toFixed(4))
    };
  } catch (error) {
    console.error("Calculate wealth distribution error:", error);
    throw error;
  }
}
async function calculateDailyEconomyMetrics(date2) {
  try {
    const dateStr = date2.toISOString().split("T")[0];
    const startOfDay = new Date(date2);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date2);
    endOfDay.setHours(23, 59, 59, 999);
    const circulationResult = await db.select({
      total: sql12`COALESCE(SUM(${users.csBalance}), 0)`
    }).from(users);
    const totalCsInCirculation = circulationResult[0]?.total || 0;
    const generatedResult = await db.select({
      total: sql12`COALESCE(SUM(${blocks.reward}), 0)`
    }).from(blocks).where(lte5(blocks.timestamp, endOfDay));
    const totalCsGenerated = generatedResult[0]?.total || 0;
    const todayGeneratedResult = await db.select({
      total: sql12`COALESCE(SUM(${blocks.reward}), 0)`
    }).from(blocks).where(
      and10(
        gte4(blocks.timestamp, startOfDay),
        lte5(blocks.timestamp, endOfDay)
      )
    );
    const csGeneratedToday = todayGeneratedResult[0]?.total || 0;
    const csSpentToday = 0;
    const netCsChange = csGeneratedToday - csSpentToday;
    const inflationRatePercent = totalCsInCirculation > 0 ? csGeneratedToday / totalCsInCirculation * 100 : 0;
    const totalUsersResult = await db.select({
      count: sql12`COUNT(*)`
    }).from(users);
    const totalUsers = totalUsersResult[0]?.count || 1;
    const avgBalancePerUser = totalUsers > 0 ? totalCsInCirculation / totalUsers : 0;
    const allBalances = await db.select({ balance: users.csBalance }).from(users).orderBy(users.csBalance);
    const medianIndex = Math.floor(allBalances.length / 2);
    const medianBalance = allBalances.length > 0 ? allBalances.length % 2 === 0 ? ((allBalances[medianIndex - 1]?.balance || 0) + (allBalances[medianIndex]?.balance || 0)) / 2 : allBalances[medianIndex]?.balance || 0 : 0;
    const { top1Percent, top10Percent, giniCoefficient } = await calculateWealthDistribution();
    const activeWalletsResult = await db.select({
      count: sql12`COUNT(*)`
    }).from(users).where(sql12`${users.csBalance} > 0`);
    const activeWallets = activeWalletsResult[0]?.count || 0;
    const existing = await db.select().from(economyMetrics).where(eq14(economyMetrics.date, dateStr)).limit(1);
    const metricsData = {
      date: dateStr,
      totalCsInCirculation: totalCsInCirculation.toString(),
      totalCsGenerated: totalCsGenerated.toString(),
      csGeneratedToday: csGeneratedToday.toString(),
      csSpentToday: csSpentToday.toString(),
      netCsChange: netCsChange.toString(),
      inflationRatePercent: inflationRatePercent.toFixed(4),
      avgBalancePerUser: avgBalancePerUser.toFixed(2),
      medianBalance: medianBalance.toFixed(2),
      top1PercentOwnership: top1Percent.toString(),
      top10PercentOwnership: top10Percent.toString(),
      giniCoefficient: giniCoefficient.toString(),
      activeWallets
    };
    if (existing.length > 0) {
      await db.update(economyMetrics).set(metricsData).where(eq14(economyMetrics.date, dateStr));
    } else {
      await db.insert(economyMetrics).values(metricsData);
    }
    console.log(`\u2705 Economy metrics calculated for ${dateStr}`);
    await checkEconomyAlerts(dateStr, metricsData);
  } catch (error) {
    console.error("Calculate daily economy metrics error:", error);
    throw error;
  }
}
async function calculateEconomySinks(date2) {
  try {
    const dateStr = date2.toISOString().split("T")[0];
    const sinkTypes = ["equipment", "powerups", "lootboxes", "packs", "upgrades", "cosmetics", "other"];
    for (const sinkType of sinkTypes) {
      const existing = await db.select().from(economySinks).where(
        and10(
          eq14(economySinks.date, dateStr),
          eq14(economySinks.sinkType, sinkType)
        )
      ).limit(1);
      if (existing.length === 0) {
        await db.insert(economySinks).values({
          date: dateStr,
          sinkType,
          csSpent: "0",
          transactionCount: 0
        });
      }
    }
    console.log(`\u2705 Economy sinks calculated for ${dateStr}`);
  } catch (error) {
    console.error("Calculate economy sinks error:", error);
    throw error;
  }
}
async function checkEconomyAlerts(dateStr, metrics) {
  try {
    const alerts = [];
    const inflationRate = parseFloat(metrics.inflationRatePercent);
    if (inflationRate > 5) {
      alerts.push({
        alertType: "high_inflation",
        severity: inflationRate > 10 ? "critical" : "warning",
        message: `Daily inflation rate is ${inflationRate.toFixed(2)}% (threshold: 5%). Consider adding more CS sinks or reducing mining rewards.`,
        metric: { inflationRate, threshold: 5 }
      });
    }
    const csGenerated = parseFloat(metrics.csGeneratedToday);
    const csSpent = parseFloat(metrics.csSpentToday);
    if (csGenerated > 0 && csSpent < csGenerated * 0.5) {
      alerts.push({
        alertType: "negative_sinks",
        severity: "warning",
        message: `CS spending is low. Generated: ${csGenerated.toFixed(0)}, Spent: ${csSpent.toFixed(0)}. Players may not be engaged with CS sinks.`,
        metric: { csGenerated, csSpent, ratio: csSpent / csGenerated }
      });
    }
    const top10Ownership = parseFloat(metrics.top10PercentOwnership);
    if (top10Ownership > 80) {
      alerts.push({
        alertType: "wealth_concentration",
        severity: top10Ownership > 90 ? "critical" : "warning",
        message: `Top 10% of users own ${top10Ownership.toFixed(1)}% of all CS (threshold: 80%). Consider progressive pricing or wealth redistribution mechanics.`,
        metric: { top10Ownership, threshold: 80 }
      });
    }
    const netChange = parseFloat(metrics.netCsChange);
    if (netChange < 0) {
      alerts.push({
        alertType: "deflation",
        severity: "info",
        message: `Net CS change is negative (${netChange.toFixed(0)}). More CS being removed than generated. This may be intentional or concerning.`,
        metric: { netChange }
      });
    }
    for (const alert of alerts) {
      await db.insert(economyAlerts).values({
        date: dateStr,
        alertType: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        metric: JSON.stringify(alert.metric)
      });
    }
    if (alerts.length > 0) {
      console.log(`\u26A0\uFE0F  Generated ${alerts.length} economy alerts for ${dateStr}`);
    }
  } catch (error) {
    console.error("Check economy alerts error:", error);
  }
}
async function getEconomyOverview() {
  try {
    const latest = await db.select().from(economyMetrics).orderBy(desc3(economyMetrics.date)).limit(1);
    if (latest.length === 0) {
      return {
        totalCsInCirculation: "0",
        inflationRatePercent: "0",
        top10PercentOwnership: "0",
        giniCoefficient: "0",
        activeWallets: 0
      };
    }
    return latest[0];
  } catch (error) {
    console.error("Get economy overview error:", error);
    throw error;
  }
}
async function getEconomyHistory(days = 30) {
  try {
    const history = await db.select().from(economyMetrics).orderBy(desc3(economyMetrics.date)).limit(days);
    return history.reverse();
  } catch (error) {
    console.error("Get economy history error:", error);
    throw error;
  }
}
async function getEconomySinksBreakdown(days = 30) {
  try {
    const endDate = /* @__PURE__ */ new Date();
    const startDate = /* @__PURE__ */ new Date();
    startDate.setDate(startDate.getDate() - days);
    const sinks = await db.select().from(economySinks).where(
      and10(
        gte4(economySinks.date, startDate.toISOString().split("T")[0]),
        lte5(economySinks.date, endDate.toISOString().split("T")[0])
      )
    ).orderBy(economySinks.date);
    return sinks;
  } catch (error) {
    console.error("Get economy sinks breakdown error:", error);
    throw error;
  }
}
async function getActiveAlerts() {
  try {
    const alerts = await db.select().from(economyAlerts).where(eq14(economyAlerts.acknowledged, false)).orderBy(desc3(economyAlerts.createdAt)).limit(50);
    return alerts;
  } catch (error) {
    console.error("Get active alerts error:", error);
    throw error;
  }
}
async function acknowledgeAlert(alertId, adminTelegramId) {
  try {
    await db.update(economyAlerts).set({
      acknowledged: true,
      acknowledgedBy: adminTelegramId
    }).where(eq14(economyAlerts.id, alertId));
    console.log(`\u2705 Alert ${alertId} acknowledged by ${adminTelegramId}`);
  } catch (error) {
    console.error("Acknowledge alert error:", error);
    throw error;
  }
}
function getEconomyRecommendations(metrics) {
  const recommendations = [];
  const inflationRate = parseFloat(metrics.inflationRatePercent || "0");
  const top10Ownership = parseFloat(metrics.top10PercentOwnership || "0");
  const netChange = parseFloat(metrics.netCsChange || "0");
  const csGenerated = parseFloat(metrics.csGeneratedToday || "0");
  const csSpent = parseFloat(metrics.csSpentToday || "0");
  if (inflationRate > 5) {
    recommendations.push("\u26A0\uFE0F High inflation detected. Consider: (1) Adding more CS sinks (equipment, power-ups), (2) Reducing block rewards, (3) Implementing progressive pricing");
  }
  if (csGenerated > 0 && csSpent < csGenerated * 0.5) {
    recommendations.push("\u{1F4A1} Players aren't spending CS. Consider: (1) Running flash sales or events, (2) Adding new equipment tiers, (3) Implementing limited-time offers");
  }
  if (top10Ownership > 80) {
    recommendations.push("\u26A0\uFE0F Wealth too concentrated. Consider: (1) Daily/weekly CS caps, (2) Progressive pricing (costs scale with wealth), (3) Wealth redistribution events");
  }
  if (netChange < 0) {
    recommendations.push("\u2139\uFE0F Deflation detected. If unintentional, consider: (1) Increasing mining rewards, (2) Reducing equipment prices, (3) Adding CS generation events");
  }
  if (recommendations.length === 0) {
    recommendations.push("\u2705 Economy appears healthy! Inflation is under control, spending is balanced, and wealth distribution is reasonable.");
  }
  return recommendations;
}

// server/routes/economy.routes.ts
function registerEconomyRoutes(app2) {
  app2.get("/api/admin/economy/overview", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const overview = await getEconomyOverview();
      const recommendations = getEconomyRecommendations(overview);
      res.json({
        ...overview,
        recommendations
      });
    } catch (error) {
      console.error("Get economy overview error:", error);
      res.status(500).json({ error: "Failed to fetch economy overview" });
    }
  });
  app2.get("/api/admin/economy/history", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 30;
      const history = await getEconomyHistory(days);
      res.json(history);
    } catch (error) {
      console.error("Get economy history error:", error);
      res.status(500).json({ error: "Failed to fetch economy history" });
    }
  });
  app2.get("/api/admin/economy/distribution", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const distribution = await calculateWealthDistribution();
      res.json(distribution);
    } catch (error) {
      console.error("Get wealth distribution error:", error);
      res.status(500).json({ error: "Failed to fetch wealth distribution" });
    }
  });
  app2.get("/api/admin/economy/sinks", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days) || 30;
      const sinks = await getEconomySinksBreakdown(days);
      const aggregated = {};
      for (const sink of sinks) {
        if (!aggregated[sink.sinkType]) {
          aggregated[sink.sinkType] = { csSpent: 0, transactionCount: 0 };
        }
        aggregated[sink.sinkType].csSpent += parseFloat(sink.csSpent?.toString() || "0");
        aggregated[sink.sinkType].transactionCount += sink.transactionCount || 0;
      }
      res.json({
        detailed: sinks,
        aggregated
      });
    } catch (error) {
      console.error("Get economy sinks error:", error);
      res.status(500).json({ error: "Failed to fetch economy sinks" });
    }
  });
  app2.get("/api/admin/economy/alerts", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const alerts = await getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Get economy alerts error:", error);
      res.status(500).json({ error: "Failed to fetch economy alerts" });
    }
  });
  app2.post("/api/admin/economy/alerts/:id/acknowledge", validateTelegramAuth, requireAdmin, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const alertId = parseInt(req.params.id);
      await acknowledgeAlert(alertId, req.telegramUser.id.toString());
      res.json({
        success: true,
        message: "Alert acknowledged"
      });
    } catch (error) {
      console.error("Acknowledge alert error:", error);
      res.status(500).json({ error: "Failed to acknowledge alert" });
    }
  });
  app2.post("/api/admin/economy/calculate-metrics", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const dateStr = req.body.date;
      let targetDate;
      if (dateStr) {
        targetDate = new Date(dateStr);
      } else {
        targetDate = /* @__PURE__ */ new Date();
        targetDate.setDate(targetDate.getDate() - 1);
      }
      await calculateDailyEconomyMetrics(targetDate);
      await calculateEconomySinks(targetDate);
      res.json({
        success: true,
        message: `Economy metrics calculated for ${targetDate.toISOString().split("T")[0]}`
      });
    } catch (error) {
      console.error("Calculate metrics error:", error);
      res.status(500).json({ error: "Failed to calculate metrics" });
    }
  });
  app2.get("/api/admin/economy/recommendations", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const overview = await getEconomyOverview();
      const recommendations = getEconomyRecommendations(overview);
      res.json({
        recommendations,
        basedOn: {
          inflationRate: overview.inflationRatePercent,
          top10Ownership: overview.top10PercentOwnership,
          netCsChange: overview.netCsChange
        }
      });
    } catch (error) {
      console.error("Get recommendations error:", error);
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });
}

// server/routes/segmentation.routes.ts
init_storage();
init_schema();
import { eq as eq16 } from "drizzle-orm";

// server/services/segmentation.ts
init_storage();
init_schema();
import { eq as eq15, sql as sql13, desc as desc4, and as and11, lte as lte6 } from "drizzle-orm";
async function calculateUserSegment(telegramId) {
  try {
    const user = await db.select().from(users).where(eq15(users.telegramId, telegramId)).limit(1);
    if (user.length === 0) {
      return "new_user";
    }
    const userData = user[0];
    const tonFromPowerUps = await db.select({
      total: sql13`COALESCE(SUM(${powerUpPurchases.tonAmount}), 0)`
    }).from(powerUpPurchases).where(eq15(powerUpPurchases.userId, telegramId));
    const tonFromLootBoxes = await db.select({
      total: sql13`COALESCE(SUM(${lootBoxPurchases.tonAmount}), 0)`
    }).from(lootBoxPurchases).where(eq15(lootBoxPurchases.userId, telegramId));
    const tonFromPacks = await db.select({
      total: sql13`COALESCE(SUM(${packPurchases.tonAmount}), 0)`
    }).from(packPurchases).where(eq15(packPurchases.userId, telegramId));
    const lifetimeValue = parseFloat(tonFromPowerUps[0]?.total?.toString() || "0") + parseFloat(tonFromLootBoxes[0]?.total?.toString() || "0") + parseFloat(tonFromPacks[0]?.total?.toString() || "0");
    const lastSession = await db.select().from(userSessions).where(eq15(userSessions.telegramId, telegramId)).orderBy(desc4(userSessions.startedAt)).limit(1);
    const now = /* @__PURE__ */ new Date();
    const lastActiveAt = lastSession.length > 0 ? lastSession[0].startedAt : userData.createdAt;
    const daysSinceLastActive = Math.floor((now.getTime() - lastActiveAt.getTime()) / (1e3 * 60 * 60 * 24));
    const daysSinceCreated = Math.floor((now.getTime() - userData.createdAt.getTime()) / (1e3 * 60 * 60 * 24));
    const existingSegment = await db.select().from(userSegments).where(eq15(userSegments.telegramId, telegramId)).limit(1);
    const wasChurned = existingSegment.length > 0 && existingSegment[0].segment === "churned";
    let segment = "active";
    if (lifetimeValue >= 50) {
      segment = "whale";
    } else if (lifetimeValue >= 10) {
      segment = "dolphin";
    } else if (lifetimeValue > 0) {
      segment = "minnow";
    } else if (daysSinceCreated < 7) {
      segment = "new_user";
    } else if (daysSinceLastActive >= 14) {
      segment = "churned";
    } else if (daysSinceLastActive >= 7 && daysSinceLastActive < 14) {
      segment = "at_risk";
    } else if (daysSinceLastActive >= 3 && wasChurned) {
      segment = "returning";
    } else if (daysSinceLastActive < 3) {
      segment = "active";
    }
    return segment;
  } catch (error) {
    console.error("Calculate user segment error:", error);
    throw error;
  }
}
async function refreshUserSegment(telegramId) {
  try {
    const segment = await calculateUserSegment(telegramId);
    const user = await db.select().from(users).where(eq15(users.telegramId, telegramId)).limit(1);
    if (user.length === 0) return;
    const tonFromPowerUps = await db.select({
      total: sql13`COALESCE(SUM(${powerUpPurchases.tonAmount}), 0)`
    }).from(powerUpPurchases).where(eq15(powerUpPurchases.userId, telegramId));
    const tonFromLootBoxes = await db.select({
      total: sql13`COALESCE(SUM(${lootBoxPurchases.tonAmount}), 0)`
    }).from(lootBoxPurchases).where(eq15(lootBoxPurchases.userId, telegramId));
    const tonFromPacks = await db.select({
      total: sql13`COALESCE(SUM(${packPurchases.tonAmount}), 0)`
    }).from(packPurchases).where(eq15(packPurchases.userId, telegramId));
    const lifetimeValue = parseFloat(tonFromPowerUps[0]?.total?.toString() || "0") + parseFloat(tonFromLootBoxes[0]?.total?.toString() || "0") + parseFloat(tonFromPacks[0]?.total?.toString() || "0");
    const sessions = await db.select().from(userSessions).where(eq15(userSessions.telegramId, telegramId));
    const totalSessions = sessions.length;
    const avgSessionDuration = sessions.length > 0 ? Math.floor(sessions.reduce((sum, s) => sum + (s.durationSeconds || 0), 0) / sessions.length) : 0;
    const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
    const lastActiveAt = lastSession ? lastSession.startedAt : user[0].createdAt;
    const daysSinceLastActive = Math.floor(((/* @__PURE__ */ new Date()).getTime() - lastActiveAt.getTime()) / (1e3 * 60 * 60 * 24));
    const sevenDaysAgo = /* @__PURE__ */ new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const retentionD7 = sessions.some((s) => s.startedAt >= sevenDaysAgo);
    const existing = await db.select().from(userSegments).where(eq15(userSegments.telegramId, telegramId)).limit(1);
    const segmentData = {
      telegramId,
      segment,
      lifetimeValue: lifetimeValue.toFixed(2),
      lastActiveAt,
      daysSinceLastActive,
      totalSessions,
      avgSessionDuration,
      retentionD7
    };
    if (existing.length > 0) {
      await db.update(userSegments).set(segmentData).where(eq15(userSegments.telegramId, telegramId));
    } else {
      await db.insert(userSegments).values(segmentData);
    }
  } catch (error) {
    console.error("Refresh user segment error:", error);
    throw error;
  }
}
async function refreshAllSegments() {
  try {
    console.log("\u{1F504} Refreshing all user segments...");
    const allUsers = await db.select({ telegramId: users.telegramId }).from(users);
    let updated = 0;
    for (const user of allUsers) {
      if (user.telegramId) {
        try {
          await refreshUserSegment(user.telegramId);
          updated++;
        } catch (error) {
          console.error(`Failed to refresh segment for ${user.telegramId}:`, error);
        }
      }
    }
    console.log(`\u2705 Refreshed segments for ${updated} users`);
  } catch (error) {
    console.error("Refresh all segments error:", error);
    throw error;
  }
}
async function getUsersInSegment(segment) {
  try {
    const segmentUsers = await db.select({
      id: userSegments.id,
      telegramId: userSegments.telegramId,
      username: users.username,
      segment: userSegments.segment,
      lifetimeValue: userSegments.lifetimeValue,
      lastActiveAt: userSegments.lastActiveAt,
      daysSinceLastActive: userSegments.daysSinceLastActive,
      totalSessions: userSegments.totalSessions,
      avgSessionDuration: userSegments.avgSessionDuration,
      retentionD7: userSegments.retentionD7,
      updatedAt: userSegments.updatedAt
    }).from(userSegments).leftJoin(users, eq15(users.telegramId, userSegments.telegramId)).where(eq15(userSegments.segment, segment)).orderBy(desc4(userSegments.lifetimeValue));
    return segmentUsers;
  } catch (error) {
    console.error("Get users in segment error:", error);
    throw error;
  }
}
async function getSegmentOverview() {
  try {
    const segments = await db.select({
      segment: userSegments.segment,
      count: sql13`COUNT(*)`
    }).from(userSegments).groupBy(userSegments.segment);
    const totalUsers = segments.reduce((sum, s) => sum + (s.count || 0), 0);
    const overview = {};
    for (const seg of segments) {
      overview[seg.segment] = {
        count: seg.count || 0,
        percentage: totalUsers > 0 ? (seg.count || 0) / totalUsers * 100 : 0
      };
    }
    return {
      totalUsers,
      segments: overview
    };
  } catch (error) {
    console.error("Get segment overview error:", error);
    throw error;
  }
}
async function getTargetedOffersForUser(telegramId) {
  try {
    const userSegment = await db.select().from(userSegments).where(eq15(userSegments.telegramId, telegramId)).limit(1);
    if (userSegment.length === 0) {
      return [];
    }
    const segment = userSegment[0].segment;
    const now = /* @__PURE__ */ new Date();
    const offers = await db.select().from(segmentTargetedOffers).where(
      and11(
        eq15(segmentTargetedOffers.targetSegment, segment),
        eq15(segmentTargetedOffers.isActive, true),
        lte6(segmentTargetedOffers.validFrom, now),
        sql13`(${segmentTargetedOffers.validUntil} IS NULL OR ${segmentTargetedOffers.validUntil} >= ${now})`
      )
    );
    return offers;
  } catch (error) {
    console.error("Get targeted offers for user error:", error);
    throw error;
  }
}
async function getAllTargetedOffers() {
  try {
    const offers = await db.select().from(segmentTargetedOffers).orderBy(desc4(segmentTargetedOffers.createdAt));
    return offers;
  } catch (error) {
    console.error("Get all targeted offers error:", error);
    throw error;
  }
}
async function sendReEngagementMessages() {
  try {
    console.log("\u{1F4E7} Sending re-engagement messages...");
    const atRiskUsers = await getUsersInSegment("at_risk");
    let sent = 0;
    for (const user of atRiskUsers) {
      try {
        const offers = await getTargetedOffersForUser(user.telegramId);
        let offerText = "";
        if (offers.length > 0) {
          const offer = offers[0];
          const offerData = JSON.parse(offer.offerData);
          offerText = `

\u{1F381} *Special Offer:* ${offerData.description || "Exclusive reward waiting for you!"}`;
        }
        const message = `\u{1F44B} *We miss you!*

It's been a while since you've played Crypto Hacker Heist. Come back and see what's new!${offerText}

Your progress is waiting for you. \u{1F48E}`;
        await sendMessageToUser(user.telegramId, message);
        sent++;
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to send re-engagement to ${user.telegramId}:`, error);
      }
    }
    console.log(`\u2705 Sent ${sent} re-engagement messages`);
  } catch (error) {
    console.error("Send re-engagement messages error:", error);
    throw error;
  }
}
async function sendChurnedMessages() {
  try {
    console.log("\u{1F4E7} Sending churned user messages...");
    const churnedUsers = await getUsersInSegment("churned");
    const recentlyChurned = churnedUsers.filter((u) => u.daysSinceLastActive >= 14 && u.daysSinceLastActive <= 15);
    let sent = 0;
    for (const user of recentlyChurned) {
      try {
        const offers = await getTargetedOffersForUser(user.telegramId);
        let offerText = "";
        if (offers.length > 0) {
          const offer = offers[0];
          const offerData = JSON.parse(offer.offerData);
          offerText = `

\u{1F381} *Come Back Offer:* ${offerData.description || "Big reward if you return!"}`;
        }
        const message = `\u{1F622} *Last Chance!*

We noticed you haven't played in a while. We'd love to have you back!${offerText}

Don't lose your progress! Your mining empire is waiting. \u26CF\uFE0F`;
        await sendMessageToUser(user.telegramId, message);
        sent++;
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to send churned message to ${user.telegramId}:`, error);
      }
    }
    console.log(`\u2705 Sent ${sent} churned user messages`);
  } catch (error) {
    console.error("Send churned messages error:", error);
    throw error;
  }
}

// server/routes/segmentation.routes.ts
function registerSegmentationRoutes(app2) {
  app2.get("/api/admin/segments/overview", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const overview = await getSegmentOverview();
      res.json(overview);
    } catch (error) {
      console.error("Get segment overview error:", error);
      res.status(500).json({ error: "Failed to fetch segment overview" });
    }
  });
  app2.get("/api/admin/segments/:segment/users", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const segment = req.params.segment;
      const validSegments = ["whale", "dolphin", "minnow", "new_user", "active", "at_risk", "churned", "returning"];
      if (!validSegments.includes(segment)) {
        return res.status(400).json({ error: `Invalid segment. Must be one of: ${validSegments.join(", ")}` });
      }
      const users2 = await getUsersInSegment(segment);
      res.json(users2);
    } catch (error) {
      console.error("Get users in segment error:", error);
      res.status(500).json({ error: "Failed to fetch users in segment" });
    }
  });
  app2.post("/api/admin/segments/refresh", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      refreshAllSegments().catch((error) => {
        console.error("Background segment refresh error:", error);
      });
      res.json({
        success: true,
        message: "Segment refresh started in background"
      });
    } catch (error) {
      console.error("Refresh segments error:", error);
      res.status(500).json({ error: "Failed to trigger segment refresh" });
    }
  });
  app2.post("/api/admin/segments/offers", validateTelegramAuth, requireAdmin, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const parsed = insertSegmentTargetedOfferSchema.safeParse({
        ...req.body,
        createdBy: req.telegramUser.id.toString()
      });
      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid offer data",
          details: parsed.error.errors
        });
      }
      const data = parsed.data;
      const validSegments = ["whale", "dolphin", "minnow", "new_user", "active", "at_risk", "churned", "returning"];
      if (!validSegments.includes(data.targetSegment)) {
        return res.status(400).json({ error: `Invalid target segment. Must be one of: ${validSegments.join(", ")}` });
      }
      const validTypes = ["promo_code", "flash_sale", "bonus_cs", "exclusive_equipment"];
      if (!validTypes.includes(data.offerType)) {
        return res.status(400).json({ error: `Invalid offer type. Must be one of: ${validTypes.join(", ")}` });
      }
      try {
        JSON.parse(data.offerData);
      } catch (e) {
        return res.status(400).json({ error: "offerData must be valid JSON" });
      }
      const [newOffer] = await db.insert(segmentTargetedOffers).values(data).returning();
      res.json({
        success: true,
        offer: newOffer
      });
    } catch (error) {
      console.error("Create targeted offer error:", error);
      res.status(500).json({ error: error.message || "Failed to create targeted offer" });
    }
  });
  app2.get("/api/admin/segments/offers", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const offers = await getAllTargetedOffers();
      res.json(offers);
    } catch (error) {
      console.error("Get targeted offers error:", error);
      res.status(500).json({ error: "Failed to fetch targeted offers" });
    }
  });
  app2.put("/api/admin/segments/offers/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      const existing = await db.select().from(segmentTargetedOffers).where(eq16(segmentTargetedOffers.id, offerId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Offer not found" });
      }
      if (req.body.offerData) {
        try {
          JSON.parse(req.body.offerData);
        } catch (e) {
          return res.status(400).json({ error: "offerData must be valid JSON" });
        }
      }
      const [updated] = await db.update(segmentTargetedOffers).set({
        targetSegment: req.body.targetSegment !== void 0 ? req.body.targetSegment : existing[0].targetSegment,
        offerType: req.body.offerType !== void 0 ? req.body.offerType : existing[0].offerType,
        offerData: req.body.offerData !== void 0 ? req.body.offerData : existing[0].offerData,
        validFrom: req.body.validFrom !== void 0 ? req.body.validFrom : existing[0].validFrom,
        validUntil: req.body.validUntil !== void 0 ? req.body.validUntil : existing[0].validUntil,
        isActive: req.body.isActive !== void 0 ? req.body.isActive : existing[0].isActive
      }).where(eq16(segmentTargetedOffers.id, offerId)).returning();
      res.json(updated);
    } catch (error) {
      console.error("Update targeted offer error:", error);
      res.status(500).json({ error: "Failed to update targeted offer" });
    }
  });
  app2.delete("/api/admin/segments/offers/:id", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const offerId = parseInt(req.params.id);
      await db.delete(segmentTargetedOffers).where(eq16(segmentTargetedOffers.id, offerId));
      res.json({ success: true, message: "Offer deleted" });
    } catch (error) {
      console.error("Delete targeted offer error:", error);
      res.status(500).json({ error: "Failed to delete targeted offer" });
    }
  });
  app2.post("/api/admin/segments/send-reengagement", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      sendReEngagementMessages().catch((error) => {
        console.error("Background re-engagement send error:", error);
      });
      res.json({
        success: true,
        message: "Re-engagement messages being sent in background"
      });
    } catch (error) {
      console.error("Send re-engagement error:", error);
      res.status(500).json({ error: "Failed to send re-engagement messages" });
    }
  });
  app2.post("/api/admin/segments/send-churned", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      sendChurnedMessages().catch((error) => {
        console.error("Background churned send error:", error);
      });
      res.json({
        success: true,
        message: "Churned user messages being sent in background"
      });
    } catch (error) {
      console.error("Send churned messages error:", error);
      res.status(500).json({ error: "Failed to send churned messages" });
    }
  });
  app2.get("/api/segments/my-offers", validateTelegramAuth, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    try {
      const offers = await getTargetedOffersForUser(req.telegramUser.id.toString());
      res.json(offers);
    } catch (error) {
      console.error("Get my targeted offers error:", error);
      res.status(500).json({ error: "Failed to fetch targeted offers" });
    }
  });
}

// server/routes/index.ts
function registerModularRoutes(app2) {
  registerHealthRoutes(app2);
  registerAuthRoutes(app2);
  registerUserRoutes(app2);
  registerSocialRoutes(app2);
  registerMiningRoutes(app2);
  registerEquipmentRoutes(app2);
  registerAnnouncementRoutes(app2);
  registerPromoCodeRoutes(app2);
  registerAnalyticsRoutes(app2);
  registerEventsRoutes(app2);
  registerEconomyRoutes(app2);
  registerSegmentationRoutes(app2);
}

// server/routes.ts
function calculateDailyLoginReward(streakDay) {
  const baseCs = 500;
  const baseChst = 10;
  const cs = baseCs * streakDay;
  const chst = baseChst * streakDay;
  let item = null;
  if (streakDay % 30 === 0) {
    item = "epic_power_boost";
  } else if (streakDay % 14 === 0) {
    item = "rare_power_boost";
  } else if (streakDay % 7 === 0) {
    item = "common_power_boost";
  }
  return { cs, chst, item };
}
async function registerRoutes(app2) {
  const botWebhook = getBotWebhookHandler();
  if (botWebhook) {
    app2.post(botWebhook.path, botWebhook.handler);
    console.log(`\u{1F916} Telegram webhook registered at ${botWebhook.path}`);
  }
  registerModularRoutes(app2);
  app2.post("/api/auth/telegram", validateTelegramAuth, async (req, res) => {
    if (!req.telegramUser) {
      return res.status(401).json({ error: "Authentication required" });
    }
    let user = await storage.getUserByTelegramId(String(req.telegramUser.id));
    if (!user) {
      user = await storage.createUser({
        telegramId: String(req.telegramUser.id),
        username: req.telegramUser.username || `user_${req.telegramUser.id}`,
        firstName: req.telegramUser.first_name,
        lastName: req.telegramUser.last_name,
        photoUrl: req.telegramUser.photo_url
      });
    } else {
      await storage.updateUserProfile(user.id, {
        username: req.telegramUser.username || user.username,
        firstName: req.telegramUser.first_name,
        lastName: req.telegramUser.last_name,
        photoUrl: req.telegramUser.photo_url
      });
      user = await storage.getUser(user.id);
    }
    res.json(user);
  });
  app2.get("/api/user/:userId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const user = await storage.getUser(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });
  app2.get("/api/leaderboard/hashrate", validateTelegramAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const topMiners = await db.select({
        id: users.id,
        username: users.username,
        totalHashrate: users.totalHashrate,
        csBalance: users.csBalance,
        photoUrl: users.photoUrl
      }).from(users).orderBy(sql14`${users.totalHashrate} DESC`).limit(Math.min(limit, 100));
      res.json(topMiners);
    } catch (error) {
      console.error("Leaderboard hashrate error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/leaderboard/balance", validateTelegramAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const topBalances = await db.select({
        id: users.id,
        username: users.username,
        csBalance: users.csBalance,
        totalHashrate: users.totalHashrate,
        photoUrl: users.photoUrl
      }).from(users).orderBy(sql14`${users.csBalance} DESC`).limit(Math.min(limit, 100));
      res.json(topBalances);
    } catch (error) {
      console.error("Leaderboard balance error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
  app2.get("/api/leaderboard/referrals", validateTelegramAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const topReferrers = await db.select({
        id: users.id,
        username: users.username,
        photoUrl: users.photoUrl,
        referralCount: sql14`(SELECT COUNT(*) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId})`,
        totalBonus: sql14`(SELECT COALESCE(SUM(${referrals.bonusEarned}), 0) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId})`
      }).from(users).orderBy(sql14`(SELECT COUNT(*) FROM ${referrals} WHERE ${referrals.referrerId} = ${users.telegramId}) DESC`).limit(Math.min(limit, 100));
      res.json(topReferrers);
    } catch (error) {
      console.error("Referral leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch referral leaderboard" });
    }
  });
  app2.get("/api/user/:userId/rank", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const hashrateRank = await db.select({ count: sql14`COUNT(*)` }).from(users).where(sql14`${users.totalHashrate} > ${user.totalHashrate}`);
      const balanceRank = await db.select({ count: sql14`COUNT(*)` }).from(users).where(sql14`${users.csBalance} > ${user.csBalance}`);
      const totalUsers = await db.select({ count: sql14`COUNT(*)` }).from(users);
      res.json({
        userId,
        hashrateRank: (hashrateRank[0]?.count || 0) + 1,
        balanceRank: (balanceRank[0]?.count || 0) + 1,
        totalUsers: totalUsers[0]?.count || 0
      });
    } catch (error) {
      console.error("User rank error:", error);
      res.status(500).json({ error: "Failed to fetch user rank" });
    }
  });
  app2.post("/api/user/:userId/tutorial/complete", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        if (user[0].tutorialCompleted) {
          return {
            success: true,
            message: "Tutorial already completed",
            alreadyCompleted: true
          };
        }
        await tx.update(users).set({
          tutorialCompleted: true,
          csBalance: sql14`${users.csBalance} + 5000`
        }).where(eq17(users.id, userId));
        return {
          success: true,
          message: "Tutorial completed! Earned 5,000 CS bonus",
          bonus: 5e3
        };
      });
      res.json(result);
    } catch (error) {
      console.error("Tutorial completion error:", error);
      res.status(500).json({ error: error.message || "Failed to complete tutorial" });
    }
  });
  app2.get("/api/equipment-types", async (req, res) => {
    try {
      const equipment2 = await storage.getAllEquipmentTypes();
      res.json(equipment2);
    } catch (error) {
      console.error("Error loading equipment types:", error);
      res.status(500).json({ error: "Failed to load equipment types" });
    }
  });
  app2.get("/api/flash-sales/active", validateTelegramAuth, async (req, res) => {
    try {
      const { flashSales: flashSales2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const now = /* @__PURE__ */ new Date();
      const activeSales = await db.select().from(flashSales2).where(and12(
        eq17(flashSales2.isActive, true),
        sql14`${flashSales2.startTime} <= ${now}`,
        sql14`${flashSales2.endTime} > ${now}`
      ));
      res.json(activeSales);
    } catch (error) {
      console.error("Get flash sales error:", error);
      res.status(500).json({ error: "Failed to fetch flash sales" });
    }
  });
  app2.post("/api/admin/flash-sales", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { flashSales: flashSales2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { equipmentId, discountPercentage, durationHours } = req.body;
      if (!equipmentId || !discountPercentage || !durationHours) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      if (discountPercentage < 10 || discountPercentage > 50) {
        return res.status(400).json({ error: "Discount must be between 10% and 50%" });
      }
      const startTime = /* @__PURE__ */ new Date();
      const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1e3);
      const newSale = await db.insert(flashSales2).values({
        equipmentId,
        discountPercentage,
        startTime,
        endTime,
        isActive: true
      }).returning();
      res.json(newSale[0]);
    } catch (error) {
      console.error("Create flash sale error:", error);
      res.status(500).json({ error: "Failed to create flash sale" });
    }
  });
  app2.post("/api/admin/flash-sales/:saleId/end", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { flashSales: flashSales2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { saleId } = req.params;
      await db.update(flashSales2).set({ isActive: false }).where(eq17(flashSales2.id, parseInt(saleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("End flash sale error:", error);
      res.status(500).json({ error: "Failed to end flash sale" });
    }
  });
  app2.get("/api/equipment-types/:category/:tier", async (req, res) => {
    const { category, tier } = req.params;
    const equipmentTypes2 = await storage.getEquipmentTypesByCategoryAndTier(category, tier);
    res.json(equipmentTypes2);
  });
  app2.get("/api/user/:userId/equipment", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const equipment2 = await storage.getUserEquipment(req.params.userId);
    res.json(equipment2);
  });
  app2.post("/api/user/:userId/equipment/upgrade", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { equipmentTypeId } = req.body;
    if (!equipmentTypeId) {
      return res.status(400).json({ message: "Equipment type ID is required" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const equipmentType = await tx.select().from(equipmentTypes).where(eq17(equipmentTypes.id, equipmentTypeId));
        if (!equipmentType[0]) throw new Error("Equipment type not found");
        const owned = await tx.select().from(ownedEquipment).where(and12(
          eq17(ownedEquipment.userId, userId),
          eq17(ownedEquipment.equipmentTypeId, equipmentTypeId)
        )).for("update");
        if (!owned[0]) throw new Error("You don't own this equipment");
        const currentLevel = owned[0].upgradeLevel;
        const maxLevel = 10;
        if (currentLevel >= maxLevel) {
          throw new Error("Equipment is already at maximum upgrade level");
        }
        const upgradeCost = Math.floor(equipmentType[0].basePrice * Math.pow(1.5, currentLevel + 1));
        if (user[0].csBalance < upgradeCost) {
          throw new Error(`Insufficient Cipher Shards. Need ${upgradeCost} CS`);
        }
        await tx.update(users).set({
          csBalance: sql14`${users.csBalance} - ${upgradeCost}`
        }).where(eq17(users.id, userId));
        const newLevel = currentLevel + 1;
        const hashrateBefore = owned[0].currentHashrate;
        const hashrateIncrease = equipmentType[0].baseHashrate * 0.1 * owned[0].quantity;
        const newHashrate = hashrateBefore + hashrateIncrease;
        await tx.update(ownedEquipment).set({
          upgradeLevel: newLevel,
          currentHashrate: newHashrate
        }).where(eq17(ownedEquipment.id, owned[0].id));
        await tx.update(users).set({
          totalHashrate: sql14`${users.totalHashrate} + ${hashrateIncrease}`
        }).where(eq17(users.id, userId));
        const updatedUser = await tx.select().from(users).where(eq17(users.id, userId));
        return {
          success: true,
          user: updatedUser[0],
          upgradeCost,
          newLevel,
          hashrateIncrease
        };
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to upgrade equipment" });
    }
  });
  app2.get("/api/user/:userId/equipment/:equipmentId/components", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, equipmentId } = req.params;
    try {
      const components = await db.select().from(componentUpgrades).innerJoin(ownedEquipment, eq17(componentUpgrades.ownedEquipmentId, ownedEquipment.id)).where(and12(
        eq17(ownedEquipment.userId, userId),
        eq17(ownedEquipment.id, equipmentId)
      ));
      res.json(components);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to fetch component upgrades" });
    }
  });
  app2.post("/api/user/:userId/equipment/:equipmentId/components/upgrade", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, equipmentId } = req.params;
    const { componentType, currency = "CS", tonTransactionHash, userWalletAddress, tonAmount } = req.body;
    if (!componentType || !["RAM", "CPU", "Storage", "GPU"].includes(componentType)) {
      return res.status(400).json({ message: "Invalid component type" });
    }
    if (!["CS", "CHST", "TON"].includes(currency)) {
      return res.status(400).json({ message: "Invalid currency. Must be CS, CHST, or TON" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const owned = await tx.select().from(ownedEquipment).innerJoin(equipmentTypes, eq17(ownedEquipment.equipmentTypeId, equipmentTypes.id)).where(and12(
          eq17(ownedEquipment.userId, userId),
          eq17(ownedEquipment.id, equipmentId)
        ));
        if (!owned[0]) {
          throw new Error("Equipment not found");
        }
        let component = await tx.select().from(componentUpgrades).where(and12(
          eq17(componentUpgrades.ownedEquipmentId, equipmentId),
          eq17(componentUpgrades.componentType, componentType)
        ));
        if (!component[0]) {
          const newComponent = await tx.insert(componentUpgrades).values({
            ownedEquipmentId: equipmentId,
            componentType,
            currentLevel: 0,
            maxLevel: 10
          }).returning();
          component = newComponent;
        }
        const currentLevel = component[0].currentLevel;
        if (currentLevel >= component[0].maxLevel) {
          throw new Error("Component is already at maximum level");
        }
        const baseCost = owned[0].equipment_types.basePrice * 0.1;
        const componentMultiplier = {
          "RAM": 0.8,
          "CPU": 1.2,
          "Storage": 0.6,
          "GPU": 1.5
        }[componentType] || 1;
        const upgradeCostCS = Math.floor(baseCost * componentMultiplier * Math.pow(1.15, currentLevel));
        let upgradeCost = upgradeCostCS;
        if (currency === "TON") {
          upgradeCost = parseFloat((upgradeCostCS / 1e4).toFixed(3));
        }
        if (currency === "TON") {
          if (!tonTransactionHash || !userWalletAddress || !tonAmount) {
            throw new Error("TON transaction details required");
          }
          if (parseFloat(tonAmount) < upgradeCost) {
            throw new Error(`Insufficient TON amount. Required: ${upgradeCost} TON`);
          }
          const isValid = await verifyTONTransaction(
            tonTransactionHash,
            userWalletAddress,
            tonAmount
          );
          if (!isValid) {
            throw new Error("TON transaction verification failed");
          }
        } else {
          const user = await tx.select().from(users).where(eq17(users.id, userId));
          const balanceField = currency === "CS" ? "csBalance" : "chstBalance";
          const currentBalance = user[0][balanceField];
          if (currentBalance < upgradeCost) {
            throw new Error(`Insufficient ${currency} balance. Need ${upgradeCost} ${currency}`);
          }
          await tx.update(users).set({
            [balanceField]: sql14`${balanceField === "csBalance" ? users.csBalance : users.chstBalance} - ${upgradeCost}`
          }).where(eq17(users.id, userId));
        }
        const newLevel = currentLevel + 1;
        await tx.update(componentUpgrades).set({
          currentLevel: newLevel,
          updatedAt: sql14`NOW()`
        }).where(eq17(componentUpgrades.id, component[0].id));
        const hashrateIncrease = owned[0].equipment_types.baseHashrate * 0.05 * owned[0].owned_equipment.quantity;
        await tx.update(ownedEquipment).set({
          currentHashrate: sql14`${ownedEquipment.currentHashrate} + ${hashrateIncrease}`
        }).where(eq17(ownedEquipment.id, equipmentId));
        await tx.update(users).set({
          totalHashrate: sql14`${users.totalHashrate} + ${hashrateIncrease}`
        }).where(eq17(users.id, userId));
        return {
          success: true,
          componentType,
          newLevel,
          upgradeCost,
          currency,
          hashrateIncrease,
          message: `${componentType} upgraded to level ${newLevel}! +${hashrateIncrease.toFixed(2)} GH/s`
        };
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to upgrade component" });
    }
  });
  app2.post("/api/user/:userId/equipment/purchase", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const parsed = insertOwnedEquipmentSchema.safeParse({ ...req.body, userId });
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid equipment data", errors: parsed.error });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const equipmentType = await tx.select().from(equipmentTypes).where(eq17(equipmentTypes.id, parsed.data.equipmentTypeId));
        if (!equipmentType[0]) {
          throw new Error("Equipment type not found");
        }
        const et = equipmentType[0];
        const categoryEquipment = await tx.select().from(equipmentTypes).where(and12(
          eq17(equipmentTypes.category, et.category),
          eq17(equipmentTypes.tier, et.tier)
        )).orderBy(equipmentTypes.orderIndex);
        const userEquipment = await tx.select().from(ownedEquipment).where(eq17(ownedEquipment.userId, userId)).for("update");
        const currentCategoryEquipment = categoryEquipment.filter(
          (e) => e.orderIndex < et.orderIndex
        );
        const hasPrevious = currentCategoryEquipment.every(
          (prev) => userEquipment.some((owned2) => owned2.equipmentTypeId === prev.id)
        );
        if (!hasPrevious && et.orderIndex > 1 && (et.tier === "Basic" || et.tier === "Gaming")) {
          throw new Error("Must purchase previous equipment in this category first");
        }
        const isFirstBasicLaptop = parsed.data.equipmentTypeId === "laptop-lenovo-e14";
        const ownedCount = userEquipment.filter((e) => e.equipmentTypeId === parsed.data.equipmentTypeId).length;
        const isFirstPurchase = ownedCount === 0;
        if (!isFirstBasicLaptop || !isFirstPurchase) {
          const balanceField = et.currency === "CS" ? "csBalance" : "chstBalance";
          const currentBalance = user[0][balanceField];
          if (currentBalance < et.basePrice) {
            throw new Error(`Insufficient ${et.currency} balance`);
          }
        } else {
        }
        const owned = userEquipment.find((e) => e.equipmentTypeId === parsed.data.equipmentTypeId);
        if (owned && owned.quantity >= et.maxOwned) {
          throw new Error(`Maximum owned limit reached (${et.maxOwned})`);
        }
        let equipment2;
        if (owned) {
          const updated = await tx.update(ownedEquipment).set({
            quantity: sql14`${ownedEquipment.quantity} + 1`,
            currentHashrate: sql14`${ownedEquipment.currentHashrate} + ${et.baseHashrate}`
          }).where(eq17(ownedEquipment.id, owned.id)).returning();
          equipment2 = updated[0];
        } else {
          const inserted = await tx.insert(ownedEquipment).values({
            userId,
            equipmentTypeId: parsed.data.equipmentTypeId,
            currentHashrate: et.baseHashrate
          }).returning();
          equipment2 = inserted[0];
        }
        if (!(isFirstBasicLaptop && isFirstPurchase)) {
          const balanceField = et.currency === "CS" ? "csBalance" : "chstBalance";
          await tx.update(users).set({
            [balanceField]: sql14`${balanceField === "csBalance" ? users.csBalance : users.chstBalance} - ${et.basePrice}`,
            totalHashrate: sql14`${users.totalHashrate} + ${et.baseHashrate}`
          }).where(eq17(users.id, userId));
        } else {
          await tx.update(users).set({
            totalHashrate: sql14`${users.totalHashrate} + ${et.baseHashrate}`
          }).where(eq17(users.id, userId));
        }
        const updatedUser = await tx.select().from(users).where(eq17(users.id, userId));
        return equipment2;
      });
      res.json(result);
    } catch (error) {
      console.error("Purchase error:", error);
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/blocks", async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const blocks3 = await storage.getLatestBlocks(limit);
    res.json(blocks3);
  });
  app2.get("/api/blocks/latest", async (req, res) => {
    const block = await storage.getLatestBlock();
    res.json(block);
  });
  app2.get("/api/user/:userId/rewards", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const rewards = await storage.getUserBlockRewards(req.params.userId, limit);
    res.json(rewards);
  });
  app2.get("/api/user/:userId/mining-calendar", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const hoursAhead = parseInt(req.query.hours) || 24;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const latestBlock = await storage.getLatestBlock();
      const currentBlockNumber = latestBlock?.blockNumber || 0;
      const allUsers = await storage.getAllUsers();
      const activeMiners = allUsers.filter((u) => u.totalHashrate > 0);
      const peerHashrate = activeMiners.filter((u) => u.id !== userId).reduce((sum, u) => sum + u.totalHashrate, 0);
      const totalNetworkHashrate = peerHashrate + user.totalHashrate;
      const BLOCK_INTERVAL_MS = 5 * 60 * 1e3;
      const BLOCK_REWARD2 = 1e5;
      const blocksAhead = Math.floor(hoursAhead * 60 * 60 * 1e3 / BLOCK_INTERVAL_MS);
      const now = /* @__PURE__ */ new Date();
      const upcomingBlocks = [];
      for (let i = 1; i <= blocksAhead; i++) {
        const blockNumber = currentBlockNumber + i;
        const estimatedTime = new Date(now.getTime() + i * BLOCK_INTERVAL_MS);
        const userShare = totalNetworkHashrate > 0 ? user.totalHashrate / totalNetworkHashrate : 0;
        const estimatedReward = BLOCK_REWARD2 * userShare;
        const hashrateBoostReward = BLOCK_REWARD2 * (user.totalHashrate * 1.5 / (totalNetworkHashrate + user.totalHashrate * 0.5));
        const luckBoostReward = estimatedReward * 1.5;
        upcomingBlocks.push({
          blockNumber,
          estimatedTime: estimatedTime.toISOString(),
          timeUntil: i * 5,
          // minutes
          estimatedReward: Math.floor(estimatedReward),
          userSharePercent: (userShare * 100).toFixed(4),
          potentialWithHashrateBoost: Math.floor(hashrateBoostReward),
          potentialWithLuckBoost: Math.floor(luckBoostReward),
          recommendPowerUp: i <= 12 && userShare > 0.01
          // First hour and significant share
        });
      }
      res.json({
        currentBlock: currentBlockNumber,
        userHashrate: user.totalHashrate,
        networkHashrate: totalNetworkHashrate,
        userSharePercent: totalNetworkHashrate > 0 ? (user.totalHashrate / totalNetworkHashrate * 100).toFixed(4) : "0.00",
        blockInterval: "5 minutes",
        upcomingBlocks
      });
    } catch (error) {
      console.error("Mining calendar error:", error);
      res.status(500).json({ error: error.message || "Failed to generate mining calendar" });
    }
  });
  app2.get("/api/user/:userId/referrals", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const referrals2 = await storage.getUserReferrals(req.params.userId);
    res.json(referrals2);
  });
  app2.post("/api/user/:userId/referrals/apply", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { referralCode } = req.body;
    if (!referralCode) {
      return res.status(400).json({ message: "Referral code is required" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        if (user[0].referredBy) {
          throw new Error("You have already used a referral code");
        }
        const referrer = await tx.select().from(users).where(eq17(users.referralCode, referralCode)).for("update");
        if (!referrer[0]) throw new Error("Invalid referral code");
        if (referrer[0].id === userId) {
          throw new Error("You cannot use your own referral code");
        }
        const bonusAmount = 1e3;
        await tx.update(users).set({
          referredBy: referrer[0].id,
          csBalance: sql14`${users.csBalance} + ${bonusAmount}`
        }).where(eq17(users.id, userId));
        await tx.update(users).set({
          csBalance: sql14`${users.csBalance} + ${bonusAmount * 2}`
        }).where(eq17(users.id, referrer[0].id));
        const [referral] = await tx.insert(referrals).values({
          referrerId: referrer[0].id,
          refereeId: userId,
          bonusEarned: bonusAmount * 2
        }).returning();
        return {
          success: true,
          referral,
          userBonus: bonusAmount,
          referrerBonus: bonusAmount * 2
        };
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to apply referral code" });
    }
  });
  app2.get("/api/user/:userId/network-stats", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const userId = req.params.userId;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const allUsers = await storage.getAllUsers();
    const activeMiners = allUsers.filter((u) => u.totalHashrate > 0);
    const totalNetworkHashrate = activeMiners.reduce((sum, u) => sum + u.totalHashrate, 0);
    const userHashrate = user.totalHashrate;
    const networkShare = totalNetworkHashrate > 0 ? userHashrate / totalNetworkHashrate * 100 : 0;
    res.json({
      totalNetworkHashrate,
      activeMiners: activeMiners.length,
      userHashrate,
      networkShare,
      userSharePercentage: networkShare
    });
  });
  app2.get("/api/network-stats", async (req, res) => {
    const allUsers = await storage.getAllUsers();
    const activeMiners = allUsers.filter((u) => u.totalHashrate > 0);
    const totalNetworkHashrate = activeMiners.reduce((sum, u) => sum + u.totalHashrate, 0);
    res.json({
      totalHashrate: totalNetworkHashrate,
      activeMiners: activeMiners.length,
      blockReward: 1e5
      // 100K CS per block
    });
  });
  app2.post("/api/user/:userId/reset", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { confirmReset } = req.body;
    if (!confirmReset) {
      return res.status(400).json({ message: "Reset confirmation required" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        await tx.delete(ownedEquipment).where(eq17(ownedEquipment.userId, userId));
        await tx.delete(blockRewards).where(eq17(blockRewards.userId, userId));
        await tx.delete(referrals).where(eq17(referrals.referrerId, userId));
        await tx.delete(referrals).where(eq17(referrals.refereeId, userId));
        await tx.update(users).set({
          csBalance: 0,
          chstBalance: 0,
          totalHashrate: 0
        }).where(eq17(users.id, userId));
        return { success: true, message: "Game data reset successfully" };
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message || "Failed to reset game data" });
    }
  });
  app2.get("/api/admin/settings", validateTelegramAuth, requireAdmin, async (req, res) => {
    const settings = await storage.getAllGameSettings();
    res.json(settings);
  });
  app2.post("/api/admin/settings", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { key, value } = req.body;
    if (!key || value === void 0) {
      return res.status(400).json({ error: "Key and value are required" });
    }
    const setting = await storage.setGameSetting(key, value);
    res.json(setting);
  });
  app2.get("/api/admin/feature-flags", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const flags = await db.select().from(featureFlags).orderBy(featureFlags.featureName);
      res.json(flags);
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      res.status(500).json({ error: "Failed to fetch feature flags" });
    }
  });
  app2.post("/api/admin/feature-flags/:key", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { key } = req.params;
    const { isEnabled } = req.body;
    if (typeof isEnabled !== "boolean") {
      return res.status(400).json({ error: "isEnabled must be a boolean" });
    }
    try {
      const updated = await db.update(featureFlags).set({
        isEnabled,
        updatedAt: /* @__PURE__ */ new Date(),
        updatedBy: req.telegramUser?.id?.toString() || "unknown"
      }).where(eq17(featureFlags.featureKey, key)).returning();
      if (updated.length === 0) {
        return res.status(404).json({ error: "Feature flag not found" });
      }
      res.json(updated[0]);
    } catch (error) {
      console.error("Error updating feature flag:", error);
      res.status(500).json({ error: "Failed to update feature flag" });
    }
  });
  app2.get("/api/feature-flags", async (req, res) => {
    try {
      const flags = await db.select({
        featureKey: featureFlags.featureKey,
        isEnabled: featureFlags.isEnabled
      }).from(featureFlags);
      const enabledFeatures = flags.reduce((acc, flag) => {
        acc[flag.featureKey] = flag.isEnabled;
        return acc;
      }, {});
      res.json(enabledFeatures);
    } catch (error) {
      console.error("Error fetching feature flags:", error);
      res.json({});
    }
  });
  app2.get("/api/admin/users", validateTelegramAuth, requireAdmin, async (req, res) => {
    const users2 = await storage.getAllUsers();
    res.json(users2);
  });
  app2.post("/api/admin/users/:userId/admin", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { isAdmin } = req.body;
    await storage.setUserAdmin(req.params.userId, isAdmin);
    res.json({ success: true });
  });
  app2.post("/api/admin/users/:userId/balance", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { csBalance, chstBalance } = req.body;
      if (csBalance === void 0 && chstBalance === void 0) {
        return res.status(400).json({ error: "At least one balance must be provided" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const updates = {};
      if (csBalance !== void 0) updates.csBalance = Math.max(0, Number(csBalance));
      if (chstBalance !== void 0) updates.chstBalance = Math.max(0, Number(chstBalance));
      await db.update(users).set(updates).where(eq17(users.id, userId));
      const updatedUser = await storage.getUser(userId);
      res.json({
        success: true,
        user: {
          id: updatedUser?.id,
          username: updatedUser?.username,
          csBalance: updatedUser?.csBalance,
          chstBalance: updatedUser?.chstBalance
        }
      });
    } catch (error) {
      console.error("Update balance error:", error);
      res.status(500).json({ error: "Failed to update balance" });
    }
  });
  app2.get("/api/admin/users/:userId/payment-history", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const [powerUps, lootBoxes, packs] = await Promise.all([
        db.select().from(powerUpPurchases).where(eq17(powerUpPurchases.userId, userId)),
        db.select().from(lootBoxPurchases).where(eq17(lootBoxPurchases.userId, userId)),
        db.select().from(packPurchases).where(eq17(packPurchases.userId, userId))
      ]);
      const powerUpPayments = powerUps.map((p) => ({
        id: `powerup-${p.id}`,
        type: "Power-Up",
        itemName: p.powerUpType,
        tonAmount: p.tonAmount,
        transactionHash: p.tonTransactionHash,
        verified: p.tonTransactionVerified,
        rewards: {
          cs: p.rewardCs || 0,
          chst: p.rewardChst || 0
        },
        purchasedAt: p.purchasedAt
      }));
      const lootBoxPayments = lootBoxes.map((l) => {
        let rewards = { cs: 0, chst: 0, items: [] };
        try {
          const parsed = JSON.parse(l.rewardsJson);
          rewards = {
            cs: parsed.cs || 0,
            chst: parsed.chst || 0,
            items: parsed.items || []
          };
        } catch (e) {
          console.error("Failed to parse loot box rewards:", e);
        }
        return {
          id: `lootbox-${l.id}`,
          type: "Loot Box",
          itemName: l.boxType,
          tonAmount: l.tonAmount,
          transactionHash: l.tonTransactionHash,
          verified: l.tonTransactionVerified,
          rewards,
          purchasedAt: l.purchasedAt
        };
      });
      const packPayments = packs.map((p) => {
        let rewards = { cs: 0, chst: 0, items: [] };
        try {
          const parsed = JSON.parse(p.rewardsJson);
          rewards = {
            cs: parsed.cs || 0,
            chst: parsed.chst || 0,
            items: parsed.items || []
          };
        } catch (e) {
          console.error("Failed to parse pack rewards:", e);
        }
        return {
          id: `pack-${p.id}`,
          type: "Pack",
          itemName: p.packType,
          tonAmount: p.tonAmount,
          transactionHash: p.tonTransactionHash,
          verified: p.tonTransactionVerified,
          rewards,
          purchasedAt: p.purchasedAt
        };
      });
      const allPayments = [...powerUpPayments, ...lootBoxPayments, ...packPayments].sort(
        (a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime()
      );
      const totalTonSpent = allPayments.reduce((sum, p) => sum + parseFloat(p.tonAmount), 0);
      res.json({
        userId,
        totalPayments: allPayments.length,
        totalTonSpent: totalTonSpent.toFixed(4),
        payments: allPayments
      });
    } catch (error) {
      console.error("Payment history error:", error);
      res.status(500).json({ error: "Failed to fetch payment history" });
    }
  });
  app2.post("/api/admin/mining/pause", validateTelegramAuth, requireAdmin, async (req, res) => {
    await storage.setGameSetting("mining_paused", "true");
    res.json({ success: true, paused: true });
  });
  app2.post("/api/admin/mining/resume", validateTelegramAuth, requireAdmin, async (req, res) => {
    await storage.setGameSetting("mining_paused", "false");
    res.json({ success: true, paused: false });
  });
  app2.delete("/api/admin/reset-all-users", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const result = await db.transaction(async (tx) => {
        const {
          userDailyChallenges: userDailyChallenges2,
          userAchievements: userAchievements2,
          userCosmetics: userCosmetics2,
          userStreaks: userStreaks2,
          userHourlyBonuses: userHourlyBonuses2,
          userSpins: userSpins2,
          spinHistory: spinHistory2,
          equipmentPresets: equipmentPresets2,
          priceAlerts: priceAlerts2,
          autoUpgradeSettings: autoUpgradeSettings2,
          packPurchases: packPurchases2,
          userPrestige: userPrestige2,
          prestigeHistory: prestigeHistory2,
          userSubscriptions: userSubscriptions2,
          userStatistics: userStatistics3
        } = await Promise.resolve().then(() => (init_schema(), schema_exports));
        const deletedSpinHistory = await tx.delete(spinHistory2);
        const deletedUserSpins = await tx.delete(userSpins2);
        const deletedUserHourlyBonuses = await tx.delete(userHourlyBonuses2);
        const deletedUserStreaks = await tx.delete(userStreaks2);
        const deletedActivePowerUps = await tx.delete(activePowerUps);
        const deletedPowerUpPurchases = await tx.delete(powerUpPurchases);
        const deletedLootBoxPurchases = await tx.delete(lootBoxPurchases);
        const deletedDailyClaims = await tx.delete(dailyClaims);
        const deletedUserDailyChallenges = await tx.delete(userDailyChallenges2);
        const deletedUserAchievements = await tx.delete(userAchievements2);
        const deletedUserCosmetics = await tx.delete(userCosmetics2);
        const deletedEquipmentPresets = await tx.delete(equipmentPresets2);
        const deletedPriceAlerts = await tx.delete(priceAlerts2);
        const deletedAutoUpgradeSettings = await tx.delete(autoUpgradeSettings2);
        const deletedPackPurchases = await tx.delete(packPurchases2);
        const deletedPrestigeHistory = await tx.delete(prestigeHistory2);
        const deletedUserPrestige = await tx.delete(userPrestige2);
        const deletedUserSubscriptions = await tx.delete(userSubscriptions2);
        const deletedUserStatistics = await tx.delete(userStatistics3);
        const deletedBlockRewards = await tx.delete(blockRewards);
        const deletedBlocks = await tx.delete(blocks);
        const deletedComponentUpgrades = await tx.delete(componentUpgrades);
        const deletedOwnedEquipment = await tx.delete(ownedEquipment);
        const deletedReferrals = await tx.delete(referrals);
        const allUsers = await tx.select().from(users);
        const userCount = allUsers.length;
        await tx.update(users).set({
          csBalance: 0,
          chstBalance: 0,
          totalHashrate: 0
        });
        return {
          success: true,
          users_reset: userCount,
          records_deleted: {
            spin_history: deletedSpinHistory.length || 0,
            user_spins: deletedUserSpins.length || 0,
            user_hourly_bonuses: deletedUserHourlyBonuses.length || 0,
            user_streaks: deletedUserStreaks.length || 0,
            active_power_ups: deletedActivePowerUps.length || 0,
            power_up_purchases: deletedPowerUpPurchases.length || 0,
            loot_box_purchases: deletedLootBoxPurchases.length || 0,
            daily_claims: deletedDailyClaims.length || 0,
            user_daily_challenges: deletedUserDailyChallenges.length || 0,
            user_achievements: deletedUserAchievements.length || 0,
            user_cosmetics: deletedUserCosmetics.length || 0,
            equipment_presets: deletedEquipmentPresets.length || 0,
            price_alerts: deletedPriceAlerts.length || 0,
            auto_upgrade_settings: deletedAutoUpgradeSettings.length || 0,
            pack_purchases: deletedPackPurchases.length || 0,
            prestige_history: deletedPrestigeHistory.length || 0,
            user_prestige: deletedUserPrestige.length || 0,
            user_subscriptions: deletedUserSubscriptions.length || 0,
            user_statistics: deletedUserStatistics.length || 0,
            block_rewards: deletedBlockRewards.length || 0,
            blocks: deletedBlocks.length || 0,
            component_upgrades: deletedComponentUpgrades.length || 0,
            owned_equipment: deletedOwnedEquipment.length || 0,
            referrals: deletedReferrals.length || 0
          },
          reset_at: (/* @__PURE__ */ new Date()).toISOString()
        };
      });
      await miningService.initializeBlockNumber();
      res.json(result);
    } catch (error) {
      console.error("Bulk reset error:", error);
      res.status(500).json({
        error: "Reset failed: Database transaction error",
        details: "All changes have been rolled back. Database is in original state."
      });
    }
  });
  app2.post("/api/admin/recalculate-hashrates", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const result = await db.transaction(async (tx) => {
        const allUsers = await tx.select().from(users);
        let usersUpdated = 0;
        const updates = [];
        for (const user of allUsers) {
          const equipment2 = await tx.select().from(ownedEquipment).leftJoin(equipmentTypes, eq17(ownedEquipment.equipmentTypeId, equipmentTypes.id)).where(eq17(ownedEquipment.userId, user.telegramId));
          const actualHashrate = equipment2.reduce((sum, row) => {
            return sum + (row.owned_equipment?.currentHashrate || 0);
          }, 0);
          if (user.totalHashrate !== actualHashrate) {
            await tx.update(users).set({ totalHashrate: actualHashrate }).where(eq17(users.telegramId, user.telegramId));
            usersUpdated++;
            updates.push({
              userId: user.telegramId,
              username: user.username,
              oldHashrate: user.totalHashrate,
              newHashrate: actualHashrate,
              equipmentCount: equipment2.length
            });
          }
        }
        return {
          success: true,
          totalUsers: allUsers.length,
          usersUpdated,
          updates: updates.slice(0, 20)
          // Return first 20 for logging
        };
      });
      console.log(`Hashrate recalculation complete: ${result.usersUpdated}/${result.totalUsers} users updated`);
      res.json(result);
    } catch (error) {
      console.error("Hashrate recalculation error:", error);
      res.status(500).json({
        error: "Hashrate recalculation failed",
        details: error.message
      });
    }
  });
  app2.get("/api/admin/jackpots", validateTelegramAuth, requireAdmin, async (req, res) => {
    try {
      const { jackpotWins: jackpotWins2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const allJackpots = await db.select().from(jackpotWins2).orderBy(sql14`${jackpotWins2.wonAt} DESC`);
      const unpaidCount = allJackpots.filter((j) => !j.paidOut).length;
      const totalPaidOut = allJackpots.filter((j) => j.paidOut).length;
      res.json({
        success: true,
        jackpots: allJackpots,
        summary: {
          total_wins: allJackpots.length,
          unpaid: unpaidCount,
          paid: totalPaidOut
        }
      });
    } catch (error) {
      console.error("Get jackpots error:", error);
      res.status(500).json({
        error: "Failed to fetch jackpots",
        details: error.message
      });
    }
  });
  app2.post("/api/admin/jackpots/:jackpotId/mark-paid", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { jackpotId } = req.params;
    const { notes } = req.body;
    try {
      const { jackpotWins: jackpotWins2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const adminUser = req.user;
      const result = await db.transaction(async (tx) => {
        const jackpot = await tx.select().from(jackpotWins2).where(eq17(jackpotWins2.id, parseInt(jackpotId))).limit(1);
        if (!jackpot[0]) {
          throw new Error("Jackpot not found");
        }
        if (jackpot[0].paidOut) {
          throw new Error("Jackpot already marked as paid");
        }
        await tx.update(jackpotWins2).set({
          paidOut: true,
          paidAt: /* @__PURE__ */ new Date(),
          paidByAdmin: adminUser?.telegramId || "unknown",
          notes: notes || null
        }).where(eq17(jackpotWins2.id, parseInt(jackpotId)));
        const updated = await tx.select().from(jackpotWins2).where(eq17(jackpotWins2.id, parseInt(jackpotId))).limit(1);
        return updated[0];
      });
      console.log(`Jackpot ${jackpotId} marked as paid by admin ${req.user?.telegramId}`);
      res.json({
        success: true,
        jackpot: result,
        message: "Jackpot marked as paid successfully"
      });
    } catch (error) {
      console.error("Mark jackpot paid error:", error);
      res.status(400).json({
        error: error.message || "Failed to mark jackpot as paid"
      });
    }
  });
  app2.post("/api/admin/equipment/:equipmentId/update", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { equipmentId } = req.params;
    const { basePrice, currency } = req.body;
    try {
      if (basePrice !== void 0 && (typeof basePrice !== "number" || basePrice < 0)) {
        return res.status(400).json({ error: "Invalid price. Must be a positive number." });
      }
      if (currency !== void 0 && !["CS", "CHST", "TON"].includes(currency)) {
        return res.status(400).json({ error: "Invalid currency. Must be CS, CHST, or TON." });
      }
      const equipment2 = await db.select().from(equipmentTypes).where(eq17(equipmentTypes.id, equipmentId)).limit(1);
      if (!equipment2[0]) {
        return res.status(404).json({ error: "Equipment not found" });
      }
      const updateData = {};
      if (basePrice !== void 0) updateData.basePrice = basePrice;
      if (currency !== void 0) updateData.currency = currency;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid update fields provided" });
      }
      await db.update(equipmentTypes).set(updateData).where(eq17(equipmentTypes.id, equipmentId));
      const updatedEquipment = await db.select().from(equipmentTypes).where(eq17(equipmentTypes.id, equipmentId)).limit(1);
      res.json({
        success: true,
        equipment: updatedEquipment[0],
        message: "Equipment updated successfully"
      });
    } catch (error) {
      console.error("Equipment update error:", error);
      res.status(500).json({ error: "Failed to update equipment" });
    }
  });
  app2.get("/api/user/:userId/tasks/status", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await db.select().from(users).where(eq17(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const completed = await db.select().from(userTasks).where(eq17(userTasks.userId, user[0].telegramId));
      const completedTaskIds = completed.map((c) => c.taskId);
      res.json({
        completed_task_ids: completedTaskIds,
        completed_count: completed.length
      });
    } catch (error) {
      console.error("Get task status error:", error);
      res.status(500).json({ error: "Failed to get task status" });
    }
  });
  app2.post("/api/user/:userId/tasks/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { taskId } = req.body;
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const existing = await tx.select().from(userTasks).where(and12(
          eq17(userTasks.userId, user[0].telegramId),
          eq17(userTasks.taskId, taskId)
        )).limit(1);
        if (existing.length > 0) {
          return res.status(400).json({
            error: "You've already completed this task.",
            claimed_at: existing[0].claimedAt
          });
        }
        let rewardCs = 0;
        let rewardChst = 0;
        let conditionsMet = true;
        let errorMsg = "";
        switch (taskId) {
          case "mine-first-block":
            const userEquipment = await tx.select().from(ownedEquipment).where(eq17(ownedEquipment.userId, userId));
            if (userEquipment.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to purchase equipment first to mine blocks";
            }
            rewardCs = 1e3;
            rewardChst = 10;
            break;
          case "reach-1000-hashrate":
            if (user[0].totalHashrate < 1e3) {
              conditionsMet = false;
              errorMsg = "You need at least 1,000 H/s total hashrate";
            }
            rewardCs = 2e3;
            rewardChst = 20;
            break;
          case "buy-first-asic":
            const asicEquipment = await tx.select().from(ownedEquipment).leftJoin(equipmentTypes, eq17(ownedEquipment.equipmentTypeId, equipmentTypes.id)).where(and12(
              eq17(ownedEquipment.userId, userId),
              eq17(equipmentTypes.category, "ASIC Rig")
            ));
            if (asicEquipment.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to purchase an ASIC rig first";
            }
            rewardCs = 3e3;
            rewardChst = 30;
            break;
          case "invite-1-friend":
            const referrals1 = await tx.select().from(referrals).where(eq17(referrals.referrerId, userId));
            if (referrals1.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 1 friend first";
            }
            rewardCs = 5e3;
            rewardChst = 50;
            break;
          case "invite-5-friends":
            const referrals5 = await tx.select().from(referrals).where(eq17(referrals.referrerId, userId));
            if (referrals5.length < 5) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 5 friends first";
            }
            rewardCs = 15e3;
            rewardChst = 150;
            break;
          default:
            return res.status(400).json({ error: "Unknown task ID" });
        }
        if (!conditionsMet) {
          return res.status(400).json({
            error: "Task conditions not met.",
            message: errorMsg
          });
        }
        await tx.update(users).set({
          csBalance: sql14`${users.csBalance} + ${rewardCs}`,
          chstBalance: sql14`${users.chstBalance} + ${rewardChst}`,
          freeLootBoxes: sql14`${users.freeLootBoxes} + 1`
          // Grant 1 free loot box per task
        }).where(eq17(users.id, userId));
        await tx.insert(userTasks).values({
          userId: user[0].telegramId,
          taskId,
          rewardCs,
          rewardChst
        });
        const updatedUser = await tx.select().from(users).where(eq17(users.id, userId));
        return {
          success: true,
          taskId,
          reward: {
            cs: rewardCs,
            chst: rewardChst,
            freeLootBox: 1
          },
          new_balance: {
            cs: updatedUser[0].csBalance,
            chst: updatedUser[0].chstBalance
          },
          completed_at: (/* @__PURE__ */ new Date()).toISOString()
        };
      });
      if (typeof result === "object" && "success" in result) {
        res.json(result);
      }
    } catch (error) {
      console.error("Task claim error:", error);
      res.status(500).json({ error: error.message || "Failed to claim task" });
    }
  });
  app2.post("/api/user/:userId/tasks/:taskId/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, taskId } = req.params;
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const existing = await tx.select().from(userTasks).where(and12(
          eq17(userTasks.userId, user[0].telegramId),
          eq17(userTasks.taskId, taskId)
        )).limit(1);
        if (existing.length > 0) {
          return res.status(400).json({
            error: "You've already completed this task.",
            claimed_at: existing[0].claimedAt
          });
        }
        let rewardCs = 0;
        let rewardChst = 0;
        let conditionsMet = true;
        let errorMsg = "";
        switch (taskId) {
          case "mine-first-block":
            const userEquipment = await tx.select().from(ownedEquipment).where(eq17(ownedEquipment.userId, userId));
            if (userEquipment.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to purchase equipment first to mine blocks";
            }
            rewardCs = 1e3;
            rewardChst = 10;
            break;
          case "reach-1000-hashrate":
            if (user[0].totalHashrate < 1e3) {
              conditionsMet = false;
              errorMsg = "You need at least 1,000 H/s total hashrate";
            }
            rewardCs = 2e3;
            rewardChst = 20;
            break;
          case "buy-first-asic":
            const asicEquipment = await tx.select().from(ownedEquipment).leftJoin(equipmentTypes, eq17(ownedEquipment.equipmentTypeId, equipmentTypes.id)).where(and12(
              eq17(ownedEquipment.userId, userId),
              eq17(equipmentTypes.category, "ASIC Rig")
            ));
            if (asicEquipment.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to purchase an ASIC rig first";
            }
            rewardCs = 3e3;
            rewardChst = 30;
            break;
          case "invite-1-friend":
            const referrals1 = await tx.select().from(referrals).where(eq17(referrals.referrerId, userId));
            if (referrals1.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 1 friend first";
            }
            rewardCs = 5e3;
            rewardChst = 50;
            break;
          case "invite-5-friends":
            const referrals5 = await tx.select().from(referrals).where(eq17(referrals.referrerId, userId));
            if (referrals5.length < 5) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 5 friends first";
            }
            rewardCs = 15e3;
            rewardChst = 150;
            break;
          default:
            return res.status(400).json({ error: "Unknown task ID" });
        }
        if (!conditionsMet) {
          return res.status(400).json({
            error: "Task conditions not met.",
            message: errorMsg
          });
        }
        await tx.update(users).set({
          csBalance: sql14`${users.csBalance} + ${rewardCs}`,
          chstBalance: sql14`${users.chstBalance} + ${rewardChst}`
        }).where(eq17(users.id, userId));
        await tx.insert(userTasks).values({
          userId: user[0].telegramId,
          taskId,
          rewardCs,
          rewardChst
        });
        const updatedUser = await tx.select().from(users).where(eq17(users.id, userId));
        return {
          success: true,
          taskId,
          reward: {
            cs: rewardCs,
            chst: rewardChst
          },
          new_balance: {
            cs: updatedUser[0].csBalance,
            chst: updatedUser[0].chstBalance
          },
          completed_at: (/* @__PURE__ */ new Date()).toISOString()
        };
      });
      if (typeof result === "object" && "success" in result) {
        res.json(result);
      }
    } catch (error) {
      console.error("Task claim error:", error);
      res.status(500).json({ error: error.message || "Failed to claim task" });
    }
  });
  app2.post("/api/user/:userId/powerups/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { type, timezoneOffset } = req.body;
    if (!type || type !== "cs" && type !== "chst") {
      return res.status(400).json({ error: "Invalid claim type. Must be 'cs' or 'chst'." });
    }
    const offset = timezoneOffset || 0;
    if (offset < -720 || offset > 840) {
      return res.status(400).json({ error: "Invalid timezone offset" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const now = Date.now();
        const offsetMs = -offset * 60 * 1e3;
        const localTime = now + offsetMs;
        const localDate = new Date(localTime);
        const currentDate = `${localDate.getUTCFullYear()}-${String(localDate.getUTCMonth() + 1).padStart(2, "0")}-${String(localDate.getUTCDate()).padStart(2, "0")}`;
        const existingClaim = await tx.select().from(dailyClaims).where(and12(
          eq17(dailyClaims.userId, user[0].telegramId),
          eq17(dailyClaims.claimType, type)
        )).limit(1);
        let claimCount = 0;
        let remainingClaims = 0;
        if (existingClaim.length === 0) {
          await tx.insert(dailyClaims).values({
            userId: user[0].telegramId,
            claimType: type,
            claimCount: 1,
            lastClaimDate: currentDate,
            userTimezoneOffset: offset
          });
          claimCount = 1;
          remainingClaims = 4;
        } else {
          const claim = existingClaim[0];
          if (claim.lastClaimDate !== currentDate) {
            await tx.update(dailyClaims).set({
              claimCount: 1,
              lastClaimDate: currentDate,
              userTimezoneOffset: offset,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq17(dailyClaims.id, claim.id));
            claimCount = 1;
            remainingClaims = 4;
          } else {
            if (claim.claimCount >= 5) {
              const nextDay2 = new Date(localDate);
              nextDay2.setUTCDate(nextDay2.getUTCDate() + 1);
              nextDay2.setUTCHours(0, 0, 0, 0);
              const nextResetUtc2 = new Date(nextDay2.getTime() - offsetMs);
              const error = new Error("Daily limit reached. You've claimed 5/5 times today.");
              error.statusCode = 429;
              error.remaining_claims = 0;
              error.next_reset = nextResetUtc2.toISOString();
              throw error;
            }
            await tx.update(dailyClaims).set({
              claimCount: claim.claimCount + 1,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq17(dailyClaims.id, claim.id));
            claimCount = claim.claimCount + 1;
            remainingClaims = 5 - claimCount;
          }
        }
        const reward = type === "cs" ? 5 : 2;
        const currency = type === "cs" ? "CS" : "CHST";
        if (type === "cs") {
          await tx.update(users).set({ csBalance: sql14`${users.csBalance} + ${reward}` }).where(eq17(users.id, userId));
        } else {
          await tx.update(users).set({ chstBalance: sql14`${users.chstBalance} + ${reward}` }).where(eq17(users.id, userId));
        }
        const updatedUser = await tx.select().from(users).where(eq17(users.id, userId));
        const nextDay = new Date(localDate);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        nextDay.setUTCHours(0, 0, 0, 0);
        const nextResetUtc = new Date(nextDay.getTime() - offsetMs);
        return {
          success: true,
          reward,
          currency,
          remaining_claims: remainingClaims,
          next_reset: nextResetUtc.toISOString(),
          new_balance: type === "cs" ? updatedUser[0].csBalance : updatedUser[0].chstBalance
        };
      });
      res.json({
        success: true,
        reward: result.reward,
        currency: result.currency,
        remaining_claims: result.remaining_claims,
        next_reset: result.next_reset,
        new_balance: result.new_balance
      });
    } catch (error) {
      console.error("Daily claim error:", error);
      if (error.statusCode === 429) {
        return res.status(429).json({
          error: error.message,
          remaining_claims: error.remaining_claims || 0,
          next_reset: error.next_reset
        });
      }
      if (error.message && (error.message.includes("Invalid") || error.message.includes("not found"))) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || "Failed to claim reward" });
    }
  });
  app2.post("/api/user/:userId/powerups/purchase", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { powerUpType, tonTransactionHash, userWalletAddress, tonAmount } = req.body;
    if (!powerUpType || !tonTransactionHash || !userWalletAddress || !tonAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const validPowerUps = [
      "hashrate-boost",
      "luck-boost",
      "cs-multiplier",
      "mega-boost",
      "chst-boost",
      "duration-extender",
      "auto-claim"
    ];
    if (!validPowerUps.includes(powerUpType)) {
      return res.status(400).json({
        error: "Invalid power-up type",
        validTypes: validPowerUps
      });
    }
    if (!isValidTONAddress(userWalletAddress)) {
      return res.status(400).json({ error: "Invalid user wallet address format" });
    }
    const gameWallet = getGameWalletAddress();
    if (!isValidTONAddress(gameWallet)) {
      return res.status(500).json({ error: "Game wallet not configured correctly" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const existingPurchase = await tx.select().from(powerUpPurchases).where(eq17(powerUpPurchases.tonTransactionHash, tonTransactionHash)).limit(1);
        if (existingPurchase.length > 0) {
          return res.status(400).json({
            error: "Transaction hash already used. Cannot reuse payment."
          });
        }
        console.log(`\u23F3 Verifying TON transaction ${tonTransactionHash.substring(0, 12)}... (polling up to 3 minutes)`);
        const verification = await pollForTransaction(
          tonTransactionHash,
          tonAmount,
          gameWallet,
          userWalletAddress
        );
        if (!verification.verified) {
          console.error("TON verification failed:", verification.error);
          return res.status(400).json({
            error: verification.error || "Transaction not found on blockchain. It may still be processing or the hash is incorrect.",
            message: "Please ensure the transaction was sent and wait a moment before trying again."
          });
        }
        let rewardCs = 0;
        let rewardChst = 0;
        let boostPercentage = 0;
        let duration = 60 * 60 * 1e3;
        switch (powerUpType) {
          case "hashrate-boost":
            rewardCs = 100;
            boostPercentage = 50;
            duration = 60 * 60 * 1e3;
            break;
          case "luck-boost":
            rewardCs = 50;
            boostPercentage = 20;
            duration = 60 * 60 * 1e3;
            break;
          case "cs-multiplier":
            rewardCs = 200;
            boostPercentage = 100;
            duration = 2 * 60 * 60 * 1e3;
            break;
          case "mega-boost":
            rewardCs = 500;
            rewardChst = 50;
            boostPercentage = 75;
            duration = 3 * 60 * 60 * 1e3;
            break;
          case "chst-boost":
            rewardChst = 100;
            boostPercentage = 50;
            duration = 2 * 60 * 60 * 1e3;
            break;
          case "duration-extender":
            rewardCs = 150;
            boostPercentage = 0;
            duration = 60 * 60 * 1e3;
            const now2 = /* @__PURE__ */ new Date();
            await tx.update(activePowerUps).set({
              expiresAt: sql14`${activePowerUps.expiresAt} + interval '1 hour'`
            }).where(and12(
              eq17(activePowerUps.userId, user[0].telegramId),
              eq17(activePowerUps.isActive, true),
              sql14`${activePowerUps.expiresAt} > ${now2}`
            ));
            break;
          case "auto-claim":
            rewardCs = 300;
            boostPercentage = 0;
            duration = 24 * 60 * 60 * 1e3;
            break;
        }
        await tx.insert(powerUpPurchases).values({
          userId: user[0].telegramId,
          powerUpType,
          tonAmount: tonAmount.toString(),
          tonTransactionHash,
          tonTransactionVerified: true,
          rewardCs,
          rewardChst
        });
        if (rewardCs > 0) {
          await tx.update(users).set({ csBalance: sql14`${users.csBalance} + ${rewardCs}` }).where(eq17(users.id, userId));
        }
        const now = /* @__PURE__ */ new Date();
        const expiresAt = new Date(now.getTime() + duration);
        await tx.insert(activePowerUps).values({
          userId: user[0].telegramId,
          powerUpType,
          boostPercentage,
          activatedAt: now,
          expiresAt,
          isActive: true
        });
        const updatedUser = await tx.select().from(users).where(eq17(users.id, userId));
        return {
          success: true,
          powerUpType,
          reward: { cs: rewardCs, chst: rewardChst },
          boost_active: true,
          boost_percentage: boostPercentage,
          duration_hours: duration / (60 * 60 * 1e3),
          activated_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          new_balance: {
            cs: updatedUser[0].csBalance,
            chst: updatedUser[0].chstBalance
          },
          verification: {
            tx_hash: verification.transaction?.hash,
            verified: true
          }
        };
      });
      if (typeof result === "object" && "success" in result) {
        res.json(result);
      }
    } catch (error) {
      console.error("Power-up purchase error:", error);
      res.status(500).json({ error: error.message || "Failed to purchase power-up" });
    }
  });
  app2.get("/api/user/:userId/powerups/active", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await db.select().from(users).where(eq17(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const now = /* @__PURE__ */ new Date();
      const activePowerUpsList = await db.select().from(activePowerUps).where(and12(
        eq17(activePowerUps.userId, user[0].telegramId),
        eq17(activePowerUps.isActive, true),
        sql14`${activePowerUps.expiresAt} > ${now}`
      ));
      await db.update(activePowerUps).set({ isActive: false }).where(and12(
        eq17(activePowerUps.userId, user[0].telegramId),
        eq17(activePowerUps.isActive, true),
        sql14`${activePowerUps.expiresAt} <= ${now}`
      ));
      let totalHashrateBoost = 0;
      let totalLuckBoost = 0;
      const formattedPowerUps = activePowerUpsList.map((powerUp) => {
        if (powerUp.powerUpType === "hashrate-boost") {
          totalHashrateBoost += powerUp.boostPercentage;
        } else if (powerUp.powerUpType === "luck-boost") {
          totalLuckBoost += powerUp.boostPercentage;
        }
        const timeRemaining = Math.max(0, powerUp.expiresAt.getTime() - now.getTime());
        return {
          id: powerUp.id,
          type: powerUp.powerUpType,
          boost_percentage: powerUp.boostPercentage,
          activated_at: powerUp.activatedAt.toISOString(),
          expires_at: powerUp.expiresAt.toISOString(),
          time_remaining_seconds: Math.floor(timeRemaining / 1e3 / 60)
        };
      });
      res.json({
        active_power_ups: formattedPowerUps,
        effects: {
          total_hashrate_boost: totalHashrateBoost,
          total_luck_boost: totalLuckBoost
        }
      });
    } catch (error) {
      console.error("Get active power-ups error:", error);
      res.status(500).json({ error: "Failed to get active power-ups" });
    }
  });
  app2.post("/api/user/:userId/lootbox/open", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { boxType, tonTransactionHash, userWalletAddress, tonAmount } = req.body;
    if (!boxType) {
      return res.status(400).json({ error: "Box type is required" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const boxRewards = {
          "basic": { tonCost: 0.5, minCS: 5e4, maxCS: 55e3 },
          // 100-110% RTP
          "premium": { tonCost: 2, minCS: 2e5, maxCS: 22e4 },
          "epic": { tonCost: 5, minCS: 5e5, maxCS: 55e4 },
          "daily-task": { tonCost: 0, minCS: 5e3, maxCS: 1e4 },
          // Free box
          "invite-friend": { tonCost: 0, minCS: 1e4, maxCS: 15e3 }
          // Free box
        };
        const boxConfig = boxRewards[boxType];
        if (!boxConfig) {
          throw new Error("Invalid box type");
        }
        if (boxConfig.tonCost > 0) {
          if (!tonTransactionHash || !userWalletAddress || !tonAmount) {
            throw new Error("TON transaction details required for paid boxes");
          }
          if (parseFloat(tonAmount) < boxConfig.tonCost) {
            throw new Error(`Insufficient TON amount. Required: ${boxConfig.tonCost} TON`);
          }
          const gameWallet = getGameWalletAddress();
          const existingPurchase = await tx.select().from(lootBoxPurchases).where(eq17(lootBoxPurchases.tonTransactionHash, tonTransactionHash)).limit(1);
          if (existingPurchase.length > 0) {
            throw new Error("This transaction has already been used");
          }
          console.log(`\u23F3 Verifying loot box transaction ${tonTransactionHash.substring(0, 12)}...`);
          const verification = await pollForTransaction(
            tonTransactionHash,
            tonAmount,
            gameWallet,
            userWalletAddress
          );
          if (!verification.verified) {
            throw new Error(verification.error || "Transaction verification failed");
          }
        } else {
          if (boxType === "daily-task") {
            if (user[0].freeLootBoxes <= 0) {
              throw new Error("No free daily task loot boxes available. Complete tasks to earn more.");
            }
            await tx.update(users).set({ freeLootBoxes: user[0].freeLootBoxes - 1 }).where(eq17(users.id, userId));
          } else if (boxType === "invite-friend") {
            if (user[0].inviteLootBoxes <= 0) {
              throw new Error("No invite reward loot boxes available. Invite friends to earn more.");
            }
            await tx.update(users).set({ inviteLootBoxes: user[0].inviteLootBoxes - 1 }).where(eq17(users.id, userId));
          }
        }
        const csReward = Math.floor(
          boxConfig.minCS + Math.random() * (boxConfig.maxCS - boxConfig.minCS)
        );
        const bonusChance = boxType === "epic" ? 0.2 : boxType === "premium" ? 0.1 : 0;
        const getBonus = Math.random() < bonusChance;
        const rewards = {
          cs: csReward
        };
        if (getBonus) {
          const bonusType = Math.random();
          if (bonusType < 0.5) {
            rewards.chst = Math.floor(csReward * 0.1);
          } else {
            rewards.freeSpins = boxType === "epic" ? 3 : 1;
          }
        }
        await tx.update(users).set({
          csBalance: sql14`${users.csBalance} + ${rewards.cs}`,
          ...rewards.chst && { chstBalance: sql14`${users.chstBalance} + ${rewards.chst}` }
        }).where(eq17(users.id, userId));
        if (boxConfig.tonCost > 0) {
          await tx.insert(lootBoxPurchases).values({
            userId: user[0].telegramId,
            boxType,
            tonAmount: tonAmount.toString(),
            tonTransactionHash,
            tonTransactionVerified: true,
            rewardsJson: JSON.stringify(rewards)
          });
        }
        const updatedUser = await tx.select().from(users).where(eq17(users.id, userId)).limit(1);
        return {
          success: true,
          rewards,
          newBalance: {
            cs: updatedUser[0].csBalance,
            chst: updatedUser[0].chstBalance
          }
        };
      });
      res.json(result);
    } catch (error) {
      console.error("Loot box open error:", error);
      res.status(400).json({ error: error.message || "Failed to open loot box" });
    }
  });
  app2.get("/api/challenges", async (req, res) => {
    try {
      const { dailyChallenges: dailyChallengesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const challenges = await db.select().from(dailyChallengesTable).where(eq17(dailyChallengesTable.isActive, true));
      res.json(challenges);
    } catch (error) {
      console.error("Get challenges error:", error);
      res.status(500).json({ error: "Failed to get challenges" });
    }
  });
  app2.get("/api/user/:userId/challenges/today", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const { userDailyChallenges: userDailyChallenges2, dailyChallenges: dailyChallengesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const user = await db.select().from(users).where(eq17(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const allChallenges = await db.select().from(dailyChallengesTable).where(eq17(dailyChallengesTable.isActive, true));
      const completed = await db.select().from(userDailyChallenges2).where(and12(
        eq17(userDailyChallenges2.userId, user[0].telegramId),
        eq17(userDailyChallenges2.completedDate, today)
      ));
      const completedIds = completed.map((c) => c.challengeId);
      res.json({
        challenges: allChallenges.map((challenge) => ({
          ...challenge,
          completed: completedIds.includes(challenge.challengeId)
        })),
        completedCount: completed.length,
        totalCount: allChallenges.length
      });
    } catch (error) {
      console.error("Get user challenges error:", error);
      res.status(500).json({ error: "Failed to get user challenges" });
    }
  });
  app2.post("/api/user/:userId/challenges/:challengeId/complete", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, challengeId } = req.params;
    try {
      const { userDailyChallenges: userDailyChallenges2, dailyChallenges: dailyChallengesTable, userStatistics: userStatistics3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const challenge = await tx.select().from(dailyChallengesTable).where(and12(
          eq17(dailyChallengesTable.challengeId, challengeId),
          eq17(dailyChallengesTable.isActive, true)
        )).limit(1);
        if (!challenge[0]) {
          throw new Error("Challenge not found");
        }
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const existing = await tx.select().from(userDailyChallenges2).where(and12(
          eq17(userDailyChallenges2.userId, user[0].telegramId),
          eq17(userDailyChallenges2.completedDate, today)
        )).limit(1);
        if (existing[0]) {
          throw new Error("Challenge already completed today");
        }
        await tx.insert(userDailyChallenges2).values({
          userId: user[0].telegramId,
          challengeId,
          completedDate: today,
          rewardClaimed: true
        });
        if (challenge[0].rewardCs > 0) {
          await tx.update(users).set({ csBalance: sql14`${users.csBalance} + ${challenge[0].rewardCs}` }).where(eq17(users.id, userId));
          await tx.insert(userStatistics3).values({
            userId: user[0].telegramId,
            totalCsEarned: challenge[0].rewardCs
          }).onConflictDoUpdate({
            target: userStatistics3.userId,
            set: {
              totalCsEarned: sql14`${userStatistics3.totalCsEarned} + ${challenge[0].rewardCs}`,
              updatedAt: sql14`NOW()`
            }
          });
        }
        if (challenge[0].rewardChst && challenge[0].rewardChst > 0) {
          await tx.update(users).set({ chstBalance: sql14`${users.chstBalance} + ${challenge[0].rewardChst}` }).where(eq17(users.id, userId));
          await tx.insert(userStatistics3).values({
            userId: user[0].telegramId,
            totalChstEarned: challenge[0].rewardChst
          }).onConflictDoUpdate({
            target: userStatistics3.userId,
            set: {
              totalChstEarned: sql14`${userStatistics3.totalChstEarned} + ${challenge[0].rewardChst}`,
              updatedAt: sql14`NOW()`
            }
          });
        }
        return {
          success: true,
          challenge: challenge[0],
          message: `Challenge completed! Earned ${challenge[0].rewardCs} CS`
        };
      });
      res.json(result);
    } catch (error) {
      console.error("Complete challenge error:", error);
      res.status(400).json({ error: error.message || "Failed to complete challenge" });
    }
  });
  app2.get("/api/achievements", async (req, res) => {
    try {
      const { achievements: achievementsTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const allAchievements = await db.select().from(achievementsTable).where(eq17(achievementsTable.isActive, true)).orderBy(achievementsTable.orderIndex);
      res.json(allAchievements);
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ error: "Failed to get achievements" });
    }
  });
  app2.get("/api/user/:userId/achievements", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const { achievements: achievementsTable, userAchievements: userAchievements2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const user = await db.select().from(users).where(eq17(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const allAchievements = await db.select().from(achievementsTable).where(eq17(achievementsTable.isActive, true)).orderBy(achievementsTable.orderIndex);
      const unlocked = await db.select().from(userAchievements2).where(eq17(userAchievements2.userId, user[0].telegramId));
      const unlockedIds = unlocked.map((u) => u.achievementId);
      res.json({
        achievements: allAchievements.map((achievement) => ({
          ...achievement,
          unlocked: unlockedIds.includes(achievement.achievementId),
          unlockedAt: unlocked.find((u) => u.achievementId === achievement.achievementId)?.unlockedAt
        })),
        unlockedCount: unlocked.length,
        totalCount: allAchievements.length
      });
    } catch (error) {
      console.error("Get user achievements error:", error);
      res.status(500).json({ error: "Failed to get user achievements" });
    }
  });
  app2.post("/api/user/:userId/achievements/check", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const { achievements: achievementsTable, userAchievements: userAchievements2, userStatistics: userStatistics3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const user = await db.select().from(users).where(eq17(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const stats = await db.select().from(userStatistics3).where(eq17(userStatistics3.userId, user[0].telegramId)).limit(1);
      const equipment2 = await db.select().from(ownedEquipment).where(eq17(ownedEquipment.userId, userId));
      const uniqueEquipment = new Set(equipment2.map((e) => e.equipmentTypeId)).size;
      const refCount = await db.select({ count: sql14`COUNT(*)` }).from(referrals).where(eq17(referrals.referrerId, userId));
      const newlyUnlocked = [];
      const allAchievements = await db.select().from(achievementsTable).where(eq17(achievementsTable.isActive, true));
      const existingAchievements = await db.select().from(userAchievements2).where(eq17(userAchievements2.userId, user[0].telegramId));
      const existingIds = existingAchievements.map((a) => a.achievementId);
      for (const achievement of allAchievements) {
        if (existingIds.includes(achievement.achievementId)) continue;
        let shouldUnlock = false;
        switch (achievement.requirement) {
          case "own_1_equipment":
            shouldUnlock = equipment2.length >= 1;
            break;
          case "hashrate_1000":
            shouldUnlock = user[0].totalHashrate >= 1e3;
            break;
          case "hashrate_10000":
            shouldUnlock = user[0].totalHashrate >= 1e4;
            break;
          case "hashrate_100000":
            shouldUnlock = user[0].totalHashrate >= 1e5;
            break;
          case "own_10_different_equipment":
            shouldUnlock = uniqueEquipment >= 10;
            break;
          case "spend_10_ton":
            shouldUnlock = stats[0] && parseFloat(stats[0].totalTonSpent.toString()) >= 10;
            break;
          case "refer_10_friends":
            shouldUnlock = (refCount[0]?.count || 0) >= 10;
            break;
          case "mine_100_blocks":
            shouldUnlock = stats[0] && stats[0].totalBlocksMined >= 100;
            break;
        }
        if (shouldUnlock) {
          await db.insert(userAchievements2).values({
            userId: user[0].telegramId,
            achievementId: achievement.achievementId,
            rewardClaimed: false
          });
          newlyUnlocked.push(achievement);
        }
      }
      res.json({
        newlyUnlocked,
        message: newlyUnlocked.length > 0 ? `Unlocked ${newlyUnlocked.length} achievements!` : "No new achievements"
      });
    } catch (error) {
      console.error("Check achievements error:", error);
      res.status(500).json({ error: "Failed to check achievements" });
    }
  });
  app2.post("/api/user/:userId/achievements/:achievementId/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, achievementId } = req.params;
    try {
      const { achievements: achievementsTable, userAchievements: userAchievements2, userStatistics: userStatistics3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const userAchievement = await tx.select().from(userAchievements2).where(and12(
          eq17(userAchievements2.userId, user[0].telegramId),
          eq17(userAchievements2.achievementId, achievementId)
        )).limit(1);
        if (!userAchievement[0]) {
          throw new Error("Achievement not unlocked");
        }
        if (userAchievement[0].rewardClaimed) {
          throw new Error("Reward already claimed");
        }
        const achievement = await tx.select().from(achievementsTable).where(eq17(achievementsTable.achievementId, achievementId)).limit(1);
        if (!achievement[0]) {
          throw new Error("Achievement not found");
        }
        if (achievement[0].rewardCs && achievement[0].rewardCs > 0) {
          await tx.update(users).set({ csBalance: sql14`${users.csBalance} + ${achievement[0].rewardCs}` }).where(eq17(users.id, userId));
          await tx.insert(userStatistics3).values({
            userId: user[0].telegramId,
            totalCsEarned: achievement[0].rewardCs
          }).onConflictDoUpdate({
            target: userStatistics3.userId,
            set: {
              totalCsEarned: sql14`${userStatistics3.totalCsEarned} + ${achievement[0].rewardCs}`,
              updatedAt: sql14`NOW()`
            }
          });
        }
        await tx.update(userAchievements2).set({ rewardClaimed: true }).where(and12(
          eq17(userAchievements2.userId, user[0].telegramId),
          eq17(userAchievements2.achievementId, achievementId)
        ));
        return {
          success: true,
          achievement: achievement[0],
          message: `Claimed ${achievement[0].rewardCs} CS reward!`
        };
      });
      res.json(result);
    } catch (error) {
      console.error("Claim achievement error:", error);
      res.status(400).json({ error: error.message || "Failed to claim achievement" });
    }
  });
  app2.get("/api/user/:userId/cosmetics", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const { userCosmetics: userCosmetics2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const user = await db.select().from(users).where(eq17(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const owned = await db.select().from(userCosmetics2).where(eq17(userCosmetics2.userId, user[0].telegramId));
      res.json(owned);
    } catch (error) {
      console.error("Get user cosmetics error:", error);
      res.status(500).json({ error: "Failed to get user cosmetics" });
    }
  });
  app2.post("/api/user/:userId/cosmetics/presets", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { presetName } = req.body;
    if (!presetName || presetName.trim().length === 0) {
      return res.status(400).json({ error: "Preset name is required" });
    }
    if (presetName.length > 50) {
      return res.status(400).json({ error: "Preset name too long (max 50 characters)" });
    }
    try {
      const { equipmentPresets: equipmentPresets2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const user = await db.select().from(users).where(eq17(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const currentEquipment = await db.select().from(ownedEquipment).where(eq17(ownedEquipment.userId, userId));
      if (currentEquipment.length === 0) {
        return res.status(400).json({ error: "No equipment to save" });
      }
      const snapshot = currentEquipment.map((eq20) => ({
        equipmentTypeId: eq20.equipmentTypeId,
        quantity: eq20.quantity,
        upgradeLevel: eq20.upgradeLevel
      }));
      const newPreset = await db.insert(equipmentPresets2).values({
        userId: user[0].telegramId,
        presetName: presetName.trim(),
        equipmentSnapshot: JSON.stringify(snapshot)
      }).returning();
      res.json({
        success: true,
        preset: newPreset[0],
        message: `Preset "${presetName}" saved successfully`
      });
    } catch (error) {
      console.error("Create equipment preset error:", error);
      res.status(500).json({ error: "Failed to create preset" });
    }
  });
  app2.get("/api/user/:userId/cosmetics/presets/:presetId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, presetId } = req.params;
    try {
      const { equipmentPresets: equipmentPresets2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const user = await db.select().from(users).where(eq17(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const preset = await db.select().from(equipmentPresets2).where(and12(
        eq17(equipmentPresets2.id, parseInt(presetId)),
        eq17(equipmentPresets2.userId, user[0].telegramId)
      )).limit(1);
      if (!preset[0]) {
        return res.status(404).json({ error: "Preset not found" });
      }
      const snapshot = JSON.parse(preset[0].equipmentSnapshot);
      res.json({
        preset: preset[0],
        equipment: snapshot
      });
    } catch (error) {
      console.error("Get equipment preset error:", error);
      res.status(500).json({ error: "Failed to get preset" });
    }
  });
  app2.delete("/api/user/:userId/cosmetics/presets/:presetId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, presetId } = req.params;
    try {
      const { equipmentPresets: equipmentPresets2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const user = await db.select().from(users).where(eq17(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const preset = await db.select().from(equipmentPresets2).where(and12(
        eq17(equipmentPresets2.id, parseInt(presetId)),
        eq17(equipmentPresets2.userId, user[0].telegramId)
      )).limit(1);
      if (!preset[0]) {
        return res.status(404).json({ error: "Preset not found" });
      }
      await db.delete(equipmentPresets2).where(eq17(equipmentPresets2.id, parseInt(presetId)));
      res.json({
        success: true,
        message: `Preset "${preset[0].presetName}" deleted successfully`
      });
    } catch (error) {
      console.error("Delete equipment preset error:", error);
      res.status(500).json({ error: "Failed to delete preset" });
    }
  });
  app2.get("/api/user/:userId/price-alerts", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const alerts = await db.select().from(priceAlerts).leftJoin(equipmentTypes, eq17(priceAlerts.equipmentTypeId, equipmentTypes.id)).where(eq17(priceAlerts.userId, user.telegramId)).orderBy(priceAlerts.createdAt);
      const alertsWithStatus = alerts.map((row) => ({
        ...row.price_alerts,
        equipment: row.equipment_types,
        canAfford: user.csBalance >= (row.equipment_types?.basePrice || 0)
      }));
      res.json(alertsWithStatus);
    } catch (error) {
      console.error("Get price alerts error:", error);
      res.status(500).json({ error: error.message || "Failed to get price alerts" });
    }
  });
  app2.post("/api/user/:userId/price-alerts", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { equipmentTypeId } = req.body;
    if (!equipmentTypeId) {
      return res.status(400).json({ error: "Equipment type ID is required" });
    }
    try {
      const { equipmentTypes: equipmentTypes2, userCosmetics: userCosmetics2, userStatistics: userStatistics3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const existingAlert = await tx.select().from(priceAlerts).where(and12(
          eq17(priceAlerts.userId, user[0].telegramId),
          eq17(priceAlerts.equipmentTypeId, equipmentTypeId)
        )).limit(1);
        if (existingAlert.length > 0) {
          throw new Error("Alert already exists for this equipment");
        }
        const equipment2 = await tx.select().from(equipmentTypes2).where(and12(
          eq17(equipmentTypes2.id, equipmentTypeId),
          eq17(equipmentTypes2.isActive, true)
        )).limit(1);
        if (!equipment2[0]) {
          throw new Error("Equipment not found");
        }
        const newAlert = await tx.insert(priceAlerts).values({
          userId: user[0].telegramId,
          equipmentTypeId,
          targetPrice: equipment2[0].basePrice,
          triggered: false
        }).returning();
        return newAlert[0];
      });
      res.json({
        success: true,
        message: "Alert set for " + equipment[0].name,
        alert: result
      });
    } catch (error) {
      console.error("Create price alert error:", error);
      res.status(500).json({ error: error.message || "Failed to create price alert" });
    }
  });
  app2.delete("/api/user/:userId/price-alerts/:alertId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, alertId } = req.params;
    try {
      const { equipmentTypes: equipmentTypes2, userCosmetics: userCosmetics2, userStatistics: userStatistics3 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const user = await db.select().from(users).where(eq17(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const alert = await db.select().from(priceAlerts).where(and12(
        eq17(priceAlerts.id, parseInt(alertId)),
        eq17(priceAlerts.userId, user[0].telegramId)
      )).limit(1);
      if (!alert[0]) {
        return res.status(404).json({ error: "Alert not found" });
      }
      await db.delete(priceAlerts).where(eq17(priceAlerts.id, parseInt(alertId)));
      res.json({
        success: true,
        message: "Alert deleted successfully"
      });
    } catch (error) {
      console.error("Delete price alert error:", error);
      res.status(500).json({ error: error.message || "Failed to delete price alert" });
    }
  });
  app2.get("/api/user/:userId/price-alerts/check", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const alerts = await db.select().from(priceAlerts).leftJoin(equipmentTypes, eq17(priceAlerts.equipmentTypeId, equipmentTypes.id)).where(and12(
        eq17(priceAlerts.userId, user.telegramId),
        eq17(priceAlerts.triggered, false)
      ));
      const triggeredAlerts = [];
      for (const row of alerts) {
        if (row.equipment_types && user.csBalance >= row.equipment_types.basePrice) {
          await db.update(priceAlerts).set({
            triggered: true,
            triggeredAt: /* @__PURE__ */ new Date()
          }).where(eq17(priceAlerts.id, row.price_alerts.id));
          triggeredAlerts.push({
            ...row.price_alerts,
            equipment: row.equipment_types
          });
        }
      }
      res.json({
        triggered: triggeredAlerts.length > 0,
        alerts: triggeredAlerts
      });
    } catch (error) {
      console.error("Check price alerts error:", error);
      res.status(500).json({ error: error.message || "Failed to check price alerts" });
    }
  });
  app2.get("/api/user/:userId/auto-upgrade/settings", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const settings = await db.select().from(autoUpgradeSettings).leftJoin(ownedEquipment, eq17(autoUpgradeSettings.ownedEquipmentId, ownedEquipment.id)).leftJoin(equipmentTypes, eq17(ownedEquipment.equipmentTypeId, equipmentTypes.id)).leftJoin(componentUpgrades, and12(
        eq17(componentUpgrades.ownedEquipmentId, autoUpgradeSettings.ownedEquipmentId),
        eq17(componentUpgrades.componentType, autoUpgradeSettings.componentType)
      )).where(eq17(autoUpgradeSettings.userId, user.telegramId)).orderBy(autoUpgradeSettings.createdAt);
      const settingsWithDetails = settings.map((row) => ({
        ...row.auto_upgrade_settings,
        equipment: row.owned_equipment,
        equipmentType: row.equipment_types,
        currentComponent: row.component_upgrades
      }));
      res.json(settingsWithDetails);
    } catch (error) {
      console.error("Get auto-upgrade settings error:", error);
      res.status(500).json({ error: error.message || "Failed to get auto-upgrade settings" });
    }
  });
  app2.post("/api/user/:userId/auto-upgrade/settings", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { ownedEquipmentId, componentType, targetLevel, enabled } = req.body;
    if (!ownedEquipmentId || !componentType || targetLevel === void 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (targetLevel < 0 || targetLevel > 10) {
      return res.status(400).json({ error: "Target level must be between 0 and 10" });
    }
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const equipment2 = await db.select().from(ownedEquipment).where(and12(
        eq17(ownedEquipment.id, ownedEquipmentId),
        eq17(ownedEquipment.userId, userId)
      )).limit(1);
      if (!equipment2[0]) {
        return res.status(404).json({ error: "Equipment not found or not owned" });
      }
      const existingSetting = await db.select().from(autoUpgradeSettings).where(and12(
        eq17(autoUpgradeSettings.ownedEquipmentId, ownedEquipmentId),
        eq17(autoUpgradeSettings.componentType, componentType)
      )).limit(1);
      let setting;
      if (existingSetting.length > 0) {
        const updated = await db.update(autoUpgradeSettings).set({
          targetLevel,
          enabled: enabled !== void 0 ? enabled : true,
          updatedAt: sql14`NOW()`
        }).where(eq17(autoUpgradeSettings.id, existingSetting[0].id)).returning();
        setting = updated[0];
      } else {
        const created = await db.insert(autoUpgradeSettings).values({
          userId: user.telegramId,
          ownedEquipmentId,
          componentType,
          targetLevel,
          enabled: enabled !== void 0 ? enabled : true
        }).returning();
        setting = created[0];
      }
      res.json({
        success: true,
        message: "Auto-upgrade setting saved",
        setting
      });
    } catch (error) {
      console.error("Save auto-upgrade setting error:", error);
      res.status(500).json({ error: error.message || "Failed to save auto-upgrade setting" });
    }
  });
  app2.delete("/api/user/:userId/auto-upgrade/settings/:settingId", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, settingId } = req.params;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const setting = await db.select().from(autoUpgradeSettings).where(and12(
        eq17(autoUpgradeSettings.id, parseInt(settingId)),
        eq17(autoUpgradeSettings.userId, user.telegramId)
      )).limit(1);
      if (!setting[0]) {
        return res.status(404).json({ error: "Setting not found" });
      }
      await db.delete(autoUpgradeSettings).where(eq17(autoUpgradeSettings.id, parseInt(settingId)));
      res.json({
        success: true,
        message: "Auto-upgrade setting deleted"
      });
    } catch (error) {
      console.error("Delete auto-upgrade setting error:", error);
      res.status(500).json({ error: error.message || "Failed to delete auto-upgrade setting" });
    }
  });
  app2.post("/api/user/:userId/auto-upgrade/execute", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const settings = await tx.select().from(autoUpgradeSettings).leftJoin(componentUpgrades, and12(
          eq17(componentUpgrades.ownedEquipmentId, autoUpgradeSettings.ownedEquipmentId),
          eq17(componentUpgrades.componentType, autoUpgradeSettings.componentType)
        )).leftJoin(ownedEquipment, eq17(ownedEquipment.id, autoUpgradeSettings.ownedEquipmentId)).where(and12(
          eq17(autoUpgradeSettings.userId, user[0].telegramId),
          eq17(autoUpgradeSettings.enabled, true)
        ));
        const upgrades = [];
        let totalCost = 0;
        for (const row of settings) {
          const setting = row.auto_upgrade_settings;
          const component = row.component_upgrades;
          const equipment2 = row.owned_equipment;
          if (!component || !equipment2) continue;
          const currentLevel = component.currentLevel;
          const targetLevel = setting.targetLevel;
          if (currentLevel >= targetLevel) continue;
          const upgradeCost = 100;
          if (user[0].csBalance >= upgradeCost + totalCost) {
            await tx.update(componentUpgrades).set({
              currentLevel: currentLevel + 1,
              updatedAt: /* @__PURE__ */ new Date()
            }).where(eq17(componentUpgrades.id, component.id));
            totalCost += upgradeCost;
            upgrades.push({
              equipmentId: equipment2.id,
              componentType: setting.componentType,
              fromLevel: currentLevel,
              toLevel: currentLevel + 1,
              cost: upgradeCost
            });
          }
        }
        if (totalCost > 0) {
          await tx.update(users).set({
            csBalance: user[0].csBalance - totalCost
          }).where(eq17(users.id, userId));
        }
        return { upgrades, totalCost };
      });
      res.json({
        success: true,
        upgrades: result.upgrades,
        totalCost: result.totalCost,
        upgradesPerformed: result.upgrades.length
      });
      if (result.upgrades.length > 0) {
      }
    } catch (error) {
      console.error("Execute auto-upgrade error:", error);
      res.status(500).json({ error: error.message || "Failed to execute auto-upgrade" });
    }
  });
  app2.get("/api/seasons", async (req, res) => {
    try {
      const allSeasons = await db.select().from(seasons).orderBy(sql14`${seasons.startDate} DESC`);
      res.json(allSeasons);
    } catch (error) {
      console.error("Get seasons error:", error);
      res.status(500).json({ error: error.message || "Failed to get seasons" });
    }
  });
  app2.get("/api/seasons/active", async (req, res) => {
    try {
      const now = /* @__PURE__ */ new Date();
      const activeSeason = await db.select().from(seasons).where(and12(
        eq17(seasons.isActive, true),
        sql14`${seasons.startDate} <= ${now}`,
        sql14`${seasons.endDate} >= ${now}`
      )).limit(1);
      res.json(activeSeason[0] || null);
    } catch (error) {
      console.error("Get active season error:", error);
      res.status(500).json({ error: error.message || "Failed to get active season" });
    }
  });
  app2.post("/api/admin/seasons", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { seasonId, name, description, startDate, endDate, bonusMultiplier, specialRewards } = req.body;
    if (!seasonId || !name || !description || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    try {
      const existing = await db.select().from(seasons).where(eq17(seasons.seasonId, seasonId)).limit(1);
      if (existing.length > 0) {
        return res.status(400).json({ error: "Season ID already exists" });
      }
      const newSeason = await db.insert(seasons).values({
        seasonId,
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        bonusMultiplier: bonusMultiplier || 1,
        specialRewards: specialRewards || null,
        isActive: false
      }).returning();
      res.json({
        success: true,
        message: "Season created successfully",
        season: newSeason[0]
      });
    } catch (error) {
      console.error("Create season error:", error);
      res.status(500).json({ error: error.message || "Failed to create season" });
    }
  });
  app2.put("/api/admin/seasons/:seasonId", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { seasonId } = req.params;
    const { name, description, startDate, endDate, bonusMultiplier, specialRewards } = req.body;
    try {
      const existing = await db.select().from(seasons).where(eq17(seasons.seasonId, seasonId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Season not found" });
      }
      const updateData = {};
      if (name !== void 0) updateData.name = name;
      if (description !== void 0) updateData.description = description;
      if (startDate !== void 0) updateData.startDate = new Date(startDate);
      if (endDate !== void 0) updateData.endDate = new Date(endDate);
      if (bonusMultiplier !== void 0) updateData.bonusMultiplier = bonusMultiplier;
      if (specialRewards !== void 0) updateData.specialRewards = specialRewards;
      const updated = await db.update(seasons).set(updateData).where(eq17(seasons.id, existing[0].id)).returning();
      res.json({
        success: true,
        message: "Season updated successfully",
        season: updated[0]
      });
    } catch (error) {
      console.error("Update season error:", error);
      res.status(500).json({ error: error.message || "Failed to update season" });
    }
  });
  app2.post("/api/admin/seasons/:seasonId/toggle", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { seasonId } = req.params;
    const { isActive } = req.body;
    try {
      const existing = await db.select().from(seasons).where(eq17(seasons.seasonId, seasonId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Season not found" });
      }
      if (isActive) {
        await db.update(seasons).set({ isActive: false }).where(eq17(seasons.isActive, true));
      }
      const updated = await db.update(seasons).set({ isActive }).where(eq17(seasons.id, existing[0].id)).returning();
      res.json({
        success: true,
        message: isActive ? "Season activated" : "Season deactivated",
        season: updated[0]
      });
    } catch (error) {
      console.error("Toggle season error:", error);
      res.status(500).json({ error: error.message || "Failed to toggle season" });
    }
  });
  app2.delete("/api/admin/seasons/:seasonId", validateTelegramAuth, requireAdmin, async (req, res) => {
    const { seasonId } = req.params;
    try {
      const existing = await db.select().from(seasons).where(eq17(seasons.seasonId, seasonId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Season not found" });
      }
      await db.delete(seasons).where(eq17(seasons.id, existing[0].id));
      res.json({
        success: true,
        message: "Season deleted successfully"
      });
    } catch (error) {
      console.error("Delete season error:", error);
      res.status(500).json({ error: error.message || "Failed to delete season" });
    }
  });
  app2.get("/api/user/:userId/packs", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const purchases = await db.select().from(packPurchases).where(eq17(packPurchases.userId, user.telegramId)).orderBy(packPurchases.purchasedAt);
      res.json(purchases);
    } catch (error) {
      console.error("Get pack purchases error:", error);
      res.status(500).json({ error: error.message || "Failed to get pack purchases" });
    }
  });
  app2.post("/api/user/:userId/packs/purchase", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { packType, tonTransactionHash, userWalletAddress, tonAmount } = req.body;
    if (!packType || !tonTransactionHash || !tonAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const validPacks = ["starter", "pro", "whale"];
    if (!validPacks.includes(packType)) {
      return res.status(400).json({ error: "Invalid pack type" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const existing = await tx.select().from(packPurchases).where(and12(
          eq17(packPurchases.userId, user[0].telegramId),
          eq17(packPurchases.packType, packType)
        )).limit(1);
        if (existing.length > 0) {
          throw new Error("You have already purchased this pack");
        }
        const packRewards = {
          starter: { cs: 5e4, equipment: ["laptop-gaming"], chst: 0 },
          pro: { cs: 25e4, equipment: ["pc-server-farm"], chst: 100 },
          whale: { cs: 1e6, equipment: ["asic-s19"], chst: 500 }
        };
        const rewards = packRewards[packType];
        await tx.update(users).set({
          csBalance: sql14`${users.csBalance} + ${rewards.cs}`,
          chstBalance: sql14`${users.chstBalance} + ${rewards.chst}`
        }).where(eq17(users.id, userId));
        for (const equipId of rewards.equipment) {
          const equipType = await tx.select().from(equipmentTypes).where(eq17(equipmentTypes.id, equipId)).limit(1);
          if (equipType[0]) {
            const existing2 = await tx.select().from(ownedEquipment).where(and12(
              eq17(ownedEquipment.userId, userId),
              eq17(ownedEquipment.equipmentTypeId, equipId)
            )).limit(1);
            if (existing2.length > 0) {
              await tx.update(ownedEquipment).set({ quantity: existing2[0].quantity + 1 }).where(eq17(ownedEquipment.id, existing2[0].id));
            } else {
              await tx.insert(ownedEquipment).values({
                userId,
                equipmentTypeId: equipId,
                quantity: 1,
                upgradeLevel: 0,
                currentHashrate: equipType[0].baseHashrate
              });
            }
          }
        }
        const purchase = await tx.insert(packPurchases).values({
          userId: user[0].telegramId,
          packType,
          tonAmount,
          tonTransactionHash,
          tonTransactionVerified: true,
          rewardsJson: JSON.stringify(rewards)
        }).returning();
        return { purchase: purchase[0], rewards };
      });
      res.json({
        success: true,
        message: "Pack purchased successfully!",
        purchase: result.purchase,
        rewards: result.rewards
      });
    } catch (error) {
      console.error("Purchase pack error:", error);
      res.status(500).json({ error: error.message || "Failed to purchase pack" });
    }
  });
  app2.get("/api/user/:userId/prestige", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      let prestige = await db.select().from(userPrestige).where(eq17(userPrestige.userId, user.telegramId)).limit(1);
      if (prestige.length === 0) {
        const created = await db.insert(userPrestige).values({
          userId: user.telegramId,
          prestigeLevel: 0,
          totalPrestiges: 0
        }).returning();
        prestige = created;
      }
      const history = await db.select().from(prestigeHistory).where(eq17(prestigeHistory.userId, user.telegramId)).orderBy(sql14`${prestigeHistory.prestigedAt} DESC`).limit(10);
      const eligible = user.csBalance >= 1e6 && user.totalHashrate >= 100;
      res.json({
        prestige: prestige[0],
        history,
        eligible,
        currentBoost: prestige[0].prestigeLevel * 5
        // 5% per prestige level
      });
    } catch (error) {
      console.error("Get prestige error:", error);
      res.status(500).json({ error: error.message || "Failed to get prestige info" });
    }
  });
  app2.post("/api/user/:userId/prestige/execute", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        if (user[0].csBalance < 1e6 || user[0].totalHashrate < 100) {
          throw new Error("Not eligible for prestige. Need 1M CS and 100 total hashrate.");
        }
        let prestige = await tx.select().from(userPrestige).where(eq17(userPrestige.userId, user[0].telegramId)).limit(1);
        if (prestige.length === 0) {
          const created = await tx.insert(userPrestige).values({
            userId: user[0].telegramId,
            prestigeLevel: 0,
            totalPrestiges: 0
          }).returning();
          prestige = created;
        }
        const currentPrestige = prestige[0];
        const equipment2 = await tx.select().from(ownedEquipment).where(eq17(ownedEquipment.userId, userId));
        await tx.insert(prestigeHistory).values({
          userId: user[0].telegramId,
          fromLevel: currentPrestige.prestigeLevel,
          toLevel: currentPrestige.prestigeLevel + 1,
          csBalanceReset: user[0].csBalance,
          equipmentReset: JSON.stringify(equipment2)
        });
        await tx.update(userPrestige).set({
          prestigeLevel: currentPrestige.prestigeLevel + 1,
          totalPrestiges: currentPrestige.totalPrestiges + 1,
          lastPrestigeAt: /* @__PURE__ */ new Date()
        }).where(eq17(userPrestige.id, currentPrestige.id));
        await tx.update(users).set({
          csBalance: 0,
          totalHashrate: 0
        }).where(eq17(users.id, userId));
        await tx.delete(ownedEquipment).where(eq17(ownedEquipment.userId, userId));
        await tx.delete(componentUpgrades).where(sql14`${componentUpgrades.ownedEquipmentId} IN (SELECT id FROM ${ownedEquipment} WHERE user_id = ${userId})`);
        return { newPrestigeLevel: currentPrestige.prestigeLevel + 1 };
      });
      res.json({
        success: true,
        message: `Prestige ${result.newPrestigeLevel} achieved!`,
        newPrestigeLevel: result.newPrestigeLevel,
        permanentBoost: result.newPrestigeLevel * 5
      });
    } catch (error) {
      console.error("Execute prestige error:", error);
      res.status(500).json({ error: error.message || "Failed to execute prestige" });
    }
  });
  app2.get("/api/user/:userId/subscription", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const subscription = await db.select().from(userSubscriptions).where(eq17(userSubscriptions.userId, user.telegramId)).limit(1);
      if (subscription.length === 0) {
        return res.json({ subscribed: false, subscription: null });
      }
      const sub = subscription[0];
      const now = /* @__PURE__ */ new Date();
      const isActive = sub.isActive && (!sub.endDate || new Date(sub.endDate) > now);
      res.json({
        subscribed: isActive,
        subscription: { ...sub, isActive }
      });
    } catch (error) {
      console.error("Get subscription error:", error);
      res.status(500).json({ error: error.message || "Failed to get subscription" });
    }
  });
  app2.post("/api/user/:userId/subscription/subscribe", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    const { subscriptionType, tonTransactionHash, tonAmount } = req.body;
    if (!subscriptionType || !tonTransactionHash || !tonAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const validTypes = ["monthly", "lifetime"];
    if (!validTypes.includes(subscriptionType)) {
      return res.status(400).json({ error: "Invalid subscription type" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq17(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const existing = await tx.select().from(userSubscriptions).where(eq17(userSubscriptions.userId, user[0].telegramId)).limit(1);
        const now = /* @__PURE__ */ new Date();
        let endDate = null;
        if (subscriptionType === "monthly") {
          endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1e3);
        }
        if (existing.length > 0) {
          const updated = await tx.update(userSubscriptions).set({
            subscriptionType,
            startDate: now,
            endDate,
            isActive: true,
            tonTransactionHash
          }).where(eq17(userSubscriptions.id, existing[0].id)).returning();
          return updated[0];
        } else {
          const created = await tx.insert(userSubscriptions).values({
            userId: user[0].telegramId,
            subscriptionType,
            startDate: now,
            endDate,
            isActive: true,
            tonTransactionHash
          }).returning();
          return created[0];
        }
      });
      res.json({
        success: true,
        message: "Subscription activated!",
        subscription: result
      });
    } catch (error) {
      console.error("Subscribe error:", error);
      res.status(500).json({ error: error.message || "Failed to subscribe" });
    }
  });
  app2.post("/api/user/:userId/subscription/cancel", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await db.update(userSubscriptions).set({ isActive: false, autoRenew: false }).where(eq17(userSubscriptions.userId, user.telegramId));
      res.json({
        success: true,
        message: "Subscription cancelled"
      });
    } catch (error) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({ error: error.message || "Failed to cancel subscription" });
    }
  });
  app2.get("/api/user/:userId/daily-login/status", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const streakData = await db.select().from(userStreaks).where(eq17(userStreaks.userId, user.telegramId)).limit(1);
      const currentStreak = streakData.length > 0 ? streakData[0].currentStreak : 0;
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const todaysClaim = await db.select().from(dailyLoginRewards).where(and12(
        eq17(dailyLoginRewards.userId, user.telegramId),
        sql14`DATE(${dailyLoginRewards.claimedAt}) = DATE(${today})`
      )).limit(1);
      const canClaim = todaysClaim.length === 0;
      const nextStreakDay = canClaim ? currentStreak + 1 : currentStreak;
      const nextReward = calculateDailyLoginReward(nextStreakDay);
      res.json({
        canClaim,
        currentStreak,
        nextReward,
        lastClaimDate: todaysClaim.length > 0 ? todaysClaim[0].claimedAt : null
      });
    } catch (error) {
      console.error("Daily login status error:", error);
      res.status(500).json({ error: "Failed to get daily login status" });
    }
  });
  app2.post("/api/user/:userId/daily-login/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const todaysClaim = await db.select().from(dailyLoginRewards).where(and12(
        eq17(dailyLoginRewards.userId, user.telegramId),
        sql14`DATE(${dailyLoginRewards.claimedAt}) = DATE(${today})`
      )).limit(1);
      if (todaysClaim.length > 0) {
        return res.status(400).json({ error: "Daily reward already claimed today" });
      }
      const streakData = await db.select().from(userStreaks).where(eq17(userStreaks.userId, user.telegramId)).limit(1);
      let currentStreak = 0;
      if (streakData.length > 0) {
        const lastLoginDate = new Date(streakData[0].lastLoginDate);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastLoginDate >= yesterday && lastLoginDate < today) {
          currentStreak = streakData[0].currentStreak + 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      const rewards = calculateDailyLoginReward(currentStreak);
      const loginDateStr = today.toISOString().split("T")[0];
      await db.transaction(async (tx) => {
        await tx.insert(dailyLoginRewards).values({
          userId: user.telegramId,
          loginDate: loginDateStr,
          streakDay: currentStreak,
          rewardCs: rewards.cs,
          rewardChst: rewards.chst,
          rewardItem: rewards.item
        });
        await tx.update(users).set({
          csBalance: sql14`${users.csBalance} + ${rewards.cs}`,
          chstBalance: sql14`${users.chstBalance} + ${rewards.chst}`
        }).where(eq17(users.telegramId, user.telegramId));
        if (streakData.length > 0) {
          await tx.update(userStreaks).set({
            currentStreak,
            longestStreak: sql14`GREATEST(${userStreaks.longestStreak}, ${currentStreak})`,
            lastLoginDate: loginDateStr
          }).where(eq17(userStreaks.userId, user.telegramId));
        } else {
          await tx.insert(userStreaks).values({
            userId: user.telegramId,
            currentStreak,
            longestStreak: currentStreak,
            lastLoginDate: loginDateStr
          });
        }
      });
      res.json({
        success: true,
        reward: rewards,
        streakDay: currentStreak,
        message: `Day ${currentStreak} reward claimed!`
      });
    } catch (error) {
      console.error("Daily login claim error:", error);
      res.status(500).json({ error: "Failed to claim daily reward" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { nodePolyfills } from "vite-plugin-node-polyfills";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    nodePolyfills({
      // Enable polyfills for Buffer and other Node.js globals
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    }),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
init_mining();

// server/seedDatabase.ts
init_db();
init_schema();
import { eq as eq18 } from "drizzle-orm";
async function seedDatabase() {
  try {
    console.log("\u{1F331} Starting database seeding...");
    const equipmentCatalog = [
      // BASIC LAPTOPS - CS/TON (Phase 1), CHST (Phase 2) - Cap: 10/model/user
      { id: "laptop-lenovo-e14", name: "Lenovo ThinkPad E14", tier: "Basic", category: "Basic Laptop", baseHashrate: 50, basePrice: 1e3, currency: "CS", maxOwned: 10, orderIndex: 1 },
      { id: "laptop-dell-inspiron", name: "Dell Inspiron 15", tier: "Basic", category: "Basic Laptop", baseHashrate: 75, basePrice: 1500, currency: "CS", maxOwned: 10, orderIndex: 2 },
      { id: "laptop-hp-pavilion", name: "HP Pavilion 15", tier: "Basic", category: "Basic Laptop", baseHashrate: 100, basePrice: 2e3, currency: "CS", maxOwned: 10, orderIndex: 3 },
      { id: "laptop-asus-vivobook", name: "ASUS VivoBook 15", tier: "Basic", category: "Basic Laptop", baseHashrate: 125, basePrice: 2500, currency: "CS", maxOwned: 10, orderIndex: 4 },
      { id: "laptop-acer-aspire", name: "Acer Aspire 5", tier: "Basic", category: "Basic Laptop", baseHashrate: 150, basePrice: 3e3, currency: "CS", maxOwned: 10, orderIndex: 5 },
      // GAMING LAPTOPS - CS/TON (Phase 1), CHST (Phase 2) - Cap: 10/model/user
      { id: "gaming-acer-predator", name: "Acer Predator Helios", tier: "Gaming", category: "Gaming Laptop", baseHashrate: 300, basePrice: 5e3, currency: "CS", maxOwned: 10, orderIndex: 6 },
      { id: "gaming-msi-stealth", name: "MSI Stealth 15M", tier: "Gaming", category: "Gaming Laptop", baseHashrate: 400, basePrice: 7500, currency: "CS", maxOwned: 10, orderIndex: 7 },
      { id: "gaming-asus-rog", name: "ASUS ROG Zephyrus", tier: "Gaming", category: "Gaming Laptop", baseHashrate: 500, basePrice: 1e4, currency: "CS", maxOwned: 10, orderIndex: 8 },
      { id: "gaming-alienware-m15", name: "Alienware m15 R7", tier: "Gaming", category: "Gaming Laptop", baseHashrate: 600, basePrice: 15e3, currency: "CS", maxOwned: 10, orderIndex: 9 },
      { id: "gaming-razor-blade", name: "Razer Blade 15", tier: "Gaming", category: "Gaming Laptop", baseHashrate: 700, basePrice: 2e4, currency: "CS", maxOwned: 10, orderIndex: 10 },
      // GAMING PCS - First buy CS-only, upgrades CS/CHST then TON - Cap: 25/model/user
      { id: "pc-vixia-high-end", name: "VIXIA High-End i9/RTX4090", tier: "Gaming", category: "Gaming PC", baseHashrate: 700, basePrice: 25e3, currency: "CS", maxOwned: 25, orderIndex: 11 },
      { id: "pc-custom-i7-rtx4080", name: "Custom i7/RTX4080", tier: "Gaming", category: "Gaming PC", baseHashrate: 1e3, basePrice: 35e3, currency: "CS", maxOwned: 25, orderIndex: 12 },
      { id: "pc-custom-i9-rtx4090", name: "Custom i9/RTX4090", tier: "Gaming", category: "Gaming PC", baseHashrate: 1500, basePrice: 5e4, currency: "CS", maxOwned: 25, orderIndex: 13 },
      { id: "pc-custom-dual-gpu", name: "Dual GPU Workstation", tier: "Gaming", category: "Gaming PC", baseHashrate: 2e3, basePrice: 75e3, currency: "CS", maxOwned: 25, orderIndex: 14 },
      { id: "pc-custom-quad-gpu", name: "Quad GPU Mining Rig", tier: "Gaming", category: "Gaming PC", baseHashrate: 3e3, basePrice: 1e5, currency: "CS", maxOwned: 25, orderIndex: 15 },
      // SERVER FARMS - TON-only - Cap: 25/model/user
      { id: "server-supermicro-4029", name: "Supermicro SYS-4029GP-TRT", tier: "Server", category: "Server Farm", baseHashrate: 5e3, basePrice: 0.5, currency: "TON", maxOwned: 25, orderIndex: 16 },
      { id: "server-dell-poweredge-r750", name: "Dell PowerEdge R750", tier: "Server", category: "Server Farm", baseHashrate: 7500, basePrice: 1, currency: "TON", maxOwned: 25, orderIndex: 17 },
      { id: "server-hp-proliant-dl380", name: "HP ProLiant DL380", tier: "Server", category: "Server Farm", baseHashrate: 1e4, basePrice: 1.5, currency: "TON", maxOwned: 25, orderIndex: 18 },
      { id: "server-custom-rack-1u", name: "Custom 1U Rack Server", tier: "Server", category: "Server Farm", baseHashrate: 15e3, basePrice: 2, currency: "TON", maxOwned: 25, orderIndex: 19 },
      { id: "server-custom-rack-2u", name: "Custom 2U Rack Server", tier: "Server", category: "Server Farm", baseHashrate: 2e4, basePrice: 3, currency: "TON", maxOwned: 25, orderIndex: 20 },
      // ASIC RIGS - TON-only - Cap: 50/model/user
      { id: "asic-bitmain-s21-pro", name: "Bitmain Antminer S21 Pro", tier: "ASIC", category: "ASIC Rig", baseHashrate: 5e4, basePrice: 5, currency: "TON", maxOwned: 50, orderIndex: 21 },
      { id: "asic-whatsminer-m60s", name: "WhatsMiner M60S", tier: "ASIC", category: "ASIC Rig", baseHashrate: 75e3, basePrice: 7.5, currency: "TON", maxOwned: 50, orderIndex: 22 },
      { id: "asic-bitmain-s21-xp", name: "Bitmain Antminer S21 XP", tier: "ASIC", category: "ASIC Rig", baseHashrate: 1e5, basePrice: 10, currency: "TON", maxOwned: 50, orderIndex: 23 },
      { id: "asic-microbt-m50", name: "MicroBT WhatsMiner M50", tier: "ASIC", category: "ASIC Rig", baseHashrate: 125e3, basePrice: 12.5, currency: "TON", maxOwned: 50, orderIndex: 24 },
      { id: "asic-bitmain-s23", name: "Bitmain Antminer S23", tier: "ASIC", category: "ASIC Rig", baseHashrate: 15e4, basePrice: 15, currency: "TON", maxOwned: 50, orderIndex: 25 },
      { id: "asic-axionminer-800", name: "AxionMiner 800", tier: "ASIC", category: "ASIC Rig", baseHashrate: 175e3, basePrice: 17.5, currency: "TON", maxOwned: 50, orderIndex: 26 },
      { id: "asic-bitmain-s21-xp-hyd", name: "Bitmain Antminer S21 XP+ Hyd", tier: "ASIC", category: "ASIC Rig", baseHashrate: 2e5, basePrice: 20, currency: "TON", maxOwned: 50, orderIndex: 27 },
      { id: "asic-canaan-avalon-q", name: "Canaan Avalon Q", tier: "ASIC", category: "ASIC Rig", baseHashrate: 25e4, basePrice: 25, currency: "TON", maxOwned: 50, orderIndex: 28 },
      { id: "asic-bitmain-s21e-xp-hydro", name: "Bitmain Antminer S21e XP Hydro", tier: "ASIC", category: "ASIC Rig", baseHashrate: 3e5, basePrice: 30, currency: "TON", maxOwned: 50, orderIndex: 29 },
      { id: "asic-whatsminer-m63s-hydro", name: "WhatsMiner M63S Hydro", tier: "ASIC", category: "ASIC Rig", baseHashrate: 5e5, basePrice: 50, currency: "TON", maxOwned: 50, orderIndex: 30 },
      // NEW: MORE ASIC RIGS - Premium Models - TON-only - Cap: 50/model/user
      { id: "asic-bitmain-s25-pro", name: "Bitmain Antminer S25 Pro", tier: "ASIC", category: "ASIC Rig", baseHashrate: 6e5, basePrice: 60, currency: "TON", maxOwned: 50, orderIndex: 31 },
      { id: "asic-whatsminer-m70s", name: "WhatsMiner M70S", tier: "ASIC", category: "ASIC Rig", baseHashrate: 7e5, basePrice: 70, currency: "TON", maxOwned: 50, orderIndex: 32 },
      { id: "asic-microbt-m63", name: "MicroBT WhatsMiner M63", tier: "ASIC", category: "ASIC Rig", baseHashrate: 75e4, basePrice: 75, currency: "TON", maxOwned: 50, orderIndex: 33 },
      { id: "asic-canaan-avalon-ultra", name: "Canaan Avalon Ultra", tier: "ASIC", category: "ASIC Rig", baseHashrate: 8e5, basePrice: 80, currency: "TON", maxOwned: 50, orderIndex: 34 },
      { id: "asic-bitmain-s26-hydro", name: "Bitmain Antminer S26 Hydro", tier: "ASIC", category: "ASIC Rig", baseHashrate: 9e5, basePrice: 90, currency: "TON", maxOwned: 50, orderIndex: 35 },
      { id: "asic-whatsminer-m80s-elite", name: "WhatsMiner M80S Elite", tier: "ASIC", category: "ASIC Rig", baseHashrate: 1e6, basePrice: 100, currency: "TON", maxOwned: 50, orderIndex: 36 },
      { id: "asic-microbt-m70-turbo", name: "MicroBT M70 Turbo", tier: "ASIC", category: "ASIC Rig", baseHashrate: 11e5, basePrice: 110, currency: "TON", maxOwned: 50, orderIndex: 37 },
      { id: "asic-bitmain-s27-pro-hydro", name: "Bitmain Antminer S27 Pro Hydro", tier: "ASIC", category: "ASIC Rig", baseHashrate: 125e4, basePrice: 125, currency: "TON", maxOwned: 50, orderIndex: 38 },
      { id: "asic-whatsminer-m90s-max", name: "WhatsMiner M90S Max", tier: "ASIC", category: "ASIC Rig", baseHashrate: 15e5, basePrice: 150, currency: "TON", maxOwned: 50, orderIndex: 39 },
      { id: "asic-axionminer-2000-ultra", name: "AxionMiner 2000 Ultra", tier: "ASIC", category: "ASIC Rig", baseHashrate: 2e6, basePrice: 200, currency: "TON", maxOwned: 50, orderIndex: 40 },
      // NEW: FPGA MINERS - Mid-tier between GPU and ASIC - TON-only - Cap: 30/model/user
      { id: "fpga-xilinx-vcu1525", name: "Xilinx VCU1525 FPGA", tier: "FPGA", category: "FPGA Miner", baseHashrate: 25e3, basePrice: 2.5, currency: "TON", maxOwned: 30, orderIndex: 41 },
      { id: "fpga-bittware-cvp13", name: "BittWare CVP-13 FPGA", tier: "FPGA", category: "FPGA Miner", baseHashrate: 35e3, basePrice: 3.5, currency: "TON", maxOwned: 30, orderIndex: 42 },
      { id: "fpga-intel-stratix-10", name: "Intel Stratix 10 FPGA", tier: "FPGA", category: "FPGA Miner", baseHashrate: 45e3, basePrice: 4.5, currency: "TON", maxOwned: 30, orderIndex: 43 },
      { id: "fpga-xilinx-u250", name: "Xilinx Alveo U250", tier: "FPGA", category: "FPGA Miner", baseHashrate: 6e4, basePrice: 6, currency: "TON", maxOwned: 30, orderIndex: 44 },
      { id: "fpga-bittware-xupvv4", name: "BittWare XUPVV4 FPGA Cluster", tier: "FPGA", category: "FPGA Miner", baseHashrate: 8e4, basePrice: 8, currency: "TON", maxOwned: 30, orderIndex: 45 },
      // NEW: CLOUD MINING CONTRACTS - Subscription-based - TON-only - Cap: 100/model/user
      { id: "cloud-starter-1month", name: "Cloud Mining Starter (30 days)", tier: "Cloud", category: "Cloud Mining", baseHashrate: 1e5, basePrice: 3, currency: "TON", maxOwned: 100, orderIndex: 46 },
      { id: "cloud-pro-1month", name: "Cloud Mining Pro (30 days)", tier: "Cloud", category: "Cloud Mining", baseHashrate: 25e4, basePrice: 7, currency: "TON", maxOwned: 100, orderIndex: 47 },
      { id: "cloud-elite-1month", name: "Cloud Mining Elite (30 days)", tier: "Cloud", category: "Cloud Mining", baseHashrate: 5e5, basePrice: 15, currency: "TON", maxOwned: 100, orderIndex: 48 },
      { id: "cloud-enterprise-1month", name: "Cloud Mining Enterprise (30 days)", tier: "Cloud", category: "Cloud Mining", baseHashrate: 1e6, basePrice: 30, currency: "TON", maxOwned: 100, orderIndex: 49 },
      { id: "cloud-mega-1month", name: "Cloud Mining Mega (30 days)", tier: "Cloud", category: "Cloud Mining", baseHashrate: 25e5, basePrice: 75, currency: "TON", maxOwned: 100, orderIndex: 50 },
      // NEW: QUANTUM MINERS - Elite/Legendary tier - TON-only - Cap: 10/model/user (limited!)
      { id: "quantum-ibm-q1", name: "IBM Quantum System Q1", tier: "Quantum", category: "Quantum Miner", baseHashrate: 5e6, basePrice: 250, currency: "TON", maxOwned: 10, orderIndex: 51 },
      { id: "quantum-google-sycamore", name: "Google Sycamore Quantum", tier: "Quantum", category: "Quantum Miner", baseHashrate: 75e5, basePrice: 375, currency: "TON", maxOwned: 10, orderIndex: 52 },
      { id: "quantum-rigetti-aspen", name: "Rigetti Aspen Quantum", tier: "Quantum", category: "Quantum Miner", baseHashrate: 1e7, basePrice: 500, currency: "TON", maxOwned: 10, orderIndex: 53 },
      { id: "quantum-ionq-forte", name: "IonQ Forte Quantum", tier: "Quantum", category: "Quantum Miner", baseHashrate: 15e6, basePrice: 750, currency: "TON", maxOwned: 10, orderIndex: 54 },
      { id: "quantum-atom-prime", name: "Atom Computing Prime Quantum", tier: "Quantum", category: "Quantum Miner", baseHashrate: 25e6, basePrice: 1e3, currency: "TON", maxOwned: 10, orderIndex: 55 }
    ];
    console.log(`\u{1F4E6} Upserting ${equipmentCatalog.length} equipment items...`);
    for (const equipment2 of equipmentCatalog) {
      await db.insert(equipmentTypes).values(equipment2).onConflictDoUpdate({
        target: equipmentTypes.id,
        set: equipment2
      });
    }
    console.log(`\u2705 Equipment types upserted: ${equipmentCatalog.length}`);
    const finalCount = await db.select().from(equipmentTypes);
    console.log(`\u{1F50D} Verification: ${finalCount.length} equipment items in database`);
    const defaultSettings = [
      { key: "mining_paused", value: "false" },
      { key: "equipment_price_multiplier", value: "1.0" },
      { key: "block_reward", value: "100000" },
      { key: "block_interval_seconds", value: "300" }
    ];
    for (const setting of defaultSettings) {
      const existing = await db.select().from(gameSettings).where(eq18(gameSettings.key, setting.key));
      if (existing.length === 0) {
        await db.insert(gameSettings).values(setting);
      }
    }
    console.log("\u2705 Game settings seeded");
    console.log("\u{1F389} Database seeding complete!");
    return true;
  } catch (error) {
    console.error("\u274C Seeding failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

// server/seedGameContent.ts
init_db();
init_schema();
var dailyChallengesData = [
  {
    challengeId: "early-bird",
    name: "Early Bird",
    description: "Mine a block before 12PM",
    requirement: "mine_before_noon",
    rewardCs: 5e3,
    rewardChst: null,
    rewardItem: null,
    isActive: true
  },
  {
    challengeId: "night-owl",
    name: "Night Owl",
    description: "Mine a block after 12AM",
    requirement: "mine_after_midnight",
    rewardCs: 5e3,
    rewardChst: null,
    rewardItem: null,
    isActive: true
  },
  {
    challengeId: "power-user",
    name: "Power User",
    description: "Claim all 5 daily power-ups",
    requirement: "claim_5_daily_powerups",
    rewardCs: 2500,
    rewardChst: null,
    rewardItem: null,
    isActive: true
  },
  {
    challengeId: "big-spender",
    name: "Big Spender",
    description: "Spend 50,000 CS in shop",
    requirement: "spend_50000_cs",
    rewardCs: 1e4,
    rewardChst: null,
    rewardItem: null,
    isActive: true
  },
  {
    challengeId: "networker",
    name: "Networker",
    description: "Refer 1 new friend today",
    requirement: "refer_1_friend",
    rewardCs: 0,
    rewardChst: null,
    rewardItem: "basic-loot-box",
    isActive: true
  }
];
var achievementsData = [
  {
    achievementId: "first-steps",
    name: "First Steps",
    description: "Own your first equipment",
    requirement: "own_1_equipment",
    category: "milestone",
    rewardCs: 1e3,
    rewardChst: null,
    rewardItem: null,
    badgeIcon: "\u{1F3AF}",
    isActive: true,
    orderIndex: 1
  },
  {
    achievementId: "getting-serious",
    name: "Getting Serious",
    description: "Reach 1,000 H/s",
    requirement: "hashrate_1000",
    category: "milestone",
    rewardCs: 5e3,
    rewardChst: null,
    rewardItem: null,
    badgeIcon: "\u26A1",
    isActive: true,
    orderIndex: 2
  },
  {
    achievementId: "power-miner",
    name: "Power Miner",
    description: "Reach 10,000 H/s",
    requirement: "hashrate_10000",
    category: "milestone",
    rewardCs: 25e3,
    rewardChst: null,
    rewardItem: null,
    badgeIcon: "\u{1F4AA}",
    isActive: true,
    orderIndex: 3
  },
  {
    achievementId: "network-whale",
    name: "Network Whale",
    description: "Reach 100,000 H/s",
    requirement: "hashrate_100000",
    category: "milestone",
    rewardCs: 1e5,
    rewardChst: null,
    rewardItem: null,
    badgeIcon: "\u{1F40B}",
    isActive: true,
    orderIndex: 4
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
    badgeIcon: "\u{1F4E6}",
    isActive: true,
    orderIndex: 5
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
    badgeIcon: "\u{1F451}",
    isActive: true,
    orderIndex: 6
  },
  {
    achievementId: "social-butterfly",
    name: "Social Butterfly",
    description: "Refer 10 friends",
    requirement: "refer_10_friends",
    category: "social",
    rewardCs: 5e4,
    rewardChst: null,
    rewardItem: null,
    badgeIcon: "\u{1F98B}",
    isActive: true,
    orderIndex: 7
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
    badgeIcon: "\u{1F3B2}",
    isActive: true,
    orderIndex: 8
  }
];
var cosmeticItemsData = [
  // Backgrounds
  {
    itemId: "bg-matrix-rain",
    name: "Matrix Rain",
    description: "Classic green matrix falling code",
    category: "background",
    priceCs: 5e4,
    priceChst: null,
    priceTon: "0.5",
    imageUrl: "/cosmetics/bg-matrix.png",
    isAnimated: true,
    isActive: true,
    orderIndex: 1
  },
  {
    itemId: "bg-cyberpunk-city",
    name: "Cyberpunk City",
    description: "Neon-lit futuristic cityscape",
    category: "background",
    priceCs: 5e4,
    priceChst: null,
    priceTon: "0.5",
    imageUrl: "/cosmetics/bg-cyberpunk.png",
    isAnimated: false,
    isActive: true,
    orderIndex: 2
  },
  {
    itemId: "bg-bitcoin-gold",
    name: "Bitcoin Gold",
    description: "Golden Bitcoin background",
    category: "background",
    priceCs: 5e4,
    priceChst: null,
    priceTon: "0.5",
    imageUrl: "/cosmetics/bg-bitcoin.png",
    isAnimated: false,
    isActive: true,
    orderIndex: 3
  },
  {
    itemId: "bg-neon-grid",
    name: "Neon Grid",
    description: "Retro neon grid pattern",
    category: "background",
    priceCs: 5e4,
    priceChst: null,
    priceTon: "0.5",
    imageUrl: "/cosmetics/bg-neon-grid.png",
    isAnimated: true,
    isActive: true,
    orderIndex: 4
  },
  {
    itemId: "bg-ton-blue",
    name: "TON Blue",
    description: "Official TON blockchain theme",
    category: "background",
    priceCs: 5e4,
    priceChst: null,
    priceTon: "0.5",
    imageUrl: "/cosmetics/bg-ton.png",
    isAnimated: false,
    isActive: true,
    orderIndex: 5
  },
  // Name Colors
  {
    itemId: "color-matrix-green",
    name: "Matrix Green",
    description: "Classic hacker green text",
    category: "nameColor",
    priceCs: 1e5,
    priceChst: null,
    priceTon: "1.0",
    imageUrl: null,
    isAnimated: false,
    isActive: true,
    orderIndex: 10
  },
  {
    itemId: "color-ton-blue",
    name: "TON Blue",
    description: "Official TON blue color",
    category: "nameColor",
    priceCs: 1e5,
    priceChst: null,
    priceTon: "1.0",
    imageUrl: null,
    isAnimated: false,
    isActive: true,
    orderIndex: 11
  },
  {
    itemId: "color-gold",
    name: "Gold",
    description: "Luxurious golden text",
    category: "nameColor",
    priceCs: 1e5,
    priceChst: null,
    priceTon: "1.0",
    imageUrl: null,
    isAnimated: false,
    isActive: true,
    orderIndex: 12
  },
  {
    itemId: "color-rainbow",
    name: "Rainbow",
    description: "Animated rainbow gradient",
    category: "nameColor",
    priceCs: 1e5,
    priceChst: null,
    priceTon: "1.0",
    imageUrl: null,
    isAnimated: true,
    isActive: true,
    orderIndex: 13
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
    orderIndex: 20
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
    orderIndex: 21
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
    orderIndex: 22
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
    orderIndex: 23
  }
];
async function seedGameContent() {
  console.log("\u{1F3AE} Seeding game content...");
  try {
    console.log("\u{1F4C5} Seeding daily challenges...");
    for (const challenge of dailyChallengesData) {
      await db.insert(dailyChallenges).values(challenge).onConflictDoUpdate({
        target: dailyChallenges.challengeId,
        set: challenge
      });
    }
    console.log(`\u2705 Seeded ${dailyChallengesData.length} daily challenges`);
    console.log("\u{1F3C6} Seeding achievements...");
    for (const achievement of achievementsData) {
      await db.insert(achievements).values(achievement).onConflictDoUpdate({
        target: achievements.achievementId,
        set: achievement
      });
    }
    console.log(`\u2705 Seeded ${achievementsData.length} achievements`);
    console.log("\u{1F3A8} Seeding cosmetic items...");
    for (const cosmetic of cosmeticItemsData) {
      await db.insert(cosmeticItems).values(cosmetic).onConflictDoUpdate({
        target: cosmeticItems.itemId,
        set: cosmetic
      });
    }
    console.log(`\u2705 Seeded ${cosmeticItemsData.length} cosmetic items`);
    console.log("\u2728 Game content seeding complete!");
  } catch (error) {
    console.error("\u274C Error seeding game content:", error);
    throw error;
  }
}

// server/seedFeatureFlags.ts
init_storage();
init_schema();
import { eq as eq19 } from "drizzle-orm";
var initialFeatureFlags = [
  {
    featureKey: "blocks",
    featureName: "Block Explorer",
    description: "View mined blocks and your mining contributions",
    isEnabled: true
  },
  {
    featureKey: "leaderboard",
    featureName: "Leaderboard",
    description: "Compete with other players and see rankings",
    isEnabled: true
  },
  {
    featureKey: "challenges",
    featureName: "Challenges",
    description: "Daily challenges and tasks for rewards",
    isEnabled: true
  },
  {
    featureKey: "achievements",
    featureName: "Achievements",
    description: "Unlock achievements and earn bonuses",
    isEnabled: true
  },
  {
    featureKey: "cosmetics",
    featureName: "Cosmetics Shop",
    description: "Customize your appearance with cosmetic items",
    isEnabled: true
  },
  {
    featureKey: "statistics",
    featureName: "Statistics",
    description: "View detailed stats and analytics",
    isEnabled: true
  },
  {
    featureKey: "spin",
    featureName: "Spin Wheel",
    description: "Spin the wheel for prizes and rewards",
    isEnabled: true
  },
  {
    featureKey: "referrals",
    featureName: "Referrals",
    description: "Invite friends and earn referral bonuses",
    isEnabled: true
  },
  {
    featureKey: "packs",
    featureName: "Premium Packs",
    description: "Purchase starter and premium packs",
    isEnabled: true
  },
  {
    featureKey: "subscription",
    featureName: "Subscription",
    description: "Subscribe for exclusive benefits",
    isEnabled: true
  }
];
async function seedFeatureFlags() {
  console.log("\u{1F331} Seeding feature flags...");
  try {
    for (const flag of initialFeatureFlags) {
      const existing = await db.select().from(featureFlags).where(eq19(featureFlags.featureKey, flag.featureKey)).limit(1);
      if (existing.length === 0) {
        await db.insert(featureFlags).values(flag);
        console.log(`\u2705 Created feature flag: ${flag.featureName}`);
      } else {
        console.log(`\u23ED\uFE0F  Feature flag already exists: ${flag.featureName}`);
      }
    }
    console.log("\u2705 Feature flags seeded successfully!");
    return true;
  } catch (error) {
    console.error("\u274C Error seeding feature flags:", error);
    return false;
  }
}

// server/applyIndexes.ts
init_db();
import { sql as sql15 } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";
async function applyPerformanceIndexes() {
  try {
    console.log("\u{1F4CA} Applying performance indexes...");
    const indexSQL = readFileSync(
      join(process.cwd(), "server/migrations/add-indexes.sql"),
      "utf-8"
    );
    const statements = indexSQL.split(";").map((s) => s.trim()).filter((s) => s.length > 0 && !s.startsWith("--"));
    for (const statement of statements) {
      await db.execute(sql15.raw(statement));
    }
    console.log(`\u2705 Applied ${statements.length} performance indexes`);
  } catch (error) {
    console.error("\u26A0\uFE0F  Failed to apply indexes (non-fatal):", error);
  }
}

// server/index.ts
init_db();

// server/cron.ts
var announcementInterval = null;
var dailyAnalyticsInterval = null;
var retentionCohortsInterval = null;
var hourlyDauInterval = null;
var eventSchedulerInterval = null;
var economyMetricsInterval = null;
var economySinksInterval = null;
var segmentRefreshInterval = null;
var reEngagementInterval = null;
function startCronJobs() {
  console.log("\u23F0 Starting cron jobs...");
  announcementInterval = setInterval(async () => {
    try {
      await processScheduledAnnouncements();
    } catch (error) {
      console.error("Announcement cron error:", error);
    }
  }, 60 * 1e3);
  eventSchedulerInterval = setInterval(async () => {
    try {
      await processScheduledEvents();
    } catch (error) {
      console.error("Event scheduler cron error:", error);
    }
  }, 60 * 1e3);
  dailyAnalyticsInterval = setInterval(async () => {
    try {
      const now = /* @__PURE__ */ new Date();
      if (now.getUTCHours() === 0 && now.getUTCMinutes() < 60) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        console.log(`\u{1F4CA} Generating daily analytics report for ${yesterday.toISOString().split("T")[0]}...`);
        await generateDailyReport(yesterday);
        console.log("\u2705 Daily analytics report generated");
      }
    } catch (error) {
      console.error("Daily analytics cron error:", error);
    }
  }, 60 * 60 * 1e3);
  retentionCohortsInterval = setInterval(async () => {
    try {
      const now = /* @__PURE__ */ new Date();
      if (now.getUTCHours() === 1 && now.getUTCMinutes() < 60) {
        console.log("\u{1F4CA} Updating retention cohorts...");
        await updateRetentionCohorts();
        console.log("\u2705 Retention cohorts updated");
      }
    } catch (error) {
      console.error("Retention cohorts cron error:", error);
    }
  }, 60 * 60 * 1e3);
  economyMetricsInterval = setInterval(async () => {
    try {
      const now = /* @__PURE__ */ new Date();
      if (now.getUTCHours() === 2 && now.getUTCMinutes() < 60) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        console.log(`\u{1F4B0} Calculating economy metrics for ${yesterday.toISOString().split("T")[0]}...`);
        await calculateDailyEconomyMetrics(yesterday);
        console.log("\u2705 Economy metrics calculated");
      }
    } catch (error) {
      console.error("Economy metrics cron error:", error);
    }
  }, 60 * 60 * 1e3);
  economySinksInterval = setInterval(async () => {
    try {
      const now = /* @__PURE__ */ new Date();
      if (now.getUTCHours() === 2 && now.getUTCMinutes() >= 30 && now.getUTCMinutes() < 90) {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        console.log(`\u{1F4B0} Calculating economy sinks for ${yesterday.toISOString().split("T")[0]}...`);
        await calculateEconomySinks(yesterday);
        console.log("\u2705 Economy sinks calculated");
      }
    } catch (error) {
      console.error("Economy sinks cron error:", error);
    }
  }, 60 * 60 * 1e3);
  segmentRefreshInterval = setInterval(async () => {
    try {
      const now = /* @__PURE__ */ new Date();
      if (now.getUTCHours() === 4 && now.getUTCMinutes() < 60) {
        console.log("\u{1F465} Refreshing user segments...");
        await refreshAllSegments();
        console.log("\u2705 User segments refreshed");
      }
    } catch (error) {
      console.error("Segment refresh cron error:", error);
    }
  }, 60 * 60 * 1e3);
  reEngagementInterval = setInterval(async () => {
    try {
      const now = /* @__PURE__ */ new Date();
      if (now.getUTCHours() === 5 && now.getUTCMinutes() < 60) {
        console.log("\u{1F4E7} Sending re-engagement messages...");
        await sendReEngagementMessages();
        console.log("\u2705 Re-engagement messages sent");
      }
    } catch (error) {
      console.error("Re-engagement cron error:", error);
    }
  }, 60 * 60 * 1e3);
  hourlyDauInterval = setInterval(async () => {
    try {
      const today = /* @__PURE__ */ new Date();
      console.log("\u{1F4CA} Updating today's analytics...");
      await generateDailyReport(today);
      console.log("\u2705 Today's analytics updated");
    } catch (error) {
      console.error("Hourly DAU cron error:", error);
    }
  }, 60 * 60 * 1e3);
  console.log("\u2705 Cron jobs started:");
  console.log("  - Scheduled announcements: Every 1 minute");
  console.log("  - Event scheduler: Every 1 minute");
  console.log("  - Daily analytics report: Daily at midnight UTC");
  console.log("  - Retention cohorts: Daily at 1am UTC");
  console.log("  - Economy metrics: Daily at 2am UTC");
  console.log("  - Economy sinks: Daily at 2:30am UTC");
  console.log("  - User segment refresh: Daily at 4am UTC");
  console.log("  - Re-engagement messages: Daily at 5am UTC");
  console.log("  - Hourly DAU update: Every hour");
}
function stopCronJobs() {
  console.log("\u23F0 Stopping cron jobs...");
  if (announcementInterval) {
    clearInterval(announcementInterval);
    announcementInterval = null;
  }
  if (eventSchedulerInterval) {
    clearInterval(eventSchedulerInterval);
    eventSchedulerInterval = null;
  }
  if (dailyAnalyticsInterval) {
    clearInterval(dailyAnalyticsInterval);
    dailyAnalyticsInterval = null;
  }
  if (retentionCohortsInterval) {
    clearInterval(retentionCohortsInterval);
    retentionCohortsInterval = null;
  }
  if (economyMetricsInterval) {
    clearInterval(economyMetricsInterval);
    economyMetricsInterval = null;
  }
  if (economySinksInterval) {
    clearInterval(economySinksInterval);
    economySinksInterval = null;
  }
  if (segmentRefreshInterval) {
    clearInterval(segmentRefreshInterval);
    segmentRefreshInterval = null;
  }
  if (reEngagementInterval) {
    clearInterval(reEngagementInterval);
    reEngagementInterval = null;
  }
  if (hourlyDauInterval) {
    clearInterval(hourlyDauInterval);
    hourlyDauInterval = null;
  }
  console.log("\u2705 Cron jobs stopped");
}
process.once("SIGINT", () => {
  stopCronJobs();
});
process.once("SIGTERM", () => {
  stopCronJobs();
});

// server/index.ts
import rateLimit from "express-rate-limit";
var app = express2();
app.set("trust proxy", 1);
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 200,
  // 200 requests per 15 minutes per IP
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === "/healthz" || req.path === "/api/health" || !req.path.startsWith("/api/");
  }
});
var strictLimiter = rateLimit({
  windowMs: 5 * 60 * 1e3,
  // 5 minutes
  max: 20,
  // 20 requests per 5 minutes
  message: { error: "Too many purchase attempts, please slow down" },
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", apiLimiter);
app.use("/api/user/:userId/equipment/purchase", strictLimiter);
app.use("/api/user/:userId/powerups/purchase", strictLimiter);
app.use("/api/user/:userId/packs/purchase", strictLimiter);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
app.get("/api/health", async (_req, res) => {
  try {
    const isDatabaseHealthy = await checkDatabaseHealth();
    if (isDatabaseHealthy) {
      res.status(200).json({
        status: "healthy",
        database: "connected"
      });
    } else {
      res.status(503).json({
        status: "degraded",
        database: "disconnected",
        message: "Database connection failed"
      });
    }
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      database: "error",
      message: "Health check failed"
    });
  }
});
app.get("/api/health/mining", async (_req, res) => {
  try {
    const { getMiningHealth: getMiningHealth2 } = await Promise.resolve().then(() => (init_mining(), mining_exports));
    const miningHealth = getMiningHealth2();
    if (miningHealth.status === "healthy") {
      res.status(200).json(miningHealth);
    } else {
      res.status(503).json(miningHealth);
    }
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      message: "Unable to check mining health"
    });
  }
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error("[ERROR]", err);
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, async () => {
    log(`serving on port ${port}`);
    initializeDatabase().catch((err) => {
      console.error("\u26A0\uFE0F  Database initialization failed (non-fatal):", err.message || err);
    });
    seedDatabase().catch((err) => {
      console.error("\u26A0\uFE0F  Database seeding failed (non-fatal):", err.message || err);
      console.log("\u2705 Server will continue running. Database will seed when connection is available.");
    });
    applyPerformanceIndexes().catch((err) => {
      console.error("\u26A0\uFE0F  Index application failed (non-fatal):", err.message || err);
    });
    seedGameContent().catch((err) => {
      console.error("\u26A0\uFE0F  Game content seeding failed (non-fatal):", err.message || err);
    });
    seedFeatureFlags().catch((err) => {
      console.error("\u26A0\uFE0F  Feature flags seeding failed (non-fatal):", err.message || err);
    });
    miningService.start().catch((err) => {
      console.error("\u26A0\uFE0F  Mining service failed to start (non-fatal):", err.message || err);
      console.log("\u2705 Server will continue running. Mining will start when database is available.");
    });
    initializeBot().catch((err) => {
      console.error("\u26A0\uFE0F  Bot initialization failed (non-fatal):", err.message || err);
      console.log("\u2705 Server will continue running. Bot commands will not be available.");
    });
    try {
      startCronJobs();
    } catch (err) {
      console.error("\u26A0\uFE0F  Cron jobs failed to start (non-fatal):", err.message || err);
      console.log("\u2705 Server will continue running. Scheduled tasks will not be available.");
    }
    console.log("\u{1F680} NEW DEPLOYMENT - " + (/* @__PURE__ */ new Date()).toISOString());
  });
})();
