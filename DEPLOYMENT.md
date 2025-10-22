# Deployment Checklist

Use this checklist before deploying Crypto Hacker Heist to ensure all critical fixes are in place and the app is production-ready.

## Pre-Deployment Checklist

### Code Quality

- [ ] All `console.log` statements removed or wrapped in DEV check
- [ ] All environment variables moved to .env files
- [ ] No hardcoded secrets or API keys in code
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] No critical ESLint errors (warnings OK)

**Verification:**
```bash
# Search for console.log in production code
grep -r "console.log" client/src --exclude-dir=node_modules

# Build frontend
cd client && npm run build

# Build backend
cd server && npm run build
```

---

### Testing

- [ ] Black screen scenarios tested (slow network, DB down, etc.)
- [ ] User initialization tested (Telegram and non-Telegram)
- [ ] Error boundaries tested (inject errors to verify fallback UI)
- [ ] Mobile responsive design tested (375px width minimum)
- [ ] Loading states tested (throttle network to Slow 3G)
- [ ] Health endpoints responding correctly

**Black Screen Test Cases:**

1. **Slow Network**
   - Throttle to Slow 3G in DevTools
   - Verify loading spinner shows immediately
   - Verify loading help appears after 5 seconds

2. **Database Down**
   - Stop database temporarily
   - Verify health check error message displays
   - Verify "Retry" button works

3. **Not in Telegram**
   - Open in regular browser
   - Production: Should show "Open in Telegram" error
   - Development: Should work with mock user (if VITE_DEV_MODE_BYPASS=true)

---

### Security

- [ ] `rejectUnauthorized: true` in production database connection
- [ ] All secrets in environment variables (not code)
- [ ] Admin panel only visible to admin users
- [ ] API endpoints have proper authentication
- [ ] Rate limiting configured correctly
- [ ] CORS settings appropriate for production

**Security Verification:**
```bash
# Check database SSL config
grep -A 3 "ssl:" server/db.ts

# Verify no secrets in code
grep -r "password\|secret\|key" --exclude-dir=node_modules --exclude="*.md"
```

---

### Performance

- [ ] Header component receives user as prop (no duplicate query)
- [ ] BlockTimer callback memoized (no memory leak)
- [ ] Query client has retry logic enabled
- [ ] Shop component split into smaller components (if completed)
- [ ] Loading indicators present on all data-fetching components

**Performance Verification:**
```bash
# Check for duplicate queries
grep -n "useQuery" client/src/components/MobileHeader.tsx

# Verify retry logic enabled
grep -A 5 "retry:" client/src/lib/queryClient.ts
```

---

### Monitoring

- [ ] Health endpoints responding correctly (`/api/health`, `/api/health/mining`)
- [ ] Error tracking configured (Sentry or similar)
- [ ] Logs are being captured (Render logs or external service)
- [ ] Mining service monitoring active

**Monitoring Verification:**
```bash
# Test health endpoints locally
curl http://localhost:5000/api/health
curl http://localhost:5000/api/health/mining
```

---

### Documentation

- [ ] README.md updated with setup instructions
- [ ] Environment variables documented
- [ ] .env.example files created (`client/.env.example`, `server/.env.example`)
- [ ] MONITORING.md created
- [ ] DEPLOYMENT.md (this file) reviewed

---

### Render-Specific

- [ ] Environment variables set in Render dashboard
- [ ] Auto-deploy enabled (if desired)
- [ ] Health check path set to `/api/health` in Render
- [ ] Database backup configured
- [ ] Build command correct: `npm run build`
- [ ] Start command correct: `npm start`

---

## Environment Variables Setup

### Required Backend Variables (Render Dashboard)

```bash
DATABASE_URL=postgresql://...         # From Render PostgreSQL
NODE_ENV=production
PORT=5000                            # Render auto-sets this
BOT_TOKEN=your_telegram_bot_token
ADMIN_WALLET_ID=your_telegram_user_id
```

### Required Frontend Variables (Render Dashboard)

```bash
VITE_BOT_USERNAME=cryptohackerheist_bot
VITE_TON_MANIFEST_URL=https://your-domain.onrender.com/tonconnect-manifest.json
VITE_DEV_MODE_BYPASS=false          # MUST be false in production
```

### Optional Variables

```bash
# Backend
SESSION_SECRET=random_secret_string
WEB_APP_URL=https://your-frontend-url.com

# Frontend
VITE_TON_PAYMENT_ADDRESS=your_ton_wallet
VITE_SENTRY_DSN=your_sentry_dsn
```

