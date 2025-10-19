import { db } from "./db";
import { equipmentTypes, gameSettings } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Add connection timeout protection
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Database connection timeout after 10s")), 10000);
    });

    // Seed equipment types
    const equipmentCatalog = [
      // TIER 1 - BASIC (CS)
      { id: 'laptop-lenovo', name: 'Lenovo ThinkPad', tier: 'Basic', category: 'Laptop', baseHashrate: 10, basePrice: 5000, currency: 'CS', maxOwned: 10, orderIndex: 1 },
      { id: 'laptop-dell', name: 'Dell Inspiron', tier: 'Basic', category: 'Laptop', baseHashrate: 12, basePrice: 6000, currency: 'CS', maxOwned: 10, orderIndex: 2 },
      { id: 'laptop-hp', name: 'HP Pavilion', tier: 'Basic', category: 'Laptop', baseHashrate: 15, basePrice: 7500, currency: 'CS', maxOwned: 10, orderIndex: 3 },
      
      // TIER 2 - GAMING (CS)
      { id: 'gaming-alienware', name: 'Alienware Aurora', tier: 'Gaming', category: 'Gaming PC', baseHashrate: 50, basePrice: 25000, currency: 'CS', maxOwned: 5, orderIndex: 4 },
      { id: 'gaming-asus', name: 'ASUS ROG Strix', tier: 'Gaming', category: 'Gaming PC', baseHashrate: 60, basePrice: 30000, currency: 'CS', maxOwned: 5, orderIndex: 5 },
      { id: 'gaming-custom', name: 'Custom Gaming Rig', tier: 'Gaming', category: 'Gaming PC', baseHashrate: 75, basePrice: 40000, currency: 'CS', maxOwned: 5, orderIndex: 6 },
      
      // TIER 3 - PRO (CS)
      { id: 'workstation-dell', name: 'Dell Precision', tier: 'Professional', category: 'Workstation', baseHashrate: 150, basePrice: 80000, currency: 'CS', maxOwned: 3, orderIndex: 7 },
      { id: 'workstation-hp', name: 'HP Z8 Fury', tier: 'Professional', category: 'Workstation', baseHashrate: 200, basePrice: 120000, currency: 'CS', maxOwned: 3, orderIndex: 8 },
      { id: 'workstation-lenovo', name: 'Lenovo ThinkStation', tier: 'Professional', category: 'Workstation', baseHashrate: 250, basePrice: 160000, currency: 'CS', maxOwned: 3, orderIndex: 9 },
      
      // TIER 4 - ENTERPRISE (CS)
      { id: 'server-dell', name: 'Dell PowerEdge', tier: 'Enterprise', category: 'Server', baseHashrate: 500, basePrice: 350000, currency: 'CS', maxOwned: 2, orderIndex: 10 },
      { id: 'server-hp', name: 'HP ProLiant', tier: 'Enterprise', category: 'Server', baseHashrate: 600, basePrice: 450000, currency: 'CS', maxOwned: 2, orderIndex: 11 },
      { id: 'server-rack', name: 'Custom Server Rack', tier: 'Enterprise', category: 'Server', baseHashrate: 800, basePrice: 650000, currency: 'CS', maxOwned: 2, orderIndex: 12 },
      
      // TIER 5 - SPECIALIZED (CHST)
      { id: 'gpu-nvidia-3090', name: 'NVIDIA RTX 3090', tier: 'Specialized', category: 'GPU Rig', baseHashrate: 1000, basePrice: 5, currency: 'CHST', maxOwned: 5, orderIndex: 13 },
      { id: 'gpu-nvidia-4090', name: 'NVIDIA RTX 4090', tier: 'Specialized', category: 'GPU Rig', baseHashrate: 1500, basePrice: 8, currency: 'CHST', maxOwned: 5, orderIndex: 14 },
      { id: 'gpu-amd-7900', name: 'AMD Radeon 7900 XTX', tier: 'Specialized', category: 'GPU Rig', baseHashrate: 1200, basePrice: 6, currency: 'CHST', maxOwned: 5, orderIndex: 15 },
      
      // TIER 6 - ASIC (CHST)
      { id: 'asic-antminer', name: 'Antminer S19', tier: 'ASIC', category: 'ASIC Miner', baseHashrate: 3000, basePrice: 20, currency: 'CHST', maxOwned: 3, orderIndex: 16 },
      { id: 'asic-whatsminer', name: 'WhatsMiner M30S', tier: 'ASIC', category: 'ASIC Miner', baseHashrate: 4000, basePrice: 30, currency: 'CHST', maxOwned: 3, orderIndex: 17 },
      { id: 'asic-avalon', name: 'AvalonMiner 1246', tier: 'ASIC', category: 'ASIC Miner', baseHashrate: 5000, basePrice: 40, currency: 'CHST', maxOwned: 3, orderIndex: 18 },
      
      // TIER 7 - DATACENTER (CHST)
      { id: 'datacenter-small', name: 'Small Data Center', tier: 'Data Center', category: 'Data Center', baseHashrate: 10000, basePrice: 100, currency: 'CHST', maxOwned: 2, orderIndex: 19 },
      { id: 'datacenter-medium', name: 'Medium Data Center', tier: 'Data Center', category: 'Data Center', baseHashrate: 20000, basePrice: 250, currency: 'CHST', maxOwned: 2, orderIndex: 20 },
      { id: 'datacenter-large', name: 'Large Data Center', tier: 'Data Center', category: 'Data Center', baseHashrate: 50000, basePrice: 750, currency: 'CHST', maxOwned: 1, orderIndex: 21 },
    ];

    // Check if equipment already seeded
    const existingEquipment = await db.select().from(equipmentTypes).limit(1);
    
    if (existingEquipment.length === 0) {
      await db.insert(equipmentTypes).values(equipmentCatalog);
      console.log(`✅ Equipment types seeded: ${equipmentCatalog.length}`);
    } else {
      console.log("⏭️  Equipment types already seeded, skipping");
    }

    // Seed default game settings
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
    console.error("❌ Seeding failed:", error);
    return false;
  }
}
