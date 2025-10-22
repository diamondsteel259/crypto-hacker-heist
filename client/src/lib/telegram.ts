/**
 * Telegram WebApp Utilities
 * Provides haptic feedback, back button, and other Telegram mini app features
 */

// Type declaration for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          isVisible: boolean;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        initData: string;
        initDataUnsafe: any;
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
      };
    };
  }
}

/**
 * Check if running in Telegram WebApp
 */
export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
}

/**
 * Haptic Feedback Functions
 */

// Light impact (e.g., button tap)
export function hapticLight() {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.HapticFeedback.impactOccurred('light');
  }
}

// Medium impact (e.g., toggle switch)
export function hapticMedium() {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.HapticFeedback.impactOccurred('medium');
  }
}

// Heavy impact (e.g., important action)
export function hapticHeavy() {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.HapticFeedback.impactOccurred('heavy');
  }
}

// Success notification
export function hapticSuccess() {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.HapticFeedback.notificationOccurred('success');
  }
}

// Error notification
export function hapticError() {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.HapticFeedback.notificationOccurred('error');
  }
}

// Warning notification
export function hapticWarning() {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.HapticFeedback.notificationOccurred('warning');
  }
}

// Selection changed (e.g., scrolling through list)
export function hapticSelection() {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.HapticFeedback.selectionChanged();
  }
}

/**
 * Back Button Functions
 */

export function showBackButton(callback: () => void) {
  if (isTelegramWebApp()) {
    const webApp = window.Telegram!.WebApp;
    webApp.BackButton.onClick(callback);
    webApp.BackButton.show();
  }
}

export function hideBackButton() {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.BackButton.hide();
  }
}

/**
 * Main Button Functions
 */

export function showMainButton(text: string, callback: () => void) {
  if (isTelegramWebApp()) {
    const mainButton = window.Telegram!.WebApp.MainButton;
    mainButton.setText(text);
    mainButton.onClick(callback);
    mainButton.show();
  }
}

export function hideMainButton() {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.MainButton.hide();
  }
}

/**
 * Close mini app
 */
export function closeTelegramWebApp() {
  if (isTelegramWebApp()) {
    window.Telegram!.WebApp.close();
  }
}

/**
 * Get Telegram theme colors
 */
export function getTelegramTheme() {
  if (isTelegramWebApp()) {
    return window.Telegram!.WebApp.themeParams;
  }
  return null;
}

/**
 * Check if user can go back in navigation
 */
export function canGoBack(): boolean {
  return window.history.length > 1;
}
