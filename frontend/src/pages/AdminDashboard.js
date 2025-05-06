import React, { useState, useEffect } from 'react';
import { getAnalytics, getPendingApprovals, updateApprovalStatus } from '../api';
import { useAuth } from '../AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('month');
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch analytics data
        const analyticsData = await getAnalytics(timeframe);
        setAnalytics(analyticsData);
        
        // Fetch pending restaurants
        const pendingData = await getPendingApprovals();
        setPendingRestaurants(pendingData || []);
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load dashboard data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'Admin') {
      fetchData();
    }
  }, [user, timeframe]);

  const handleApproval = async (restaurantId, approved) => {
    try {
      await updateApprovalStatus(restaurantId, { approved });
      
      // Update the list to remove the approved/rejected restaurant
      setPendingRestaurants(pendingRestaurants.filter(r => r.id !== restaurantId));
      
      setSuccessMessage(`Restaurant ${approved ? 'approved' : 'rejected'} successfully!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError('Failed to update approval status: ' + (err.message || 'Unknown error'));
    }
  };

  // Analytics mock data if real data isn't available yet
  const mockAnalytics = {
    totalReservations: 137,
    compareLastPeriod: '+15%',
    reservationsByDay: [8, 12, 15, 10, 18, 30, 24, 20],
    topRestaurants: [
      { name: 'Italian Delight', reservations: 42 },
      { name: 'Sushi Heaven', reservations: 35 },
      { name: 'Taco Palace', reservations: 28 },
      { name: 'Burger Joint', reservations: 22 },
      { name: 'Pasta Place', reservations: 10 }
    ],
    newUsers: 56,
    activeUsers: 243
  };

  // Use either real analytics or mock data
  const displayAnalytics = analytics || mockAnalytics;
  
  // Check if user is authorized to access this page
  if (user && user.role !== 'Admin') {
    return (
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Access Denied</h1>
        <p style={{ textAlign: 'center' }}>You must be an admin to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Admin Dashboard</h1>
      
      {successMessage && (
        <div style={{
          backgroundColor: '#e8f5e9',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '4px solid #4caf50',
          color: '#2e7d32'
        }}>
          {successMessage}
        </div>
      )}
      
      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          borderLeft: '4px solid #f44336',
          color: '#c62828'
        }}>
          {error}
        </div>
      )}
      
      {/* Analytics Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Analytics for Last Month</h2>
          <div>
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              style={{
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <p>Loading analytics...</p>
        ) : (
          <>
            {/* Analytics Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Total Reservations</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B0000', margin: '0' }}>
                  {displayAnalytics.totalReservations}
                  {displayAnalytics.compareLastPeriod && (
                    <span style={{ 
                      fontSize: '14px', 
                      color: displayAnalytics.compareLastPeriod.startsWith('+') ? '#4caf50' : '#f44336',
                      marginLeft: '10px'
                    }}>
                      {displayAnalytics.compareLastPeriod}
                    </span>
                  )}
                </p>
              </div>
              
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>New Users</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B0000', margin: '0' }}>
                  {displayAnalytics.newUsers}
                </p>
              </div>
              
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Active Users</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#8B0000', margin: '0' }}>
                  {displayAnalytics.activeUsers}
                </p>
              </div>
            </div>
            
            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              {/* Reservation Chart */}
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Reservations by Day</h3>
                <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end' }}>
                  {displayAnalytics.reservationsByDay && displayAnalytics.reservationsByDay.map((value, index) => (
                    <div key={index} style={{ 
                      flex: '1',
                      margin: '0 3px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                      <div style={{ 
                        backgroundColor: '#8B0000',
                        width: '100%',
                        height: `${(value / Math.max(...displayAnalytics.reservationsByDay)) * 180}px`,
                        borderRadius: '4px 4px 0 0'
                      }}></div>
                      <span style={{ fontSize: '12px', marginTop: '5px' }}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'][index % 7]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Top Restaurants */}
              <div style={{
                backgroundColor: '#f5f5f5',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Top Restaurants</h3>
                {displayAnalytics.topRestaurants && displayAnalytics.topRestaurants.length > 0 ? (
                  <ul style={{ padding: '0', margin: '0', listStyle: 'none' }}>
                    {displayAnalytics.topRestaurants.map((restaurant, index) => (
                      <li key={index} style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: index < displayAnalytics.topRestaurants.length - 1 ? '1px solid #ddd' : 'none'
                      }}>
                        <span>{restaurant.name}</span>
                        <span style={{ fontWeight: 'bold' }}>{restaurant.reservations}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No data available</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Pending Restaurant Approvals */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0 }}>Pending Restaurant Approvals</h2>
        
        {loading ? (
          <p>Loading pending approvals...</p>
        ) : pendingRestaurants.length === 0 ? (
          <p>No pending restaurants.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Restaurant Name</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Cuisine</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Location</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Manager</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRestaurants.map((restaurant) => (
                  <tr key={restaurant.id || restaurant.restaurant_id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{restaurant.name || restaurant.restaurant_name}</td>
                    <td style={{ padding: '10px' }}>{restaurant.cuisine_type || restaurant.cuisine}</td>
                    <td style={{ padding: '10px' }}>{restaurant.city}, {restaurant.state}</td>
                    <td style={{ padding: '10px' }}>{restaurant.manager_name || 'Unknown'}</td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleApproval(restaurant.id || restaurant.restaurant_id, true)}
                          style={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '8px 12px',
                            cursor: 'pointer'
                          }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(restaurant.id || restaurant.restaurant_id, false)}
                          style={{
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '8px 12px',
                            cursor: 'pointer'
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;