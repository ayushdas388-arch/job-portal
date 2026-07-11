import asyncio
from pydantic import BaseModel, Field

class QuizRequest(BaseModel):
    topic: str = "Aptitude"
    count: int = 30
    difficulty: str = "medium"
    seed: str = "123"

from routes.prep import groq_quiz
import sys

req = QuizRequest()
res = groq_quiz(req)
print("SUCCESS:", res.get("source") == "groq")
if res.get("source") != "groq":
    print("FAILED TO GENERATE:", res)
else:
    print(f"Generated {len(res.get('questions', []))} questions.")
