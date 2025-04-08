# app/utils/email_utils.py

import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "your_actual_key_here")  # Use environment variable
FROM_EMAIL = os.getenv("BOOKTABLE_EMAIL_FROM", "your_verified_sender@example.com")  # Verified sender

def send_booking_confirmation(to_email: str, restaurant_name: str, date: str, time: str, number_of_people: int):
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject=f'BookTable Reservation Confirmation at {restaurant_name}',
        plain_text_content=f"""Hi,

Your reservation at {restaurant_name} is confirmed.

📅 Date: {date}
⏰ Time: {time}
👥 People: {number_of_people}

Thanks for using BookTable!
- Team BookTable
"""
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print("✅ Email sent successfully.")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
