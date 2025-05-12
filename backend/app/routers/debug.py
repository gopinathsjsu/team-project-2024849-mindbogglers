from fastapi import APIRouter
from pydantic import BaseModel
from sendgrid import SendGridAPIClient
from app.utils.email_utils import send_booking_confirmation, BookingConfirmationDetails

import os

router = APIRouter()

@router.get("/debug/email-test")
def test_sendgrid_email():
    # Step 1: Log environment variables
    sendgrid_key = os.getenv("SENDGRID_API_KEY")
    from_email = os.getenv("BOOKTABLE_EMAIL_FROM")

    env_log = {
        "SENDGRID_API_KEY loaded": bool(sendgrid_key),
        "BOOKTABLE_EMAIL_FROM": from_email
    }

    # Step 2: Test SendGrid Client connection
    try:
        sg = SendGridAPIClient(sendgrid_key)
        sg_user = sg.client.api_keys._.get()  # Optional identity test
        env_log["SendGrid API Connection"] = "✅ Success"
    except Exception as e:
        env_log["SendGrid API Connection"] = f"❌ Failed - {str(e)}"
        return {"env": env_log, "success": False}

    # Step 3: Test email sending
    try:
        test_booking = BookingConfirmationDetails(
            id="TEST123",
            restaurant_name="Debug Bistro",
            date="2025-05-11",
            time="18:00",
            people=2,
            table_type="Window",
            address="123 Debug Street, San Jose, CA",
            contact="(123) 456-7890"
        )
        test_email = os.getenv("BOOKTABLE_EMAIL_FROM") or "your_fallback@example.com"
        result = send_booking_confirmation(test_email, test_booking)
        return {"env": env_log, "sendgrid_result": result}
    except Exception as e:
        return {"env": env_log, "error": str(e), "success": False}
