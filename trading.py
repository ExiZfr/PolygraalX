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
    """

    success: bool
    error: Optional[str] = None
    amount_spent: float = 0.0
    order_id: Optional[str] = None


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

    def sell_position(self, token_id: str, shares: float) -> OrderResult:
        """Pretend to sell a position.

        Returns a successful OrderResult with a dummy amount received.
        """
        amount_received = shares * self.get_midpoint(token_id)
        return OrderResult(success=True, amount_spent=amount_received, order_id="dummy_sell_id")

