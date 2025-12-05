from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.core.security import validate_telegram_data
from backend.models.user import User

def get_current_user(
    x_telegram_init_data: str = Header(..., alias="X-Telegram-Init-Data"),
    db: Session = Depends(get_db)
) -> User:
    data = validate_telegram_data(x_telegram_init_data)
    if not data:
        raise HTTPException(status_code=401, detail="Invalid Telegram data")
    
    user_data = data.get("user")
    if not user_data:
        raise HTTPException(status_code=400, detail="User data missing")
        
    telegram_id = str(user_data.get("id"))
    username = user_data.get("username")
    
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    
    if not user:
        user = User(telegram_id=telegram_id, username=username, is_allowed=True) # Auto-allow for dev
        db.add(user)
        db.commit()
        db.refresh(user)
        
    return user
