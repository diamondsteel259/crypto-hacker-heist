import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverDir = path.join(__dirname, '..', 'server');

// Patterns for verbose logs to remove
const verbosePatterns = [
  /console\.log\(["']Purchase request:["'],/,
  /console\.log\(["']Schema validation failed:["'],/,
  /console\.log\(["']Equipment type not found:["'],/,
  /console\.log\(["']Equipment type found:["'],/,
  /console\.log\(["']Previous equipment check:["'],/,
  /console\.log\(["']Balance check:["'],/,
  /console\.log\(["']First Basic Laptop purchase/,
  /console\.log\(`Paid purchase: Updated user hashrate/,
  /console\.log\(`Free purchase: Updated user hashrate/,
  /console\.log\(`User .* now has hashrate:/,
  /console\.log\(`Verifying TON transaction:/,
  /console\.log\(['"]TON transaction verified/,
  /console\.log\(`Loot box opened:/,
  // Add more patterns for verbose logs
];

// Patterns to KEEP (these are important)
const keepPatterns = [
  /console\.log\(`🤖 Telegram webhook/,
  /console\.log\(`Hashrate recalculation complete:/,
  /console\.log\(`Jackpot .* marked as paid/,
  /console\.error/, // Keep all error logs
  /console\.warn/, // Keep all warnings
  /🚀/, // Keep deployment markers
  /✅/, // Keep success markers for critical operations
  /⚠️/, // Keep warning markers
];

function shouldRemoveLine(line) {
  // Never remove lines that match keep patterns
  for (const pattern of keepPatterns) {
    if (pattern.test(line)) {
      return false;
    }
  }

  // Remove lines that match verbose patterns
  for (const pattern of verbosePatterns) {
    if (pattern.test(line)) {
      return true;
    }
  }

  return false;
}

function cleanupFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const cleanedLines = [];
    let removedCount = 0;
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (shouldRemoveLine(line)) {
        // Check if this is a multi-line console statement
        let j = i;
        while (j < lines.length && !lines[j].includes(';') && !lines[j].includes(')')) {
          j++;
        }

        // Skip all lines of this console statement
        removedCount += (j - i + 1);
        i = j + 1;
      } else {
        cleanedLines.push(line);
        i++;
      }
    }

    if (removedCount > 0) {
      fs.writeFileSync(filePath, cleanedLines.join('\n'));
      console.log(`✅ ${path.basename(filePath)}: Removed ${removedCount} verbose log lines`);
      return removedCount;
    }

    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
  }
}

function processDirectory(dir) {
  let totalRemoved = 0;
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      totalRemoved += processDirectory(fullPath);
    } else if (file.name.endsWith('.ts')) {
      totalRemoved += cleanupFile(fullPath);
    }
  }

  return totalRemoved;
}

console.log('🧹 Starting console log cleanup...\n');
const totalRemoved = processDirectory(serverDir);
console.log(`\n🎉 Cleanup complete! Removed ${totalRemoved} verbose log statements.`);
console.log('✅ Critical error logs and important status logs have been preserved.');
