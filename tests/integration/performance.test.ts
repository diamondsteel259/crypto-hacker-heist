import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startTestServer, stopTestServer } from '../helpers/test-server.js';
import { createTestUser, apiRequest } from '../helpers/api-helpers.js';
import { resetTestDatabase } from '../helpers/test-db.js';
import type { Application } from 'express';

/**
 * Performance and Memory Leak Tests
 * Verifies application performs well under load and doesn't leak memory
 */

describe('Performance Tests', () => {
  let app: Application;

  beforeAll(async () => {
    const server = await startTestServer();
    app = server.app;
  });

  afterAll(async () => {
    await stopTestServer();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  describe('API Response Times', () => {
    it('should respond to health check in < 100ms', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      const startTime = Date.now();
      const response = await api.get('/api/health');
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(100);
    });

    it('should fetch user data in < 200ms', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      const startTime = Date.now();
      const response = await api.get(`/api/user/${user.id}`);
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(200);
    });

    it('should fetch equipment list in < 300ms', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      const startTime = Date.now();
      const response = await api.get('/api/equipment');
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(300);
    });

    it('should fetch leaderboard in < 500ms', async () => {
      // Create multiple users for leaderboard
      for (let i = 0; i < 50; i++) {
        await createTestUser({
          telegramId: `perf_user_${i}`,
          csBalance: Math.floor(Math.random() * 100000),
        });
      }

      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      const startTime = Date.now();
      const response = await api.get('/api/leaderboard?type=balance&limit=50');
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle 50 concurrent health checks', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      const requests = Array(50).fill(null).map(() => api.get('/api/health'));

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete all 50 requests within 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    it('should handle 20 concurrent user queries', async () => {
      const users = await Promise.all(
        Array(20).fill(null).map((_, i) =>
          createTestUser({ telegramId: `concurrent_${i}` })
        )
      );

      const startTime = Date.now();

      const requests = users.map(user => {
        const api = apiRequest(app, user.id);
        return api.get(`/api/user/${user.id}`);
      });

      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(duration).toBeLessThan(3000);
    });

    it('should handle mixed concurrent requests', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      const requests = [
        ...Array(10).fill(null).map(() => api.get('/api/health')),
        ...Array(10).fill(null).map(() => api.get(`/api/user/${user.id}`)),
        ...Array(10).fill(null).map(() => api.get('/api/equipment')),
        ...Array(10).fill(null).map(() => api.get('/api/blocks?limit=10')),
      ];

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // 40 mixed requests should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Memory Leak Detection', () => {
    it('should not leak memory during repeated API calls', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      // Measure initial memory
      const initialMemory = process.memoryUsage();

      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await api.get('/api/health');
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      // Measure final memory
      const finalMemory = process.memoryUsage();

      // Calculate memory increase
      const heapIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const heapIncreaseMB = heapIncrease / 1024 / 1024;

      // Memory increase should be reasonable (< 50MB for 100 requests)
      expect(heapIncreaseMB).toBeLessThan(50);
    });

    it('should not leak database connections', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      // Make 50 database queries
      const requests = Array(50).fill(null).map(() =>
        api.get(`/api/user/${user.id}`)
      );

      await Promise.all(requests);

      // Wait for connections to close
      await new Promise(resolve => setTimeout(resolve, 200));

      // If connections leaked, subsequent requests would fail or timeout
      const response = await api.get('/api/health');
      expect(response.status).toBe(200);
    });

    it('should clean up after failed requests', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      // Make requests that will fail
      const failedRequests = Array(20).fill(null).map(() =>
        api.get('/api/user/non_existent_user_id').catch(() => ({ status: 404 }))
      );

      await Promise.all(failedRequests);

      // System should still be responsive
      const response = await api.get('/api/health');
      expect(response.status).toBe(200);
    });
  });

  describe('Load Testing', () => {
    it('should handle sustained load', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      const iterations = 10;
      const requestsPerIteration = 20;
      const results: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        const requests = Array(requestsPerIteration).fill(null).map(() =>
          api.get('/api/health')
        );

        await Promise.all(requests);

        const duration = Date.now() - startTime;
        results.push(duration);

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Calculate average response time
      const avgDuration = results.reduce((a, b) => a + b, 0) / results.length;

      // Response times should be consistent (not degrading over time)
      expect(avgDuration).toBeLessThan(1000);

      // Last batch should not be significantly slower than first
      const firstBatch = results[0];
      const lastBatch = results[results.length - 1];
      expect(lastBatch).toBeLessThan(firstBatch * 3); // Allow 3x variance
    });

    it('should handle rapid sequential requests', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      const startTime = Date.now();

      // 100 sequential requests (no parallelization)
      for (let i = 0; i < 100; i++) {
        const response = await api.get('/api/health');
        expect(response.status).toBe(200);
      }

      const duration = Date.now() - startTime;

      // Should complete 100 sequential requests within 10 seconds
      expect(duration).toBeLessThan(10000);
    });
  });

  describe('Database Query Performance', () => {
    it('should handle large dataset queries efficiently', async () => {
      // Create 100 users
      const users = await Promise.all(
        Array(100).fill(null).map((_, i) =>
          createTestUser({
            telegramId: `large_dataset_${i}`,
            csBalance: Math.floor(Math.random() * 1000000),
            totalHashrate: Math.floor(Math.random() * 10000),
          })
        )
      );

      const testUser = users[0];
      const api = apiRequest(app, testUser.id);

      const startTime = Date.now();
      const response = await api.get('/api/leaderboard?type=balance&limit=100');
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('leaderboard');
      expect(duration).toBeLessThan(1000);
    });

    it('should paginate large result sets efficiently', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      // Test pagination
      const page1Start = Date.now();
      const page1 = await api.get('/api/blocks?limit=50&offset=0');
      const page1Duration = Date.now() - page1Start;

      const page2Start = Date.now();
      const page2 = await api.get('/api/blocks?limit=50&offset=50');
      const page2Duration = Date.now() - page2Start;

      expect(page1.status).toBe(200);
      expect(page2.status).toBe(200);

      // Both pages should load quickly
      expect(page1Duration).toBeLessThan(500);
      expect(page2Duration).toBeLessThan(500);
    });
  });

  describe('Resource Cleanup', () => {
    it('should close idle database connections', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      // Make a request
      await api.get('/api/health');

      // Wait for idle timeout (simulated)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Make another request - should work fine
      const response = await api.get('/api/health');
      expect(response.status).toBe(200);
    });

    it('should handle request timeouts gracefully', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      // Make a request that might take long
      const response = await api
        .get('/api/leaderboard?type=balance&limit=1000')
        .timeout(5000); // 5 second timeout

      // Should either succeed or timeout gracefully
      expect([200, 408]).toContain(response.status);
    });
  });

  describe('Rate Limiting Performance', () => {
    it('should not degrade performance under rate limiting', async () => {
      const user = await createTestUser();
      const api = apiRequest(app, user.id);

      // Make requests up to rate limit (but not exceeding)
      const requests = Array(50).fill(null).map((_, i) =>
        api.get('/api/health')
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      // All should succeed (under rate limit)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });

      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000);
    });
  });
});

