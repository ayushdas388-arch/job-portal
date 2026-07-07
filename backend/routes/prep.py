"""Preparation Hub: curated study resources + AI study plan + AI practice quiz.

Everything degrades gracefully — if Gemini isn't configured, sensible
hand-built fallbacks are returned so the feature always works.
"""
import json
import logging
from datetime import date
from typing import List, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator

from routes.ai import get_gemini_client, strip_json_fence

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/prep", tags=["Preparation"])

GEMINI_MODEL = "gemini-2.0-flash-lite"


# ---------------------------------------------------------------------------
# Curated resource library (static — always available, no API needed)
# ---------------------------------------------------------------------------

RESOURCE_LIBRARY = [
    {
        "category": "UPSC / Civil Services",
        "icon": "🏛️",
        "topics": ["History", "Polity", "Geography", "Economy", "Current Affairs", "Ethics"],
        "resources": [
            {"name": "NCERT Books (Class 6-12)", "link": "https://ncert.nic.in/textbook.php"},
            {"name": "PIB & The Hindu (Current Affairs)", "link": "https://pib.gov.in/"},
            {"name": "Laxmikanth Polity (must-read)", "link": "https://www.youtube.com/results?search_query=laxmikanth+polity"},
        ],
    },
    {
        "category": "SSC / Railway",
        "icon": "🚂",
        "topics": ["Quantitative Aptitude", "Reasoning", "General Awareness", "English"],
        "resources": [
            {"name": "SSC Previous Year Papers", "link": "https://ssc.gov.in/"},
            {"name": "Aptitude - freeCodeCamp / YouTube", "link": "https://www.youtube.com/results?search_query=ssc+maths+preparation"},
            {"name": "GK - GKToday", "link": "https://www.gktoday.in/"},
        ],
    },
    {
        "category": "Banking (IBPS / SBI)",
        "icon": "🏦",
        "topics": ["Quant", "Reasoning", "English", "Banking Awareness", "Computer Awareness"],
        "resources": [
            {"name": "IBPS Official", "link": "https://www.ibps.in/"},
            {"name": "Banking Awareness - YouTube", "link": "https://www.youtube.com/results?search_query=banking+awareness"},
            {"name": "Mock Tests - Oliveboard/Testbook", "link": "https://www.google.com/search?q=free+banking+mock+test"},
        ],
    },
    {
        "category": "Aptitude & Reasoning",
        "icon": "🧮",
        "topics": ["Number System", "Percentages", "Time & Work", "Puzzles", "Syllogism"],
        "resources": [
            {"name": "IndiaBIX Practice", "link": "https://www.indiabix.com/"},
            {"name": "Aptitude Full Course - YouTube", "link": "https://www.youtube.com/results?search_query=aptitude+full+course"},
        ],
    },
    {
        "category": "Coding / Tech Interview",
        "icon": "💻",
        "topics": ["Data Structures", "Algorithms", "DBMS", "OS", "System Design", "OOPs"],
        "resources": [
            {"name": "LeetCode", "link": "https://leetcode.com/"},
            {"name": "GeeksforGeeks", "link": "https://www.geeksforgeeks.org/"},
            {"name": "NeetCode (DSA patterns)", "link": "https://neetcode.io/"},
        ],
    },
    {
        "category": "English & Communication",
        "icon": "🗣️",
        "topics": ["Grammar", "Vocabulary", "Comprehension", "Interview English"],
        "resources": [
            {"name": "Grammarly Handbook", "link": "https://www.grammarly.com/blog/category/handbook/"},
            {"name": "Spoken English - YouTube", "link": "https://www.youtube.com/results?search_query=spoken+english+course"},
        ],
    },
    {
        "category": "Interview Preparation",
        "icon": "🎯",
        "topics": ["HR Questions", "Resume", "Body Language", "Mock Interviews"],
        "resources": [
            {"name": "Top HR Questions & Answers", "link": "https://www.youtube.com/results?search_query=hr+interview+questions+answers"},
            {"name": "Pramp - Free Mock Interviews", "link": "https://www.pramp.com/"},
        ],
    },
]


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class StudyPlanRequest(BaseModel):
    target: str = Field(min_length=1, max_length=120)
    exam_date: Optional[str] = None
    hours_per_day: int = Field(default=3, ge=1, le=16)
    level: str = Field(default="beginner", max_length=20)

    @field_validator("exam_date", mode="before")
    @classmethod
    def clean_date(cls, value):
        if not value:
            return None
        value = str(value).strip()
        if not value:
            return None
        try:
            date.fromisoformat(value)
        except ValueError as exc:
            raise ValueError("exam_date must be YYYY-MM-DD") from exc
        return value


