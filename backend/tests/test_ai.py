import unittest
from unittest.mock import patch

from routes import ai


SAMPLE_JOBS = [
    {
        "title": "Python Developer",
        "company": "Acme",
        "location": "Remote",
        "required_skills": ["Python", "FastAPI", "MongoDB"],
        "description": "",
    },
    {
        "title": "Frontend Developer",
        "company": "Beta",
        "location": "Delhi",
        "required_skills": ["React", "JavaScript"],
        "description": "",
    },
]


class AIRouteTests(unittest.IsolatedAsyncioTestCase):
    def test_strip_json_fence_removes_markdown_wrapper(self):
        payload = """```json
[
  {"job_number": 1, "match_percent": 90, "reason": "Strong fit"}
]
```"""
        self.assertEqual(
            ai.strip_json_fence(payload),
            '[\n  {"job_number": 1, "match_percent": 90, "reason": "Strong fit"}\n]',
        )

    def test_fallback_match_extracts_resume_skills(self):
        resume_text = "Resume:\nWorked on Python APIs with FastAPI and MongoDB."
        results = ai.fallback_match(resume_text, SAMPLE_JOBS)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "Python Developer")
        self.assertEqual(results[0]["match_percent"], 100)

    async def test_gemini_match_uses_fallback_when_client_unavailable(self):
        with patch.object(ai, "client", None), patch.object(ai, "GEMINI_API_KEY", ""):
            results = await ai.gemini_match("Skills: React, JavaScript", SAMPLE_JOBS)

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "Frontend Developer")


if __name__ == "__main__":
    unittest.main()