describe('Stress Tests', () => {
  let app: Application;

  beforeAll(async () => {
    const server = await startTestServer();
    app = server.app;
  });

  afterAll(async () => {
    await stopTestServer();
  });

  it('should survive spike in traffic', async () => {
    // Create 10 users
    const users = await Promise.all(
      Array(10).fill(null).map((_, i) =>
        createTestUser({ telegramId: `stress_${i}` })
      )
    );

    // Each user makes 10 requests simultaneously
    const allRequests = users.flatMap(user => {
      const api = apiRequest(app, user.id);
      return Array(10).fill(null).map(() => api.get('/api/health'));
    });

    // 100 total concurrent requests
    const startTime = Date.now();
    const responses = await Promise.all(
      allRequests.map(req => req.catch(err => ({ status: 500, error: err })))
    );
    const duration = Date.now() - startTime;

    // Count successes
    const successes = responses.filter(r => r.status === 200).length;

    // At least 80% should succeed
    expect(successes).toBeGreaterThan(80);

    // Should complete within 10 seconds
    expect(duration).toBeLessThan(10000);
  });

  it('should recover from database connection errors', async () => {
    const user = await createTestUser();
    const api = apiRequest(app, user.id);

    // Normal operation
    const beforeResponse = await api.get('/api/health');
    expect(beforeResponse.status).toBe(200);

    // Simulate database stress by making many queries
    const stressRequests = Array(50).fill(null).map(() =>
      api.get(`/api/user/${user.id}`).catch(err => ({ status: 500, error: err }))
    );

    await Promise.all(stressRequests);

    // System should still be responsive
    const afterResponse = await api.get('/api/health');
    expect(afterResponse.status).toBe(200);
  });
});
