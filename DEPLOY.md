# PolyGraalX - VPS Deployment Guide

## 🚀 Quick Deploy (5 minutes)

### 1. SSH into your VPS

```bash
ssh ubuntu@your-vps-ip
```

### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.10+
sudo apt install -y python3 python3-pip python3-venv git
```

### 3. Clone or Upload the Bot

```bash
# Create directory
mkdir -p ~/polygraalx
cd ~/polygraalx

# If using git
git clone https://github.com/your-repo/polygraalx.git .

# Or upload via SCP from local machine:
# scp -r ./polygraalx/* ubuntu@your-vps-ip:~/polygraalx/
```

### 4. Create Virtual Environment

```bash
cd ~/polygraalx
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Configure Environment

```bash
# Copy template
cp .env.template .env

# Edit with your credentials
nano .env
```

**Required fields:**
```ini
POLYGON_PRIVATE_KEY=0x...your-private-key...
FUNDER_ADDRESS=0x...your-polymarket-proxy-wallet...
SIGNATURE_TYPE=1
```

### 6. Test Run

```bash
# Activate venv
source ~/polygraalx/venv/bin/activate

# Test the bot
python main.py

# You should see:
# - "Configuration loaded successfully"
# - "Testing Polymarket CLOB connection..."
# - "CLOB connection OK"
# - Price feed starting
# - Market scanner starting
```

Press `Ctrl+C` to stop the test.

---

## 🔧 Systemd Service Setup (Auto-Start)

### 1. Install the Service

```bash
# Copy service file
sudo cp ~/polygraalx/polygraalx.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable auto-start on boot
sudo systemctl enable polygraalx

# Start the service
sudo systemctl start polygraalx
```

### 2. Check Status

```bash
# Service status
sudo systemctl status polygraalx

# View logs
sudo journalctl -u polygraalx -f

# Or check bot.log directly
tail -f ~/polygraalx/bot.log
```

### 3. Manage the Service

```bash
# Stop
sudo systemctl stop polygraalx

# Restart
sudo systemctl restart polygraalx

# Disable auto-start
sudo systemctl disable polygraalx
```

---

## 📊 Monitoring

### Real-time Logs

```bash
# System journal (real-time)
sudo journalctl -u polygraalx -f

# Bot log file
tail -f ~/polygraalx/bot.log

# Last 100 lines
tail -n 100 ~/polygraalx/bot.log
```

### Log Rotation

The bot automatically rotates logs:
- Max file size: 10MB
- Keeps 5 backup files
- Total max: ~50MB

### Check if Bot is Running

```bash
# Check process
ps aux | grep polygraalx

# Check systemd status
systemctl is-active polygraalx
```

---

## 🔐 Polymarket Wallet Setup

### Getting Your Credentials

1. **Login to Polymarket** with your preferred method (Email/Metamask)

2. **Find your Proxy Wallet Address:**
   - Go to Profile → Wallet
   - Copy the "Polygon Address" (starts with 0x)
   - This is your `FUNDER_ADDRESS`

3. **Get your Private Key:**
   
   **For Email/Magic Wallet users:**
   - Your signing key was created when you signed up
   - Export it from the Magic SDK or contact support
   
   **For MetaMask users:**
   - Open MetaMask → Account Details → Export Private Key
   - This is your `POLYGON_PRIVATE_KEY`

4. **Signature Type:**
   - `0` = MetaMask / Hardware wallet
   - `1` = Email / Magic wallet (most common)
   - `2` = Browser proxy wallet

### Security Best Practices

```bash
# Restrict .env permissions
chmod 600 ~/polygraalx/.env

# Only readable by owner
ls -la ~/polygraalx/.env
# Should show: -rw-------
```

---

## ⚙️ Configuration Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `BET_AMOUNT_USDC` | 10 | USDC per trade |
| `ZSCORE_THRESHOLD` | 2.5 | Entry trigger (higher = fewer trades) |
| `EXIT_ZSCORE_THRESHOLD` | 0.5 | Exit trigger |
| `MAX_POSITIONS` | 2 | Max concurrent positions |
| `TRADE_ASSETS` | BTC,ETH | Assets to trade |
| `LOG_LEVEL` | INFO | DEBUG for verbose |

---

## 🐛 Troubleshooting

### "POLYGON_PRIVATE_KEY is required"
```bash
# Check .env exists and has content
cat ~/polygraalx/.env
```

### "Failed to connect to Polymarket CLOB"
- Check internet connectivity: `curl https://clob.polymarket.com`
- Verify private key format (must start with 0x)
- Verify signature type matches your wallet

### Bot crashes immediately
```bash
# Check logs for error
sudo journalctl -u polygraalx -n 50

# Try running manually
cd ~/polygraalx
source venv/bin/activate
python main.py
```

### No markets found
- Check that 15-minute BTC/ETH markets exist on Polymarket
- These markets are created every 15 minutes during active hours
- Wait for the next market cycle

### High CPU usage
- Normal during initial price data collection
- Should stabilize after 60 seconds of price data

---

## 📈 Performance Tuning

### For low-memory VPS (1GB RAM)

```bash
# Reduce logging verbosity
LOG_LEVEL=WARNING

# Trade only one asset
TRADE_ASSETS=BTC
```

### For better signal quality

```ini
# More conservative entries
ZSCORE_THRESHOLD=3.0

# Longer lookback window
LOOKBACK_WINDOW=120
```

---

## 🔄 Updates

```bash
# Stop the bot
sudo systemctl stop polygraalx

# Pull updates (if using git)
cd ~/polygraalx
git pull

# Update dependencies
source venv/bin/activate
pip install -r requirements.txt --upgrade

# Restart
sudo systemctl start polygraalx
```

---

## 📞 Support

- Check `bot.log` for detailed error messages
- Review the implementation plan for architecture details
- Ensure you have USDC balance in your Polymarket wallet
