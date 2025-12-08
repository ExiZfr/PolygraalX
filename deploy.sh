#!/bin/bash

# Polymarket Bot Dashboard - One-Click Deploy Script
# Usage: ./deploy.sh

set -e # Exit immediately if a command exits with a non-zero status.

APP_NAME="polymarket-dashboard"

echo "=========================================="
echo "🚀 Starting Deployment: $APP_NAME"
echo "=========================================="

# 1. Pull the latest code from GitHub
echo "📥 [1/4] Pulling latest changes..."
git fetch origin main
git reset --hard origin/main

# 2. Install Dependencies
echo "📦 [2/4] Installing dependencies..."
npm install

# 2.5 Sync Database Schema
echo "🗄️  [2.5/4] Syncing Database..."
npx prisma generate
npx prisma db push

# 3. Build the Next.js Application
echo "🏗️  [3/4] Building Next.js app..."
npm run build

# 4. Restart the Process Manager (PM2)
echo "🔄 [4/4] Restarting PM2 process..."
# Kill any existing process on port 3000 to avoid EADDRINUSE
echo "🧹 Cleaning up port 3000..."
fuser -k 3000/tcp || true

# Delete old PM2 process to ensure fresh start
if pm2 list | grep -q "$APP_NAME"; then
    pm2 delete "$APP_NAME"
fi

echo "🚀 Starting new instance..."
pm2 start npm --name "$APP_NAME" -- start
echo "✅ Process '$APP_NAME' started."

# 5. Configure Root Domain Redirect (polygraalx.app -> app.polygraalx.app)
echo "🔀 [5/5] Configuring domain redirect..."
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
REDIRECT_CONF="polygraalx-redirect"

# Create nginx redirect config (Cloudflare handles SSL)
sudo tee "$NGINX_AVAILABLE/$REDIRECT_CONF" > /dev/null << 'NGINX_EOF'
# Redirect polygraalx.app to app.polygraalx.app
# Cloudflare handles SSL termination, so we only need port 80
server {
    listen 80;
    listen [::]:80;
    server_name polygraalx.app www.polygraalx.app;
    return 301 https://app.polygraalx.app$request_uri;
}
NGINX_EOF

# Enable the config
sudo ln -sf "$NGINX_AVAILABLE/$REDIRECT_CONF" "$NGINX_ENABLED/$REDIRECT_CONF" 2>/dev/null || true

# Test and reload nginx
if sudo nginx -t 2>/dev/null; then
    sudo systemctl reload nginx
    echo "✅ Redirect configured: polygraalx.app -> app.polygraalx.app"
else
    echo "⚠️  Nginx config test failed. You may need to run: sudo certbot --nginx -d polygraalx.app"
fi

echo "=========================================="
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo "=========================================="
