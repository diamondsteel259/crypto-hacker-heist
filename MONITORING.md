# Monitoring Guide

This document describes the health check endpoints and monitoring recommendations for Crypto Hacker Heist.

## Health Check Endpoints

### Overall Service Health

**Endpoint:** `GET /api/health`

**Response (Healthy):**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

**Response (Degraded - 503):**
```json
{
  "status": "degraded",
  "database": "disconnected",
  "message": "Database connection failed"
}
```

**What to Monitor:**
- Response time should be < 200ms
- Status should be "healthy"
- Database should be "connected"

---

### Mining Service Health

**Endpoint:** `GET /api/health/mining`

**Response (Healthy):**
```json
{
  "status": "healthy",
  "lastSuccessfulMine": "2025-10-22T10:30:00.000Z",
  "consecutiveFailures": 0
}
```

**Response (Degraded - 503):**
```json
{
  "status": "degraded",
  "lastSuccessfulMine": "2025-10-22T09:00:00.000Z",
  "consecutiveFailures": 5,
  "message": "Mining has failed multiple times or not run recently"
}
```

**What to Monitor:**
- Mining consecutive failures should be < 3
- Last successful mine should be within last 15 minutes
- Status should be "healthy"

---

## Recommended Monitoring Tools

### 1. Render Dashboard
- Shows service uptime and deployment status
- Built-in logs viewer
- Free tier includes basic monitoring

### 2. UptimeRobot or Pingdom
- External health check monitoring
- Alerts via email, SMS, or Slack
- Check `/api/health` endpoint every 5 minutes

### 3. Sentry (Error Tracking)
- Captures JavaScript and backend errors
- Session replay for debugging black screens
- Free tier: 5,000 errors/month

**Setup:**
```bash
# Install
npm install @sentry/react @sentry/node

# Configure in client/src/main.tsx and server/index.ts
```

### 4. LogRocket (Session Replay)
- Records user sessions for debugging
- Helps identify black screen causes
- Free tier: 1,000 sessions/month

---

## Alerting Rules

Set up alerts for the following conditions:

### Critical Alerts (Immediate Action)

1. **Service Down**
   - Condition: `/api/health` returns 503 or times out
   - Action: Check Render logs, restart service if needed

2. **Mining Failures**
   - Condition: `/api/health/mining` shows `consecutiveFailures >= 3`
   - Action: Check database connection, review mining logs

3. **Database Disconnected**
   - Condition: `/api/health` shows `database: "disconnected"`
   - Action: Check DATABASE_URL env var, verify Render database

### Warning Alerts (Monitor Closely)

4. **Slow Response Time**
   - Condition: `/api/health` response time > 500ms
   - Action: Check database performance, consider scaling

5. **Stale Mining**
   - Condition: `lastSuccessfulMine` more than 10 minutes ago
   - Action: Verify mining service is running

---

## Monitoring Best Practices

### 1. Log Aggregation
- Use Render's built-in logs
- Filter for `[ERROR]`, `[MINING CRITICAL]`, `[DB]` prefixes
- Set up log retention (7-30 days)

### 2. Regular Health Checks
- External monitoring every 5 minutes
- Internal health checks on app startup
- Frontend health check before user initialization

### 3. Performance Metrics
- Track API response times
- Monitor database query performance
- Watch for memory leaks (Render dashboard)

### 4. User Experience Monitoring
- Track black screen incidents (via error boundary)
- Monitor initialization failures
- Log slow loading times (useLoadingTimeout)

---

## Debugging Black Screens

If users report black screens:

1. **Check Health Endpoints**
   ```bash
   curl https://your-app.onrender.com/api/health
   curl https://your-app.onrender.com/api/health/mining
   ```

2. **Review Render Logs**
   - Look for errors around the time of incident
   - Check for database connection failures
   - Verify mining service is running

3. **Check Browser Console**
   - Ask user to open DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab for failed requests

4. **Test User Initialization**
   - Verify Telegram WebApp is loaded
   - Check authentication flow
   - Test with dev mode bypass locally

---

## Example Monitoring Setup (UptimeRobot)

1. **Create Monitor:**
   - Type: HTTP(S)
   - URL: `https://your-app.onrender.com/api/health`
   - Interval: 5 minutes

2. **Add Alert Contacts:**
   - Email for critical alerts
   - Slack webhook for warnings

3. **Configure Alerts:**
   - Down: Alert after 2 consecutive failures
   - Slow: Alert if response > 2000ms

---

## Logs to Monitor

### Success Patterns
```
[DB] Database initialized successfully
[MINING] Block mined successfully
serving on port 5000
```

### Warning Patterns
```
⚠️  Database seeding failed (non-fatal)
[MINING] Mining already in progress, skipping...
Health check failed, proceeding with initialization
```

### Error Patterns (Action Required)
```
[ERROR] ...
[MINING CRITICAL] Mining has failed 5 times consecutively
[DB] Health check failed
[MINING] Mining operation timed out, resetting flag
```

---

## Support

If monitoring detects critical issues:

1. Check this guide first
2. Review DEPLOYMENT.md for deployment checklist
3. Check GitHub issues: https://github.com/your-repo/issues
4. Contact support via Telegram bot
