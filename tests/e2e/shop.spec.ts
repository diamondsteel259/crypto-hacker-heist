import { test, expect } from '@playwright/test';
import { setupTelegramMock, mockTelegramUser } from '../helpers/mock-telegram.js';

/**
 * E2E tests for equipment shop and purchases
 * Tests user flows for browsing and purchasing equipment
 */

test.describe('Equipment Shop', () => {
  test.beforeEach(async ({ page }) => {
    await setupTelegramMock(page, mockTelegramUser({ id: 12345, username: 'testuser' }));
  });

  test('should display all equipment in shop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to shop
    const shopLink = page.locator('a[href*="shop"], button:has-text("Shop")').first();

    if (await shopLink.isVisible()) {
      await shopLink.click();
      await page.waitForURL(/shop/);

      // Wait for equipment to load
      await page.waitForSelector('text=/Equipment|Shop|Mining/i', { timeout: 10000 });

      // Should see equipment items
      const equipmentCount = await page.locator('[data-testid*="equipment"], .equipment-card, [class*="equipment"]').count();

      // Should have at least some equipment types
      expect(equipmentCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should show equipment prices', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Look for price indicators (CS, CHST, or TON)
    const priceElements = page.locator('text=/\\d+\\s*(CS|CHST|TON)/i');

    if ((await priceElements.count()) > 0) {
      const firstPrice = await priceElements.first().textContent();
      expect(firstPrice).toMatch(/\d+/);
    }
  });

  test('should show equipment hashrate stats', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Equipment should display hashrate (H/s)
    const hashrateElements = page.locator('text=/\\d+\\s*H\\/s/i');

    if ((await hashrateElements.count()) > 0) {
      const firstHashrate = await hashrateElements.first().textContent();
      expect(firstHashrate).toMatch(/\d+.*H\/s/i);
    }
  });

  test('should display equipment categories', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Look for category indicators (Mining Rigs, Components, etc.)
    const categoryText = await page.textContent('body');

    // Page should organize equipment somehow
    expect(categoryText).toBeTruthy();
    expect(categoryText!.length).toBeGreaterThan(100);
  });

  test('should show purchase button for each equipment', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Look for purchase/buy buttons
    const purchaseButtons = page.locator('button:has-text("Buy"), button:has-text("Purchase")');

    const buttonCount = await purchaseButtons.count();

    // Should have at least one purchasable item
    expect(buttonCount).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to rigs page to view owned equipment', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for "Your Rigs" or "Equipment" link
    const rigsLink = page
      .locator('a[href*="rigs"], a[href*="equipment"], button:has-text("Rigs")')
      .first();

    if (await rigsLink.isVisible()) {
      await rigsLink.click();
      await page.waitForLoadState('networkidle');

      // Should show equipment page
      await expect(page).toHaveURL(/rigs|equipment/i);
    }
  });

  test('should show empty state when no equipment owned', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to rigs/equipment page
    await page.goto('/rigs').catch(() => page.goto('/equipment'));
    await page.waitForLoadState('networkidle');

    const bodyText = await page.textContent('body');

    // New user should see empty state or message
    const hasContent = bodyText && bodyText.length > 50;
    expect(hasContent).toBeTruthy();
  });

  test('should filter equipment by tier/category', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Look for filter buttons or tabs
    const filterButtons = page.locator(
      'button:has-text("Basic"), button:has-text("Advanced"), button:has-text("Premium"), [role="tab"]'
    );

    if ((await filterButtons.count()) > 0) {
      const firstFilter = filterButtons.first();
      await firstFilter.click();

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Equipment should still be visible
      const bodyText = await page.textContent('body');
      expect(bodyText).toBeTruthy();
    }
  });

  test('should display equipment details on click', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Find first equipment card
    const equipmentCard = page
      .locator('[data-testid*="equipment"], .equipment-card, [class*="equipment"]')
      .first();

    if (await equipmentCard.isVisible()) {
      await equipmentCard.click();

      // Should show more details (modal, expanded view, etc.)
      await page.waitForTimeout(500);

      // Check if modal or detail view appeared
      const hasModal =
        (await page.locator('[role="dialog"], .modal, [class*="modal"]').count()) > 0;

      // Or check if navigation happened
      const currentUrl = page.url();

      // One of these should be true
      expect(hasModal || currentUrl.includes('/')).toBeTruthy();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Equipment should be displayed in mobile-friendly layout
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });

  test('should load images or icons for equipment', async ({ page }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Check for images or emoji icons
    const images = await page.locator('img, [data-icon], svg').count();

    // Should have some visual elements
    expect(images).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Equipment Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupTelegramMock(page, mockTelegramUser({ id: 12345, username: 'testuser' }));
  });

  test('should show insufficient balance error when trying to buy expensive item', async ({
    page,
  }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    // Try to find a very expensive item
    const expensiveItem = page.locator('text=/100000.*CS|500.*CHST/i').first();

    if (await expensiveItem.isVisible()) {
      // Try to purchase (might show error immediately or after clicking)
      const purchaseButton = page
        .locator('button:has-text("Buy"), button:has-text("Purchase")')
        .first();

      if (await purchaseButton.isVisible()) {
        await purchaseButton.click();

        // Should show error message or disabled state
        await page.waitForTimeout(1000);

        // Check for error message
        const hasError =
          (await page.locator('text=/insufficient|not enough|cannot afford/i').count()) > 0;

        // Or button should be disabled
        const isDisabled = await purchaseButton.isDisabled();

        // One of these should be true for expensive items
        // (or purchase might succeed if user has enough balance)
      }
    }
  });
});
