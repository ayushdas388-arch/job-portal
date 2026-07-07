"""Eligibility Checker: is the user eligible for common exams / govt posts?

Checks age (with category-wise relaxation), minimum qualification and
domicile/state against a curated catalog. Pure rule-based — no AI, no DB.
"""
from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator

router = APIRouter(prefix="/eligibility", tags=["Eligibility"])


# ---------------------------------------------------------------------------
# Reference data
# ---------------------------------------------------------------------------

# Higher number = higher qualification. Used to compare "at least" requirements.
QUALIFICATION_LEVELS = {
    "10th": 1,
    "12th": 2,
    "diploma": 3,
    "graduate": 4,
    "post graduate": 5,
}
QUALIFICATION_LABELS = {
    "10th": "10th Pass",
    "12th": "12th Pass",
    "diploma": "Diploma",
    "graduate": "Graduate",
    "post graduate": "Post Graduate",
}

# Typical upper-age relaxation (years) over the General limit.
CATEGORY_AGE_RELAXATION = {
    "general": 0,
    "ews": 0,
    "obc": 3,
    "sc": 5,
    "st": 5,
    "pwd": 10,
}

# Curated catalog. min_qual is a key of QUALIFICATION_LEVELS.
# states == "All India" means no domicile restriction.
EXAM_CATALOG = [
    {
        "name": "SSC CGL",
        "sector": "Central Govt",
        "min_age": 18, "max_age": 32,
        "min_qual": "graduate",
        "states": "All India",
        "link": "https://ssc.gov.in/",
        "note": "Graduate-level posts in ministries & departments.",
    },
    {
        "name": "SSC CHSL",
        "sector": "Central Govt",
        "min_age": 18, "max_age": 27,
        "min_qual": "12th",
        "states": "All India",
        "link": "https://ssc.gov.in/",
        "note": "LDC / DEO / Postal Assistant posts.",
    },
    {
        "name": "UPSC Civil Services (IAS/IPS)",
        "sector": "Central Govt",
        "min_age": 21, "max_age": 32,
        "min_qual": "graduate",
        "states": "All India",
        "link": "https://upsc.gov.in/",
        "note": "IAS, IPS, IFS and other Group-A services.",
    },
    {
        "name": "IBPS PO",
        "sector": "Banking",
        "min_age": 20, "max_age": 30,
        "min_qual": "graduate",
        "states": "All India",
        "link": "https://www.ibps.in/",
        "note": "Probationary Officer in public sector banks.",
    },
    {
        "name": "IBPS Clerk",
        "sector": "Banking",
        "min_age": 20, "max_age": 28,
        "min_qual": "graduate",
        "states": "All India",
        "link": "https://www.ibps.in/",
        "note": "Clerical cadre in public sector banks.",
    },
    {
        "name": "RRB NTPC",
        "sector": "Railway",
        "min_age": 18, "max_age": 33,
        "min_qual": "12th",
        "states": "All India",
        "link": "https://www.rrbcdg.gov.in/",
        "note": "Non-Technical Popular Categories (graduate & 12th posts).",
    },
    {
        "name": "RRB Group D",
        "sector": "Railway",
        "min_age": 18, "max_age": 33,
        "min_qual": "10th",
        "states": "All India",
        "link": "https://www.rrbcdg.gov.in/",
        "note": "Level-1 posts; 10th pass or ITI.",
    },
    {
        "name": "Police Constable (State)",
        "sector": "State Govt",
        "min_age": 18, "max_age": 25,
        "min_qual": "12th",
        "states": "All India",
        "link": "https://www.google.com/search?q=state+police+constable+recruitment",
        "note": "State-wise recruitment; domicile of that state usually needed.",
    },
    {
        "name": "State PSC (State Civil Services)",
        "sector": "State Govt",
        "min_age": 21, "max_age": 40,
        "min_qual": "graduate",
        "states": "All India",
        "link": "https://www.google.com/search?q=state+psc+recruitment",
        "note": "Deputy Collector / DSP etc.; domicile & age vary by state.",
    },
    {
        "name": "GATE (PSU / M.Tech)",
        "sector": "Technical",
        "min_age": None, "max_age": None,
        "min_qual": "graduate",
        "states": "All India",
        "link": "https://gate.iitk.ac.in/",
        "note": "No age limit; engineering graduate / final year.",
    },
]

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh", "Other",
]


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class EligibilityRequest(BaseModel):
    age: int = Field(ge=10, le=100)
    qualification: str = Field(default="graduate")
    category: str = Field(default="general")
    state: str = Field(default="", max_length=60)

    @field_validator("qualification", mode="before")
    @classmethod
    def norm_qual(cls, value):
        v = str(value or "").strip().lower()
        return v if v in QUALIFICATION_LEVELS else "graduate"

    @field_validator("category", mode="before")
    @classmethod
    def norm_cat(cls, value):
        v = str(value or "").strip().lower()
        return v if v in CATEGORY_AGE_RELAXATION else "general"


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

