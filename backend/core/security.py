import hashlib
import hmac
import json
from urllib.parse import parse_qsl
from backend.core.config import settings

def validate_telegram_data(init_data: str) -> dict | None:
    if not settings.BOT_TOKEN:
        return None

    try:
        parsed_data = dict(parse_qsl(init_data))
    except ValueError:
        return None

    if "hash" not in parsed_data:
        return None

    received_hash = parsed_data.pop("hash")
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed_data.items()))
    
    secret_key = hmac.new(b"WebAppData", settings.BOT_TOKEN.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    
    if calculated_hash == received_hash:
        if "user" in parsed_data:
            try:
                parsed_data["user"] = json.loads(parsed_data["user"])
            except json.JSONDecodeError:
                pass
        return parsed_data
    
    return None
