"""
PolyGraalX Market Discovery Module

Automatically discovers and tracks active BTC/ETH 15-minute markets
on Polymarket using the Gamma API.
"""

import asyncio
import re
import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

import aiohttp

logger = logging.getLogger(__name__)

# Gamma API Configuration
GAMMA_API_BASE = "https://gamma-api.polymarket.com"
CRYPTO_TAG_ID = 102467  # Polymarket's 15-minute crypto markets tag


@dataclass
class Market:
    """Represents a tradeable Polymarket 15-min market."""
    
    condition_id: str
    question: str
    asset: str  # "BTC" or "ETH"
    strike_price: float
    end_time: datetime
    token_id_yes: str
    token_id_no: str
    slug: str
    market_id: str
    
    @property
    def seconds_to_expiry(self) -> int:
        """Seconds remaining until market closes."""
        delta = self.end_time - datetime.now(timezone.utc)
        return max(0, int(delta.total_seconds()))
    
    @property
    def is_tradeable(self) -> bool:
        """Check if market is still tradeable (not expired)."""
        return self.seconds_to_expiry > 0
    
    def __repr__(self) -> str:
        return f"Market({self.asset} @ ${self.strike_price:,.0f}, expires in {self.seconds_to_expiry}s)"


class MarketDiscovery:
    """
    Scans Polymarket for active BTC/ETH 15-minute prediction markets.
    
    Uses the Gamma API to find markets matching:
    - Asset: BTC or ETH
    - Duration: 15-minute markets
    - Time window: 5-14 minutes until expiry (tradeable window)
    """
    
    def __init__(
        self,
        min_time_to_expiry: int = 300,
        max_time_to_expiry: int = 840,
        scan_interval: int = 30
    ):
        """
        Args:
            min_time_to_expiry: Minimum seconds before expiry to consider market
            max_time_to_expiry: Maximum seconds before expiry to consider market
            scan_interval: Seconds between market scans
        """
        self.min_time_to_expiry = min_time_to_expiry
        self.max_time_to_expiry = max_time_to_expiry
        self.scan_interval = scan_interval
        
        # Cached active markets
        self._markets: Dict[str, Market] = {}  # asset -> Market
        self._session: Optional[aiohttp.ClientSession] = None
        # Flag to avoid spamming warnings when API is unreachable
        self._api_unreachable: bool = False
        self._last_error_logged: float = 0
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session with SSL verification disabled for problematic networks."""
        if self._session is None or self._session.closed:
            import ssl
            
            timeout = aiohttp.ClientTimeout(total=30, connect=10)
            
            # Create SSL context without certificate verification
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            connector = aiohttp.TCPConnector(ssl=ssl_context)
            self._session = aiohttp.ClientSession(
                timeout=timeout,
                connector=connector
            )
        return self._session
    
    async def close(self) -> None:
        """Close the HTTP session."""
        if self._session and not self._session.closed:
            await self._session.close()
    
    async def _fetch_crypto_markets(self) -> List[Dict[str, Any]]:
        """
        Fetch all active crypto markets from Gamma API with retry logic.
        
        Returns:
            List of market dictionaries
        """
        session = await self._get_session()
        
        url = f"{GAMMA_API_BASE}/markets"
        params = {
            "tag_id": CRYPTO_TAG_ID,  # Use 15-minute crypto markets tag
            "active": "true",
            "closed": "false",
            "limit": 100
        }
        
        # If API was previously unreachable, only retry every 5 minutes
        import time
        if self._api_unreachable:
            if time.time() - self._last_error_logged < 300:  # 5 minutes
                logger.debug("Skipping Gamma API fetch - marked as unreachable")
                return []
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with session.get(url, params=params) as response:
                    response.raise_for_status()
                    data = await response.json()
                    logger.debug(f"Fetched {len(data) if isinstance(data, list) else 0} 15-min crypto markets")
                    # Reset unreachable flag on success
                    self._api_unreachable = False
                    return data if isinstance(data, list) else []
                    
            except aiohttp.ClientConnectorError as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    # Only log warning on first cycle
                    if not self._api_unreachable:
                        logger.warning(
                            f"Connection error to Gamma API (attempt {attempt + 1}/{max_retries}): {e}. "
                            f"Retrying in {wait_time}s..."
                        )
                    await asyncio.sleep(wait_time)
                else:
                    # Only log error once every 5 minutes
                    if not self._api_unreachable:
                        logger.error(
                            f"Failed to connect to Gamma API after {max_retries} attempts. "
                            f"Network may be unreachable. Bot will continue with cached markets. "
                            f"(This message will not repeat for 5 minutes)"
                        )
                    self._api_unreachable = True
                    self._last_error_logged = time.time()
                    return []
                    
            except asyncio.TimeoutError:
                if attempt < max_retries - 1:
                    if not self._api_unreachable:
                        logger.warning(f"Timeout fetching markets (attempt {attempt + 1}/{max_retries}), retrying...")
                    await asyncio.sleep(2 ** attempt)
                else:
                    if not self._api_unreachable:
                        logger.error(f"Timeout after {max_retries} attempts. (This message will not repeat for 5 minutes)")
                    self._api_unreachable = True
                    self._last_error_logged = time.time()
                    return []
                    
            except aiohttp.ClientError as e:
                if not self._api_unreachable:
                    logger.error(f"HTTP error fetching markets: {e}")
                self._api_unreachable = True
                self._last_error_logged = time.time()
                return []
                
            except Exception as e:
                logger.error(f"Unexpected error fetching markets: {e}", exc_info=True)
                return []
        
        return []
    
    def _parse_asset(self, question: str) -> Optional[str]:
        """
        Extract asset (BTC/ETH) from market question.
        
        Args:
            question: Market question text
            
        Returns:
            "BTC", "ETH", or None if not a crypto market
        """
        question_lower = question.lower()
        
        btc_patterns = ["btc", "bitcoin"]
        eth_patterns = ["eth", "ethereum"]
        
        for pattern in btc_patterns:
            if pattern in question_lower:
                return "BTC"
        
        for pattern in eth_patterns:
            if pattern in question_lower:
                return "ETH"
        
        return None
    
    def _is_15min_market(self, question: str, slug: str) -> bool:
        """
        Check if market is a 15-minute duration market.
        
        Args:
            question: Market question text
            slug: Market slug/URL
            
        Returns:
            True if 15-minute market
        """
        combined = f"{question} {slug}".lower()
        
        patterns = [
            r"15[\s-]?min",
            r"15[\s-]?minute",
            r"15m\b",
            "fifteen minute",
            "fifteen-minute"
        ]
        
        for pattern in patterns:
            if re.search(pattern, combined):
                return True
        
        return False
    
    def _parse_strike_price(self, question: str) -> Optional[float]:
        """
        Extract strike price from market question.
        
        Examples:
        - "Will BTC be above $95,000 at 14:15?" -> 95000.0
        - "Will ETH be above $3,500 at 14:30?" -> 3500.0
        
        Args:
            question: Market question text
            
        Returns:
            Strike price as float, or None if not found
        """
        # Pattern: $X,XXX or $X,XXX,XXX with optional decimals
        patterns = [
            r"\$([0-9,]+(?:\.[0-9]+)?)",
            r"(\d{1,3}(?:,\d{3})+)(?:\s*(?:USD|USDT))?",
            r"above\s+(\d+(?:,\d+)*(?:\.\d+)?)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, question)
            if match:
                price_str = match.group(1).replace(",", "")
                try:
                    return float(price_str)
                except ValueError:
                    continue
        
        return None
    
    def _parse_end_time(self, market_data: Dict[str, Any]) -> Optional[datetime]:
        """
        Parse market end time from API response.
        
        Args:
            market_data: Raw market data from API
            
        Returns:
            End time as datetime, or None if parsing fails
        """
        # Try different field names
        end_time_fields = ["end_date_iso", "endDateIso", "end_date", "endDate", "resolution_date"]
        
        for field in end_time_fields:
            if field in market_data and market_data[field]:
                try:
                    # Handle ISO format
                    dt_str = market_data[field]
                    if dt_str.endswith("Z"):
                        dt_str = dt_str[:-1] + "+00:00"
                    return datetime.fromisoformat(dt_str)
                except (ValueError, TypeError):
                    continue
        
        # Try Unix timestamp
        timestamp_fields = ["end_timestamp", "endTimestamp"]
        for field in timestamp_fields:
            if field in market_data:
                try:
                    ts = int(market_data[field])
                    return datetime.fromtimestamp(ts, tz=timezone.utc)
                except (ValueError, TypeError):
                    continue
        
        return None
    
    def _extract_token_ids(self, market_data: Dict[str, Any]) -> tuple[Optional[str], Optional[str]]:
        """
        Extract YES and NO token IDs from market data.
        
        Args:
            market_data: Raw market data from API
            
        Returns:
            Tuple of (token_id_yes, token_id_no)
        """
        token_yes = None
        token_no = None
        
        # Check for tokens array
        tokens = market_data.get("tokens", [])
        if tokens and len(tokens) >= 2:
            for token in tokens:
                outcome = token.get("outcome", "").upper()
                token_id = token.get("token_id") or token.get("tokenId")
                if outcome == "YES":
                    token_yes = token_id
                elif outcome == "NO":
                    token_no = token_id
        
        # Fallback: check for direct token_id fields
        if not token_yes:
            token_yes = market_data.get("token_id_yes") or market_data.get("clobTokenIds", [None, None])[0]
        if not token_no:
            token_no = market_data.get("token_id_no") or market_data.get("clobTokenIds", [None, None])[1] if len(market_data.get("clobTokenIds", [])) > 1 else None
        
        # Another fallback: outcomes structure
        outcomes = market_data.get("outcomes", [])
        if len(outcomes) >= 2 and not (token_yes and token_no):
            for outcome in outcomes:
                if isinstance(outcome, dict):
                    name = outcome.get("name", "").upper()
                    tid = outcome.get("token_id") or outcome.get("tokenId")
                    if name == "YES":
                        token_yes = tid
                    elif name == "NO":
                        token_no = tid
        
        return token_yes, token_no
    
    def _parse_market(self, market_data: Dict[str, Any]) -> Optional[Market]:
        """
        Parse raw API response into Market object.
        
        Args:
            market_data: Raw market data from Gamma API
            
        Returns:
            Market object or None if parsing fails
        """
        question = market_data.get("question", "")
        slug = market_data.get("slug", "")
        
        # Check if this is a 15-min BTC/ETH market
        asset = self._parse_asset(question)
        if not asset:
            return None
        
        if not self._is_15min_market(question, slug):
            return None
        
        # Parse end time
        end_time = self._parse_end_time(market_data)
        if not end_time:
            logger.debug(f"Could not parse end time for: {question}")
            return None
        
        # Check time window
        now = datetime.now(timezone.utc)
        seconds_to_expiry = (end_time - now).total_seconds()
        
        if seconds_to_expiry < self.min_time_to_expiry:
            logger.debug(f"Market too close to expiry ({seconds_to_expiry}s): {question}")
            return None
        
        if seconds_to_expiry > self.max_time_to_expiry:
            logger.debug(f"Market too far from expiry ({seconds_to_expiry}s): {question}")
            return None
        
        # Parse strike price
        strike_price = self._parse_strike_price(question)
        if strike_price is None:
            logger.debug(f"Could not parse strike price: {question}")
            return None
        
        # Get token IDs
        token_yes, token_no = self._extract_token_ids(market_data)
        if not token_yes or not token_no:
            logger.debug(f"Missing token IDs for: {question}")
            return None
        
        return Market(
            condition_id=market_data.get("condition_id", market_data.get("conditionId", "")),
            question=question,
            asset=asset,
            strike_price=strike_price,
            end_time=end_time,
            token_id_yes=token_yes,
            token_id_no=token_no,
            slug=slug,
            market_id=market_data.get("id", "")
        )
    
    async def find_market(self, asset: str) -> Optional[Market]:
        """
        Find the active 15-min market for a specific asset.
        
        Args:
            asset: "BTC" or "ETH"
            
        Returns:
            Market object or None if not found
        """
        markets = await self._fetch_crypto_markets()
        
        for market_data in markets:
            market = self._parse_market(market_data)
            if market and market.asset == asset:
                logger.info(f"Found {asset} market: {market}")
                self._markets[asset] = market
                return market
        
        logger.debug(f"No active {asset} 15-min market found")
        return None
    
    async def find_all_markets(self, assets: List[str]) -> Dict[str, Market]:
        """
        Find active markets for multiple assets.
        
        Args:
            assets: List of assets ["BTC", "ETH"]
            
        Returns:
            Dictionary mapping asset to Market
        """
        markets = await self._fetch_crypto_markets()
        result: Dict[str, Market] = {}
        
        for market_data in markets:
            market = self._parse_market(market_data)
            if market and market.asset in assets and market.asset not in result:
                logger.info(f"Found market: {market}")
                result[market.asset] = market
        
        self._markets.update(result)
        return result
    
    def get_cached_market(self, asset: str) -> Optional[Market]:
        """Get cached market for asset (if still valid)."""
        market = self._markets.get(asset)
        if market and market.is_tradeable:
            return market
        return None
    
    async def scan_loop(self, assets: List[str], stop_event: asyncio.Event) -> None:
        """
        Continuously scan for new markets.
        
        Args:
            assets: Assets to track
            stop_event: Event to signal loop termination
        """
        logger.info(f"Starting market scanner for: {assets}")
        
        while not stop_event.is_set():
            try:
                await self.find_all_markets(assets)
                
                # Log current market status
                for asset in assets:
                    market = self.get_cached_market(asset)
                    if market:
                        logger.info(f"{asset}: {market.question} ({market.seconds_to_expiry}s to expiry)")
                    else:
                        logger.debug(f"{asset}: No active market")
                
            except Exception as e:
                logger.error(f"Market scan error: {e}")
            
            # Wait for next scan
            try:
                await asyncio.wait_for(
                    stop_event.wait(),
                    timeout=self.scan_interval
                )
            except asyncio.TimeoutError:
                pass  # Normal timeout, continue scanning
