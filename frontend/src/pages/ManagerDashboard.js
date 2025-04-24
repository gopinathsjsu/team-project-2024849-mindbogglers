import React, { useState, useEffect } from 'react';
import { addRestaurant, updateRestaurant, addTable, getMyReservations } from '../api';
import { useAuth } from '../AuthContext'; // Assuming you have AuthContext

const ManagerDashboard = () => {
    const { user } = useAuth(); // Get current user
    const [restaurants, setRestaurants] = useState([]);
    const [restaurantData, setRestaurantData] = useState({
        name: '',
        cuisine: '',
        cost_rating: 3,
        city: '',
        state: '',
        zip_code: ''
    });
    const [tableData, setTableData] = useState({
        size: 4,
        available_times: '18:00,18:30,19:00,19:30,20:00' // Default available times
    });
    const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'manage'

    // Fetch manager's restaurants on component mount
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                // This will be replaced with an appropriate API call when available
                // For now, we'll use getMyReservations to fetch data
                const data = await getMyReservations();
                setRestaurants(data || []);
            } catch (err) {
                setError('Failed to load your restaurants: ' + (err.message || 'Unknown error'));
            }
        };
        
        if (user && user.role === 'RestaurantManager') {
            fetchRestaurants();
        }
    }, [user]);

    const handleRestaurantChange = (e) => {
        const { name, value } = e.target;
        setRestaurantData({ ...restaurantData, [name]: value });
    };

    const handleTableChange = (e) => {
        const { name, value } = e.target;
        setTableData({ ...tableData, [name]: value });
    };

    const handleAddRestaurant = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);
        
        try {
            // Update cost_rating to be a number
            const submitData = {
                ...restaurantData,
                cost_rating: parseInt(restaurantData.cost_rating)
            };
            
            const response = await addRestaurant(submitData);
            setMessage('Restaurant added successfully! ID: ' + response.restaurant_id);
            
            // Reset form
            setRestaurantData({
                name: '',
                cuisine: '',
                cost_rating: 3,
                city: '',
                state: '',
                zip_code: ''
            });
            
            // Refresh restaurant list
            // You'll need to implement a getManagerRestaurants API call when available
        } catch (err) {
            setError('Failed to add restaurant: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleAddTable = async (e) => {
        e.preventDefault();
        if (!selectedRestaurantId) {
            setError('Please select a restaurant first');
            return;
        }
        
        setLoading(true);
        setError(null);
        setMessage(null);
        
        try {
            // Convert string of times to array
            const submitData = {
                size: parseInt(tableData.size),
                available_times: tableData.available_times.split(',').map(time => time.trim())
            };
            
            await addTable(selectedRestaurantId, submitData);
            setMessage('Table added successfully!');
            
            // Reset form
            setTableData({
                size: 4,
                available_times: '18:00,18:30,19:00,19:30,20:00'
            });
        } catch (err) {
            setError('Failed to add table: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // Check if user is authorized to access this page
    if (user && user.role !== 'RestaurantManager') {
        return (
            <div className="container">
                <h1 className="page-title">Access Denied</h1>
                <p>You must be a restaurant manager to access this page.</p>
            </div>
        );
    }

    return (
        <div className="container">
            <h1 className="page-title">Restaurant Manager Panel</h1>
            
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            
            <div className="tabs">
                <button 
                    className={`tab-btn ${activeTab === 'add' ? 'active' : ''}`}
                    onClick={() => setActiveTab('add')}
                >
                    Add New Restaurant
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manage')}
                >
                    Manage Tables
                </button>
            </div>
            
            {activeTab === 'add' && (
                <div className="tab-content">
                    <h2 className="page-title" style={{ fontSize: '1.3rem' }}>Add New Restaurant</h2>
                    <form onSubmit={handleAddRestaurant} className="booking-form">
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Restaurant Name" 
                            value={restaurantData.name} 
                            onChange={handleRestaurantChange} 
                            required 
                        />
                        <input 
                            type="text" 
                            name="cuisine" 
                            placeholder="Cuisine Type" 
                            value={restaurantData.cuisine} 
                            onChange={handleRestaurantChange} 
                            required 
                        />
                        <select 
                            name="cost_rating" 
                            value={restaurantData.cost_rating} 
                            onChange={handleRestaurantChange}
                        >
                            <option value="1">$ - Budget</option>
                            <option value="2">$$ - Moderate</option>
                            <option value="3">$$$ - Expensive</option>
                            <option value="4">$$$$ - Very Expensive</option>
                            <option value="5">$$$$$ - Luxury</option>
                        </select>
                        <input 
                            type="text" 
                            name="city" 
                            placeholder="City" 
                            value={restaurantData.city} 
                            onChange={handleRestaurantChange} 
                            required 
                        />
                        <input 
                            type="text" 
                            name="state" 
                            placeholder="State" 
                            value={restaurantData.state} 
                            onChange={handleRestaurantChange} 
                            required 
                        />
                        <input 
                            type="text" 
                            name="zip_code" 
                            placeholder="ZIP Code" 
                            value={restaurantData.zip_code} 
                            onChange={handleRestaurantChange} 
                            required 
                        />
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Restaurant'}
                        </button>
                    </form>
                </div>
            )}
            
            {activeTab === 'manage' && (
                <div className="tab-content">
                    <h2 className="page-title" style={{ fontSize: '1.3rem' }}>Manage Tables</h2>
                    
                    <div className="select-restaurant">
                        <label>Select Restaurant:</label>
                        <select 
                            value={selectedRestaurantId || ''} 
                            onChange={(e) => setSelectedRestaurantId(e.target.value)}
                        >
                            <option value="">-- Select a Restaurant --</option>
                            {restaurants.map((r) => (
                                <option key={r.id} value={r.id}>{r.name || r.restaurant}</option>
                            ))}
                        </select>
                    </div>
                    
                    {selectedRestaurantId && (
                        <form onSubmit={handleAddTable} className="booking-form">
                            <input 
                                type="number" 
                                name="size" 
                                placeholder="Table Size (# of seats)" 
                                value={tableData.size} 
                                onChange={handleTableChange} 
                                min="1"
                                max="20"
                                required 
                            />
                            <input 
                                type="text" 
                                name="available_times" 
                                placeholder="Available Times (comma separated, e.g. 18:00,18:30)" 
                                value={tableData.available_times} 
                                onChange={handleTableChange} 
                                required 
                            />
                            <small className="help-text">
                                Enter times in 24-hour format (HH:MM) separated by commas
                            </small>
                            <button 
                                type="submit" 
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Adding...' : 'Add Table'}
                            </button>
                        </form>
                    )}
                </div>
            )}
            
            <h2 className="page-title" style={{ fontSize: '1.3rem' }}>Your Restaurant Listings</h2>
            <div className="cards-grid">
                {restaurants.length === 0 ? (
                    <p>You haven't added any restaurants yet.</p>
                ) : (
                    restaurants.map((r) => (
                        <div className="card" key={r.id}>
                            <h3>{r.name || r.restaurant}</h3>
                            <p>{r.city}, {r.state}</p>
                            <button 
                                className="action-btn"
                                onClick={() => setSelectedRestaurantId(r.id)}
                            >
                                Manage Tables
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;