import { db } from "./db";
import { equipmentTypes, gameSettings, ownedEquipment, componentUpgrades } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Seed equipment types - Phase 1 (CS/TON) and Phase 2 (CHST) pricing
    const equipmentCatalog = [
      // BASIC LAPTOPS - CS/TON (Phase 1), CHST (Phase 2) - Cap: 10/model/user
      { id: 'laptop-lenovo-e14', name: 'Lenovo ThinkPad E14', tier: 'Basic', category: 'Basic Laptop', baseHashrate: 50, basePrice: 1000, currency: 'CS', maxOwned: 10, orderIndex: 1 },
      { id: 'laptop-dell-inspiron', name: 'Dell Inspiron 15', tier: 'Basic', category: 'Basic Laptop', baseHashrate: 75, basePrice: 1500, currency: 'CS', maxOwned: 10, orderIndex: 2 },
      { id: 'laptop-hp-pavilion', name: 'HP Pavilion 15', tier: 'Basic', category: 'Basic Laptop', baseHashrate: 100, basePrice: 2000, currency: 'CS', maxOwned: 10, orderIndex: 3 },
      { id: 'laptop-asus-vivobook', name: 'ASUS VivoBook 15', tier: 'Basic', category: 'Basic Laptop', baseHashrate: 125, basePrice: 2500, currency: 'CS', maxOwned: 10, orderIndex: 4 },
      { id: 'laptop-acer-aspire', name: 'Acer Aspire 5', tier: 'Basic', category: 'Basic Laptop', baseHashrate: 150, basePrice: 3000, currency: 'CS', maxOwned: 10, orderIndex: 5 },
      
      // GAMING LAPTOPS - CS/TON (Phase 1), CHST (Phase 2) - Cap: 10/model/user
      { id: 'gaming-acer-predator', name: 'Acer Predator Helios', tier: 'Gaming', category: 'Gaming Laptop', baseHashrate: 300, basePrice: 5000, currency: 'CS', maxOwned: 10, orderIndex: 6 },
      { id: 'gaming-msi-stealth', name: 'MSI Stealth 15M', tier: 'Gaming', category: 'Gaming Laptop', baseHashrate: 400, basePrice: 7500, currency: 'CS', maxOwned: 10, orderIndex: 7 },
      { id: 'gaming-asus-rog', name: 'ASUS ROG Zephyrus', tier: 'Gaming', category: 'Gaming Laptop', baseHashrate: 500, basePrice: 10000, currency: 'CS', maxOwned: 10, orderIndex: 8 },
      { id: 'gaming-alienware-m15', name: 'Alienware m15 R7', tier: 'Gaming', category: 'Gaming Laptop', baseHashrate: 600, basePrice: 15000, currency: 'CS', maxOwned: 10, orderIndex: 9 },
      { id: 'gaming-razor-blade', name: 'Razer Blade 15', tier: 'Gaming', category: 'Gaming Laptop', baseHashrate: 700, basePrice: 20000, currency: 'CS', maxOwned: 10, orderIndex: 10 },
      
      // GAMING PCS - First buy CS-only, upgrades CS/CHST then TON - Cap: 25/model/user
      { id: 'pc-vixia-high-end', name: 'VIXIA High-End i9/RTX4090', tier: 'Gaming', category: 'Gaming PC', baseHashrate: 700, basePrice: 25000, currency: 'CS', maxOwned: 25, orderIndex: 11 },
      { id: 'pc-custom-i7-rtx4080', name: 'Custom i7/RTX4080', tier: 'Gaming', category: 'Gaming PC', baseHashrate: 1000, basePrice: 35000, currency: 'CS', maxOwned: 25, orderIndex: 12 },
      { id: 'pc-custom-i9-rtx4090', name: 'Custom i9/RTX4090', tier: 'Gaming', category: 'Gaming PC', baseHashrate: 1500, basePrice: 50000, currency: 'CS', maxOwned: 25, orderIndex: 13 },
      { id: 'pc-custom-dual-gpu', name: 'Dual GPU Workstation', tier: 'Gaming', category: 'Gaming PC', baseHashrate: 2000, basePrice: 75000, currency: 'CS', maxOwned: 25, orderIndex: 14 },
      { id: 'pc-custom-quad-gpu', name: 'Quad GPU Mining Rig', tier: 'Gaming', category: 'Gaming PC', baseHashrate: 3000, basePrice: 100000, currency: 'CS', maxOwned: 25, orderIndex: 15 },
      
      // SERVER FARMS - TON-only - Cap: 25/model/user
      { id: 'server-supermicro-4029', name: 'Supermicro SYS-4029GP-TRT', tier: 'Server', category: 'Server Farm', baseHashrate: 5000, basePrice: 0.5, currency: 'TON', maxOwned: 25, orderIndex: 16 },
      { id: 'server-dell-poweredge-r750', name: 'Dell PowerEdge R750', tier: 'Server', category: 'Server Farm', baseHashrate: 7500, basePrice: 1.0, currency: 'TON', maxOwned: 25, orderIndex: 17 },
      { id: 'server-hp-proliant-dl380', name: 'HP ProLiant DL380', tier: 'Server', category: 'Server Farm', baseHashrate: 10000, basePrice: 1.5, currency: 'TON', maxOwned: 25, orderIndex: 18 },
      { id: 'server-custom-rack-1u', name: 'Custom 1U Rack Server', tier: 'Server', category: 'Server Farm', baseHashrate: 15000, basePrice: 2.0, currency: 'TON', maxOwned: 25, orderIndex: 19 },
      { id: 'server-custom-rack-2u', name: 'Custom 2U Rack Server', tier: 'Server', category: 'Server Farm', baseHashrate: 20000, basePrice: 3.0, currency: 'TON', maxOwned: 25, orderIndex: 20 },
      
      // ASIC RIGS - TON-only - Cap: 50/model/user
      { id: 'asic-bitmain-s21-pro', name: 'Bitmain Antminer S21 Pro', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 50000, basePrice: 5.0, currency: 'TON', maxOwned: 50, orderIndex: 21 },
      { id: 'asic-whatsminer-m60s', name: 'WhatsMiner M60S', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 75000, basePrice: 7.5, currency: 'TON', maxOwned: 50, orderIndex: 22 },
      { id: 'asic-bitmain-s21-xp', name: 'Bitmain Antminer S21 XP', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 100000, basePrice: 10.0, currency: 'TON', maxOwned: 50, orderIndex: 23 },
      { id: 'asic-microbt-m50', name: 'MicroBT WhatsMiner M50', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 125000, basePrice: 12.5, currency: 'TON', maxOwned: 50, orderIndex: 24 },
      { id: 'asic-bitmain-s23', name: 'Bitmain Antminer S23', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 150000, basePrice: 15.0, currency: 'TON', maxOwned: 50, orderIndex: 25 },
      { id: 'asic-axionminer-800', name: 'AxionMiner 800', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 175000, basePrice: 17.5, currency: 'TON', maxOwned: 50, orderIndex: 26 },
      { id: 'asic-bitmain-s21-xp-hyd', name: 'Bitmain Antminer S21 XP+ Hyd', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 200000, basePrice: 20.0, currency: 'TON', maxOwned: 50, orderIndex: 27 },
      { id: 'asic-canaan-avalon-q', name: 'Canaan Avalon Q', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 250000, basePrice: 25.0, currency: 'TON', maxOwned: 50, orderIndex: 28 },
      { id: 'asic-bitmain-s21e-xp-hydro', name: 'Bitmain Antminer S21e XP Hydro', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 300000, basePrice: 30.0, currency: 'TON', maxOwned: 50, orderIndex: 29 },
      { id: 'asic-whatsminer-m63s-hydro', name: 'WhatsMiner M63S Hydro', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 500000, basePrice: 50.0, currency: 'TON', maxOwned: 50, orderIndex: 30 },
      
      // NEW: MORE ASIC RIGS - Premium Models - TON-only - Cap: 50/model/user
      { id: 'asic-bitmain-s25-pro', name: 'Bitmain Antminer S25 Pro', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 600000, basePrice: 60.0, currency: 'TON', maxOwned: 50, orderIndex: 31 },
      { id: 'asic-whatsminer-m70s', name: 'WhatsMiner M70S', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 700000, basePrice: 70.0, currency: 'TON', maxOwned: 50, orderIndex: 32 },
      { id: 'asic-microbt-m63', name: 'MicroBT WhatsMiner M63', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 750000, basePrice: 75.0, currency: 'TON', maxOwned: 50, orderIndex: 33 },
      { id: 'asic-canaan-avalon-ultra', name: 'Canaan Avalon Ultra', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 800000, basePrice: 80.0, currency: 'TON', maxOwned: 50, orderIndex: 34 },
      { id: 'asic-bitmain-s26-hydro', name: 'Bitmain Antminer S26 Hydro', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 900000, basePrice: 90.0, currency: 'TON', maxOwned: 50, orderIndex: 35 },
      { id: 'asic-whatsminer-m80s-elite', name: 'WhatsMiner M80S Elite', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 1000000, basePrice: 100.0, currency: 'TON', maxOwned: 50, orderIndex: 36 },
      { id: 'asic-microbt-m70-turbo', name: 'MicroBT M70 Turbo', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 1100000, basePrice: 110.0, currency: 'TON', maxOwned: 50, orderIndex: 37 },
      { id: 'asic-bitmain-s27-pro-hydro', name: 'Bitmain Antminer S27 Pro Hydro', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 1250000, basePrice: 125.0, currency: 'TON', maxOwned: 50, orderIndex: 38 },
      { id: 'asic-whatsminer-m90s-max', name: 'WhatsMiner M90S Max', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 1500000, basePrice: 150.0, currency: 'TON', maxOwned: 50, orderIndex: 39 },
      { id: 'asic-axionminer-2000-ultra', name: 'AxionMiner 2000 Ultra', tier: 'ASIC', category: 'ASIC Rig', baseHashrate: 2000000, basePrice: 200.0, currency: 'TON', maxOwned: 50, orderIndex: 40 },
      
      // NEW: FPGA MINERS - Mid-tier between GPU and ASIC - TON-only - Cap: 30/model/user
      { id: 'fpga-xilinx-vcu1525', name: 'Xilinx VCU1525 FPGA', tier: 'FPGA', category: 'FPGA Miner', baseHashrate: 25000, basePrice: 2.5, currency: 'TON', maxOwned: 30, orderIndex: 41 },
      { id: 'fpga-bittware-cvp13', name: 'BittWare CVP-13 FPGA', tier: 'FPGA', category: 'FPGA Miner', baseHashrate: 35000, basePrice: 3.5, currency: 'TON', maxOwned: 30, orderIndex: 42 },
      { id: 'fpga-intel-stratix-10', name: 'Intel Stratix 10 FPGA', tier: 'FPGA', category: 'FPGA Miner', baseHashrate: 45000, basePrice: 4.5, currency: 'TON', maxOwned: 30, orderIndex: 43 },
      { id: 'fpga-xilinx-u250', name: 'Xilinx Alveo U250', tier: 'FPGA', category: 'FPGA Miner', baseHashrate: 60000, basePrice: 6.0, currency: 'TON', maxOwned: 30, orderIndex: 44 },
      { id: 'fpga-bittware-xupvv4', name: 'BittWare XUPVV4 FPGA Cluster', tier: 'FPGA', category: 'FPGA Miner', baseHashrate: 80000, basePrice: 8.0, currency: 'TON', maxOwned: 30, orderIndex: 45 },
      
      // NEW: CLOUD MINING CONTRACTS - Subscription-based - TON-only - Cap: 100/model/user
      { id: 'cloud-starter-1month', name: 'Cloud Mining Starter (30 days)', tier: 'Cloud', category: 'Cloud Mining', baseHashrate: 100000, basePrice: 3.0, currency: 'TON', maxOwned: 100, orderIndex: 46 },
      { id: 'cloud-pro-1month', name: 'Cloud Mining Pro (30 days)', tier: 'Cloud', category: 'Cloud Mining', baseHashrate: 250000, basePrice: 7.0, currency: 'TON', maxOwned: 100, orderIndex: 47 },
      { id: 'cloud-elite-1month', name: 'Cloud Mining Elite (30 days)', tier: 'Cloud', category: 'Cloud Mining', baseHashrate: 500000, basePrice: 15.0, currency: 'TON', maxOwned: 100, orderIndex: 48 },
      { id: 'cloud-enterprise-1month', name: 'Cloud Mining Enterprise (30 days)', tier: 'Cloud', category: 'Cloud Mining', baseHashrate: 1000000, basePrice: 30.0, currency: 'TON', maxOwned: 100, orderIndex: 49 },
      { id: 'cloud-mega-1month', name: 'Cloud Mining Mega (30 days)', tier: 'Cloud', category: 'Cloud Mining', baseHashrate: 2500000, basePrice: 75.0, currency: 'TON', maxOwned: 100, orderIndex: 50 },
      
      // NEW: QUANTUM MINERS - Elite/Legendary tier - TON-only - Cap: 10/model/user (limited!)
      { id: 'quantum-ibm-q1', name: 'IBM Quantum System Q1', tier: 'Quantum', category: 'Quantum Miner', baseHashrate: 5000000, basePrice: 250.0, currency: 'TON', maxOwned: 10, orderIndex: 51 },
      { id: 'quantum-google-sycamore', name: 'Google Sycamore Quantum', tier: 'Quantum', category: 'Quantum Miner', baseHashrate: 7500000, basePrice: 375.0, currency: 'TON', maxOwned: 10, orderIndex: 52 },
      { id: 'quantum-rigetti-aspen', name: 'Rigetti Aspen Quantum', tier: 'Quantum', category: 'Quantum Miner', baseHashrate: 10000000, basePrice: 500.0, currency: 'TON', maxOwned: 10, orderIndex: 53 },
      { id: 'quantum-ionq-forte', name: 'IonQ Forte Quantum', tier: 'Quantum', category: 'Quantum Miner', baseHashrate: 15000000, basePrice: 750.0, currency: 'TON', maxOwned: 10, orderIndex: 54 },
      { id: 'quantum-atom-prime', name: 'Atom Computing Prime Quantum', tier: 'Quantum', category: 'Quantum Miner', baseHashrate: 25000000, basePrice: 1000.0, currency: 'TON', maxOwned: 10, orderIndex: 55 },
    ];

    // Upsert equipment types - insert new items and update existing ones
    console.log(`📦 Upserting ${equipmentCatalog.length} equipment items...`);
    
    for (const equipment of equipmentCatalog) {
      await db.insert(equipmentTypes)
        .values(equipment)
        .onConflictDoUpdate({
          target: equipmentTypes.id,
          set: equipment,
        });
    }
    
    console.log(`✅ Equipment types upserted: ${equipmentCatalog.length}`);
    
    // Verify the data
    const finalCount = await db.select().from(equipmentTypes);
    console.log(`🔍 Verification: ${finalCount.length} equipment items in database`);

    // Seed default game settings (only if they don't exist)
    const defaultSettings = [
      { key: 'mining_paused', value: 'false' },
      { key: 'equipment_price_multiplier', value: '1.0' },
      { key: 'block_reward', value: '100000' },
      { key: 'block_interval_seconds', value: '300' },
    ];

    for (const setting of defaultSettings) {
      const existing = await db.select().from(gameSettings).where(eq(gameSettings.key, setting.key));
      if (existing.length === 0) {
        await db.insert(gameSettings).values(setting);
      }
    }
    console.log("✅ Game settings seeded");

    console.log("🎉 Database seeding complete!");
    return true;
  } catch (error) {
    console.error("❌ Seeding failed:", error instanceof Error ? error.message : error);
    // Don't crash the server - just log and return false
    return false;
  }
}
