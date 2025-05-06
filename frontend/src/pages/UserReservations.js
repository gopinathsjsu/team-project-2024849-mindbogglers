import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getMyReservations, cancelReservation } from '../api';
import { AuthContext } from '../AuthContext';

const UserReservations = () => {
    const { user } = useContext(AuthContext);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                // Get reservations from your API
                const apiReservations = await getMyReservations();
                
                // Try to get reservations from local storage (for the new booking flow)
                let localReservations = [];
                try {
                    const storedReservations = localStorage.getItem('userReservations');
                    if (storedReservations) {
                        localReservations = JSON.parse(storedReservations);
                        
                        // Format local reservations to match API response format
                        localReservations = localReservations.map(res => ({
                            reservation_id: res.id || res.reservationId || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            restaurant: res.restaurantName || `Restaurant #${res.restaurantId}`,
                            date: res.date,
                            time: res.time,
                            number_of_people: res.people || res.partySize || 2,
                            // Any other properties your system uses
                            isLocalReservation: true // Flag to differentiate source
                        }));
                    }
                } catch (localError) {
                    console.error('Error reading local reservations:', localError);
                }
                
                // Combine reservations from both sources
                // Use a Set to avoid duplicates based on reservation_id
                const allReservations = [...apiReservations, ...localReservations];
                const uniqueReservations = Array.from(
                    new Map(allReservations.map(item => [item.reservation_id, item])).values()
                );
                
                // Sort by date, most recent first
                uniqueReservations.sort((a, b) => {
                    const dateA = new Date(`${a.date} ${a.time}`);
                    const dateB = new Date(`${b.date} ${b.time}`);
                    return dateB - dateA; // Most recent first
                });
                
                setReservations(uniqueReservations);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching reservations:', err);
                
                // Fallback to local storage only if API fails
                try {
                    const storedReservations = localStorage.getItem('userReservations');
                    if (storedReservations) {
                        let localReservations = JSON.parse(storedReservations);
                        
                        // Format local reservations to match expected format
                        localReservations = localReservations.map(res => ({
                            reservation_id: res.id || res.reservationId || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            restaurant: res.restaurantName || `Restaurant #${res.restaurantId}`,
                            date: res.date,
                            time: res.time,
                            number_of_people: res.people || res.partySize || 2,
                            isLocalReservation: true
                        }));
                        
                        setReservations(localReservations);
                    } else {
                        setReservations([]);
                    }
                } catch (localError) {
                    setError('Failed to load reservations: ' + (err.message || 'Unknown error'));
                }
                
                setLoading(false);
            }
        };

        if (user) {
            fetchReservations();
        } else {
            setLoading(false);
        }
    }, [user]);

    const handleCancelReservation = async (reservationId, isLocalReservation) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            try {
                if (isLocalReservation) {
                    // Handle cancellation for local reservations
                    const storedReservations = localStorage.getItem('userReservations');
                    if (storedReservations) {
                        let localReservations = JSON.parse(storedReservations);
                        // Filter out the cancelled reservation
                        localReservations = localReservations.filter(res => 
                            (res.id !== reservationId && res.reservationId !== reservationId)
                        );
                        localStorage.setItem('userReservations', JSON.stringify(localReservations));
                    }
                } else {
                    // Handle cancellation for API reservations
                    await cancelReservation(reservationId);
                }
                
                setMessage('Reservation cancelled successfully!');
                
                // Remove the cancelled reservation from the list
                setReservations(reservations.filter(r => r.reservation_id !== reservationId));
                
                // Clear message after 3 seconds
                setTimeout(() => setMessage(null), 3000);
            } catch (err) {
                setError('Failed to cancel reservation: ' + (err.message || 'Unknown error'));
                
                // Clear error after 5 seconds
                setTimeout(() => setError(null), 5000);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
            // If date is already a formatted string like "Monday, May 5, 2025"
            return dateString;
        }
        return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 className="page-title">My Reservations</h1>
            
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            
            {reservations.length === 0 ? (
                <div className="empty-state">
                    <p>You don't have any reservations yet.</p>
                    <Link to="/" className="btn btn-primary">Find a Restaurant</Link>
                </div>
            ) : (
                <div className="cards-grid">
                    {reservations.map((reservation) => (
                        <div className="card reservation-card" key={reservation.reservation_id}>
                            <h3>{reservation.restaurant}</h3>
                            <div className="reservation-details">
                                <p><strong>Date:</strong> {formatDate(reservation.date)}</p>
                                <p><strong>Time:</strong> {reservation.time}</p>
                                <p><strong>Party Size:</strong> {reservation.number_of_people}</p>
                            </div>
                            <div className="card-actions">
                                <button 
                                    className="btn cancel-btn"
                                    onClick={() => handleCancelReservation(
                                        reservation.reservation_id, 
                                        reservation.isLocalReservation
                                    )}
                                >
                                    Cancel Reservation
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserReservations;