import { apiRequest } from "./queryClient";

const USER_ID_KEY = 'chh_user_id';

export function getCurrentUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function setCurrentUserId(userId: string) {
  localStorage.setItem(USER_ID_KEY, userId);
}

export function clearCurrentUser() {
  localStorage.removeItem(USER_ID_KEY);
}

export function getTelegramInitData(): string | null {
  return window.Telegram?.WebApp.initData || null;
}

export async function authenticateWithTelegram(): Promise<string> {
  const initData = getTelegramInitData();
  
  if (!initData) {
    throw new Error('Telegram init data not available');
  }

  const response = await fetch('/api/auth/telegram', {
    method: 'POST',
    headers: {
      'X-Telegram-Init-Data': initData,
    },
  });

  if (!response.ok) {
    throw new Error('Telegram authentication failed');
  }

  const user = await response.json();
  if (!user.id) {
    throw new Error('Failed to authenticate - no user ID returned');
  }

  setCurrentUserId(user.id);
  return user.id;
}

export async function initializeUser(): Promise<string> {
  // Development mode: Allow testing without Telegram
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_MODE_BYPASS === 'true' && !getTelegramInitData()) {
    console.warn('[DEV MODE] Running without Telegram, using mock user');
    const mockUserId = 'dev_user_' + Math.random().toString(36).substr(2, 9);
    setCurrentUserId(mockUserId);
    return mockUserId;
  }

  let userId = getCurrentUserId();
  
  if (userId) {
    try {
      // include Telegram auth header when validating stored userId
      const initData = getTelegramInitData();
      const response = await fetch(`/api/user/${userId}`, {
        headers: initData ? { 'X-Telegram-Init-Data': initData } : undefined,
      });
      if (response.ok) {
        return userId;
      }
      clearCurrentUser();
      userId = null;
    } catch (error) {
      clearCurrentUser();
      userId = null;
    }
  }
  
  try {
    userId = await authenticateWithTelegram();
    return userId;
  } catch (error) {
    console.error('Telegram authentication failed:', error);
    throw new Error('Please open this app in Telegram');
  }
}