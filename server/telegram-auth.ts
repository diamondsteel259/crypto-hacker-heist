import crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function validateTelegramWebAppData(
  initData: string,
  botToken: string
): TelegramUser | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return null;
    }

    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return null;
    }

    const userParam = urlParams.get('user');
    if (!userParam) {
      return null;
    }

    const user = JSON.parse(userParam);
    const authDate = parseInt(urlParams.get('auth_date') || '0');

    const maxAge = 24 * 60 * 60;
    if (Date.now() / 1000 - authDate > maxAge) {
      return null;
    }

    return {
      ...user,
      auth_date: authDate,
      hash,
    };
  } catch (error) {
    console.error('Telegram auth validation error:', error);
    return null;
  }
}
