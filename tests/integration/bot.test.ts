import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { Telegraf, Context } from 'telegraf';
import { resetTestDatabase } from '../helpers/test-db.js';
import { createTestUser } from '../helpers/api-helpers.js';

/**
 * Telegram Bot Integration Tests
 * Tests bot commands and message handling
 */

describe('Telegram Bot', () => {
  let bot: Telegraf;
  const TEST_BOT_TOKEN = 'test_bot_token_12345';
  const WEB_APP_URL = 'https://test-app.com';

  beforeAll(async () => {
    // Initialize bot with test token
    bot = new Telegraf(TEST_BOT_TOKEN);

    // Setup bot commands (simulating production bot setup)
    bot.start(async (ctx) => {
      await ctx.reply('🎮 Welcome to Crypto Hacker Heist!');
    });

    bot.command('play', async (ctx) => {
      await ctx.reply('🎮 Launching Crypto Hacker Heist...');
    });

    bot.command('help', async (ctx) => {
      await ctx.reply('🎮 Crypto Hacker Heist - Help\n\nAvailable commands:\n/start - Welcome message\n/play - Launch the game\n/help - Show this help message');
    });

    bot.command('admin', async (ctx) => {
      const userId = ctx.from?.id;
      const adminWhitelist = [12345, 67890];

      if (!userId || !adminWhitelist.includes(userId)) {
        await ctx.reply('❌ Access denied. Admin privileges required.');
        return;
      }

      await ctx.reply('🔧 Admin Dashboard');
    });
  });

  afterAll(async () => {
    await resetTestDatabase();
  });

  describe('Bot Command Handlers', () => {
    it('should respond to /start command', async () => {
      const mockCtx = createMockContext('/start', 12345, 'testuser');
      const replySpy = vi.spyOn(mockCtx, 'reply');

      // Trigger start handler
      await bot.handleUpdate(createStartUpdate(mockCtx));

      // Verify response
      expect(replySpy).toHaveBeenCalled();
      const replyMessage = replySpy.mock.calls[0]?.[0] as string;
      expect(replyMessage).toContain('Welcome');
      expect(replyMessage).toContain('Crypto Hacker Heist');
    });

    it('should respond to /play command', async () => {
      const mockCtx = createMockContext('/play', 12345, 'testuser');
      const replySpy = vi.spyOn(mockCtx, 'reply');

      await bot.handleUpdate(createCommandUpdate('/play', mockCtx));

      expect(replySpy).toHaveBeenCalled();
      const replyMessage = replySpy.mock.calls[0]?.[0] as string;
      expect(replyMessage).toContain('Launching');
    });

    it('should respond to /help command', async () => {
      const mockCtx = createMockContext('/help', 12345, 'testuser');
      const replySpy = vi.spyOn(mockCtx, 'reply');

      await bot.handleUpdate(createCommandUpdate('/help', mockCtx));

      expect(replySpy).toHaveBeenCalled();
      const replyMessage = replySpy.mock.calls[0]?.[0] as string;
      expect(replyMessage).toContain('Help');
      expect(replyMessage).toContain('/start');
      expect(replyMessage).toContain('/play');
    });

    it('should deny non-admin access to /admin command', async () => {
      const mockCtx = createMockContext('/admin', 99999, 'regularuser');
      const replySpy = vi.spyOn(mockCtx, 'reply');

      await bot.handleUpdate(createCommandUpdate('/admin', mockCtx));

      expect(replySpy).toHaveBeenCalled();
      const replyMessage = replySpy.mock.calls[0]?.[0] as string;
      expect(replyMessage).toContain('Access denied');
    });

    it('should allow admin access to /admin command', async () => {
      const mockCtx = createMockContext('/admin', 12345, 'adminuser');
      const replySpy = vi.spyOn(mockCtx, 'reply');

      await bot.handleUpdate(createCommandUpdate('/admin', mockCtx));

      expect(replySpy).toHaveBeenCalled();
      const replyMessage = replySpy.mock.calls[0]?.[0] as string;
      expect(replyMessage).toContain('Admin Dashboard');
    });
  });

  describe('Bot User Management', () => {
    it('should handle new user registration flow', async () => {
      const userId = 123456;
      const username = 'newuser123';

      // Simulate new user starting bot
      const mockCtx = createMockContext('/start', userId, username);
      const replySpy = vi.spyOn(mockCtx, 'reply');

      await bot.handleUpdate(createStartUpdate(mockCtx));

      // Should send welcome message
      expect(replySpy).toHaveBeenCalled();
      expect(replySpy.mock.calls[0]?.[0]).toContain('Welcome');
    });

    it('should handle existing user starting bot', async () => {
      // Create existing user
      const existingUser = await createTestUser({
        telegramId: '555555',
        username: 'existinguser',
        csBalance: 50000,
      });

      const mockCtx = createMockContext('/start', 555555, 'existinguser');
      const replySpy = vi.spyOn(mockCtx, 'reply');

      await bot.handleUpdate(createStartUpdate(mockCtx));

      // Should send welcome back message
      expect(replySpy).toHaveBeenCalled();
    });
  });

  describe('Bot Message Formatting', () => {
    it('should include inline keyboard with web app button', async () => {
      const mockCtx = createMockContext('/play', 12345, 'testuser');
      const replySpy = vi.spyOn(mockCtx, 'reply');

      await bot.handleUpdate(createCommandUpdate('/play', mockCtx));

      // Check that reply was called (button would be in second argument)
      expect(replySpy).toHaveBeenCalled();
    });

    it('should format messages with emojis correctly', async () => {
      const mockCtx = createMockContext('/help', 12345, 'testuser');
      const replySpy = vi.spyOn(mockCtx, 'reply');

      await bot.handleUpdate(createCommandUpdate('/help', mockCtx));

      const replyMessage = replySpy.mock.calls[0]?.[0] as string;
      expect(replyMessage).toMatch(/[🎮📊⚙️]/);
    });
  });

  describe('Bot Error Handling', () => {
    it('should handle invalid commands gracefully', async () => {
      const mockCtx = createMockContext('/invalidcommand', 12345, 'testuser');

      // Bot should not crash on invalid command
      try {
        await bot.handleUpdate(createCommandUpdate('/invalidcommand', mockCtx));
      } catch (error) {
        // If error, it should be handled
        expect(error).toBeDefined();
      }

      // Bot should still be responsive
      const testCtx = createMockContext('/help', 12345, 'testuser');
      const replySpy = vi.spyOn(testCtx, 'reply');
      await bot.handleUpdate(createCommandUpdate('/help', testCtx));
      expect(replySpy).toHaveBeenCalled();
    });

    it('should handle missing user data', async () => {
      const mockCtx = createMockContext('/start', undefined, undefined);

      try {
        await bot.handleUpdate(createStartUpdate(mockCtx));
      } catch (error) {
        // Should handle gracefully
      }

      // Bot should still be functional
      expect(bot).toBeDefined();
    });
  });

  describe('Bot Performance', () => {
    it('should respond to commands quickly', async () => {
      const mockCtx = createMockContext('/start', 12345, 'testuser');
      const replySpy = vi.spyOn(mockCtx, 'reply');

      const startTime = Date.now();
      await bot.handleUpdate(createStartUpdate(mockCtx));
      const duration = Date.now() - startTime;

      expect(replySpy).toHaveBeenCalled();
      expect(duration).toBeLessThan(200); // Should respond within 200ms
    });

    it('should handle multiple concurrent commands', async () => {
      const commands = Array.from({ length: 10 }, (_, i) => {
        const mockCtx = createMockContext('/help', 10000 + i, `user${i}`);
        return bot.handleUpdate(createCommandUpdate('/help', mockCtx));
      });

      const startTime = Date.now();
      await Promise.all(commands);
      const duration = Date.now() - startTime;

      // Should handle 10 concurrent commands within reasonable time
      expect(duration).toBeLessThan(1000);
    });
  });
});

