import asyncio
from pydantic import BaseModel, Field

class QuizRequest(BaseModel):
    topic: str = "Aptitude"
    count: int = 30
    difficulty: str = "medium"
    seed: str = "123"

from routes.prep import gemini_quiz
import sys

req = QuizRequest()
res = gemini_quiz(req)
print("SUCCESS:", res.get("source") == "gemini")
if res.get("source") != "gemini":
    print("FAILED TO GENERATE:", res)
else:
    print(f"Generated {len(res.get('questions', []))} questions.")
