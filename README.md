# 🚀 PolyGraalX - Autonomous VPS Trading Bot

**v1.0 - Functional Release**

PolyGraalX is an autonomous trading bot for Polymarket 15-minute crypto prediction markets. It uses Z-Score volatility detection to automatically execute trades on BTC and ETH markets.

## ✨ Features

- ✅ **Autonomous Trading**: Detects Z-Score volatility signals (±2.5) and executes trades automatically
- ✅ **15-Minute Markets**: Trades on Polymarket's BTC/ETH 15-minute prediction markets
- ✅ **Paper Trading Mode**: Test strategies without real money
- ✅ **SSL Bypass**: Works on networks with SSL certificate issues
- ✅ **Binance Fallback**: Automatic REST API fallback if WebSocket fails
- ✅ **Smart Exit Logic**: Mean reversion, over-correction, and time-based exits
- ✅ **Position Management**: Max 5 concurrent positions with cooldowns

## 📊 Performance (v1.0 Testing)

**BTC-only Paper Trading Results:**
- **Win Rate**: 75% (6W-2L in BTC trades)
- **P&L**: +28.9% in 15 minutes
- **Avg Win**: +13.6%
- **Best Trade**: +26.0% (YES trade near expiry)

**Why BTC-only?**
- ETH has lower win rate (50% vs 75%)
- BTC volatility is more predictable
- Focus yields better risk/reward

## 🛠️ Installation

### Prerequisites
- Python 3.8+
- Polygon private key
- Polymarket proxy wallet address
- USDC balance on Polymarket

### Quick Setup

1. **Clone the repository**
```bash
git clone https://github.com/ExiZfr/PolygraalX.git
cd PolygraalX
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment**
```bash
cp .env.template .env
# Edit .env with your credentials
```

4. **Run the bot**
```bash
python main.py
```

## ⚙️ Configuration

### Key Parameters (`.env`)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `TRADE_ASSETS` | `BTC` | Assets to trade (BTC recommended) |
| `BET_AMOUNT_USDC` | `2.0` | Amount per trade in USDC |
| `ZSCORE_THRESHOLD` | `2.5` | Z-Score trigger (higher = fewer trades) |
| `PAPER_TRADING` | `true` | Enable paper trading mode |
| `PAPER_BALANCE` | `10.0` | Starting balance for paper mode |

### Advanced Settings

```env
# Market Discovery
MIN_TIME_TO_EXPIRY=30      # Min seconds before expiry to enter
MAX_TIME_TO_EXPIRY=1800    # Max seconds before expiry to enter

# Volatility
LOOKBACK_WINDOW=60         # Rolling window for Z-Score (seconds)
PCT_MOVE_THRESHOLD=0.5     # Fallback % move trigger

# Position Management
MAX_POSITIONS=5            # Max concurrent positions
POSITION_COOLDOWN=60       # Seconds between trades on same asset
```

## 📈 Trading Strategy

### Entry Signals
- **Z-Score > +2.5**: Price spike → Bet NO (mean reversion)
- **Z-Score < -2.5**: Price dip → Bet YES (mean reversion)

### Exit Conditions
1. **Mean Reversion** (|Z| < 1.0): Price returns to normal
2. **Over-Correction**: Signal reverses direction
3. **Time Expiry**: Close all positions < 120s before market close
4. **Max Hold**: 5 minutes max hold time

### Position Sizing
- Fixed bet per trade (default $2)
- Max 5 concurrent positions
- 60s cooldown per asset

## 🎮 Usage

### Paper Trading (Recommended)
```bash
python main.py
# Select [1] Paper Trading
```

**Benefits:**
- Test strategy risk-free
- Validate bot behavior
- Track performance metrics

### Real Trading
```bash
python main.py
# Select [2] Real Trading
# ⚠️ Requires USDC balance and wallet setup
```

## 📋 Requirements

```
py-clob-client==0.26.1
ccxt==4.4.45
numpy==2.2.2
aiohttp==3.11.18
python-dotenv==1.0.1
```

## 🔧 Architecture

```
├── main.py              # Bot orchestration & entry point
├── config.py            # Configuration management
├── price_feed.py        # Binance price stream (WebSocket + REST fallback)
├── market_discovery.py  # Polymarket Gamma API integration
├── volatility.py        # Z-Score calculation & signal generation
├── positions.py         # Position tracking & exit logic
├── trading.py           # CLOB order execution (real mode)
├── paper_trading.py     # Simulated trading engine
└── .env                 # User configuration (not committed)
```

## 🐛 Troubleshooting

### Common Issues

**"No tradeable market found"**
- Markets are only active during specific windows (32s-1800s before expiry)
- Check `bot.log` for detailed market scanner output

**"SSL certificate verification failed"**
- This is automatically handled with SSL bypass
- Binance will fallback to REST API

**"Failed to connect to Polymarket CLOB"**
- Verify `POLYGON_PRIVATE_KEY` and `FUNDER_ADDRESS` in `.env`
- Check `SIGNATURE_TYPE` (usually `1` for Magic wallet)

**Poor performance on ETH**
- ETH has higher volatility and lower win rate
- Recommended: Use `TRADE_ASSETS=BTC` only

## 📊 Monitoring

The bot provides real-time status updates every 60 seconds:

```
📝 PAPER TRADING | 📈 $13.05 (+30.5%) | 💰 P&L: $+1.09 | 
🎯 Trades: 13 (W:9 L:4) WR:69% | BTC: $90,765 (Z=-1.34) | 📊 Pos: 0/5
```

**Metrics:**
- Current balance & % change
- Total P&L (fees included)
- Trades count, wins/losses, win rate
- Current Z-Score per asset
- Open positions count

## 🚀 Deployment (VPS)

See [DEPLOY.md](DEPLOY.md) for detailed VPS deployment instructions.

## ⚠️ Disclaimer

**THIS SOFTWARE IS PROVIDED FOR EDUCATIONAL PURPOSES ONLY.**

- Trading cryptocurrencies and prediction markets involves substantial risk
- Past performance does not guarantee future results
- Only trade with money you can afford to lose
- The authors are not responsible for any financial losses

## 📝 Changelog

### v1.0 (2026-01-12)
- ✅ Fixed SSL connection issues (Binance & Gamma API)
- ✅ Correct tag_id for 15-min markets (102467)
- ✅ Timezone-aware datetime parsing
- ✅ Unix timestamp extraction from slug
- ✅ Widened time window (30-1800s)
- ✅ Strike price optional for Up/Down markets
- ✅ Interactive trading mode selection
- ✅ Paper trading fully functional
- ✅ BTC 75% win rate in testing

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Credits

Built with:
- [py-clob-client](https://github.com/Polymarket/py-clob-client) - Polymarket CLOB client
- [ccxt.pro](https://github.com/ccxt/ccxt) - Binance price feed
- [Gamma API](https://docs.polymarket.com/) - Market discovery

---

**⚡ Happy Trading! Remember: DYOR and manage your risk.**
