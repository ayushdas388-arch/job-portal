"""Telegram notifications: link an account, set preferences, receive alerts.

Linking flow (no webhook needed):
  1. POST /telegram/connect -> we hand the user a short code + a deep link.
  2. User opens the bot and taps Start (sends "/start <code>").
  3. POST /telegram/verify -> we read getUpdates, find that code, and save the
     chat id against the user. From then on we can message them.
"""
import asyncio
import html
import logging
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

import telegram_service
from database import notification_settings_collection
from routes.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notifications", tags=["Notifications"])

DEFAULT_PREFS = {"new_jobs": True, "application_updates": True}
CODE_TTL_MINUTES = 30
_CODE_ALPHABET = string.ascii_uppercase + string.digits


class PrefsUpdate(BaseModel):
    new_jobs: Optional[bool] = None
    application_updates: Optional[bool] = None


def _generate_code() -> str:
    return "".join(secrets.choice(_CODE_ALPHABET) for _ in range(6))


def _prefs_of(doc: Optional[dict]) -> dict:
    return {**DEFAULT_PREFS, **((doc or {}).get("prefs") or {})}


def _status_payload(doc: Optional[dict]) -> dict:
    return {
        "configured": telegram_service.is_configured(),
        "connected": bool(doc and doc.get("telegram_chat_id")),
        "telegram_name": (doc or {}).get("telegram_name", ""),
        "prefs": _prefs_of(doc),
        "bot_username": telegram_service.bot_username(),
    }


async def _get_settings(user_id) -> Optional[dict]:
    return await notification_settings_collection.find_one({"user_id": user_id})


def _extract_chat_for_code(updates: list, code: str) -> Optional[dict]:
    wanted = code.strip().upper()
    candidates = {wanted, f"/START {wanted}"}
    match = None
    for update in updates:
        message = update.get("message") or update.get("edited_message")
        if not message:
            continue
        text = (message.get("text") or "").strip().upper()
        if text in candidates:
            match = message.get("chat")
    return match


@router.get("/status")
async def get_status(current_user: dict = Depends(get_current_user)):
    doc = await _get_settings(current_user["_id"])
    return _status_payload(doc)


@router.post("/telegram/connect")
async def connect_telegram(current_user: dict = Depends(get_current_user)):
    if not telegram_service.is_configured():
        raise HTTPException(
            status_code=503,
            detail="The Telegram bot is not set up yet. The admin needs to set TELEGRAM_BOT_TOKEN.",
        )

    code = _generate_code()
    expires = datetime.now(timezone.utc) + timedelta(minutes=CODE_TTL_MINUTES)
    await notification_settings_collection.update_one(
        {"user_id": current_user["_id"]},
        {
            "$set": {"link_code": code, "link_code_expires": expires},
            "$setOnInsert": {"prefs": DEFAULT_PREFS, "telegram_chat_id": None},
        },
        upsert=True,
    )

    username = telegram_service.bot_username()
    deep_link = f"https://t.me/{username}?start={code}" if username else ""
    return {
        "code": code,
        "bot_username": username,
        "deep_link": deep_link,
        "expires_in_minutes": CODE_TTL_MINUTES,
    }


@router.post("/telegram/verify")
async def verify_telegram(current_user: dict = Depends(get_current_user)):
    doc = await _get_settings(current_user["_id"])
    code = (doc or {}).get("link_code")
    if not doc or not code:
        raise HTTPException(status_code=400, detail="Please click 'Connect' first to get a code.")

    expires = doc.get("link_code_expires")
    if expires and expires.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Code expired. Please click Connect again.")

    updates = await telegram_service.get_updates()
    chat = _extract_chat_for_code(updates, code)
    if not chat:
        raise HTTPException(
            status_code=404,
            detail="No message received yet. Did you press Start on the bot? Then click Verify.",
        )

    chat_id = chat.get("id")
    name = chat.get("first_name") or chat.get("username") or "there"
    await notification_settings_collection.update_one(
        {"user_id": current_user["_id"]},
        {
            "$set": {"telegram_chat_id": chat_id, "telegram_name": name},
            "$unset": {"link_code": "", "link_code_expires": ""},
        },
    )

    await telegram_service.send_message(
        chat_id,
        f"<b>Connected!</b>\nHi {html.escape(str(name))}, you'll receive JobPortal notifications here.",
    )

    doc = await _get_settings(current_user["_id"])
    return _status_payload(doc)


