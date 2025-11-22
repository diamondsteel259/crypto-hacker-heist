# API Error Handling Documentation

## Overview

This document describes the standardized API error handling system implemented to ensure consistent error responses across all endpoints. The system provides structured error responses with proper logging and monitoring.

## Error Response Format

All API errors now follow a consistent JSON format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "optional_field_name",
      "value": "optional_invalid_value",
      "additionalInfo": {}
    },
    "requestId": "8-char-uuid",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Fields

- **code**: Machine-readable error code (see Error Codes section)
- **message**: Human-readable error description
- **details**: Optional additional error information
- **requestId**: Unique identifier for tracking the request
- **timestamp**: ISO timestamp of when the error occurred

## Error Codes

### Authentication & Authorization
- `UNAUTHORIZED` (401): Authentication required or invalid
- `FORBIDDEN` (403): Access denied
- `ADMIN_REQUIRED` (403): Admin access required
- `INVALID_TELEGRAM_AUTH` (401): Invalid Telegram authentication
- `USER_NOT_FOUND` (404): User not found
- `ACCESS_DENIED` (403): Access denied to specific resource

### Validation
- `VALIDATION_ERROR` (400): Request validation failed
- `INVALID_REQUEST` (400): Invalid request format
- `MISSING_REQUIRED_FIELD` (400): Required field missing

### Business Logic
- `INSUFFICIENT_BALANCE` (400): Insufficient balance for operation
- `EQUIPMENT_NOT_FOUND` (404): Equipment not found
- `EQUIPMENT_ALREADY_OWNED` (400): Equipment already owned
- `MAX_LEVEL_REACHED` (400): Maximum upgrade level reached
- `INVALID_PURCHASE` (400): Invalid purchase attempt
- `MINING_PAUSED` (503): Mining service is paused
- `NO_ACTIVE_MINERS` (400): No active miners for block mining

### Database & Infrastructure
- `DATABASE_ERROR` (500): Database operation failed
- `TRANSACTION_FAILED` (500): Database transaction failed
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable

### Rate Limiting
- `RATE_LIMIT_EXCEEDED` (429): Too many requests

### Generic
- `INTERNAL_SERVER_ERROR` (500): Unexpected server error
- `NOT_FOUND` (404): General resource not found

## Usage Examples

### Throwing Errors in Routes

```typescript
import { asyncHandler } from '../middleware/errorHandler';
import { createValidationError, createNotFoundError } from '../errors/apiErrors';

app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  if (!userId || isNaN(parseInt(userId))) {
    throw createValidationError('Invalid user ID', 'id', userId);
  }
  
  const user = await storage.getUser(userId);
  if (!user) {
    throw createNotFoundError('User not found');
  }
  
  res.json(createSuccessResponse(user));
}));
```

### Creating Custom Errors

```typescript
import { ApiError, ApiErrorCode } from '../errors/apiErrors';

// Custom error with details
throw new ApiError(
  ApiErrorCode.BUSINESS_LOGIC_ERROR,
  'Custom business logic violation',
  400,
  { 
    rule: 'MAX_PURCHASES_PER_DAY',
    current: 5,
    limit: 3
  }
);
```

### Using Helper Functions

```typescript
import {
  createUnauthorizedError,
  createForbiddenError,
  createValidationError,
  createInsufficientBalanceError
} from '../errors/apiErrors';

// Authentication error
throw createUnauthorizedError('Please log in to continue');

// Forbidden access
throw createForbiddenError('You cannot access this resource');

// Validation error
throw createValidationError('Email is required', 'email');

// Business logic error
throw createInsufficientBalanceError('Not enough CS tokens for purchase');
```

## Middleware Integration

### Error Handler Middleware

The error handler middleware automatically:
- Catches all errors thrown in routes
- Generates unique request IDs
- Logs structured error information
- Returns standardized error responses
- Handles different error types appropriately

### Async Handler Wrapper

Use the `asyncHandler` wrapper to automatically catch async errors:

```typescript
import { asyncHandler } from '../middleware/errorHandler';

// Without wrapper - errors might not be caught
app.get('/api/route', async (req, res, next) => {
  // Async errors here might not be caught properly
});

// With wrapper - all errors are caught and handled
app.get('/api/route', asyncHandler(async (req, res) => {
  // All errors here are caught and handled properly
}));
```

## Performance Monitoring

The system includes performance monitoring for database operations and critical functions:

### Automatic Performance Tracking

```typescript
import { measurePerformance } from '../utils/performance';

class MiningService {
  @measurePerformance('mineBlock')
  async mineBlock() {
    // This method will be automatically measured
    // Performance metrics logged on completion
  }
}
```

### Manual Performance Tracking

```typescript
import { measureAsync, DatabasePerformanceMonitor } from '../utils/performance';

// Measure any async operation
const result = await measureAsync('custom-operation', async () => {
  return await someAsyncOperation();
});

// Measure database queries
const users = await DatabasePerformanceMonitor.measureQuery(
  'getActiveUsers',
  () => db.select().from(users).where(eq(users.isActive, true))
);
```

## Logging

### Structured Logging

All errors are logged with structured information:

```json
{
  "requestId": "abc12345",
  "method": "GET",
  "url": "/api/users/123",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1",
  "userId": "user-123",
  "error": {
    "name": "ApiError",
    "message": "User not found",
    "code": "USER_NOT_FOUND",
    "statusCode": 404,
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Performance Logging

Performance metrics are logged with operation details:

```json
{
  "operation": "mineBlock",
  "duration": 1250,
  "requestId": "def67890",
  "metadata": {
    "blockNumber": 1234,
    "activeMiners": 45,
    "success": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Migration Guide

### Before (Old Pattern)
```typescript
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});
```

### After (New Pattern)
```typescript
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await storage.getUser(req.params.id);
  if (!user) {
    throw createNotFoundError("User not found");
  }
  res.json(createSuccessResponse(user));
}));
```

## Benefits

1. **Consistency**: All errors follow the same format
2. **Traceability**: Each error has a unique request ID
3. **Monitoring**: Structured logging enables better monitoring
4. **Performance**: Built-in performance tracking
5. **Maintainability**: Centralized error handling logic
6. **Developer Experience**: Helper functions and type safety
7. **Debugging**: Rich error context and metadata

## Testing

The error handling system includes comprehensive tests:

- Error creation and serialization
- Middleware behavior
- Performance monitoring
- Database query tracking

Run tests with:
```bash
npm test -- server/tests/errorHandling.test.ts
npm test -- server/tests/performance.test.ts
```