from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel, Field
from database import jobs_collection
from typing import List, Optional
import pdfplumber
import io
import json
import re

try:
    from google import genai
except ImportError:
    genai = None
from config import GEMINI_API_KEY

client = None

router = APIRouter(prefix="/ai", tags=["AI"])

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def get_gemini_client():
    global client

    if client is not None:
        return client
    if genai is None or not GEMINI_API_KEY:
        return None

    client = genai.Client(api_key=GEMINI_API_KEY)
    return client


def strip_json_fence(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def extract_skills_from_text(text: str, jobs: list) -> list[str]:
    text_lower = text.lower()
    detected_skills = []
    seen = set()

    for job in jobs:
        for skill in job.get("required_skills", []):
            normalized_skill = skill.strip()
            if not normalized_skill:
                continue

            skill_key = normalized_skill.lower()
            if skill_key in seen:
                continue

            if re.search(rf"(?<!\w){re.escape(skill_key)}(?!\w)", text_lower):
                seen.add(skill_key)
                detected_skills.append(normalized_skill)

    return detected_skills

def simple_skill_match(user_skills: List[str], jobs: list) -> list:
    """Fallback skill matching without API calls"""
    user_skills_lower = [s.lower() for s in user_skills]
    results = []
    
    for job in jobs:
        job_skills = [s.lower() for s in job.get("required_skills", [])]
        matched_skills = [s for s in job_skills if s in user_skills_lower]
        
        if matched_skills:
            match_percent = min(100, int((len(matched_skills) / len(job_skills) * 100))) if job_skills else 0
            job_copy = job.copy()
            job_copy["match_percent"] = match_percent
            job_copy["reason"] = f"Matched {len(matched_skills)} of {len(job_skills)} required skills: {', '.join(matched_skills)}"
            results.append(job_copy)
    
    return sorted(results, key=lambda x: x["match_percent"], reverse=True)


def fallback_match(user_info: str, jobs: list) -> list:
    if "Skills:" in user_info:
        skills_str = user_info.split("Skills:", 1)[1].strip()
        skills = [s.strip() for s in skills_str.split(",") if s.strip()]
        return simple_skill_match(skills, jobs)

    extracted_skills = extract_skills_from_text(user_info, jobs)
    if extracted_skills:
        return simple_skill_match(extracted_skills, jobs)

    return []

async def get_all_jobs():
    jobs = []
    async for job in jobs_collection.find():
        jobs.append({
            "id": str(job["_id"]),
            "title": job["title"],
            "company": job.get("company", ""),
            "location": job.get("location", ""),
            "required_skills": job.get("required_skills", []),
            "description": job.get("description", "")
        })
    return jobs

async def gemini_match(user_info: str, jobs: list) -> list:
    gemini_client = get_gemini_client()
    if gemini_client is None:
        return fallback_match(user_info, jobs)

    jobs_text = "\n".join([
        f"{i+1}. {j['title']} at {j['company']} ({j['location']}) - Skills: {', '.join(j['required_skills'])}"
        for i, j in enumerate(jobs)
    ])

    prompt = f"""
You are a job matching AI. Based on the user's profile, match them with the most suitable jobs.

User Profile:
{user_info}

Available Jobs:
{jobs_text}

Return a JSON array of matched jobs with this format:
[
  {{
    "job_number": 1,
    "match_percent": 95,
    "reason": "Why this job matches"
  }}
]

Only include jobs with match_percent above 40. Return ONLY the JSON array, nothing else.
"""

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )

        text = strip_json_fence(response.text or "")

        matched_indices = json.loads(text)
        results = []
        for match in matched_indices:
            idx = match["job_number"] - 1
            if 0 <= idx < len(jobs):
                job = jobs[idx].copy()
                job["match_percent"] = match["match_percent"]
                job["reason"] = match["reason"]
                results.append(job)

        return sorted(results, key=lambda x: x["match_percent"], reverse=True)
    except Exception as e:
        print(f"Gemini API error: {e}. Using fallback skill matching...")
        return fallback_match(user_info, jobs)

