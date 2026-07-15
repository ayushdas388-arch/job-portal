"""AI Interview: conversational HR + Technical rounds powered by Gemini.

The frontend handles voice (speech-to-text and text-to-speech) using the
browser's Web Speech API. This backend only deals with text: it takes the
full conversation history plus the round type, and returns the interviewer's
next line (a question, a follow-up, or closing feedback).

Stateless by design: the frontend sends the whole transcript each turn, so
we never store sessions server-side. Simple, and it survives restarts.
"""
import json
import logging
from typing import List, Literal, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from routes.ai import query_groq, query_groq_async, strip_json_fence
from config import GROQ_API_KEY
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/interview", tags=["Interview"])

# ---------------------------------------------------------------------------
# Round definitions: each round gets its own interviewer persona + rules.
# ---------------------------------------------------------------------------

ROUND_PROMPTS = {
    "hr": (
        "You are a highly realistic, professional, yet empathetic Senior HR Manager at a top-tier tech company. "
        "You are conducting the final behavioral/HR round. Your goal is to evaluate the candidate's cultural fit, "
        "communication skills, emotional intelligence, and problem-solving mindset. "
        "CRITICAL RULES: "
        "1. React naturally to what the candidate just said. If they give a vague answer, push back politely or ask for a specific real-world example (STAR method). "
        "2. Ask exactly ONE question at a time. Keep it conversational, engaging, and spoken-friendly (it will be read aloud). "
        "3. Sound human. Use phrases like 'That makes sense,' or 'I see. But what if...'. "
        "4. Do NOT ask technical coding questions. Focus purely on behavior, teamwork, and motivation."
    ),
    "technical": (
        "You are a rigorous, experienced Senior Technical Lead conducting a real-world technical interview for the role of '{role}'. "
        "You expect deep, practical engineering answers, not just textbook definitions. "
        "CRITICAL RULES: "
        "1. Actively analyze the candidate's previous answer. If they are correct, acknowledge it and probe deeper into trade-offs, edge cases, or scalability. If they are wrong or shallow, point it out gently and ask them to clarify. "
        "2. Ask exactly ONE question at a time. Keep your tone professional, analytical, and intellectually curious. "
        "3. Keep it conversational and spoken-friendly (it will be read aloud). "
        "4. Focus on problem-solving approaches, architecture, debugging, and core concepts relevant to their tech stack."
    ),
}

OPENING_LINE = {
    "hr": "Hi there, thank you for taking the time to speak with me today. To get us started, I'd love to hear a brief overview of your background and what you're looking for in your next role.",
    "technical": "Hello, welcome to the technical round. I'm excited to learn more about your engineering experience. To warm up, could you tell me about the most technically challenging project you've worked on recently?",
}

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class Turn(BaseModel):
    # "interviewer" = the AI, "candidate" = the user
    role: Literal["interviewer", "candidate"]
    text: str = Field(min_length=1, max_length=4000)

class InterviewRequest(BaseModel):
    round: Literal["hr", "technical"] = "hr"
    role: str = Field(default="Software Developer", max_length=120)
    # full conversation so far; empty list = start of interview
    history: List[Turn] = Field(default_factory=list)
    # when true, the AI wraps up and returns structured feedback instead of a question
    finish: bool = False
    question_limit: int = Field(default=6, ge=1, le=20)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _transcript(history: List[Turn]) -> str:
    lines = []
    for turn in history:
        speaker = "Interviewer" if turn.role == "interviewer" else "Candidate"
        lines.append(f"{speaker}: {turn.text}")
    return "\n".join(lines)

def _count_questions(history: List[Turn]) -> int:
    return sum(1 for t in history if t.role == "interviewer")

def _fallback_reply(data: InterviewRequest) -> dict:
    """Used when Gemini is unavailable. Keeps the interview usable."""
    if not data.history:
        return {"reply": OPENING_LINE[data.round], "done": False, "source": "fallback"}
    generic = {
        "hr": "Thanks for sharing. Can you tell me about a time you faced a challenge and how you handled it?",
        "technical": "Good. Can you explain how you would approach debugging a problem you have never seen before?",
    }
    return {"reply": generic[data.round], "done": False, "source": "fallback"}

# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------

def run_interview_turn(data: InterviewRequest) -> dict:
    # First turn with no history: return a fixed opening line (no API needed).
    if not data.history and not data.finish:
        return {"reply": OPENING_LINE[data.round], "done": False, "source": "opening"}

    if not GROQ_API_KEY:
        return _fallback_reply(data)

    round_prompt = ROUND_PROMPTS[data.round].format(role=data.role)
    transcript = _transcript(data.history)
    asked = _count_questions(data.history)

    if data.finish or asked >= data.question_limit:
        # Wrap-up: ask Groq for structured feedback.
        prompt = (
            f"{round_prompt}\n\n"
            f"The interview is now over. Here is the full transcript:\n\n{transcript}\n\n"
            "Give the candidate honest, encouraging feedback. Reply ONLY with JSON of "
            'this exact shape: {"reply": string, "score": number (0-100), '
            '"strengths": [string], "improvements": [string]}. '
            "Keep 'reply' to 2-3 spoken sentences (it will be read aloud)."
        )
        try:
            response_text = query_groq(prompt, json_mode=True)
            if not response_text:
                return {
                    "reply": "That's the end of our interview. Thanks for your time, you did well.",
                    "done": True,
                    "source": "fallback",
                }
            result = json.loads(strip_json_fence(response_text))
            return {
                "reply": str(result.get("reply", "Thanks, that's the end of the interview.")),
                "score": result.get("score"),
                "strengths": result.get("strengths", []),
                "improvements": result.get("improvements", []),
                "done": True,
                "source": "groq",
            }
        except Exception as exc:
            logger.warning("interview wrap-up failed: %s", exc)
            return {
                "reply": "That's the end of our interview. Thanks for your time, you did well.",
                "done": True,
                "source": "fallback",
            }

    # Normal turn: react to the last answer and ask the next question.
    prompt = (
        f"{round_prompt}\n\n"
        f"Conversation so far:\n{transcript}\n\n"
        f"You have asked {asked} question(s) so far; aim for about "
        f"{data.question_limit} total. Reply with ONLY your next spoken line as the "
        "interviewer (a short reaction plus one question). No JSON, no labels, just "
        "the words you would say."
    )
    try:
        reply = query_groq(prompt, json_mode=False)
        if not reply or not reply.strip():
            return _fallback_reply(data)
        return {"reply": reply.strip(), "done": False, "source": "groq"}
    except Exception as exc:
        logger.warning("interview turn failed: %s", exc)
        return _fallback_reply(data)

# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post("/chat")
async def interview_chat(data: InterviewRequest):
    """One turn of the interview.

    Frontend sends the round, target role, and the full history each time.
    Returns the interviewer's next line, or final feedback when finished.
    """
    return run_interview_turn(data)
