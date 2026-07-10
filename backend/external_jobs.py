"""External job platform helpers.

The portal no longer stores or publishes its own jobs. Instead it generates
ready-to-open search links for external job platforms and official portals.
"""
from __future__ import annotations

from urllib.parse import quote, quote_plus

DEFAULT_LOCATION = "India"
MAX_QUERY_TERMS = 3

PRIVATE_PLATFORMS = [
    {
        "id": "linkedin",
        "site": "LinkedIn",
        "badge": "LI",
        "category": "private",
        "description": "Professional network with company and recruiter job listings.",
        "home_url": "https://www.linkedin.com/jobs/",
    },
    {
        "id": "naukri",
        "site": "Naukri",
        "badge": "NK",
        "category": "private",
        "description": "Large Indian job portal for private-sector roles.",
        "home_url": "https://www.naukri.com/",
    },
    {
        "id": "indeed",
        "site": "Indeed",
        "badge": "IN",
        "category": "private",
        "description": "Global job search engine with many current vacancies.",
        "home_url": "https://in.indeed.com/",
    },
    {
        "id": "foundit",
        "site": "Foundit",
        "badge": "FD",
        "category": "private",
        "description": "Indian hiring platform for tech and business roles.",
        "home_url": "https://www.foundit.in/",
    },
    {
        "id": "internshala",
        "site": "Internshala",
        "badge": "IS",
        "category": "private",
        "description": "Popular platform for internships and fresher jobs.",
        "home_url": "https://internshala.com/jobs/",
    },
    {
        "id": "wellfound",
        "site": "Wellfound",
        "badge": "WF",
        "category": "private",
        "description": "Startup and remote job opportunities.",
        "home_url": "https://wellfound.com/jobs",
    },
]

INTERNSHIP_PLATFORMS = [
    {
        "id": "internshala_intern",
        "site": "Internshala",
        "badge": "IS",
        "category": "internship",
        "description": "Popular platform for internships across all domains.",
        "home_url": "https://internshala.com/internships/",
    },
    {
        "id": "letsintern",
        "site": "LetsIntern",
        "badge": "LI",
        "category": "internship",
        "description": "Student platform for finding internships and student jobs.",
        "home_url": "https://www.letsintern.com/",
    },
    {
        "id": "linkedin_intern",
        "site": "LinkedIn Internships",
        "badge": "LI",
        "category": "internship",
        "description": "LinkedIn's dedicated filter for internship roles.",
        "home_url": "https://www.linkedin.com/jobs/internship-jobs",
    },
]

GOVERNMENT_PORTALS = [
    {
        "id": "ssc",
        "site": "SSC",
        "badge": "SSC",
        "category": "government",
        "description": "Staff Selection Commission recruitment and exam notices.",
        "home_url": "https://ssc.gov.in/",
    },
    {
        "id": "upsc",
        "site": "UPSC",
        "badge": "UPSC",
        "category": "government",
        "description": "Union Public Service Commission official recruitment portal.",
        "home_url": "https://upsc.gov.in/",
    },
    {
        "id": "rrb",
        "site": "RRB",
        "badge": "RRB",
        "category": "government",
        "description": "Railway recruitment boards and application links.",
        "home_url": "https://rrbapply.gov.in/",
    },
    {
        "id": "ibps",
        "site": "IBPS",
        "badge": "IBPS",
        "category": "government",
        "description": "Banking recruitment updates for PO, Clerk, and SO roles.",
        "home_url": "https://www.ibps.in/",
    },
    {
        "id": "ncs",
        "site": "NCS",
        "badge": "NCS",
        "category": "government",
        "description": "National Career Service portal with public job listings.",
        "home_url": "https://www.ncs.gov.in/",
    },
]

ALL_PLATFORMS = PRIVATE_PLATFORMS + GOVERNMENT_PORTALS + INTERNSHIP_PLATFORMS


def normalize_keywords(keywords: str | list[str] | tuple[str, ...]) -> list[str]:
    if isinstance(keywords, str):
        raw_items = keywords.replace("\n", ",").split(",")
    else:
        raw_items = list(keywords or [])

    cleaned: list[str] = []
    seen: set[str] = set()
    for item in raw_items:
        normalized = " ".join(str(item).split())
        key = normalized.casefold()
        if normalized and key not in seen:
            cleaned.append(normalized)
            seen.add(key)
    return cleaned


def normalize_query(keywords: str | list[str] | tuple[str, ...]) -> str:
    cleaned = normalize_keywords(keywords)
    return " ".join(cleaned[:MAX_QUERY_TERMS]).strip()


def _slug(text: str) -> str:
    out = []
    for ch in text.lower():
        out.append(ch if ch.isalnum() else "-")
    slug = "-".join(part for part in "".join(out).split("-") if part)
    return quote(slug)


def _linkedin_search(query: str, location: str) -> str:
    return (
        "https://www.linkedin.com/jobs/search/"
        f"?keywords={quote_plus(query)}&location={quote_plus(location)}"
    )


def _naukri_search(query: str, _location: str) -> str:
    return f"https://www.naukri.com/{_slug(query)}-jobs"


def _indeed_search(query: str, location: str) -> str:
    return f"https://in.indeed.com/jobs?q={quote_plus(query)}&l={quote_plus(location)}"


def _foundit_search(query: str, location: str) -> str:
    return (
        "https://www.foundit.in/srp/results"
        f"?query={quote(query)}&locations={quote(location)}"
    )


def _internshala_search(query: str, _location: str) -> str:
    return f"https://internshala.com/jobs/keywords-{_slug(query)}/"


def _wellfound_search(query: str, _location: str) -> str:
    return f"https://wellfound.com/jobs?query={quote_plus(query)}"


SEARCH_BUILDERS = {
    "linkedin": _linkedin_search,
    "naukri": _naukri_search,
    "indeed": _indeed_search,
    "foundit": _foundit_search,
    "internshala": _internshala_search,
    "wellfound": _wellfound_search,
    "linkedin_intern": _linkedin_search,
}


def list_platforms(category: str = "all", q: str = "") -> list[dict]:
    category = (category or "all").strip().lower()
    query = " ".join(q.split()).casefold()

    platforms = ALL_PLATFORMS
    if category in {"private", "government", "internship"}:
        platforms = [item for item in platforms if item["category"] == category]

    if query:
        platforms = [
            item
            for item in platforms
            if query in item["site"].casefold() or query in item["description"].casefold()
        ]

    return [
        {
            "id": item["id"],
            "site": item["site"],
            "badge": item["badge"],
            "category": item["category"],
            "description": item["description"],
            "url": item["home_url"],
        }
        for item in platforms
    ]


def build_search_links(
    keywords: str | list[str] | tuple[str, ...],
    *,
    location: str = DEFAULT_LOCATION,
    limit: int | None = None,
) -> list[dict]:
    query = normalize_query(keywords)
    if not query:
        return []

    links = []
    for platform in PRIVATE_PLATFORMS:
        builder = SEARCH_BUILDERS[platform["id"]]
        links.append(
            {
                "site": platform["site"],
                "icon": platform["badge"],
                "query": query,
                "url": builder(query, location),
                "category": platform["category"],
                "description": platform["description"],
            }
        )

    if limit is not None:
        return links[:limit]
    return links