@router.post("/match-resume")
async def match_resume(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    content = await file.read()
    resume_text = extract_text_from_pdf(content)
    jobs = await get_all_jobs()
    if not jobs:
        return {"matched_jobs": [], "message": "Koi job available nahi hai!"}
    matched = await gemini_match(f"Resume:\n{resume_text}", jobs)
    return {"matched_jobs": matched, "total_matches": len(matched)}

@router.post("/match-skills")
async def match_skills(skills: List[str]):
    jobs = await get_all_jobs()
    if not jobs:
        return {"matched_jobs": [], "message": "Koi job available nahi hai!"}
    user_info = f"Skills: {', '.join(skills)}"
    matched = await gemini_match(user_info, jobs)
    return {
        "your_skills": skills,
        "matched_jobs": matched,
        "total_matches": len(matched)
    }


# ---------------------------------------------------------------------------
# AI Resume Builder
# ---------------------------------------------------------------------------

class EducationItem(BaseModel):
    degree: str = ""
    institution: str = ""
    year: str = ""
    details: str = ""


class ExperienceItem(BaseModel):
    role: str = ""
    company: str = ""
    duration: str = ""
    description: str = ""


class ProjectItem(BaseModel):
    name: str = ""
    description: str = ""


class ResumeRequest(BaseModel):
    full_name: str = Field(min_length=1, max_length=120)
    email: str = Field(default="", max_length=254)
    phone: str = Field(default="", max_length=40)
    location: str = Field(default="", max_length=120)
    linkedin: str = Field(default="", max_length=200)
    target_role: str = Field(default="", max_length=120)
    summary: str = Field(default="", max_length=1000)
    skills: List[str] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    experience: List[ExperienceItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)


def _split_bullets(text: str) -> List[str]:
    """Turn a free-form description into clean bullet points."""
    if not text:
        return []
    parts = re.split(r"[\n\r]+|(?<=[.;])\s+|•|-\s", text)
    return [p.strip(" -•\t") for p in parts if p.strip(" -•\t")]


def fallback_resume(data: ResumeRequest) -> dict:
    """Build a structured resume without an AI call."""
    summary = data.summary.strip()
    if not summary:
        role = data.target_role.strip() or "professional"
        skills_preview = ", ".join(data.skills[:4])
        summary = (
            f"Motivated {role} with hands-on experience"
            + (f" in {skills_preview}." if skills_preview else ".")
        )

    return {
        "summary": summary,
        "experience": [
            {
                "role": e.role,
                "company": e.company,
                "duration": e.duration,
                "bullets": _split_bullets(e.description),
            }
            for e in data.experience
        ],
        "projects": [
            {"name": p.name, "bullets": _split_bullets(p.description)}
            for p in data.projects
        ],
        "skills": data.skills,
    }


def gemini_resume(data: ResumeRequest) -> dict:
    """Use Gemini to polish the resume; fall back on any error."""
    gemini_client = get_gemini_client()
    if gemini_client is None:
        return fallback_resume(data)

    payload = data.model_dump()
    prompt = f"""
You are an expert resume writer. Using the candidate details below, write a
polished, ATS-friendly resume. Rewrite experience and project descriptions into
strong, quantified achievement bullet points that start with action verbs.

Candidate details (JSON):
{json.dumps(payload, ensure_ascii=False, indent=2)}

Return ONLY a JSON object with this exact shape (no markdown, no extra text):
{{
  "summary": "2-3 sentence professional summary",
  "experience": [
    {{"role": "", "company": "", "duration": "", "bullets": ["", ""]}}
  ],
  "projects": [
    {{"name": "", "bullets": ["", ""]}}
  ],
  "skills": ["", ""]
}}

Keep every fact truthful to the input. If a section has no input, return an empty list.
"""

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt,
        )
        text = strip_json_fence(response.text or "")
        result = json.loads(text)
        # Guarantee the keys the frontend expects.
        result.setdefault("summary", "")
        result.setdefault("experience", [])
        result.setdefault("projects", [])
        result.setdefault("skills", data.skills)
        return result
    except Exception as e:  # noqa: BLE001 - fall back on any AI failure
        print(f"Gemini resume error: {e}. Using fallback resume builder...")
        return fallback_resume(data)


@router.post("/build-resume")
async def build_resume(data: ResumeRequest):
    generated = gemini_resume(data)
    return {
        "contact": {
            "full_name": data.full_name,
            "email": data.email,
            "phone": data.phone,
            "location": data.location,
            "linkedin": data.linkedin,
            "target_role": data.target_role,
        },
        "education": [e.model_dump() for e in data.education],
        "certifications": data.certifications,
        **generated,
    }


# ---------------------------------------------------------------------------
# Skill Gap Analysis
# ---------------------------------------------------------------------------

# Built-in role -> skills map used when Gemini is unavailable and no matching
# job exists in the database. Keys are matched case-insensitively as substrings.
ROLE_SKILLS = {
    "frontend": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Git", "Responsive Design"],
    "backend": ["Python", "Node.js", "SQL", "MongoDB", "REST APIs", "Git", "Docker"],
    "full stack": ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB", "SQL", "Git"],
    "data scientist": ["Python", "Statistics", "Machine Learning", "Pandas", "SQL", "Data Visualization"],
    "data analyst": ["Excel", "SQL", "Power BI", "Tableau", "Statistics", "Python", "Data Analysis"],
    "machine learning": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "Statistics", "SQL"],
    "android": ["Java", "Kotlin", "Android Development", "XML", "REST APIs", "Git"],
    "ios": ["Swift", "iOS Development", "Xcode", "REST APIs", "Git"],
    "devops": ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Git", "Bash"],
    "cloud": ["AWS", "Azure", "Docker", "Kubernetes", "Linux", "Networking"],
    "cybersecurity": ["Networking", "Linux", "Cybersecurity", "Python", "Ethical Hacking"],
    "ui/ux": ["Figma", "Adobe XD", "UI/UX", "Wireframing", "Prototyping", "User Research"],
    "digital marketing": ["SEO", "Digital Marketing", "Content Writing", "Social Media", "Google Analytics"],
    "accountant": ["Accounting", "Tally", "GST", "Excel", "Finance"],
    "hr": ["HR Management", "Recruitment", "Payroll", "Communication", "MS Office"],
    "upsc": ["General Knowledge", "Current Affairs", "Reasoning", "English Grammar", "Essay Writing"],
    "ssc": ["Quantitative Aptitude", "Reasoning", "General Knowledge", "English Grammar"],
    "banking": ["Quantitative Aptitude", "Reasoning", "Banking Preparation", "Current Affairs", "English Grammar"],
    "teaching": ["Teaching", "B.Ed", "CTET", "Communication", "Subject Knowledge"],
}