@router.post("/telegram/disconnect")
async def disconnect_telegram(current_user: dict = Depends(get_current_user)):
    await notification_settings_collection.update_one(
        {"user_id": current_user["_id"]},
        {"$set": {"telegram_chat_id": None, "telegram_name": ""}},
    )
    doc = await _get_settings(current_user["_id"])
    return _status_payload(doc)


@router.post("/test")
async def send_test(current_user: dict = Depends(get_current_user)):
    doc = await _get_settings(current_user["_id"])
    chat_id = (doc or {}).get("telegram_chat_id")
    if not chat_id:
        raise HTTPException(status_code=400, detail="Please connect Telegram first.")

    ok = await telegram_service.send_message(
        chat_id,
        "<b>Test notification</b>\nEverything is working correctly with JobPortal.",
    )
    if not ok:
        raise HTTPException(status_code=502, detail="Could not send the message. Please try again.")
    return {"sent": True}


@router.patch("/preferences")
async def update_preferences(
    changes: PrefsUpdate,
    current_user: dict = Depends(get_current_user),
):
    updates = changes.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No preferences were provided.")

    doc = await _get_settings(current_user["_id"])
    prefs = {**_prefs_of(doc), **updates}
    await notification_settings_collection.update_one(
        {"user_id": current_user["_id"]},
        {"$set": {"prefs": prefs}, "$setOnInsert": {"telegram_chat_id": None}},
        upsert=True,
    )
    doc = await _get_settings(current_user["_id"])
    return _status_payload(doc)


async def notify_new_job(job: dict) -> None:
    if not telegram_service.is_configured():
        return
    try:
        title = html.escape(str(job.get("title", "New role")))
        company = html.escape(str(job.get("company", "")))
        location = html.escape(str(job.get("location", "")))
        text = (
            f"<b>New Job Posted</b>\n\n"
            f"<b>{title}</b>\n"
            f"Company: {company or 'N/A'}\n"
            f"Location: {location or 'N/A'}\n\n"
            f"Apply on JobPortal now!"
        )
        cursor = notification_settings_collection.find(
            {"telegram_chat_id": {"$ne": None}}
        )
        async for doc in cursor:
            if not _prefs_of(doc).get("new_jobs"):
                continue
            await telegram_service.send_message(doc["telegram_chat_id"], text)
    except Exception as exc:
        logger.warning("notify_new_job error: %s", exc)


async def notify_application_update(user_id, company: str, role: str, new_status: str) -> None:
    if not telegram_service.is_configured():
        return
    try:
        doc = await notification_settings_collection.find_one(
            {"user_id": user_id, "telegram_chat_id": {"$ne": None}}
        )
        if not doc or not _prefs_of(doc).get("application_updates"):
            return
        company_txt = html.escape(str(company or "")) or "N/A"
        role_txt = html.escape(str(role or ""))
        status_txt = html.escape(str(new_status or ""))
        heading = f"{company_txt}" + (f" - {role_txt}" if role_txt else "")
        await telegram_service.send_message(
            doc["telegram_chat_id"],
            f"<b>Application Update</b>\n\n{heading}\nStatus: <b>{status_txt}</b>",
        )
    except Exception as exc:
        logger.warning("notify_application_update error: %s", exc)


def fire_and_forget(coro) -> None:
    task = asyncio.create_task(coro)

    def _log_result(t: asyncio.Task) -> None:
        if t.cancelled():
            return
        exc = t.exception()
        if exc:
            logger.warning("notification task failed: %s", exc)

    task.add_done_callback(_log_result)
