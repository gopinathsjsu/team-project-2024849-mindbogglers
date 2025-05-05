import React, { useState, useEffect } from 'react';
import { getRestaurantAvailability } from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Home = () => {
    // Use the auth context instead of local state
    const { user } = useAuth();
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Create array of dates for the next 7 days
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const formattedDate = date.toISOString().split('T')[0];
        const displayDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        dates.push({ value: formattedDate, label: displayDate });
    }

    // Common reservation times
    const times = [
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
    ];

    const [formData, setFormData] = useState({
        date: today,
        time: '19:00',
        people: '2',
        city: '',
        state: '',
        zip_code: ''
    });
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSearchForm, setShowSearchForm] = useState(false);
    const [recommendedRestaurants, setRecommendedRestaurants] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    
    // Fetch recommended restaurants when user is logged in
    useEffect(() => {
        const fetchRecommendedRestaurants = async () => {
            if (!user || user.role === 'RestaurantManager') return;
            
            setLoadingRecommendations(true);
            try {
                // Replace this with your actual API call
                // const response = await getRecommendedRestaurants(user.id);
                // setRecommendedRestaurants(response);
                
                // Mock data for now
                setRecommendedRestaurants([
                    {
                        restaurant_id: 1,
                        restaurant_name: "Italian Delight",
                        cuisine: "Italian",
                        rating: 4.8,
                        bookedToday: 15,
                        city: "San Francisco",
                        state: "CA",
                        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400&h=250"
                    },
                    {
                        restaurant_id: 2,
                        restaurant_name: "Sushi Heaven",
                        cuisine: "Japanese",
                        rating: 4.6,
                        bookedToday: 12,
                        city: "San Jose",
                        state: "CA",
                        image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&q=80&w=400&h=250"
                    },
                    {
                        restaurant_id: 3,
                        restaurant_name: "Taco Palace",
                        cuisine: "Mexican",
                        rating: 4.5,
                        bookedToday: 8,
                        city: "Santa Clara",
                        state: "CA",
                        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400&h=250"
                    }
                ]);
            } catch (err) {
                console.error('Error fetching recommendations:', err);
            } finally {
                setLoadingRecommendations(false);
            }
        };
        
        fetchRecommendedRestaurants();
    }, [user]);

    const handleChange = (e) => {
        console.log(`Field changed: ${e.target.name} = ${e.target.value}`);
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Searching with params:', formData);
            const results = await getRestaurantAvailability(formData);
            console.log(results)
            setRestaurants(results || []);
            setError(null);
        } catch (err) {
            console.error('Search error:', err);
            setError(typeof err === 'object' ? err.message : err);
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    // Background and container styles
    const pageStyle = {
        position: 'relative',
        minHeight: '100vh',
        overflow: 'auto',
        padding: '20px'
    };

    const backgroundStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(8px)',
        opacity: 0.3,
        zIndex: -1
    };

    const heroContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '40px 20px'
    };

    const heroTitleStyle = {
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '15px',
        color: '#333',
        fontFamily: 'Georgia, serif'
    };

    const heroSubtitleStyle = {
        fontSize: '24px',
        color: '#666',
        marginBottom: '40px',
        maxWidth: '700px'
    };

    const buttonStyle = {
        padding: '15px 30px',
        backgroundColor: '#8B0000', // Dark red color for restaurant theme
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '18px',
        transition: 'background-color 0.3s ease'
    };

    const containerStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '10px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        maxWidth: '1000px',
        margin: '0 auto'
    };

    const formGroupStyle = {
        marginBottom: '15px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '5px',
        fontWeight: 'bold',
        color: '#444'
    };

    const inputStyle = {
        padding: '10px',
        width: '100%',
        borderRadius: '4px',
        border: '1px solid #ddd',
        boxSizing: 'border-box'
    };

    const searchButtonStyle = {
        padding: '12px 20px',
        backgroundColor: '#8B0000', // Dark red color for restaurant theme
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        width: '100%',
        fontSize: '16px',
        marginTop: '10px'
    };

    const resultsContainerStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px',
        marginTop: '30px'
    };

    const cardStyle = {
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.3s ease',
        cursor: 'pointer'
    };

    const bookButtonStyle = {
        display: 'inline-block',
        backgroundColor: '#8B0000',
        color: 'white',
        padding: '8px 15px',
        textDecoration: 'none',
        borderRadius: '4px',
        marginTop: '15px',
        fontWeight: 'bold',
        textAlign: 'center'
    };
    
    const restaurantImageStyle = {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginBottom: '15px'
    };

    return (
        <div style={pageStyle}>
            <div style={backgroundStyle}></div>

            {!showSearchForm ? (
                <div style={heroContainerStyle}>
                    {/* Personalized welcome message for logged in users */}
                    <h1 style={heroTitleStyle}>
                        {user 
                            ? `Hello, Welcome ${user.name || user.username || 'Back'}!` 
                            : 'Welcome to BookTable'}
                    </h1>
                    <p style={heroSubtitleStyle}>
                        {user
                            ? (user.role === 'RestaurantManager' 
                                ? "Manage your restaurant listings, update availability, and track reservations all in one place."
                                : "Let's explore restaurants near you. Find and book your perfect dining experience.")
                            : "The easiest way to discover and reserve tables at your favorite restaurants. Find the perfect dining experience for any occasion."}
                    </p>
                    
                    {/* Conditional rendering based on user role */}
                    {user && user.role === 'RestaurantManager' ? (
                        <Link
                            to="/manager"
                            style={{
                                ...buttonStyle,
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6B0000'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8B0000'}
                        >
                            Go to Dashboard
                        </Link>
                    ) : (
                        <button
                            style={buttonStyle}
                            onClick={() => setShowSearchForm(true)}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6B0000'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8B0000'}
                        >
                            Reserve a Table
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div style={containerStyle}>
                        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Find a Restaurant</h2>

                        <form onSubmit={handleSubmit}>
                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Date:</label>
                                <select
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    {dates.map(date => (
                                        <option key={date.value} value={date.value}>
                                            {date.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Time:</label>
                                <select
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    style={inputStyle}
                                >
                                    {times.map(time => (
                                        <option key={time} value={time}>
                                            {parseInt(time) > 12
                                                ? `${parseInt(time) - 12}:${time.split(':')[1]} PM`
                                                : `${time} ${parseInt(time) === 12 ? 'PM' : 'AM'}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={formGroupStyle}>
                                <label style={labelStyle}>Number of People:</label>
                                <input
                                    type="number"
                                    name="people"
                                    min="1"
                                    max="20"
                                    value={formData.people}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={formGroupStyle}>
                                <label style={labelStyle}>City:</label>
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="Enter city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={formGroupStyle}>
                                <label style={labelStyle}>State:</label>
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="Enter state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={formGroupStyle}>
                                <label style={labelStyle}>ZIP Code:</label>
                                <input
                                    type="text"
                                    name="zip_code"
                                    placeholder="Enter ZIP code"
                                    value={formData.zip_code}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    style={{
                                        ...searchButtonStyle,
                                        backgroundColor: '#555',
                                        flex: '1'
                                    }}
                                    onClick={() => setShowSearchForm(false)}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        ...searchButtonStyle,
                                        flex: '2'
                                    }}
                                >
                                    {loading ? 'Searching...' : 'Find Tables'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {error && (
                        <div style={{
                            ...containerStyle,
                            backgroundColor: '#ffebee',
                            color: '#c62828',
                            marginTop: '20px'
                        }}>
                            <p>{error}</p>
                        </div>
                    )}

                    {restaurants.length > 0 && (
                        <div style={containerStyle}>
                            <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Available Restaurants</h2>

                            <div style={resultsContainerStyle}>
                                {restaurants.map((restaurant, index) => (
                                    <div
                                        key={index}
                                        style={cardStyle}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <h3 style={{ marginTop: 0 }}>{restaurant.restaurant_name}</h3>
                                        <p style={{ color: '#666' }}>Cuisine: {restaurant.cuisine}</p>
                                        <p>Rating: {restaurant.rating} ★</p>
                                        <p>Booked Today: {restaurant.timesBooked ?? restaurant.bookedToday ?? 0}</p>
                                        <p style={{ fontSize: '14px' }}>
                                            {restaurant.city}, {restaurant.state}
                                        </p>

                                        <Link
                                            to={`/booking?restaurantId=${restaurant.restaurant_id || index}&table_id=${restaurant.table_id}&time=${restaurant.available_time}&date=${formData.date}&people=${formData.people}`}
                                            style={bookButtonStyle}
                                        >
                                            Book at {restaurant.available_time}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {restaurants.length === 0 && !loading && (
                        <div style={{
                            ...containerStyle,
                            textAlign: 'center',
                            marginTop: '20px'
                        }}>
                            <p>No restaurants found. Try different search criteria.</p>
                        </div>
                    )}
                </>
            )}
            
            {/* Recommended Restaurants Section - Only show when user is logged in (and not a manager) and not showing search form */}
            {user && user.role !== 'RestaurantManager' && !showSearchForm && (
                <div style={containerStyle}>
                    <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Recommended For You</h2>
                    
                    {loadingRecommendations ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <p>Loading recommendations...</p>
                        </div>
                    ) : (
                        <div style={resultsContainerStyle}>
                            {recommendedRestaurants.map((restaurant) => (
                                <div
                                    key={restaurant.restaurant_id}
                                    style={cardStyle}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    {restaurant.image && (
                                        <img 
                                            src={restaurant.image} 
                                            alt={restaurant.restaurant_name}
                                            style={restaurantImageStyle}
                                        />
                                    )}
                                    
                                    <h3 style={{ marginTop: 0 }}>{restaurant.restaurant_name}</h3>
                                    <p style={{ color: '#666' }}>Cuisine: {restaurant.cuisine}</p>
                                    <p>Rating: {restaurant.rating} ★</p>
                                    <p>Booked Today: {restaurant.bookedToday || 0}</p>
                                    <p style={{ fontSize: '14px' }}>
                                        {restaurant.city}, {restaurant.state}
                                    </p>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <Link
                                            to={`/restaurant/${restaurant.restaurant_id}`}
                                            style={{
                                                ...bookButtonStyle,
                                                backgroundColor: '#444',
                                                flex: '1',
                                                textAlign: 'center'
                                            }}
                                        >
                                            Details
                                        </Link>
                                        <Link
                                            to={`/booking?restaurantId=${restaurant.restaurant_id}&date=${today}&people=2`}
                                            style={{
                                                ...bookButtonStyle,
                                                flex: '1',
                                                textAlign: 'center'
                                            }}
                                        >
                                            Book Now
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Home;