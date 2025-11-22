# Ubuntu Hosting Guide

This guide covers deploying the Crypto Hacker Heist application on an Ubuntu PC with a domains.co.za domain.

## Prerequisites

- Ubuntu 20.04+ (recommended 22.04 LTS)
- Public static IP address
- domains.co.za domain
- SSH access to the server
- sudo privileges

## System Preparation

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip htop
```

### 2. Install Node.js 20

```bash
# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### 3. Install PNPM (recommended)

```bash
# Install PNPM globally
npm install -g pnpm

# Verify installation
pnpm --version
```

Alternatively, you can use npm:
```bash
npm --version  # Should already be available
```

### 4. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE DATABASE crypto_hacker_heist;
CREATE USER app_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE crypto_hacker_heist TO app_user;
\q
```

### 5. Install Redis (optional but recommended)

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: requirepass your_redis_password
# Set: bind 127.0.0.1

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

## Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## Application Setup

### 1. Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www/crypto-hacker-heist
sudo chown $USER:$USER /var/www/crypto-hacker-heist

# Clone the repository
cd /var/www/crypto-hacker-heist
git clone <your-repository-url> .
```

### 2. Install Dependencies

```bash
# Using PNPM (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Environment Configuration

Create `.env` file:
```bash
cp .env.example .env
nano .env
```

Configure essential variables:
```env
# Database
DATABASE_URL=postgresql://app_user:your_secure_password@localhost:5432/crypto_hacker_heist

# Server
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# TON Center API
TON_CENTER_API_KEY=your_ton_center_api_key

# Session Secret
SESSION_SECRET=your_session_secret_here

# Redis (if using)
REDIS_URL=redis://localhost:6379
```

### 4. Database Setup

```bash
# Run database migrations
pnpm db:push

# Seed initial data (if available)
pnpm db:seed
```

### 5. Build Application

```bash
# Build for production
pnpm build
```

## DNS Configuration (domains.co.za)

### 1. Login to domains.co.za

Navigate to [domains.co.za](https://domains.co.za) and login to your account.

### 2. Configure DNS Records

For your domain (e.g., `yourdomain.co.za`), add the following records:

#### A Record (IPv4)
```
Type: A
Name: @ (or your subdomain like app)
Value: YOUR_PUBLIC_IP_ADDRESS
TTL: 3600
```

#### Optional AAAA Record (IPv6)
```
Type: AAAA
Name: @ (or your subdomain)
Value: YOUR_PUBLIC_IPV6_ADDRESS
TTL: 3600
```

#### Optional CNAME (for www)
```
Type: CNAME
Name: www
Value: yourdomain.co.za
TTL: 3600
```

### 3. Verify DNS Propagation

```bash
# Check A record
dig +short yourdomain.co.za

# Check propagation from different locations
# Use online tools like whatsmydns.net
```

## SSL Certificate Setup

### 1. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Obtain SSL Certificate

```bash
# Obtain certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.co.za -d www.yourdomain.co.za

# Follow prompts to:
# - Enter email (for renewal notices)
# - Agree to terms
# - Choose redirect option (recommended)
```

### 4. Configure Nginx

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/crypto-hacker-heist
```

