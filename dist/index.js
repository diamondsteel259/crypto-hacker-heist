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
  autoUpgradeSettings: () => autoUpgradeSettings,
  blockRewards: () => blockRewards,
  blocks: () => blocks,
  componentUpgrades: () => componentUpgrades,
  cosmeticItems: () => cosmeticItems,
  dailyChallenges: () => dailyChallenges,
  dailyClaims: () => dailyClaims,
  dailyLoginRewards: () => dailyLoginRewards,
  equipmentPresets: () => equipmentPresets,
  equipmentTypes: () => equipmentTypes,
  flashSales: () => flashSales,
  gameSettings: () => gameSettings,
  insertAchievementSchema: () => insertAchievementSchema,
  insertActivePowerUpSchema: () => insertActivePowerUpSchema,
  insertAutoUpgradeSettingSchema: () => insertAutoUpgradeSettingSchema,
  insertBlockRewardSchema: () => insertBlockRewardSchema,
  insertBlockSchema: () => insertBlockSchema,
  insertComponentUpgradeSchema: () => insertComponentUpgradeSchema,
  insertCosmeticItemSchema: () => insertCosmeticItemSchema,
  insertDailyChallengeSchema: () => insertDailyChallengeSchema,
  insertDailyClaimSchema: () => insertDailyClaimSchema,
  insertDailyLoginRewardSchema: () => insertDailyLoginRewardSchema,
  insertEquipmentPresetSchema: () => insertEquipmentPresetSchema,
  insertEquipmentTypeSchema: () => insertEquipmentTypeSchema,
  insertFlashSaleSchema: () => insertFlashSaleSchema,
  insertGameSettingSchema: () => insertGameSettingSchema,
  insertJackpotWinSchema: () => insertJackpotWinSchema,
  insertLootBoxPurchaseSchema: () => insertLootBoxPurchaseSchema,
  insertOwnedEquipmentSchema: () => insertOwnedEquipmentSchema,
  insertPackPurchaseSchema: () => insertPackPurchaseSchema,
  insertPowerUpPurchaseSchema: () => insertPowerUpPurchaseSchema,
  insertPrestigeHistorySchema: () => insertPrestigeHistorySchema,
  insertPriceAlertSchema: () => insertPriceAlertSchema,
  insertReferralSchema: () => insertReferralSchema,
  insertSeasonSchema: () => insertSeasonSchema,
  insertSpinHistorySchema: () => insertSpinHistorySchema,
  insertUserAchievementSchema: () => insertUserAchievementSchema,
  insertUserCosmeticSchema: () => insertUserCosmeticSchema,
  insertUserDailyChallengeSchema: () => insertUserDailyChallengeSchema,
  insertUserHourlyBonusSchema: () => insertUserHourlyBonusSchema,
  insertUserPrestigeSchema: () => insertUserPrestigeSchema,
  insertUserSchema: () => insertUserSchema,
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
  referrals: () => referrals,
  seasons: () => seasons,
  spinHistory: () => spinHistory,
  userAchievements: () => userAchievements,
  userCosmetics: () => userCosmetics,
  userDailyChallenges: () => userDailyChallenges,
  userHourlyBonuses: () => userHourlyBonuses,
  userPrestige: () => userPrestige,
  userSpins: () => userSpins,
  userStatistics: () => userStatistics,
  userStreaks: () => userStreaks,
  userSubscriptions: () => userSubscriptions,
  userTasks: () => userTasks,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, real, timestamp, boolean, unique, decimal, index, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users, gameSettings, equipmentTypes, ownedEquipment, blocks, blockRewards, referrals, componentUpgrades, userTasks, dailyClaims, powerUpPurchases, lootBoxPurchases, activePowerUps, dailyChallenges, userDailyChallenges, achievements, userAchievements, seasons, cosmeticItems, userCosmetics, userStreaks, dailyLoginRewards, flashSales, userHourlyBonuses, userSpins, spinHistory, jackpotWins, equipmentPresets, priceAlerts, autoUpgradeSettings, packPurchases, userPrestige, prestigeHistory, userSubscriptions, userStatistics, insertUserSchema, insertEquipmentTypeSchema, insertOwnedEquipmentSchema, insertComponentUpgradeSchema, insertUserTaskSchema, insertDailyClaimSchema, insertPowerUpPurchaseSchema, insertLootBoxPurchaseSchema, insertActivePowerUpSchema, insertBlockSchema, insertBlockRewardSchema, insertReferralSchema, insertGameSettingSchema, insertDailyChallengeSchema, insertUserDailyChallengeSchema, insertAchievementSchema, insertUserAchievementSchema, insertSeasonSchema, insertCosmeticItemSchema, insertUserCosmeticSchema, insertUserStreakSchema, insertDailyLoginRewardSchema, insertFlashSaleSchema, insertUserHourlyBonusSchema, insertUserSpinSchema, insertSpinHistorySchema, insertJackpotWinSchema, insertEquipmentPresetSchema, insertPriceAlertSchema, insertAutoUpgradeSettingSchema, insertPackPurchaseSchema, insertUserPrestigeSchema, insertPrestigeHistorySchema, insertUserSubscriptionSchema, insertUserStatisticsSchema;
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
      activatedAt: timestamp("activated_at").notNull().defaultNow(),
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
  }
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
var pool, db;
var init_db = __esm({
  async "server/db.ts"() {
    "use strict";
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL must be set");
    }
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    db = drizzle(pool, { schema: schema_exports });
    await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
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
  async "server/storage.ts"() {
    "use strict";
    init_schema();
    await init_db();
    await init_db();
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

// server/index.ts
import express2 from "express";

// server/routes.ts
await init_storage();
init_schema();
init_schema();
import { createServer } from "http";
import { eq as eq5, and as and4, sql as sql5 } from "drizzle-orm";

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
  const { storage: storage2 } = await init_storage().then(() => storage_exports);
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
  const { storage: storage2 } = await init_storage().then(() => storage_exports);
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
  const address = process.env.GAME_TON_WALLET_ADDRESS;
  if (!address) {
    console.warn("\u26A0\uFE0F  GAME_TON_WALLET_ADDRESS not set in environment variables");
    return "EQD0vdSA_NedR9uvbgN9EikRX-suesDxGeFg69XQMavfLqIw";
  }
  return address;
}
function isValidTONAddress(address) {
  if (/^[Ek]Q[A-Za-z0-9_-]{46}$/.test(address)) {
    return true;
  }
  if (/^-?\d+:[a-fA-F0-9]{64}$/.test(address)) {
    return true;
  }
  return false;
}

// server/mining.ts
await init_storage();
init_schema();
import { eq as eq2, sql as sql3, and as and2 } from "drizzle-orm";
var BLOCK_INTERVAL = 5 * 60 * 1e3;
var BLOCK_REWARD = 1e5;
var MiningService = class {
  intervalId = null;
  lastBlockNumber = 0;
  isMining = false;
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
    } catch (error) {
      console.error("Error during block mining:", error);
      throw error;
    } finally {
      this.isMining = false;
    }
  }
};
var miningService = new MiningService();

