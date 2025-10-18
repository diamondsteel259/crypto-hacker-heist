import { sql } from "drizzle-orm";
import { pgTable, varchar, text, integer, real, timestamp, boolean, unique } from "drizzle-orm/pg-core";
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
});

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
