#!/bin/bash

# Remove ONLY verbose debug logs, keep important status logs
cd /workspace/cmh2g6k6500ykq2i2jghsdnk3/crypto-hacker-heist

echo "🧹 Removing verbose debug console.log statements..."
echo "📊 Before: $(grep -rn 'console\.' server/ --include='*.ts' | wc -l) console statements"

# Backup first
cp server/routes.ts server/routes.ts.backup

# Remove verbose purchase debugging
sed -i '/console\.log("Purchase request:",/d' server/routes.ts
sed -i '/console\.log("Schema validation failed:",/d' server/routes.ts
sed -i '/console\.log("Equipment type not found:",/d' server/routes.ts
sed -i '/console\.log("Equipment type found:",/d' server/routes.ts
sed -i '/console\.log("Previous equipment check:",/d' server/routes.ts
sed -i '/console\.log("Balance check:",/d' server/routes.ts
sed -i '/console\.log("First Basic Laptop purchase/d' server/routes.ts
sed -i '/console\.log(`Paid purchase: Updated user hashrate/d' server/routes.ts
sed -i '/console\.log(`Free purchase: Updated user hashrate/d' server/routes.ts
sed -i '/console\.log(`User .* now has hashrate:/d' server/routes.ts
sed -i '/console\.log(`Verifying TON transaction:/d' server/routes.ts
sed -i "/console\.log('TON transaction verified/d" server/routes.ts
sed -i '/console\.log(`Loot box opened:/d' server/routes.ts

echo "📊 After: $(grep -rn 'console\.' server/ --include='*.ts' | wc -l) console statements"
echo "✅ Cleanup complete!"
echo "💾 Backup saved to: server/routes.ts.backup"
