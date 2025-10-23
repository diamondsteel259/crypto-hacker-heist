/**
 * Telegram WebApp Utilities
 * Provides haptic feedback, back button, and other Telegram mini app features
 */

/**
 * Check if running in Telegram WebApp
 */
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}
