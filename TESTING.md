# Testing Documentation

## Overview

This project includes a comprehensive automated test suite with three layers of testing:

1. **Unit Tests** - Test individual functions and calculations
2. **Integration Tests** - Test API endpoints with real database operations
3. **E2E Tests** - Test complete user flows in actual browser

## Running Tests

### All Tests
```bash
npm run test:all
```

### Individual Test Suites
```bash
npm run test:unit           # Run unit tests only
npm run test:integration    # Run integration tests only
npm run test:e2e           # Run E2E tests only
```

### Watch Mode
```bash
npm run test:watch         # Re-run tests on file changes
```

### Coverage Report
```bash
npm run test:coverage      # Generate coverage report
```

## Test Structure

```
tests/
├── e2e/                    # Playwright E2E tests
│   ├── auth.spec.ts       # User authentication tests
│   └── shop.spec.ts       # Equipment shop tests
│
├── integration/           # API integration tests
│   ├── health.test.ts     # Health check endpoints
│   ├── user.test.ts       # User management endpoints
│   └── routes.test.ts     # Modular routing system tests
│
├── unit/                  # Unit tests
│   ├── mining-calculations.test.ts
│   └── economy-calculations.test.ts
│
└── server/               # Server-side integration tests
    └── routes.test.ts     # Route registration and accessibility
```

### Modular Routing System Tests

The modular routing system includes dedicated tests to ensure:

1. **Route Registration**: All modules are properly registered via `registerModularRoutes()`
2. **Endpoint Accessibility**: Each route responds correctly (200/401/404 as expected)
3. **Authentication**: Protected routes properly require authentication
4. **Database Integration**: Routes work with real database operations
5. **Error Handling**: Proper error responses and logging

#### Running Route Tests
```bash
# Test modular routing system specifically
node server/test/routes.test.ts

# Or run with timeout to prevent hanging
timeout 30s node server/test/routes.test.ts
```

#### Route Coverage Verification

The test verifies coverage of all migrated route modules:
- ✅ Health checks → health.routes.ts
- ✅ Authentication → auth.routes.ts  
- ✅ User profile → user.routes.ts
- ✅ User management → userManagement.routes.ts
- ✅ Admin panel → admin.routes.ts (18 routes)
- ✅ Social features → social.routes.ts
- ✅ Mining → mining.routes.ts
- ✅ Equipment → equipment.routes.ts
- ✅ Statistics → statistics.routes.ts
- ✅ Shop → shop.routes.ts
- ✅ Component upgrades → components.routes.ts
- ✅ Blocks → blocks.routes.ts
- ✅ Packs → packs.routes.ts
- ✅ Power-ups → powerups.routes.ts
- ✅ Prestige → prestige.routes.ts
- ✅ Subscriptions → subscriptions.routes.ts
- ✅ Daily login → dailyLogin.routes.ts
- ✅ Announcements → announcements.routes.ts
- ✅ Promo codes → promoCodes.routes.ts
- ✅ Analytics → analytics.routes.ts
- ✅ Events → events.routes.ts
- ✅ Economy → economy.routes.ts
- ✅ Segmentation → segmentation.routes.ts
- ✅ Gamification → gamification.routes.ts
- ✅ API aliases → api-aliases.ts
├── fixtures/              # Test data fixtures
│   ├── users.ts
│   ├── equipment.ts
│   ├── blocks.ts
│   └── powerups.ts
│
└── helpers/               # Test utilities
    ├── test-db.ts         # Database setup/teardown
    ├── test-server.ts     # Test server management
    ├── api-helpers.ts     # API request helpers
    └── mock-telegram.ts   # Telegram WebApp mocking
```

## Writing Tests

### Unit Tests

Unit tests verify individual functions in isolation:

```typescript
import { describe, it, expect } from 'vitest';

describe('calculateHashrateShare', () => {
  it('should return correct percentage', () => {
    const userHashrate = 100;
    const totalNetworkHashrate = 1000;
    const share = userHashrate / totalNetworkHashrate;

    expect(share).toBe(0.1); // 10%
  });
});
```

### Integration Tests

Integration tests verify API endpoints with real database:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { startTestServer, stopTestServer } from '../helpers/test-server.js';
import { createTestUser } from '../helpers/api-helpers.js';
import { resetTestDatabase } from '../helpers/test-db.js';

describe('User Endpoints', () => {
  let app;

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

  it('should create a new user', async () => {
    const user = await createTestUser();
    expect(user).toHaveProperty('id');
  });
});
```

### E2E Tests

E2E tests simulate real user interactions in browser:

```typescript
import { test, expect } from '@playwright/test';
import { setupTelegramMock, mockTelegramUser } from '../helpers/mock-telegram.js';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await setupTelegramMock(page, mockTelegramUser({ id: 12345 }));
  });

  test('should initialize new user', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=/CS|Balance/i')).toBeVisible();
  });
});
```

