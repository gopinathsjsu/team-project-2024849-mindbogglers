import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaUserFriends, FaMapMarkerAlt } from 'react-icons/fa';
import './BookingReview.css';
import { createReservation } from '../api';

const BookingReview = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { restaurantId, restaurantName, restaurantAddress, date, time, people, tableId, tableType } = location.state || {};
    
    const handleConfirmBooking = async () => {
      try {
          // Create a booking object
          const bookingData = {
              restaurantId,
              date,
              time,
              people,
              tableId,
              tableType
          };
          
          // Save the booking to your backend/system
          const response = await createReservation(bookingData);
          
          // Get the booking ID from the response
          const bookingId = response.id || `temp-${Date.now()}`;
          
          // Create a complete booking object with the ID
          const booking = {
              id: bookingId,
              ...bookingData
          };
          
          // Navigate to the confirmation page
          navigate('/booking-confirmation', { 
              state: { booking }
          });
      } catch (error) {
          console.error('Error creating reservation:', error);
          // Show error message to user
          // setError('Failed to create reservation. Please try again.');
      }
  };
    
    // Handle cancel booking
    const handleCancelBooking = () => {
        // Go back to search results
        navigate(-1);
    };
    
    // If no booking data, redirect to home
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