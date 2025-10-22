# Complete Render Deployment Guide for Crypto Hacker Heist

## Overview

This guide walks you through deploying your Telegram crypto mini game to Render with auto-deploy enabled. Follow these steps carefully to ensure a successful deployment.

---

## 🚀 Pre-Deployment Checklist

Before deploying, ensure you've completed these items:

### Code Quality
- [x] All console.log statements removed from production code
- [x] Environment variables properly configured (no hardcoded secrets)
- [x] TypeScript compiles without errors
- [x] Critical black screen bugs fixed (loading indicators, error boundaries, retry logic)

### Testing
- [x] Black screen scenarios tested locally
- [x] User initialization tested
- [x] Error boundaries tested
- [x] Mobile responsive design verified

### Security
- [x] All API keys and secrets in environment variables
- [x] Database SSL configured for production
- [x] Admin panel only visible to admin users

---

## 📋 Required Environment Variables

You'll need to set these environment variables in Render. Have them ready before proceeding.

### Backend Environment Variables (Server)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` | ✅ Yes |
| `NODE_ENV` | Environment mode | `production` | ✅ Yes |
| `PORT` | Server port (Render sets this automatically) | `5000` | ⚠️ Auto-set |
| `BOT_TOKEN` | Telegram bot token from @BotFather | `123456:ABC-DEF...` | ✅ Yes |
| `ADMIN_WALLET_ID` | Your Telegram user ID for admin access | `123456789` | ✅ Yes |
| `TON_API_KEY` | TON API key (if using TON network) | `your-ton-api-key` | ❌ Optional |
| `GAME_TOKEN_ADDRESS` | TON game token contract address | `EQBd...` | ❌ Optional |
| `SESSION_SECRET` | Random secret for sessions | `your-random-secret-32-chars` | ✅ Yes |
| `WEB_APP_URL` | Frontend URL (your Render web service URL) | `https://your-app.onrender.com` | ✅ Yes |

### Frontend Environment Variables (Client)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_BOT_USERNAME` | Your Telegram bot username | `cryptohackerheist_bot` | ✅ Yes |
| `VITE_TON_MANIFEST_URL` | TON Connect manifest URL | `https://your-app.onrender.com/tonconnect-manifest.json` | ✅ Yes |
| `VITE_TON_PAYMENT_ADDRESS` | TON wallet for payments | `UQBd...` | ✅ Yes |
| `VITE_DEFAULT_REFERRAL_CODE` | Default referral code | `WELCOME123` | ❌ Optional |
| `VITE_DEV_MODE_BYPASS` | Allow dev mode (set to `false` in production!) | `false` | ✅ Yes |

---

## 🎯 Step-by-Step Deployment to Render

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Configure database:
   - **Name**: `crypto-hacker-heist-db` (or your preferred name)
   - **Database**: `cryptoheist` (or your preferred name)
   - **User**: Will be auto-generated
   - **Region**: Choose closest to your users (e.g., `Frankfurt (EU Central)`)
   - **Plan**: Choose based on your needs
     - **Free**: Good for testing (expires after 90 days)
     - **Starter ($7/month)**: Good for small production apps
3. Click **"Create Database"**
4. **IMPORTANT**: Copy the **Internal Database URL** from the database dashboard
   - It looks like: `postgresql://user:password@host:5432/database`
   - You'll need this for `DATABASE_URL` environment variable

### Step 3: Create Web Service (Backend + Frontend)

1. Click **"New +"** → **"Web Service"**
2. Connect your repository:
   - Select your `crypto-hacker-heist` repository
   - Click **"Connect"**
3. Configure web service:
   - **Name**: `crypto-hacker-heist` (or your preferred name)
   - **Region**: Same as database (e.g., `Frankfurt (EU Central)`)
   - **Branch**: `main` (or your deployment branch)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose based on your needs
     - **Free**: Good for testing (sleeps after inactivity)
     - **Starter ($7/month)**: Recommended for production (always on)

### Step 4: Configure Environment Variables

In your web service settings, go to **"Environment"** tab and add these variables:

#### Click "Add Environment Variable" for each:

**Backend Variables:**
```
DATABASE_URL = [paste your Internal Database URL from Step 2]
NODE_ENV = production
BOT_TOKEN = [your Telegram bot token]
ADMIN_WALLET_ID = [your Telegram user ID]
SESSION_SECRET = [generate random 32-character string]
WEB_APP_URL = https://[your-service-name].onrender.com
```

**Frontend Variables:**
```
VITE_BOT_USERNAME = cryptohackerheist_bot
VITE_TON_MANIFEST_URL = https://[your-service-name].onrender.com/tonconnect-manifest.json
VITE_TON_PAYMENT_ADDRESS = [your TON wallet address]
VITE_DEV_MODE_BYPASS = false
```

