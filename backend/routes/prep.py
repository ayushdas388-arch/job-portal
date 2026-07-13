"""Preparation Hub: curated study resources + AI study plan + practice quiz.

Quiz questions now come from OpenTDB (free, no API key, unlimited) first,
then fall back to Gemini, then to a small hand-built bank. Everything
degrades gracefully so the feature always returns something usable.
"""
import html
import json
import logging
import random
from datetime import date
from typing import List, Optional

import requests
from fastapi import APIRouter
from pydantic import BaseModel, Field, field_validator

from routes.ai import query_groq, query_groq_async, strip_json_fence
from config import GROQ_API_KEY
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/prep", tags=["Preparation"])

# ---------------------------------------------------------------------------
# Curated resource library (static - always available, no API needed)
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
    count: int = Field(default=20, ge=1, le=50)
    difficulty: str = Field(default="medium", max_length=20)
    seed: str = Field(default="", max_length=100)

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
        ("Build the base", "Understand the syllabus and cover the basics with NCERT or standard books."),
        ("Core practice", "Make notes for each topic and solve practice questions every day."),
        ("Mock tests", "Take full-length mock tests and analyze your mistakes."),
        ("Revision", "Focus on revision, weak areas, and previous year papers."),
    ]
    plan = []
    for i in range(weeks):
        phase = phases[min(len(phases) - 1, int(i / max(1, weeks) * len(phases)))]
        plan.append({
            "week": i + 1,
            "focus": phase[0],
            "tasks": [
                phase[1],
                f"Study for about {data.hours_per_day} hours each day.",
                "Take one short self-test every week.",
            ],
        })
    return {
        "target": data.target,
        "weeks": weeks,
        "hours_per_day": data.hours_per_day,
        "summary": f"A {weeks}-week plan for {data.target}, based on {data.hours_per_day} study hours per day.",
        "plan": plan,
        "source": "fallback",
    }

def groq_study_plan(data: StudyPlanRequest) -> dict:
    if not GROQ_API_KEY:
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
        "Keep tasks short, practical, and written in clear English."
    )
    try:
        response_text = query_groq(prompt, json_mode=True)
        if not response_text:
            return fallback_study_plan(data)

        result = json.loads(strip_json_fence(response_text))
        result.setdefault("summary", "")
        result.setdefault("plan", [])
        result["target"] = data.target
        result["weeks"] = weeks
        result["hours_per_day"] = data.hours_per_day
        result["source"] = "groq"
        if not result["plan"]:
            return fallback_study_plan(data)
        return result
    except Exception as exc:
        logger.warning("groq_study_plan failed: %s", exc)
        return fallback_study_plan(data)

# ---------------------------------------------------------------------------
# Practice quiz - OpenTDB (primary), Gemini (optional), static bank (last)
# ---------------------------------------------------------------------------

# Your topic names -> OpenTDB category IDs
OPENTDB_CATEGORIES = {
    "general": 9,
    "computers": 18,
    "computer science": 18,
    "coding": 18,
    "python": 18,
    "sql": 18,
    "maths": 19,
    "math": 19,
    "aptitude": 19,
    "science": 17,
    "gk": 9,
    "general knowledge": 9,
    "sports": 21,
    "history": 23,
    "geography": 22,
    "politics": 24,
}

def _map_category(topic: str) -> Optional[int]:
    key = topic.strip().lower()
    # exact match first, then partial match
    if key in OPENTDB_CATEGORIES:
        return OPENTDB_CATEGORIES[key]
    for name, cat_id in OPENTDB_CATEGORIES.items():
        if name in key or key in name:
            return cat_id
    return None  # None = OpenTDB picks any category (mixed)

def _map_difficulty(difficulty: str) -> Optional[str]:
    d = difficulty.strip().lower()
    return d if d in {"easy", "medium", "hard"} else None

