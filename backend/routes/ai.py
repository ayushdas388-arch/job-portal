from __future__ import annotations

import io
import json
import re
from typing import List, Optional

import pdfplumber
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

import httpx
from config import GROQ_API_KEY
from external_jobs import build_search_links, normalize_keywords, normalize_query

GROQ_MODEL = "llama-3.3-70b-versatile"

router = APIRouter(prefix="/ai", tags=["AI"])

ROLE_SKILLS = {
    "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "TypeScript", "UI/UX"],
    "Backend Developer": ["Python", "Node.js", "FastAPI", "Django", "SQL", "MongoDB"],
    "Full Stack Developer": ["React", "Node.js", "JavaScript", "SQL", "MongoDB", "Git"],
    "Data Analyst": ["SQL", "Excel", "Power BI", "Tableau", "Python", "Data Analysis"],
    "Data Scientist": ["Python", "Machine Learning", "Statistics", "Pandas", "SQL", "Data Science"],
    "DevOps Engineer": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git"],
    "Cloud Engineer": ["AWS", "Azure", "Docker", "Kubernetes", "Linux"],
    "Mobile Developer": ["Flutter", "React Native", "Android Development", "iOS Development", "Kotlin", "Swift"],
    "UI/UX Designer": ["Figma", "Adobe XD", "UI/UX", "Photoshop", "Illustrator"],
    "Digital Marketer": ["SEO", "Digital Marketing", "Content Writing", "Analytics", "Sales"],
    "Accountant": ["Accounting", "Tally", "GST", "Finance", "Excel"],
}

EXTRA_SKILLS = [
    "Java", "C++", "C#", "PHP", "Ruby", "Swift", "Kotlin", "Angular", "Vue.js",
    "Next.js", "Flask", "Spring Boot", "Express.js", "Deep Learning", "R",
    "Google Cloud", "Cybersecurity", "Blockchain", "Web3", "Solidity", "Unity",
    "Unreal Engine", "Communication", "Project Management", "Agile", "Scrum",
    "Product Management", "Recruitment", "Payroll", "Reasoning", "Current Affairs",
    "Quantitative Aptitude", "UPSC Preparation", "SSC Preparation", "Banking Preparation",
    "Teaching", "B.Ed", "CTET", "Typing", "MS Office", "AutoCAD", "Electrical",
    "Mechanical", "Civil Engineering", "Nursing", "Pharmacy", "Medical Coding",
    "Legal", "Law", "Photography", "Journalism", "Media",
]

KNOWN_SKILLS = sorted(
    {
        skill
        for skills in ROLE_SKILLS.values()
        for skill in skills
    }.union(EXTRA_SKILLS),
    key=len,
    reverse=True,
)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def query_groq(prompt: str, json_mode: bool = False) -> str | None:
    if not GROQ_API_KEY:
        return None
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        with httpx.Client() as client:
            response = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as exc:
        print(f"Groq API error: {exc}")
        return None


async def query_groq_async(prompt: str, json_mode: bool = False) -> str | None:
    if not GROQ_API_KEY:
        return None
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as exc:
        print(f"Groq Async API error: {exc}")
        return None