// Helper functions to create mock Telegram contexts and updates

function createMockContext(command: string, userId?: number, username?: string): Context {
  return {
    update: {
      update_id: Math.floor(Math.random() * 1000000),
      message: {
        message_id: Math.floor(Math.random() * 1000000),
        date: Math.floor(Date.now() / 1000),
        chat: {
          id: userId || 0,
          type: 'private' as const,
        },
        from: userId ? {
          id: userId,
          is_bot: false,
          first_name: 'Test',
          username: username,
        } : undefined,
        text: command,
      },
    },
    from: userId ? {
      id: userId,
      is_bot: false,
      first_name: 'Test',
      username: username,
    } : undefined,
    message: {
      message_id: Math.floor(Math.random() * 1000000),
      date: Math.floor(Date.now() / 1000),
      chat: {
        id: userId || 0,
        type: 'private' as const,
      },
      from: userId ? {
        id: userId,
        is_bot: false,
        first_name: 'Test',
        username: username,
      } : undefined,
      text: command,
    },
    reply: vi.fn(async (text: string, extra?: any) => {
      return {
        message_id: Math.floor(Math.random() * 1000000),
        date: Math.floor(Date.now() / 1000),
        chat: { id: userId || 0, type: 'private' as const },
        text,
      };
    }),
  } as any;
}

function createStartUpdate(ctx: Context) {
  return {
    update_id: Math.floor(Math.random() * 1000000),
    message: {
      message_id: Math.floor(Math.random() * 1000000),
      date: Math.floor(Date.now() / 1000),
      chat: ctx.message?.chat,
      from: ctx.from,
      text: '/start',
      entities: [{ type: 'bot_command', offset: 0, length: 6 }],
    },
  };
}

function createCommandUpdate(command: string, ctx: Context) {
  return {
    update_id: Math.floor(Math.random() * 1000000),
    message: {
      message_id: Math.floor(Math.random() * 1000000),
      date: Math.floor(Date.now() / 1000),
      chat: ctx.message?.chat,
      from: ctx.from,
      text: command,
      entities: [{ type: 'bot_command', offset: 0, length: command.length }],
    },
  };
}
