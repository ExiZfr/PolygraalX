import asyncio
import logging
import os
from aiogram import Bot, Dispatcher
from aiogram.fsm.storage.memory import MemoryStorage
from bot.handlers import start

logging.basicConfig(level=logging.INFO)

async def main():
    bot_token = os.getenv("BOT_TOKEN")
    if not bot_token:
        logging.error("BOT_TOKEN is not set")
        return

    bot = Bot(token=bot_token)
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(start.router)

    logging.info("Starting bot...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
