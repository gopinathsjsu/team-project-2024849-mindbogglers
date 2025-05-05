import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { bookTable, cancelBooking, getRestaurantDetails } from '../api';
import BookingConfirmation from '../components/BookingConfirmation';
import { FaCheck, FaCalendar, FaClock, FaUsers, FaUtensils } from 'react-icons/fa';
import './Booking.css'; 

const Booking = () => {
    const [searchParams] = useSearchParams();
    const restaurantId = searchParams.get('restaurantId');
    const selectedTime = searchParams.get('time');
    const selectedDate = searchParams.get('date');
    const selectedTable = searchParams.get('table_id');
    const numberOfPeople = searchParams.get('people');
    
    const [confirmation, setConfirmation] = useState(null);
    const [error, setError] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Format date for display
    const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '';

    // Fetch restaurant details
    useEffect(() => {
        if (restaurantId) {
            const fetchRestaurantInfo = async () => {
                try {
                    setLoading(true);
                    const data = await getRestaurantDetails(restaurantId);
                    setRestaurant(data);
                } catch (err) {
                    console.error('Error fetching restaurant details:', err);
                    setError('Failed to load restaurant details. Please try again.');
                } finally {
                    setLoading(false);
                }
            };
            fetchRestaurantInfo();
        }
    }, [restaurantId]);

    // Format address as a string
    const formatAddress = (addressObj) => {
        if (!addressObj) return '';
        
        if (typeof addressObj === 'string') {
            return addressObj;
        }
        
        const parts = [];
        if (addressObj.street) parts.push(addressObj.street);
        if (addressObj.city) parts.push(addressObj.city);
        if (addressObj.state) parts.push(addressObj.state);
        if (addressObj.zipCode) parts.push(addressObj.zipCode);
        
        return parts.join(', ');
    };

    const handleBook = async () => {
        try {
            setLoading(true);
            const bookingData = { 
                restaurantId, 
                time: selectedTime, 
                date: selectedDate, 
                table_id: selectedTable, 
                number_of_people: numberOfPeople 
            };
            
            const response = await bookTable(bookingData);
            
            // Create a booking object for the confirmation component
            // Don't include the restaurant object - let BookingConfirmation fetch it
            const bookingObject = {
                id: response.id || response.booking_id || 'temp-id',
                restaurantId: restaurantId,
                date: formattedDate || selectedDate,
                time: selectedTime,
                people: numberOfPeople,
                tableType: selectedTable ? `Table #${selectedTable}` : 'Standard'
            };
            
            setConfirmation(bookingObject);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to complete booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId) => {
        try {
            setLoading(true);
            await cancelBooking(bookingId);
            navigate('/my-reservations');
        } catch (err) {
            setError(err.message || 'Failed to cancel booking. Please try again.');
            setLoading(false);
        }
    };

    // If booking is confirmed, show the new confirmation component
    if (confirmation) {
        return <BookingConfirmation booking={confirmation} onCancel={() => handleCancel(confirmation.id)} />;
    }

    if (loading) return <div className="loading-spinner">Loading...</div>;

    // Get formatted address for display
    const addressDisplay = restaurant?.address ? formatAddress(restaurant.address) : '';

    // Otherwise show the booking screen
    return (
        <div className="booking-container">
            <div className="booking-card">
                <h1 className="booking-title">Complete Your Reservation</h1>
                
                <div className="booking-details">
                    <div className="detail-item">
                        <FaUtensils className="detail-icon" />
                        <span className="detail-label">Restaurant:</span>
                        <span className="detail-value">{restaurant ? restaurant.name : `ID: ${restaurantId}`}</span>
                    </div>
                    
                    <div className="detail-item">
                        <FaCalendar className="detail-icon" />
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{formattedDate || selectedDate}</span>
                    </div>
                    
                    <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <span className="detail-label">Time:</span>
                        <span className="detail-value">{selectedTime}</span>
                    </div>
                    
                    <div className="detail-item">
                        <FaUsers className="detail-icon" />
                        <span className="detail-label">Party Size:</span>
                        <span className="detail-value">{numberOfPeople} {numberOfPeople === '1' ? 'person' : 'people'}</span>
                    </div>

                    {addressDisplay && (
                        <div className="restaurant-location">
                            <p className="location-label">Location:</p>
                            <p className="location-value">{addressDisplay}</p>
                        </div>
                    )}
                </div>
                
                <div className="booking-notes">
                    <p>By clicking "Confirm Booking", you agree to the restaurant's reservation policy.</p>
                    <p>You can cancel your reservation up to 2 hours before your scheduled time.</p>
                </div>
                
                <div className="booking-actions">
                    <button 
                        className="confirm-btn"
                        onClick={handleBook}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Confirm Booking'}
                    </button>
                    <button 
                        className="cancel-btn"
                        onClick={() => navigate('/')}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
                
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default Booking;