"""
PolyGraalX Paper Trading Module

Simulates trading with a fictional account for testing purposes.
No real trades are executed - all positions are tracked in memory.
"""

import logging
import random
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

from market_discovery import Market
from volatility import Signal

logger = logging.getLogger(__name__)


@dataclass
class PaperPosition:
    """Simulated position."""
    
    position_id: str
    market: Market
    token_id: str
    direction: str          # "YES" or "NO"
    entry_price: float      # Simulated entry price
    shares: float
    amount_usdc: float
    entry_zscore: float
    entry_time: datetime
    
    @property
    def asset(self) -> str:
        return self.market.asset
    
    @property
    def age_seconds(self) -> int:
        delta = datetime.now(timezone.utc) - self.entry_time
        return int(delta.total_seconds())
    
    @property
    def time_to_expiry(self) -> int:
        return self.market.seconds_to_expiry


@dataclass
class PaperOrderResult:
    """Simulated order result."""
    
    success: bool
    order_id: Optional[str] = None
    shares: float = 0.0
    avg_price: float = 0.0
    amount_spent: float = 0.0
    error: Optional[str] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc)


@dataclass
class TradeRecord:
    """Record of a completed trade for statistics."""
    
    asset: str
    direction: str
    entry_price: float
    exit_price: float
    shares: float
    pnl: float
    pnl_pct: float
    duration_seconds: int
    entry_time: datetime
    exit_time: datetime
    exit_reason: str


