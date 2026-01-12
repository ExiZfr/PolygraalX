#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                     PolyGraalX - Autonomous VPS Sniper                        ║
║                   Mean Reversion Bot for Polymarket 15-min                    ║
╚══════════════════════════════════════════════════════════════════════════════╝

24/7 autonomous trading bot for Polymarket BTC/ETH 15-minute prediction markets.
Designed for VPS deployment with bulletproof error handling and auto-recovery.

Strategy:
  1. Monitor BTC/ETH prices on Binance via WebSocket
  2. Detect volatility spikes using Z-Score (threshold: ±2.5)
  3. Bet against the move (mean reversion):
     - Price spikes UP → Bet NO (expect reversion down)
     - Price drops DOWN → Bet YES (expect reversion up)
  4. Exit when Z-Score normalizes or market approaches expiry

Author: PolyGraalX
License: MIT
"""

import asyncio
import logging
import logging.handlers
import random
import signal
import sys
from datetime import datetime, timezone
from typing import Optional

from config import Config
from market_discovery import MarketDiscovery, Market
from price_feed import PriceFeed
from volatility import VolatilityDetector, Signal
from trading import TradingEngine
from positions import PositionManager
from paper_trading import PaperTradingEngine, PaperPositionManager

# ══════════════════════════════════════════════════════════════════════════════
# LOGGING SETUP
# ══════════════════════════════════════════════════════════════════════════════

def setup_logging(config: Config) -> logging.Logger:
    """
    Configure logging with file rotation and console output.
    
    Args:
        config: Application configuration
        
    Returns:
        Root logger instance
    """
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, config.log_level))
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Log format
    formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # File handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        config.log_file,
        maxBytes=config.log_max_bytes,
        backupCount=config.log_backup_count,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.DEBUG)  # Log everything to file
    logger.addHandler(file_handler)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(getattr(logging, config.log_level))
    logger.addHandler(console_handler)
    
    return logger


# ══════════════════════════════════════════════════════════════════════════════
# EXPONENTIAL BACKOFF
# ══════════════════════════════════════════════════════════════════════════════

class ExponentialBackoff:
    """
    Exponential backoff with jitter for resilient reconnection.
    """
    
    def __init__(
        self,
        base: float = 1.0,
        max_delay: float = 60.0,
        multiplier: float = 2.0
    ):
        self.base = base
        self.max_delay = max_delay
        self.multiplier = multiplier
        self._current = base
        self._attempts = 0
    
    def next(self) -> float:
        """Get next backoff delay with jitter."""
        delay = self._current
        self._current = min(self._current * self.multiplier, self.max_delay)
        self._attempts += 1
        # Add jitter (±10%)
        jitter = delay * 0.1 * (random.random() * 2 - 1)
        return delay + jitter
    
    def reset(self) -> None:
        """Reset backoff to initial state."""
        self._current = self.base
        self._attempts = 0
    
    @property
    def attempts(self) -> int:
        return self._attempts


# ══════════════════════════════════════════════════════════════════════════════
# MAIN BOT CLASS
# ══════════════════════════════════════════════════════════════════════════════

class PolyGraalX:
    """
    Main trading bot orchestrator.
    
    Coordinates all components and manages the main trading loop.
    """
    
    def __init__(self, config: Config):
        self.config = config
        self.logger = logging.getLogger("PolyGraalX")
        
        # Components
        self.price_feed = PriceFeed(
            symbols=[f"{asset}/USDT" for asset in config.trade_assets],
            window_seconds=config.lookback_window
        )
        
        self.market_discovery = MarketDiscovery(
            min_time_to_expiry=config.min_time_to_expiry,
            max_time_to_expiry=config.max_time_to_expiry,
            scan_interval=30
        )
        
        self.volatility = VolatilityDetector(
            zscore_threshold=config.zscore_threshold,
            pct_threshold=config.pct_move_threshold,
            exit_zscore=config.exit_zscore_threshold
        )
        
        self.trading = TradingEngine(config)
        
        self.positions = PositionManager(
            trading_engine=self.trading,
            max_positions=config.max_positions,
            exit_zscore_threshold=config.exit_zscore_threshold,
            force_exit_before_expiry=config.force_exit_before_expiry
        )
        
        # Control
        self._stop_event = asyncio.Event()
        self._running = False
    
    def _get_zscore(self, asset: str) -> float:
        """Get current Z-Score for an asset."""
        window = self.price_feed.get_window(asset)
        if not window or not window.is_ready():
            return 0.0
        
        return self.volatility.calculate_zscore(
            window.get_prices(),
            window.current_price
        )
    
    async def _check_entry_signals(self) -> None:
        """Check for entry signals on all assets."""
        for asset in self.config.trade_assets:
            try:
                # Skip if we can't open more positions
                if not self.positions.can_open_position(asset):
                    continue
                
                # Get market
                market = self.market_discovery.get_cached_market(asset)
                if not market or not market.is_tradeable:
                    continue
                
                # Get price data
                window = self.price_feed.get_window(asset)
                if not window or not window.is_ready():
                    continue
                
                # Check for signal
                signal = self.volatility.check_entry_signal(
                    asset=asset,
                    prices=window.get_prices(),
                    current_price=window.current_price
                )
                
                if signal:
                    self.logger.info(f"🎯 SIGNAL DETECTED: {signal}")
                    
                    # Execute trade
                    result = self.trading.place_market_order(
                        market=market,
                        direction=signal.direction,
                        amount_usdc=self.config.bet_amount_usdc
                    )
                    
                    if result.success:
                        self.positions.open_position(market, signal, result)
                        self.logger.info(f"✅ Trade executed: {signal.direction} on {asset}")
                    else:
                        self.logger.error(f"❌ Trade failed: {result.error}")
                        
            except Exception as e:
                self.logger.error(f"Error checking signals for {asset}: {e}")
    
    async def _check_exit_conditions(self) -> None:
        """Check and process exits for open positions."""
        closed = await self.positions.process_exits(self._get_zscore)
        
        for position, reason, result in closed:
            if result and result.success:
                self.logger.info(
                    f"✅ Position closed: {position.asset} {position.direction} - {reason.description}"
                )
            else:
                self.logger.error(
                    f"❌ Failed to close position: {position.position_id}"
                )
    
    async def _log_status(self) -> None:
        """Log current bot status."""
        status_lines = []
        
        # Price feed status
        for asset in self.config.trade_assets:
            window = self.price_feed.get_window(asset)
            if window and window.current_price > 0:
                zscore = self._get_zscore(asset)
                status_lines.append(
                    f"{asset}: ${window.current_price:,.2f} (Z={zscore:+.2f}, samples={window.sample_count})"
                )
            else:
                status_lines.append(f"{asset}: No data")
        
        # Market status
        for asset in self.config.trade_assets:
            market = self.market_discovery.get_cached_market(asset)
            if market:
                status_lines.append(
                    f"Market {asset}: {market.question[:50]}... ({market.seconds_to_expiry}s to expiry)"
                )
        
        # Position status
        pos_status = self.positions.get_status()
        status_lines.append(
            f"Positions: {pos_status['open_positions']}/{pos_status['max_positions']}"
        )
        
        self.logger.info(" | ".join(status_lines))
    
    async def _signal_loop(self) -> None:
        """Main signal processing loop."""
        self.logger.info("Starting signal processing loop...")
        
        last_status_log = datetime.now(timezone.utc)
        status_interval = 30  # Log status every 30 seconds
        
        while not self._stop_event.is_set():
            try:
                # Check entry signals
                await self._check_entry_signals()
                
                # Check exit conditions
                await self._check_exit_conditions()
                
                # Periodic status log
                now = datetime.now(timezone.utc)
                if (now - last_status_log).seconds >= status_interval:
                    await self._log_status()
                    last_status_log = now
                
                # Small delay between checks
                await asyncio.sleep(1)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                self.logger.error(f"Signal loop error: {e}", exc_info=True)
                await asyncio.sleep(5)
    
    async def run(self) -> None:
        """Main bot execution."""
        self._running = True
        self.logger.info("=" * 60)
        self.logger.info("PolyGraalX - Autonomous VPS Sniper")
        self.logger.info(f"Assets: {', '.join(self.config.trade_assets)}")
        self.logger.info(f"Bet Amount: ${self.config.bet_amount_usdc}")
        self.logger.info(f"Z-Score Threshold: ±{self.config.zscore_threshold}")
        self.logger.info("=" * 60)
        
        # Test CLOB connection
        self.logger.info("Testing Polymarket CLOB connection...")
        if not self.trading.test_connection():
            self.logger.error("Failed to connect to Polymarket CLOB. Check your credentials.")
            return
        
        try:
            # Run all components concurrently
            await asyncio.gather(
                self.price_feed.stream(self._stop_event),
                self.market_discovery.scan_loop(
                    self.config.trade_assets,
                    self._stop_event
                ),
                self._signal_loop()
            )
        finally:
            self._running = False
            await self._cleanup()
    
    async def _cleanup(self) -> None:
        """Clean up resources on shutdown."""
        self.logger.info("Shutting down...")
        
        # Close open positions
        for position in self.positions.open_positions:
            self.logger.warning(f"Closing position on shutdown: {position}")
            from positions import ExitReason
            self.positions.close_position(
                position,
                ExitReason(code="shutdown", description="Bot shutdown")
            )
        
        # Cancel open orders
        self.trading.cancel_all_orders()
        
        # Close connections
        await self.price_feed.close()
        await self.market_discovery.close()
        
        self.logger.info("Shutdown complete")
    
    def stop(self) -> None:
        """Signal the bot to stop."""
        self.logger.info("Stop signal received")
        self._stop_event.set()


class PaperPolyGraalX(PolyGraalX):
    """
    Paper trading version of the bot.
    
    Uses simulated trading engine with fictional balance.
    """
    
    def __init__(self, config: Config, initial_balance: float = 10.0):
        # Initialize parent components except trading/positions
        self.config = config
        self.logger = logging.getLogger("PolyGraalX-Paper")
        self.initial_balance = initial_balance
        
        # Components
        self.price_feed = PriceFeed(
            symbols=[f"{asset}/USDT" for asset in config.trade_assets],
            window_seconds=config.lookback_window
        )
        
        self.market_discovery = MarketDiscovery(
            min_time_to_expiry=config.min_time_to_expiry,
            max_time_to_expiry=config.max_time_to_expiry,
            scan_interval=30
        )
        
        self.volatility = VolatilityDetector(
            zscore_threshold=config.zscore_threshold,
            pct_threshold=config.pct_move_threshold,
            exit_zscore=config.exit_zscore_threshold
        )
        
        # Paper trading engine instead of real one
        self.trading = PaperTradingEngine(initial_balance=initial_balance)
        
        self.positions = PaperPositionManager(
            trading_engine=self.trading,
            max_positions=config.max_positions,
            exit_zscore_threshold=config.exit_zscore_threshold,
            force_exit_before_expiry=config.force_exit_before_expiry
        )
        
        # Control
        self._stop_event = asyncio.Event()
        self._running = False
    
    async def run(self) -> None:
        """Main bot execution in paper trading mode."""
        self._running = True
        self.logger.info("=" * 60)
        self.logger.info("🎮 PolyGraalX - PAPER TRADING MODE")
        self.logger.info(f"💰 Starting Balance: ${self.initial_balance:.2f}")
        self.logger.info(f"📊 Assets: {', '.join(self.config.trade_assets)}")
        self.logger.info(f"💵 Bet Amount: ${self.config.bet_amount_usdc}")
        self.logger.info(f"📈 Z-Score Threshold: ±{self.config.zscore_threshold}")
        self.logger.info("⚠️  NO REAL TRADES WILL BE EXECUTED")
        self.logger.info("=" * 60)
        
        # Paper trading always passes connection test
        self.trading.test_connection()
        
        async def _status_loop() -> None:
            """Periodically call _log_status while the bot is running."""
            while not self._stop_event.is_set():
                try:
                    await self._log_status()
                except Exception as e:
                    self.logger.error(f"Error in status loop: {e}")
                # Wait 60 seconds (1 minute) or until stop event
                try:
                    await asyncio.wait_for(self._stop_event.wait(), timeout=60)
                except asyncio.TimeoutError:
                    pass

        try:
            await asyncio.gather(
                self.price_feed.stream(self._stop_event),
                self.market_discovery.scan_loop(
                    self.config.trade_assets,
                    self._stop_event
                ),
                self._signal_loop(),
                _status_loop()
            )
        finally:
            self._running = False
            await self._cleanup()
    
    async def _check_exit_conditions(self) -> None:
        """Check and process exits for paper positions."""
        closed = await self.positions.process_exits(self._get_zscore)
        
        for position, reason, result in closed:
            if result and result.success:
                self.logger.info(
                    f"✅ Paper position closed: {position.asset} {position.direction} - {reason}"
                )
    
    async def _log_status(self) -> None:
        """Log current paper trading status."""
        # Get trading statistics
        stats = self.trading.get_statistics()
        pos_status = self.positions.get_status()
        
        # Calculate balance change
        balance_change = self.trading.balance - self.initial_balance
        balance_change_pct = (balance_change / self.initial_balance * 100) if self.initial_balance > 0 else 0
        
        status_lines = ["📝 PAPER TRADING"]
        
        # Balance with change
        balance_emoji = "📈" if balance_change >= 0 else "📉"
        status_lines.append(
            f"{balance_emoji} ${self.trading.balance:.2f} ({balance_change:+.2f} / {balance_change_pct:+.1f}%)"
        )
        
        # P&L
        pnl_emoji = "💰" if stats['total_pnl'] >= 0 else "💸"
        status_lines.append(f"{pnl_emoji} P&L: ${stats['total_pnl']:+.2f}")
        
        # Trades & Win Rate
        if stats['total_trades'] > 0:
            status_lines.append(
                f"🎯 Trades: {stats['total_trades']} (W:{stats['winning_trades']} L:{stats['losing_trades']}) "
                f"WR:{stats['win_rate']:.0f}%"
            )
        
        # Price feed status
        for asset in self.config.trade_assets:
            window = self.price_feed.get_window(asset)
            if window and window.current_price > 0:
                zscore = self._get_zscore(asset)
                status_lines.append(
                    f"{asset}: ${window.current_price:,.2f} (Z={zscore:+.2f})"
                )
        
        # Open positions
        if pos_status['open_positions'] > 0:
            status_lines.append(f"📊 Pos: {pos_status['open_positions']}/{pos_status['max_positions']}")
        
        self.logger.info(" | ".join(status_lines))

    
    async def _cleanup(self) -> None:
        """Clean up and print session summary."""
        self.logger.info("Shutting down paper trading...")
        
        # Close paper positions
        for position in self.positions.open_positions:
            self.positions.close_position(position, "shutdown")
        
        # Print session summary
        self.trading.print_summary()
        
        # Close connections
        await self.price_feed.close()
        await self.market_discovery.close()
        
        self.logger.info("Paper trading session complete")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN ENTRY POINT
# ══════════════════════════════════════════════════════════════════════════════

def display_menu() -> int:
    """Display interactive mode selection menu.
    
    Returns:
        1 for paper trading, 2 for real trading
    """
    print()
    print("╔══════════════════════════════════════════════════════════════════╗")
    print("║               🚀 PolyGraalX - Trading Bot                        ║")
    print("╠══════════════════════════════════════════════════════════════════╣")
    print("║                                                                  ║")
    print("║   [1] 📝 Paper Trading (Simulation avec balance fictive)         ║")
    print("║   [2] 💰 Real Trading  (Trading réel sur Polymarket)             ║")
    print("║                                                                  ║")
    print("╚══════════════════════════════════════════════════════════════════╝")
    print()
    
    while True:
        try:
            choice = input("👉 Choisissez un mode (1 ou 2): ").strip()
            if choice == "1":
                return 1
            elif choice == "2":
                return 2
            else:
                print("❌ Choix invalide. Entrez 1 ou 2.")
        except (EOFError, KeyboardInterrupt):
            print("\n👋 Au revoir!")
            sys.exit(0)


async def main() -> None:
    """Main entry point with interactive mode selection."""
    import os
    
    # Display interactive menu
    mode_choice = display_menu()
    paper_mode = (mode_choice == 1)
    
    # Get paper balance from env or default
    paper_balance = float(os.getenv("PAPER_BALANCE", "10.0"))
    
    # Load configuration
    try:
        config = Config.from_env()
        # Skip validation in paper mode (no real keys needed)
        if not paper_mode:
            config.validate()
    except ValueError as e:
        if not paper_mode:
            print(f"❌ Configuration error: {e}")
            print("📝 Please check your .env file")
            sys.exit(1)
    
    # Setup logging
    logger = setup_logging(config)
    
    if paper_mode:
        print()
        print("═" * 60)
        print("🎮 MODE: PAPER TRADING (Simulation)")
        print(f"💰 Balance initiale: ${paper_balance:.2f}")
        print("⚠️  Aucun trade réel ne sera exécuté")
        print("═" * 60)
        print()
        logger.info("🎮 PAPER TRADING MODE ENABLED")
        logger.info(f"💰 Virtual balance: ${paper_balance:.2f}")
        bot = PaperPolyGraalX(config, initial_balance=paper_balance)
    else:
        print()
        print("═" * 60)
        print("💰 MODE: REAL TRADING")
        print("⚠️  ATTENTION: Des trades RÉELS seront exécutés!")
        print(f"📊 Montant par trade: ${config.bet_amount_usdc}")
        print("═" * 60)
        print()
        
        # Confirmation for real trading
        confirm = input("⚠️  Confirmez-vous le trading réel? (oui/non): ").strip().lower()
        if confirm not in ("oui", "o", "yes", "y"):
            print("❌ Trading annulé.")
            sys.exit(0)
        
        logger.info("💰 REAL TRADING MODE ENABLED")
        bot = PolyGraalX(config)
    
    # Setup signal handlers for graceful shutdown
    loop = asyncio.get_running_loop()
    
    def signal_handler(sig):
        logger.info(f"Received signal {sig}")
        bot.stop()
    
    for sig in (signal.SIGINT, signal.SIGTERM):
        try:
            loop.add_signal_handler(sig, lambda s=sig: signal_handler(s))
        except NotImplementedError:
            # Windows doesn't support add_signal_handler
            pass
    
    # Main loop with exponential backoff
    backoff = ExponentialBackoff(base=1, max_delay=60)
    
    while True:
        try:
            await bot.run()
            break  # Clean exit
            
        except KeyboardInterrupt:
            logger.info("Keyboard interrupt received")
            bot.stop()
            break
            
        except Exception as e:
            logger.error(f"Critical error: {e}", exc_info=True)
            
            delay = backoff.next()
            logger.warning(
                f"Restarting in {delay:.1f}s (attempt {backoff.attempts})..."
            )
            
            try:
                await asyncio.sleep(delay)
            except asyncio.CancelledError:
                break
            
            # Recreate bot for clean restart
            if paper_mode:
                bot = PaperPolyGraalX(config, initial_balance=paper_balance)
            else:
                bot = PolyGraalX(config)
    
    logger.info("PolyGraalX terminated")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
