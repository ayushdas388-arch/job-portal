"""Eligibility Checker: is the user eligible for common exams / govt posts?

Checks age (with category-wise relaxation), minimum qualification and
domicile/state against a curated catalog. Pure rule-based - no AI, no DB.
"""
from typing import List, Union

from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator

router = APIRouter(prefix="/eligibility", tags=["Eligibility"])


QUALIFICATION_LEVELS = {
    "8th": 1,
    "10th": 2,
    "12th": 3,
    "iti": 3,
    "diploma": 4,
    "graduate": 5,
    "engineering": 5,
    "medical": 5,
    "nursing": 5,
    "post graduate": 6,
}
QUALIFICATION_LABELS = {
    "8th": "8th Pass",
    "10th": "10th Pass",
    "12th": "12th Pass",
    "iti": "ITI",
    "diploma": "Diploma",
    "graduate": "Graduate",
    "engineering": "Engineering",
    "medical": "Medical",
    "nursing": "Nursing",
    "post graduate": "Post Graduate",
}

CATEGORY_AGE_RELAXATION = {
    "general": 0,
    "ews": 0,
    "obc": 3,
    "sc/st": 5,
    "pwd": 10,
}
CATEGORY_LABELS = {
    "general": "General",
    "ews": "EWS",
    "obc": "OBC",
    "sc/st": "SC/ST",
    "pwd": "PWD",
}

