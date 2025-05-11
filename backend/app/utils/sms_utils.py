import os
from twilio.rest import Client

# Load Twilio credentials and sender number from environment variables
account_sid = os.getenv("TWILIO_ACCOUNT_SID", "your_account_sid")
auth_token = os.getenv("TWILIO_AUTH_TOKEN", "your_auth_token")
from_number = os.getenv("TWILIO_PHONE_NUMBER", "your_twilio_phone_number")

# Initialize Twilio client with account credentials
client = Client(account_sid, auth_token)

# Function to send booking confirmation via SMS
def send_booking_sms(to_phone, restaurant_name, date, time, number_of_people):
    """
    Send an SMS confirmation for a reservation using Twilio.

    Args:
        to_phone (str): The recipient's phone number in E.164 format.
        restaurant_name (str): Name of the restaurant.
        date (str): Reservation date.
        time (str): Reservation time.
        number_of_people (int): Party size.

    Returns:
        str: The message SID from Twilio if the message is successfully sent.
    """

    # Construct the SMS message body
    message_body = (
        f"Your reservation at {restaurant_name} on {date} at {time} "
        f"for {number_of_people} {'person' if number_of_people == 1 else 'people'} has been confirmed!"
    )

    # Send the SMS message using Twilio API
    message = client.messages.create(
        body=message_body,
        from_=from_number,
        to=to_phone
    )

    # Return the unique message SID for tracking
    return message.sid