## Adding New Tests

### Adding Unit Tests

1. Create new file in `tests/unit/`
2. Import test framework: `import { describe, it, expect } from 'vitest'`
3. Write test cases for your functions
4. Follow existing naming patterns

### Adding Integration Tests

1. Create new file in `tests/integration/`
2. Import test helpers: `startTestServer`, `createTestUser`, etc.
3. Setup/teardown test server and database
4. Test API endpoints with supertest
5. Verify responses and database state

### Adding E2E Tests

1. Create new file in `tests/e2e/` with `.spec.ts` extension
2. Import Playwright test framework
3. Setup Telegram mock in `beforeEach`
4. Write user journey tests
5. Use page interactions: `page.goto()`, `page.click()`, etc.

## Test Helpers

### Database Helpers

```typescript
import { resetTestDatabase, setupTestDatabase } from '../helpers/test-db.js';

// Reset database between tests
await resetTestDatabase();

// Setup fresh database
await setupTestDatabase();
```

### API Helpers

```typescript
import {
  createTestUser,
  setUserBalance,
  purchaseTestEquipment
} from '../helpers/api-helpers.js';

// Create test user
const user = await createTestUser({ csBalance: 50000 });

// Set user balance
await setUserBalance(user.id, 100000, 1000);

// Purchase equipment
await purchaseTestEquipment(user.id, 'equipment-id');
```

### Telegram Mocking

```typescript
import { setupTelegramMock, mockTelegramUser } from '../helpers/mock-telegram.js';

// Mock Telegram environment in E2E tests
await setupTelegramMock(page, mockTelegramUser({
  id: 12345,
  username: 'testuser'
}));
```

## Continuous Integration

Tests run automatically on GitHub Actions for:
- Every push to `main` or `develop` branches
- Every pull request
- Manual workflow dispatch

### CI Pipeline

1. Setup PostgreSQL test database (free service container)
2. Install dependencies
3. Run database migrations
4. Run unit tests
5. Run integration tests
6. Install Playwright browsers
7. Run E2E tests
8. Upload test artifacts on failure

See `.github/workflows/test.yml` for full configuration.

## Test Database

Tests use a separate PostgreSQL database specified in `.env.test`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/crypto_hacker_test
```

**Important:** Always use test database URL with "test" in the name to prevent accidentally running tests against production.

## Debugging Tests

### Debug Unit/Integration Tests

```bash
# Run specific test file
npx vitest tests/unit/mining-calculations.test.ts

# Run tests matching pattern
npx vitest --grep "calculateHashrateShare"
```

### Debug E2E Tests

```bash
# Run with visible browser (headed mode)
npx playwright test --headed

# Debug specific test
npx playwright test tests/e2e/auth.spec.ts --debug

# Run Playwright UI mode
npx playwright test --ui
```

### View Test Reports

```bash
# View Playwright HTML report
npx playwright show-report

# View coverage report
npm run test:coverage
open coverage/index.html
```

## Best Practices

1. **Keep tests focused** - Each test should verify one behavior
2. **Use descriptive names** - Test names should explain what is being tested
3. **Reset state** - Always reset database between tests
4. **Mock external dependencies** - Mock Telegram, TON blockchain, etc.
5. **Test edge cases** - Insufficient balance, network errors, etc.
6. **Avoid flaky tests** - Use proper waits, not arbitrary timeouts
7. **Keep tests fast** - Unit tests should run in milliseconds
8. **Document complex tests** - Add comments explaining non-obvious logic

## Troubleshooting

### "Database connection failed"

Ensure PostgreSQL is running and DATABASE_URL in `.env.test` is correct.

### "Port already in use"

Stop any running dev servers before running tests, or change TEST_PORT in test-server.ts.

### "Playwright browser not found"

Run: `npx playwright install chromium`

### Tests pass locally but fail in CI

Check environment variables are set correctly in `.github/workflows/test.yml`.

### Flaky E2E tests

- Use `page.waitForLoadState('networkidle')` instead of arbitrary timeouts
- Use `waitForSelector` with proper timeouts
- Check for race conditions in test setup

## Expanding Test Coverage

The test suite includes foundational examples. To expand coverage:

1. **Add more unit tests** for calculation functions in:
   - Equipment upgrade calculations
   - Power-up expiration logic
   - Loot box probability distributions
   - Validation functions

2. **Add more integration tests** for endpoints:
   - Mining operations
   - Equipment purchases
   - Power-up activation
   - Social features (referrals, leaderboard)
   - Gamification (achievements, challenges)
   - Admin operations

3. **Add more E2E tests** for user flows:
   - Complete mining flow
   - Equipment upgrade flow
   - Power-ups usage
   - Daily/hourly rewards
   - Referral system
   - TON wallet integration

Follow the patterns established in existing tests for consistency.
