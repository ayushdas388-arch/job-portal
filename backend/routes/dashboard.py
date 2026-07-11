from datetime import date, datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from database import ats_scores_collection, exams_collection, saved_jobs_collection
from routes.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

def _clean_date(value: Optional[str]) -> Optional[str]:
    """Accept an ISO date (YYYY-MM-DD) or empty; store as a plain string."""
    if not value:
        return None
    value = value.strip()
    if not value:
        return None
    try:
        date.fromisoformat(value)
    except ValueError as exc:
        raise ValueError("Date must be in YYYY-MM-DD format") from exc
    return value

class ExamCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    category: str = Field(default="", max_length=80)
    exam_date: Optional[str] = None
    last_date_to_apply: Optional[str] = None
    link: str = Field(default="", max_length=300)
    progress: int = Field(default=0, ge=0, le=100)

    @field_validator("exam_date", "last_date_to_apply", mode="before")
    @classmethod
    def validate_dates(cls, value):
        return _clean_date(value)

class ExamUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=150)
    category: Optional[str] = Field(default=None, max_length=80)
    exam_date: Optional[str] = None
    last_date_to_apply: Optional[str] = None
    link: Optional[str] = Field(default=None, max_length=300)
    progress: Optional[int] = Field(default=None, ge=0, le=100)

    @field_validator("exam_date", "last_date_to_apply", mode="before")
    @classmethod
    def validate_dates(cls, value):
        return _clean_date(value)

class SavedJobCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    description: str = Field(default="", max_length=300)
    link: str = Field(default="", max_length=300)
    category: str = Field(default="", max_length=80)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _exam_helper(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "category": doc.get("category", ""),
        "exam_date": doc.get("exam_date"),
        "last_date_to_apply": doc.get("last_date_to_apply"),
        "link": doc.get("link", ""),
        "progress": doc.get("progress", 0),
    }

def _saved_job_helper(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name", ""),
        "description": doc.get("description", ""),
        "link": doc.get("link", ""),
        "category": doc.get("category", ""),
    }

def _ats_helper(doc: dict) -> dict:
    created = doc.get("created_at")
    return {
        "id": str(doc["_id"]),
        "file_name": doc.get("file_name", ""),
        "target_role": doc.get("target_role", ""),
        "had_jd": doc.get("had_jd", False),
        "score": doc.get("score", 0),
        "rating": doc.get("rating", ""),
        "matched_count": doc.get("matched_count", 0),
        "missing_count": doc.get("missing_count", 0),
        "created_at": created.isoformat() if created else None,
    }

def _parse_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=400, detail="Invalid id")
    return ObjectId(value)

# ---------------------------------------------------------------------------
# Exams (per-user targets — powers upcoming exams, deadlines, prep progress)
# ---------------------------------------------------------------------------

@router.get("/exams")
async def list_exams(current_user: dict = Depends(get_current_user)):
    cursor = exams_collection.find({"user_id": current_user["_id"]}).sort("exam_date", 1)
    return [_exam_helper(doc) async for doc in cursor]

@router.post("/exams", status_code=status.HTTP_201_CREATED)
async def add_exam(exam: ExamCreate, current_user: dict = Depends(get_current_user)):
    doc = exam.model_dump()
    doc.update({"user_id": current_user["_id"], "created_at": datetime.now(timezone.utc)})
    result = await exams_collection.insert_one(doc)
    created = await exams_collection.find_one({"_id": result.inserted_id})
    return _exam_helper(created)