def strip_json_fence(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def extract_known_skills(text: str) -> list[str]:
    text_lower = text.lower()
    detected = []
    seen = set()

    for skill in KNOWN_SKILLS:
        key = skill.lower()
        if key in seen:
            continue
        if re.search(rf"(?<!\w){re.escape(key)}(?!\w)", text_lower):
            detected.append(skill)
            seen.add(key)

    return detected


def infer_roles_from_skills(skills: list[str], limit: int = 3) -> list[dict]:
    cleaned = normalize_keywords(skills)
    if not cleaned:
        return []

    skill_keys = {skill.lower() for skill in cleaned}
    suggestions = []

    for role, role_skills in ROLE_SKILLS.items():
        matched = [skill for skill in role_skills if skill.lower() in skill_keys]
        if not matched:
            continue

        match_percent = min(99, int(45 + (len(matched) / len(role_skills) * 55)))
        suggestions.append(
            {
                "title": role,
                "skills": matched,
                "match_percent": match_percent,
                "reason": f"Based on your overlap with {', '.join(matched[:4])}.",
            }
        )

    suggestions.sort(key=lambda item: item["match_percent"], reverse=True)
    if suggestions:
        return suggestions[:limit]

    query = normalize_query(cleaned)
    return [
        {
            "title": query or "General job search",
            "skills": cleaned[:3],
            "match_percent": 60,
            "reason": "Built from the strongest keywords found in your profile.",
        }
    ]


def build_external_match_cards(searches: list[dict], skills: list[str]) -> list[dict]:
    cards = []
    seen = set()

    for search in searches[:3]:
        query_parts = [search["title"], *search.get("skills", [])[:2]]
        links = build_search_links(query_parts, limit=3)
        for link in links:
            key = (search["title"], link["site"])
            if key in seen:
                continue
            seen.add(key)
            cards.append(
                {
                    "title": search["title"],
                    "company": link["site"],
                    "location": "External platform",
                    "match_percent": search["match_percent"],
                    "reason": search["reason"],
                    "url": link["url"],
                    "query": link["query"],
                    "source_site": link["site"],
                    "detected_skills": skills,
                }
            )

    return cards[:6]


def fallback_external_match(user_info: str, provided_skills: list[str] | None = None) -> dict:
    skills = normalize_keywords(provided_skills or extract_known_skills(user_info))
    searches = infer_roles_from_skills(skills)
    cards = build_external_match_cards(searches, skills)
    base_terms = skills or [search["title"] for search in searches]

    return {
        "detected_skills": skills,
        "recommended_roles": [search["title"] for search in searches],
        "matched_jobs": cards,
        "external_sources": build_search_links(base_terms, limit=5),
        "summary": "Showing live search links from external platforms based on your profile.",
    }


async def groq_external_match(user_info: str, provided_skills: list[str] | None = None) -> dict:
    if not GROQ_API_KEY:
        return fallback_external_match(user_info, provided_skills)

    prompt = f"""
You are a job-search assistant. The portal does not host its own jobs.
Your task is to infer the best external job-search intents from the user's profile.

User profile:
{user_info}

Return ONLY a JSON object in this exact shape:
{{
  "detected_skills": ["", ""],
  "searches": [
    {{
      "title": "specific job title to search for",
      "skills": ["top matching skills"],
      "match_percent": 0,
      "reason": "one short sentence"
    }}
  ],
  "summary": "one short sentence"
}}

Rules:
- Provide 2 to 3 search titles.
- match_percent must be an integer between 50 and 99.
- Keep the titles practical for external job boards.
- Keep detected_skills and skills truthful to the profile.
"""

    try:
        response_text = await query_groq_async(prompt, json_mode=True)
        if not response_text:
            return fallback_external_match(user_info, provided_skills)

        result = json.loads(strip_json_fence(response_text))
        detected_skills = normalize_keywords(result.get("detected_skills", []))
        if provided_skills:
            detected_skills = normalize_keywords([*provided_skills, *detected_skills])

        searches = []
        for item in result.get("searches", []):
            title = " ".join(str(item.get("title", "")).split())
            if not title:
                continue
            searches.append(
                {
                    "title": title,
                    "skills": normalize_keywords(item.get("skills", []))[:4],
                    "match_percent": max(50, min(99, int(item.get("match_percent", 70)))),
                    "reason": " ".join(str(item.get("reason", "")).split()) or "Recommended from your profile.",
                }
            )

        if not searches:
            return fallback_external_match(user_info, provided_skills)

        return {
            "detected_skills": detected_skills,
            "recommended_roles": [search["title"] for search in searches],
            "matched_jobs": build_external_match_cards(searches, detected_skills),
            "external_sources": build_search_links(
                detected_skills or [search["title"] for search in searches],
                limit=5,
            ),
            "summary": " ".join(str(result.get("summary", "")).split()) or "Showing external job searches based on your profile.",
            "source": "groq",
        }
    except Exception as exc:
        print(f"Groq external match error: {exc}. Using fallback recommendations...")
        return fallback_external_match(user_info, provided_skills)


@router.post("/match-resume")
async def match_resume(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    content = await file.read()
    resume_text = extract_text_from_pdf(content)
    result = await groq_external_match(f"Resume:\n{resume_text}")
    return {
        **result,
        "total_matches": len(result["matched_jobs"]),
    }


@router.post("/match-skills")
async def match_skills(skills: List[str]):
    result = await groq_external_match(
        f"Skills: {', '.join(skills)}",
        provided_skills=skills,
    )
    return {
        "your_skills": normalize_keywords(skills),
        **result,
        "total_matches": len(result["matched_jobs"]),
    }


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
    if not text:
        return []
    parts = re.split(r"[\n\r]+|(?<=[.;])\s+|-\s", text)
    return [part.strip(" -\t") for part in parts if part.strip(" -\t")]


def fallback_resume(data: ResumeRequest) -> dict:
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
                "role": item.role,
                "company": item.company,
                "duration": item.duration,
                "bullets": _split_bullets(item.description),
            }
            for item in data.experience
        ],
        "projects": [
            {"name": item.name, "bullets": _split_bullets(item.description)}
            for item in data.projects
        ],
        "skills": data.skills,
    }


