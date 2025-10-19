import { db } from './db';
import { equipmentTypes, gameSettings } from '@shared/schema';

const EQUIPMENT_DATA = [
  // Basic Tier
  { id: 'laptop', name: 'Laptop', tier: 'basic', category: 'mining', baseHashrate: 10, basePrice: 100, currency: 'CS', maxOwned: 10, orderIndex: 1 },
  { id: 'desktop', name: 'Desktop PC', tier: 'basic', category: 'mining', baseHashrate: 25, basePrice: 500, currency: 'CS', maxOwned: 10, orderIndex: 2 },
  
  // Advanced Tier
  { id: 'gpu-rig', name: 'GPU Rig', tier: 'advanced', category: 'mining', baseHashrate: 100, basePrice: 2000, currency: 'CS', maxOwned: 5, orderIndex: 3 },
  { id: 'server-rack', name: 'Server Rack', tier: 'advanced', category: 'mining', baseHashrate: 250, basePrice: 5000, currency: 'CS', maxOwned: 5, orderIndex: 4 },
  
  // Pro Tier
  { id: 'asic-miner', name: 'ASIC Miner', tier: 'pro', category: 'mining', baseHashrate: 500, basePrice: 10000, currency: 'CS', maxOwned: 3, orderIndex: 5 },
  { id: 'data-center', name: 'Data Center', tier: 'pro', category: 'mining', baseHashrate: 1000, basePrice: 50000, currency: 'CS', maxOwned: 2, orderIndex: 6 },
];

const GAME_SETTINGS_DATA = [
  { key: 'isMiningPaused', value: 'false' },
  { key: 'equipmentPriceMultiplier', value: '1.0' },
];

export async function seedDatabaseIfNeeded() {
  try {
    // Check if equipment already exists
    const existingEquipment = await db.select().from(equipmentTypes).limit(1);
    
    if (existingEquipment.length > 0) {
      console.log('✅ Database already seeded, skipping...');
      return;
    }
    
    console.log('🌱 Seeding database with initial data...');
    
    // Insert equipment types
    for (const equipment of EQUIPMENT_DATA) {
      await db.insert(equipmentTypes)
        .values(equipment)
        .onConflictDoNothing();
    }
    console.log(`✅ Added ${EQUIPMENT_DATA.length} equipment types`);
    
    // Insert game settings
    for (const setting of GAME_SETTINGS_DATA) {
      await db.insert(gameSettings)
        .values(setting)
        .onConflictDoNothing();
    }
    console.log(`✅ Added ${GAME_SETTINGS_DATA.length} game settings`);
    
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    // Don't crash the app if seeding fails
  }
}
