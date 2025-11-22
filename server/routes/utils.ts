import { Request } from "express";
import { z } from "zod";

/**
 * Common validation schemas for route parameters
 */
export const userIdSchema = z.string().min(1, "User ID is required");
export const limitSchema = z.string().optional().transform((val) => val ? parseInt(val) : 10);

/**
 * Validate and extract common request parameters
 */
export function validateLimitParam(req: Request): number {
  const limit = parseInt(req.query.limit as string) || 10;
  return Math.min(limit, 100); // Max 100 results for safety
}

/**
 * Standard error response helper
 */
export function handleError(res: any, error: any, message: string, statusCode: number = 500) {
  console.error(message, error);
  res.status(statusCode).json({ error: error.message || message });
}

/**
 * Standard success response helper
 */
export function handleSuccess(res: any, data: any, message?: string) {
  const response: any = data;
  if (message) {
    response.message = message;
  }
  res.json(response);
}

/**
 * Pagination helper for consistent pagination across routes
 */
export function getPaginationParams(req: Request) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = validateLimitParam(req);
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

/**
 * Common transaction guard helper
 */
export async function withTransaction<T>(
  db: any,
  callback: (tx: any) => Promise<T>
): Promise<T> {
  return await db.transaction(callback);
}