import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, HtmlContent
from pydantic import BaseModel
from typing import Dict, Any, Optional

# Load API key from environment variables
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "your_actual_key_here")
FROM_EMAIL = os.getenv("BOOKTABLE_EMAIL_FROM", "your_verified_sender@example.com")

class BookingConfirmationDetails(BaseModel):
    id: str
    restaurant_name: str
    date: str
    time: str
    people: int
    table_type: Optional[str] = "Standard"
    address: Optional[str] = None
    contact: Optional[str] = None

def send_booking_confirmation(to_email: str, booking_details: BookingConfirmationDetails):
    """
    Send a formatted HTML booking confirmation email using SendGrid
    
    Args:
        to_email: The recipient's email address
        booking_details: Details about the booking to include in the email
    """
    # Create HTML content with better formatting
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }}
            .container {{ background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-top: 4px solid #0056b3; }}
            .booking-details {{ background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }}
            h1, h2 {{ color: #0056b3; }}
            .footer {{ font-size: 0.9em; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; }}
            .button {{ background-color: #0056b3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Booking Confirmation</h1>
            <p>Thank you for your reservation at <strong>{booking_details.restaurant_name}</strong>!</p>
            
            <div class="booking-details">
                <p><strong>Date:</strong> {booking_details.date}</p>
                <p><strong>Time:</strong> {booking_details.time}</p>
                <p><strong>Party Size:</strong> {booking_details.people} {'person' if booking_details.people == 1 else 'people'}</p>
                <p><strong>Table:</strong> {booking_details.table_type}</p>
                {f'<p><strong>Location:</strong> {booking_details.address}</p>' if booking_details.address else ''}
                {f'<p><strong>Contact:</strong> {booking_details.contact}</p>' if booking_details.contact else ''}
            </div>
            
            <p>You can manage your reservations in your account dashboard.</p>
            <a href="http://localhost:3000/my-reservations" class="button">View My Reservations</a>
            
            <div class="footer">
                <p>If you need to cancel or modify your reservation, please do so at least 2 hours in advance.</p>
                <p>Thank you for using BookTable!</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Create plain text version as a fallback
    plain_text_content = f"""
Hi,

Your reservation at {booking_details.restaurant_name} is confirmed.

📅 Date: {booking_details.date}
⏰ Time: {booking_details.time}
👥 People: {booking_details.people}
🪑 Table: {booking_details.table_type}

You can manage your reservations by visiting: http://localhost:3000/my-reservations

If you need to cancel or modify your reservation, please do so at least 2 hours in advance.

Thanks for using BookTable!
- Team BookTable
    """

    # Create the email message
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject=f'BookTable Reservation Confirmation: {booking_details.restaurant_name}',
        plain_text_content=plain_text_content,
        html_content=HtmlContent(html_content)
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"✅ Email sent successfully. Status code: {response.status_code}")
        return {"success": True, "message": "Email sent successfully"}
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return {"success": False, "error": str(e)}

def send_booking_cancellation(to_email: str, booking_details: BookingConfirmationDetails):
    """
    Send a booking cancellation email using SendGrid
    
    Args:
        to_email: The recipient's email address
        booking_details: Details about the cancelled booking
    """
    # Create HTML content
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }}
            .container {{ background-color: #f8f9fa; padding: 20px; border-radius: 5px; border-top: 4px solid #dc3545; }}
            .booking-details {{ background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }}
            h1, h2 {{ color: #dc3545; }}
            .footer {{ font-size: 0.9em; color: #666; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; }}
            .button {{ background-color: #0056b3; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Booking Cancellation</h1>
            <p>Your reservation at <strong>{booking_details.restaurant_name}</strong> has been cancelled.</p>
            
            <div class="booking-details">
                <p><strong>Date:</strong> {booking_details.date}</p>
                <p><strong>Time:</strong> {booking_details.time}</p>
                <p><strong>Party Size:</strong> {booking_details.people} {'person' if booking_details.people == 1 else 'people'}</p>
            </div>
            
            <p>You can make a new reservation any time from our website.</p>
            <a href="http://localhost:3000" class="button">Book a New Reservation</a>
            
            <div class="footer">
                <p>Thank you for using BookTable!</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Create message
    message = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject=f'BookTable Reservation Cancelled: {booking_details.restaurant_name}',
        html_content=HtmlContent(html_content)
    )

    try:
        sg = SendGridAPIClient(SENDGRID_API_KEY)
        response = sg.send(message)
        print(f"✅ Cancellation email sent successfully. Status code: {response.status_code}")
        return {"success": True, "message": "Cancellation email sent successfully"}
    except Exception as e:
        print(f"❌ Failed to send cancellation email: {e}")
        return {"success": False, "error": str(e)}