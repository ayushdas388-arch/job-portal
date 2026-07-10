import unittest

from external_jobs import build_search_links, list_platforms, normalize_query


class ExternalJobsTests(unittest.TestCase):
    def test_normalize_query_uses_top_keywords(self):
        self.assertEqual(normalize_query(["Python", "FastAPI", "SQL", "Docker"]), "Python FastAPI SQL")

    def test_build_search_links_creates_private_platform_urls(self):
        links = build_search_links(["React", "JavaScript"])

        self.assertGreaterEqual(len(links), 5)
        self.assertEqual(links[0]["site"], "LinkedIn")
        self.assertIn("React JavaScript", links[0]["query"])
        self.assertTrue(links[0]["url"].startswith("https://"))

    def test_list_platforms_filters_by_category(self):
        government = list_platforms(category="government")
        private = list_platforms(category="private")

        self.assertTrue(all(item["category"] == "government" for item in government))
        self.assertTrue(all(item["category"] == "private" for item in private))


if __name__ == "__main__":
    unittest.main()
