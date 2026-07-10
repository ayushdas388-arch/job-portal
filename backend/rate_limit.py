"""Shared slowapi rate limiter.

Keeps a single Limiter instance so routes and main.py agree on the same
in-memory counter. Limits are per client IP (honouring X-Forwarded-For when
the app sits behind a proxy).
"""
from slowapi import Limiter
from slowapi.util import get_remote_address


def _client_key(request) -> str:
    """Prefer the real client IP when behind a proxy, else the socket peer."""
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


limiter = Limiter(key_func=_client_key, default_limits=[])
