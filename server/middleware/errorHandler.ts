import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/apiErrors';
import { randomUUID } from 'crypto';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    requestId?: string;
    timestamp?: string;
  };
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate a unique request ID for tracking
  const requestId = randomUUID().slice(0, 8);
  
  // Log the error with structured information
  const logData = {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: (req as any).user?.id || (req as any).telegramUser?.id,
    error: {
      name: err.name,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      stack: err.stack,
      details: err.details,
    },
    timestamp: new Date().toISOString(),
  };

  // Log based on error type and severity
  if (err instanceof ApiError) {
    // Log API errors with structured format
    if (err.statusCode >= 500) {
      console.error('[API_ERROR]', JSON.stringify(logData, null, 2));
    } else {
      console.warn('[API_ERROR]', JSON.stringify(logData, null, 2));
    }

    const errorResponse: ErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        requestId,
        timestamp: new Date().toISOString(),
      },
    };

    if (err.details) {
      errorResponse.error.details = err.details;
    }

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle validation errors (like from express-validator)
  if (err.name === 'ValidationError' || err.type === 'entity.parse.failed') {
    console.warn('[VALIDATION_ERROR]', JSON.stringify({
      ...logData,
      error: { ...logData.error, name: 'ValidationError' }
    }, null, 2));

    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        requestId,
        timestamp: new Date().toISOString(),
        details: {
          originalError: err.message,
        },
      },
    });
    return;
  }

  // Handle database errors
  if (err.code?.startsWith('23') || err.code?.startsWith('40')) {
    // PostgreSQL error codes starting with 23 are integrity constraint violations
    // Starting with 40 are transaction rollbacks
    console.error('[DATABASE_ERROR]', JSON.stringify(logData, null, 2));

    res.status(500).json({
      error: {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Handle rate limiting errors
  if (err.status === 429) {
    console.warn('[RATE_LIMIT]', JSON.stringify(logData, null, 2));

    res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: err.message || 'Too many requests',
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Handle JWT/token errors
  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError' || err.name === 'TokenExpiredError') {
    console.warn('[AUTH_ERROR]', JSON.stringify(logData, null, 2));

    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid authentication token',
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Handle syntax errors (invalid JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    console.warn('[SYNTAX_ERROR]', JSON.stringify(logData, null, 2));

    res.status(400).json({
      error: {
        code: 'INVALID_REQUEST',
        message: 'Invalid request format',
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Handle all other unexpected errors
  console.error('[UNEXPECTED_ERROR]', JSON.stringify(logData, null, 2));

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      requestId,
      timestamp: new Date().toISOString(),
    },
  });
}

// Async handler wrapper to catch errors and forward them to the error handler
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Helper to create a standardized success response
export function createSuccessResponse<T>(data: T, meta?: Record<string, any>) {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

// Helper to create a paginated response
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    meta: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  };
}