class QuizRequest(BaseModel):
    topic: str = Field(min_length=1, max_length=120)
    count: int = Field(default=5, ge=1, le=10)
    difficulty: str = Field(default="medium", max_length=20)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _weeks_until(exam_date: Optional[str]) -> int:
    """Whole weeks between today and the exam (clamped 1..24). Default 4."""
    if not exam_date:
        return 4
    try:
        days = (date.fromisoformat(exam_date) - date.today()).days
    except ValueError:
        return 4
    if days <= 0:
        return 1
    return max(1, min(24, round(days / 7)))


# ---------------------------------------------------------------------------
# Study plan
# ---------------------------------------------------------------------------

def fallback_study_plan(data: StudyPlanRequest) -> dict:
    weeks = _weeks_until(data.exam_date)
    phases = [
        ("Build the base", "Syllabus samjho, basics + NCERT/standard books cover karo."),
        ("Core practice", "Har topic ke notes banao aur roz practice questions solve karo."),
        ("Mock tests", "Full-length mock tests do, mistakes analyse karo."),
        ("Revision", "Sirf revision + weak areas + previous year papers."),
    ]
    plan = []
    for i in range(weeks):
        # spread the 4 phases across however many weeks we have
        phase = phases[min(len(phases) - 1, int(i / max(1, weeks) * len(phases)))]
        plan.append({
            "week": i + 1,
            "focus": phase[0],
            "tasks": [
                phase[1],
                f"Roz ~{data.hours_per_day} ghante padho.",
                "Weekly ek chhota test lo apne aap ka.",
            ],
        })
    return {
        "target": data.target,
        "weeks": weeks,
        "hours_per_day": data.hours_per_day,
        "summary": f"{data.target} ke liye {weeks}-week plan, roz {data.hours_per_day} ghante ke hisaab se.",
        "plan": plan,
        "source": "fallback",
    }


def gemini_study_plan(data: StudyPlanRequest) -> dict:
    gemini_client = get_gemini_client()
    if gemini_client is None:
        return fallback_study_plan(data)

    weeks = _weeks_until(data.exam_date)
    prompt = (
        "You are a study coach for Indian competitive exams / job interviews. "
        f"Create a week-by-week study plan for the goal: '{data.target}'. "
        f"Level: {data.level}. Study time: {data.hours_per_day} hours/day. "
        f"Number of weeks: {weeks}. "
        "Reply ONLY with JSON of this exact shape: "
        '{"summary": string, "plan": [{"week": number, "focus": string, '
        '"tasks": [string, string, string]}]}. '
        "Keep tasks short and practical. You may mix simple Hindi/English (Hinglish)."
    )
    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        text = strip_json_fence(response.text or "")
        result = json.loads(text)
        result.setdefault("summary", "")
        result.setdefault("plan", [])
        result["target"] = data.target
        result["weeks"] = weeks
        result["hours_per_day"] = data.hours_per_day
        result["source"] = "gemini"
        if not result["plan"]:
            return fallback_study_plan(data)
        return result
    except Exception as exc:
        logger.warning("gemini_study_plan failed: %s", exc)
        return fallback_study_plan(data)


# ---------------------------------------------------------------------------
# Practice quiz
# ---------------------------------------------------------------------------

