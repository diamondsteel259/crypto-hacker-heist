#!/bin/bash

# Ubuntu deployment script for Crypto Hacker Heist
# This script helps deploy the application on Ubuntu servers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="crypto-hacker-heist"
APP_DIR="/var/www/$APP_NAME"
SERVICE_NAME="$APP_NAME"
NGINX_SITE="$APP_NAME"
DOMAIN=${1:-"yourdomain.co.za"}

echo -e "${BLUE}🚀 Crypto Hacker Heist Ubuntu Deployment Script${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ This script must be run as root (use sudo)${NC}"
    exit 1
fi

# Function to print step
print_step() {
    echo -e "\n${GREEN}📋 Step $1: $2${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Update System
print_step "1" "Updating system packages"
apt update && apt upgrade -y
print_success "System updated"

# Step 2: Install Dependencies
print_step "2" "Installing dependencies"
apt install -y curl wget git unzip htop nginx postgresql postgresql-contrib redis-server

# Install Node.js 20
print_step "2.1" "Installing Node.js 20"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
print_step "2.2" "Installing PM2"
npm install -g pm2

# Install Certbot
print_step "2.3" "Installing Certbot for SSL"
apt install -y certbot python3-certbot-nginx

print_success "Dependencies installed"

# Step 3: Setup Application Directory
print_step "3" "Setting up application directory"
mkdir -p "$APP_DIR"
chown -R $SUDO_USER:$SUDO_USER "$APP_DIR"
print_success "Application directory created: $APP_DIR"

# Step 4: Setup PostgreSQL
print_step "4" "Setting up PostgreSQL"
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE $APP_NAME;" || true
sudo -u postgres psql -c "CREATE USER app_user WITH PASSWORD 'secure_password_change_me';" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $APP_NAME TO app_user;" || true

print_success "PostgreSQL configured"

# Step 5: Setup Redis
print_step "5" "Setting up Redis"
systemctl start redis-server
systemctl enable redis-server

# Configure Redis
sed -i 's/# requirepass foobared/requirepass redis_password_change_me/' /etc/redis/redis.conf
sed -i 's/bind 127.0.0.1 ::1/bind 127.0.0.1/' /etc/redis/redis.conf
systemctl restart redis-server

print_success "Redis configured"

# Step 6: Setup Firewall
print_step "6" "Configuring firewall"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_success "Firewall configured"

# Step 7: Clone Repository (if not already cloned)
print_step "7" "Setting up application code"
if [ ! -d "$APP_DIR/.git" ]; then
    echo "Please clone your repository to $APP_DIR"
    echo "Example: git clone <your-repo-url> $APP_DIR"
    read -p "Press Enter after cloning the repository..."
fi

cd "$APP_DIR"

# Install dependencies
if [ -f "package.json" ]; then
    print_step "7.1" "Installing Node.js dependencies"
    sudo -u $SUDO_USER npm install
    print_success "Dependencies installed"
else
    print_error "package.json not found. Please ensure the repository is cloned correctly."
    exit 1
fi

# Step 8: Environment Configuration
print_step "8" "Environment configuration"
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your configuration"
        print_warning "Key settings to update:"
        print_warning "  - DATABASE_URL=postgresql://app_user:secure_password_change_me@localhost:5432/$APP_NAME"
        print_warning "  - DOMAIN=$DOMAIN"
        print_warning "  - JWT_SECRET (generate a strong secret)"
        print_warning "  - TELEGRAM_BOT_TOKEN"
        print_warning "  - TON_CENTER_API_KEY"
        read -p "Press Enter after configuring .env file..."
    else
        print_error ".env.example not found. Please create .env file manually."
    fi
else
    print_success ".env file exists"
fi

# Step 9: Build Application
print_step "9" "Building application"
sudo -u $SUDO_USER npm run build
print_success "Application built"

# Step 10: Setup SSL Certificate
print_step "10" "Setting up SSL certificate"
echo "Domain to use: $DOMAIN"
read -p "Is this correct? (y/n): " confirm
if [ "$confirm" = "y" ]; then
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN || \
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN
    print_success "SSL certificate configured"
else
    print_warning "Skipping SSL configuration. Run 'certbot --nginx -d yourdomain' later."
fi

# Step 11: Configure Nginx
print_step "11" "Configuring Nginx"
NGINX_CONFIG="/etc/nginx/sites-available/$NGINX_SITE"
cp nginx-config.conf "$NGINX_CONFIG"

# Replace domain in nginx config
sed -i "s/yourdomain.co.za/$DOMAIN/g" "$NGINX_CONFIG"

# Enable site
ln -sf "$NGINX_CONFIG" "/etc/nginx/sites-enabled/"
rm -f "/etc/nginx/sites-enabled/default"

# Test nginx configuration
nginx -t && systemctl reload nginx
print_success "Nginx configured"

# Step 12: Setup Process Manager
print_step "12" "Setting up process manager (PM2)"
sudo -u $SUDO_USER pm2 start ecosystem.config.cjs
sudo -u $SUDO_USER pm2 save
sudo -u $SUDO_USER pm2 startup | tail -n 1 | sudo -u $SUDO_USER bash
print_success "PM2 configured"

# Step 13: Setup Log Rotation
print_step "13" "Setting up log rotation"
mkdir -p "/var/log/$APP_NAME"
chown $SUDO_USER:$SUDO_USER "/var/log/$APP_NAME"

# Create logrotate config
cat > "/etc/logrotate.d/$APP_NAME" << EOF
/var/log/$APP_NAME/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $SUDO_USER $SUDO_USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

print_success "Log rotation configured"

# Step 14: Setup Monitoring
print_step "14" "Setting up monitoring"
MONITOR_SCRIPT="/usr/local/bin/check-$APP_NAME.sh"
cat > "$MONITOR_SCRIPT" << EOF
#!/bin/bash

HEALTH_URL="http://localhost:5000/health"
RESPONSE=\$(curl -s -o /dev/null -w "%{http_code}" \$HEALTH_URL)

if [ \$RESPONSE -eq 200 ]; then
    echo "\$(date): Application is healthy"
    exit 0
else
    echo "\$(date): Application is unhealthy (HTTP \$RESPONSE)"
    pm2 restart $APP_NAME
    exit 1
fi
EOF

chmod +x "$MONITOR_SCRIPT"

# Add to crontab
(crontab -l 2>/dev/null; echo "*/5 * * * * $MONITOR_SCRIPT") | crontab -
print_success "Monitoring configured"

# Step 15: Setup Backups
print_step "15" "Setting up backups"
BACKUP_DIR="/var/backups/$APP_NAME"
mkdir -p "$BACKUP_DIR"

# Database backup script
DB_BACKUP_SCRIPT="/usr/local/bin/backup-$APP_NAME-db.sh"
cat > "$DB_BACKUP_SCRIPT" << EOF
#!/bin/bash

BACKUP_DIR="$BACKUP_DIR"
DATE=\$(date +%Y%m%d_%H%M%S)
DB_NAME="$APP_NAME"
DB_USER="app_user"

mkdir -p \$BACKUP_DIR
pg_dump -U \$DB_USER -h localhost \$DB_NAME | gzip > \$BACKUP_DIR/db_backup_\$DATE.sql.gz
find \$BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Database backup completed: \$BACKUP_DIR/db_backup_\$DATE.sql.gz"
EOF

chmod +x "$DB_BACKUP_SCRIPT"

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * $DB_BACKUP_SCRIPT") | crontab -
print_success "Backups configured"

# Final Summary
echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "${GREEN}Application Details:${NC}"
echo -e "  Domain: https://$DOMAIN"
echo -e "  App Directory: $APP_DIR"
echo -e "  Logs: /var/log/$APP_NAME/"
echo -e "  Backups: $BACKUP_DIR"
echo -e "\n${GREEN}Management Commands:${NC}"
echo -e "  View logs: pm2 logs $APP_NAME"
echo -e "  Restart app: pm2 restart $APP_NAME"
echo -e "  Status: pm2 status"
echo -e "  Nginx config: sudo nano /etc/nginx/sites-available/$NGINX_SITE"
echo -e "  SSL cert: sudo certbot certificates"
echo -e "\n${GREEN}Next Steps:${NC}"
echo -e "  1. Update your domain DNS to point to this server's IP"
echo -e "  2. Configure your environment variables in .env"
echo -e "  3. Test the application at https://$DOMAIN"
echo -e "  4. Set up Telegram bot webhook"
echo -e "  5. Monitor application health"
echo -e "\n${YELLOW}Important:${NC}"
echo -e "  - Change default passwords in PostgreSQL and Redis"
echo -e "  - Update JWT_SECRET with a strong random string"
echo -e "  - Configure your Telegram bot token"
echo -e "  - Set up monitoring alerts"
echo -e "\n${GREEN}Documentation:${NC}"
echo -e "  - Bundle Analysis: docs/bundle.md"
echo -e "  - Ubuntu Hosting: docs/ubuntu-hosting.md"
echo -e "  - Bundle Analysis Guide: BUNDLE_ANALYSIS.md"