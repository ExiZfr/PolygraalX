'''TradingEngine stub for environments where the real trading module is unavailable.

This minimal implementation provides the methods used by the bot during
paper‑trading mode so that the import ``from trading import TradingEngine``
does not raise ``ModuleNotFoundError``.

In a production setup you would replace this file with the full
implementation that wraps the Polymarket CLOB SDK.
'''

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
