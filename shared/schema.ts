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
});

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
});

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
