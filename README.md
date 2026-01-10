# PolyGraalX - Autonomous VPS Sniper

🤖 Bot de trading autonome 24/7 pour les marchés Polymarket BTC/ETH 15-minutes avec stratégie de mean reversion.

## 🎯 Fonctionnalités

- ✅ **Découverte automatique des marchés** via Gamma API
- ✅ **Monitoring temps réel** des prix BTC/ETH sur Binance
- ✅ **Détection de volatilité** avec Z-Score (seuil ±2.5)
- ✅ **Trading mean reversion** automatique
- ✅ **Système bulletproof** avec exponential backoff
- ✅ **Paper trading** inclus pour tester sans risque
- ✅ **Déploiement VPS** via GitHub Actions

## 🚀 Démarrage Rapide

### Mode Paper Trading (sans argent réel)

```bash
git clone https://github.com/VOTRE_USERNAME/polygraalx.git
cd polygraalx
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Lancer en mode paper trading (pas besoin de clés)
export PAPER_TRADING=true
python main.py
```

### Mode Production

1. **Configurer `.env`:**
```bash
cp .env.template .env
nano .env
```

Remplir au minimum:
- `POLYGON_PRIVATE_KEY` - Clé privée de votre wallet Polymarket
- `FUNDER_ADDRESS` - Adresse de votre proxy wallet Polymarket
- `SIGNATURE_TYPE` - 0=EOA, 1=Magic/Email, 2=Proxy

2. **Lancer le bot:**
```bash
python main.py
```

## 📊 Stratégie de Trading

```
Prix Binance → Z-Score > +2.5 (spike UP) → Bet NO (reversion DOWN)
Prix Binance → Z-Score < -2.5 (spike DOWN) → Bet YES (reversion UP)
Position → Z-Score revient à ±0.5 → Sortie (profit)
```

## 🔧 Configuration

| Variable | Défaut | Description |
|----------|--------|-------------|
| `BET_AMOUNT_USDC` | 10 | Montant par trade |
| `ZSCORE_THRESHOLD` | 2.5 | Seuil d'entrée |
| `EXIT_ZSCORE_THRESHOLD` | 0.5 | Seuil de sortie |
| `MAX_POSITIONS` | 2 | Positions simultanées max |
| `PAPER_TRADING` | false | Mode simulation |

## 🌐 Déploiement VPS (GitHub Actions)

### 1. Configurer les Secrets GitHub

Aller dans **Settings → Secrets and variables → Actions** et ajouter:

- `VPS_HOST` = `87.106.2.116`
- `VPS_USER` = `root`
- `VPS_PASSWORD` = `votre_mot_de_passe`

### 2. Créer `.env` sur le VPS

```bash
ssh root@87.106.2.116
cd /root/polygraalx
cp .env.template .env
nano .env  # Configurer vos clés Polymarket
```

### 3. Push vers GitHub

```bash
git push origin main
```

Le bot se déploiera automatiquement sur votre VPS ! 🎉

### 4. Surveiller les logs

```bash
# Via systemd
sudo journalctl -u polygraalx -f

# Via fichier
tail -f /root/polygraalx/bot.log
```

## 📁 Structure du Projet

```
polygraalx/
├── main.py                 # Point d'entrée principal
├── config.py               # Configuration
├── market_discovery.py     # Scan Gamma API
├── price_feed.py           # WebSocket Binance
├── volatility.py           # Calcul Z-Score
├── trading.py              # Engine Polymarket
├── positions.py            # Gestion positions
├── paper_trading.py        # Mode simulation
├── requirements.txt        # Dépendances
├── .env.template           # Template config
├── polygraalx.service      # Service systemd
├── DEPLOY.md               # Guide déploiement
└── .github/workflows/
    └── deploy.yml          # CI/CD automatique
```

## 🛡️ Sécurité

- ✅ Ne jamais commit `.env` (dans `.gitignore`)
- ✅ Utiliser GitHub Secrets pour les credentials VPS
- ✅ Tester d'abord en mode paper trading
- ✅ Commencer avec petit montant (`BET_AMOUNT_USDC=1`)

## 📝 Logs

Le bot génère des logs détaillés:
- **Console**: Logs temps réel
- **Fichier**: `bot.log` avec rotation automatique (10MB × 5)

## 🐛 Troubleshooting

**Pas de marchés trouvés:**
- Les marchés 15-min sont créés toutes les 15 minutes
- Marche surtout pendant les heures actives US/EU

**Erreur de connexion Polymarket:**
- Vérifier `POLYGON_PRIVATE_KEY` et `FUNDER_ADDRESS`
- Vérifier `SIGNATURE_TYPE` (1 pour Magic/Email)

**Bot crash:**
- Vérifier les logs: `tail -f bot.log`
- System logs: `journalctl -u polygraalx -n 50`

## 📞 Support

- Consultez `DEPLOY.md` pour le guide complet
- Lisez `implementation_plan.md` pour l'architecture
- Testez en mode `PAPER_TRADING=true` avant production

## ⚖️ Disclaimer

Ce bot est fourni à titre éducatif. Le trading comporte des risques. Utilisez à vos propres risques.

## 📜 License

MIT
