import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaUserFriends, FaMapMarkerAlt, FaCheck } from 'react-icons/fa';
import './BookingReview.css';
import { createReservation } from '../api';

const BookingReview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const {
    restaurantId,
    restaurantName = `Restaurant #${restaurantId}`,
    restaurantAddress,
    date,
    time,
    people,
    tableId,
    tableType,
    maps_url
  } = location.state || {};

  const handleConfirmBooking = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const bookingPayload = {
        date,
        time,
        number_of_people: people,
        table_id: tableId
      };

      const response = await createReservation(restaurantId, bookingPayload);
      const reservationId = response.reservation_id;

      // Optional: send confirmation email
      if (sendEmail && reservationId) {
        await fetch(`${process.env.REACT_APP_API_BASE}/restaurants/api/send-confirmation-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ reservation_id: reservationId })
        });
      }

      setConfirmationSent(true);

      // Redirect back to home after 3 seconds
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error('Booking failed:', error);
      setError(error?.message || 'Booking failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = () => navigate(-1);

  if (!restaurantId || !date || !time || !tableId) {
    return (
      <div className="booking-review-container">
        <div className="review-card">
          <h2>Missing Reservation Info</h2>
          <p>Please return to the home page and start your reservation again.</p>
          <button className="cancel-button" onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-review-container">
      <div className="review-card">
        <h2>Review Your Reservation</h2>

        <div className="restaurant-details">
          <h3>{restaurantName}</h3>

          <div className="detail-group">
            <div className="detail-item">
              <FaCalendarAlt />
              <span><strong>Date:</strong> {date}</span>
            </div>
            <div className="detail-item">
              <FaClock />
              <span><strong>Time:</strong> {time}</span>
            </div>
          </div>

          <div className="detail-group">
            <div className="detail-item">
              <FaUserFriends />
              <span><strong>Party Size:</strong> {people} {people === 1 ? 'person' : 'people'}</span>
            </div>
            {tableType && (
              <div className="detail-item">
                <span><strong>Table:</strong> {tableType}</span>
              </div>
            )}
          </div>

          {restaurantAddress && (
            <div className="detail-group address-container">
              <FaMapMarkerAlt />
              <span>
                <strong>Location:</strong>{' '}
                {maps_url ? (
                  <a href={maps_url} target="_blank" rel="noopener noreferrer">
                    {restaurantAddress} ↗
                  </a>
                ) : (
                  restaurantAddress
                )}
              </span>
            </div>
          )}
        </div>

        <div className="policy-section">
          <h4>Cancellation Policy</h4>
          <p>Free cancellation up to 2 hours before your reservation time.</p>
        </div>

        <div className="terms-section">
          <p>By confirming this booking, you agree to the restaurant's terms and conditions.</p>
        </div>

        <div className="email-confirmation-section">
          <label>
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={() => setSendEmail(!sendEmail)}
            />
            Send confirmation email to your registered address
          </label>
        </div>

        {error && <p className="error-message">{error}</p>}
        {confirmationSent && (
          <p className="success-message">
            <FaCheck /> Booking confirmed! Redirecting to home...
          </p>
        )}

        <div className="action-buttons">
          <button className="cancel-button" onClick={handleCancelBooking}>Cancel</button>
          <button
            className="confirm-button"
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingReview;
