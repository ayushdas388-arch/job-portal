import re
from datetime import datetime, timezone
from typing import Annotated

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from pymongo import DESCENDING, ReturnDocument

from database import jobs_collection
from routes.auth import can_manage_jobs
from routes.notifications import fire_and_forget, notify_new_job

router = APIRouter(prefix="/jobs", tags=["Jobs"])


class JobBase(BaseModel):
    title: str = Field(min_length=2, max_length=120)
    description: str = Field(default="", max_length=5000)
    required_skills: list[str] = Field(default_factory=list, max_length=50)
    location: str = Field(default="", max_length=120)
    company: str = Field(min_length=2, max_length=120)

    @field_validator("title", "company", "location", "description", mode="before")
    @classmethod
    def clean_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("required_skills", mode="before")
    @classmethod
    def clean_skills(cls, skills: list[str]) -> list[str]:
        cleaned = []
        seen = set()
        for skill in skills:
            normalized = " ".join(str(skill).split())
            key = normalized.casefold()
            if normalized and key not in seen:
                cleaned.append(normalized)
                seen.add(key)
        return cleaned


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=5000)
    required_skills: list[str] | None = Field(default=None, max_length=50)
    location: str | None = Field(default=None, max_length=120)
    company: str | None = Field(default=None, min_length=2, max_length=120)

    @field_validator("title", "company", "location", "description", mode="before")
    @classmethod
    def clean_text(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else value

    @field_validator("required_skills", mode="before")
    @classmethod
    def clean_skills(cls, skills: list[str] | None) -> list[str] | None:
        if skills is None:
            return None
        cleaned = []
        seen = set()
        for skill in skills:
            normalized = " ".join(str(skill).split())
            key = normalized.casefold()
            if normalized and key not in seen:
                cleaned.append(normalized)
                seen.add(key)
        return cleaned


def job_helper(job: dict) -> dict:
    return {
        "id": str(job["_id"]),
        "title": job.get("title", ""),
        "description": job.get("description", ""),
        "required_skills": job.get("required_skills", []),
        "location": job.get("location", ""),
        "company": job.get("company", ""),
        "created_at": job.get("created_at"),
        "updated_at": job.get("updated_at"),
    }


def parse_object_id(job_id: str) -> ObjectId:
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job id")
    return ObjectId(job_id)


@router.get("/")
async def get_all_jobs(
    q: str | None = Query(default=None, max_length=100),
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
):
    query = {}
    if q and q.strip():
        pattern = re.escape(q.strip())
        query = {
            "$or": [
                {"title": {"$regex": pattern, "$options": "i"}},
                {"company": {"$regex": pattern, "$options": "i"}},
                {"location": {"$regex": pattern, "$options": "i"}},
                {"required_skills": {"$regex": pattern, "$options": "i"}},
            ]
        }

    cursor = jobs_collection.find(query).sort("created_at", DESCENDING).skip(skip).limit(limit)
    return [job_helper(job) async for job in cursor]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_job(job: JobCreate, _current_user: dict = Depends(can_manage_jobs)):
    now = datetime.now(timezone.utc)
    new_job = job.model_dump()
    new_job.update({"created_at": now, "updated_at": now})
    result = await jobs_collection.insert_one(new_job)
    created_job = await jobs_collection.find_one({"_id": result.inserted_id})
    payload = job_helper(created_job)
    fire_and_forget(notify_new_job(payload))
    return payload


@router.get("/{job_id}")
async def get_job(job_id: str):
    job = await jobs_collection.find_one({"_id": parse_object_id(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job_helper(job)


@router.patch("/{job_id}")
async def update_job(
    job_id: str,
    changes: JobUpdate,
    _current_user: dict = Depends(can_manage_jobs),
):
    update_data = changes.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")
    update_data["updated_at"] = datetime.now(timezone.utc)

    job = await jobs_collection.find_one_and_update(
        {"_id": parse_object_id(job_id)},
        {"$set": update_data},
        return_document=ReturnDocument.AFTER,
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job_helper(job)


@router.delete("/{job_id}")
async def delete_job(job_id: str, _current_user: dict = Depends(can_manage_jobs)):
    object_id = parse_object_id(job_id)
    result = await jobs_collection.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully", "id": job_id}


