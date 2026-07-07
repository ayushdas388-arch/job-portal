"""Thin async wrapper around the Telegram Bot HTTP API.

Only needs a bot token (from @BotFather). No webhook / background worker:
linking is done on demand via getUpdates when the user clicks "Verify".
"""
import logging

import httpx

from config import TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME

logger = logging.getLogger(__name__)

API_BASE = "https://api.telegram.org"
_TIMEOUT = 10.0


def is_configured() -> bool:
    """True when a bot token is set, so the portal can talk to Telegram."""
    return bool(TELEGRAM_BOT_TOKEN)


def bot_username() -> str:
    return TELEGRAM_BOT_USERNAME


def _method_url(method: str) -> str:
    return f"{API_BASE}/bot{TELEGRAM_BOT_TOKEN}/{method}"


async def send_message(chat_id, text: str) -> bool:
    """Send an HTML message to a chat. Returns True on success, never raises."""
    if not is_configured():
        return False
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.post(
                _method_url("sendMessage"),
                json={
                    "chat_id": chat_id,
                    "text": text,
                    "parse_mode": "HTML",
                    "disable_web_page_preview": True,
                },
            )
        data = resp.json()
        if not data.get("ok"):
            logger.warning("Telegram sendMessage failed: %s", data)
        return bool(data.get("ok"))
    except Exception as exc:  # network / parse errors must not break the request
        logger.warning("Telegram sendMessage error: %s", exc)
        return False


async def get_updates(limit: int = 100) -> list:
    """Fetch recent bot updates (messages). Returns [] on any failure.

    We do not advance the offset, so the same /start message keeps showing up
    for ~24h — good enough for on-demand account linking.
    """
    if not is_configured():
        return []
    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.get(
                _method_url("getUpdates"),
                params={"limit": limit, "timeout": 0},
            )
        data = resp.json()
        if not data.get("ok"):
            logger.warning("Telegram getUpdates failed: %s", data)
            return []
        return data.get("result", [])
    except Exception as exc:
        logger.warning("Telegram getUpdates error: %s", exc)
        return []
