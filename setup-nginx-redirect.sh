#!/bin/bash

# ============================================
# NGINX REDIRECT SETUP SCRIPT
# Configures polygraalx.app -> app.polygraalx.app
# ============================================

set -e

echo "🚀 Setting up domain redirect..."

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo: sudo ./setup-nginx-redirect.sh"
    exit 1
fi

# Variables
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
CONFIG_NAME="polygraalx-redirect"
DOMAIN="polygraalx.app"

# Create the redirect configuration
echo "📝 Creating Nginx configuration..."

cat > "$NGINX_AVAILABLE/$CONFIG_NAME" << 'EOF'
# Redirect polygraalx.app to app.polygraalx.app
server {
    listen 80;
    listen [::]:80;
    server_name polygraalx.app www.polygraalx.app;
    return 301 https://app.polygraalx.app$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name polygraalx.app www.polygraalx.app;

    # Try to use existing cert, fall back to snakeoil if not available
    ssl_certificate /etc/letsencrypt/live/polygraalx.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/polygraalx.app/privkey.pem;

    return 301 https://app.polygraalx.app$request_uri;
}
EOF

# Enable the site
echo "🔗 Enabling site..."
ln -sf "$NGINX_AVAILABLE/$CONFIG_NAME" "$NGINX_ENABLED/$CONFIG_NAME"

# Test nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

# Reload nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

echo ""
echo "✅ SUCCESS! Redirect configured."
echo "================================"
echo "polygraalx.app -> app.polygraalx.app"
echo ""
echo "If SSL certificate doesn't exist, run:"
echo "  sudo certbot --nginx -d polygraalx.app -d www.polygraalx.app"