**Optional Variables:**
```
TON_API_KEY = [your TON API key if needed]
GAME_TOKEN_ADDRESS = [your TON token address if needed]
VITE_DEFAULT_REFERRAL_CODE = [default code if needed]
```

**⚠️ IMPORTANT**: Replace `[your-service-name]` with your actual Render service name!

### Step 5: Configure Health Check

1. In your web service settings, scroll to **"Health & Alerts"**
2. Set **Health Check Path**: `/api/health`
3. This ensures Render monitors your service health

### Step 6: Enable Auto-Deploy

1. In your web service settings, go to **"Settings"** tab
2. Under **"Build & Deploy"**, ensure **"Auto-Deploy"** is set to **"Yes"**
3. Now every commit to your main branch will automatically deploy!

### Step 7: Deploy!

1. Click **"Manual Deploy"** → **"Deploy latest commit"**
2. Watch the build logs for any errors
3. Wait for deployment to complete (usually 5-10 minutes)

---

## ✅ Post-Deployment Verification

### 1. Check Service Health

Visit your service URL:
```
https://[your-service-name].onrender.com/api/health
```

You should see:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. Check Mining Service Health

Visit:
```
https://[your-service-name].onrender.com/api/health/mining
```

You should see:
```json
{
  "status": "healthy",
  "lastSuccessfulMine": "2025-01-20T12:34:56.789Z",
  "consecutiveFailures": 0
}
```

### 3. Test in Telegram

1. Open your Telegram bot: `https://t.me/[your-bot-username]`
2. Click **"Start"** or send `/start`
3. Click **"Play Game"** or **"Launch App"**
4. Verify:
   - ✅ App loads without black screen
   - ✅ Dashboard displays your stats
   - ✅ No console errors in browser DevTools (press F12)
   - ✅ Mining countdown shows if you have equipment

### 4. Test Critical Features

- **Purchase Equipment**: Go to Shop → Buy free laptop
- **Check Balance**: Verify CS balance updates
- **Mining**: Confirm mining countdown appears
- **TON Wallet**: Test connecting wallet (if using TON)

---

## 🔧 Updating Environment Variables After Deployment

If you need to change environment variables after deployment:

1. Go to your Render web service dashboard
2. Click **"Environment"** tab
3. Update the variable value
4. Click **"Save Changes"**
5. Render will automatically redeploy your service

---

## 🐛 Common Issues & Solutions

### Issue 1: "Service Unavailable" or 503 Error

**Symptoms**: Users see "Service is temporarily unavailable"

**Solutions**:
1. Check health endpoint: `/api/health`
2. Verify `DATABASE_URL` is correct
3. Check Render logs for database connection errors
4. Ensure database is running (not expired for free tier)

### Issue 2: Black Screen on Launch

**Symptoms**: App shows blank screen in Telegram

**Solutions**:
1. Check browser console for errors (F12 in desktop)
2. Verify `WEB_APP_URL` matches your actual Render URL
3. Ensure `VITE_BOT_USERNAME` is correct
4. Check that all VITE_ variables are set

### Issue 3: "Please open this app in Telegram" Error

**Symptoms**: Error message when opening outside Telegram

**Solutions**:
1. This is expected behavior! App must be opened via Telegram
2. Test by opening: `https://t.me/[your-bot-username]`
3. For local development, set `VITE_DEV_MODE_BYPASS=true` (NOT in production!)

### Issue 4: Mining Not Working

**Symptoms**: Mining countdown doesn't appear

**Solutions**:
1. Check `/api/health/mining` endpoint
2. Verify user has purchased equipment
3. Check Render logs for mining errors
4. Ensure database can write new blocks

### Issue 5: TON Wallet Won't Connect

**Symptoms**: "Connect Wallet" doesn't work

**Solutions**:
1. Verify `VITE_TON_MANIFEST_URL` is accessible
2. Check that manifest file exists at `/public/tonconnect-manifest.json`
3. Ensure manifest URL uses HTTPS
4. Test manifest: Visit `https://your-app.onrender.com/tonconnect-manifest.json`

### Issue 6: Auto-Deploy Not Working

**Symptoms**: Changes pushed to GitHub don't deploy

**Solutions**:
1. Check Render dashboard → Service → "Events" tab
2. Verify "Auto-Deploy" is enabled in Settings
3. Check if build failed (look for error in logs)
4. Try manual deploy: "Manual Deploy" → "Deploy latest commit"

---

## 📊 Monitoring Your Deployment

### Using Render Dashboard

1. **Logs**: Click "Logs" tab to see real-time logs
2. **Metrics**: Click "Metrics" tab to see CPU, memory, request stats
3. **Events**: Click "Events" tab to see deployment history

### Key Metrics to Watch

