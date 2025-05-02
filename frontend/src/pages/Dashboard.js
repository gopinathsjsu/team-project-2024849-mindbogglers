import React, { useState, useEffect } from 'react';
import { getDashboardAnalytics, getPendingRestaurants, approveRestaurant, removeRestaurant } from '../api';

const Dashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [pendingRestaurants, setPendingRestaurants] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await getDashboardAnalytics();
                setAnalytics(data.data);
            } catch (err) {
                setError(err.message);
            }
        };

        const fetchPendingRestaurants = async () => {
            try {
                const data = await getPendingRestaurants();
                if (data.data) {
                    setPendingRestaurants(data.data);
                }

            } catch (err) {
                setError(err.message);
            }
        };

        fetchAnalytics();
        fetchPendingRestaurants();
    }, []);

    const handleApprove = async (restaurantId) => {
        try {
            await approveRestaurant(restaurantId);
            setPendingRestaurants(prev => prev.filter(r => r.id !== restaurantId));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemove = async (restaurantId) => {
        try {
            await removeRestaurant(restaurantId);
            setPendingRestaurants(prev => prev.filter(r => r.id !== restaurantId));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h1 className="page-title">Admin Dashboard</h1>
            {error && <p>{error}</p>}
            <h2 className="page-title" style={{ fontSize: '1.3rem' }}>Analytics for Last Month</h2>
            {analytics ? (
                <div>
                    <p>Total Reservations: {analytics.totalReservations}</p>
                    <p>Revenue: {analytics.revenue}</p>
                </div>
            ) : (
                <p>Loading analytics...</p>
            )}
            <h2 className="page-title" style={{ fontSize: '1.3rem' }}>Pending Restaurant Approvals</h2>
            {pendingRestaurants.length > 0 ? (
                pendingRestaurants.map(restaurant => (
                    <div className="card" key={restaurant.id} style={{ marginBottom: '1rem' }}>
                        <h3>{restaurant.name}</h3>
                        <button className="view-details-btn" onClick={() => handleApprove(restaurant.id)}>Approve</button>
                        <button className="view-details-btn" onClick={() => handleRemove(restaurant.id)} style={{ marginLeft: '0.5rem' }}>Remove</button>
                    </div>
                ))
            ) : (
                <p>No pending restaurants.</p>
            )}
        </div>
    );
};

export default Dashboard;
