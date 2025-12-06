#!/bin/bash

# 1. Télécharger Cloudflare Tunnel
echo "📥 Téléchargement de Cloudflare Tunnel..."
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# 2. Installer
echo "⚙️ Installation..."
sudo dpkg -i cloudflared.deb

# 3. Lancer le tunnel
echo ""
echo "====================================================================="
echo "🚀 LE TUNNEL VA DÉMARRER."
echo "⚠️  REGARDEZ BIEN LES LOGS CI-DESSOUS."
echo "🔗  Vous allez voir une ligne comme : https://random-name.trycloudflare.com"
echo "👉  C'est CETTE ADRESSE qu'il faudra donner à @BotFather."
echo "====================================================================="
echo ""
sleep 3

# Lancement du tunnel vers le port 3000 (Frontend)
cloudflared tunnel --url http://localhost:3000
