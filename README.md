# Crypto Hacker Heist

A Telegram mini app game where players mine cryptocurrency blocks, collect equipment, and compete on leaderboards.

## Environment Variables

### Backend (.env in root)

**Required:**
```bash
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
BOT_TOKEN=your_telegram_bot_token
```

**TON Blockchain Integration:**
```bash
# Your game's TON wallet address (receives all payments)
GAME_TON_WALLET_ADDRESS=EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: TON Center API key for faster transaction verification
# Get from: https://toncenter.com
TON_API_KEY=your_ton_api_key
```

**Optional:**
```bash
ADMIN_WALLET_ID=your_telegram_user_id
WEB_APP_URL=https://your-frontend-url.com
```

### Frontend (client/.env)

**Required:**
```bash
# Your Telegram bot username (without @)
VITE_BOT_USERNAME=cryptohackerheist_bot

# TON Connect manifest URL (your domain + /tonconnect-manifest.json)
VITE_TON_MANIFEST_URL=https://crypto-hacker-heist.onrender.com/tonconnect-manifest.json

# Game's TON wallet address for payments (same as backend)
VITE_TON_PAYMENT_ADDRESS=EQxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Optional:**
```bash
# Set to 'false' in production (app only works in Telegram)
# Set to 'true' for local development (bypasses Telegram requirement)
VITE_DEV_MODE_BYPASS=false
```

## Deployment to Render

### Required Environment Variables

**In Render Dashboard → Your Web Service → Environment:**

Backend variables:
- `DATABASE_URL` - Your Render PostgreSQL connection string
- `NODE_ENV` - Set to `production`
- `BOT_TOKEN` - Your Telegram bot token from @BotFather
- `GAME_TON_WALLET_ADDRESS` - Your TON wallet address for receiving payments

Frontend variables (all prefixed with VITE_):
- `VITE_BOT_USERNAME` - Your bot username (without @)
- `VITE_TON_MANIFEST_URL` - Your Render URL + `/tonconnect-manifest.json`
- `VITE_TON_PAYMENT_ADDRESS` - Same as GAME_TON_WALLET_ADDRESS
- `VITE_DEV_MODE_BYPASS` - Set to `false` for production

### Important Notes

1. **GAME_TON_WALLET_ADDRESS is REQUIRED** for TON payments to work. Without it:
   - Equipment purchases with TON will fail with "Game wallet not configured correctly"
   - Power-up purchases with TON will fail
   - Loot box purchases with TON will fail

2. **TON_API_KEY is recommended** but optional. Without it:
   - Transaction verification still works but uses public API (rate limited)
   - You can get a free API key from https://toncenter.com

3. **Both frontend and backend need the TON wallet address:**
   - Frontend: `VITE_TON_PAYMENT_ADDRESS` (tells users where to send payment)
   - Backend: `GAME_TON_WALLET_ADDRESS` (verifies payment was received)
   - These MUST be the same address!

## Features

- **Mining System**: Automated block mining every 5 minutes with hashrate-based rewards
- **Equipment Shop**: Purchase and upgrade mining equipment with CS, CHST, or TON
- **Component Upgrades**: Upgrade RAM, CPU, Storage, GPU for +5% hashrate per level
- **Power-Ups**: Temporary mining boosts (Hashrate +50%, Luck +20%)
- **Loot Boxes**: Random rewards with Basic, Premium, and Epic tiers
- **Block Explorer**: View all mined blocks and your contribution
- **Leaderboard**: Compete with other players
- **Referral System**: Invite friends and earn rewards
- **Achievements**: Unlock achievements and earn bonuses
- **TON Blockchain Integration**: Purchase items with TON cryptocurrency

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Drizzle ORM
- **Frontend**: React, Vite, TypeScript, TailwindCSS, shadcn/ui
- **Telegram**: Telegraf bot framework
- **Blockchain**: TON Connect, TON Center API
- **Deployment**: Render (auto-deploy on push to main)

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in values
4. Start database: Use Render PostgreSQL or local PostgreSQL
5. Run migrations: `npm run db:push`
6. Start dev server: `npm run dev`
7. Set `VITE_DEV_MODE_BYPASS=true` to test without Telegram

## Support

For issues or questions, contact the development team or open an issue on GitHub.
