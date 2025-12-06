#!/bin/bash

# Vps Setup Script: Nginx + Self-Signed SSL + Reverse Proxy
# Usage: sudo ./setup_vps_ssl.sh

set -e

# 1. Install Nginx
echo "📦 Installing Nginx..."
apt-get update
apt-get install -y nginx

# 2. Generate Self-Signed Certificate
echo "🔒 Generating SSL Certificate..."
mkdir -p /etc/nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx-selfsigned.key \
  -out /etc/nginx/ssl/nginx-selfsigned.crt \
  -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=$(curl -s ifconfig.me)"

# 3. Configure Nginx Reverse Proxy (Use port 8443 to avoid port 80/443 conflict with Plesk)
echo "🔧 Configuring Nginx..."
cat <<EOF > /etc/nginx/sites-available/polybot
server {
    listen 9443 ssl;
    server_name _;

    ssl_certificate /etc/nginx/ssl/nginx-selfsigned.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx-selfsigned.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 4. Enable Site and Restart Nginx
echo "🚀 Enabling Site and Restarting Nginx..."
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/polybot /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

echo "=========================================="
echo "✅ SETUP COMPLETE!"
echo "Your bot is now accessible via HTTPS at: https://$(curl -s ifconfig.me):8443"
echo "Note: Since it is self-signed, you will see a security warning in the browser. You must accept it."
echo "=========================================="
