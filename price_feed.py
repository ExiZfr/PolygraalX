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
        
        # Flag to suppress repeated connection errors
        self._api_unreachable: bool = False
        self._last_error_time: float = 0
        
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
    
    async def _fetch_price_rest(self, symbol: str) -> Optional[float]:
        """
        Fallback: Fetch price via REST API when WebSocket fails.
        
        Args:
            symbol: Trading pair like "BTC/USDT"
            
        Returns:
            Current price or None
        """
        import aiohttp
        import ssl
        
        # Convert symbol format: BTC/USDT -> BTCUSDT
        binance_symbol = symbol.replace("/", "")
        url = f"https://api.binance.com/api/v3/ticker/price?symbol={binance_symbol}"
        
        try:
            # Create SSL context that doesn't verify certificates
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            connector = aiohttp.TCPConnector(ssl=ssl_context)
            async with aiohttp.ClientSession(connector=connector) as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                    if response.status == 200:
                        data = await response.json()
                        return float(data.get("price", 0))
        except Exception as e:
            logger.debug(f"REST fallback failed for {symbol}: {e}")
        
        return None
    
    async def _poll_prices_rest(self, stop_event: asyncio.Event) -> None:
        """
        Fallback polling loop using REST API when WebSocket is unavailable.
        Polls every 2 seconds.
        """
        logger.info("📡 Using REST API fallback for price data (polling every 2s)")
        
        while not stop_event.is_set():
            success = False
            for symbol in self.symbols:
                price = await self._fetch_price_rest(symbol)
                if price and price > 0:
                    timestamp = datetime.now(timezone.utc)
                    if symbol in self.windows:
                        self.windows[symbol].add(price, timestamp)
                        await self._notify_callbacks(symbol, price)
                    success = True
            
            if success:
                self._connected = True
                self._api_unreachable = False
            
            # Poll every 2 seconds
            try:
                await asyncio.wait_for(stop_event.wait(), timeout=2)
            except asyncio.TimeoutError:
                pass
    
    async def stream(self, stop_event: asyncio.Event) -> None:
        """
        Stream price updates from Binance.
        Automatically switches to REST API fallback after WebSocket failures.
        
        Args:
            stop_event: Event to signal stream termination
        """
        exchange = self._get_exchange()
        logger.info(f"Starting price feed for: {self.symbols}")
        
        reconnect_delay = 1
        max_reconnect_delay = 30
        ws_failure_count = 0
        max_ws_failures = 3  # Switch to REST after 3 failures
        
        while not stop_event.is_set():
            # If too many WebSocket failures, switch to REST API
            if ws_failure_count >= max_ws_failures:
                logger.warning(f"⚠️ WebSocket failed {ws_failure_count} times, switching to REST API")
                await self._poll_prices_rest(stop_event)
                return  # REST loop runs until stop_event
            
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
                        
                        # Reset on success
                        reconnect_delay = 1
                        ws_failure_count = 0
                        self._api_unreachable = False
                        
                    except asyncio.TimeoutError:
                        logger.debug("Price feed timeout, checking connection...")
                        continue
                        
            except asyncio.CancelledError:
                logger.info("Price feed cancelled")
                break
                
            except Exception as e:
                self._connected = False
                ws_failure_count += 1
                
                if ws_failure_count < max_ws_failures:
                    logger.warning(f"WebSocket error ({ws_failure_count}/{max_ws_failures}): {e}")
                    logger.info(f"Retrying in {reconnect_delay}s...")
                    await asyncio.sleep(reconnect_delay)
                    reconnect_delay = min(reconnect_delay * 2, max_reconnect_delay)
                    await self.close()
                # If max failures reached, loop will switch to REST on next iteration
    
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
