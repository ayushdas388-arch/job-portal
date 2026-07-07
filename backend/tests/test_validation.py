import unittest

from fastapi import HTTPException
from pydantic import ValidationError

from routes.auth import UserRegister, create_token, require_roles
from routes.jobs import JobCreate, JobUpdate, parse_object_id


class AuthValidationTests(unittest.TestCase):
    def test_registration_normalizes_identity_fields(self):
        user = UserRegister(
            name="  Test   User  ",
            email=" TEST@Example.com ",
            password="password123",
        )
        self.assertEqual(user.name, "Test User")
        self.assertEqual(user.email, "test@example.com")

    def test_registration_rejects_invalid_input(self):
        with self.assertRaises(ValidationError):
            UserRegister(name=" ", email="not-an-email", password="short")

    def test_token_is_created(self):
        token = create_token("507f1f77bcf86cd799439011", "jobseeker")
        self.assertTrue(token)


class RoleAuthorizationTests(unittest.IsolatedAsyncioTestCase):
    async def test_company_can_manage_jobs(self):
        authorize = require_roles("company", "admin")
        user = {"role": "company"}
        self.assertIs(await authorize(user), user)

    async def test_admin_can_manage_jobs(self):
        authorize = require_roles("company", "admin")
        user = {"role": "admin"}
        self.assertIs(await authorize(user), user)

    async def test_jobseeker_cannot_manage_jobs(self):
        authorize = require_roles("company", "admin")
        with self.assertRaises(HTTPException) as context:
            await authorize({"role": "jobseeker"})
        self.assertEqual(context.exception.status_code, 403)


class JobValidationTests(unittest.TestCase):
    def test_job_normalizes_and_deduplicates_skills(self):
        job = JobCreate(
            title="  Python Developer ",
            company=" ACME ",
            location=" Delhi ",
            required_skills=["Python", " python ", "FastAPI"],
        )
        self.assertEqual(job.title, "Python Developer")
        self.assertEqual(job.required_skills, ["Python", "FastAPI"])

    def test_job_rejects_blank_required_fields(self):
        with self.assertRaises(ValidationError):
            JobCreate(title="  ", company="  ")

    def test_update_rejects_unknown_fields(self):
        with self.assertRaises(ValidationError):
            JobUpdate(unknown="value")

    def test_invalid_object_id_returns_client_error(self):
        with self.assertRaises(Exception) as context:
            parse_object_id("invalid")
        self.assertEqual(context.exception.status_code, 400)


if __name__ == "__main__":
    unittest.main()
