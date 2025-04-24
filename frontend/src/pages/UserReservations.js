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
                const data = await getMyReservations();
                setReservations(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load reservations: ' + (err.message || 'Unknown error'));
                setLoading(false);
            }
        };

        if (user) {
            fetchReservations();
        }
    }, [user]);

    const handleCancelReservation = async (reservationId) => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            try {
                await cancelReservation(reservationId);
                setMessage('Reservation cancelled successfully!');
                
                // Remove the cancelled reservation from the list
                setReservations(reservations.filter(r => r.reservation_id !== reservationId));
            } catch (err) {
                setError('Failed to cancel reservation: ' + (err.message || 'Unknown error'));
            }
        }
    };

    if (loading) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <h1 className="page-title">My Reservations</h1>
            
            {error && <div className="error-message">{error}</div>}
            {message && <div className="success-message">{message}</div>}
            
            {reservations.length === 0 ? (
                <div>
                    <p>You don't have any reservations yet.</p>
                    <Link to="/" className="btn">Find a Restaurant</Link>
                </div>
            ) : (
                <div className="cards-grid">
                    {reservations.map((reservation) => (
                        <div className="card" key={reservation.reservation_id}>
                            <h3>{reservation.restaurant}</h3>
                            <p><strong>Date:</strong> {new Date(reservation.date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {reservation.time}</p>
                            <p><strong>Party Size:</strong> {reservation.number_of_people}</p>
                            <button 
                                className="cancel-btn"
                                onClick={() => handleCancelReservation(reservation.reservation_id)}
                            >
                                Cancel Reservation
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserReservations;