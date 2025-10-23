#!/bin/bash

# Safe console log cleanup - removes only verbose debug logs
# Keeps: error logs, warnings, startup messages, important status logs

SERVER_DIR="/workspace/cmh2g6k6500ykq2i2jghsdnk3/crypto-hacker-heist/server"

echo "🧹 Starting safe console log cleanup..."
echo "📊 Current console statement count:"
grep -rn "console\." "$SERVER_DIR" --include="*.ts" | wc -l

# Create backup
echo "💾 Creating backup..."
tar -czf "$SERVER_DIR/../server-backup-$(date +%Y%m%d-%H%M%S).tar.gz" "$SERVER_DIR"

# Function to safely remove a console.log line
remove_verbose_logs() {
  local file="$1"

  # Remove verbose purchase debugging (lines 577-695 area in routes.ts)
  sed -i '/console\.log("Purchase request:",/d' "$file"
  sed -i '/console\.log("Schema validation failed:",/d' "$file"
  sed -i '/console\.log("Equipment type not found:",/d' "$file"
  sed -i '/console\.log("Equipment type found:",/d' "$file"
  sed -i '/console\.log("Balance check:",/d' "$file"
  sed -i '/console\.log("Previous equipment check:",/d' "$file"
  sed -i '/console\.log(`Paid purchase: Updated user hashrate/d' "$file"
  sed -i '/console\.log(`Free purchase: Updated user hashrate/d' "$file"
  sed -i '/console\.log(`User .* now has hashrate:/d' "$file"
  sed -i '/console\.log(`Verifying TON transaction:/d' "$file"
  sed -i "/console\.log('TON transaction verified/d" "$file"
  sed -i '/console\.log(`Loot box opened:/d' "$file"
  sed -i '/console\.log("First Basic Laptop purchase/d' "$file"

  # Remove verbose debugging patterns (but keep errors and warnings)
  # This is safe because we're only targeting .log() not .error() or .warn()
}

# Apply cleanup to routes.ts (the main offender)
if [ -f "$SERVER_DIR/routes.ts" ]; then
  echo "🎯 Cleaning server/routes.ts..."
  remove_verbose_logs "$SERVER_DIR/routes.ts"
fi

# Apply to other route files
if [ -f "$SERVER_DIR/routes/admin.routes.ts" ]; then
  echo "🎯 Cleaning server/routes/admin.routes.ts..."
  remove_verbose_logs "$SERVER_DIR/routes/admin.routes.ts"
fi

echo "✅ Cleanup complete!"
echo "📊 New console statement count:"
grep -rn "console\." "$SERVER_DIR" --include="*.ts" | wc -l

echo "📝 Summary: Removed verbose debug logs while keeping all error/warning/status logs"
echo "💾 Backup saved to: server-backup-*.tar.gz"
