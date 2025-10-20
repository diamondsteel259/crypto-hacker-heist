import { Telegraf } from 'telegraf';
import { users } from '@shared/schema';
import { db } from './db';
import { eq } from 'drizzle-orm';

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://crypto-hacker-heist.onrender.com';
const ADMIN_WHITELIST = process.env.ADMIN_WHITELIST?.split(',').map(id => parseInt(id.trim())) || [];

if (!BOT_TOKEN) {
  console.warn('⚠️  BOT_TOKEN not set - Bot commands will not work');
}

const bot = BOT_TOKEN ? new Telegraf(BOT_TOKEN) : null;

export async function initializeBot() {
  if (!bot) {
    console.log('🤖 Bot not initialized - BOT_TOKEN not provided');
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
      console.error('Error in start command:', error);
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
    console.log('Web app data received:', ctx.webAppData);
  });

  // Error handling
  bot.catch((err, ctx) => {
    console.error('Bot error:', err);
    ctx.reply('❌ An error occurred. Please try again later.');
  });

  try {
    await bot.launch();
    console.log('🤖 Bot started successfully');
  } catch (error) {
    console.error('Failed to start bot:', error);
  }
}

export { bot };