---

## Deployment Steps

### 1. Pre-Flight Check

```bash
# Run all tests
npm test

# Build locally to catch errors
cd client && npm run build
cd ../server && npm run build

# Check for console.log
grep -r "console.log" client/src | grep -v "node_modules" | grep -v ".test"
```

### 2. Push to Repository

```bash
git add .
git commit -m "Deploy: Production fixes applied"
git push origin main
```

### 3. Render Auto-Deploy

Render will automatically:
- Pull latest code
- Install dependencies
- Run build command
- Start the service

### 4. Verify Deployment

```bash
# Check health
curl https://your-app.onrender.com/api/health

# Check mining health
curl https://your-app.onrender.com/api/health/mining

# Test in Telegram
# Open t.me/your_bot and verify app loads
```

### 5. Monitor for 30 Minutes

- Watch Render logs for errors
- Check health endpoints stay green
- Test user flows in Telegram
- Verify mining blocks are being created

---

## Rollback Plan

If critical issues occur:

1. **Immediate Rollback (Render)**
   - Go to Render Dashboard > Your Service
   - Click "Deployments" tab
   - Find previous working deployment
   - Click "Redeploy"

2. **Git Rollback**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Database Rollback**
   - Render PostgreSQL has automatic backups
   - Go to Database > Backups
   - Restore from last known good backup

---

## Post-Deployment Verification

### Critical Flows to Test

1. **User Onboarding**
   - Open app in Telegram for first time
   - Verify no black screen
   - Verify loading indicators work
   - Verify user initialized successfully

2. **Mining Flow**
   - Check dashboard shows correct hashrate
   - Verify block timer countdown works
   - Wait for next block and verify reward distribution

3. **Shop Flow**
   - Navigate to Shop
   - Verify equipment loads
   - Test purchase flow (if applicable)

4. **Error Handling**
   - Disable network briefly
   - Verify retry logic works
   - Verify error messages display correctly

---

## Common Deployment Issues

### Issue: Black Screen on Load

**Causes:**
- Database not connected
- Environment variables missing
- Telegram WebApp script failed to load

**Fix:**
1. Check `/api/health` endpoint
2. Verify DATABASE_URL in Render
3. Check browser console for errors

---

### Issue: Users Can't Initialize

**Causes:**
- Telegram auth failing
- Health check failing
- Database timeout

**Fix:**
1. Check Render logs for authentication errors
2. Verify BOT_TOKEN is correct
3. Test `/api/auth/telegram` endpoint

---

### Issue: Mining Not Working

**Causes:**
- Mining service crashed
- Database connection lost
- isMining flag stuck

**Fix:**
1. Check `/api/health/mining`
2. Restart Render service
3. Check consecutiveFailures count

---

## Monitoring Setup (Post-Deployment)

1. **Set up UptimeRobot**
   - Monitor `/api/health` every 5 minutes
   - Alert on 2 consecutive failures

2. **Configure Sentry** (Optional)
   - Add VITE_SENTRY_DSN to Render
   - Test error capture

3. **Set up Log Alerts**
   - Render Dashboard > Logs
   - Create filters for `[ERROR]` and `[MINING CRITICAL]`

---

## Success Criteria

Deployment is successful when:

✅ Health endpoints return 200 OK
✅ Users can load app without black screen
✅ Loading indicators display properly
✅ User initialization works in Telegram
✅ Mining blocks are created every 5 minutes
✅ No critical errors in Render logs for 30 minutes
✅ Mobile responsive design works
✅ Error boundaries catch and display errors
✅ Retry logic works on network failures

---

## Support Channels

- **GitHub Issues:** https://github.com/your-repo/issues
- **Render Support:** https://render.com/docs
- **Telegram Bot:** @your_bot_username

---

## Changelog

Keep track of deployments:

```
## [1.1.0] - 2025-10-22
### Fixed
- Added loading indicators to prevent black screen
- Implemented error boundaries for render failures
- Added user initialization error handling
- Enabled query retry logic with exponential backoff
- Fixed server error handler to prevent crashes
- Removed production console.log statements
- Optimized MobileHeader performance

### Added
- Health check endpoints (/api/health, /api/health/mining)
- Mining service monitoring
- Development mode bypass for local testing
- Loading timeout helper for slow connections
- Environment variable configuration

### Security
- SSL certificate validation in production
- Environment variable based configuration
```
