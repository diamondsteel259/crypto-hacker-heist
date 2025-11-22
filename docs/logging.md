# Structured Logging Guide

This document describes how Crypto Hacker Heist uses structured logging with Pino for all server-side events.

## Overview

The application uses **Pino** for structured, JSON-based logging in production and pretty-printed logs in development. All logs are:

- **Structured**: Each log entry includes metadata like request IDs, timestamps, and environment context
- **Correlated**: HTTP requests are assigned unique IDs to track related operations across services
- **Redacted**: Sensitive data (tokens, passwords, Telegram credentials) is automatically redacted
- **Rotated**: Log files automatically rotate based on size to prevent disk space issues
- **Centralized**: All server components use the same logger instance

## Log Levels

Logs are emitted at different levels based on severity:

| Level | Use Case | Examples |
|-------|----------|----------|
| `error` | Critical failures that need attention | Database connection failures, unhandled exceptions |
| `warn` | Warnings about degraded state | Mining service failures (recoverable), retries |
| `info` | Important state changes and milestones | Server startup, cron jobs running, operations completed |
| `debug` | Detailed operational information | Mining cycles, middleware operations |
| `trace` | Very detailed internal data | Usually disabled in production |

## Configuration

### Environment Variables

Configure logging behavior using these environment variables:

```bash
# Set the minimum log level (default: 'info')
LOG_LEVEL=debug

# Directory to write log files (default: './logs')
LOG_DIR=/var/log/crypto-hacker-heist

# Maximum size for a single log file before rotation (default: '100M')
LOG_MAX_SIZE=50M

# Number of rotated log files to keep (default: 10)
LOG_MAX_FILES=15

# Whether to send logs to stdout in production (default: true)
# Useful for systemd/journalctl capture
LOG_TO_STDOUT=true

# In development, write logs to file as well as console
LOG_TO_FILE=false
```

### Example Configuration Files

#### systemd Service

For Ubuntu with systemd:

```ini
[Service]
# Capture logs from stdout
StandardOutput=journal
StandardError=journal
SyslogIdentifier=crypto-heist

# Environment variables
Environment="NODE_ENV=production"
Environment="LOG_LEVEL=info"
Environment="LOG_DIR=/var/log/crypto-hacker-heist"
Environment="LOG_TO_STDOUT=true"
```

#### PM2 Ecosystem

```javascript
module.exports = {
  apps: [{
    name: 'crypto-heist',
    script: './dist/index.js',
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
      LOG_DIR: '/var/log/crypto-hacker-heist',
      LOG_TO_STDOUT: 'true'
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: '/var/log/crypto-heist-error.log',
    out_file: '/var/log/crypto-heist-out.log',
  }]
};
```

## Accessing Logs

### Development

In development mode, logs are pretty-printed to the console:

```bash
npm run dev

# Output:
# 14:35:21 [express] GET /api/user/123 200 in 45ms
# 14:35:22 [mining] Block mined successfully blockNumber=150
```

### Production with systemd/journalctl

View logs in real-time:

```bash
# Follow all crypto-heist logs
journalctl -u crypto-hacker-heist -f

# View logs since last hour
journalctl -u crypto-hacker-heist --since "1 hour ago"

# View only errors
journalctl -u crypto-hacker-heist -p err
```

### Production with PM2

```bash
# View logs
pm2 logs crypto-heist

# View logs with timestamps
pm2 logs crypto-heist --lines 100 --timestamp

# View only errors
pm2 logs crypto-heist --err
```

### Log Files on Disk

Logs are automatically rotated and stored in the configured `LOG_DIR`:

```bash
# List log files
ls -lh /var/log/crypto-hacker-heist/

# View current log file
tail -f /var/log/crypto-hacker-heist/app.log

# Search logs
grep "error" /var/log/crypto-hacker-heist/app.log

# Parse JSON logs with jq
tail -f /var/log/crypto-hacker-heist/app.log | jq '.'
```

## Log Rotation

### Automatic Rotation

By default, logs are rotated when they reach 100MB (configurable via `LOG_MAX_SIZE`):

- `app.log` - Current log file
- `app.log.1` - Previous rotations
- `app.log.2`, `app.log.3`, etc.

Old files are automatically deleted based on `LOG_MAX_FILES` (default: 10 files).

### Manual Rotation

You can manually trigger rotation by restarting the service:

```bash
# systemd
systemctl restart crypto-hacker-heist

# PM2
pm2 restart crypto-heist
```

## Request Correlation IDs

Each HTTP request is assigned a unique correlation ID:

- **Auto-generated**: If `X-Request-ID` header is not provided, a UUID is generated
- **Passed through**: If the client provides `X-Request-ID`, it's used for correlation
- **Included in response**: The `X-Request-ID` header is returned in the HTTP response

This allows you to trace a single request through all logs:

```bash
# View all logs for a specific request
grep "550e8400-e29b-41d4-a716-446655440000" /var/log/crypto-hacker-heist/app.log
```

