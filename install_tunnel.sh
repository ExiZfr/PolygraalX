#!/bin/bash

# Cloudflare Tunnel Installation Script
# Usage: ./install_tunnel.sh

set -e

echo "🚀 Installing Cloudflare Tunnel (cloudflared)..."

# 1. Download and install cloudflared
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i cloudflared-linux-amd64.deb

# 2. Authenticate
echo "=========================================="
echo "⚠️  ACTION REQUIRED: Copy the URL below and open it in your browser to login."
echo "=========================================="
cloudflared tunnel login

# 3. Create Tunnel (User will be prompted for name)
read -p "Enter a name for your tunnel (e.g., polybot): " TUNNEL_NAME
cloudflared tunnel create $TUNNEL_NAME

# 4. Configure Ingress
echo "🔧 Configuring Ingress..."
cat <<EOF > ~/.cloudflared/config.yml
tunnel: $TUNNEL_NAME-uuid
credentials-file: /root/.cloudflared/$TUNNEL_NAME-uuid.json

ingress:
  - hostname: your-domain.com # CHANGE THIS
    service: http://localhost:3000
  - service: http_status:404
EOF

echo "=========================================="
echo "✅ Tunnel created!"
echo "Now run: cloudflared tunnel route dns $TUNNEL_NAME your-domain.com"
echo "Then start it with: cloudflared tunnel run $TUNNEL_NAME"
echo "=========================================="
