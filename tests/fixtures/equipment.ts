import { type InsertOwnedEquipment } from '@shared/schema';

/**
 * Test equipment fixtures
 */

export const basicMiner = {
  name: 'Basic Mining Rig',
  category: 'mining_rigs',
  tier: 'basic',
  baseHashrate: 50,
  priceCS: 5000,
  priceCHST: 0,
  priceTON: 0,
  description: 'A simple mining rig for beginners',
  icon: '⛏️',
  imageUrl: '',
  orderIndex: 1,
};

export const advancedRig = {
  name: 'Advanced Mining Rig',
  category: 'mining_rigs',
  tier: 'advanced',
  baseHashrate: 150,
  priceCS: 25000,
  priceCHST: 0,
  priceTON: 0,
  description: 'A powerful mining rig for serious miners',
  icon: '⚙️',
  imageUrl: '',
  orderIndex: 2,
};

export const premiumRig = {
  name: 'Premium Mining Rig',
  category: 'mining_rigs',
  tier: 'premium',
  baseHashrate: 300,
  priceCS: 0,
  priceCHST: 100,
  priceTON: 0,
  description: 'Elite mining rig with maximum hashrate',
  icon: '💎',
  imageUrl: '',
  orderIndex: 3,
};

export const gpuBooster = {
  name: 'GPU Booster',
  category: 'components',
  tier: 'basic',
  baseHashrate: 25,
  priceCS: 2000,
  priceCHST: 0,
  priceTON: 0,
  description: 'Boost your mining with GPU power',
  icon: '🎮',
  imageUrl: '',
  orderIndex: 10,
};

export const coolingSystem = {
  name: 'Cooling System',
  category: 'components',
  tier: 'basic',
  baseHashrate: 15,
  priceCS: 1500,
  priceCHST: 0,
  priceTON: 0,
  description: 'Keep your rig running cool and efficient',
  icon: '❄️',
  imageUrl: '',
  orderIndex: 11,
};

export const powerSupply = {
  name: 'High-Power PSU',
  category: 'components',
  tier: 'advanced',
  baseHashrate: 30,
  priceCS: 3500,
  priceCHST: 0,
  priceTON: 0,
  description: 'Stable power for consistent mining',
  icon: '🔋',
  imageUrl: '',
  orderIndex: 12,
};

/**
 * All equipment types for comprehensive testing
 */
export const allEquipmentTypes = [
  basicMiner,
  advancedRig,
  premiumRig,
  gpuBooster,
  coolingSystem,
  powerSupply,
];

/**
 * Factory function to create owned equipment
 */
export function createOwnedEquipment(
  userId: string,
  equipmentTypeId: string,
  overrides?: Partial<InsertOwnedEquipment>
): InsertOwnedEquipment {
  return {
    userId,
    equipmentTypeId,
    quantity: 1,
    baseHashrate: 50,
    currentHashrate: 50,
    purchasedAt: new Date(),
    upgradeLevel: 0,
    ramLevel: 0,
    cpuLevel: 0,
    storageLevel: 0,
    gpuLevel: 0,
    ...overrides,
  };
}

/**
 * Create equipment with upgrades
 */
export function createUpgradedEquipment(
  userId: string,
  equipmentTypeId: string,
  upgradeLevel: number = 1
): InsertOwnedEquipment {
  const baseHashrate = 50;
  const hashratBonus = upgradeLevel * 0.05; // 5% per level
  const currentHashrate = Math.floor(baseHashrate * (1 + hashratBonus));

  return {
    userId,
    equipmentTypeId,
    quantity: 1,
    baseHashrate,
    currentHashrate,
    purchasedAt: new Date(),
    upgradeLevel,
    ramLevel: upgradeLevel,
    cpuLevel: upgradeLevel,
    storageLevel: upgradeLevel,
    gpuLevel: upgradeLevel,
  };
}

/**
 * Test equipment scenarios
 */
export const equipmentScenarios = {
  // Fresh equipment, just purchased
  newEquipment: (userId: string, equipmentTypeId: string) =>
    createOwnedEquipment(userId, equipmentTypeId, {
      upgradeLevel: 0,
      ramLevel: 0,
      cpuLevel: 0,
      storageLevel: 0,
      gpuLevel: 0,
    }),

  // Equipment with some upgrades
  partiallyUpgraded: (userId: string, equipmentTypeId: string) =>
    createUpgradedEquipment(userId, equipmentTypeId, 3),

  // Fully maxed out equipment
  fullyUpgraded: (userId: string, equipmentTypeId: string) =>
    createUpgradedEquipment(userId, equipmentTypeId, 10),

  // Multiple copies of same equipment
  multipleUnits: (userId: string, equipmentTypeId: string, quantity: number) =>
    createOwnedEquipment(userId, equipmentTypeId, {
      quantity,
      currentHashrate: 50 * quantity,
    }),
};
