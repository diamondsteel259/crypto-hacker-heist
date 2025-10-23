/**
 * Mock Telegram WebApp API for E2E tests
 * This allows testing the app without needing to be inside Telegram
 */

export interface MockTelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface MockTelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: MockTelegramUser;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
}

/**
 * Create mock Telegram user
 */
export function mockTelegramUser(overrides?: Partial<MockTelegramUser>): MockTelegramUser {
  return {
    id: Math.floor(Math.random() * 1000000000),
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser',
    language_code: 'en',
    is_premium: false,
    ...overrides,
  };
}

/**
 * Create mock Telegram init data
 */
export function createMockInitData(userId?: number, username?: string): string {
  const user = mockTelegramUser({
    id: userId || Math.floor(Math.random() * 1000000000),
    username: username || 'testuser',
  });

  const authDate = Math.floor(Date.now() / 1000);
  const userJson = JSON.stringify(user);

  // Simple mock hash (in real Telegram, this would be HMAC-SHA256)
  const hash = Buffer.from(`mock_hash_${userId}_${authDate}`).toString('base64').slice(0, 64);

  return `user=${encodeURIComponent(userJson)}&auth_date=${authDate}&hash=${hash}`;
}

/**
 * Mock Telegram WebApp object to inject into browser window
 */
export function mockTelegramWebApp(user?: MockTelegramUser): MockTelegramWebApp {
  const mockUser = user || mockTelegramUser();
  const authDate = Math.floor(Date.now() / 1000);
  const hash = Buffer.from(`mock_hash_${mockUser.id}_${authDate}`).toString('base64').slice(0, 64);

  return {
    initData: createMockInitData(mockUser.id, mockUser.username),
    initDataUnsafe: {
      user: mockUser,
      auth_date: authDate,
      hash,
    },
    version: '7.0',
    platform: 'web',
    colorScheme: 'light',
    themeParams: {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#2481cc',
      button_color: '#2481cc',
      button_text_color: '#ffffff',
    },
    isExpanded: true,
    viewportHeight: 600,
    viewportStableHeight: 600,
    headerColor: '#ffffff',
    backgroundColor: '#ffffff',
    ready: () => {
      console.log('[Mock Telegram] WebApp ready');
    },
    expand: () => {
      console.log('[Mock Telegram] WebApp expanded');
    },
    close: () => {
      console.log('[Mock Telegram] WebApp closed');
    },
    MainButton: {
      text: 'CONTINUE',
      color: '#2481cc',
      textColor: '#ffffff',
      isVisible: false,
      isActive: true,
      isProgressVisible: false,
      setText: (text: string) => {
        console.log('[Mock Telegram] MainButton text set:', text);
      },
      onClick: (callback: () => void) => {
        console.log('[Mock Telegram] MainButton onClick registered');
      },
      show: () => {
        console.log('[Mock Telegram] MainButton shown');
      },
      hide: () => {
        console.log('[Mock Telegram] MainButton hidden');
      },
      enable: () => {
        console.log('[Mock Telegram] MainButton enabled');
      },
      disable: () => {
        console.log('[Mock Telegram] MainButton disabled');
      },
      showProgress: (leaveActive: boolean) => {
        console.log('[Mock Telegram] MainButton progress shown');
      },
      hideProgress: () => {
        console.log('[Mock Telegram] MainButton progress hidden');
      },
    },
    BackButton: {
      isVisible: false,
      onClick: (callback: () => void) => {
        console.log('[Mock Telegram] BackButton onClick registered');
      },
      show: () => {
        console.log('[Mock Telegram] BackButton shown');
      },
      hide: () => {
        console.log('[Mock Telegram] BackButton hidden');
      },
    },
  };
}

/**
 * Inject mock Telegram WebApp into browser context (for Playwright E2E tests)
 * Call this in page.evaluateOnNewDocument() or page.addInitScript()
 */
export function getInjectTelegramScript(user?: MockTelegramUser): string {
  const webApp = mockTelegramWebApp(user);

  return `
    window.Telegram = {
      WebApp: ${JSON.stringify(webApp, null, 2)}
    };
    console.log('[Mock Telegram] Telegram WebApp injected into page');
  `;
}

/**
 * Setup Telegram mock for Playwright page
 * Usage: await setupTelegramMock(page, { id: 12345, username: 'testuser' })
 */
export async function setupTelegramMock(page: any, user?: MockTelegramUser) {
  await page.addInitScript(getInjectTelegramScript(user));
}
