import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { performanceMonitor, measurePerformance, DatabasePerformanceMonitor } from '../utils/performance';
import { DbStorage } from '../storage';

// Mock the database for testing
jest.mock('../db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    transaction: jest.fn(),
  },
}));

describe('Performance Monitoring', () => {
  beforeEach(() => {
    performanceMonitor.clearActiveMetrics();
    jest.clearAllMocks();
  });

  describe('Performance Monitor', () => {
    it('should track performance metrics', () => {
      const metricId = performanceMonitor.start('test-operation', { test: true });
      
      expect(metricId).toBeDefined();
      expect(typeof metricId).toBe('string');
      expect(performanceMonitor.getActiveMetricsCount()).toBe(1);
      
      // Simulate some work
      setTimeout(() => {
        const metric = performanceMonitor.end(metricId);
        
        expect(metric).toBeDefined();
        expect(metric!.operation).toBe('test-operation');
        expect(metric!.duration).toBeGreaterThan(0);
        expect(metric!.metadata).toEqual({ test: true, success: true });
        expect(performanceMonitor.getActiveMetricsCount()).toBe(0);
      }, 10);
    });

    it('should handle non-existent metric IDs', () => {
      const metric = performanceMonitor.end('non-existent-id');
      expect(metric).toBeNull();
    });
  });

  describe('Measure Performance Decorator', () => {
    class TestClass {
      @measurePerformance('test-method')
      async testMethod(delay: number = 10): Promise<string> {
        return new Promise(resolve => {
          setTimeout(() => resolve('test-result'), delay);
        });
      }

      @measurePerformance()
      async errorMethod(): Promise<void> {
        throw new Error('Test error');
      }
    }

    it('should measure successful method execution', async () => {
      const testInstance = new TestClass();
      const result = await testInstance.testMethod(50);
      
      expect(result).toBe('test-result');
      expect(performanceMonitor.getActiveMetricsCount()).toBe(0);
    });

    it('should measure failed method execution', async () => {
      const testInstance = new TestClass();
      
      await expect(testInstance.errorMethod()).rejects.toThrow('Test error');
      expect(performanceMonitor.getActiveMetricsCount()).toBe(0);
    });
  });

  describe('Database Performance Monitor', () => {
    it('should measure database queries', async () => {
      const mockQuery = jest.fn().mockResolvedValue([{ id: 1, name: 'test' }]);
      
      const result = await DatabasePerformanceMonitor.measureQuery(
        'select-users',
        mockQuery,
        { limit: 10 }
      );
      
      expect(result).toEqual([{ id: 1, name: 'test' }]);
      expect(mockQuery).toHaveBeenCalled();
    });

    it('should handle query errors', async () => {
      const mockQuery = jest.fn().mockRejectedValue(new Error('Database error'));
      
      await expect(
        DatabasePerformanceMonitor.measureQuery('failing-query', mockQuery)
      ).rejects.toThrow('Database error');
      
      expect(performanceMonitor.getActiveMetricsCount()).toBe(0);
    });

    it('should log slow queries', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Simulate a slow query
      DatabasePerformanceMonitor.logSlowQuery('slow-select', 600, { rows: 1000 });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[SLOW_QUERY] slow-select: 600ms',
        expect.stringContaining('slow-select')
      );
      
      consoleSpy.mockRestore();
    });

    it('should not log fast queries', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Simulate a fast query
      DatabasePerformanceMonitor.logSlowQuery('fast-select', 100, { rows: 10 });
      
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('measureAsync Helper', () => {
    it('should measure async operations', async () => {
      const asyncOperation = async () => {
        return new Promise(resolve => setTimeout(() => resolve('async-result'), 50));
      };
      
      const result = await measureAsync('test-async', asyncOperation, { type: 'test' });
      
      expect(result).toBe('async-result');
      expect(performanceMonitor.getActiveMetricsCount()).toBe(0);
    });

    it('should handle async operation errors', async () => {
      const asyncOperation = async () => {
        throw new Error('Async error');
      };
      
      await expect(measureAsync('failing-async', asyncOperation)).rejects.toThrow('Async error');
      expect(performanceMonitor.getActiveMetricsCount()).toBe(0);
    });
  });
});