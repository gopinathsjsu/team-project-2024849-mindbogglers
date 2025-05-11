import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaUserFriends, FaMapMarkerAlt } from 'react-icons/fa';
import './BookingReview.css';
import { createReservation } from '../api';

const BookingReview = () => {
    const location = useLocation();
    const navigate = useNavigate();

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
        try {
            const bookingData = {
                restaurantId,
                date,
                time,
                people,
                tableId,
                tableType
            };

            const response = await createReservation(bookingData);
            const bookingId = response.id || `temp-${Date.now()}`;

            const booking = {
                id: bookingId,
                ...bookingData
            };

            navigate('/booking-confirmation', { state: { booking } });
        } catch (error) {
            console.error('Error creating reservation:', error);
        }
    };

    const handleCancelBooking = () => {
        navigate(-1);
    };

    if (!restaurantId || !date || !time) {
        navigate('/');
        return null;
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

                <div className="action-buttons">
                    <button className="cancel-button" onClick={handleCancelBooking}>
                        Cancel
                    </button>
                    <button className="confirm-button" onClick={handleConfirmBooking}>
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingReview;
