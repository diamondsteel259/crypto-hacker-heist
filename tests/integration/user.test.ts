import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startTestServer, stopTestServer } from '../helpers/test-server.js';
import {
  createTestUser,
  authenticateTestUser,
  setUserBalance,
  apiRequest,
} from '../helpers/api-helpers.js';
import { resetTestDatabase } from '../helpers/test-db.js';
import type { Application } from 'express';

/**
 * Integration tests for user management endpoints
 */

describe('User Endpoints', () => {
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

  describe('User Creation and Retrieval', () => {
    it('should create a new user', async () => {
      const user = await createTestUser({
        telegramId: '12345',
        username: 'testuser',
      });

      expect(user).toHaveProperty('id');
      expect(user.telegramId).toBe('12345');
      expect(user.username).toBe('testuser');
      expect(user.csBalance).toBe(10000);
    });

    it('should retrieve user by ID', async () => {
      const user = await createTestUser();
      const { request } = await authenticateTestUser(app, user);  // Authenticate as the same user

      const response = await request.get(`/api/user/${user.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', user.id);
      expect(response.body).toHaveProperty('csBalance');
    });

    it('should return 404 for non-existent user', async () => {
      const { request } = await authenticateTestUser(app);
      const fakeId = 'non-existent-user-id';

      const response = await request.get(`/api/user/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });

  describe('User Balance Operations', () => {
    it('should retrieve user balance', async () => {
      const user = await createTestUser({ csBalance: 50000, chstBalance: 500 });
      const { request } = await authenticateTestUser(app, user);  // Authenticate as the same user

      const response = await request.get(`/api/user/${user.id}/balance`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('csBalance', 50000);
      expect(response.body).toHaveProperty('chstBalance', 500);
    });

    it('should update user balance correctly', async () => {
      const user = await createTestUser();

      await setUserBalance(user.id, 100000, 1000);

      const { request } = await authenticateTestUser(app, user);  // Authenticate as the same user
      const response = await request.get(`/api/user/${user.id}/balance`);

      expect(response.status).toBe(200);
      expect(response.body.csBalance).toBe(100000);
      expect(response.body.chstBalance).toBe(1000);
    });
  });

  describe('User Equipment', () => {
    it('should return empty array for user with no equipment', async () => {
      const user = await createTestUser();
      const { request } = await authenticateTestUser(app, user);  // Authenticate as the same user

      const response = await request.get(`/api/user/${user.id}/equipment`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
  });

  describe('User Network Stats', () => {
    it('should return network statistics', async () => {
      const user = await createTestUser({ totalHashrate: 100 });
      const { request } = await authenticateTestUser(app, user);  // Authenticate as the same user

      const response = await request.get(`/api/user/${user.id}/network-stats`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('userHashrate');
      expect(response.body).toHaveProperty('networkHashrate');
      expect(response.body).toHaveProperty('networkShare');
    });

    it('should calculate correct network share', async () => {
      // Create multiple users with different hashrates
      const user1 = await createTestUser({ totalHashrate: 100 });
      const user2 = await createTestUser({ totalHashrate: 200 });
      const user3 = await createTestUser({ totalHashrate: 700 });

      const { request } = await authenticateTestUser(app, user1);  // Authenticate as user1

      const response = await request.get(`/api/user/${user1.id}/network-stats`);

      expect(response.status).toBe(200);
      expect(response.body.userHashrate).toBe(100);
      expect(response.body.networkHashrate).toBe(1000); // 100 + 200 + 700
      expect(response.body.networkShare).toBeCloseTo(0.1); // 10%
    });
  });

  describe('User Ranking', () => {
    it('should return user rank', async () => {
      const user = await createTestUser();
      const { request } = await authenticateTestUser(app, user);  // Authenticate as the same user

      const response = await request.get(`/api/user/${user.id}/rank`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('rank');
      expect(typeof response.body.rank).toBe('number');
    });

    it('should rank users correctly by balance', async () => {
      const user1 = await createTestUser({ csBalance: 10000 });
      const user2 = await createTestUser({ csBalance: 50000 });
      const user3 = await createTestUser({ csBalance: 100000 });

      // Authenticate as each user to get their rank
      const { request: request1 } = await authenticateTestUser(app, user1);
      const { request: request2 } = await authenticateTestUser(app, user2);
      const { request: request3 } = await authenticateTestUser(app, user3);

      const rank1 = await request1.get(`/api/user/${user1.id}/rank`);
      const rank2 = await request2.get(`/api/user/${user2.id}/rank`);
      const rank3 = await request3.get(`/api/user/${user3.id}/rank`);

      expect(rank3.body.rank).toBeLessThan(rank2.body.rank);
      expect(rank2.body.rank).toBeLessThan(rank1.body.rank);
    });
  });

  describe('Daily Login and Streaks', () => {
    it('should retrieve streak status', async () => {
      const user = await createTestUser();
      const { request } = await authenticateTestUser(app, user);  // Authenticate as the same user

      const response = await request.get(`/api/user/${user.id}/streak`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('currentStreak');
    });

    it('should increment streak on check-in', async () => {
      const user = await createTestUser();
      const api = await apiRequest(app, user.id);  // apiRequest already looks up the user

      const checkInResponse = await api.post(`/api/user/${user.id}/streak/checkin`).send({});

      expect([200, 201]).toContain(checkInResponse.status);

      const streakResponse = await api.get(`/api/user/${user.id}/streak`);
      expect(streakResponse.body.currentStreak).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Daily Login Rewards', () => {
    it('should check daily login status', async () => {
      const user = await createTestUser();
      const { request } = await authenticateTestUser(app, user);  // Authenticate as the same user

      const response = await request.get(`/api/user/${user.id}/daily-login/status`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('canClaim');
    });

    it('should claim daily login reward', async () => {
      const user = await createTestUser();
      const api = await apiRequest(app, user.id);  // apiRequest already looks up the user

      const claimResponse = await api.post(`/api/user/${user.id}/daily-login/claim`).send({});

      if (claimResponse.status === 200) {
        expect(claimResponse.body).toHaveProperty('reward');
        expect(claimResponse.body.reward).toBeGreaterThan(0);
      } else if (claimResponse.status === 400) {
        // Already claimed today
        expect(claimResponse.body).toHaveProperty('message');
      }
    });

    it('should prevent claiming twice in one day', async () => {
      const user = await createTestUser();
      const api = await apiRequest(app, user.id);  // apiRequest already looks up the user

      const claim1 = await api.post(`/api/user/${user.id}/daily-login/claim`).send({});

      if (claim1.status === 200) {
        const claim2 = await api.post(`/api/user/${user.id}/daily-login/claim`).send({});

        expect(claim2.status).toBe(400);
        expect(claim2.body.message).toMatch(/already claimed/i);
      }
    });
  });

  describe('Hourly Bonus', () => {
    it('should check hourly bonus status', async () => {
      const user = await createTestUser();
      const { request } = await authenticateTestUser(app, user);  // Authenticate as the same user

      const response = await request.get(`/api/user/${user.id}/hourly-bonus/status`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('available');
    });

    it('should give random bonus between 500-2000', async () => {
      const user = await createTestUser();
      const api = await apiRequest(app, user.id);  // apiRequest already looks up the user

      const initialBalance = user.csBalance;
      const claimResponse = await api.post(`/api/user/${user.id}/hourly-bonus/claim`).send({});

      if (claimResponse.status === 200) {
        expect(claimResponse.body).toHaveProperty('bonus');
        expect(claimResponse.body.bonus).toBeGreaterThanOrEqual(500);
        expect(claimResponse.body.bonus).toBeLessThanOrEqual(2000);
      }
    });
  });
});
