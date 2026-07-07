from datetime import date, datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from database import applications_collection
from routes.auth import get_current_user
from routes.notifications import fire_and_forget, notify_application_update

router = APIRouter(prefix="/applications", tags=["Applications"])

# Allowed application stages, in order.
STATUS_OPTIONS = ["Applied", "Interview", "Selected", "Rejected"]


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


def _clean_status(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    value = value.strip().title()
    if value not in STATUS_OPTIONS:
        raise ValueError(f"Status must be one of: {', '.join(STATUS_OPTIONS)}")
    return value


class ApplicationCreate(BaseModel):
    company: str = Field(min_length=1, max_length=150)
    role: str = Field(default="", max_length=150)
    status: str = Field(default="Applied")
    applied_date: Optional[str] = None
    link: str = Field(default="", max_length=300)
    notes: str = Field(default="", max_length=1000)

    @field_validator("applied_date", mode="before")
    @classmethod
    def validate_date(cls, value):
        return _clean_date(value)

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, value):
        return _clean_status(value) or "Applied"


class ApplicationUpdate(BaseModel):
    company: Optional[str] = Field(default=None, min_length=1, max_length=150)
    role: Optional[str] = Field(default=None, max_length=150)
    status: Optional[str] = None
    applied_date: Optional[str] = None
    link: Optional[str] = Field(default=None, max_length=300)
    notes: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("applied_date", mode="before")
    @classmethod
    def validate_date(cls, value):
        return _clean_date(value)

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, value):
        return _clean_status(value)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _application_helper(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "company": doc.get("company", ""),
        "role": doc.get("role", ""),
        "status": doc.get("status", "Applied"),
        "applied_date": doc.get("applied_date"),
        "link": doc.get("link", ""),
        "notes": doc.get("notes", ""),
    }


def _parse_id(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(status_code=400, detail="Invalid id")
    return ObjectId(value)


# ---------------------------------------------------------------------------
# CRUD
# ---------------------------------------------------------------------------

@router.get("")
async def list_applications(current_user: dict = Depends(get_current_user)):
    cursor = applications_collection.find(
        {"user_id": current_user["_id"]}
    ).sort("applied_date", -1)
    applications = [_application_helper(doc) async for doc in cursor]

    counts = {option: 0 for option in STATUS_OPTIONS}
    for app in applications:
        if app["status"] in counts:
            counts[app["status"]] += 1

    return {
        "applications": applications,
        "counts": counts,
        "total": len(applications),
        "status_options": STATUS_OPTIONS,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def add_application(
    application: ApplicationCreate,
    current_user: dict = Depends(get_current_user),
):
    doc = application.model_dump()
    doc.update({"user_id": current_user["_id"], "created_at": datetime.now(timezone.utc)})
    result = await applications_collection.insert_one(doc)
    created = await applications_collection.find_one({"_id": result.inserted_id})
    return _application_helper(created)


@router.patch("/{application_id}")
async def update_application(
    application_id: str,
    changes: ApplicationUpdate,
    current_user: dict = Depends(get_current_user),
):
    update_data = changes.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    doc = await applications_collection.find_one_and_update(
        {"_id": _parse_id(application_id), "user_id": current_user["_id"]},
        {"$set": update_data},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Application not found")

    if "status" in update_data:
        fire_and_forget(
            notify_application_update(
                current_user["_id"],
                doc.get("company", ""),
                doc.get("role", ""),
                update_data["status"],
            )
        )
    return _application_helper(doc)


@router.delete("/{application_id}")
async def delete_application(
    application_id: str,
    current_user: dict = Depends(get_current_user),
):
    result = await applications_collection.delete_one(
        {"_id": _parse_id(application_id), "user_id": current_user["_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application removed", "id": application_id}