@router.patch("/exams/{exam_id}")
async def update_exam(
    exam_id: str,
    changes: ExamUpdate,
    current_user: dict = Depends(get_current_user),
):
    update_data = changes.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    doc = await exams_collection.find_one_and_update(
        {"_id": _parse_id(exam_id), "user_id": current_user["_id"]},
        {"$set": update_data},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Exam not found")
    return _exam_helper(doc)

@router.delete("/exams/{exam_id}")
async def delete_exam(exam_id: str, current_user: dict = Depends(get_current_user)):
    result = await exams_collection.delete_one(
        {"_id": _parse_id(exam_id), "user_id": current_user["_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Exam not found")
    return {"message": "Exam removed", "id": exam_id}

# ---------------------------------------------------------------------------
# Saved jobs
# ---------------------------------------------------------------------------

@router.get("/saved-jobs")
async def list_saved_jobs(current_user: dict = Depends(get_current_user)):
    cursor = saved_jobs_collection.find({"user_id": current_user["_id"]}).sort("saved_at", -1)
    return [_saved_job_helper(doc) async for doc in cursor]

@router.post("/saved-jobs", status_code=status.HTTP_201_CREATED)
async def save_job(job: SavedJobCreate, current_user: dict = Depends(get_current_user)):
    existing = await saved_jobs_collection.find_one(
        {"user_id": current_user["_id"], "name": job.name}
    )
    if existing:
        return _saved_job_helper(existing)

    doc = job.model_dump()
    doc.update({"user_id": current_user["_id"], "saved_at": datetime.now(timezone.utc)})
    result = await saved_jobs_collection.insert_one(doc)
    created = await saved_jobs_collection.find_one({"_id": result.inserted_id})
    return _saved_job_helper(created)

@router.delete("/saved-jobs/{saved_id}")
async def remove_saved_job(saved_id: str, current_user: dict = Depends(get_current_user)):
    result = await saved_jobs_collection.delete_one(
        {"_id": _parse_id(saved_id), "user_id": current_user["_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Saved job not found")
    return {"message": "Removed from saved jobs", "id": saved_id}

# ---------------------------------------------------------------------------
# ATS score history
# ---------------------------------------------------------------------------

@router.get("/ats-history")
async def ats_history(current_user: dict = Depends(get_current_user)):
    """Recent ATS scores for this user, newest first, plus quick stats."""
    cursor = (
        ats_scores_collection.find({"user_id": current_user["_id"]})
        .sort("created_at", -1)
        .limit(10)
    )
    items = [_ats_helper(doc) async for doc in cursor]
    latest = items[0]["score"] if items else None
    best = max((i["score"] for i in items), default=None)
    return {"history": items, "latest": latest, "best": best, "count": len(items)}

@router.delete("/ats-history/{score_id}")
async def delete_ats_score(score_id: str, current_user: dict = Depends(get_current_user)):
    result = await ats_scores_collection.delete_one(
        {"_id": _parse_id(score_id), "user_id": current_user["_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Score not found")
    return {"message": "Score removed", "id": score_id}

# ---------------------------------------------------------------------------
# Aggregated summary
# ---------------------------------------------------------------------------

@router.get("/summary")
async def dashboard_summary(current_user: dict = Depends(get_current_user)):
    today = date.today().isoformat()

    exams = [
        _exam_helper(doc)
        async for doc in exams_collection.find({"user_id": current_user["_id"]})
    ]
    saved_jobs = [
        _saved_job_helper(doc)
        async for doc in saved_jobs_collection.find(
            {"user_id": current_user["_id"]}
        ).sort("saved_at", -1)
    ]

    upcoming_exams = sorted(
        (e for e in exams if e["exam_date"] and e["exam_date"] >= today),
        key=lambda e: e["exam_date"],
    )

    deadlines = sorted(
        (
            {
                "exam": e["name"],
                "last_date_to_apply": e["last_date_to_apply"],
                "link": e["link"],
            }
            for e in exams
            if e["last_date_to_apply"] and e["last_date_to_apply"] >= today
        ),
        key=lambda d: d["last_date_to_apply"],
    )

    prep_progress = [
        {"exam": e["name"], "progress": e["progress"]} for e in exams
    ]
    avg_progress = (
        round(sum(p["progress"] for p in prep_progress) / len(prep_progress))
        if prep_progress
        else 0
    )

    # Quick ATS glance for the summary cards.
    ats_docs = [
        _ats_helper(doc)
        async for doc in ats_scores_collection.find(
            {"user_id": current_user["_id"]}
        ).sort("created_at", -1).limit(10)
    ]
    latest_ats = ats_docs[0]["score"] if ats_docs else None
    best_ats = max((d["score"] for d in ats_docs), default=None)

    return {
        "stats": {
            "total_exams": len(exams),
            "upcoming_exams": len(upcoming_exams),
            "saved_jobs": len(saved_jobs),
            "avg_progress": avg_progress,
            "latest_ats": latest_ats,
            "best_ats": best_ats,
        },
        "upcoming_exams": upcoming_exams,
        "deadlines": deadlines,
        "saved_jobs": saved_jobs,
        "prep_progress": prep_progress,
    }
