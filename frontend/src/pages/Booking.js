// src/pages/Booking.js
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { bookTable, cancelBooking } from '../api';

const Booking = () => {
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('restaurantId');
    const selectedTime = searchParams.get('time');
    const [confirmation, setConfirmation] = useState(null);
    const [error, setError] = useState(null);

    const handleBook = async () => {
        try {
            const bookingData = { restaurantId, time: selectedTime };
            const response = await bookTable(bookingData);
            setConfirmation(response.message || 'Booking Confirmed!');
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCancel = async () => {
        try {
            // Assuming the booking confirmation object contains a bookingId
            const bookingId = confirmation.bookingId;
            const response = await cancelBooking(bookingId);
            setConfirmation(response.message || 'Booking Cancelled');
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h1 className="page-title">Booking Confirmation</h1>
            <p>Restaurant ID: {restaurantId}</p>
            <p>Selected Time: {selectedTime}</p>
            {confirmation ? (
                <>
                    <p>{confirmation}</p>
                    <button className="view-details-btn" onClick={handleCancel}>Cancel Booking</button>
                </>
            ) : (
                <button className="view-details-btn" onClick={handleBook}>Confirm Booking</button>
            )}
            {error && <p>{error}</p>}
        </div>
    );
};

export default Booking;
