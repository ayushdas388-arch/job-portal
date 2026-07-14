from pathlib import Path
from dotenv import load_dotenv
import os

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def _required(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def _positive_int(name: str, default: int) -> int:
    raw_value = os.getenv(name, str(default))
    try:
        value = int(raw_value)
    except ValueError as exc:
        raise RuntimeError(f"{name} must be an integer") from exc
    if value <= 0:
        raise RuntimeError(f"{name} must be greater than zero")
    return value


MONGO_URL = _required("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "job_portal").strip() or "job_portal"
SECRET_KEY = _required("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256").strip() or "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = _positive_int("ACCESS_TOKEN_EXPIRE_MINUTES", 60)
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
ADZUNA_APP_ID = os.getenv("ADZUNA_APP_ID", "").strip()
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY", "").strip()
ADZUNA_COUNTRY = os.getenv("ADZUNA_COUNTRY", "in").strip().lower() or "in"
EXTERNAL_JOB_LIMIT = _positive_int("EXTERNAL_JOB_LIMIT", 6)
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
TELEGRAM_BOT_USERNAME = os.getenv("TELEGRAM_BOT_USERNAME", "").strip().lstrip("@")
RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY", "").strip()
RECAPTCHA_SITE_KEY = os.getenv("RECAPTCHA_SITE_KEY", "").strip()
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "").strip()
CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
