import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRestaurantDetails, cancelBooking } from '../api';
import { FaCheck, FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaClock, FaUtensils, FaEnvelope, FaMobile } from 'react-icons/fa';
import './BookingConfirmation.css';

const BookingConfirmation = ({ booking, onCancel }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSMS, setSendSMS] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        // Fetch restaurant details using the ID from the booking
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

  const handleAddToCalendar = () => {
    try {
      // Parse date and time more carefully
      let startDate;
      if (typeof booking.date === 'string' && typeof booking.time === 'string') {
        // Check if date is already in ISO format or needs formatting
        if (booking.date.includes('-')) {
          // Assuming date is in YYYY-MM-DD format
          startDate = new Date(`${booking.date}T${booking.time}`);
        } else {
          // Handle date in text format (e.g., "Sunday, May 4, 2025")
          // First try to parse using Date constructor
          const parsedDate = new Date(booking.date);
          
          if (!isNaN(parsedDate.getTime())) {
            // If valid date, combine with time
            const year = parsedDate.getFullYear();
            const month = parsedDate.getMonth();
            const day = parsedDate.getDate();
            
            // Parse time (assuming format like "19:00")
            const [hours, minutes] = booking.time.split(':').map(Number);
            
            startDate = new Date(year, month, day, hours, minutes);
          } else {
            // Fallback to current date with the specified time
            startDate = new Date();
            const [hours, minutes] = booking.time.split(':').map(Number);
            startDate.setHours(hours, minutes, 0, 0);
          }
        }
      } else {
        // Fallback to current date and time
        startDate = new Date();
      }
      
      // Ensure valid date before proceeding
      if (isNaN(startDate.getTime())) {
        throw new Error('Invalid date or time format');
      }
      
      const endTime = new Date(startDate.getTime() + 90 * 60000); // Add 90 minutes
      
      // Format for Google Calendar
      // Format: YYYYMMDDTHHMMSS/YYYYMMDDTHHMMSS
      const formatDate = (date) => {
        const pad = (num) => (num < 10 ? '0' + num : num);
        
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1); // Months are 0-indexed
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        
        return `${year}${month}${day}T${hours}${minutes}${seconds}`;
      };
      
      // Format address for event
      let locationStr = '';
      if (restaurant?.address) {
        if (typeof restaurant.address === 'object') {
          const parts = [];
          if (restaurant.address.street) parts.push(restaurant.address.street);
          if (restaurant.address.city) parts.push(restaurant.address.city);
          if (restaurant.address.state) parts.push(restaurant.address.state);
          if (restaurant.address.zipCode) parts.push(restaurant.address.zipCode);
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
        dates: `${formattedStart}/${formattedEnd}`
      };
      
      // Create Google Calendar link
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.dates}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`;
      
      window.open(googleCalendarUrl, '_blank');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      alert('Sorry, there was an error creating the calendar event. Please try again.');
    }
  };

  const handleSendConfirmation = async () => {
    if (!sendEmail && !sendSMS) return;
    
    try {
      if (sendEmail) {
        // Call your email API
        await fetch('/api/send-confirmation-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            reservation_id: booking.id
          })
        });
      }
      
      if (sendSMS && phoneNumber) {
        // You would implement SMS sending here
        console.log(`SMS would be sent to: ${phoneNumber}`);
      }
      
      setConfirmationSent(true);
      setTimeout(() => setConfirmationSent(false), 5000); // Hide message after 5 seconds
    } catch (error) {
      console.error('Error sending confirmation:', error);
      setError('Failed to send confirmation. Please try again.');
    }
  };

  // Safely render address components with null checks
  const renderAddress = () => {
    if (!restaurant?.address) return null;
    
    // Handle string address
    if (typeof restaurant.address === 'string') {
      return restaurant.address;
    }
    
    // Handle object address with null checks
    const addr = restaurant.address;
    return (
      <>
        {addr.street ? addr.street : ''}{addr.street ? <br /> : ''}
        {addr.city ? addr.city : ''}{addr.city && (addr.state || addr.zipCode) ? ', ' : ''}
        {addr.state ? addr.state : ''}{addr.state && addr.zipCode ? ' ' : ''}
        {addr.zipCode ? addr.zipCode : ''}
      </>
    );
  };
  
  // Get formatted address for map link
  const getMapAddress = () => {
    if (!restaurant?.address) return '';
    
    if (typeof restaurant.address === 'string') {
      return restaurant.address;
    }
    
    const addr = restaurant.address;
    const parts = [];
    if (addr.street) parts.push(addr.street);
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    if (addr.zipCode) parts.push(addr.zipCode);
    return parts.join(' ');
  };

  if (loading) {
    return <div className="loading">Loading confirmation details...</div>;
  }

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
              <address>
                {renderAddress()}
              </address>
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