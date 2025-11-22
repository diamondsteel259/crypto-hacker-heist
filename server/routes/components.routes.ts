import type { Express } from "express";
import { db } from "../storage";
import { users, ownedEquipment, equipmentTypes, componentUpgrades } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { validateTelegramAuth, verifyUserAccess } from "../middleware/auth";
import { verifyTONTransaction } from "../tonVerification";

export function registerComponentsRoutes(app: Express): void {
  // Component upgrade routes
  app.get("/api/user/:userId/equipment/:equipmentId/components", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, equipmentId } = req.params;

    try {
      const components = await db.select()
        .from(componentUpgrades)
        .innerJoin(ownedEquipment, eq(componentUpgrades.ownedEquipmentId, ownedEquipment.id))
        .where(and(
          eq(ownedEquipment.userId, userId),
          eq(ownedEquipment.id, equipmentId)
        ));

      res.json(components);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to fetch component upgrades" });
    }
  });

  app.post("/api/user/:userId/equipment/:equipmentId/components/upgrade", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId, equipmentId } = req.params;
    const { componentType, currency = "CS", tonTransactionHash, userWalletAddress, tonAmount } = req.body;

    if (!componentType || !["RAM", "CPU", "Storage", "GPU"].includes(componentType)) {
      return res.status(400).json({ message: "Invalid component type" });
    }

    if (!["CS", "TON"].includes(currency)) {
      return res.status(400).json({ message: "Invalid currency. Must be CS or TON" });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        // Get the owned equipment
        const owned = await tx.select()
          .from(ownedEquipment)
          .innerJoin(equipmentTypes, eq(ownedEquipment.equipmentTypeId, equipmentTypes.id))
          .where(and(
            eq(ownedEquipment.userId, userId),
            eq(ownedEquipment.id, equipmentId)
          ));

        if (!owned[0]) {
          throw new Error("Equipment not found");
        }

        // Get or create component upgrade
        let component = await tx.select()
          .from(componentUpgrades)
          .where(and(
            eq(componentUpgrades.ownedEquipmentId, equipmentId),
            eq(componentUpgrades.componentType, componentType)
          ));

        if (!component[0]) {
          // Create new component upgrade
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

        // Calculate upgrade cost based on component type and level
        const baseCost = owned[0].equipment_types.basePrice * 0.1; // 10% of equipment base price
        const componentMultiplier: Record<string, number> = {
          "RAM": 0.8,
          "CPU": 1.2,
          "Storage": 0.6,
          "GPU": 1.5
        };
        const multiplier = componentMultiplier[componentType as string] || 1;

        const upgradeCostCS = Math.floor(baseCost * multiplier * Math.pow(1.15, currentLevel));
        
        // Calculate cost in different currencies
        let upgradeCost = upgradeCostCS;
        if (currency === "TON") {
          upgradeCost = parseFloat((upgradeCostCS / 10000).toFixed(3)); // CS to TON conversion
        }

        // Handle TON payment
        if (currency === "TON") {
          if (!tonTransactionHash || !userWalletAddress || !tonAmount) {
            throw new Error("TON transaction details required");
          }

          // Verify TON amount matches upgrade cost
          if (parseFloat(tonAmount) < upgradeCost) {
            throw new Error(`Insufficient TON amount. Required: ${upgradeCost} TON`);
          }

          // Verify TON transaction
          const isValid = await verifyTONTransaction(
            tonTransactionHash,
            userWalletAddress,
            tonAmount
          );

          if (!isValid) {
            throw new Error("TON transaction verification failed");
          }
        } else {
          // Handle CS payment
          const user = await tx.select().from(users).where(eq(users.id, userId));
          const currentBalance = user[0].csBalance;

          if (currentBalance < upgradeCost) {
            throw new Error(`Insufficient ${currency} balance. Need ${upgradeCost} ${currency}`);
          }

          // Deduct balance
          await tx.update(users)
            .set({
              csBalance: sql`${users.csBalance} - ${upgradeCost}`
            })
            .where(eq(users.id, userId));
        }

        // Upgrade component
        const newLevel = currentLevel + 1;
        await tx.update(componentUpgrades)
          .set({
            currentLevel: newLevel,
            updatedAt: sql`NOW()`
          })
          .where(eq(componentUpgrades.id, component[0].id));

        // Calculate hashrate increase (5% per component level)
        const hashrateIncrease = owned[0].equipment_types.baseHashrate * 0.05 * owned[0].owned_equipment.quantity;
        
        // Update equipment hashrate
        await tx.update(ownedEquipment)
          .set({
            currentHashrate: sql`${ownedEquipment.currentHashrate} + ${hashrateIncrease}`
          })
          .where(eq(ownedEquipment.id, equipmentId));

        // Update user total hashrate
        await tx.update(users)
          .set({
            totalHashrate: sql`${users.totalHashrate} + ${hashrateIncrease}`
          })
          .where(eq(users.id, userId));

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
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to upgrade component" });
    }
  });
}