_QUIZ_BANK = {
    "aptitude": [
        {
            "question": "If a train travels 60 km in 45 minutes, its speed is?",
            "options": ["80 km/h", "75 km/h", "90 km/h", "60 km/h"],
            "answer_index": 0,
            "explanation": "60 km in 45 min = 60 / (45/60) = 80 km/h.",
        },
        {
            "question": "20% of 250 is?",
            "options": ["40", "50", "45", "60"],
            "answer_index": 1,
            "explanation": "20/100 × 250 = 50.",
        },
    ],
    "reasoning": [
        {
            "question": "Find the next number: 2, 6, 12, 20, ?",
            "options": ["28", "30", "32", "26"],
            "answer_index": 1,
            "explanation": "Differences are 4, 6, 8, 10 → 20 + 10 = 30.",
        },
    ],
    "python": [
        {
            "question": "Which keyword defines a function in Python?",
            "options": ["func", "def", "function", "lambda"],
            "answer_index": 1,
            "explanation": "`def` defines a named function in Python.",
        },
        {
            "question": "What is the output of len('hello')?",
            "options": ["4", "5", "6", "Error"],
            "answer_index": 1,
            "explanation": "'hello' has 5 characters.",
        },
    ],
    "sql": [
        {
            "question": "Which SQL clause filters rows?",
            "options": ["ORDER BY", "GROUP BY", "WHERE", "HAVING"],
            "answer_index": 2,
            "explanation": "WHERE filters rows before grouping.",
        },
    ],
}


def fallback_quiz(data: QuizRequest) -> dict:
    key = data.topic.strip().lower()
    questions: List[dict] = []
    for bank_key, items in _QUIZ_BANK.items():
        if bank_key in key or key in bank_key:
            questions = list(items)
            break
    note = ""
    if not questions:
        note = "AI setup na hone par sirf sample questions dikhte hain. Gemini key daalein taaki har topic pe questions banein."
        questions = [
            {
                "question": f"'{data.topic}' ke basics padhne ke baad, sabse pehle kya karna chahiye?",
                "options": ["Practice questions solve karna", "Kuch nahi", "Sirf videos dekhna", "Skip karna"],
                "answer_index": 0,
                "explanation": "Concept ke baad practice se hi retention aata hai.",
            }
        ]
    return {
        "topic": data.topic,
        "questions": questions[: data.count],
        "note": note,
        "source": "fallback",
    }


def gemini_quiz(data: QuizRequest) -> dict:
    gemini_client = get_gemini_client()
    if gemini_client is None:
        return fallback_quiz(data)

    prompt = (
        f"Generate {data.count} multiple-choice practice questions on the topic "
        f"'{data.topic}' at {data.difficulty} difficulty, for Indian exam/interview prep. "
        "Reply ONLY with JSON of this exact shape: "
        '{"questions": [{"question": string, "options": [string, string, string, string], '
        '"answer_index": number (0-3), "explanation": string}]}. '
        "Exactly 4 options each. answer_index is the 0-based index of the correct option."
    )
    try:
        response = gemini_client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
        )
        text = strip_json_fence(response.text or "")
        result = json.loads(text)
        questions = result.get("questions", [])
        cleaned = []
        for q in questions:
            options = q.get("options", [])
            idx = q.get("answer_index", 0)
            if not isinstance(options, list) or len(options) != 4:
                continue
            if not isinstance(idx, int) or not (0 <= idx <= 3):
                idx = 0
            cleaned.append({
                "question": str(q.get("question", "")).strip(),
                "options": [str(o) for o in options],
                "answer_index": idx,
                "explanation": str(q.get("explanation", "")).strip(),
            })
        if not cleaned:
            return fallback_quiz(data)
        return {
            "topic": data.topic,
            "questions": cleaned[: data.count],
            "note": "",
            "source": "gemini",
        }
    except Exception as exc:
        logger.warning("gemini_quiz failed: %s", exc)
        return fallback_quiz(data)


# ---------------------------------------------------------------------------
# Endpoints (public — no login needed, like Skill Gap)
# ---------------------------------------------------------------------------

@router.get("/resources")
async def get_resources():
    return {"library": RESOURCE_LIBRARY}


@router.post("/study-plan")
async def study_plan(data: StudyPlanRequest):
    return gemini_study_plan(data)


@router.post("/quiz")
async def quiz(data: QuizRequest):
    return gemini_quiz(data)