- **Response Time**: Should be < 200ms for `/api/health`
- **Error Rate**: Should be < 1%
- **Memory Usage**: Should not continuously increase (memory leak)
- **CPU Usage**: Should not stay at 100% (performance issue)

### Recommended External Monitoring

1. **UptimeRobot** (free): Monitor health endpoint every 5 minutes
   - Add monitor: `https://your-app.onrender.com/api/health`
   - Get email alerts if service goes down

2. **Sentry** (free tier available): Track JavaScript errors
   - Add VITE_SENTRY_DSN environment variable
   - See all client-side errors in dashboard

---

## 🔒 Security Best Practices

### ✅ DO:
- Use strong `SESSION_SECRET` (32+ random characters)
- Keep `DATABASE_URL` secret
- Set `NODE_ENV=production` in production
- Use HTTPS URLs for all external resources
- Regularly update dependencies (`npm update`)
- Monitor error logs for suspicious activity

### ❌ DON'T:
- Commit `.env` files to GitHub
- Share your `BOT_TOKEN` publicly
- Use `VITE_DEV_MODE_BYPASS=true` in production
- Expose admin endpoints without authentication
- Use weak/predictable session secrets

---

## 🔄 Rollback Plan

If deployment breaks production:

### Quick Rollback (Render Dashboard)

1. Go to service → **"Manual Deploy"** tab
2. Find previous working deployment
3. Click **"Redeploy"** on that commit
4. Service will roll back in ~5 minutes

### Via Git

```bash
# Find the last working commit
git log --oneline

# Revert to that commit
git revert [bad-commit-hash]

# Push to trigger auto-deploy
git push origin main
```

---

## 📈 Scaling Considerations

### When to Upgrade Plans

**Upgrade Database** when:
- Free tier expires (90 days)
- Running out of storage (check Render dashboard)
- Need better performance (slow queries)

**Upgrade Web Service** when:
- Service sleeps too often (free tier)
- Response times > 1 second
- Hitting memory limits (check metrics)
- Need more CPU for concurrent users

### Recommended Production Setup

**For 100-1,000 users:**
- Web Service: Starter ($7/mo)
- Database: Starter ($7/mo)
- Total: ~$14/month

**For 1,000-10,000 users:**
- Web Service: Standard ($25/mo)
- Database: Standard ($25/mo)
- Total: ~$50/month

---

## 🎓 Additional Resources

### Render Documentation
- [Render Deploy Guide](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Health Checks](https://render.com/docs/health-checks)

### Project Documentation
- See `MONITORING.md` for monitoring setup
- See `DEPLOYMENT.md` for deployment checklist
- See `.env.example` files for all available variables

---

## 🆘 Getting Help

### If Deployment Fails

1. **Check Render Logs**: Service → "Logs" tab
2. **Look for Error Messages**: Search for "ERROR" or "Failed"
3. **Common Errors**:
   - `MODULE_NOT_FOUND`: Run `npm install` locally, commit package-lock.json
   - `Database connection failed`: Check `DATABASE_URL`
   - `Port already in use`: Render handles ports automatically, ignore locally

### If App Doesn't Work After Deployment

1. **Test Health Endpoints**: `/api/health` and `/api/health/mining`
2. **Check Browser Console**: Open DevTools (F12), look for errors
3. **Verify Environment Variables**: Check all VITE_ variables are set
4. **Test Database Connection**: Check if queries work in Render logs

### Getting Support

- **GitHub Issues**: Report bugs at your repo's Issues tab
- **Render Support**: [render.com/support](https://render.com/support)
- **Telegram**: Check your bot for community support channel

---

## ✨ Success Checklist

After following this guide, you should have:

- [x] Service deployed to Render
- [x] Database connected and healthy
- [x] All environment variables configured
- [x] Health endpoints responding correctly
- [x] App accessible via Telegram
- [x] Mining service running
- [x] Auto-deploy enabled
- [x] Monitoring configured

**Congratulations! Your Telegram crypto mini game is now live! 🎉**

---

## 📝 Quick Reference

### Render Service URLs

```
Production App: https://[your-service-name].onrender.com
Health Check:   https://[your-service-name].onrender.com/api/health
Mining Health:  https://[your-service-name].onrender.com/api/health/mining
Telegram Bot:   https://t.me/[your-bot-username]
```

### Important Commands

```bash
# Test locally before deploying
npm run build
npm start

# Check for TypeScript errors
npm run typecheck

# Update dependencies
npm update

# Deploy (automatic on git push)
git push origin main
```

### Emergency Contacts

- **Render Status**: [status.render.com](https://status.render.com)
- **Your Database**: Check Render dashboard for connection info
- **Your Service**: Check "Logs" and "Metrics" tabs

---

**Last Updated**: January 2025
**Version**: 1.0.0
