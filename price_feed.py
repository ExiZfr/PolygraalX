"""
PolyGraalX Price Feed Module

Async Binance WebSocket price streaming with rolling window
for volatility calculations.
"""

import asyncio
import logging
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional, Callable, Any

import ccxt.pro as ccxtpro

logger = logging.getLogger(__name__)


@dataclass
class PricePoint:
    """Single price observation."""
    price: float
    timestamp: datetime
    symbol: str


@dataclass
class PriceWindow:
    """Rolling window of price observations for an asset."""
    
    symbol: str
    window_seconds: int = 60
    prices: deque = field(default_factory=deque)
    current_price: float = 0.0
    last_update: Optional[datetime] = None
    
    def add(self, price: float, timestamp: Optional[datetime] = None) -> None:
        """Add a new price observation."""
        if timestamp is None:
            timestamp = datetime.now(timezone.utc)
        
        self.current_price = price
        self.last_update = timestamp
        
        point = PricePoint(price=price, timestamp=timestamp, symbol=self.symbol)
        self.prices.append(point)
        
        # Remove old observations outside the window
        cutoff = timestamp.timestamp() - self.window_seconds
        while self.prices and self.prices[0].timestamp.timestamp() < cutoff:
            self.prices.popleft()
    
    def get_prices(self) -> List[float]:
        """Get list of prices in the window."""
        return [p.price for p in self.prices]
    
    def is_ready(self, min_samples: int = 30) -> bool:
        """Check if we have enough samples for calculations."""
        return len(self.prices) >= min_samples
    
    @property
    def sample_count(self) -> int:
        """Number of samples in the window."""
        return len(self.prices)


class PriceFeed:
    """
    Async Binance WebSocket price feed manager.
    
    Maintains rolling price windows for BTC/USDT and ETH/USDT
    with configurable window sizes.
    """
    
    def __init__(
        self,
        symbols: Optional[List[str]] = None,
        window_seconds: int = 60
    ):
        """
        Args:
            symbols: Trading pairs to track (default: BTC/USDT, ETH/USDT)
            window_seconds: Rolling window size in seconds
        """
        if symbols is None:
            symbols = ["BTC/USDT", "ETH/USDT"]
        
        self.symbols = symbols
        self.window_seconds = window_seconds
        
        # Price windows per symbol
        self.windows: Dict[str, PriceWindow] = {
            symbol: PriceWindow(symbol=symbol, window_seconds=window_seconds)
            for symbol in symbols
        }
        
        # Exchange connection
        self._exchange: Optional[ccxtpro.binance] = None
        self._connected = False
        
        # Callbacks for price updates
        self._callbacks: List[Callable[[str, float], Any]] = []
    
    def _get_exchange(self) -> ccxtpro.binance:
        """Get or create exchange connection."""
        if self._exchange is None:
            self._exchange = ccxtpro.binance({
                'enableRateLimit': True,
                'options': {
                    'defaultType': 'spot',
                }
            })
        return self._exchange
    
    async def close(self) -> None:
        """Close exchange connection."""
        if self._exchange:
            await self._exchange.close()
            self._exchange = None
        self._connected = False
    
    def add_callback(self, callback: Callable[[str, float], Any]) -> None:
        """
        Register a callback for price updates.
        
        Args:
            callback: Function(symbol, price) called on each update
        """
        self._callbacks.append(callback)
    
    async def _notify_callbacks(self, symbol: str, price: float) -> None:
        """Notify all registered callbacks of a price update."""
        for callback in self._callbacks:
            try:
                result = callback(symbol, price)
                if asyncio.iscoroutine(result):
                    await result
            except Exception as e:
                logger.error(f"Callback error: {e}")
    
    def get_window(self, asset: str) -> Optional[PriceWindow]:
        """
        Get price window for an asset.
        
        Args:
            asset: "BTC" or "ETH" (will be converted to symbol)
            
        Returns:
            PriceWindow or None
        """
        # Convert asset to symbol
        symbol_map = {
            "BTC": "BTC/USDT",
            "ETH": "ETH/USDT"
        }
        symbol = symbol_map.get(asset.upper(), f"{asset.upper()}/USDT")
        return self.windows.get(symbol)
    
    def get_current_price(self, asset: str) -> Optional[float]:
        """Get current price for an asset."""
        window = self.get_window(asset)
        if window and window.current_price > 0:
            return window.current_price
        return None
    
    async def stream(self, stop_event: asyncio.Event) -> None:
        """
        Stream price updates from Binance.
        
        Args:
            stop_event: Event to signal stream termination
        """
        exchange = self._get_exchange()
        logger.info(f"Starting price feed for: {self.symbols}")
        
        reconnect_delay = 1
        max_reconnect_delay = 60
        
        while not stop_event.is_set():
            try:
                self._connected = True
                
                # Watch trades for all symbols
                while not stop_event.is_set():
                    try:
                        trades = await asyncio.wait_for(
                            exchange.watch_trades_for_symbols(self.symbols),
                            timeout=30
                        )
                        
                        for trade in trades:
                            symbol = trade['symbol']
                            price = trade['price']
                            timestamp = datetime.fromtimestamp(
                                trade['timestamp'] / 1000,
                                tz=timezone.utc
                            )
                            
                            # Update window
                            if symbol in self.windows:
                                self.windows[symbol].add(price, timestamp)
                                await self._notify_callbacks(symbol, price)
                        
                        # Reset reconnect delay on success
                        reconnect_delay = 1
                        
                    except asyncio.TimeoutError:
                        # No trades in 30s, check if still connected
                        logger.debug("Price feed timeout, checking connection...")
                        continue
                        
            except asyncio.CancelledError:
                logger.info("Price feed cancelled")
                break
                
            except Exception as e:
                self._connected = False
                logger.error(f"Price feed error: {e}")
                
                # Exponential backoff
                logger.warning(f"Reconnecting in {reconnect_delay}s...")
                await asyncio.sleep(reconnect_delay)
                reconnect_delay = min(reconnect_delay * 2, max_reconnect_delay)
                
                # Recreate exchange connection
                await self.close()
    
    async def test_connection(self, timeout: int = 10) -> bool:
        """
        Test connection by fetching a single price update.
        
        Args:
            timeout: Maximum seconds to wait
            
        Returns:
            True if connection successful
        """
        exchange = self._get_exchange()
        
        try:
            trades = await asyncio.wait_for(
                exchange.watch_trades(self.symbols[0]),
                timeout=timeout
            )
            
            if trades:
                logger.info(f"Connection test passed: {trades[0]['symbol']} @ {trades[0]['price']}")
                return True
            
        except asyncio.TimeoutError:
            logger.error("Connection test timed out")
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
        
        return False
    
    @property
    def is_connected(self) -> bool:
        """Check if price feed is connected."""
        return self._connected
    
    @property
    def is_ready(self) -> bool:
        """Check if all windows have enough data."""
        return all(w.is_ready() for w in self.windows.values())