EXAM_CATALOG = [
    {
        "name": "SSC CGL",
        "sector": "Central Govt",
        "min_age": 18, "max_age": 32,
        "min_qual": "graduate",
        "states": "All India",
        "link": "https://ssc.gov.in/",
        "note": "Graduate-level posts in ministries and departments.",
    },
    {
        "name": "SSC CHSL",
        "sector": "Central Govt",
        "min_age": 18, "max_age": 27,
        "min_qual": "12th",
        "states": "All India",
        "link": "https://ssc.gov.in/",
        "note": "LDC, DEO, and Postal Assistant posts.",
    },
    {
        "name": "UPSC Civil Services (IAS/IPS)",
        "sector": "Central Govt",
        "min_age": 21, "max_age": 32,
        "min_qual": "graduate",
        "states": "All India",
        "link": "https://upsc.gov.in/",
        "note": "IAS, IPS, IFS, and other Group-A services.",
    },
    {
        "name": "IBPS PO",
        "sector": "Banking",
        "min_age": 20, "max_age": 30,
        "min_qual": "graduate",
        "states": "All India",
        "link": "https://www.ibps.in/",
        "note": "Probationary Officer roles in public sector banks.",
    },
    {
        "name": "IBPS Clerk",
        "sector": "Banking",
        "min_age": 20, "max_age": 28,
        "min_qual": "graduate",
        "states": "All India",
        "link": "https://www.ibps.in/",
        "note": "Clerical cadre roles in public sector banks.",
    },
    {
        "name": "RRB NTPC",
        "sector": "Railway",
        "min_age": 18, "max_age": 33,
        "min_qual": "12th",
        "states": "All India",
        "link": "https://www.rrbcdg.gov.in/",
        "note": "Non-Technical Popular Categories for graduate and 12th-pass candidates.",
    },
    {
        "name": "RRB Group D",
        "sector": "Railway",
        "min_age": 18, "max_age": 33,
        "min_qual": "10th",
        "states": "All India",
        "link": "https://www.rrbcdg.gov.in/",
        "note": "Level-1 posts for 10th-pass or ITI candidates.",
    },
    {
        "name": "Police Constable (State)",
        "sector": "State Govt",
        "min_age": 18, "max_age": 25,
        "min_qual": "12th",
        "states": "All India",
        "physical_fitness_required": True,
        "link": "https://www.google.com/search?q=state+police+constable+recruitment",
        "note": "State-wise recruitment; physical fitness and domicile of that state is required.",
    },
    {
        "name": "NDA (National Defence Academy)",
        "sector": "Defence",
        "min_age": 16, "max_age": 19,
        "min_qual": "12th",
        "states": "All India",
        "marital_status": "unmarried",
        "physical_fitness_required": True,
        "link": "https://upsc.gov.in/",
        "note": "Requires unmarried status and strict physical/medical standards.",
    },
    {
        "name": "AFCAT (Air Force)",
        "sector": "Defence",
        "min_age": 20, "max_age": 24,
        "min_qual": "graduate",
        "states": "All India",
        "marital_status": "unmarried",
        "physical_fitness_required": True,
        "link": "https://afcat.cdac.in/",
        "note": "For flying branch, candidates must be unmarried and physically fit.",
    },
    {
        "name": "State PSC (State Civil Services)",
        "sector": "State Govt",
        "min_age": 21, "max_age": 40,
        "min_qual": "graduate",
        "states": "All India",
        "link": "https://www.google.com/search?q=state+psc+recruitment",
        "note": "Deputy Collector, DSP, and similar roles; domicile and age vary by state.",
    },
    {
        "name": "TNPSC (Tamil Nadu PSC)",
        "sector": "State Govt",
        "min_age": 18, "max_age": 42,
        "min_qual": "10th",
        "states": "Tamil Nadu",
        "link": "https://www.tnpsc.gov.in/",
        "note": "Various group exams (Group 1, 2, 4) in Tamil Nadu state government.",
    },
    {
        "name": "GATE (PSU / M.Tech)",
        "sector": "Technical",
        "min_age": None, "max_age": None,
        "min_qual": "graduate",
        "states": "All India",
        "link": "https://gate.iitk.ac.in/",
        "note": "No age limit; open to engineering graduates and final-year students.",
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


class EligibilityRequest(BaseModel):
    age: int = Field(ge=18, le=55)
    qualifications: List[str] = Field(default_factory=lambda: ["graduate"])
    category: str = Field(default="general")
    job_type: str = Field(default="all")
    state: str = Field(default="", max_length=60)
    gender: str = Field(default="any")
    marital_status: str = Field(default="any")
    physical_fitness: bool = Field(default=True)

    @field_validator("qualifications", mode="before")
    @classmethod
    def norm_qual(cls, value):
        if isinstance(value, str):
            value = [value]
        if not value:
            return ["graduate"]
        res = []
        for v in value:
            v_str = str(v).strip().lower()
            res.append(v_str if v_str in QUALIFICATION_LEVELS else "graduate")
        return res

    @field_validator("category", mode="before")
    @classmethod
    def norm_cat(cls, value):
        v = str(value or "").strip().lower()
        if v in ["sc", "st"]:
            return "sc/st"
        return v if v in CATEGORY_AGE_RELAXATION else "general"

    @field_validator("job_type", mode="before")
    @classmethod
    def norm_job_type(cls, value):
        v = str(value or "").strip().lower()
        return v if v in ["central", "state", "all"] else "all"


def check_exam(exam: dict, data: EligibilityRequest) -> dict:
    reasons: List[str] = []
    relaxation = CATEGORY_AGE_RELAXATION.get(data.category, 0)

    min_age, max_age = exam.get("min_age"), exam.get("max_age")
    effective_max = None
    if max_age is not None:
        effective_max = max_age + relaxation
    if min_age is not None and data.age < min_age:
        reasons.append(f"Minimum age is {min_age} (yours: {data.age}).")
    if effective_max is not None and data.age > effective_max:
        extra = f" (+{relaxation} relaxation)" if relaxation else ""
        reasons.append(f"Maximum age is {effective_max}{extra} (yours: {data.age}).")

    need_level = QUALIFICATION_LEVELS.get(exam.get("min_qual", "graduate"), 4)
    highest_have = max([QUALIFICATION_LEVELS.get(q, 0) for q in data.qualifications], default=0)
    
    # Specific check: if exam needs engineering/medical, etc., we can enforce it.
    # For now, level check is used (if they have engineering(5), they can apply for graduate(5)).
    if highest_have < need_level:
        reasons.append(
            f"Requires {QUALIFICATION_LABELS.get(exam['min_qual'], exam['min_qual'])} qualification."
        )

    if exam.get("physical_fitness_required") and not data.physical_fitness:
        reasons.append("Requires meeting physical and medical standards.")

    if exam.get("marital_status") and data.marital_status != "any" and data.marital_status != exam["marital_status"]:
        reasons.append(f"Requires marital status to be {exam['marital_status']}.")
        
    if exam.get("gender") and data.gender != "any" and data.gender != exam["gender"]:
        reasons.append(f"Post is restricted to {exam['gender']} candidates.")

    state_note = ""
    if exam.get("sector") == "State Govt" and exam.get("states") == "All India":
        state_note = "State-level post - domicile of that state may be required."

    age_window = "No age limit"
    if min_age is not None or max_age is not None:
        lo = min_age if min_age is not None else "-"
        hi = effective_max if effective_max is not None else "-"
        age_window = f"{lo}-{hi} yrs"

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


@router.get("/options")
async def options():
    return {
        "qualifications": [
            {"value": k, "label": QUALIFICATION_LABELS[k]}
            for k in QUALIFICATION_LEVELS
        ],
        "categories": [
            {"value": k, "label": CATEGORY_LABELS[k], "relaxation": v}
            for k, v in CATEGORY_AGE_RELAXATION.items()
        ],
        "job_types": [
            {"value": "all", "label": "All Jobs"},
            {"value": "central", "label": "Central Government"},
            {"value": "state", "label": "State Government"},
        ],
        "states": INDIAN_STATES,
    }


@router.get("/exams")
async def exams():
    return {"exams": EXAM_CATALOG}


@router.post("/check")
async def check(data: EligibilityRequest):
    results = []
    central_sectors = ["Central Govt", "Banking", "Railway", "Defence", "Technical"]
    state_sectors = ["State Govt"]

    for exam in EXAM_CATALOG:
        # Filter by job type
        if data.job_type == "central" and exam["sector"] not in central_sectors:
            continue
        if data.job_type == "state" and exam["sector"] not in state_sectors:
            continue
            
        # Filter by state (if user provided a state, don't show specific exams for OTHER states)
        if data.state:
            exam_states = exam.get("states", "All India")
            if exam_states != "All India" and exam_states != data.state:
                continue
            
        results.append(check_exam(exam, data))
        
    results.sort(key=lambda r: (not r["eligible"], r["name"]))
    eligible_count = sum(1 for r in results if r["eligible"])
    return {
        "eligible_count": eligible_count,
        "total": len(results),
        "relaxation_applied": CATEGORY_AGE_RELAXATION.get(data.category, 0),
        "results": results,
    }

