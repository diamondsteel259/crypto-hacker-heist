import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { startTestServer, stopTestServer } from '../helpers/test-server.js';
import type { Application } from 'express';

/**
 * Integration tests for health check endpoints
 * Tests API endpoints with real database operations
 */

describe('Health Endpoints', () => {
  let app: Application;
  let request: supertest.SuperTest<supertest.Test>;

  beforeAll(async () => {
    const server = await startTestServer();
    app = server.app;
    request = supertest(app);
  });

  afterAll(async () => {
    await stopTestServer();
  });

  describe('GET /healthz', () => {
    it('should return 200 with ok status', async () => {
      const response = await request.get('/healthz');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ok');
      expect(response.body.ok).toBe(true);
    });
  });

  describe('GET /api/health', () => {
    it('should return 200 with healthy status', async () => {
      const response = await request.get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toBe('connected');
    });

    it('should include timestamp in response', async () => {
      const response = await request.get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('timestamp');
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should respond quickly (< 500ms)', async () => {
      const startTime = Date.now();
      await request.get('/api/health');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(500);
    });
  });

  describe('GET /api/health/mining', () => {
    it('should return mining service health status', async () => {
      const response = await request.get('/api/health/mining');

      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
    });

    it('should have required properties', async () => {
      const response = await request.get('/api/health/mining');

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('lastSuccessfulMine');
      expect(response.body).toHaveProperty('consecutiveFailures');
    });

    it('should work even when mining is paused', async () => {
      // Try to pause mining (might not have admin access, but endpoint should still respond)
      await request.post('/api/admin/mining/pause').send();

      const response = await request.get('/api/health/mining');

      // Should always respond, even if mining is paused
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Health check reliability', () => {
    it('should handle multiple concurrent health checks', async () => {
      const requests = Array(10)
        .fill(null)
        .map(() => request.get('/api/health'));

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('healthy');
      });
    });

    it('should not be rate limited', async () => {
      // Health endpoints should be excluded from rate limiting
      const requests = Array(50)
        .fill(null)
        .map(() => request.get('/api/health'));

      const responses = await Promise.all(requests);

      // All should succeed, none should be rate limited (429)
      responses.forEach((response) => {
        expect(response.status).not.toBe(429);
      });
    });
  });
});
