import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1, // Single worker to avoid database conflicts
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5000',
    headless: isCI,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    port: 5000,
    timeout: 120000,
    reuseExistingServer: !isCI,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crypto_hacker_test',
      BOT_TOKEN: process.env.BOT_TOKEN || 'test_bot_token_12345',
      VITE_DEV_MODE_BYPASS: 'true',
      SESSION_SECRET: 'test_secret_key_for_testing_only',
    },
  },
});
