'''TradingEngine stub for environments where the real trading module is unavailable.

This minimal implementation provides the methods used by the bot during
paper‑trading mode so that the import ``from trading import TradingEngine``
does not raise ``ModuleNotFoundError``.

In a production setup you would replace this file with the full
implementation that wraps the Polymarket CLOB SDK.
'''

from dataclasses import dataclass
from typing import Optional


@dataclass
class OrderResult:
    """Result of an order execution.

    Attributes:
        success: Whether the order succeeded.
        error: Optional error message if failed.
        amount_spent: USDC amount spent (or received on sell).
        order_id: Identifier of the order.
        shares: Number of shares bought/sold.
        avg_price: Average execution price.
    """

    success: bool
    error: Optional[str] = None
    amount_spent: float = 0.0
    order_id: Optional[str] = None
    shares: float = 0.0
    avg_price: float = 0.0


class TradingEngine:
    def __init__(self, config=None):
        """Initialize the engine.

        Args:
            config: Optional configuration object. It is ignored in the stub.
        """
        self.config = config

    def test_connection(self) -> bool:
        """Pretend the CLOB connection is healthy.

        Returns:
            True – indicating the connection test passed.
        """
        return True

    def cancel_all_orders(self) -> None:
        """No‑op placeholder for cancelling open orders.
        """
        pass

    # ------------------------------------------------------------------
    # Minimal helpers used by PositionManager in paper‑trading mode
    # ------------------------------------------------------------------
    def get_midpoint(self, token_id: str) -> Optional[float]:
        """Return a dummy midpoint price for a token.

        In the real implementation this would query the order book.
        Here we simply return a constant price (0.5) to allow calculations.
        """
        return 0.5
    
    def place_market_order(self, market, direction: str, amount_usdc: float) -> OrderResult:
        """Pretend to place a market order.
        
        This is a stub implementation for testing. In production, this would
        interact with the Polymarket CLOB SDK.
        
        Args:
            market: Target market
            direction: "YES" or "NO"
            amount_usdc: Amount to spend in USDC
            
        Returns:
            OrderResult with dummy execution details
        """
        # Simulate execution at midpoint
        price = self.get_midpoint(market.token_id_yes if direction == "YES" else market.token_id_no)
        shares = amount_usdc / price
        
        return OrderResult(
            success=True,
            order_id="dummy_buy_id",
            shares=shares,
            avg_price=price,
            amount_spent=amount_usdc
        )

    def sell_position(self, token_id: str, shares: float) -> OrderResult:
        """Pretend to sell a position.

        Returns a successful OrderResult with a dummy amount received.
        """
        price = self.get_midpoint(token_id)
        amount_received = shares * price
        return OrderResult(
            success=True,
            amount_spent=amount_received,
            order_id="dummy_sell_id",
            shares=shares,
            avg_price=price
        )

