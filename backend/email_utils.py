import os
import smtplib
import logging
from email.message import EmailMessage

logger = logging.getLogger(__name__)

def send_reset_otp_email(to_email: str, otp: str):
    """
    Sends an OTP email for password reset using Gmail SMTP.
    Requires SMTP_EMAIL and SMTP_APP_PASSWORD in .env.
    """
    smtp_email = os.environ.get("SMTP_EMAIL")
    smtp_password = os.environ.get("SMTP_APP_PASSWORD")

    if not smtp_email or not smtp_password:
        logger.error("SMTP_EMAIL or SMTP_APP_PASSWORD is not set. Email not sent.")
        return False

    msg = EmailMessage()
    msg['Subject'] = 'CareerPilot Password Recovery Verification Code'
    msg['From'] = f"CareerPilot <{smtp_email}>"
    msg['To'] = to_email

    content = f"""
    Hello,

    We received a request to reset your password for your CareerPilot account.
    Your 6-digit verification code is: {otp}

    This code will expire in 15 minutes.
    If you did not request a password reset, please ignore this email.

    Regards,
    CareerPilot Team
    """
    msg.set_content(content)

    try:
        # Use Gmail's SMTP server
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(smtp_email, smtp_password)
            smtp.send_message(msg)
        logger.info(f"OTP email successfully sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False
