"""
PolyGraalX Configuration Module

Loads and validates all configuration from environment variables.
"""

import os
from dataclasses import dataclass, field
from typing import List
from dotenv import load_dotenv


@dataclass
class Config:
    """Centralized configuration container."""
    
    # Wallet Configuration
    private_key: str
    funder_address: str
    signature_type: int = 1
    
    # Trading Parameters
    bet_amount_usdc: float = 10.0
    zscore_threshold: float = 2.5
    pct_move_threshold: float = 0.5
    lookback_window: int = 60
    min_time_to_expiry: int = 300
    max_time_to_expiry: int = 840
    
    # Asset Configuration
    trade_assets: List[str] = field(default_factory=lambda: ["BTC", "ETH"])
    
    # Risk Management
    max_positions: int = 2
    exit_zscore_threshold: float = 0.5
    force_exit_before_expiry: int = 120
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "bot.log"
    log_max_bytes: int = 10_000_000
    log_backup_count: int = 5
    
    @classmethod
    def from_env(cls, env_file: str = ".env") -> "Config":
        """
        Load configuration from environment variables.
        
        Args:
            env_file: Path to .env file
            
        Returns:
            Validated Config instance
            
        Raises:
            ValueError: If required configuration is missing
        """
        load_dotenv(env_file)
        
        # Check if paper trading mode
        paper_mode = os.getenv("PAPER_TRADING", "false").lower() in ("true", "1", "yes")
        
        # Required fields (only in real trading mode)
        private_key = os.getenv("POLYGON_PRIVATE_KEY", "").strip()
        funder_address = os.getenv("FUNDER_ADDRESS", "").strip()
        
        # In paper mode, use dummy values if not provided
        if paper_mode:
            if not private_key:
                private_key = "0x" + "0" * 64  # Dummy key for paper trading
            if not funder_address:
                funder_address = "0x" + "0" * 40  # Dummy address for paper trading
        else:
            # Real trading mode - keys are required
            if not private_key:
                raise ValueError("POLYGON_PRIVATE_KEY is required in .env")
            if not funder_address:
                raise ValueError("FUNDER_ADDRESS is required in .env")
        
        # Validate private key format
        if not private_key.startswith("0x"):
            private_key = f"0x{private_key}"
        
        # Validate funder address format
        if not funder_address.startswith("0x"):
            funder_address = f"0x{funder_address}"
        
        # Parse trade assets
        assets_str = os.getenv("TRADE_ASSETS", "BTC,ETH")
        trade_assets = [a.strip().upper() for a in assets_str.split(",")]
        
        return cls(
            private_key=private_key,
            funder_address=funder_address,
            signature_type=int(os.getenv("SIGNATURE_TYPE", "1")),
            bet_amount_usdc=float(os.getenv("BET_AMOUNT_USDC", "10")),
            zscore_threshold=float(os.getenv("ZSCORE_THRESHOLD", "2.5")),
            pct_move_threshold=float(os.getenv("PCT_MOVE_THRESHOLD", "0.5")),
            lookback_window=int(os.getenv("LOOKBACK_WINDOW", "60")),
            min_time_to_expiry=int(os.getenv("MIN_TIME_TO_EXPIRY", "300")),
            max_time_to_expiry=int(os.getenv("MAX_TIME_TO_EXPIRY", "840")),
            trade_assets=trade_assets,
            max_positions=int(os.getenv("MAX_POSITIONS", "2")),
            exit_zscore_threshold=float(os.getenv("EXIT_ZSCORE_THRESHOLD", "0.5")),
            force_exit_before_expiry=int(os.getenv("FORCE_EXIT_BEFORE_EXPIRY", "120")),
            log_level=os.getenv("LOG_LEVEL", "INFO").upper(),
            log_file=os.getenv("LOG_FILE", "bot.log"),
            log_max_bytes=int(os.getenv("LOG_MAX_BYTES", "10000000")),
            log_backup_count=int(os.getenv("LOG_BACKUP_COUNT", "5")),
        )
    
    def validate(self) -> None:
        """
        Validate configuration values.
        
        Raises:
            ValueError: If configuration is invalid
        """
        if len(self.private_key) < 64:
            raise ValueError("POLYGON_PRIVATE_KEY appears to be invalid (too short)")
        
        if len(self.funder_address) != 42:
            raise ValueError("FUNDER_ADDRESS must be 42 characters (0x + 40 hex)")
        
        if self.signature_type not in (0, 1, 2):
            raise ValueError("SIGNATURE_TYPE must be 0, 1, or 2")
        
        if self.bet_amount_usdc <= 0:
            raise ValueError("BET_AMOUNT_USDC must be positive")
        
        if self.zscore_threshold <= 0:
            raise ValueError("ZSCORE_THRESHOLD must be positive")
        
        valid_assets = {"BTC", "ETH"}
        for asset in self.trade_assets:
            if asset not in valid_assets:
                raise ValueError(f"Invalid asset: {asset}. Must be BTC or ETH")
        
        valid_levels = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if self.log_level not in valid_levels:
            raise ValueError(f"LOG_LEVEL must be one of: {valid_levels}")
