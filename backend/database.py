from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING
from config import MONGO_URL, DB_NAME

client = AsyncIOMotorClient(
    MONGO_URL,
    serverSelectionTimeoutMS=5000,
    uuidRepresentation="standard",
)
db = client[DB_NAME]

users_collection = db["users"]
jobs_collection = db["jobs"]
exams_collection = db["exams"]
saved_jobs_collection = db["saved_jobs"]
applications_collection = db["applications"]
notification_settings_collection = db["notification_settings"]
ats_scores_collection = db["ats_scores"]

async def ping_database() -> None:
    await client.admin.command("ping")

async def ensure_indexes() -> None:
    await users_collection.create_index(
        [("email", ASCENDING)],
        unique=True,
        name="unique_user_email",
    )
    await jobs_collection.create_index(
        [("created_at", DESCENDING)],
        name="jobs_newest_first",
    )
    await jobs_collection.create_index(
        [("title", ASCENDING), ("company", ASCENDING)],
        name="jobs_title_company",
    )
    await exams_collection.create_index(
        [("user_id", ASCENDING), ("exam_date", ASCENDING)],
        name="exams_by_user_date",
    )
    await saved_jobs_collection.create_index(
        [("user_id", ASCENDING), ("saved_at", DESCENDING)],
        name="saved_jobs_by_user",
    )
    await applications_collection.create_index(
        [("user_id", ASCENDING), ("applied_date", DESCENDING)],
        name="applications_by_user_date",
    )
    await notification_settings_collection.create_index(
        [("user_id", ASCENDING)],
        unique=True,
        name="notification_settings_by_user",
    )
    await ats_scores_collection.create_index(
        [("user_id", ASCENDING), ("created_at", DESCENDING)],
        name="ats_scores_by_user_date",
    )

def close_database() -> None:
    client.close()
