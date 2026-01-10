#!/bin/bash
# Script de post-déploiement automatique

# Créer .env en mode paper trading si absent
if [ ! -f /root/polygraalx/.env ]; then
  cat > /root/polygraalx/.env << 'EOF'
# Paper Trading Mode (pas de clés nécessaires)
PAPER_TRADING=true
PAPER_BALANCE=10.0

# Trading Parameters
BET_AMOUNT_USDC=10
ZSCORE_THRESHOLD=2.5
MAX_POSITIONS=2
TRADE_ASSETS=BTC,ETH

# Logging
LOG_LEVEL=INFO
EOF
  echo "✅ .env créé en mode paper trading"
else
  echo "ℹ️ .env existe déjà"
fi
