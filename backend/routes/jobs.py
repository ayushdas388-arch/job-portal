from __future__ import annotations

import re

from bson import ObjectId
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field, field_validator

from external_jobs import build_search_links, list_platforms, normalize_query

router = APIRouter(prefix="/jobs", tags=["Jobs"])

MANUAL_POSTING_RETIRED = (
    "Manual job posting has been retired. This portal now sends users to external job platforms."
)


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


def parse_object_id(job_id: str) -> ObjectId:
    if not ObjectId.is_valid(job_id):
        raise HTTPException(status_code=400, detail="Invalid job id")
    return ObjectId(job_id)


def _manual_job_error() -> HTTPException:
    return HTTPException(status_code=status.HTTP_410_GONE, detail=MANUAL_POSTING_RETIRED)


def _search_result_card(link: dict) -> dict:
    return {
        "id": re.sub(r"[^a-z0-9]+", "-", f"{link['site']}-{link['query']}".lower()).strip("-"),
        "title": f"{link['query']} jobs",
        "description": f"Open live {link['site']} search results for {link['query']}.",
        "required_skills": [],
        "location": "External platform",
        "company": link["site"],
        "source_site": link["site"],
        "link": link["url"],
        "query": link["query"],
        "external": True,
    }


@router.get("/")
async def get_job_platforms(
    q: str | None = Query(default=None, max_length=120),
    category: str = Query(default="all", pattern="^(all|private|government|internship)$"),
):
    query = " ".join((q or "").split())
    platforms = list_platforms(category=category, q=query)
    search_results = build_search_links(query, limit=6) if query and category != "government" else []

    return {
        "mode": "external_only",
        "category": category,
        "query": query,
        "platforms": platforms,
        "search_results": [_search_result_card(link) for link in search_results],
        "message": "This portal uses external job platforms instead of storing local job posts.",
    }


@router.get("/search")
async def search_external_jobs(
    q: str = Query(min_length=2, max_length=120),
):
    query = normalize_query(q)
    links = build_search_links(query, limit=6)
    return {
        "mode": "external_only",
        "query": query,
        "results": [_search_result_card(link) for link in links],
        "platforms": list_platforms(category="private"),
    }


@router.post("/", status_code=status.HTTP_410_GONE)
async def create_job(_job: JobCreate):
    raise _manual_job_error()


@router.get("/{job_id}")
async def get_job(_job_id: str):
    raise _manual_job_error()


@router.patch("/{job_id}")
async def update_job(_job_id: str, _changes: JobUpdate):
    raise _manual_job_error()


@router.delete("/{job_id}")
async def delete_job(_job_id: str):
    raise _manual_job_error()
