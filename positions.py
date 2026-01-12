"""
PolyGraalX Position Manager Module

Tracks open positions and manages exit conditions.
"""

import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, Optional, List

from market_discovery import Market
from trading import TradingEngine, OrderResult
from volatility import Signal

logger = logging.getLogger(__name__)


@dataclass
class Position:
    """Represents an open trading position."""
    
    position_id: str
    market: Market
    token_id: str
    direction: str          # "YES" or "NO"
    entry_price: float
    shares: float
    amount_usdc: float
    entry_zscore: float
    entry_signal: Signal
    entry_time: datetime
    order_id: Optional[str] = None
    
    @property
    def asset(self) -> str:
        """Asset this position is for."""
        return self.market.asset
    
    @property
    def age_seconds(self) -> int:
        """Seconds since position was opened."""
        delta = datetime.now(timezone.utc) - self.entry_time
        return int(delta.total_seconds())
    
    @property
    def time_to_expiry(self) -> int:
        """Seconds until market expires."""
        return self.market.seconds_to_expiry
    
    def __repr__(self) -> str:
        return (
            f"Position({self.asset} {self.direction}, "
            f"shares={self.shares:.2f}, entry_z={self.entry_zscore:.2f}, "
            f"age={self.age_seconds}s, expiry={self.time_to_expiry}s)"
        )


@dataclass
class ExitReason:
    """Reason for closing a position."""
    
    code: str               # "mean_reversion", "time_expiry", "stop_loss", "manual"
    description: str
    current_zscore: Optional[float] = None
    pnl_estimate: Optional[float] = None