def groq_resume(data: ResumeRequest) -> dict:
    if not GROQ_API_KEY:
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
"""

    try:
        response_text = query_groq(prompt, json_mode=True)
        if not response_text:
            return fallback_resume(data)

        result = json.loads(strip_json_fence(response_text))
        result.setdefault("summary", "")
        result.setdefault("experience", [])
        result.setdefault("projects", [])
        result.setdefault("skills", data.skills)
        result["source"] = "groq"
        return result
    except Exception as exc:
        print(f"Groq resume error: {exc}. Using fallback resume builder...")
        return fallback_resume(data)


@router.post("/build-resume")
async def build_resume(data: ResumeRequest):
    generated = groq_resume(data)
    return {
        "contact": {
            "full_name": data.full_name,
            "email": data.email,
            "phone": data.phone,
            "location": data.location,
            "linkedin": data.linkedin,
            "target_role": data.target_role,
        },
        "education": [item.model_dump() for item in data.education],
        "certifications": data.certifications,
        **generated,
    }


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


def _required_skills_for_role(target_role: str) -> List[str]:
    role_lower = target_role.lower()
    for role, skills in ROLE_SKILLS.items():
        if role.lower() in role_lower or role_lower in role.lower():
            return skills
    for role, skills in ROLE_SKILLS.items():
        if any(token in role_lower for token in role.lower().split()):
            return skills
    return []


def _resource_for(skill: str) -> str:
    return LEARN_RESOURCES.get(skill.strip().lower(), f"Search '{skill} tutorial' on YouTube or freeCodeCamp")


def fallback_skill_gap(data: SkillGapRequest) -> dict:
    required = _required_skills_for_role(data.target_role)
    have_lower = {skill.strip().lower() for skill in data.current_skills if skill.strip()}

    matched = [skill for skill in required if skill.lower() in have_lower]
    missing = [skill for skill in required if skill.lower() not in have_lower]
    readiness = int(len(matched) / len(required) * 100) if required else 0

    return {
        "target_role": data.target_role,
        "readiness_percent": readiness,
        "matched_skills": matched,
        "missing_skills": [
            {
                "skill": skill,
                "why": f"{skill} is commonly required for {data.target_role} roles.",
                "resource": _resource_for(skill),
            }
            for skill in missing
        ],
        "advice": (
            f"You already cover {len(matched)} of {len(required)} key skills. Focus on the missing ones next."
            if required
            else "No specific skills were found for that target role. Try entering a more specific role."
        ),
        "source": "fallback",
    }


def groq_skill_gap(data: SkillGapRequest) -> dict:
    if not GROQ_API_KEY:
        return fallback_skill_gap(data)

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
"""

    try:
        response_text = query_groq(prompt, json_mode=True)
        if not response_text:
            return fallback_skill_gap(data)

        result = json.loads(strip_json_fence(response_text))
        result.setdefault("target_role", data.target_role)
        result.setdefault("readiness_percent", 0)
        result.setdefault("matched_skills", [])
        result.setdefault("missing_skills", [])
        result.setdefault("advice", "")
        result["source"] = "groq"
        return result
    except Exception as exc:
        print(f"Groq skill gap error: {exc}. Using fallback analysis...")
        return fallback_skill_gap(data)


@router.post("/skill-gap")
async def skill_gap(data: SkillGapRequest):
    return groq_skill_gap(data)
