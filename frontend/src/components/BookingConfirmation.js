import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurantDetails, cancelBooking } from '../api';
import { FaCheck, FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaClock, FaUtensils, FaEnvelope, FaMobile } from 'react-icons/fa';
import './BookingConfirmation.css';

// Component to display and manage a user's booking confirmation
const BookingConfirmation = ({ booking, onCancel }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSMS, setSendSMS] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const navigate = useNavigate();

  // Fetch restaurant details when component mounts or booking.restaurantId changes
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const data = await getRestaurantDetails(booking.restaurantId);
        setRestaurant(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
        setError('Failed to load restaurant details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetails();
  }, [booking.restaurantId]);

  // Handle user-initiated booking cancellation
  const handleCancel = async () => {
    try {
      await cancelBooking(booking.id);
      if (onCancel) onCancel();
      navigate('/my-reservations');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      setError('Failed to cancel booking. Please try again.');
    }
  };

  // Handle adding the reservation to Google Calendar
  const handleAddToCalendar = () => {
    try {
      let startDate;

      // Parse date and time depending on their formats
      if (typeof booking.date === 'string' && typeof booking.time === 'string') {
        if (booking.date.includes('-')) {
          startDate = new Date(`${booking.date}T${booking.time}`);
        } else {
          const parsedDate = new Date(booking.date);

          if (!isNaN(parsedDate.getTime())) {
            const [hours, minutes] = booking.time.split(':').map(Number);
            startDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), hours, minutes);
          } else {
            // Fallback to current date with booking time
            startDate = new Date();
            const [hours, minutes] = booking.time.split(':').map(Number);
            startDate.setHours(hours, minutes, 0, 0);
          }
        }
      } else {
        startDate = new Date();
      }

      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid date or time format');
      }

      const endTime = new Date(startDate.getTime() + 90 * 60000); // Assume booking duration is 90 minutes

      // Format dates for Google Calendar
      const formatDate = (date) => {
        const pad = (num) => (num < 10 ? '0' + num : num);
        return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
      };

      // Construct location string
      let locationStr = '';
      if (restaurant?.address) {
        if (typeof restaurant.address === 'object') {
          const parts = [
            restaurant.address.street,
            restaurant.address.city,
            restaurant.address.state,
            restaurant.address.zipCode,
          ].filter(Boolean);
          locationStr = parts.join(', ');
        } else {
          locationStr = String(restaurant.address);
        }
      }

      const formattedStart = formatDate(startDate);
      const formattedEnd = formatDate(endTime);

      const event = {
        title: `Reservation at ${restaurant?.name || 'Restaurant'}`,
        description: `Table for ${booking.people} people`,
        location: locationStr,
        dates: `${formattedStart}/${formattedEnd}`,
      };

      // Open Google Calendar event creation page in a new tab
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.dates}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
      window.open(googleCalendarUrl, '_blank');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      alert('Sorry, there was an error creating the calendar event. Please try again.');
    }
  };

  // Send booking confirmation via email and/or SMS
  const handleSendConfirmation = async () => {
    if (!sendEmail && !sendSMS) return;

    try {
      if (sendEmail) {
        await fetch('/api/send-confirmation-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ reservation_id: booking.id })
        });
      }

      if (sendSMS && phoneNumber) {
        // Placeholder for SMS sending functionality
        console.log(`SMS would be sent to: ${phoneNumber}`);
      }

      setConfirmationSent(true);
      setTimeout(() => setConfirmationSent(false), 5000);
    } catch (error) {
      console.error('Error sending confirmation:', error);
      setError('Failed to send confirmation. Please try again.');
    }
  };

  // Render restaurant address safely
  const renderAddress = () => {
    if (!restaurant?.address) return null;

    if (typeof restaurant.address === 'string') {
      return restaurant.address;
    }

    const addr = restaurant.address;
    return (
      <>
        {addr.street && <>{addr.street}<br /></>}
        {addr.city}
        {(addr.state || addr.zipCode) && ', '}
        {addr.state} {addr.zipCode}
      </>
    );
  };

  // Construct address string for use in Google Maps search
  const getMapAddress = () => {
    if (!restaurant?.address) return '';

    if (typeof restaurant.address === 'string') {
      return restaurant.address;
    }

    const addr = restaurant.address;
    return [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean).join(' ');
  };

  // Show loading state while fetching restaurant details
  if (loading) {
    return <div className="loading">Loading confirmation details...</div>;
  }

  // Main render block
  return (
    <div className="booking-confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <h2>Booking Confirmation</h2>
          <div className="success-badge">
            <FaCheck /> Confirmed
          </div>
        </div>

        <div className="confirmation-details">
          <h3>{restaurant?.name || `Restaurant #${booking.restaurantId}`}</h3>

          <div className="detail-row">
            <div className="detail-item">
              <FaCalendarAlt />
              <span>Date: </span>{booking.date}
            </div>
            <div className="detail-item">
              <FaClock />
              <span>Time: </span>{booking.time}
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-item">
              <FaUserFriends />
              <span>Party Size: </span>{booking.people} {booking.people === 1 ? 'person' : 'people'}
            </div>
            {booking.tableType && (
              <div className="detail-item">
                <span>Table: </span>{booking.tableType}
              </div>
            )}
          </div>

          {restaurant?.address && (
            <div className="restaurant-address">
              <FaMapMarkerAlt />
              <address>{renderAddress()}</address>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getMapAddress())}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="map-link"
              >
                View on Map
              </a>
            </div>
          )}

          <div className="confirmation-options">
            <h4>Send confirmation to:</h4>
            <div className="checkbox-row">
              <label>
                <input 
                  type="checkbox" 
                  checked={sendEmail}
                  onChange={() => setSendEmail(!sendEmail)}
                />
                <FaEnvelope className="option-icon" />
                Email ({restaurant?.contactEmail || 'your registered email'})
              </label>
            </div>
            <div className="checkbox-row">
              <label>
                <input 
                  type="checkbox" 
                  checked={sendSMS}
                  onChange={() => setSendSMS(!sendSMS)}
                />
                <FaMobile className="option-icon" />
                SMS
              </label>
              {sendSMS && (
                <input 
                  type="tel"
                  className="phone-input"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              )}
            </div>
            <button 
              className="send-confirmation-btn"
              onClick={handleSendConfirmation}
              disabled={!sendEmail && !sendSMS}
            >
              Send Confirmation
            </button>

            {confirmationSent && (
              <div className="confirmation-sent-message">
                <FaCheck /> Confirmation sent successfully!
              </div>
            )}
          </div>

          <div className="cancellation-policy">
            <p><strong>Cancellation Policy:</strong> Free cancellation up to 2 hours before your reservation.</p>
          </div>
        </div>

        <div className="confirmation-actions">
          <button className="calendar-btn" onClick={handleAddToCalendar}>
            Add to Calendar
          </button>
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel Booking
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmation;
