import pino, { Logger as PinoLogger } from 'pino';
import { AsyncLocalStorage } from 'async_hooks';
import fs from 'fs';
import path from 'path';

// Request ID storage for correlation
const requestIdStorage = new AsyncLocalStorage<string>();

// Ensure logs directory exists
const logsDir = process.env.LOG_DIR || path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Determine log level from environment
const logLevel = process.env.LOG_LEVEL || 'info';

// Sensitive field patterns for redaction
const sensitivePatterns = [
  'x-telegram-init-data',
  'authorization',
  'cookie',
  'password',
  'token',
  'apiKey',
  'api_key',
  'secret',
  'private_key',
  'privateKey',
  'initData',
  'phone',
  'email',
];

// Redactor function for sensitive fields
function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  const redacted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitivePatterns.some(
      pattern => lowerKey.includes(pattern)
    );

    if (isSensitive) {
      redacted[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

// Configure transports based on environment
function getTransports(): any {
  const transports: any[] = [];

  if (process.env.NODE_ENV === 'production') {
    // In production: JSON to file with rotation
    transports.push({
      target: 'pino-rotating-file-stream',
      options: {
        file: path.join(logsDir, 'app.log'),
        maxSize: process.env.LOG_MAX_SIZE || '100M',
        maxFiles: parseInt(process.env.LOG_MAX_FILES || '10'),
        mkdir: true,
      },
    });

    // Also send to stdout for container/systemd capture
    if (process.env.LOG_TO_STDOUT !== 'false') {
      transports.push({
        target: 'pino/file',
        options: { destination: 1 },
      });
    }
  } else {
    // In development: pretty print to console
    transports.push({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    });

    // Also log to file in dev for debugging
    if (process.env.LOG_TO_FILE === 'true') {
      transports.push({
        target: 'pino-rotating-file-stream',
        options: {
          file: path.join(logsDir, 'app.log'),
          maxSize: '50M',
          maxFiles: 5,
          mkdir: true,
        },
      });
    }
  }

  return transports;
}

// Create the main logger instance
const pinoLogger = pino(
  {
    level: logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => {
        return { level: label };
      },
    },
    // Add base metadata
    base: {
      env: process.env.NODE_ENV || 'development',
      service: 'crypto-hacker-heist',
    },
  },
  pino.transport({
    targets: getTransports(),
  })
);

// Extend logger with context-aware methods
export class ContextLogger {
  private logger: PinoLogger;
  private requestId: string;

  constructor(logger: PinoLogger = pinoLogger, requestId?: string) {
    this.logger = logger;
    this.requestId = requestId || '';
  }

  private getContext() {
    return {
      requestId: this.requestId || requestIdStorage.getStore() || undefined,
    };
  }

  info(message: string, data?: any) {
    const context = this.getContext();
    if (data) {
      const sanitized = redactSensitiveData(data);
      this.logger.info({ ...context, ...sanitized }, message);
    } else {
      this.logger.info(context, message);
    }
  }

  error(message: string, error?: Error | any) {
    const context = this.getContext();
    if (error instanceof Error) {
      this.logger.error(
        {
          ...context,
          error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
          },
        },
        message
      );
    } else if (error) {
      const sanitized = redactSensitiveData(error);
      this.logger.error({ ...context, ...sanitized }, message);
    } else {
      this.logger.error(context, message);
    }
  }

  warn(message: string, data?: any) {
    const context = this.getContext();
    if (data) {
      const sanitized = redactSensitiveData(data);
      this.logger.warn({ ...context, ...sanitized }, message);
    } else {
      this.logger.warn(context, message);
    }
  }

  debug(message: string, data?: any) {
    const context = this.getContext();
    if (data) {
      const sanitized = redactSensitiveData(data);
      this.logger.debug({ ...context, ...sanitized }, message);
    } else {
      this.logger.debug(context, message);
    }
  }

  trace(message: string, data?: any) {
    const context = this.getContext();
    if (data) {
      const sanitized = redactSensitiveData(data);
      this.logger.trace({ ...context, ...sanitized }, message);
    } else {
      this.logger.trace(context, message);
    }
  }
}

// Global logger instance
export const logger = new ContextLogger(pinoLogger);

// Utility to get or create request ID
export function getRequestId(): string {
  return requestIdStorage.getStore() || '';
}

// Utility to set request ID in async context
export function setRequestId(id: string): void {
  requestIdStorage.run(id, () => {
    // Context is set for async operations in this scope
  });
}

// Utility to run code with a specific request ID
export function withRequestId<T>(id: string, fn: () => T): T {
  return requestIdStorage.run(id, fn);
}

// Convenience export for Pino logger for advanced usage
export { pinoLogger, PinoLogger };