```nginx
server {
    listen 80;
    server_name yourdomain.co.za www.yourdomain.co.za;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.co.za www.yourdomain.co.za;

    # SSL Configuration (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.co.za/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.co.za/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate Limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static Files
    location / {
        root /var/www/crypto-hacker-heist/dist/public;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health Check
    location /health {
        proxy_pass http://127.0.0.1:5000/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/crypto-hacker-heist /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Process Management

### Option 1: PM2 (recommended)

#### Install PM2
```bash
sudo npm install -g pm2
```

#### Create PM2 Ecosystem File

Create `ecosystem.config.cjs` in project root:
```javascript
module.exports = {
  apps: [{
    name: 'crypto-hacker-heist',
    script: 'dist/index.js',
    cwd: '/var/www/crypto-hacker-heist',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/crypto-hacker-heist/error.log',
    out_file: '/var/log/crypto-hacker-heist/out.log',
    log_file: '/var/log/crypto-hacker-heist/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

#### Setup Log Rotation

```bash
# Create log directory
sudo mkdir -p /var/log/crypto-hacker-heist
sudo chown $USER:$USER /var/log/crypto-hacker-heist

# Setup log rotation
sudo nano /etc/logrotate.d/crypto-hacker-heist
```

```
/var/log/crypto-hacker-heist/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### Start Application with PM2

```bash
# Start the application
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions to enable startup on boot
```

### Option 2: systemd

#### Create systemd Service

```bash
sudo nano /etc/systemd/system/crypto-hacker-heist.service
```

```ini
[Unit]
Description=Crypto Hacker Heist Application
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/crypto-hacker-heist
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=5000

# Logging
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=crypto-hacker-heist

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/log/crypto-hacker-heist

[Install]
WantedBy=multi-user.target
```

#### Enable and Start Service

```bash
# Create log directory
sudo mkdir -p /var/log/crypto-hacker-heist
sudo chown www-data:www-data /var/log/crypto-hacker-heist

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable crypto-hacker-heist
sudo systemctl start crypto-hacker-heist

# Check status
sudo systemctl status crypto-hacker-heist
```

## Health Monitoring

### 1. Application Health Endpoint

Ensure your application has a health endpoint at `/health`:

```javascript
// Add to your Express app
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 2. Monitoring Scripts

Create monitoring script:
```bash
sudo nano /usr/local/bin/check-app-health.sh
```

```bash
#!/bin/bash

HEALTH_URL="http://localhost:5000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "$(date): Application is healthy"
    exit 0
else
    echo "$(date): Application is unhealthy (HTTP $RESPONSE)"
    # Restart application
    pm2 restart crypto-hacker-heist
    # or for systemd: sudo systemctl restart crypto-hacker-heist
    exit 1
fi
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/check-app-health.sh
```

Add to crontab:
```bash
# Edit crontab
sudo crontab -e

# Add line to check every 5 minutes
*/5 * * * * /usr/local/bin/check-app-health.sh
```

## Telegram Bot Webhook Setup

### 1. Set Webhook URL

```bash
# Replace with your domain and bot token
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://yourdomain.co.za/api/telegram/webhook",
       "allowed_updates": ["message", "callback_query"]
     }'
```

### 2. Verify Webhook

```bash
curl -X GET "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## Backup Strategy

### 1. Database Backup

Create backup script:
```bash
sudo nano /usr/local/bin/backup-database.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/crypto-hacker-heist"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="crypto_hacker_heist"
DB_USER="app_user"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: $BACKUP_DIR/db_backup_$DATE.sql.gz"
```

Make executable and add to crontab:
```bash
sudo chmod +x /usr/local/bin/backup-database.sh

# Add to crontab (daily at 2 AM)
0 2 * * * /usr/local/bin/backup-database.sh
```

### 2. Application Backup

```bash
# Create application backup script
sudo nano /usr/local/bin/backup-application.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/crypto-hacker-heist"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/crypto-hacker-heist"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Keep only last 7 days
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "Application backup completed: $BACKUP_DIR/app_backup_$DATE.tar.gz"
```

## Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
pm2 logs crypto-hacker-heist
# or
sudo journalctl -u crypto-hacker-heist -f

# Check port availability
sudo netstat -tlnp | grep :5000

# Check environment variables
pm2 env 0
```

#### 2. Database Connection Issues
```bash
# Test database connection
psql -U app_user -h localhost -d crypto_hacker_heist

# Check PostgreSQL status
sudo systemctl status postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-<version>-main.log
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --dry-run

# Check Nginx configuration
sudo nginx -t
```

#### 4. High Memory Usage
```bash
# Monitor memory usage
htop
free -h

# Check PM2 processes
pm2 monit

# Restart if needed
pm2 restart crypto-hacker-heist
```

### Performance Optimization

#### 1. Enable Nginx Caching
Add to Nginx config:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 2. Optimize Database
```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_mining_user_id ON mining(user_id);
```

#### 3. Monitor System Resources
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor disk usage
df -h
du -sh /var/www/crypto-hacker-heist/*
```

## Security Considerations

1. **Regular Updates**: Keep system and dependencies updated
2. **Firewall**: Maintain UFW configuration
3. **SSL**: Use HTTPS with valid certificates
4. **Database**: Use strong passwords and limit access
5. **Backups**: Regular automated backups
6. **Monitoring**: Log monitoring and alerting
7. **Access Control**: Limit SSH access with key-based authentication

## Maintenance Schedule

### Daily
- Health checks (automated)
- Log rotation (automated)

### Weekly
- Review application logs
- Check system resources
- Monitor SSL certificate expiry

### Monthly
- System updates
- Dependency updates
- Security patches
- Backup verification

### Quarterly
- Performance optimization review
- Security audit
- Disaster recovery testing

This guide provides a comprehensive setup for hosting the Crypto Hacker Heist application on Ubuntu with production-grade reliability and security.