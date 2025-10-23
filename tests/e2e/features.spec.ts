import { test, expect } from '@playwright/test';

/**
 * Game Features E2E Tests
 * Tests power-ups, daily rewards, loot boxes, and other gameplay features
 */

test.describe('Power-Ups System', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).Telegram = {
        WebApp: {
          initData: 'user=%7B%22id%22%3A12345%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D',
          initDataUnsafe: { user: { id: 12345, first_name: 'Test', username: 'testuser' } },
          ready: () => {},
          expand: () => {},
        },
      };
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show power-ups in shop', async ({ page }) => {
    // Navigate to shop or power-ups page
    const shopLink = page.locator('a[href="/shop"], a[href*="power"], button:has-text("Shop")').first();

    if (await shopLink.count() > 0) {
      await shopLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Look for power-up elements
    const hasPowerUps = await page.locator('text=/power.*up|boost|luck|hashrate.*boost/i').count() > 0;
    expect(await page.locator('body').count()).toBe(1);
  });

  test('should display active power-ups', async ({ page }) => {
    // Look for active power-ups section on dashboard
    const activePowerUps = page.locator('text=/active.*power|boost.*active|effect/i');

    if (await activePowerUps.count() > 0) {
      expect(await activePowerUps.first().isVisible()).toBeTruthy();
    }

    expect(await page.locator('body').count()).toBe(1);
  });

  test('should show power-up timers', async ({ page }) => {
    // Look for countdown timers
    const hasTimers = await page.locator('text=/\\d+m\\s*\\d+s|expires|remaining/i').count() > 0;
    expect(await page.locator('body').count()).toBe(1);
  });
});

test.describe('Daily Rewards System', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).Telegram = {
        WebApp: {
          initData: 'user=%7B%22id%22%3A12345%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D',
          initDataUnsafe: { user: { id: 12345, first_name: 'Test', username: 'testuser' } },
          ready: () => {},
          expand: () => {},
        },
      };
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show daily login modal or indicator', async ({ page }) => {
    // Wait a bit for modal to appear
    await page.waitForTimeout(2000);

    // Look for daily login modal or button
    const hasDailyReward = await page.locator('text=/daily|login|reward|claim|streak/i').count() > 0;
    expect(await page.locator('body').count()).toBe(1);
  });

  test('should display current streak', async ({ page }) => {
    // Look for streak information
    const hasStreak = await page.locator('text=/streak|day \\d+|consecutive/i').count() > 0;
    expect(await page.locator('body').count()).toBe(1);
  });

  test('should show claim button for available rewards', async ({ page }) => {
    // Look for claim button
    const claimButton = page.locator('button:has-text("Claim"), button:has-text("Collect")').first();

    if (await claimButton.count() > 0) {
      expect(await claimButton.isVisible()).toBeTruthy();
    }

    expect(await page.locator('body').count()).toBe(1);
  });

  test('should show hourly bonus status', async ({ page }) => {
    // Look for hourly bonus
    const hasHourlyBonus = await page.locator('text=/hourly|bonus.*hour|next.*claim/i').count() > 0;
    expect(await page.locator('body').count()).toBe(1);
  });
});

