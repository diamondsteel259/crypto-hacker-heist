export enum ApiErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  ADMIN_REQUIRED = 'ADMIN_REQUIRED',
  INVALID_TELEGRAM_AUTH = 'INVALID_TELEGRAM_AUTH',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ACCESS_DENIED = 'ACCESS_DENIED',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Business Logic
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  EQUIPMENT_NOT_FOUND = 'EQUIPMENT_NOT_FOUND',
  EQUIPMENT_ALREADY_OWNED = 'EQUIPMENT_ALREADY_OWNED',
  MAX_LEVEL_REACHED = 'MAX_LEVEL_REACHED',
  INVALID_PURCHASE = 'INVALID_PURCHASE',
  MINING_PAUSED = 'MINING_PAUSED',
  NO_ACTIVE_MINERS = 'NO_ACTIVE_MINERS',

  // Database & Infrastructure
  DATABASE_ERROR = 'DATABASE_ERROR',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Generic
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
}

export interface ErrorDetails {
  field?: string;
  value?: any;
  additionalInfo?: Record<string, any>;
  operation?: string;
  originalError?: string;
  blockNumber?: number;
}

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly details?: ErrorDetails;
  public readonly requestId?: string;

  constructor(
    code: ApiErrorCode,
    message: string,
    statusCode: number = 500,
    details?: ErrorDetails,
    requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.requestId = requestId;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
        ...(this.requestId && { requestId: this.requestId }),
      }
    };
  }
}

// Helper functions for common errors
export const createUnauthorizedError = (message: string = 'Authentication required') => 
  new ApiError(ApiErrorCode.UNAUTHORIZED, message, 401);

export const createForbiddenError = (message: string = 'Access denied') => 
  new ApiError(ApiErrorCode.FORBIDDEN, message, 403);

export const createNotFoundError = (message: string = 'Resource not found') => 
  new ApiError(ApiErrorCode.NOT_FOUND, message, 404);

export const createValidationError = (message: string, field?: string, value?: any) => 
  new ApiError(ApiErrorCode.VALIDATION_ERROR, message, 400, { field, value });

export const createDatabaseError = (message: string, details?: ErrorDetails) => 
  new ApiError(ApiErrorCode.DATABASE_ERROR, message, 500, details);

export const createMiningPausedError = (message: string = 'Mining is currently paused') => 
  new ApiError(ApiErrorCode.MINING_PAUSED, message, 503);

export const createInsufficientBalanceError = (message: string = 'Insufficient balance') => 
  new ApiError(ApiErrorCode.INSUFFICIENT_BALANCE, message, 400);

export const createRateLimitError = (message: string = 'Rate limit exceeded') => 
  new ApiError(ApiErrorCode.RATE_LIMIT_EXCEEDED, message, 429);