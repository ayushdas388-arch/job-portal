"""Server-side Google reCAPTCHA v2 verification.

Only needs the secret key (paired with the site key used on the frontend).
When no secret key is configured the portal treats captcha as disabled so
local/dev sign-in keeps working without a Google account.
"""
import logging

import httpx

from config import RECAPTCHA_SECRET_KEY, RECAPTCHA_SITE_KEY

logger = logging.getLogger(__name__)

VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"
_TIMEOUT = 10.0


def site_key() -> str:
    return RECAPTCHA_SITE_KEY


def is_configured() -> bool:
    """True only when BOTH keys are set.

    The frontend needs the site key to render the widget and the backend needs
    the secret key to verify. If only one is present the flow is broken, so we
    treat captcha as disabled (and warn) rather than lock everyone out.
    """
    if RECAPTCHA_SECRET_KEY and not RECAPTCHA_SITE_KEY:
        logger.warning("RECAPTCHA_SECRET_KEY set but RECAPTCHA_SITE_KEY missing; captcha disabled.")
    if RECAPTCHA_SITE_KEY and not RECAPTCHA_SECRET_KEY:
        logger.warning("RECAPTCHA_SITE_KEY set but RECAPTCHA_SECRET_KEY missing; captcha disabled.")
    return bool(RECAPTCHA_SECRET_KEY and RECAPTCHA_SITE_KEY)


async def verify_token(token: str, remote_ip: str | None = None) -> bool:
    """Validate a reCAPTCHA response token with Google.

    Returns True when the token is valid. If captcha is not configured we
    skip the check and return True so the app stays usable without keys.
    Never raises — network/parse errors count as a failed verification.
    """
    if not is_configured():
        return True
    if not token:
        return False

    payload = {"secret": RECAPTCHA_SECRET_KEY, "response": token}
    if remote_ip:
        payload["remoteip"] = remote_ip

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.post(VERIFY_URL, data=payload)
        data = resp.json()
    except Exception as exc:  # network / parse errors must not 500 the request
        logger.warning("reCAPTCHA verify error: %s", exc)
        return False

    if not data.get("success"):
        logger.info("reCAPTCHA rejected: %s", data.get("error-codes"))
    return bool(data.get("success"))