def opentdb_quiz(data: QuizRequest) -> dict:
    """Pulls MCQs from OpenTDB. No API key needed, unlimited & free."""
    params = {
        "amount": min(data.count, 50),   # OpenTDB max 50 per call
        "type": "multiple",              # 4-option MCQs only
    }
    category = _map_category(data.topic)
    if category is not None:
        params["category"] = category
    difficulty = _map_difficulty(data.difficulty)
    if difficulty is not None:
        params["difficulty"] = difficulty

    try:
        resp = requests.get("https://opentdb.com/api.php", params=params, timeout=10)
        resp.raise_for_status()
        payload = resp.json()
    except Exception as exc:
        logger.warning("opentdb_quiz request failed: %s", exc)
        return fallback_quiz(data)

    # response_code 0 = success. 1 = not enough questions for this filter.
    if payload.get("response_code") != 0 or not payload.get("results"):
        # if the difficulty filter was too narrow, retry once without it
        if difficulty is not None:
            relaxed = QuizRequest(
                topic=data.topic, count=data.count,
                difficulty="", seed=data.seed,
            )
            return opentdb_quiz(relaxed)
        return fallback_quiz(data)

    cleaned = []
    for item in payload["results"]:
        # OpenTDB returns HTML-encoded strings, so decode them
        question = html.unescape(item.get("question", "")).strip()
        correct = html.unescape(item.get("correct_answer", "")).strip()
        incorrect = [html.unescape(o).strip() for o in item.get("incorrect_answers", [])]

        if not question or not correct or len(incorrect) != 3:
            continue

        options = incorrect + [correct]
        random.shuffle(options)          # randomize position of correct answer
        answer_index = options.index(correct)

        cleaned.append({
            "question": question,
            "options": options,
            "answer_index": answer_index,
            "explanation": f"The correct answer is: {correct}.",
        })

    if not cleaned:
        return fallback_quiz(data)

    return {
        "topic": data.topic,
        "questions": cleaned[: data.count],
        "note": "",
        "source": "opentdb",
    }

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
            "explanation": "20/100 x 250 = 50.",
        },
    ],
    "reasoning": [
        {
            "question": "Find the next number: 2, 6, 12, 20, ?",
            "options": ["28", "30", "32", "26"],
            "answer_index": 1,
            "explanation": "Differences are 4, 6, 8, 10 -> 20 + 10 = 30.",
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
        note = "Only sample questions are available for this topic right now."
        questions = [
            {
                "question": f"After learning the basics of '{data.topic}', what should you do first?",
                "options": ["Solve practice questions", "Do nothing", "Only watch videos", "Skip it"],
                "answer_index": 0,
                "explanation": "Practice is what turns understanding into long-term retention.",
            }
        ]
    return {
        "topic": data.topic,
        "questions": questions[: data.count],
        "note": note,
        "source": "fallback",
    }

def groq_quiz(data: QuizRequest) -> dict:
    if not GROQ_API_KEY:
        return fallback_quiz(data)

    prompt = (
        f"You are an expert exam question creator for competitive exams (like UPSC, SSC, Banking, and IT placements).\n"
        f"Generate exactly {data.count} multiple-choice questions (MCQs) for the topic '{data.topic}'.\n"
        f"Difficulty level MUST strictly be '{data.difficulty}' (easy, intermediate, or hard).\n"
        f"If the topic is 'Reasoning', generate logical reasoning, syllogisms, data sufficiency, coding-decoding, or analytical puzzles with a logical structure.\n"
        f"Randomize the selection of questions (Seed: {data.seed}). Ensure no repetition of standard questions.\n\n"
        "Reply ONLY with a JSON object in this exact shape (no markdown, no extra text):\n"
        "{\n"
        "  \"questions\": [\n"
        "    {\n"
        "      \"question\": \"Question text here\",\n"
        "      \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n"
        "      \"answer_index\": 0,\n"
        "      \"explanation\": \"Step-by-step logical explanation of why the correct option is the right answer\"\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
        "Rules:\n"
        "- The 'options' list must contain exactly 4 choices.\n"
        "- The 'answer_index' must be a 0-based integer index corresponding to the correct answer (0 to 3).\n"
    )
    try:
        response_text = query_groq(prompt, json_mode=True)
        if not response_text:
            return fallback_quiz(data)

        result = json.loads(strip_json_fence(response_text))
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
            "source": "groq",
        }
    except Exception as exc:
        logger.warning("groq_quiz failed: %s", exc)
        fallback = fallback_quiz(data)
        if "429" in str(exc) or "RESOURCE_EXHAUSTED" in str(exc) or "rate_limit" in str(exc).lower():
            fallback["note"] = "Groq API Quota Exceeded (Rate Limit). Showing limited sample questions for now."
        return fallback

# ---------------------------------------------------------------------------
# Endpoints (public - no login needed, like Skill Gap)
# ---------------------------------------------------------------------------

@router.get("/resources")
async def get_resources():
    return {"library": RESOURCE_LIBRARY}

@router.post("/study-plan")
async def study_plan(data: StudyPlanRequest):
    return groq_study_plan(data)

@router.post("/quiz")
async def quiz(data: QuizRequest):
    # Try Groq AI first to generate tailored questions matching the exact topic and difficulty.
    # If Groq is unavailable or fails, fall back to OpenTDB, and then to the static bank.
    groq_res = groq_quiz(data)
    if groq_res.get("source") == "groq":
        return groq_res

    opentdb_res = opentdb_quiz(data)
    if opentdb_res.get("source") == "opentdb":
        return opentdb_res

    return groq_res
