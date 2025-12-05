from aiogram import Router, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo

router = Router()

@router.message(Command("start"))
async def cmd_start(message: types.Message):
    # In production, this URL must be HTTPS.
    # For local dev with ngrok, replace this.
    # For now, we assume localhost access or a placeholder.
    webapp_url = "https://google.com" 
    
    kb = [[types.KeyboardButton(text="🚀 Open Dashboard", web_app=WebAppInfo(url=webapp_url))]]
    keyboard = types.ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)
    
    await message.answer(
        "Welcome to Polymarket Bot! 🚀\nClick below to launch.",
        reply_markup=keyboard
    )
