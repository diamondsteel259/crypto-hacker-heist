import { Telegraf } from 'telegraf';
import { users } from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { logger } from './logger';

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://crypto-hacker-heist.onrender.com';
const ADMIN_WHITELIST = process.env.ADMIN_WHITELIST?.split(',').map(id => parseInt(id.trim())) || [];
const WEBHOOK_DOMAIN = process.env.WEBHOOK_DOMAIN || 'https://crypto-hacker-heist.onrender.com';
const USE_WEBHOOKS = process.env.NODE_ENV === 'production'; // Use webhooks in production

if (!BOT_TOKEN) {
  logger.warn('BOT_TOKEN not set - Bot commands will not work');
}

const bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null;

export async function initializeBot() {
  if (!bot) {
    logger.info('Bot not initialized - BOT_TOKEN not provided');
    return;
  }

  // Start command
  bot.start(async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    try {
      // Check if user exists in database
      const user = await db.select().from(users).where(eq(users.telegramId, userId.toString())).limit(1);
      
      if (user.length === 0) {
        await ctx.reply(
          '🎮 Welcome to Crypto Hacker Heist!\n\n' +
          'This is a Telegram mini-app game where you mine cryptocurrency and build your mining empire.\n\n' +
          'Use /play to launch the game!',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🎮 Launch Game', web_app: { url: `${WEB_APP_URL}/` } }]
              ]
            }
          }
        );
      } else {
        await ctx.reply(
          `🎮 Welcome back, ${user[0].username}!\n\n` +
          `💰 CS Balance: ${user[0].csBalance.toLocaleString()}\n` +
          `⚡ Hashrate: ${user[0].totalHashrate.toFixed(2)} GH/s\n\n` +
          'Use /play to continue your mining empire!',
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: '🎮 Launch Game', web_app: { url: `${WEB_APP_URL}/` } }]
              ]
            }
          }
        );
      }
    } catch (error) {
      logger.error('Error in start command', error);
      await ctx.reply('❌ Error loading game data. Please try again later.');
    }
  });

  // Play command - launches the game
  bot.command('play', async (ctx) => {
    await ctx.reply(
      '🎮 Launching Crypto Hacker Heist...',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🚀 Start Mining!', web_app: { url: `${WEB_APP_URL}/` } }]
          ]
        }
      }
    );
  });

  // Admin command - admin only
  bot.command('admin', async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    if (!ADMIN_WHITELIST.includes(userId)) {
      await ctx.reply('❌ Access denied. Admin privileges required.');
      return;
    }

    await ctx.reply(
      '🔧 Admin Dashboard',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '⚙️ Admin Panel', web_app: { url: `${WEB_APP_URL}/admin` } }]
          ]
        }
      }
    );
  });

  // Help command
  bot.command('help', async (ctx) => {
    await ctx.reply(
      '🎮 Crypto Hacker Heist - Help\n\n' +
      'Available commands:\n' +
      '/start - Welcome message and game info\n' +
      '/play - Launch the game mini-app\n' +
      '/help - Show this help message\n\n' +
      'Game features:\n' +
      '• Mine cryptocurrency (CS/CHST)\n' +
      '• Buy and upgrade mining equipment\n' +
      '• Complete daily tasks\n' +
      '• Open loot boxes\n' +
      '• Invite friends for rewards\n\n' +
      'Use /play to start playing!',
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🎮 Launch Game', web_app: { url: `${WEB_APP_URL}/` } }]
          ]
        }
      }
    );
  });

  // Handle web app data
  bot.on('web_app_data', async (ctx) => {
    logger.debug('Web app data received', { data: ctx.webAppData });
  });

  // Error handling
  bot.catch((err, ctx) => {
    logger.error('Bot error', err);
    ctx.reply('❌ An error occurred. Please try again later.');
  });

  try {
    if (USE_WEBHOOKS) {
      // Use webhooks in production to avoid 409 conflicts
      logger.info('Starting bot with webhooks');
      const webhookPath = `/telegram-webhook/${BOT_TOKEN}`;
      await bot.telegram.setWebhook(`${WEBHOOK_DOMAIN}${webhookPath}`);
      logger.info('Webhook set', { url: `${WEBHOOK_DOMAIN}${webhookPath}` });
      logger.info('Bot configured for webhooks (webhook handler needs to be registered in routes)');
    } else {
      // Use polling in development
      logger.info('Starting bot with long polling');
      await bot.launch();
      logger.info('Bot started successfully with polling');
    }
  } catch (error: any) {
    logger.error('Failed to start bot', error);
    
    // Handle specific error cases
    if (error.response?.error_code === 409) {
      logger.warn('Bot conflict (409): Another instance is running. This is normal during deployments');
      logger.info('Tip: The bot will work once the old instance stops. Commands may be delayed by 1-2 minutes');
    } else if (error.code === 'ETELEGRAM') {
      logger.warn('Telegram API error. Check your BOT_TOKEN');
    }
    
    // Don't throw - let the server continue without the bot
  }

  // Graceful shutdown
  process.once('SIGINT', () => {
    if (bot) {
      logger.info('Stopping bot (SIGINT)');
      bot.stop('SIGINT');
    }
  });
  process.once('SIGTERM', () => {
    if (bot) {
      logger.info('Stopping bot (SIGTERM)');
      bot.stop('SIGTERM');
    }
  });
}

// Helper function to send message to specific user
export async function sendMessageToUser(telegramId: string, message: string): Promise<void> {
  if (!bot) {
    throw new Error("Bot not initialized");
  }

  try {
    await bot.telegram.sendMessage(telegramId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🎮 Open Game', web_app: { url: WEB_APP_URL } }]
        ]
      }
    });
  } catch (error: any) {
    // User might have blocked the bot or deleted their account
    if (error.response?.error_code === 403) {
      throw new Error(`User ${telegramId} has blocked the bot`);
    }
    throw error;
  }
}

// Export bot middleware for webhook handling
export function getBotWebhookHandler() {
  if (!bot || !BOT_TOKEN) {
    return null;
  }
  return {
    path: `/telegram-webhook/${BOT_TOKEN}`,
    handler: bot.webhookCallback(`/telegram-webhook/${BOT_TOKEN}`)
  };
}

export { bot };
