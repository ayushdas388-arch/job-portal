from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from config import CORS_ORIGINS
from database import close_database, ensure_indexes, ping_database
from rate_limit import limiter
from routes import ai, applications, ats, auth, dashboard, eligibility, interview, jobs, notifications, prep
from routes import interview


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await ping_database()
    await ensure_indexes()
    yield
    close_database()


SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
}


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add a few defensive HTTP headers to every response."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        for header, value in SECURITY_HEADERS.items():
            response.headers.setdefault(header, value)
        return response


app = FastAPI(
    title="Job Portal API",
    description="Job Portal API with MongoDB",
    version="1.1.0",
    lifespan=lifespan,
)

# Rate limiting (in-memory, per client IP)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(ai.router)
app.include_router(dashboard.router)
app.include_router(applications.router)
app.include_router(notifications.router)
app.include_router(prep.router)
app.include_router(eligibility.router)
app.include_router(interview.router)
app.include_router(ats.router)


@app.get("/")
async def root():
    return {"message": "Job Portal API is running", "version": app.version}


@app.get("/health", tags=["Health"])
async def health():
    try:
        await ping_database()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database is unavailable",
        ) from exc
    return {"status": "ok", "database": "connected"}
