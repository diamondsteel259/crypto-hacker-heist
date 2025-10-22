import type { Express } from "express";
import { storage, db } from "../storage";
import { insertOwnedEquipmentSchema } from "@shared/schema";
import { users, ownedEquipment, equipmentTypes, componentUpgrades } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { validateTelegramAuth, requireAdmin, verifyUserAccess } from "../middleware/auth";
import { verifyTONTransaction } from "../tonVerification";

export function registerEquipmentRoutes(app: Express) {
  app.get("/api/equipment-types", async (req, res) => {
    try {
      const equipment = await storage.getAllEquipmentTypes();
      res.json(equipment);
    } catch (error) {
      console.error("Error loading equipment types:", error);
      res.status(500).json({ error: "Failed to load equipment types" });
    }
  });

  app.get("/api/equipment-types/:category/:tier", async (req, res) => {
    const { category, tier } = req.params;
    const equipmentTypes = await storage.getEquipmentTypesByCategoryAndTier(category, tier);
    res.json(equipmentTypes);
  });

  app.get("/api/user/:userId/equipment", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const equipment = await storage.getUserEquipment(req.params.userId);
    res.json(equipment);
  });

  app.post("/api/user/:userId/equipment/purchase", validateTelegramAuth, verifyUserAccess, async (req, res) => {
    const { userId } = req.params;
    
    const parsed = insertOwnedEquipmentSchema.safeParse({ ...req.body, userId });
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid equipment data", errors: parsed.error });
    }

    try {
      const result = await db.transaction(async (tx: any) => {
        const user = await tx.select().from(users).where(eq(users.id, userId)).for('update');
        if (!user[0]) throw new Error("User not found");

        const equipmentType = await tx.select().from(equipmentTypes).where(eq(equipmentTypes.id, parsed.data.equipmentTypeId));
        if (!equipmentType[0]) throw new Error("Equipment type not found");

        const et = equipmentType[0];
        const userEquipment = await tx.select().from(ownedEquipment).where(eq(ownedEquipment.userId, userId)).for('update');

        const isFirstBasicLaptop = parsed.data.equipmentTypeId === 'laptop-lenovo-e14';
        const ownedCount = userEquipment.filter((e: any) => e.equipmentTypeId === parsed.data.equipmentTypeId).length;
        const isFirstPurchase = ownedCount === 0;
        
        if (!isFirstBasicLaptop || !isFirstPurchase) {
          const balanceField = et.currency === 'CS' ? 'csBalance' : 'chstBalance';
          if (user[0][balanceField] < et.basePrice) {
            throw new Error(\`Insufficient \${et.currency} balance\`);
          }
        }

        const owned = userEquipment.find((e: any) => e.equipmentTypeId === parsed.data.equipmentTypeId);
        if (owned && owned.quantity >= et.maxOwned) {
          throw new Error(\`Maximum owned limit reached (\${et.maxOwned})\`);
        }

        let equipment;
        if (owned) {
          const updated = await tx.update(ownedEquipment)
            .set({
              quantity: sql\`\${ownedEquipment.quantity} + 1\`,
              currentHashrate: sql\`\${ownedEquipment.currentHashrate} + \${et.baseHashrate}\`
            })
            .where(eq(ownedEquipment.id, owned.id))
            .returning();
          equipment = updated[0];
        } else {
          const inserted = await tx.insert(ownedEquipment).values({
            userId,
            equipmentTypeId: parsed.data.equipmentTypeId,
            currentHashrate: et.baseHashrate,
          }).returning();
          equipment = inserted[0];
        }

        if (!(isFirstBasicLaptop && isFirstPurchase)) {
          const balanceField = et.currency === 'CS' ? 'csBalance' : 'chstBalance';
          await tx.update(users)
            .set({
              [balanceField]: sql\`\${balanceField === 'csBalance' ? users.csBalance : users.chstBalance} - \${et.basePrice}\`,
              totalHashrate: sql\`\${users.totalHashrate} + \${et.baseHashrate}\`
            })
            .where(eq(users.id, userId));
        } else {
          await tx.update(users)
            .set({ totalHashrate: sql\`\${users.totalHashrate} + \${et.baseHashrate}\` })
            .where(eq(users.id, userId));
        }

        return equipment;
      });

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
}