class PaperTradingEngine:
    """
    Simulated trading engine for paper trading.
    
    Tracks a fictional balance and simulates order execution
    without making real API calls to Polymarket.
    """
    
    def __init__(self, initial_balance: float = 10.0):
        """
        Args:
            initial_balance: Starting balance in USDC (default $10)
        """
        self.initial_balance = initial_balance
        self.balance = initial_balance
        
        # Simulated positions
        self._positions: Dict[str, PaperPosition] = {}
        self._position_counter = 0
        
        # Trade history
        self._trades: List[TradeRecord] = []
        
        # Statistics
        self._total_trades = 0
        self._winning_trades = 0
        self._losing_trades = 0
        self._total_pnl = 0.0
        
        logger.info(f"📝 Paper Trading initialized with ${initial_balance:.2f}")
    
    def _generate_order_id(self) -> str:
        """Generate fake order ID."""
        self._position_counter += 1
        return f"PAPER_{self._position_counter:06d}"
    
    def _simulate_slippage(self, fair_price: float, side: str) -> float:
        """
        Simulate realistic slippage.
        
        Args:
            fair_price: The "fair" or mid price
            side: "BUY" or "SELL"
            
        Returns:
            Simulated execution price
        """
        # Random slippage 0-2%
        slippage = random.uniform(0.0, 0.02)
        
        if side == "BUY":
            return fair_price * (1 + slippage)
        else:
            return fair_price * (1 - slippage)
    
    def test_connection(self) -> bool:
        """Always returns True for paper trading."""
        logger.info("📝 Paper Trading mode - no real connection needed")
        return True
    
    def get_midpoint(self, token_id: str) -> Optional[float]:
        """
        Simulate getting midpoint price.
        Returns a random price between 0.3 and 0.7 (typical range).
        """
        return random.uniform(0.35, 0.65)
    
    def get_best_price(self, token_id: str, side: str = "BUY") -> Optional[float]:
        """Simulate getting best price."""
        mid = self.get_midpoint(token_id)
        return self._simulate_slippage(mid, side)
    
    def place_market_order(
        self,
        market: Market,
        direction: str,
        amount_usdc: float
    ) -> PaperOrderResult:
        """
        Simulate placing a market order.
        
        Args:
            market: Target market
            direction: "YES" or "NO"
            amount_usdc: Amount to spend in USDC
            
        Returns:
            Simulated order result
        """
        # Check balance
        if amount_usdc > self.balance:
            logger.warning(
                f"📝 Paper: Insufficient balance. "
                f"Need ${amount_usdc:.2f}, have ${self.balance:.2f}"
            )
            return PaperOrderResult(
                success=False,
                error=f"Insufficient balance: ${self.balance:.2f}"
            )
        
        # Simulate execution
        token_id = market.token_id_yes if direction == "YES" else market.token_id_no
        entry_price = self._simulate_slippage(0.5, "BUY")  # Typical price around 0.5
        shares = amount_usdc / entry_price
        
        # Deduct from balance
        self.balance -= amount_usdc
        
        order_id = self._generate_order_id()
        
        logger.info(
            f"📝 Paper Order: {direction} on {market.asset} @ ${market.strike_price:,.0f} | "
            f"Price: {entry_price:.3f} | Shares: {shares:.2f} | "
            f"Spent: ${amount_usdc:.2f} | Balance: ${self.balance:.2f}"
        )
        
        return PaperOrderResult(
            success=True,
            order_id=order_id,
            shares=shares,
            avg_price=entry_price,
            amount_spent=amount_usdc
        )
    
    def sell_position(
        self,
        token_id: str,
        shares: float,
        min_price: Optional[float] = None
    ) -> PaperOrderResult:
        """
        Simulate selling a position.
        
        Args:
            token_id: Token to sell
            shares: Number of shares to sell
            min_price: Minimum acceptable price (ignored in paper trading)
            
        Returns:
            Simulated order result
        """
        # Simulate exit price (with some variance to simulate wins/losses)
        # Slightly biased towards wins for mean reversion strategy
        exit_price = random.uniform(0.45, 0.65)
        proceeds = shares * exit_price
        
        # Add to balance
        self.balance += proceeds
        
        order_id = self._generate_order_id()
        
        logger.info(
            f"📝 Paper Sell: {shares:.2f} shares @ {exit_price:.3f} | "
            f"Proceeds: ${proceeds:.2f} | Balance: ${self.balance:.2f}"
        )
        
        return PaperOrderResult(
            success=True,
            order_id=order_id,
            shares=shares,
            avg_price=exit_price,
            amount_spent=proceeds  # Actually received
        )
    
    def get_open_orders(self) -> list:
        """Paper trading has no pending orders."""
        return []
    
    def cancel_order(self, order_id: str) -> bool:
        """Nothing to cancel in paper trading."""
        return True
    
    def cancel_all_orders(self) -> bool:
        """Nothing to cancel in paper trading."""
        return True
    
    @property
    def is_initialized(self) -> bool:
        """Always initialized for paper trading."""
        return True
    
    # ══════════════════════════════════════════════════════════════════════════
    # PAPER TRADING SPECIFIC METHODS
    # ══════════════════════════════════════════════════════════════════════════
    
    def record_trade(
        self,
        position: PaperPosition,
        exit_price: float,
        exit_reason: str
    ) -> TradeRecord:
        """
        Record a completed trade for statistics.
        
        Args:
            position: The closed position
            exit_price: Exit price
            exit_reason: Reason for exit
            
        Returns:
            TradeRecord for the closed trade
        """
        pnl = (exit_price - position.entry_price) * position.shares
        
        # Adjust PnL for direction
        # If we bet NO and price went down, we win
        # If we bet YES and price went up, we win
        if position.direction == "NO":
            pnl = -pnl  # Reverse for NO bets
        
        pnl_pct = (pnl / position.amount_usdc) * 100 if position.amount_usdc > 0 else 0
        
        record = TradeRecord(
            asset=position.asset,
            direction=position.direction,
            entry_price=position.entry_price,
            exit_price=exit_price,
            shares=position.shares,
            pnl=pnl,
            pnl_pct=pnl_pct,
            duration_seconds=position.age_seconds,
            entry_time=position.entry_time,
            exit_time=datetime.now(timezone.utc),
            exit_reason=exit_reason
        )
        
        self._trades.append(record)
        self._total_trades += 1
        self._total_pnl += pnl
        
        if pnl >= 0:
            self._winning_trades += 1
        else:
            self._losing_trades += 1
        
        emoji = "✅" if pnl >= 0 else "❌"
        logger.info(
            f"{emoji} Paper Trade Closed: {position.asset} {position.direction} | "
            f"PnL: ${pnl:+.2f} ({pnl_pct:+.1f}%) | "
            f"Reason: {exit_reason}"
        )
        
        return record
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get paper trading statistics."""
        win_rate = (
            (self._winning_trades / self._total_trades * 100)
            if self._total_trades > 0 else 0
        )
        
        return {
            "initial_balance": self.initial_balance,
            "current_balance": self.balance,
            "total_pnl": self._total_pnl,
            "total_pnl_pct": (self._total_pnl / self.initial_balance * 100),
            "total_trades": self._total_trades,
            "winning_trades": self._winning_trades,
            "losing_trades": self._losing_trades,
            "win_rate": win_rate,
            "avg_pnl_per_trade": (
                self._total_pnl / self._total_trades
                if self._total_trades > 0 else 0
            )
        }
    
    def print_summary(self) -> None:
        """Print trading session summary."""
        stats = self.get_statistics()
        
        logger.info("=" * 60)
        logger.info("📊 PAPER TRADING SESSION SUMMARY")
        logger.info("=" * 60)
        logger.info(f"Initial Balance:  ${stats['initial_balance']:.2f}")
        logger.info(f"Current Balance:  ${stats['current_balance']:.2f}")
        logger.info(f"Total P&L:        ${stats['total_pnl']:+.2f} ({stats['total_pnl_pct']:+.1f}%)")
        logger.info("-" * 60)
        logger.info(f"Total Trades:     {stats['total_trades']}")
        logger.info(f"Winning Trades:   {stats['winning_trades']}")
        logger.info(f"Losing Trades:    {stats['losing_trades']}")
        logger.info(f"Win Rate:         {stats['win_rate']:.1f}%")
        logger.info(f"Avg P&L/Trade:    ${stats['avg_pnl_per_trade']:+.2f}")
        logger.info("=" * 60)
    
    def get_recent_trades(self, count: int = 10) -> List[TradeRecord]:
        """Get most recent trades."""
        return self._trades[-count:]


class PaperPositionManager:
    """
    Position manager for paper trading.
    
    Wraps the real PositionManager logic but uses PaperTradingEngine.
    """
    
    def __init__(
        self,
        trading_engine: PaperTradingEngine,
        max_positions: int = 2,
        exit_zscore_threshold: float = 0.5,
        force_exit_before_expiry: int = 120
    ):
        self.engine = trading_engine
        self.max_positions = max_positions
        self.exit_zscore_threshold = exit_zscore_threshold
        self.force_exit_before_expiry = force_exit_before_expiry
        
        self._positions: Dict[str, PaperPosition] = {}
        self._counter = 0
    
    def _generate_position_id(self) -> str:
        self._counter += 1
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        return f"paper_{timestamp}_{self._counter:04d}"
    
    @property
    def open_positions(self) -> List[PaperPosition]:
        return list(self._positions.values())
    
    @property
    def position_count(self) -> int:
        return len(self._positions)
    
    def can_open_position(self, asset: str) -> bool:
        if self.position_count >= self.max_positions:
            return False
        for pos in self._positions.values():
            if pos.asset == asset:
                return False
        return True
    
    def get_position_for_asset(self, asset: str) -> Optional[PaperPosition]:
        for pos in self._positions.values():
            if pos.asset == asset:
                return pos
        return None
    
    def open_position(
        self,
        market: Market,
        signal: Signal,
        order_result: PaperOrderResult
    ) -> Optional[PaperPosition]:
        if not order_result.success:
            return None
        
        position_id = self._generate_position_id()
        token_id = (
            market.token_id_yes if signal.direction == "YES"
            else market.token_id_no
        )
        
        position = PaperPosition(
            position_id=position_id,
            market=market,
            token_id=token_id,
            direction=signal.direction,
            entry_price=order_result.avg_price,
            shares=order_result.shares,
            amount_usdc=order_result.amount_spent,
            entry_zscore=signal.zscore,
            entry_time=datetime.now(timezone.utc)
        )
        
        self._positions[position_id] = position
        logger.info(f"📝 Paper Position Opened: {position}")
        return position
    
    def close_position(self, position: PaperPosition, reason: str) -> PaperOrderResult:
        logger.info(f"📝 Closing paper position: {reason}")
        
        result = self.engine.sell_position(
            token_id=position.token_id,
            shares=position.shares
        )
        
        if result.success:
            # Record the trade
            self.engine.record_trade(position, result.avg_price, reason)
            del self._positions[position.position_id]
        
        return result
    
    def check_exit_conditions(
        self,
        position: PaperPosition,
        current_zscore: float
    ) -> Optional[str]:
        """Returns exit reason string or None."""
        
        if abs(current_zscore) <= self.exit_zscore_threshold:
            return f"mean_reversion (Z={current_zscore:.2f})"
        
        if position.direction == "NO" and current_zscore < -self.exit_zscore_threshold:
            return f"over_correction (Z={current_zscore:.2f})"
        
        if position.direction == "YES" and current_zscore > self.exit_zscore_threshold:
            return f"over_correction (Z={current_zscore:.2f})"
        
        if position.time_to_expiry <= self.force_exit_before_expiry:
            return f"time_expiry ({position.time_to_expiry}s left)"
        
        if position.time_to_expiry <= 0:
            return "market_closed"
        
        return None
    
    async def process_exits(self, get_zscore_func) -> List[tuple]:
        closed = []
        
        for position in list(self._positions.values()):
            try:
                current_zscore = get_zscore_func(position.asset)
                exit_reason = self.check_exit_conditions(position, current_zscore)
                
                if exit_reason:
                    result = self.close_position(position, exit_reason)
                    closed.append((position, exit_reason, result))
                    
            except Exception as e:
                logger.error(f"Error processing paper exit: {e}")
        
        return closed
    
    def get_status(self) -> Dict:
        return {
            "mode": "PAPER TRADING",
            "balance": self.engine.balance,
            "open_positions": self.position_count,
            "max_positions": self.max_positions,
            "total_trades": self.engine._total_trades,
            "total_pnl": self.engine._total_pnl,
            "positions": [
                {
                    "id": p.position_id,
                    "asset": p.asset,
                    "direction": p.direction,
                    "shares": p.shares,
                    "age_seconds": p.age_seconds
                }
                for p in self._positions.values()
            ]
        }
