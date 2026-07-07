"""Seed the jobs collection with a variety of sample jobs.

Idempotent: matches on (title, company) so re-running won't create duplicates.
Run from the backend/ folder:

    venv/Scripts/python.exe seed_jobs.py
"""
import asyncio
from datetime import datetime, timezone

from database import jobs_collection

SAMPLE_JOBS = [
    # --- Tech ---
    {
        "title": "Python Developer",
        "company": "TechNova Solutions",
        "location": "Bangalore",
        "required_skills": ["Python", "Django", "SQL", "Git", "REST APIs"],
        "description": "Build and maintain backend services in Python/Django.",
    },
    {
        "title": "Frontend React Developer",
        "company": "PixelCraft",
        "location": "Pune",
        "required_skills": ["JavaScript", "React", "HTML", "CSS", "TypeScript"],
        "description": "Develop responsive user interfaces with React.",
    },
    {
        "title": "Full Stack Developer",
        "company": "CodeBridge",
        "location": "Remote",
        "required_skills": ["JavaScript", "React", "Node.js", "MongoDB", "Express.js"],
        "description": "Own features end-to-end across the MERN stack.",
    },
    {
        "title": "Java Backend Engineer",
        "company": "Enterprise Systems Ltd",
        "location": "Hyderabad",
        "required_skills": ["Java", "Spring Boot", "SQL", "Docker", "Git"],
        "description": "Design scalable microservices in Java and Spring Boot.",
    },
    {
        "title": "Data Analyst",
        "company": "InsightWorks",
        "location": "Mumbai",
        "required_skills": ["SQL", "Excel", "Power BI", "Python", "Data Analysis"],
        "description": "Turn raw data into dashboards and business insights.",
    },
    {
        "title": "Machine Learning Engineer",
        "company": "DeepMind Labs India",
        "location": "Bangalore",
        "required_skills": ["Python", "Machine Learning", "Deep Learning", "Data Science", "SQL"],
        "description": "Train and deploy ML models into production.",
    },
    {
        "title": "DevOps Engineer",
        "company": "CloudScale",
        "location": "Remote",
        "required_skills": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git"],
        "description": "Automate deployments and manage cloud infrastructure.",
    },
    {
        "title": "Android Developer",
        "company": "AppForge",
        "location": "Noida",
        "required_skills": ["Java", "Kotlin", "Android Development", "Git", "REST APIs"],
        "description": "Build native Android apps used by millions.",
    },
    {
        "title": "UI/UX Designer",
        "company": "DesignHive",
        "location": "Gurgaon",
        "required_skills": ["Figma", "Adobe XD", "UI/UX", "Photoshop"],
        "description": "Craft intuitive product experiences and design systems.",
    },
    # --- Business ---
    {
        "title": "Digital Marketing Executive",
        "company": "GrowthGenie",
        "location": "Delhi",
        "required_skills": ["SEO", "Digital Marketing", "Content Writing", "Marketing"],
        "description": "Run campaigns and grow the brand online.",
    },
    {
        "title": "Accountant",
        "company": "FinCore Advisors",
        "location": "Ahmedabad",
        "required_skills": ["Accounting", "Tally", "GST", "Excel", "Finance"],
        "description": "Manage books, GST filings and financial reporting.",
    },
    {
        "title": "HR Recruiter",
        "company": "PeopleFirst Consulting",
        "location": "Chennai",
        "required_skills": ["HR Management", "Recruitment", "Communication", "MS Office"],
        "description": "Source, screen and hire top talent.",
    },
    # --- Government exam oriented ---
    {
        "title": "Bank PO Trainee",
        "company": "State Cooperative Bank",
        "location": "Lucknow",
        "required_skills": ["Quantitative Aptitude", "Reasoning", "Banking Preparation", "English Grammar"],
        "description": "Entry-level probationary officer role; freshers welcome.",
    },
    {
        "title": "Primary School Teacher",
        "company": "Vidya Public School",
        "location": "Jaipur",
        "required_skills": ["Teaching", "B.Ed", "CTET", "Communication"],
        "description": "Teach primary classes; CTET qualified preferred.",
    },
]


async def seed() -> None:
    now = datetime.now(timezone.utc)
    inserted = 0
    skipped = 0

    for job in SAMPLE_JOBS:
        existing = await jobs_collection.find_one(
            {"title": job["title"], "company": job["company"]},
            {"_id": 1},
        )
        if existing:
            skipped += 1
            continue

        doc = {**job, "created_at": now, "updated_at": now}
        await jobs_collection.insert_one(doc)
        inserted += 1
        print(f"  + inserted: {job['title']} @ {job['company']}")

    total = await jobs_collection.count_documents({})
    print(f"\nDone. Inserted {inserted}, skipped {skipped} (already existed).")
    print(f"Total jobs in DB now: {total}")


if __name__ == "__main__":
    asyncio.run(seed())
