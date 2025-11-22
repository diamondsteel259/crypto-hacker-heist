import { describe, it, expect, beforeEach } from '@jest/globals';
import { ApiError, ApiErrorCode, createUnauthorizedError, createValidationError } from '../errors/apiErrors';
import { errorHandler } from '../middleware/errorHandler';
import { Request, Response, NextFunction } from 'express';

describe('Error Handling', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/api/test',
      ip: '127.0.0.1',
      get: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('ApiError', () => {
    it('should create an ApiError with correct properties', () => {
      const error = new ApiError(
        ApiErrorCode.VALIDATION_ERROR,
        'Test validation error',
        400,
        { field: 'test', value: 'invalid' }
      );

      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ApiError');
      expect(error.code).toBe(ApiErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Test validation error');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'test', value: 'invalid' });
    });

    it('should serialize to JSON correctly', () => {
      const error = new ApiError(
        ApiErrorCode.UNAUTHORIZED,
        'Unauthorized access',
        401,
        undefined,
        'req-123'
      );

      const json = error.toJSON();
      expect(json).toEqual({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized access',
          requestId: 'req-123',
        }
      });
    });
  });

  describe('Helper Functions', () => {
    it('should create unauthorized error', () => {
      const error = createUnauthorizedError('Custom auth message');
      expect(error.code).toBe(ApiErrorCode.UNAUTHORIZED);
      expect(error.message).toBe('Custom auth message');
      expect(error.statusCode).toBe(401);
    });

    it('should create validation error', () => {
      const error = createValidationError('Invalid field', 'email', 'invalid-email');
      expect(error.code).toBe(ApiErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Invalid field');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({
        field: 'email',
        value: 'invalid-email'
      });
    });
  });

  describe('Error Handler Middleware', () => {
    it('should handle ApiError correctly', () => {
      const error = new ApiError(
        ApiErrorCode.VALIDATION_ERROR,
        'Test error',
        400,
        { field: 'test' }
      );

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Test error',
          details: { field: 'test' },
          requestId: expect.any(String),
          timestamp: expect.any(String),
        }
      });
    });

    it('should handle generic errors correctly', () => {
      const error = new Error('Unexpected error');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          requestId: expect.any(String),
          timestamp: expect.any(String),
        }
      });
    });

    it('should handle validation errors correctly', () => {
      const error = {
        name: 'ValidationError',
        message: 'Invalid data',
        type: 'entity.parse.failed'
      };

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          requestId: expect.any(String),
          timestamp: expect.any(String),
          details: {
            originalError: 'Invalid data',
          },
        }
      });
    });
  });
});