# Learning resource hints for common skills (used by the fallback path).
LEARN_RESOURCES = {
    "python": "Python.org tutorial + freeCodeCamp Python course",
    "javascript": "MDN Web Docs + JavaScript.info",
    "react": "Official React docs (react.dev) + Scrimba React course",
    "sql": "SQLBolt + Khan Academy SQL",
    "docker": "Docker official 'Get Started' guide",
    "aws": "AWS Cloud Practitioner Essentials (free)",
    "machine learning": "Andrew Ng's Machine Learning course (Coursera)",
    "git": "Git official docs + Atlassian Git tutorial",
}


class SkillGapRequest(BaseModel):
    current_skills: List[str] = Field(default_factory=list)
    target_role: str = Field(min_length=1, max_length=120)


def _required_skills_for_role(target_role: str, jobs: list) -> List[str]:
    """Find the skills a target role needs, preferring real jobs in the DB."""
    role_lower = target_role.lower()
    collected: List[str] = []
    seen = set()

    # 1) Skills from jobs whose title matches the target role.
    for job in jobs:
        if role_lower in job.get("title", "").lower():
            for skill in job.get("required_skills", []):
                key = skill.strip().lower()
                if key and key not in seen:
                    seen.add(key)
                    collected.append(skill.strip())

    # 2) Fall back to the built-in role map.
    if not collected:
        for key, skills in ROLE_SKILLS.items():
            if key in role_lower:
                for skill in skills:
                    sk = skill.strip().lower()
                    if sk not in seen:
                        seen.add(sk)
                        collected.append(skill)
                break

    return collected


def _resource_for(skill: str) -> str:
    return LEARN_RESOURCES.get(skill.strip().lower(), f"Search '{skill} tutorial' on YouTube / freeCodeCamp")


def fallback_skill_gap(data: SkillGapRequest, jobs: list) -> dict:
    """Compute a skill gap without an AI call."""
    required = _required_skills_for_role(data.target_role, jobs)
    have_lower = {s.strip().lower() for s in data.current_skills if s.strip()}

    matched = [s for s in required if s.lower() in have_lower]
    missing = [s for s in required if s.lower() not in have_lower]

    readiness = int(len(matched) / len(required) * 100) if required else 0

    return {
        "target_role": data.target_role,
        "readiness_percent": readiness,
        "matched_skills": matched,
        "missing_skills": [
            {"skill": s, "why": f"{s} is commonly required for {data.target_role} roles.",
             "resource": _resource_for(s)}
            for s in missing
        ],
        "advice": (
            f"You already cover {len(matched)} of {len(required)} key skills. "
            f"Focus on the missing ones to become job-ready."
            if required else
            "Target role ke liye specific skills nahi mili — thoda specific role likhein."
        ),
        "source": "fallback",
    }


def gemini_skill_gap(data: SkillGapRequest, jobs: list) -> dict:
    """Use Gemini for a richer skill gap analysis; fall back on any error."""
    gemini_client = get_gemini_client()
    if gemini_client is None:
        return fallback_skill_gap(data, jobs)

    prompt = f"""
You are a career coach. Analyse the skill gap between a candidate and their target role.

Target role: {data.target_role}
Candidate's current skills: {', '.join(data.current_skills) or '(none provided)'}

Return ONLY a JSON object with this exact shape (no markdown, no extra text):
{{
  "target_role": "{data.target_role}",
  "readiness_percent": 0,
  "matched_skills": ["skills the candidate already has that matter for this role"],
  "missing_skills": [
    {{"skill": "", "why": "1 short line why it's needed", "resource": "1 concrete free resource to learn it"}}
  ],
  "advice": "2-3 sentence encouraging, actionable advice"
}}

readiness_percent must be an integer 0-100 reflecting how ready they are for the role.
Keep it realistic and specific to the target role.
"""

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt,
        )
        text = strip_json_fence(response.text or "")
        result = json.loads(text)
        result.setdefault("target_role", data.target_role)
        result.setdefault("readiness_percent", 0)
        result.setdefault("matched_skills", [])
        result.setdefault("missing_skills", [])
        result.setdefault("advice", "")
        result["source"] = "gemini"
        return result
    except Exception as e:  # noqa: BLE001 - fall back on any AI failure
        print(f"Gemini skill gap error: {e}. Using fallback analysis...")
        return fallback_skill_gap(data, jobs)


@router.post("/skill-gap")
async def skill_gap(data: SkillGapRequest):
    jobs = await get_all_jobs()
    return gemini_skill_gap(data, jobs)
