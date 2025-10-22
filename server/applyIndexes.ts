import { db } from "./db";
import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";

export async function applyPerformanceIndexes() {
  try {
    console.log("📊 Applying performance indexes...");
    
    const indexSQL = readFileSync(
      join(process.cwd(), "server/migrations/add-indexes.sql"),
      "utf-8"
    );
    
    // Split by semicolons and execute each statement
    const statements = indexSQL
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith("--"));
    
    for (const statement of statements) {
      await db.execute(sql.raw(statement));
    }
    
    console.log(`✅ Applied ${statements.length} performance indexes`);
  } catch (error) {
    console.error("⚠️  Failed to apply indexes (non-fatal):", error);
  }
}
