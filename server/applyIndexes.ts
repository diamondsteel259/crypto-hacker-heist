import { db } from "./db";
import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";
import { logger } from "./logger";

export async function applyPerformanceIndexes() {
  try {
    logger.info("Applying performance indexes");
    
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
    
    logger.info("Performance indexes applied", { count: statements.length });
  } catch (error) {
    logger.warn("Failed to apply indexes (non-fatal)", error);
  }
}