class PositionManager:
    """
    Manages open positions and exit conditions.
    
    Exit conditions:
    1. Mean reversion: Z-Score returns to neutral (±0.5)
    2. Time-based: Force exit 2 minutes before market expiry
    3. Market close: Exit when market resolves
    """
    
    def __init__(
        self,
        trading_engine: TradingEngine,
        max_positions: int = 2,
        exit_zscore_threshold: float = 0.5,
        force_exit_before_expiry: int = 120
    ):
        """
        Args:
            trading_engine: Trading engine for order execution
            max_positions: Maximum concurrent positions
            exit_zscore_threshold: Z-Score threshold for mean reversion exit
            force_exit_before_expiry: Seconds before expiry to force exit
        """
        self.engine = trading_engine
        self.max_positions = max_positions
        self.exit_zscore_threshold = exit_zscore_threshold
        self.force_exit_before_expiry = force_exit_before_expiry
        
        # Open positions: position_id -> Position
        self._positions: Dict[str, Position] = {}
        
        # Losing streak protection (same as paper trading)
        self._consecutive_losses = 0
        self._max_consecutive_losses = 5  # Stop after 5 losses in a row
        self._should_stop = False
        
        # Position counter for ID generation
        self._counter = 0
    
    def _generate_position_id(self) -> str:
        """Generate unique position ID."""
        self._counter += 1
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        return f"pos_{timestamp}_{self._counter:04d}"
    
    @property
    def open_positions(self) -> List[Position]:
        """Get list of open positions."""
        return list(self._positions.values())
    
    @property
    def position_count(self) -> int:
        """Number of open positions."""
        return len(self._positions)
    
    def can_open_position(self, asset: str) -> bool:
        """
        Check if we can open a new position.
        
        Args:
            asset: Asset to check ("BTC" or "ETH")
            
        Returns:
            True if new position can be opened
        """
        # Check max positions
        if self.position_count >= self.max_positions:
            logger.debug(f"Max positions reached ({self.max_positions})")
            return False
        
        # Check if we already have a position in this asset
        for pos in self._positions.values():
            if pos.asset == asset:
                logger.debug(f"Already have position in {asset}")
                return False
        
        return True
    
    def get_position_for_asset(self, asset: str) -> Optional[Position]:
        """Get open position for an asset, if any."""
        for pos in self._positions.values():
            if pos.asset == asset:
                return pos
        return None
    
    def open_position(
        self,
        market: Market,
        signal: Signal,
        order_result: OrderResult
    ) -> Optional[Position]:
        """
        Record a new open position.
        
        Args:
            market: Market being traded
            signal: Signal that triggered the trade
            order_result: Result from order execution
            
        Returns:
            Position object if successful
        """
        if not order_result.success:
            logger.error(f"Cannot open position - order failed: {order_result.error}")
            return None
        
        position_id = self._generate_position_id()
        
        token_id = (
            market.token_id_yes if signal.direction == "YES" 
            else market.token_id_no
        )
        
        # Estimate shares from amount (simplified)
        # In reality, we'd get this from the order execution
        entry_price = self.engine.get_midpoint(token_id) or 0.5
        shares = order_result.amount_spent / entry_price if entry_price > 0 else 0
        
        position = Position(
            position_id=position_id,
            market=market,
            token_id=token_id,
            direction=signal.direction,
            entry_price=entry_price,
            shares=shares,
            amount_usdc=order_result.amount_spent,
            entry_zscore=signal.zscore,
            entry_signal=signal,
            entry_time=datetime.now(timezone.utc),
            order_id=order_result.order_id
        )
        
        self._positions[position_id] = position
        
        logger.info(f"Opened position: {position}")
        return position
    
    def close_position(
        self,
        position: Position,
        reason: ExitReason
    ) -> Optional[OrderResult]:
        """
        Close an open position.
        
        Args:
            position: Position to close
            reason: Reason for closing
            
        Returns:
            OrderResult from sell order
        """
        logger.info(f"Closing position {position.position_id}: {reason.description}")
        
        # Place sell order
        result = self.engine.sell_position(
            token_id=position.token_id,
            shares=position.shares
        )
        
        if result.success:
            # Calculate PnL
            proceeds = result.shares * result.avg_price
            cost = position.amount_usdc
            pnl = proceeds - cost
            
            # Track winning/losing streak
            if pnl >= 0:
                self._consecutive_losses = 0  # Reset losing streak
                logger.info(f"✅ Position profitable: ${pnl:+.2f}")
            else:
                self._consecutive_losses += 1
                logger.warning(f"❌ Position loss: ${pnl:+.2f}")
                
                # Check if we hit max consecutive losses
                if self._consecutive_losses >= self._max_consecutive_losses:
                    self._should_stop = True
                    logger.critical(
                        f"🛑 STOP FORCÉ: {self._consecutive_losses} trades perdants consécutifs! "
                        f"Le bot va s'arrêter par sécurité."
                    )
                # Warn about losing streak
                elif self._consecutive_losses >= 3:
                    logger.warning(
                        f"⚠️ Attention: {self._consecutive_losses} pertes consécutives "
                        f"({self._max_consecutive_losses - self._consecutive_losses} avant arrêt forcé)"
                    )
            
            # Remove from open positions
            del self._positions[position.position_id]
            logger.info(f"Position closed successfully: {position.position_id}")
        else:
            logger.error(f"Failed to close position: {result.error}")
        
        return result
    
    def check_exit_conditions(
        self,
        position: Position,
        current_zscore: float
    ) -> Optional[ExitReason]:
        """
        Check if position should be closed.
        
        Args:
            position: Position to check
            current_zscore: Current Z-Score for the asset
            
        Returns:
            ExitReason if should exit, None otherwise
        """
        # 1. Mean reversion exit
        if abs(current_zscore) <= self.exit_zscore_threshold:
            return ExitReason(
                code="mean_reversion",
                description=f"Z-Score normalized to {current_zscore:.2f}",
                current_zscore=current_zscore
            )
        
        # 2. Over-correction exit
        # If we bet NO (expecting price to drop), but price dropped further
        if position.direction == "NO" and current_zscore < -self.exit_zscore_threshold:
            return ExitReason(
                code="mean_reversion",
                description=f"Price over-corrected (Z={current_zscore:.2f})",
                current_zscore=current_zscore
            )
        
        # If we bet YES (expecting price to rise), but price rose further
        if position.direction == "YES" and current_zscore > self.exit_zscore_threshold:
            return ExitReason(
                code="mean_reversion",
                description=f"Price over-corrected (Z={current_zscore:.2f})",
                current_zscore=current_zscore
            )
        
        # 3. Time-based exit (too close to expiry)
        if position.time_to_expiry <= self.force_exit_before_expiry:
            return ExitReason(
                code="time_expiry",
                description=f"Only {position.time_to_expiry}s until market expiry",
                current_zscore=current_zscore
            )
        
        # 4. Market expired
        if position.time_to_expiry <= 0:
            return ExitReason(
                code="market_closed",
                description="Market has expired",
                current_zscore=current_zscore
            )
        
        return None
    
    async def process_exits(
        self,
        get_zscore_func
    ) -> List[tuple[Position, ExitReason, OrderResult]]:
        """
        Check all positions for exit conditions and close as needed.
        
        Args:
            get_zscore_func: Callable(asset) -> float to get current Z-Score
            
        Returns:
            List of (position, reason, result) tuples for closed positions
        """
        closed = []
        
        for position in list(self._positions.values()):
            try:
                current_zscore = get_zscore_func(position.asset)
                
                exit_reason = self.check_exit_conditions(position, current_zscore)
                
                if exit_reason:
                    result = self.close_position(position, exit_reason)
                    closed.append((position, exit_reason, result))
                    
            except Exception as e:
                logger.error(f"Error processing exit for {position.position_id}: {e}")
        
        return closed
    
    def get_status(self) -> Dict:
        """Get current position manager status for logging."""
        return {
            "open_positions": self.position_count,
            "max_positions": self.max_positions,
            "positions": [
                {
                    "id": p.position_id,
                    "asset": p.asset,
                    "direction": p.direction,
                    "shares": p.shares,
                    "age_seconds": p.age_seconds,
                    "time_to_expiry": p.time_to_expiry
                }
                for p in self._positions.values()
            ]
        }