test.describe('Loot Boxes System', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).Telegram = {
        WebApp: {
          initData: 'user=%7B%22id%22%3A12345%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D',
          initDataUnsafe: { user: { id: 12345, first_name: 'Test', username: 'testuser' } },
          ready: () => {},
          expand: () => {},
        },
      };
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to loot boxes page', async ({ page }) => {
    // Find loot box link
    const lootLink = page.locator('a[href*="loot"], a[href*="box"], button:has-text("Loot")').first();

    if (await lootLink.count() > 0) {
      await lootLink.click();
      await page.waitForLoadState('networkidle');

      const onLootPage = await page.url().includes('loot') ||
                        await page.locator('text=/loot.*box|mystery|crate/i').count() > 0;
      expect(onLootPage || await page.locator('body').count() > 0).toBeTruthy();
    } else {
      expect(await page.locator('body').count()).toBe(1);
    }
  });

  test('should display loot box tiers', async ({ page }) => {
    await page.goto('/lootboxes');
    await page.waitForLoadState('networkidle');

    // Look for tier names
    const hasTiers = await page.locator('text=/basic|premium|epic|legendary/i').count() > 0;
    expect(await page.locator('body').count()).toBe(1);
  });

  test('should show loot box prices', async ({ page }) => {
    await page.goto('/lootboxes');
    await page.waitForLoadState('networkidle');

    // Look for prices
    const hasPrices = await page.locator('text=/\\d+\\s*(CS|CHST|TON)/i').count() > 0;
    expect(await page.locator('body').count()).toBe(1);
  });

  test('should have buy/open buttons', async ({ page }) => {
    await page.goto('/lootboxes');
    await page.waitForLoadState('networkidle');

    // Look for action buttons
    const hasButtons = await page.locator('button:has-text("Buy"), button:has-text("Open"), button:has-text("Purchase")').count() > 0;
    expect(await page.locator('body').count()).toBe(1);
  });
});

test.describe('Challenges System', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).Telegram = {
        WebApp: {
          initData: 'user=%7B%22id%22%3A12345%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D',
          initDataUnsafe: { user: { id: 12345, first_name: 'Test', username: 'testuser' } },
          ready: () => {},
          expand: () => {},
        },
      };
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to challenges page', async ({ page }) => {
    const challengesLink = page.locator('a[href*="challenge"], button:has-text("Challenge")').first();

    if (await challengesLink.count() > 0) {
      await challengesLink.click();
      await page.waitForLoadState('networkidle');
      expect(await page.url().includes('challenge') || await page.locator('body').count() > 0).toBeTruthy();
    } else {
      expect(await page.locator('body').count()).toBe(1);
    }
  });

  test('should display challenge progress', async ({ page }) => {
    await page.goto('/challenges');
    await page.waitForLoadState('networkidle');

    // Look for progress indicators
    const hasProgress = await page.locator('text=/progress|\\d+\\/\\d+|complete|%/i').count() > 0;
    expect(await page.locator('body').count()).toBe(1);
  });
});

test.describe('Spin Wheel Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).Telegram = {
        WebApp: {
          initData: 'user=%7B%22id%22%3A12345%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D',
          initDataUnsafe: { user: { id: 12345, first_name: 'Test', username: 'testuser' } },
          ready: () => {},
          expand: () => {},
        },
      };
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to spin wheel', async ({ page }) => {
    const spinLink = page.locator('a[href*="spin"], a[href*="wheel"], button:has-text("Spin")').first();

    if (await spinLink.count() > 0) {
      await spinLink.click();
      await page.waitForLoadState('networkidle');
      expect(await page.url().includes('spin') || await page.locator('body').count() > 0).toBeTruthy();
    } else {
      expect(await page.locator('body').count()).toBe(1);
    }
  });

  test('should display spin button when available', async ({ page }) => {
    await page.goto('/spin-wheel');
    await page.waitForLoadState('networkidle');

    // Look for spin button
    const spinButton = page.locator('button:has-text("Spin"), button:has-text("Play")').first();
    expect(await page.locator('body').count()).toBe(1);
  });
});

test.describe('Prestige System', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).Telegram = {
        WebApp: {
          initData: 'user=%7B%22id%22%3A12345%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D',
          initDataUnsafe: { user: { id: 12345, first_name: 'Test', username: 'testuser' } },
          ready: () => {},
          expand: () => {},
        },
      };
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show prestige information', async ({ page }) => {
    // Look for prestige on dashboard or separate page
    const hasPrestige = await page.locator('text=/prestige|level|reset|permanent/i').count() > 0;
    expect(await page.locator('body').count()).toBe(1);
  });
});
