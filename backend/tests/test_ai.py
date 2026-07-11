import unittest
from unittest.mock import patch

from routes import ai


class AIRouteTests(unittest.IsolatedAsyncioTestCase):
    def test_strip_json_fence_removes_markdown_wrapper(self):
        payload = """```json
{
  "summary": "ok"
}
```"""
        self.assertEqual(
            ai.strip_json_fence(payload),
            '{\n  "summary": "ok"\n}',
        )

    def test_extract_known_skills_detects_resume_keywords(self):
        resume_text = "Worked with Python, FastAPI, React and Docker on production apps."
        skills = ai.extract_known_skills(resume_text)

        self.assertIn("Python", skills)
        self.assertIn("FastAPI", skills)
        self.assertIn("React", skills)

    def test_fallback_external_match_returns_live_search_cards(self):
        result = ai.fallback_external_match("Skills: Python, FastAPI, SQL", ["Python", "FastAPI", "SQL"])

        self.assertTrue(result["matched_jobs"])
        self.assertTrue(result["external_sources"])
        self.assertIn("Backend Developer", result["recommended_roles"])
        self.assertIn("url", result["matched_jobs"][0])

    async def test_groq_external_match_uses_fallback_when_client_unavailable(self):
        with patch.object(ai, "GROQ_API_KEY", ""):
            result = await ai.groq_external_match("Skills: React, JavaScript", ["React", "JavaScript"])

        self.assertTrue(result["matched_jobs"])
        self.assertIn("Frontend Developer", result["recommended_roles"])


if __name__ == "__main__":
    unittest.main()
