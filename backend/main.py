from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from database import close_database, ensure_indexes, ping_database
from routes import ai, applications, auth, dashboard, eligibility, jobs, notifications, prep


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await ping_database()
    await ensure_indexes()
    yield
    close_database()


app = FastAPI(
    title="Job Portal API",
    description="Job Portal API with MongoDB",
    version="1.1.0",
    lifespan=lifespan,
)

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
