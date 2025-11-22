import { randomUUID } from 'crypto';

interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
  requestId?: string;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();

  start(operation: string, metadata?: Record<string, any>): string {
    const metricId = randomUUID().slice(0, 8);
    const metric: PerformanceMetric = {
      operation,
      startTime: Date.now(),
      metadata,
      requestId: metricId,
    };
    
    this.metrics.set(metricId, metric);
    return metricId;
  }

  end(metricId: string, additionalMetadata?: Record<string, any>): PerformanceMetric | null {
    const metric = this.metrics.get(metricId);
    if (!metric) return null;

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    
    if (additionalMetadata) {
      metric.metadata = { ...metric.metadata, ...additionalMetadata };
    }

    // Log the performance metric
    this.logMetric(metric);
    
    // Remove from active metrics
    this.metrics.delete(metricId);
    
    return metric;
  }

  private logMetric(metric: PerformanceMetric): void {
    const logLevel = this.getLogLevel(metric.duration || 0);
    const logMessage = `[PERFORMANCE] ${metric.operation}: ${metric.duration}ms`;
    
    const logData = {
      operation: metric.operation,
      duration: metric.duration,
      requestId: metric.requestId,
      metadata: metric.metadata,
      timestamp: new Date().toISOString(),
    };

    switch (logLevel) {
      case 'warn':
        console.warn(logMessage, JSON.stringify(logData));
        break;
      case 'error':
        console.error(logMessage, JSON.stringify(logData));
        break;
      default:
        console.log(logMessage, JSON.stringify(logData));
    }
  }

  private getLogLevel(duration: number): 'log' | 'warn' | 'error' {
    // Define performance thresholds (in milliseconds)
    const WARNING_THRESHOLD = 1000; // 1 second
    const ERROR_THRESHOLD = 5000;   // 5 seconds
    
    if (duration >= ERROR_THRESHOLD) return 'error';
    if (duration >= WARNING_THRESHOLD) return 'warn';
    return 'log';
  }

  // Get active metrics count
  getActiveMetricsCount(): number {
    return this.metrics.size;
  }

  // Clear all active metrics (useful for cleanup)
  clearActiveMetrics(): void {
    this.metrics.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Decorator for automatically measuring function performance
export function measurePerformance(operationName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const operation = operationName || `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const metricId = performanceMonitor.start(operation, {
        className: target.constructor.name,
        methodName: propertyName,
        argsCount: args.length,
      });

      try {
        const result = await method.apply(this, args);
        performanceMonitor.end(metricId, { success: true });
        return result;
      } catch (error: any) {
        performanceMonitor.end(metricId, { 
          success: false, 
          error: error.message,
          errorType: error.constructor.name,
        });
        throw error;
      }
    };

    return descriptor;
  };
}

// Helper function to measure async functions
export async function measureAsync<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const metricId = performanceMonitor.start(operation, metadata);

  try {
    const result = await fn();
    performanceMonitor.end(metricId, { success: true });
    return result;
  } catch (error: any) {
    performanceMonitor.end(metricId, { 
      success: false, 
      error: error.message,
      errorType: error.constructor.name,
    });
    throw error;
  }
}

// Database query performance monitoring
export class DatabasePerformanceMonitor {
  static async measureQuery<T>(
    queryType: string,
    query: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    return measureAsync(`db.${queryType}`, query, {
      queryType,
      ...metadata,
    });
  }

  static logSlowQuery(queryType: string, duration: number, metadata?: Record<string, any>): void {
    const SLOW_QUERY_THRESHOLD = 500; // 500ms
    
    if (duration >= SLOW_QUERY_THRESHOLD) {
      console.warn(`[SLOW_QUERY] ${queryType}: ${duration}ms`, JSON.stringify({
        queryType,
        duration,
        metadata,
        timestamp: new Date().toISOString(),
      }));
    }
  }
}