def check_exam(exam: dict, data: EligibilityRequest) -> dict:
    reasons: List[str] = []
    relaxation = CATEGORY_AGE_RELAXATION.get(data.category, 0)

    # --- Age (with category relaxation on the upper limit) ---
    min_age, max_age = exam.get("min_age"), exam.get("max_age")
    effective_max = None
    if max_age is not None:
        effective_max = max_age + relaxation
    if min_age is not None and data.age < min_age:
        reasons.append(f"Minimum age {min_age} chahiye (aapki {data.age}).")
    if effective_max is not None and data.age > effective_max:
        extra = f" (+{relaxation} relaxation)" if relaxation else ""
        reasons.append(f"Max age {effective_max}{extra} cross ho gayi (aapki {data.age}).")

    # --- Qualification ---
    need = QUALIFICATION_LEVELS.get(exam.get("min_qual", "graduate"), 4)
    have = QUALIFICATION_LEVELS.get(data.qualification, 0)
    if have < need:
        reasons.append(
            f"{QUALIFICATION_LABELS.get(exam['min_qual'], exam['min_qual'])} qualification chahiye."
        )

    # --- State / domicile (informational for state-level posts) ---
    state_note = ""
    if exam.get("sector") == "State Govt" and exam.get("states") == "All India":
        state_note = "State-level post — us state ka domicile chahiye ho sakta hai."

    age_window = "No age limit"
    if min_age is not None or max_age is not None:
        lo = min_age if min_age is not None else "—"
        hi = effective_max if effective_max is not None else "—"
        age_window = f"{lo}–{hi} yrs"

    return {
        "name": exam["name"],
        "sector": exam["sector"],
        "eligible": len(reasons) == 0,
        "reasons": reasons,
        "age_window": age_window,
        "min_qualification": QUALIFICATION_LABELS.get(exam["min_qual"], exam["min_qual"]),
        "relaxation_applied": relaxation,
        "state_note": state_note,
        "note": exam.get("note", ""),
        "link": exam.get("link", ""),
    }


# ---------------------------------------------------------------------------
# Endpoints (public)
# ---------------------------------------------------------------------------

@router.get("/options")
async def options():
    """Dropdown data for the frontend form."""
    return {
        "qualifications": [
            {"value": k, "label": QUALIFICATION_LABELS[k]}
            for k in QUALIFICATION_LEVELS
        ],
        "categories": [
            {"value": k, "label": k.upper(), "relaxation": v}
            for k, v in CATEGORY_AGE_RELAXATION.items()
        ],
        "states": INDIAN_STATES,
    }


@router.get("/exams")
async def exams():
    return {"exams": EXAM_CATALOG}


@router.post("/check")
async def check(data: EligibilityRequest):
    results = [check_exam(exam, data) for exam in EXAM_CATALOG]
    # Eligible first, then by name.
    results.sort(key=lambda r: (not r["eligible"], r["name"]))
    eligible_count = sum(1 for r in results if r["eligible"])
    return {
        "eligible_count": eligible_count,
        "total": len(results),
        "relaxation_applied": CATEGORY_AGE_RELAXATION.get(data.category, 0),
        "results": results,
    }
