"""ATS Resume Score (Groq-powered suggestions).

Scores an uploaded resume (PDF) the way a real Applicant Tracking System
roughly would, and returns a 0-100 score plus concrete, prioritized fixes.

Design goals:
- The core score is FULLY DETERMINISTIC (keyword coverage, formatting signals,
  action verbs, contact info, length). No AI needed, so it never breaks.
- Groq (llama-3.3-70b-versatile) optionally adds a few tailored, human-readable
  suggestions on top. The numeric score never depends on it.
- If a target job description is provided, keywords are scored against it.
  Otherwise they're scored against a role's expected skills.

Reuses two pure (non-AI) helpers from routes/ai.py:
  extract_text_from_pdf, extract_known_skills, and the ROLE_SKILLS map.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
import re
from typing import List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends
from pydantic import BaseModel

from config import GROQ_API_KEY
from database import ats_scores_collection
from routes.ai import (
    ROLE_SKILLS,
    extract_known_skills,
    extract_text_from_pdf,
)
from routes.auth import get_current_user_optional

try:
    from groq import Groq
except ImportError:
    Groq = None

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ats", tags=["ATS"])

GROQ_MODEL = "llama-3.3-70b-versatile"

# Lazily-created Groq client (mirrors how get_gemini_client works elsewhere).
_groq_client = None


def get_groq_client():
    global _groq_client
    if _groq_client is not None:
        return _groq_client
    if Groq is None or not GROQ_API_KEY:
        return None
    _groq_client = Groq(api_key=GROQ_API_KEY)
    return _groq_client


# Strong action verbs ATS/recruiters reward. Not exhaustive, just signal.
ACTION_VERBS = {
    "led", "built", "created", "designed", "developed", "implemented", "launched",
    "managed", "improved", "increased", "reduced", "optimized", "automated",
    "delivered", "shipped", "architected", "spearheaded", "drove", "owned",
    "migrated", "scaled", "streamlined", "mentored", "collaborated", "achieved",
    "analyzed", "engineered", "deployed", "integrated", "resolved",
}

# Sections a well-structured resume usually has.
EXPECTED_SECTIONS = ["experience", "education", "skills", "project"]

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
PHONE_RE = re.compile(r"(\+?\d[\d\s\-()]{7,}\d)")
URL_RE = re.compile(r"(https?://|www\.|linkedin\.com|github\.com)", re.IGNORECASE)


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class Breakdown(BaseModel):
    label: str
    score: int          # points earned
    max: int            # points possible
    detail: str


class ATSResult(BaseModel):
    score: int
    rating: str
    breakdown: List[Breakdown]
    matched_keywords: List[str]
    missing_keywords: List[str]
    fixes: List[str]
    ai_suggestions: List[str]
    source: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _keywords_from_jd(jd: str) -> List[str]:
    """Pull likely skill keywords from a job description using our known list."""
    return extract_known_skills(jd)


def _keywords_for_role(role: str) -> List[str]:
    """Expected skills for a named role, else a generic tech baseline."""
    if role and role in ROLE_SKILLS:
        return ROLE_SKILLS[role]
    # loose match, e.g. "Senior Backend Developer" -> "Backend Developer"
    for known in ROLE_SKILLS:
        if known.lower() in (role or "").lower():
            return ROLE_SKILLS[known]
    return ["Communication", "Git", "SQL", "Python", "JavaScript", "Project Management"]


def _rating(score: int) -> str:
    if score >= 85:
        return "Excellent"
    if score >= 70:
        return "Strong"
    if score >= 55:
        return "Fair"
    return "Needs work"


def score_resume(text: str, target_keywords: List[str]) -> dict:
    """The deterministic core. No AI. Returns score + breakdown + fixes."""
    lower = text.lower()
    words = re.findall(r"[a-zA-Z']+", lower)
    word_count = len(words)
    breakdown: List[Breakdown] = []
    fixes: List[str] = []

    # 1) Keyword coverage (40 pts) -----------------------------------------
    targets = [k for k in dict.fromkeys(target_keywords)]  # de-dupe, keep order
    matched, missing = [], []
    for kw in targets:
        if kw.lower() in lower:
            matched.append(kw)
        else:
            missing.append(kw)
    coverage = (len(matched) / len(targets)) if targets else 0
    kw_points = round(coverage * 40)
    breakdown.append(Breakdown(
        label="Keyword match",
        score=kw_points, max=40,
        detail=f"{len(matched)} of {len(targets)} target keywords found.",
    ))
    if missing:
        top_missing = ", ".join(missing[:6])
        fixes.append(f"Add these missing keywords where truthful: {top_missing}.")

    # 2) Contact info (15 pts) ---------------------------------------------
    contact_pts = 0
    have_email = bool(EMAIL_RE.search(text))
    have_phone = bool(PHONE_RE.search(text))
    have_link = bool(URL_RE.search(text))
    if have_email:
        contact_pts += 6
    else:
        fixes.append("Add a professional email address near the top.")
    if have_phone:
        contact_pts += 5
    else:
        fixes.append("Add a phone number so recruiters can reach you.")
    if have_link:
        contact_pts += 4
    else:
        fixes.append("Add a LinkedIn or GitHub link.")
    breakdown.append(Breakdown(
        label="Contact info", score=contact_pts, max=15,
        detail=f"Email: {'yes' if have_email else 'no'}, "
               f"Phone: {'yes' if have_phone else 'no'}, "
               f"Link: {'yes' if have_link else 'no'}.",
    ))

    # 3) Sections / structure (15 pts) -------------------------------------
    found_sections = [s for s in EXPECTED_SECTIONS if s in lower]
    sec_points = round(len(found_sections) / len(EXPECTED_SECTIONS) * 15)
    breakdown.append(Breakdown(
        label="Section structure", score=sec_points, max=15,
        detail=f"Detected: {', '.join(found_sections) or 'none'}.",
    ))
    missing_sections = [s for s in EXPECTED_SECTIONS if s not in lower]
    if missing_sections:
        fixes.append(f"Add clear section headings for: {', '.join(missing_sections)}.")

    # 4) Action verbs / impact (15 pts) ------------------------------------
    verb_hits = sum(1 for w in words if w in ACTION_VERBS)
    verb_points = min(15, round(verb_hits / 8 * 15))
    breakdown.append(Breakdown(
        label="Impact language", score=verb_points, max=15,
        detail=f"{verb_hits} strong action verbs detected.",
    ))
    if verb_points < 10:
        fixes.append("Start bullet points with action verbs (Built, Led, Improved) and add numbers.")

    # 5) Quantified results (5 pts) ----------------------------------------
    has_numbers = bool(re.search(r"\b\d+%|\b\d+\+|\$\d+|\b\d{2,}\b", text))
    num_points = 5 if has_numbers else 0
    breakdown.append(Breakdown(
        label="Quantified results", score=num_points, max=5,
        detail="Metrics found." if has_numbers else "No numbers/metrics found.",
    ))
    if not has_numbers:
        fixes.append("Quantify achievements (e.g. 'cut load time by 40%').")

    # 6) Length sanity (10 pts) --------------------------------------------
    if 350 <= word_count <= 900:
        len_points = 10
        len_detail = f"{word_count} words. Good length."
    elif word_count < 350:
        len_points = round(word_count / 350 * 10)
        len_detail = f"{word_count} words. Too short."
        fixes.append("Resume looks thin. Add more detail to experience and projects.")
    else:
        len_points = 6
        len_detail = f"{word_count} words. A bit long."
        fixes.append("Resume is long. Trim to the most relevant 1-2 pages.")
    breakdown.append(Breakdown(
        label="Length", score=len_points, max=10, detail=len_detail,
    ))

    total = sum(b.score for b in breakdown)
    total = max(0, min(100, total))

    return {
        "score": total,
        "rating": _rating(total),
        "breakdown": [b.dict() for b in breakdown],
        "matched_keywords": matched,
        "missing_keywords": missing,
        "fixes": fixes,
    }


def ai_suggestions(text: str, role: str, jd: str) -> List[str]:
    """Optional Groq polish on top of the deterministic score. Never required."""
    client = get_groq_client()
    if client is None:
        return []
    context = f"Target role: {role or 'not specified'}.\n"
    if jd:
        context += f"Job description:\n{jd[:2000]}\n"
    prompt = (
        "You are an expert resume reviewer for Indian job seekers. "
        f"{context}\nResume text:\n{text[:4000]}\n\n"
        "Give 3 to 5 short, specific, high-impact suggestions to improve this "
        "resume's chances of passing an ATS and impressing a recruiter. "
        "Reply as a plain list, one suggestion per line, no numbering, no preamble."
    )
    try:
        resp = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=500,
        )
        raw = resp.choices[0].message.content or ""
        lines = [l.strip("-* \t") for l in raw.splitlines()]
        return [l for l in lines if l][:5]
    except Exception as exc:
        logger.warning("ATS ai_suggestions (groq) failed: %s", exc)
        return []


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/score", response_model=ATSResult)
async def score(
    file: UploadFile = File(...),
    target_role: str = Form(""),
    job_description: str = Form(""),
    current_user: dict | None = Depends(get_current_user_optional),
):
    """Upload a resume PDF (+ optional role or job description) and get an ATS score."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Please upload a PDF resume.")

    try:
        raw = await file.read()
        text = extract_text_from_pdf(raw)
    except Exception as exc:
        logger.warning("ATS pdf parse failed: %s", exc)
        raise HTTPException(status_code=400, detail="Could not read that PDF.")

    if not text.strip():
        raise HTTPException(status_code=400, detail="This PDF has no extractable text (it may be a scanned image).")

    # Decide what to score keywords against.
    if job_description.strip():
        targets = _keywords_from_jd(job_description)
        if not targets:
            targets = _keywords_for_role(target_role)
    else:
        targets = _keywords_for_role(target_role)

    result = score_resume(text, targets)
    result["ai_suggestions"] = ai_suggestions(text, target_role, job_description)
    result["source"] = "groq+rules" if result["ai_suggestions"] else "rules"

    if current_user:
        await ats_scores_collection.insert_one({
            "user_id": current_user["_id"],
            "file_name": file.filename,
            "target_role": target_role or "General Baseline",
            "had_jd": bool(job_description.strip()),
            "score": result["score"],
            "rating": result["rating"],
            "matched_count": len(result["matched_keywords"]),
            "missing_count": len(result["missing_keywords"]),
            "created_at": datetime.now(timezone.utc),
        })

    return result
