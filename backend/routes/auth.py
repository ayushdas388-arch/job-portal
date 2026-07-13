import re
import random
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field, field_validator
from pymongo.errors import DuplicateKeyError

import captcha_service
from config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY
from database import users_collection
from rate_limit import limiter

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class UserRegister(BaseModel):
    first_name: str = Field(min_length=2, max_length=40)
    last_name: str = Field(min_length=2, max_length=40)
    email: str = Field(min_length=5, max_length=254)
    phone: str = Field(min_length=10, max_length=15)
    password: str = Field(min_length=8, max_length=72)
    role: Literal["jobseeker", "company"] = "jobseeker"
    captcha_token: Optional[str] = Field(default=None, max_length=4096)

    @field_validator("first_name", "last_name", mode="before")
    @classmethod
    def clean_name(cls, value: str) -> str:
        return " ".join(value.split())

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        email = value.strip().lower()
        if not EMAIL_PATTERN.fullmatch(email):
            raise ValueError("Enter a valid email address")
        return email


class UserLogin(BaseModel):
    email: str
    password: str = Field(min_length=1, max_length=72)
    captcha_token: Optional[str] = Field(default=None, max_length=4096)

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return value.strip().lower()


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return pwd_context.verify(plain, hashed)
    except (TypeError, ValueError):
        return False


def _client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


async def _ensure_captcha(token: str | None, request: Request) -> None:
    """Block the request when captcha is enabled and the token is invalid."""
    if not captcha_service.is_configured():
        return
    ok = await captcha_service.verify_token(token or "", _client_ip(request))
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Captcha verification failed. Please try again.",
        )


def create_token(user_id: str, role: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized

    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id or not ObjectId.is_valid(user_id):
            raise unauthorized
    except JWTError as exc:
        raise unauthorized from exc

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise unauthorized
    return user


async def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict | None:
    if credentials is None or credentials.scheme.lower() != "bearer":
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id or not ObjectId.is_valid(user_id):
            return None
    except JWTError:
        return None

    return await users_collection.find_one({"_id": ObjectId(user_id)})


def require_roles(*allowed_roles: str):
    allowed = {role.casefold() for role in allowed_roles}

    async def authorize(current_user: dict = Depends(get_current_user)) -> dict:
        role = str(current_user.get("role", "jobseeker")).casefold()
        if role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )
        return current_user

    return authorize


can_manage_jobs = require_roles("company", "admin")


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/hour")
async def register(user: UserRegister, request: Request):
    await _ensure_captcha(user.captcha_token, request)

    existing = await users_collection.find_one(
        {"email": {"$regex": f"^{re.escape(user.email)}$", "$options": "i"}},
        {"_id": 1},
    )
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    new_user = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "name": f"{user.first_name} {user.last_name}",
        "email": user.email,
        "phone": user.phone,
        "password": hash_password(user.password),
        "role": user.role,
        "created_at": datetime.now(timezone.utc),
    }
    try:
        result = await users_collection.insert_one(new_user)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="Email already registered") from exc
    return {"message": "User registered successfully", "id": str(result.inserted_id)}


@router.post("/login")
@limiter.limit("5/minute")
async def login(user: UserLogin, request: Request):
    await _ensure_captcha(user.captcha_token, request)

    db_user = await users_collection.find_one(
        {"email": {"$regex": f"^{re.escape(user.email)}$", "$options": "i"}}
    )
    if not db_user or not verify_password(user.password, db_user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_token(str(db_user["_id"]), db_user.get("role", "jobseeker"))
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "role": db_user.get("role", "jobseeker"),
        "name": db_user.get("name", ""),
    }


@router.get("/config")
async def auth_config():
    """Public config the login/register pages need before rendering."""
    enabled = captcha_service.is_configured()
    return {
        "captcha_enabled": enabled,
        "recaptcha_site_key": captcha_service.site_key() if enabled else "",
    }


@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: dict = Depends(get_current_user)):
    return {
        "id": str(current_user["_id"]),
        "name": current_user.get("name", ""),
        "email": current_user.get("email", ""),
        "role": current_user.get("role", "jobseeker"),
    }


class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return value.strip().lower()


class ResetPasswordRequest(BaseModel):
    email: str
    otp: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=8, max_length=72)

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return value.strip().lower()


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest):
    user = await users_collection.find_one(
        {"email": {"$regex": f"^{re.escape(data.email)}$", "$options": "i"}}
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user found with this email address",
        )

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    expires = datetime.now(timezone.utc) + timedelta(minutes=15)

    await users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_otp": otp, "reset_otp_expires": expires}}
    )

    # Simulate sending email by logging it in the backend terminal console logs
    print("\n" + "=" * 50)
    print("  SIMULATED EMAIL SENT")
    print(f"  To: {data.email}")
    print("  Subject: CareerPilot Password Recovery Verification Code")
    print(f"  Message: Your recovery code is {otp}. Expires in 15 minutes.")
    print("=" * 50 + "\n")

    return {
        "message": "Verification code has been sent to your registered email address (simulated in backend console).",
    }


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest):
    user = await users_collection.find_one(
        {"email": {"$regex": f"^{re.escape(data.email)}$", "$options": "i"}}
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user found with this email address",
        )

    stored_otp = user.get("reset_otp")
    expires = user.get("reset_otp_expires")

    if not stored_otp or stored_otp != data.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code",
        )

    if expires:
        if expires.tzinfo is None:
            expires = expires.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired",
            )

    # Reset password
    await users_collection.update_one(
        {"_id": user["_id"]},
        {
            "$set": {"password": hash_password(data.new_password)},
            "$unset": {"reset_otp": 1, "reset_otp_expires": 1}
        }
    )

    return {"message": "Password has been successfully updated."}


