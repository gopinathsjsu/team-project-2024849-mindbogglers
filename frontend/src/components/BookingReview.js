import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaUserFriends, FaMapMarkerAlt } from 'react-icons/fa';
import './BookingReview.css';
import { createReservation } from '../api';

const BookingReview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract booking details passed via navigation state
  const {
    restaurantId,
    restaurantName,
    restaurantAddress,
    date,
    time,
    people,
    tableId,
    tableType
  } = location.state || {};

  // Confirm and create reservation
  const handleConfirmBooking = async () => {
    try {
      const bookingData = {
        restaurantId,
        date,
        time,
        people,
        tableId,
        tableType
      };

      // Save booking to backend
      const response = await createReservation(bookingData);
      const bookingId = response.id || `temp-${Date.now()}`;

      // Construct full booking object for confirmation page
      const booking = {
        id: bookingId,
        ...bookingData
      };

      // Navigate to confirmation screen with booking data
      navigate('/booking-confirmation', {
        state: { booking }
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      // Ideally, show an error message to the user here
    }
  };

  // Handle cancel action by navigating back
  const handleCancelBooking = () => {
    navigate(-1);
  };

  // If required info is missing, redirect to homepage
  if (!restaurantId || !date || !time) {
    navigate('/');
    return null;
  }

  return (
    <div className="booking-review-container">
      <div className="review-card">
        <h2>Review Your Reservation</h2>

        <div className="restaurant-details">
          <h3>{restaurantName || `Restaurant #${restaurantId}`}</h3>

          <div className="detail-group">
            <div className="detail-item">
              <FaCalendarAlt />
              <span>Date: </span>{date}
            </div>
            <div className="detail-item">
              <FaClock />
              <span>Time: </span>{time}
            </div>
          </div>

          <div className="detail-group">
            <div className="detail-item">
              <FaUserFriends />
              <span>Party Size: </span>{people} {people === 1 ? 'person' : 'people'}
            </div>
            {tableType && (
              <div className="detail-item">
                <span>Table: </span>{tableType}
              </div>
            )}
          </div>

          {restaurantAddress && (
            <div className="address-container">
              <FaMapMarkerAlt />
              <address>{restaurantAddress}</address>
            </div>
          )}
        </div>

        <div className="policy-section">
          <h4>Cancellation Policy:</h4>
          <p>Free cancellation up to 2 hours before your reservation.</p>
        </div>

        <div className="terms-section">
          <p>By confirming this booking, you agree to the restaurant's terms and conditions.</p>
        </div>

        <div className="action-buttons">
          <button
            className="cancel-button"
            onClick={handleCancelBooking}
          >
            Cancel
          </button>

          <button
            className="confirm-button"
            onClick={handleConfirmBooking}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;
