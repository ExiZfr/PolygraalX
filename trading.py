"""
PolyGraalX Trading Engine Module

Handles all interactions with Polymarket CLOB via py_clob_client.
"""

import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Optional, Dict, Any

from py_clob_client.client import ClobClient
from py_clob_client.clob_types import (
    MarketOrderArgs,
    OrderArgs,
    OrderType,
    OpenOrderParams
)
from py_clob_client.order_builder.constants import BUY, SELL

from config import Config
from market_discovery import Market

logger = logging.getLogger(__name__)

# Polymarket CLOB API
CLOB_HOST = "https://clob.polymarket.com"
CHAIN_ID = 137  # Polygon Mainnet


@dataclass
class OrderResult:
    """Result of an order execution."""
    
    success: bool
    order_id: Optional[str] = None
    shares: float = 0.0
    avg_price: float = 0.0
    amount_spent: float = 0.0
    error: Optional[str] = None
    raw_response: Optional[Dict[str, Any]] = None
    timestamp: datetime = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now(timezone.utc)


class TradingEngine:
    """
    Polymarket CLOB trading engine.
    
    Handles order creation, submission, and management via py_clob_client.
    """
    
    def __init__(self, config: Config):
        """
        Initialize trading engine with configuration.
        
        Args:
            config: Application configuration with wallet credentials
        """
        self.config = config
        self._client: Optional[ClobClient] = None
        self._initialized = False
    
    def _get_client(self) -> ClobClient:
        """Get or create authenticated CLOB client."""
        if self._client is None:
            logger.info("Initializing Polymarket CLOB client...")
            
            self._client = ClobClient(
                host=CLOB_HOST,
                key=self.config.private_key,
                chain_id=CHAIN_ID,
                signature_type=self.config.signature_type,
                funder=self.config.funder_address
            )
            
            # Create/derive API credentials
            try:
                creds = self._client.create_or_derive_api_creds()
                self._client.set_api_creds(creds)
                self._initialized = True
                logger.info("CLOB client initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize CLOB client: {e}")
                raise
        
        return self._client
    
    def test_connection(self) -> bool:
        """
        Test connection to Polymarket CLOB.
        
        Returns:
            True if connection successful
        """
        try:
            client = self._get_client()
            ok = client.get_ok()
            server_time = client.get_server_time()
            logger.info(f"CLOB connection OK: {ok}, Server time: {server_time}")
            return True
        except Exception as e:
            logger.error(f"CLOB connection test failed: {e}")
            return False
    
    def get_midpoint(self, token_id: str) -> Optional[float]:
        """
        Get current midpoint price for a token.
        
        Args:
            token_id: Polymarket token ID
            
        Returns:
            Midpoint price or None
        """
        try:
            client = self._get_client()
            mid = client.get_midpoint(token_id)
            return float(mid) if mid else None
        except Exception as e:
            logger.error(f"Failed to get midpoint for {token_id}: {e}")
            return None
    
    def get_best_price(self, token_id: str, side: str = "BUY") -> Optional[float]:
        """
        Get best available price for buying/selling a token.
        
        Args:
            token_id: Polymarket token ID
            side: "BUY" or "SELL"
            
        Returns:
            Best price or None
        """
        try:
            client = self._get_client()
            price = client.get_price(token_id, side=side)
            return float(price) if price else None
        except Exception as e:
            logger.error(f"Failed to get price for {token_id}: {e}")
            return None
    
    def place_market_order(
        self,
        market: Market,
        direction: str,
        amount_usdc: float
    ) -> OrderResult:
        """
        Place a market order (Fill-or-Kill).
        
        Args:
            market: Target market
            direction: "YES" or "NO"
            amount_usdc: Amount to spend in USDC
            
        Returns:
            OrderResult with execution details
        """
        token_id = market.token_id_yes if direction == "YES" else market.token_id_no
        
        logger.info(
            f"Placing market order: {direction} on {market.asset} "
            f"@ ${market.strike_price:,.0f}, amount=${amount_usdc}"
        )
        
        try:
            client = self._get_client()
            
            # Create market order
            order_args = MarketOrderArgs(
                token_id=token_id,
                amount=amount_usdc,
                side=BUY,
                order_type=OrderType.FOK  # Fill-or-Kill
            )
            
            # Sign the order
            signed_order = client.create_market_order(order_args)
            
            # Submit the order
            response = client.post_order(signed_order, OrderType.FOK)
            
            logger.info(f"Order response: {response}")
            
            # Parse response
            order_id = response.get("orderID") or response.get("order_id")
            
            if order_id:
                return OrderResult(
                    success=True,
                    order_id=order_id,
                    amount_spent=amount_usdc,
                    raw_response=response
                )
            else:
                return OrderResult(
                    success=False,
                    error="No order ID in response",
                    raw_response=response
                )
                
        except Exception as e:
            logger.error(f"Market order failed: {e}")
            return OrderResult(
                success=False,
                error=str(e)
            )
    
    def place_limit_order(
        self,
        market: Market,
        direction: str,
        price: float,
        size: float
    ) -> OrderResult:
        """
        Place a limit order (Good-Till-Cancel).
        
        Args:
            market: Target market
            direction: "YES" or "NO"
            price: Limit price (0-1)
            size: Number of shares
            
        Returns:
            OrderResult with execution details
        """
        token_id = market.token_id_yes if direction == "YES" else market.token_id_no
        
        logger.info(
            f"Placing limit order: {direction} on {market.asset} "
            f"price={price:.2f}, size={size:.2f}"
        )
        
        try:
            client = self._get_client()
            
            order_args = OrderArgs(
                token_id=token_id,
                price=price,
                size=size,
                side=BUY
            )
            
            signed_order = client.create_order(order_args)
            response = client.post_order(signed_order, OrderType.GTC)
            
            logger.info(f"Limit order response: {response}")
            
            order_id = response.get("orderID") or response.get("order_id")
            
            return OrderResult(
                success=bool(order_id),
                order_id=order_id,
                raw_response=response,
                error=None if order_id else "No order ID in response"
            )
            
        except Exception as e:
            logger.error(f"Limit order failed: {e}")
            return OrderResult(success=False, error=str(e))
    
    def sell_position(
        self,
        token_id: str,
        shares: float,
        min_price: Optional[float] = None
    ) -> OrderResult:
        """
        Sell (close) a position.
        
        Args:
            token_id: Token to sell
            shares: Number of shares to sell
            min_price: Minimum acceptable price (optional)
            
        Returns:
            OrderResult with execution details
        """
        logger.info(f"Selling position: {shares} shares of {token_id[:16]}...")
        
        try:
            client = self._get_client()
            
            if min_price is None:
                # Market sell
                order_args = MarketOrderArgs(
                    token_id=token_id,
                    amount=shares,  # Sell by shares
                    side=SELL,
                    order_type=OrderType.FOK
                )
                signed_order = client.create_market_order(order_args)
                response = client.post_order(signed_order, OrderType.FOK)
            else:
                # Limit sell
                order_args = OrderArgs(
                    token_id=token_id,
                    price=min_price,
                    size=shares,
                    side=SELL
                )
                signed_order = client.create_order(order_args)
                response = client.post_order(signed_order, OrderType.GTC)
            
            logger.info(f"Sell order response: {response}")
            
            order_id = response.get("orderID") or response.get("order_id")
            
            return OrderResult(
                success=bool(order_id),
                order_id=order_id,
                shares=shares,
                raw_response=response,
                error=None if order_id else "No order ID in response"
            )
            
        except Exception as e:
            logger.error(f"Sell order failed: {e}")
            return OrderResult(success=False, error=str(e))
    
    def get_open_orders(self) -> list:
        """
        Get all open orders for the account.
        
        Returns:
            List of open order dictionaries
        """
        try:
            client = self._get_client()
            orders = client.get_orders(OpenOrderParams())
            return orders if orders else []
        except Exception as e:
            logger.error(f"Failed to get open orders: {e}")
            return []
    
    def cancel_order(self, order_id: str) -> bool:
        """
        Cancel a specific order.
        
        Args:
            order_id: Order ID to cancel
            
        Returns:
            True if cancellation successful
        """
        try:
            client = self._get_client()
            client.cancel(order_id)
            logger.info(f"Cancelled order: {order_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to cancel order {order_id}: {e}")
            return False
    
    def cancel_all_orders(self) -> bool:
        """
        Cancel all open orders.
        
        Returns:
            True if cancellation successful
        """
        try:
            client = self._get_client()
            client.cancel_all()
            logger.info("Cancelled all open orders")
            return True
        except Exception as e:
            logger.error(f"Failed to cancel all orders: {e}")
            return False
    
    @property
    def is_initialized(self) -> bool:
        """Check if trading engine is initialized."""
        return self._initialized