// server/bot.ts
init_schema();
await init_db();
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
function getBotWebhookHandler() {
  if (!bot || !BOT_TOKEN) {
    return null;
  }
  return {
    path: `/telegram-webhook/${BOT_TOKEN}`,
    handler: bot.webhookCallback(`/telegram-webhook/${BOT_TOKEN}`)
  };
}

// server/routes/equipment.routes.ts
await init_storage();
init_schema();
init_schema();
import { eq as eq4, sql as sql4 } from "drizzle-orm";
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
        const user = await tx.select().from(users).where(eq4(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const equipmentType = await tx.select().from(equipmentTypes).where(eq4(equipmentTypes.id, parsed.data.equipmentTypeId));
        if (!equipmentType[0]) throw new Error("Equipment type not found");
        const et = equipmentType[0];
        const userEquipment = await tx.select().from(ownedEquipment).where(eq4(ownedEquipment.userId, userId)).for("update");
        const isFirstBasicLaptop = parsed.data.equipmentTypeId === "laptop-lenovo-e14";
        const ownedCount = userEquipment.filter((e) => e.equipmentTypeId === parsed.data.equipmentTypeId).length;
        const isFirstPurchase = ownedCount === 0;
        if (!isFirstBasicLaptop || !isFirstPurchase) {
          const balanceField = et.currency === "CS" ? "csBalance" : "chstBalance";
          if (user[0][balanceField] < et.basePrice) {
            throw new Error(`Insufficient \${et.currency} balance`);
          }
        }
        const owned = userEquipment.find((e) => e.equipmentTypeId === parsed.data.equipmentTypeId);
        if (owned && owned.quantity >= et.maxOwned) {
          throw new Error(`Maximum owned limit reached (\${et.maxOwned})`);
        }
        let equipment2;
        if (owned) {
          const updated = await tx.update(ownedEquipment).set({
            quantity: sql4`\${ownedEquipment.quantity} + 1`,
            currentHashrate: sql4`\${ownedEquipment.currentHashrate} + \${et.baseHashrate}`
          }).where(eq4(ownedEquipment.id, owned.id)).returning();
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
            [balanceField]: sql4`\${balanceField === 'csBalance' ? users.csBalance : users.chstBalance} - \${et.basePrice}`,
            totalHashrate: sql4`\${users.totalHashrate} + \${et.baseHashrate}`
          }).where(eq4(users.id, userId));
        } else {
          await tx.update(users).set({ totalHashrate: sql4`\${users.totalHashrate} + \${et.baseHashrate}` }).where(eq4(users.id, userId));
        }
        return equipment2;
      });
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
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
  app2.get("/healthz", async (_req, res) => {
    res.status(200).json({ ok: true });
  });
  const botWebhook = getBotWebhookHandler();
  if (botWebhook) {
    app2.post(botWebhook.path, botWebhook.handler);
    console.log(`\u{1F916} Telegram webhook registered at ${botWebhook.path}`);
  }
  registerEquipmentRoutes(app2);
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
      console.error("Referral leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch referral leaderboard" });
    }
  });
  app2.get("/api/user/:userId/rank", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      const hashrateRank = await db.select({ count: sql5`COUNT(*)` }).from(users).where(sql5`${users.totalHashrate} > ${user.totalHashrate}`);
      const balanceRank = await db.select({ count: sql5`COUNT(*)` }).from(users).where(sql5`${users.csBalance} > ${user.csBalance}`);
      const totalUsers = await db.select({ count: sql5`COUNT(*)` }).from(users);
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
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
          csBalance: sql5`${users.csBalance} + 5000`
        }).where(eq5(users.id, userId));
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
      const activeSales = await db.select().from(flashSales2).where(and4(
        eq5(flashSales2.isActive, true),
        sql5`${flashSales2.startTime} <= ${now}`,
        sql5`${flashSales2.endTime} > ${now}`
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
      await db.update(flashSales2).set({ isActive: false }).where(eq5(flashSales2.id, parseInt(saleId)));
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const equipmentType = await tx.select().from(equipmentTypes).where(eq5(equipmentTypes.id, equipmentTypeId));
        if (!equipmentType[0]) throw new Error("Equipment type not found");
        const owned = await tx.select().from(ownedEquipment).where(and4(
          eq5(ownedEquipment.userId, userId),
          eq5(ownedEquipment.equipmentTypeId, equipmentTypeId)
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
          csBalance: sql5`${users.csBalance} - ${upgradeCost}`
        }).where(eq5(users.id, userId));
        const newLevel = currentLevel + 1;
        const hashrateBefore = owned[0].currentHashrate;
        const hashrateIncrease = equipmentType[0].baseHashrate * 0.1 * owned[0].quantity;
        const newHashrate = hashrateBefore + hashrateIncrease;
        await tx.update(ownedEquipment).set({
          upgradeLevel: newLevel,
          currentHashrate: newHashrate
        }).where(eq5(ownedEquipment.id, owned[0].id));
        await tx.update(users).set({
          totalHashrate: sql5`${users.totalHashrate} + ${hashrateIncrease}`
        }).where(eq5(users.id, userId));
        const updatedUser = await tx.select().from(users).where(eq5(users.id, userId));
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
      const components = await db.select().from(componentUpgrades).innerJoin(ownedEquipment, eq5(componentUpgrades.ownedEquipmentId, ownedEquipment.id)).where(and4(
        eq5(ownedEquipment.userId, userId),
        eq5(ownedEquipment.id, equipmentId)
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
        const owned = await tx.select().from(ownedEquipment).innerJoin(equipmentTypes, eq5(ownedEquipment.equipmentTypeId, equipmentTypes.id)).where(and4(
          eq5(ownedEquipment.userId, userId),
          eq5(ownedEquipment.id, equipmentId)
        ));
        if (!owned[0]) {
          throw new Error("Equipment not found");
        }
        let component = await tx.select().from(componentUpgrades).where(and4(
          eq5(componentUpgrades.ownedEquipmentId, equipmentId),
          eq5(componentUpgrades.componentType, componentType)
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
          const user = await tx.select().from(users).where(eq5(users.id, userId));
          const balanceField = currency === "CS" ? "csBalance" : "chstBalance";
          const currentBalance = user[0][balanceField];
          if (currentBalance < upgradeCost) {
            throw new Error(`Insufficient ${currency} balance. Need ${upgradeCost} ${currency}`);
          }
          await tx.update(users).set({
            [balanceField]: sql5`${balanceField === "csBalance" ? users.csBalance : users.chstBalance} - ${upgradeCost}`
          }).where(eq5(users.id, userId));
        }
        const newLevel = currentLevel + 1;
        await tx.update(componentUpgrades).set({
          currentLevel: newLevel,
          updatedAt: sql5`NOW()`
        }).where(eq5(componentUpgrades.id, component[0].id));
        const hashrateIncrease = owned[0].equipment_types.baseHashrate * 0.05 * owned[0].owned_equipment.quantity;
        await tx.update(ownedEquipment).set({
          currentHashrate: sql5`${ownedEquipment.currentHashrate} + ${hashrateIncrease}`
        }).where(eq5(ownedEquipment.id, equipmentId));
        await tx.update(users).set({
          totalHashrate: sql5`${users.totalHashrate} + ${hashrateIncrease}`
        }).where(eq5(users.id, userId));
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
    console.log("Purchase request:", { userId, body: req.body });
    const parsed = insertOwnedEquipmentSchema.safeParse({ ...req.body, userId });
    if (!parsed.success) {
      console.log("Schema validation failed:", parsed.error);
      return res.status(400).json({ message: "Invalid equipment data", errors: parsed.error });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const equipmentType = await tx.select().from(equipmentTypes).where(eq5(equipmentTypes.id, parsed.data.equipmentTypeId));
        if (!equipmentType[0]) {
          console.log("Equipment type not found:", parsed.data.equipmentTypeId);
          throw new Error("Equipment type not found");
        }
        const et = equipmentType[0];
        console.log("Equipment type found:", et);
        const categoryEquipment = await tx.select().from(equipmentTypes).where(and4(
          eq5(equipmentTypes.category, et.category),
          eq5(equipmentTypes.tier, et.tier)
        )).orderBy(equipmentTypes.orderIndex);
        const userEquipment = await tx.select().from(ownedEquipment).where(eq5(ownedEquipment.userId, userId)).for("update");
        const currentCategoryEquipment = categoryEquipment.filter(
          (e) => e.orderIndex < et.orderIndex
        );
        const hasPrevious = currentCategoryEquipment.every(
          (prev) => userEquipment.some((owned2) => owned2.equipmentTypeId === prev.id)
        );
        console.log("Previous equipment check:", {
          currentCategoryEquipment: currentCategoryEquipment.length,
          hasPrevious,
          orderIndex: et.orderIndex
        });
        if (!hasPrevious && et.orderIndex > 1 && (et.tier === "Basic" || et.tier === "Gaming")) {
          throw new Error("Must purchase previous equipment in this category first");
        }
        const isFirstBasicLaptop = parsed.data.equipmentTypeId === "laptop-lenovo-e14";
        const ownedCount = userEquipment.filter((e) => e.equipmentTypeId === parsed.data.equipmentTypeId).length;
        const isFirstPurchase = ownedCount === 0;
        if (!isFirstBasicLaptop || !isFirstPurchase) {
          const balanceField = et.currency === "CS" ? "csBalance" : "chstBalance";
          const currentBalance = user[0][balanceField];
          console.log("Balance check:", { balanceField, currentBalance, requiredPrice: et.basePrice, currency: et.currency });
          if (currentBalance < et.basePrice) {
            throw new Error(`Insufficient ${et.currency} balance`);
          }
        } else {
          console.log("First Basic Laptop purchase - skipping balance check");
        }
        const owned = userEquipment.find((e) => e.equipmentTypeId === parsed.data.equipmentTypeId);
        if (owned && owned.quantity >= et.maxOwned) {
          throw new Error(`Maximum owned limit reached (${et.maxOwned})`);
        }
        let equipment2;
        if (owned) {
          const updated = await tx.update(ownedEquipment).set({
            quantity: sql5`${ownedEquipment.quantity} + 1`,
            currentHashrate: sql5`${ownedEquipment.currentHashrate} + ${et.baseHashrate}`
          }).where(eq5(ownedEquipment.id, owned.id)).returning();
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
            [balanceField]: sql5`${balanceField === "csBalance" ? users.csBalance : users.chstBalance} - ${et.basePrice}`,
            totalHashrate: sql5`${users.totalHashrate} + ${et.baseHashrate}`
          }).where(eq5(users.id, userId));
          console.log(`Paid purchase: Updated user hashrate by +${et.baseHashrate}, deducted ${et.basePrice} ${et.currency}`);
        } else {
          await tx.update(users).set({
            totalHashrate: sql5`${users.totalHashrate} + ${et.baseHashrate}`
          }).where(eq5(users.id, userId));
          console.log(`Free purchase: Updated user hashrate by +${et.baseHashrate}`);
        }
        const updatedUser = await tx.select().from(users).where(eq5(users.id, userId));
        console.log(`User ${userId} now has hashrate: ${updatedUser[0]?.totalHashrate}`);
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
    const blocks2 = await storage.getLatestBlocks(limit);
    res.json(blocks2);
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
        await tx.delete(ownedEquipment).where(eq5(ownedEquipment.userId, userId));
        await tx.delete(blockRewards).where(eq5(blockRewards.userId, userId));
        await tx.delete(referrals).where(eq5(referrals.referrerId, userId));
        await tx.delete(referrals).where(eq5(referrals.refereeId, userId));
        await tx.update(users).set({
          csBalance: 0,
          chstBalance: 0,
          totalHashrate: 0
        }).where(eq5(users.id, userId));
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
      await db.update(users).set(updates).where(eq5(users.id, userId));
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
        db.select().from(powerUpPurchases).where(eq5(powerUpPurchases.userId, userId)),
        db.select().from(lootBoxPurchases).where(eq5(lootBoxPurchases.userId, userId)),
        db.select().from(packPurchases).where(eq5(packPurchases.userId, userId))
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
          const equipment2 = await tx.select().from(ownedEquipment).leftJoin(equipmentTypes, eq5(ownedEquipment.equipmentTypeId, equipmentTypes.id)).where(eq5(ownedEquipment.userId, user.telegramId));
          const actualHashrate = equipment2.reduce((sum, row) => {
            return sum + (row.owned_equipment?.currentHashrate || 0);
          }, 0);
          if (user.totalHashrate !== actualHashrate) {
            await tx.update(users).set({ totalHashrate: actualHashrate }).where(eq5(users.telegramId, user.telegramId));
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
      const allJackpots = await db.select().from(jackpotWins2).orderBy(sql5`${jackpotWins2.wonAt} DESC`);
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
        const jackpot = await tx.select().from(jackpotWins2).where(eq5(jackpotWins2.id, parseInt(jackpotId))).limit(1);
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
        }).where(eq5(jackpotWins2.id, parseInt(jackpotId)));
        const updated = await tx.select().from(jackpotWins2).where(eq5(jackpotWins2.id, parseInt(jackpotId))).limit(1);
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
      const equipment2 = await db.select().from(equipmentTypes).where(eq5(equipmentTypes.id, equipmentId)).limit(1);
      if (!equipment2[0]) {
        return res.status(404).json({ error: "Equipment not found" });
      }
      const updateData = {};
      if (basePrice !== void 0) updateData.basePrice = basePrice;
      if (currency !== void 0) updateData.currency = currency;
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid update fields provided" });
      }
      await db.update(equipmentTypes).set(updateData).where(eq5(equipmentTypes.id, equipmentId));
      const updatedEquipment = await db.select().from(equipmentTypes).where(eq5(equipmentTypes.id, equipmentId)).limit(1);
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
      const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const completed = await db.select().from(userTasks).where(eq5(userTasks.userId, user[0].telegramId));
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const existing = await tx.select().from(userTasks).where(and4(
          eq5(userTasks.userId, user[0].telegramId),
          eq5(userTasks.taskId, taskId)
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
            const userEquipment = await tx.select().from(ownedEquipment).where(eq5(ownedEquipment.userId, userId));
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
            const asicEquipment = await tx.select().from(ownedEquipment).leftJoin(equipmentTypes, eq5(ownedEquipment.equipmentTypeId, equipmentTypes.id)).where(and4(
              eq5(ownedEquipment.userId, userId),
              eq5(equipmentTypes.category, "ASIC Rig")
            ));
            if (asicEquipment.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to purchase an ASIC rig first";
            }
            rewardCs = 3e3;
            rewardChst = 30;
            break;
          case "invite-1-friend":
            const referrals1 = await tx.select().from(referrals).where(eq5(referrals.referrerId, userId));
            if (referrals1.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 1 friend first";
            }
            rewardCs = 5e3;
            rewardChst = 50;
            break;
          case "invite-5-friends":
            const referrals5 = await tx.select().from(referrals).where(eq5(referrals.referrerId, userId));
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
          csBalance: sql5`${users.csBalance} + ${rewardCs}`,
          chstBalance: sql5`${users.chstBalance} + ${rewardChst}`
        }).where(eq5(users.id, userId));
        await tx.insert(userTasks).values({
          userId: user[0].telegramId,
          taskId,
          rewardCs,
          rewardChst
        });
        const updatedUser = await tx.select().from(users).where(eq5(users.id, userId));
        console.log(`User ${userId} now has hashrate: ${updatedUser[0]?.totalHashrate}`);
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
  app2.post("/api/user/:userId/tasks/:taskId/claim", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, taskId } = req.params;
    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }
    try {
      const result = await db.transaction(async (tx) => {
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const existing = await tx.select().from(userTasks).where(and4(
          eq5(userTasks.userId, user[0].telegramId),
          eq5(userTasks.taskId, taskId)
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
            const userEquipment = await tx.select().from(ownedEquipment).where(eq5(ownedEquipment.userId, userId));
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
            const asicEquipment = await tx.select().from(ownedEquipment).leftJoin(equipmentTypes, eq5(ownedEquipment.equipmentTypeId, equipmentTypes.id)).where(and4(
              eq5(ownedEquipment.userId, userId),
              eq5(equipmentTypes.category, "ASIC Rig")
            ));
            if (asicEquipment.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to purchase an ASIC rig first";
            }
            rewardCs = 3e3;
            rewardChst = 30;
            break;
          case "invite-1-friend":
            const referrals1 = await tx.select().from(referrals).where(eq5(referrals.referrerId, userId));
            if (referrals1.length === 0) {
              conditionsMet = false;
              errorMsg = "You need to invite at least 1 friend first";
            }
            rewardCs = 5e3;
            rewardChst = 50;
            break;
          case "invite-5-friends":
            const referrals5 = await tx.select().from(referrals).where(eq5(referrals.referrerId, userId));
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
          csBalance: sql5`${users.csBalance} + ${rewardCs}`,
          chstBalance: sql5`${users.chstBalance} + ${rewardChst}`
        }).where(eq5(users.id, userId));
        await tx.insert(userTasks).values({
          userId: user[0].telegramId,
          taskId,
          rewardCs,
          rewardChst
        });
        const updatedUser = await tx.select().from(users).where(eq5(users.id, userId));
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const now = Date.now();
        const offsetMs = -offset * 60 * 1e3;
        const localTime = now + offsetMs;
        const localDate = new Date(localTime);
        const currentDate = `${localDate.getUTCFullYear()}-${String(localDate.getUTCMonth() + 1).padStart(2, "0")}-${String(localDate.getUTCDate()).padStart(2, "0")}`;
        const existingClaim = await tx.select().from(dailyClaims).where(and4(
          eq5(dailyClaims.userId, user[0].telegramId),
          eq5(dailyClaims.claimType, type)
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
            }).where(eq5(dailyClaims.id, claim.id));
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
            }).where(eq5(dailyClaims.id, claim.id));
            claimCount = claim.claimCount + 1;
            remainingClaims = 5 - claimCount;
          }
        }
        const reward = type === "cs" ? 5 : 2;
        const currency = type === "cs" ? "CS" : "CHST";
        if (type === "cs") {
          await tx.update(users).set({ csBalance: sql5`${users.csBalance} + ${reward}` }).where(eq5(users.id, userId));
        } else {
          await tx.update(users).set({ chstBalance: sql5`${users.chstBalance} + ${reward}` }).where(eq5(users.id, userId));
        }
        const updatedUser = await tx.select().from(users).where(eq5(users.id, userId));
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
    if (powerUpType !== "hashrate-boost" && powerUpType !== "luck-boost") {
      return res.status(400).json({ error: "Invalid power-up type" });
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const existingPurchase = await tx.select().from(powerUpPurchases).where(eq5(powerUpPurchases.tonTransactionHash, tonTransactionHash)).limit(1);
        if (existingPurchase.length > 0) {
          return res.status(400).json({
            error: "Transaction hash already used. Cannot reuse payment."
          });
        }
        console.log(`Verifying TON transaction: ${tonTransactionHash} for ${tonAmount} TON`);
        const verification = await verifyTONTransaction(
          tonTransactionHash,
          tonAmount,
          gameWallet,
          userWalletAddress
        );
        if (!verification.verified) {
          console.error("TON verification failed:", verification.error);
          return res.status(400).json({
            error: verification.error || "Transaction verification failed"
          });
        }
        console.log("TON transaction verified successfully:", verification.transaction);
        let rewardCs = 0;
        let rewardChst = 0;
        let boostPercentage = 0;
        const duration = 60 * 60 * 1e3;
        if (powerUpType === "hashrate-boost") {
          rewardCs = 100;
          boostPercentage = 50;
        } else if (powerUpType === "luck-boost") {
          rewardCs = 50;
          boostPercentage = 20;
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
          await tx.update(users).set({ csBalance: sql5`${users.csBalance} + ${rewardCs}` }).where(eq5(users.id, userId));
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
        const updatedUser = await tx.select().from(users).where(eq5(users.id, userId));
        return {
          success: true,
          powerUpType,
          reward: { cs: rewardCs, chst: rewardChst },
          boost_active: true,
          boost_percentage: boostPercentage,
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
      const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const now = /* @__PURE__ */ new Date();
      const activePowerUpsList = await db.select().from(activePowerUps).where(and4(
        eq5(activePowerUps.userId, user[0].telegramId),
        eq5(activePowerUps.isActive, true),
        sql5`${activePowerUps.expiresAt} > ${now}`
      ));
      await db.update(activePowerUps).set({ isActive: false }).where(and4(
        eq5(activePowerUps.userId, user[0].telegramId),
        eq5(activePowerUps.isActive, true),
        sql5`${activePowerUps.expiresAt} <= ${now}`
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
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
          const existingPurchase = await tx.select().from(lootBoxPurchases).where(eq5(lootBoxPurchases.tonTransactionHash, tonTransactionHash)).limit(1);
          if (existingPurchase[0]) {
            throw new Error("This transaction has already been used");
          }
          const isValid = await verifyTONTransaction(
            tonTransactionHash,
            tonAmount,
            gameWallet,
            userWalletAddress
          );
          if (!isValid) {
            throw new Error("TON transaction verification failed");
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
          csBalance: sql5`${users.csBalance} + ${rewards.cs}`,
          ...rewards.chst && { chstBalance: sql5`${users.chstBalance} + ${rewards.chst}` }
        }).where(eq5(users.id, userId));
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
        const updatedUser = await tx.select().from(users).where(eq5(users.id, userId)).limit(1);
        return {
          success: true,
          rewards,
          newBalance: {
            cs: updatedUser[0].csBalance,
            chst: updatedUser[0].chstBalance
          }
        };
      });
      console.log(`Loot box opened: ${boxType} for user ${userId}, rewards:`, result.rewards);
      res.json(result);
    } catch (error) {
      console.error("Loot box open error:", error);
      res.status(400).json({ error: error.message || "Failed to open loot box" });
    }
  });
  app2.get("/api/challenges", async (req, res) => {
    try {
      const { dailyChallenges: dailyChallengesTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const challenges = await db.select().from(dailyChallengesTable).where(eq5(dailyChallengesTable.isActive, true));
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
      const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const allChallenges = await db.select().from(dailyChallengesTable).where(eq5(dailyChallengesTable.isActive, true));
      const completed = await db.select().from(userDailyChallenges2).where(and4(
        eq5(userDailyChallenges2.userId, user[0].telegramId),
        eq5(userDailyChallenges2.completedDate, today)
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const challenge = await tx.select().from(dailyChallengesTable).where(and4(
          eq5(dailyChallengesTable.challengeId, challengeId),
          eq5(dailyChallengesTable.isActive, true)
        )).limit(1);
        if (!challenge[0]) {
          throw new Error("Challenge not found");
        }
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const existing = await tx.select().from(userDailyChallenges2).where(and4(
          eq5(userDailyChallenges2.userId, user[0].telegramId),
          eq5(userDailyChallenges2.completedDate, today)
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
          await tx.update(users).set({ csBalance: sql5`${users.csBalance} + ${challenge[0].rewardCs}` }).where(eq5(users.id, userId));
          await tx.insert(userStatistics3).values({
            userId: user[0].telegramId,
            totalCsEarned: challenge[0].rewardCs
          }).onConflictDoUpdate({
            target: userStatistics3.userId,
            set: {
              totalCsEarned: sql5`${userStatistics3.totalCsEarned} + ${challenge[0].rewardCs}`,
              updatedAt: sql5`NOW()`
            }
          });
        }
        if (challenge[0].rewardChst && challenge[0].rewardChst > 0) {
          await tx.update(users).set({ chstBalance: sql5`${users.chstBalance} + ${challenge[0].rewardChst}` }).where(eq5(users.id, userId));
          await tx.insert(userStatistics3).values({
            userId: user[0].telegramId,
            totalChstEarned: challenge[0].rewardChst
          }).onConflictDoUpdate({
            target: userStatistics3.userId,
            set: {
              totalChstEarned: sql5`${userStatistics3.totalChstEarned} + ${challenge[0].rewardChst}`,
              updatedAt: sql5`NOW()`
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
      const allAchievements = await db.select().from(achievementsTable).where(eq5(achievementsTable.isActive, true)).orderBy(achievementsTable.orderIndex);
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
      const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const allAchievements = await db.select().from(achievementsTable).where(eq5(achievementsTable.isActive, true)).orderBy(achievementsTable.orderIndex);
      const unlocked = await db.select().from(userAchievements2).where(eq5(userAchievements2.userId, user[0].telegramId));
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
      const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const stats = await db.select().from(userStatistics3).where(eq5(userStatistics3.userId, user[0].telegramId)).limit(1);
      const equipment2 = await db.select().from(ownedEquipment).where(eq5(ownedEquipment.userId, userId));
      const uniqueEquipment = new Set(equipment2.map((e) => e.equipmentTypeId)).size;
      const refCount = await db.select({ count: sql5`COUNT(*)` }).from(referrals).where(eq5(referrals.referrerId, userId));
      const newlyUnlocked = [];
      const allAchievements = await db.select().from(achievementsTable).where(eq5(achievementsTable.isActive, true));
      const existingAchievements = await db.select().from(userAchievements2).where(eq5(userAchievements2.userId, user[0].telegramId));
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const userAchievement = await tx.select().from(userAchievements2).where(and4(
          eq5(userAchievements2.userId, user[0].telegramId),
          eq5(userAchievements2.achievementId, achievementId)
        )).limit(1);
        if (!userAchievement[0]) {
          throw new Error("Achievement not unlocked");
        }
        if (userAchievement[0].rewardClaimed) {
          throw new Error("Reward already claimed");
        }
        const achievement = await tx.select().from(achievementsTable).where(eq5(achievementsTable.achievementId, achievementId)).limit(1);
        if (!achievement[0]) {
          throw new Error("Achievement not found");
        }
        if (achievement[0].rewardCs && achievement[0].rewardCs > 0) {
          await tx.update(users).set({ csBalance: sql5`${users.csBalance} + ${achievement[0].rewardCs}` }).where(eq5(users.id, userId));
          await tx.insert(userStatistics3).values({
            userId: user[0].telegramId,
            totalCsEarned: achievement[0].rewardCs
          }).onConflictDoUpdate({
            target: userStatistics3.userId,
            set: {
              totalCsEarned: sql5`${userStatistics3.totalCsEarned} + ${achievement[0].rewardCs}`,
              updatedAt: sql5`NOW()`
            }
          });
        }
        await tx.update(userAchievements2).set({ rewardClaimed: true }).where(and4(
          eq5(userAchievements2.userId, user[0].telegramId),
          eq5(userAchievements2.achievementId, achievementId)
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
      const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const owned = await db.select().from(userCosmetics2).where(eq5(userCosmetics2.userId, user[0].telegramId));
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
      const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const currentEquipment = await db.select().from(ownedEquipment).where(eq5(ownedEquipment.userId, userId));
      if (currentEquipment.length === 0) {
        return res.status(400).json({ error: "No equipment to save" });
      }
      const snapshot = currentEquipment.map((eq7) => ({
        equipmentTypeId: eq7.equipmentTypeId,
        quantity: eq7.quantity,
        upgradeLevel: eq7.upgradeLevel
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
      const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const preset = await db.select().from(equipmentPresets2).where(and4(
        eq5(equipmentPresets2.id, parseInt(presetId)),
        eq5(equipmentPresets2.userId, user[0].telegramId)
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
      const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const preset = await db.select().from(equipmentPresets2).where(and4(
        eq5(equipmentPresets2.id, parseInt(presetId)),
        eq5(equipmentPresets2.userId, user[0].telegramId)
      )).limit(1);
      if (!preset[0]) {
        return res.status(404).json({ error: "Preset not found" });
      }
      await db.delete(equipmentPresets2).where(eq5(equipmentPresets2.id, parseInt(presetId)));
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
      const alerts = await db.select().from(priceAlerts).leftJoin(equipmentTypes, eq5(priceAlerts.equipmentTypeId, equipmentTypes.id)).where(eq5(priceAlerts.userId, user.telegramId)).orderBy(priceAlerts.createdAt);
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const existingAlert = await tx.select().from(priceAlerts).where(and4(
          eq5(priceAlerts.userId, user[0].telegramId),
          eq5(priceAlerts.equipmentTypeId, equipmentTypeId)
        )).limit(1);
        if (existingAlert.length > 0) {
          throw new Error("Alert already exists for this equipment");
        }
        const equipment2 = await tx.select().from(equipmentTypes2).where(and4(
          eq5(equipmentTypes2.id, equipmentTypeId),
          eq5(equipmentTypes2.isActive, true)
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
      const user = await db.select().from(users).where(eq5(users.id, userId)).limit(1);
      if (!user[0]) {
        return res.status(404).json({ error: "User not found" });
      }
      const alert = await db.select().from(priceAlerts).where(and4(
        eq5(priceAlerts.id, parseInt(alertId)),
        eq5(priceAlerts.userId, user[0].telegramId)
      )).limit(1);
      if (!alert[0]) {
        return res.status(404).json({ error: "Alert not found" });
      }
      await db.delete(priceAlerts).where(eq5(priceAlerts.id, parseInt(alertId)));
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
      const alerts = await db.select().from(priceAlerts).leftJoin(equipmentTypes, eq5(priceAlerts.equipmentTypeId, equipmentTypes.id)).where(and4(
        eq5(priceAlerts.userId, user.telegramId),
        eq5(priceAlerts.triggered, false)
      ));
      const triggeredAlerts = [];
      for (const row of alerts) {
        if (row.equipment_types && user.csBalance >= row.equipment_types.basePrice) {
          await db.update(priceAlerts).set({
            triggered: true,
            triggeredAt: /* @__PURE__ */ new Date()
          }).where(eq5(priceAlerts.id, row.price_alerts.id));
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
      const settings = await db.select().from(autoUpgradeSettings).leftJoin(ownedEquipment, eq5(autoUpgradeSettings.ownedEquipmentId, ownedEquipment.id)).leftJoin(equipmentTypes, eq5(ownedEquipment.equipmentTypeId, equipmentTypes.id)).leftJoin(componentUpgrades, and4(
        eq5(componentUpgrades.ownedEquipmentId, autoUpgradeSettings.ownedEquipmentId),
        eq5(componentUpgrades.componentType, autoUpgradeSettings.componentType)
      )).where(eq5(autoUpgradeSettings.userId, user.telegramId)).orderBy(autoUpgradeSettings.createdAt);
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
      const equipment2 = await db.select().from(ownedEquipment).where(and4(
        eq5(ownedEquipment.id, ownedEquipmentId),
        eq5(ownedEquipment.userId, userId)
      )).limit(1);
      if (!equipment2[0]) {
        return res.status(404).json({ error: "Equipment not found or not owned" });
      }
      const existingSetting = await db.select().from(autoUpgradeSettings).where(and4(
        eq5(autoUpgradeSettings.ownedEquipmentId, ownedEquipmentId),
        eq5(autoUpgradeSettings.componentType, componentType)
      )).limit(1);
      let setting;
      if (existingSetting.length > 0) {
        const updated = await db.update(autoUpgradeSettings).set({
          targetLevel,
          enabled: enabled !== void 0 ? enabled : true,
          updatedAt: sql5`NOW()`
        }).where(eq5(autoUpgradeSettings.id, existingSetting[0].id)).returning();
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
      const setting = await db.select().from(autoUpgradeSettings).where(and4(
        eq5(autoUpgradeSettings.id, parseInt(settingId)),
        eq5(autoUpgradeSettings.userId, user.telegramId)
      )).limit(1);
      if (!setting[0]) {
        return res.status(404).json({ error: "Setting not found" });
      }
      await db.delete(autoUpgradeSettings).where(eq5(autoUpgradeSettings.id, parseInt(settingId)));
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const settings = await tx.select().from(autoUpgradeSettings).leftJoin(componentUpgrades, and4(
          eq5(componentUpgrades.ownedEquipmentId, autoUpgradeSettings.ownedEquipmentId),
          eq5(componentUpgrades.componentType, autoUpgradeSettings.componentType)
        )).leftJoin(ownedEquipment, eq5(ownedEquipment.id, autoUpgradeSettings.ownedEquipmentId)).where(and4(
          eq5(autoUpgradeSettings.userId, user[0].telegramId),
          eq5(autoUpgradeSettings.enabled, true)
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
            }).where(eq5(componentUpgrades.id, component.id));
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
          }).where(eq5(users.id, userId));
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
      const allSeasons = await db.select().from(seasons).orderBy(sql5`${seasons.startDate} DESC`);
      res.json(allSeasons);
    } catch (error) {
      console.error("Get seasons error:", error);
      res.status(500).json({ error: error.message || "Failed to get seasons" });
    }
  });
  app2.get("/api/seasons/active", async (req, res) => {
    try {
      const now = /* @__PURE__ */ new Date();
      const activeSeason = await db.select().from(seasons).where(and4(
        eq5(seasons.isActive, true),
        sql5`${seasons.startDate} <= ${now}`,
        sql5`${seasons.endDate} >= ${now}`
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
      const existing = await db.select().from(seasons).where(eq5(seasons.seasonId, seasonId)).limit(1);
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
      const existing = await db.select().from(seasons).where(eq5(seasons.seasonId, seasonId)).limit(1);
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
      const updated = await db.update(seasons).set(updateData).where(eq5(seasons.id, existing[0].id)).returning();
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
      const existing = await db.select().from(seasons).where(eq5(seasons.seasonId, seasonId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Season not found" });
      }
      if (isActive) {
        await db.update(seasons).set({ isActive: false }).where(eq5(seasons.isActive, true));
      }
      const updated = await db.update(seasons).set({ isActive }).where(eq5(seasons.id, existing[0].id)).returning();
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
      const existing = await db.select().from(seasons).where(eq5(seasons.seasonId, seasonId)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "Season not found" });
      }
      await db.delete(seasons).where(eq5(seasons.id, existing[0].id));
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
      const purchases = await db.select().from(packPurchases).where(eq5(packPurchases.userId, user.telegramId)).orderBy(packPurchases.purchasedAt);
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const existing = await tx.select().from(packPurchases).where(and4(
          eq5(packPurchases.userId, user[0].telegramId),
          eq5(packPurchases.packType, packType)
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
          csBalance: sql5`${users.csBalance} + ${rewards.cs}`,
          chstBalance: sql5`${users.chstBalance} + ${rewards.chst}`
        }).where(eq5(users.id, userId));
        for (const equipId of rewards.equipment) {
          const equipType = await tx.select().from(equipmentTypes).where(eq5(equipmentTypes.id, equipId)).limit(1);
          if (equipType[0]) {
            const existing2 = await tx.select().from(ownedEquipment).where(and4(
              eq5(ownedEquipment.userId, userId),
              eq5(ownedEquipment.equipmentTypeId, equipId)
            )).limit(1);
            if (existing2.length > 0) {
              await tx.update(ownedEquipment).set({ quantity: existing2[0].quantity + 1 }).where(eq5(ownedEquipment.id, existing2[0].id));
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
      let prestige = await db.select().from(userPrestige).where(eq5(userPrestige.userId, user.telegramId)).limit(1);
      if (prestige.length === 0) {
        const created = await db.insert(userPrestige).values({
          userId: user.telegramId,
          prestigeLevel: 0,
          totalPrestiges: 0
        }).returning();
        prestige = created;
      }
      const history = await db.select().from(prestigeHistory).where(eq5(prestigeHistory.userId, user.telegramId)).orderBy(sql5`${prestigeHistory.prestigedAt} DESC`).limit(10);
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        if (user[0].csBalance < 1e6 || user[0].totalHashrate < 100) {
          throw new Error("Not eligible for prestige. Need 1M CS and 100 total hashrate.");
        }
        let prestige = await tx.select().from(userPrestige).where(eq5(userPrestige.userId, user[0].telegramId)).limit(1);
        if (prestige.length === 0) {
          const created = await tx.insert(userPrestige).values({
            userId: user[0].telegramId,
            prestigeLevel: 0,
            totalPrestiges: 0
          }).returning();
          prestige = created;
        }
        const currentPrestige = prestige[0];
        const equipment2 = await tx.select().from(ownedEquipment).where(eq5(ownedEquipment.userId, userId));
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
        }).where(eq5(userPrestige.id, currentPrestige.id));
        await tx.update(users).set({
          csBalance: 0,
          totalHashrate: 0
        }).where(eq5(users.id, userId));
        await tx.delete(ownedEquipment).where(eq5(ownedEquipment.userId, userId));
        await tx.delete(componentUpgrades).where(sql5`${componentUpgrades.ownedEquipmentId} IN (SELECT id FROM ${ownedEquipment} WHERE user_id = ${userId})`);
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
      const subscription = await db.select().from(userSubscriptions).where(eq5(userSubscriptions.userId, user.telegramId)).limit(1);
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
        const user = await tx.select().from(users).where(eq5(users.id, userId)).for("update");
        if (!user[0]) throw new Error("User not found");
        const existing = await tx.select().from(userSubscriptions).where(eq5(userSubscriptions.userId, user[0].telegramId)).limit(1);
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
          }).where(eq5(userSubscriptions.id, existing[0].id)).returning();
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
      await db.update(userSubscriptions).set({ isActive: false, autoRenew: false }).where(eq5(userSubscriptions.userId, user.telegramId));
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
      const streakData = await db.select().from(userStreaks).where(eq5(userStreaks.userId, user.telegramId)).limit(1);
      const currentStreak = streakData.length > 0 ? streakData[0].currentStreak : 0;
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      const todaysClaim = await db.select().from(dailyLoginRewards).where(and4(
        eq5(dailyLoginRewards.userId, user.telegramId),
        sql5`DATE(${dailyLoginRewards.claimedAt}) = DATE(${today})`
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
      const todaysClaim = await db.select().from(dailyLoginRewards).where(and4(
        eq5(dailyLoginRewards.userId, user.telegramId),
        sql5`DATE(${dailyLoginRewards.claimedAt}) = DATE(${today})`
      )).limit(1);
      if (todaysClaim.length > 0) {
        return res.status(400).json({ error: "Daily reward already claimed today" });
      }
      const streakData = await db.select().from(userStreaks).where(eq5(userStreaks.userId, user.telegramId)).limit(1);
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
          csBalance: sql5`${users.csBalance} + ${rewards.cs}`,
          chstBalance: sql5`${users.chstBalance} + ${rewards.chst}`
        }).where(eq5(users.telegramId, user.telegramId));
        if (streakData.length > 0) {
          await tx.update(userStreaks).set({
            currentStreak,
            longestStreak: sql5`GREATEST(${userStreaks.longestStreak}, ${currentStreak})`,
            lastLoginDate: loginDateStr
          }).where(eq5(userStreaks.userId, user.telegramId));
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

// server/seedDatabase.ts
await init_db();
init_schema();
import { eq as eq6 } from "drizzle-orm";
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
      // ASIC RIGS - TON-only - 10 Models - Cap: 50/model/user
      { id: "asic-bitmain-s21-pro", name: "Bitmain Antminer S21 Pro", tier: "ASIC", category: "ASIC Rig", baseHashrate: 5e4, basePrice: 5, currency: "TON", maxOwned: 50, orderIndex: 21 },
      { id: "asic-whatsminer-m60s", name: "WhatsMiner M60S", tier: "ASIC", category: "ASIC Rig", baseHashrate: 75e3, basePrice: 7.5, currency: "TON", maxOwned: 50, orderIndex: 22 },
      { id: "asic-bitmain-s21-xp", name: "Bitmain Antminer S21 XP", tier: "ASIC", category: "ASIC Rig", baseHashrate: 1e5, basePrice: 10, currency: "TON", maxOwned: 50, orderIndex: 23 },
      { id: "asic-microbt-m50", name: "MicroBT WhatsMiner M50", tier: "ASIC", category: "ASIC Rig", baseHashrate: 125e3, basePrice: 12.5, currency: "TON", maxOwned: 50, orderIndex: 24 },
      { id: "asic-bitmain-s23", name: "Bitmain Antminer S23", tier: "ASIC", category: "ASIC Rig", baseHashrate: 15e4, basePrice: 15, currency: "TON", maxOwned: 50, orderIndex: 25 },
      { id: "asic-axionminer-800", name: "AxionMiner 800", tier: "ASIC", category: "ASIC Rig", baseHashrate: 175e3, basePrice: 17.5, currency: "TON", maxOwned: 50, orderIndex: 26 },
      { id: "asic-bitmain-s21-xp-hyd", name: "Bitmain Antminer S21 XP+ Hyd", tier: "ASIC", category: "ASIC Rig", baseHashrate: 2e5, basePrice: 20, currency: "TON", maxOwned: 50, orderIndex: 27 },
      { id: "asic-canaan-avalon-q", name: "Canaan Avalon Q", tier: "ASIC", category: "ASIC Rig", baseHashrate: 25e4, basePrice: 25, currency: "TON", maxOwned: 50, orderIndex: 28 },
      { id: "asic-bitmain-s21e-xp-hydro", name: "Bitmain Antminer S21e XP Hydro", tier: "ASIC", category: "ASIC Rig", baseHashrate: 3e5, basePrice: 30, currency: "TON", maxOwned: 50, orderIndex: 29 },
      { id: "asic-whatsminer-m63s-hydro", name: "WhatsMiner M63S Hydro", tier: "ASIC", category: "ASIC Rig", baseHashrate: 5e5, basePrice: 50, currency: "TON", maxOwned: 50, orderIndex: 30 }
    ];
    const existingEquipment = await db.select().from(equipmentTypes);
    if (existingEquipment.length === 0) {
      console.log(`\u{1F4E6} Inserting ${equipmentCatalog.length} equipment items...`);
      await db.insert(equipmentTypes).values(equipmentCatalog);
      console.log(`\u2705 Equipment types seeded: ${equipmentCatalog.length}`);
    } else {
      console.log(`\u2705 Equipment types already exist (${existingEquipment.length} items) - skipping seed`);
    }
    const finalCount = await db.select().from(equipmentTypes);
    console.log(`\u{1F50D} Verification: ${finalCount.length} equipment items in database`);
    const defaultSettings = [
      { key: "mining_paused", value: "false" },
      { key: "equipment_price_multiplier", value: "1.0" },
      { key: "block_reward", value: "100000" },
      { key: "block_interval_seconds", value: "300" }
    ];
    for (const setting of defaultSettings) {
      const existing = await db.select().from(gameSettings).where(eq6(gameSettings.key, setting.key));
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
await init_db();
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

// server/applyIndexes.ts
await init_db();
import { sql as sql6 } from "drizzle-orm";
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
      await db.execute(sql6.raw(statement));
    }
    console.log(`\u2705 Applied ${statements.length} performance indexes`);
  } catch (error) {
    console.error("\u26A0\uFE0F  Failed to apply indexes (non-fatal):", error);
  }
}

// server/index.ts
import rateLimit from "express-rate-limit";
var app = express2();
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
    return req.path === "/healthz" || !req.path.startsWith("/api/");
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
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
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
    miningService.start().catch((err) => {
      console.error("\u26A0\uFE0F  Mining service failed to start (non-fatal):", err.message || err);
      console.log("\u2705 Server will continue running. Mining will start when database is available.");
    });
    initializeBot().catch((err) => {
      console.error("\u26A0\uFE0F  Bot initialization failed (non-fatal):", err.message || err);
      console.log("\u2705 Server will continue running. Bot commands will not be available.");
    });
    console.log("\u{1F680} NEW DEPLOYMENT - " + (/* @__PURE__ */ new Date()).toISOString());
  });
})();
