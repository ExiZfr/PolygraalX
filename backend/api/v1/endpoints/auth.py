from fastapi import APIRouter, Depends
from backend.api.v1 import deps
from backend.models.user import User

router = APIRouter()

@router.post("/login")
def login(current_user: User = Depends(deps.get_current_user)):
    return {
        "status": "ok",
        "user": {
            "id": current_user.id,
            "telegram_id": current_user.telegram_id,
            "username": current_user.username,
            "is_allowed": current_user.is_allowed
        }
    }

@router.get("/me")
def read_users_me(current_user: User = Depends(deps.get_current_user)):
    return current_user
