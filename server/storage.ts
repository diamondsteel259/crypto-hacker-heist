import { 
  type User, 
  type InsertUser,
  type EquipmentType,
  type OwnedEquipment,
  type InsertOwnedEquipment,
  type Block,
  type InsertBlock,
  type BlockReward,
  type InsertBlockReward,
  type Referral,
  type GameSetting,
  type InsertGameSetting,
  users,
  equipmentTypes,
  ownedEquipment,
  blocks,
  blockRewards,
  referrals,
  gameSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: string, csBalance: number, chstBalance: number): Promise<void>;
  updateUserHashrate(userId: string, totalHashrate: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  getAllEquipmentTypes(): Promise<EquipmentType[]>;
  getEquipmentTypesByCategoryAndTier(category: string, tier: string): Promise<EquipmentType[]>;
  getEquipmentType(id: string): Promise<EquipmentType | undefined>;
  
  getUserEquipment(userId: string): Promise<(OwnedEquipment & { equipmentType: EquipmentType })[]>;
  getSpecificEquipment(userId: string, equipmentTypeId: string): Promise<OwnedEquipment | undefined>;
  purchaseEquipment(equipment: InsertOwnedEquipment): Promise<OwnedEquipment>;
  upgradeEquipment(equipmentId: string, newLevel: number, newHashrate: number): Promise<void>;
  
  getLatestBlocks(limit: number): Promise<Block[]>;
  getLatestBlock(): Promise<Block | undefined>;
  createBlock(block: InsertBlock): Promise<Block>;
  getBlockById(id: string): Promise<Block | undefined>;
  
  getUserBlockRewards(userId: string, limit?: number): Promise<(BlockReward & { block: Block })[]>;
  createBlockReward(reward: InsertBlockReward): Promise<BlockReward>;
  
  getUserReferrals(userId: string): Promise<(Referral & { referee: User })[]>;
  createReferral(referrerId: string, refereeId: string): Promise<Referral>;
  updateReferralBonus(referralId: string, bonus: number): Promise<void>;
  
  getGameSetting(key: string): Promise<GameSetting | undefined>;
  setGameSetting(key: string, value: string): Promise<GameSetting>;
  getAllGameSettings(): Promise<GameSetting[]>;
  
  updateUserProfile(userId: string, data: Partial<Pick<User, 'username' | 'firstName' | 'lastName' | 'photoUrl'>>): Promise<void>;
  setUserAdmin(userId: string, isAdmin: boolean): Promise<void>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const referralCode = randomUUID().slice(0, 8);
    const result = await db.insert(users).values({
      ...insertUser,
      referralCode,
    }).returning();
    return result[0];
  }

  async updateUserBalance(userId: string, csBalance: number, chstBalance: number): Promise<void> {
    await db.update(users)
      .set({ csBalance, chstBalance })
      .where(eq(users.id, userId));
  }

  async updateUserHashrate(userId: string, totalHashrate: number): Promise<void> {
    await db.update(users)
      .set({ totalHashrate })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllEquipmentTypes(): Promise<EquipmentType[]> {
    return await db.select().from(equipmentTypes).orderBy(equipmentTypes.category, equipmentTypes.orderIndex);
  }

  async getEquipmentTypesByCategoryAndTier(category: string, tier: string): Promise<EquipmentType[]> {
    return await db.select()
      .from(equipmentTypes)
      .where(and(
        eq(equipmentTypes.category, category),
        eq(equipmentTypes.tier, tier)
      ))
      .orderBy(equipmentTypes.orderIndex);
  }

  async getEquipmentType(id: string): Promise<EquipmentType | undefined> {
    const result = await db.select().from(equipmentTypes).where(eq(equipmentTypes.id, id));
    return result[0];
  }

  async getUserEquipment(userId: string): Promise<(OwnedEquipment & { equipmentType: EquipmentType })[]> {
    const result = await db.select()
      .from(ownedEquipment)
      .leftJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id))
      .where(eq(ownedEquipment.userId, userId));
    
    return result.map((row: any) => ({
      ...row.owned_equipment,
      equipmentType: row.equipment_types!
    }));
  }

  async getSpecificEquipment(userId: string, equipmentTypeId: string): Promise<OwnedEquipment | undefined> {
    const result = await db.select()
      .from(ownedEquipment)
      .where(and(
        eq(ownedEquipment.userId, userId),
        eq(ownedEquipment.equipmentTypeId, equipmentTypeId)
      ));
    return result[0];
  }

  async purchaseEquipment(equipment: InsertOwnedEquipment): Promise<OwnedEquipment> {
    const existing = await this.getSpecificEquipment(equipment.userId, equipment.equipmentTypeId);
    
    if (existing) {
      const result = await db.update(ownedEquipment)
        .set({ 
          quantity: existing.quantity + 1,
          currentHashrate: existing.currentHashrate + equipment.currentHashrate
        })
        .where(eq(ownedEquipment.id, existing.id))
        .returning();
      return result[0];
    }
    
    const result = await db.insert(ownedEquipment).values(equipment).returning();
    return result[0];
  }

  async upgradeEquipment(equipmentId: string, newLevel: number, newHashrate: number): Promise<void> {
    await db.update(ownedEquipment)
      .set({ 
        upgradeLevel: newLevel,
        currentHashrate: newHashrate
      })
      .where(eq(ownedEquipment.id, equipmentId));
  }

  async getLatestBlocks(limit: number): Promise<Block[]> {
    return await db.select()
      .from(blocks)
      .orderBy(desc(blocks.blockNumber))
      .limit(limit);
  }

  async getLatestBlock(): Promise<Block | undefined> {
    const result = await db.select()
      .from(blocks)
      .orderBy(desc(blocks.blockNumber))
      .limit(1);
    return result[0];
  }

  async createBlock(block: InsertBlock): Promise<Block> {
    const result = await db.insert(blocks).values(block).returning();
    return result[0];
  }

  async getBlockById(id: string): Promise<Block | undefined> {
    const result = await db.select().from(blocks).where(eq(blocks.id, id));
    return result[0];
  }

  async getUserBlockRewards(userId: string, limit?: number): Promise<(BlockReward & { block: Block })[]> {
    const query = db.select()
      .from(blockRewards)
      .leftJoin(blocks, eq(blockRewards.blockId, blocks.id))
      .where(eq(blockRewards.userId, userId))
      .orderBy(desc(blockRewards.createdAt));
    
    const result = limit ? await query.limit(limit) : await query;
    
    return result.map((row: any) => ({
      ...row.block_rewards,
      block: row.blocks!
    }));
  }

  async createBlockReward(reward: InsertBlockReward): Promise<BlockReward> {
    const result = await db.insert(blockRewards).values(reward).returning();
    return result[0];
  }

  async getUserReferrals(userId: string): Promise<(Referral & { referee: User })[]> {
    const result = await db.select()
      .from(referrals)
      .leftJoin(users, eq(referrals.refereeId, users.id))
      .where(eq(referrals.referrerId, userId));
    
    return result.map((row: any) => ({
      ...row.referrals,
      referee: row.users!
    }));
  }

  async createReferral(referrerId: string, refereeId: string): Promise<Referral> {
    const result = await db.insert(referrals).values({
      referrerId,
      refereeId,
    }).returning();
    return result[0];
  }

  async updateReferralBonus(referralId: string, bonus: number): Promise<void> {
    await db.update(referrals)
      .set({ bonusEarned: bonus })
      .where(eq(referrals.id, referralId));
  }

  async getGameSetting(key: string): Promise<GameSetting | undefined> {
    const result = await db.select().from(gameSettings).where(eq(gameSettings.key, key));
    return result[0];
  }

  async setGameSetting(key: string, value: string): Promise<GameSetting> {
    const existing = await this.getGameSetting(key);
    
    if (existing) {
      const result = await db.update(gameSettings)
        .set({ value, updatedAt: new Date() })
        .where(eq(gameSettings.key, key))
        .returning();
      return result[0];
    }
    
    const result = await db.insert(gameSettings)
      .values({ key, value })
      .returning();
    return result[0];
  }

  async getAllGameSettings(): Promise<GameSetting[]> {
    return await db.select().from(gameSettings);
  }

  async updateUserProfile(userId: string, data: Partial<Pick<User, 'username' | 'firstName' | 'lastName' | 'photoUrl'>>): Promise<void> {
    await db.update(users)
      .set(data)
      .where(eq(users.id, userId));
  }

  async setUserAdmin(userId: string, isAdmin: boolean): Promise<void> {
    await db.update(users)
      .set({ isAdmin })
      .where(eq(users.id, userId));
  }
}

export const storage = new DbStorage();

export { db } from "./db";
