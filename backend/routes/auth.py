import re
import random
import logging
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field, field_validator
from pymongo.errors import DuplicateKeyError

import captcha_service
from config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY
from database import users_collection
from rate_limit import limiter
from email_utils import send_reset_otp_email

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
    profile_image: Optional[str] = None


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
        "profile_image": db_user.get("profile_image", ""),
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
        "profile_image": current_user.get("profile_image", ""),
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
async def forgot_password(data: ForgotPasswordRequest, background_tasks: BackgroundTasks):
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

    # Schedule the actual email to be sent in the background
    background_tasks.add_task(send_reset_otp_email, data.email, otp)

    # Also log it for debugging purposes just in case SMTP fails
    print("\n" + "=" * 50)
    print("  BACKGROUND EMAIL TASK SCHEDULED")
    print(f"  To: {data.email}")
    print(f"  Code: {otp}")
    print("=" * 50 + "\n")

    return {
        "message": "Verification code has been sent to your registered email address.",
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


class ProfileUpdateRequest(BaseModel):
    profile_image: str


@router.patch("/profile")
async def update_profile(
    data: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"profile_image": data.profile_image}}
    )
    return {"message": "Profile updated successfully"}


class GoogleLoginRequest(BaseModel):
    email: str
    name: str
    profile_image: Optional[str] = None
    credential: Optional[str] = None


@router.post("/google")
async def google_login(data: GoogleLoginRequest):
    email = data.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Invalid email from Google account")

    db_user = await users_collection.find_one(
        {"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}}
    )

    if db_user:
        if not db_user.get("profile_image") and data.profile_image:
            await users_collection.update_one(
                {"_id": db_user["_id"]},
                {"$set": {"profile_image": data.profile_image}}
            )
            db_user["profile_image"] = data.profile_image

        token = create_token(str(db_user["_id"]), db_user.get("role", "jobseeker"))
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "role": db_user.get("role", "jobseeker"),
            "name": db_user.get("name", ""),
            "profile_image": db_user.get("profile_image", ""),
        }
    else:
        name_parts = data.name.strip().split(" ", 1)
        first_name = name_parts[0] if name_parts else "Google"
        last_name = name_parts[1] if len(name_parts) > 1 else "User"

        new_user = {
            "first_name": first_name,
            "last_name": last_name,
            "name": data.name.strip() or f"{first_name} {last_name}",
            "email": email,
            "phone": "",
            "password": "",
            "role": "jobseeker",
            "profile_image": data.profile_image or "",
            "created_at": datetime.now(timezone.utc),
        }

        try:
            result = await users_collection.insert_one(new_user)
            user_id = str(result.inserted_id)
        except DuplicateKeyError as exc:
            db_user = await users_collection.find_one({"email": email})
            if not db_user:
                raise HTTPException(status_code=409, detail="Registration failed due to conflict") from exc
            user_id = str(db_user["_id"])
            new_user = db_user

        token = create_token(user_id, "jobseeker")
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "role": "jobseeker",
            "name": new_user.get("name", ""),
            "profile_image": new_user.get("profile_image", ""),
        }


class GoogleCallbackRequest(BaseModel):
    code: str
    redirect_uri: str


@router.post("/google-callback")
async def google_callback(request: GoogleCallbackRequest):
    from config import GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=500,
            detail="Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
        )

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": request.code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": request.redirect_uri,
        "grant_type": "authorization_code",
    }
    
    import requests
    try:
        resp = requests.post(token_url, data=data, timeout=10)
        resp.raise_for_status()
        token_data = resp.json()
    except Exception as exc:
        logger.error(f"Failed to exchange Google OAuth code: {exc}")
        raise HTTPException(
            status_code=400,
            detail="Failed to exchange authorization code with Google."
        )

    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token returned from Google")

    userinfo_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    headers = {"Authorization": f"Bearer {access_token}"}
    try:
        resp = requests.get(userinfo_url, headers=headers, timeout=10)
        resp.raise_for_status()
        user_info = resp.json()
    except Exception as exc:
        logger.error(f"Failed to fetch Google userinfo: {exc}")
        raise HTTPException(
            status_code=400,
            detail="Failed to fetch user profile information from Google."
        )

    email = user_info.get("email", "").strip().lower()
    name = user_info.get("name", "").strip()
    profile_image = user_info.get("picture", "")

    if not email:
        raise HTTPException(status_code=400, detail="Invalid email returned from Google")

    db_user = await users_collection.find_one(
        {"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}}
    )

    if db_user:
        if not db_user.get("profile_image") and profile_image:
            await users_collection.update_one(
                {"_id": db_user["_id"]},
                {"$set": {"profile_image": profile_image}}
            )
            db_user["profile_image"] = profile_image

        token = create_token(str(db_user["_id"]), db_user.get("role", "jobseeker"))
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "role": db_user.get("role", "jobseeker"),
            "name": db_user.get("name", ""),
            "profile_image": db_user.get("profile_image", ""),
        }
    else:
        name_parts = name.split(" ", 1)
        first_name = name_parts[0] if name_parts else "Google"
        last_name = name_parts[1] if len(name_parts) > 1 else "User"

        new_user = {
            "first_name": first_name,
            "last_name": last_name,
            "name": name or f"{first_name} {last_name}",
            "email": email,
            "phone": "",
            "password": "",
            "role": "jobseeker",
            "profile_image": profile_image,
            "created_at": datetime.now(timezone.utc),
        }

        try:
            result = await users_collection.insert_one(new_user)
            user_id = str(result.inserted_id)
        except DuplicateKeyError as exc:
            db_user = await users_collection.find_one({"email": email})
            if not db_user:
                raise HTTPException(status_code=409, detail="Registration failed due to conflict") from exc
            user_id = str(db_user["_id"])
            new_user = db_user

        token = create_token(user_id, "jobseeker")
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "role": "jobseeker",
            "name": new_user.get("name", ""),
            "profile_image": new_user.get("profile_image", ""),
        }



@router.get("/users")
async def get_all_users(request: Request, current_user: dict = Depends(can_manage_jobs)):
    """Fetch all registered users for the admin dashboard."""
    users = await users_collection.find({}, {"password": 0}).sort("created_at", -1).to_list(length=1000)
    
    formatted_users = []
    for u in users:
        formatted_users.append({
            "id": str(u["_id"]),
            "name": u.get("name", ""),
            "email": u.get("email", ""),
            "role": u.get("role", "jobseeker"),
            "created_at": u.get("created_at", "").isoformat() if hasattr(u.get("created_at"), "isoformat") else None
        })
        
    return {"users": formatted_users}

@router.delete("/users/{user_id}")
async def delete_user(user_id: str, request: Request, current_user: dict = Depends(can_manage_jobs)):
    """Delete a user. An admin cannot delete themselves."""
    if str(current_user["_id"]) == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account.")
        
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format.")
        
    result = await users_collection.delete_one({"_id": ObjectId(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found.")
        
    return {"message": "User deleted successfully."}
