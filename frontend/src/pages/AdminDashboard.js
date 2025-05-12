import React, { useEffect, useState } from 'react';
import {
    getPendingApprovals,
    updateApprovalStatus,
    removeRestaurant,
    fetchReservationAnalytics
} from '../api';
import { useAuth } from '../AuthContext';
import './AdminDashboard.css';

import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const [pendingRestaurants, setPendingRestaurants] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [timeframe, setTimeframe] = useState('month');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pendingData, analyticsData] = await Promise.all([
                    getPendingApprovals(),
                    fetchReservationAnalytics(timeframe)
                ]);
                setPendingRestaurants(pendingData || []);
                setAnalytics(analyticsData);
            } catch (err) {
                setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
            }
        };

        if (user?.role === 'Admin') {
            fetchData();
        }
    }, [user, timeframe]);

    const handleApproval = async (restaurantId, approved) => {
        let notes = approved ? 'Approved via dashboard.' : prompt('Enter reason for rejection (optional):', '') || '';
        try {
            await updateApprovalStatus(restaurantId, { status: approved ? 'approved' : 'rejected', notes });
            setPendingRestaurants(prev => prev.filter(r => r.restaurant_id !== restaurantId));
            setSuccessMessage(`Restaurant ${approved ? 'approved' : 'rejected'} successfully!`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Failed to update approval status: ' + (err.message || 'Unknown error'));
        }
    };

    const handleRemove = async (restaurantId) => {
        try {
            await removeRestaurant(restaurantId);
            setPendingRestaurants(prev => prev.filter(r => r.restaurant_id !== restaurantId));
            setSuccessMessage('Restaurant removed successfully');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Failed to remove restaurant: ' + (err.message || 'Unknown error'));
        }
    };

    if (!user || user.role !== 'Admin') {
        return (
            <div className="admin-container">
                <h1 className="admin-title">Access Denied</h1>
                <p className="admin-message">You must be an admin to access this page.</p>
            </div>
        );
    }

    const restaurantDistribution = analytics?.restaurant_distribution?.slice(0, 5) || [];

    return (
        <div className="admin-container">
            <h1 className="admin-title">Admin Dashboard</h1>
            {error && <p className="admin-error">{error}</p>}
            {successMessage && <p className="admin-success">{successMessage}</p>}

            {/* Pending Approvals Section */}
            <h2 className="admin-subtitle">Pending Restaurant Approvals</h2>
            {pendingRestaurants.length === 0 ? (
                <p className="admin-message">No pending approvals.</p>
            ) : (
                <ul className="admin-list">
                    {pendingRestaurants.map((r) => (
                        <li key={r.approval_id || r.restaurant_id} className="admin-card">
                            <div className="admin-info">
                                <span className="admin-restaurant-name">{r.restaurant_name || 'Unnamed'}</span>
                                <span className="admin-id">ID: {r.restaurant_id}</span>
                                <span className="admin-status">Status: {r.status || 'N/A'}</span>
                                <span className="admin-address">
                                    City: {r.city || 'N/A'}, State: {r.state || 'N/A'}, ZIP: {r.zip_code || 'N/A'}
                                </span>
                                <span className="admin-extra">
                                    Cuisine: {r.cuisine || 'N/A'} | Cost: {'⭐'.repeat(r.cost_rating || 0)}
                                </span>
                            </div>
                            <div className="admin-actions">
                                <button className="btn approve" onClick={() => handleApproval(r.approval_id || r.restaurant_id, true)}>Approve</button>
                                <button className="btn reject" onClick={() => handleApproval(r.approval_id || r.restaurant_id, false)}>Reject</button>
                                <button className="btn delete" onClick={() => handleRemove(r.restaurant_id)}>Remove</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Reservation Analytics Section */}
            <h2 className="admin-subtitle">
                Reservation Analytics ({timeframe === 'month' ? 'This Month' : 'This Week'})
            </h2>
            <div className="timeframe-selector">
                <label htmlFor="timeframe-select"><strong>Timeframe:</strong></label>
                <select
                    id="timeframe-select"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    style={{ marginLeft: '0.5rem' }}
                >
                    <option value="month">Month</option>
                    <option value="week">Week</option>
                </select>
            </div>

            {analytics ? (
                <div className="admin-card" style={{ flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                    <p><strong>Start Date:</strong> {analytics.start_date || 'N/A'}</p>
                    <p><strong>End Date:</strong> {analytics.end_date || 'N/A'}</p>
                    <p><strong>Total Reservations:</strong> {analytics.total_reservations ?? 0}</p>
                    <p><strong>Cancelled Reservations:</strong> {analytics.cancelled_reservations ?? 0}</p>

                    {/* 📊 Top 5 Restaurants */}
                    {restaurantDistribution.length > 0 && (
                        <div style={{ width: '100%', marginTop: '2rem' }}>
                            <h3>Top 5 Restaurants by Reservations</h3>
                            <Bar
                                data={{
                                    labels: restaurantDistribution.map(d => d.restaurant),
                                    datasets: [{
                                        label: 'Reservations',
                                        data: restaurantDistribution.map(d => d.count),
                                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                                    }]
                                }}
                                options={{
    responsive: true,
    scales: {
        y: {
            beginAtZero: true,
            stepSize: 10,
            ticks: {
                stepSize: 10,
                callback: function (value) {
                    return `${value}`;
                }
            },
            title: {
                display: true,
                text: 'Number of Reservations'
            }
        },
        x: {
            title: {
                display: true,
                text: 'Restaurant Name'
            }
        }
    },
    plugins: {
        legend: {
            display: false
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    return `Reservations: ${context.parsed.y}`;
                }
            }
        }
    }
}}

                            />
                        </div>
                    )}
                </div>
            ) : (
                <p className="admin-message">Loading analytics...</p>
            )}
        </div>
    );
};

export default AdminDashboard;