## Sensitive Data Redaction

The following fields are automatically redacted from logs:

- `x-telegram-init-data` - Telegram authentication data
- `authorization` - Authorization tokens
- `cookie` - Session cookies
- `password` - Passwords
- `token` - Generic tokens
- `apiKey`, `api_key` - API keys
- `secret` - Secret values
- `privateKey` - Private cryptographic keys
- `initData` - Telegram initData
- `phone` - Phone numbers
- `email` - Email addresses

Example:

```json
{
  "level": "info",
  "message": "User login",
  "timestamp": "2024-01-15T14:35:22.123Z",
  "data": {
    "userId": "123456",
    "authorization": "[REDACTED]",
    "x-telegram-init-data": "[REDACTED]"
  }
}
```

## Common Log Patterns

### Mining Service

```json
{
  "level": "info",
  "message": "Mining cycle started",
  "totalUsers": 1250,
  "activeMiners": 342,
  "timestamp": "2024-01-15T14:35:00Z"
}
```

### Cron Jobs

```json
{
  "level": "info",
  "message": "Generating daily analytics report",
  "date": "2024-01-15",
  "timestamp": "2024-01-16T00:05:00Z"
}
```

### API Requests

```json
{
  "level": "info",
  "message": "GET /api/user/123/equipment 200 in 125ms",
  "method": "GET",
  "path": "/api/user/123/equipment",
  "statusCode": 200,
  "duration": 125,
  "ip": "192.168.1.1",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Errors

```json
{
  "level": "error",
  "message": "Database query failed",
  "error": {
    "message": "Connection timeout",
    "stack": "Error: Connection timeout\n  at Object.<anonymous>",
    "name": "Error"
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Monitoring and Alerts

### Suggested Monitoring

Set up alerts for these patterns:

1. **Critical errors**: `LOG_LEVEL=error` - Immediate investigation needed
2. **Mining failures**: `Mining has failed multiple times consecutively` - May indicate system issues
3. **Database issues**: `Database initialization failed` - Service degradation
4. **Cron failures**: Multiple consecutive cron job errors - Scheduled tasks not running

### Log Aggregation

For larger deployments, consider centralized log aggregation:

- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Datadog**: Cloud-native log aggregation
- **Splunk**: Enterprise log search and analysis
- **CloudWatch**: If hosting on AWS

All logs from this application are JSON-formatted, making them compatible with log aggregation platforms.

## Troubleshooting

### Logs not appearing

1. Check `LOG_LEVEL` environment variable - make sure it's set to include your messages
2. Verify log file permissions: `ls -l /var/log/crypto-hacker-heist/`
3. Check disk space: `df -h /var/log/`
4. Restart the service to flush buffered logs

### Logs taking up too much space

1. Reduce `LOG_MAX_SIZE` to rotate more frequently
2. Increase `LOG_LEVEL` to reduce verbosity (e.g., `info` instead of `debug`)
3. Reduce `LOG_MAX_FILES` to keep fewer old logs (with caution)

### High I/O from logging

In development with `LOG_TO_FILE=true`, file I/O can be significant:

1. Disable `LOG_TO_FILE` in development
2. Use `LOG_LEVEL=warn` to reduce volume
3. Consider piping logs to `/dev/null` for local development

## Examples

### Example: Trace a failed request

```bash
# Find the request ID in recent logs
tail -100 /var/log/crypto-hacker-heist/app.log | grep "error" | jq '.requestId'

# View all operations for that request
grep "550e8400-e29b-41d4-a716-446655440000" /var/log/crypto-hacker-heist/app.log | jq '.'
```

### Example: Monitor mining health

```bash
# Watch for mining issues
journalctl -u crypto-hacker-heist -f | grep -i "mining"

# Count mining cycles per hour
journalctl -u crypto-hacker-heist --since "1 hour ago" | \
  grep "Mining cycle started" | wc -l
```

### Example: Check API performance

```bash
# See slowest API endpoints
jq 'select(.duration > 500)' /var/log/crypto-hacker-heist/app.log | \
  jq '.path, .duration' | sort -r
```

## Best Practices

1. **Use appropriate log levels**: Don't log everything as `info` - use `debug` for verbose data
2. **Include context**: Always include relevant IDs (user, request, block number) for correlation
3. **Avoid sensitive data**: Never log tokens, passwords, or PII directly
4. **Monitor key events**: Ensure mining, cron, and critical operations have appropriate logging
5. **Check log rotation**: Verify logs are rotating properly to prevent disk space issues
6. **Review logs regularly**: Set up alerts for error patterns and investigate them

## Further Reading

- [Pino Logger Documentation](https://getpino.io/)
- [Structured Logging Best Practices](https://www.kartar.net/2015/12/structured-logging/)
- [JSON Log Format](https://www.splunk.com/en_us/blog/tips-and-tricks/log-format-json.html)
