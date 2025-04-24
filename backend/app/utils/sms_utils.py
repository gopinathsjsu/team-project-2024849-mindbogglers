import os
from twilio.rest import Client

# Initialize Twilio client
account_sid = os.getenv("TWILIO_ACCOUNT_SID", "your_account_sid")
auth_token = os.getenv("TWILIO_AUTH_TOKEN", "your_auth_token")
from_number = os.getenv("TWILIO_PHONE_NUMBER", "your_twilio_phone_number")

client = Client(account_sid, auth_token)

def send_booking_sms(to_phone, restaurant_name, date, time, number_of_people):
    """Send an SMS confirmation for a booking"""
    message = client.messages.create(
        body=f"Your reservation at {restaurant_name} on {date} at {time} for {number_of_people} people has been confirmed!",
        from_=from_number,
        to=to_phone
    )
    return message.sid