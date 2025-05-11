import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getMyReservations, cancelReservation } from '../api';
import './UserReservations.css'; // Adjust the path as needed
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
                const apiReservations = await getMyReservations();
                let localReservations = [];

                try {
                    const storedReservations = localStorage.getItem('userReservations');
                    if (storedReservations) {
                        localReservations = JSON.parse(storedReservations).map(res => ({
                            reservation_id: res.id || res.reservationId || `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            restaurant: res.restaurantName || `Restaurant #${res.restaurantId}`,
                            date: res.date,
                            time: res.time,
                            number_of_people: res.people || res.partySize || 2,
                            isLocalReservation: true
                        }));
                    }
                } catch (localError) {
                    console.error('Error reading local reservations:', localError);
                }

                const allReservations = [...apiReservations, ...localReservations];
                const uniqueReservations = Array.from(new Map(allReservations.map(item => [item.reservation_id, item])).values());

                uniqueReservations.sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));

                setReservations(uniqueReservations);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching reservations:', err);
                try {
                    const storedReservations = localStorage.getItem('userReservations');
                    if (storedReservations) {
                        const localReservations = JSON.parse(storedReservations).map(res => ({
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
                    const storedReservations = localStorage.getItem('userReservations');
                    if (storedReservations) {
                        let localReservations = JSON.parse(storedReservations);
                        localReservations = localReservations.filter(res => (res.id !== reservationId && res.reservationId !== reservationId));
                        localStorage.setItem('userReservations', JSON.stringify(localReservations));
                    }
                } else {
                    await cancelReservation(reservationId);
                }

                setMessage('Reservation cancelled successfully!');
                setReservations(reservations.filter(r => r.reservation_id !== reservationId));
                setTimeout(() => setMessage(null), 3000);
            } catch (err) {
                setError('Failed to cancel reservation: ' + (err.message || 'Unknown error'));
                setTimeout(() => setError(null), 5000);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading) {
        return <div className="container"><div className="loading-spinner">Loading...</div></div>;
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
                            <div className="card-header">
                                <div className="card-header-content">
                                    <h3>{reservation.restaurant}</h3>
                                    {(new Date(`${reservation.date} ${reservation.time}`) - new Date()) < 86400000 && (
                                        <span className="badge urgent">Upcoming</span>
                                    )}
                                </div>
                            </div>
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
