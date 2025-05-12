import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getRestaurantAvailability } from '../api';
import './RestaurantSearchResults.css';
const BASE_API = process.env.REACT_APP_API_BASE || 'http://localhost:8000';


const Home = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const today = new Date().toISOString().split('T')[0];
    const [loading, setLoading] = useState(false);
    const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
    const [showSearchForm, setShowSearchForm] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [bookingInProgress, setBookingInProgress] = useState(false);

    // Form data for reservation search
   const [formData, setFormData] = useState({
    date: today,
    time: '19:00',
    people: 2,          // ✅ number
    city: '',
    state: '',
    zip_code: ''
});


    // Common reservation times
    const times = [
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
    ];

    // Create array of dates for the next 7 days
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const formattedDate = date.toISOString().split('T')[0];
        const displayDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        dates.push({ value: formattedDate, label: displayDate });
    }

    // Featured restaurants data - only load for customers or non-logged in users
    useEffect(() => {
        const loadFeaturedRestaurants = async () => {
            // Only load featured restaurants for customers or non-logged in users
            if (user && (user.role === 'Admin' || user.role === 'RestaurantManager')) {
                return;
            }
            
            setLoading(true);
            try {
                // In a real app, you would fetch this from your API
                // For now, using mock data
                setFeaturedRestaurants([
                    {
                        id: 1,
                        name: "Italian Delight",
                        cuisine: "Italian",
                        rating: 4.8,
                        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600&h=350",
                        city: "San Francisco",
                        description: "Authentic Italian cuisine in a warm, inviting atmosphere."
                    },
                    {
                        id: 2,
                        name: "Sushi Heaven",
                        cuisine: "Japanese",
                        rating: 4.6,
                        image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&q=80&w=600&h=350",
                        city: "San Jose",
                        description: "Fresh, expertly crafted sushi and Japanese specialties."
                    },
                    {
                        id: 3,
                        name: "Taco Palace",
                        cuisine: "Mexican",
                        rating: 4.5,
                        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600&h=350",
                        city: "Santa Clara",
                        description: "Authentic Mexican street food with a modern twist."
                    },
                    {
                        id: 4,
                        name: "Golden Dragon",
                        cuisine: "Chinese",
                        rating: 4.7,
                        image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&q=80&w=600&h=350",
                        city: "Oakland",
                        description: "Traditional Chinese dishes with premium ingredients."
                    },
                    {
                        id: 5,
                        name: "Parisian Bistro",
                        cuisine: "French",
                        rating: 4.9,
                        image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=600&h=350",
                        city: "San Francisco",
                        description: "Classic French cuisine with a California influence."
                    },
                    {
                        id: 6,
                        name: "Curry House",
                        cuisine: "Indian",
                        rating: 4.6,
                        image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&q=80&w=600&h=350",
                        city: "Palo Alto",
                        description: "Bold, aromatic Indian dishes made with traditional spices."
                    }
                ]);
            } catch (error) {
                console.error("Error loading featured restaurants:", error);
            } finally {
                setLoading(false);
            }
        };

        loadFeaturedRestaurants();
    }, [user]);

 // Handle reservation button click
const handleReserveTable = () => {
    if (user) {
        // If user is logged in, show search form
        setShowSearchForm(true);
        setShowResults(false);
    } else {
        // If user is not logged in, redirect to login page
        navigate('/login');
    }
};

// Handle form field changes
const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
        ...formData,
        [name]: name === 'people' ? parseInt(value, 10) : value
    });
};

// Handle search form submission
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        console.log('Searching with params:', formData);
        const results = await getRestaurantAvailability(formData);

        // Group results by restaurant_id
        const grouped = {};
        for (const r of results) {
            if (!grouped[r.restaurant_id]) {
                grouped[r.restaurant_id] = {
                    id: r.restaurant_id,
                    name: r.restaurant_name,
                    city: r.city,
                    cuisine: r.cuisine,
                    cost_rating: r.cost_rating,
                    rating: r.rating,
                    total_bookings: r.total_bookings || 0,
                    maps_url: r.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.restaurant_name)}+${encodeURIComponent(r.city)}`,
                    image: r.image || `https://source.unsplash.com/featured/?restaurant,${r.cuisine}`,
                    description: r.description || `Enjoy a wonderful ${r.cuisine} dining experience in ${r.city}.`,
                    availableTimes: []  // Initialize here
                };
            }

            // Only push once
            grouped[r.restaurant_id].availableTimes.push({
                time: r.available_time,
                table_id: r.table_id
            });
        }

        const mappedResults = Object.values(grouped);
        setSearchResults(mappedResults);
        setShowResults(true);

    } catch (err) {
        console.error('Search error:', err);
    } finally {
        setLoading(false);
    }
};

// Render restaurant card
const renderRestaurantCard = (restaurant) => {
    const imageUrl = restaurant.image?.startsWith('/')
        ? `${BASE_API}${restaurant.image}`
        : restaurant.image;

    return (
        <div className="restaurant-card" key={restaurant.id}>
            <div className="restaurant-info">
                <img
                    src={imageUrl || 'https://source.unsplash.com/600x400/?restaurant'}
                    alt={restaurant.name}
                    className="restaurant-image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://source.unsplash.com/600x400/?restaurant';
                    }}
                />

                <div className="restaurant-details">
                    <h3>{restaurant.name}</h3>
                    <div className="rating">
                        {'★'.repeat(Math.floor(restaurant.rating))}{restaurant.rating % 1 >= 0.5 ? '½' : ''}
                        {'☆'.repeat(5 - Math.ceil(restaurant.rating))}
                        <span className="rating-number">{restaurant.rating}</span>
                    </div>
                    <p className="cost-rating">{'$'.repeat(restaurant.cost_rating)}</p>
                    <p className="bookings-count">{restaurant.total_bookings || 0} bookings today</p>

                    <p className="location"><span>📍</span> {restaurant.city}</p>
                    <a href={restaurant.maps_url} target="_blank" rel="noopener noreferrer">
                        View on Google Maps
                    </a>
                    <p className="description">{restaurant.description}</p>

                    <div className="available-times">
                        <h4>Available Times:</h4>
                        <div className="time-list">
                            {restaurant.availableTimes?.map((timeSlot) => (
                                <button
                                    key={timeSlot.time}
                                    className="time-badge"
                                    onClick={() => handleBookTable({ ...restaurant, selectedTime: timeSlot.time })}
                                >
                                    {parseInt(timeSlot.time) > 12
                                        ? `${parseInt(timeSlot.time) - 12}:${timeSlot.time.split(':')[1]} PM`
                                        : `${timeSlot.time} ${parseInt(timeSlot.time) === 12 ? 'PM' : 'AM'}`}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="action-buttons" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button
  className="book-table-btn"
  onClick={() => alert("Please select a time slot above to book.")}
>
  Book Table
</button>


                        <button
                            className="book-table-btn"
                            onClick={() => {
                                console.log('Navigating to:', `/reviews/${restaurant.id}`);
                                navigate(`/reviews/${restaurant.id}`);
                            }}
                        >
                            View Reviews
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const handleBookTable = (restaurant) => {
  if (bookingInProgress) return;  // ✅ Prevent double navigation
  setBookingInProgress(true);

  console.log("handleBookTable called with:", restaurant);

  // Ensure selectedTime is provided
  if (!restaurant.selectedTime) {
    console.error("No selectedTime found on restaurant object:", restaurant);
    alert("Please select a time slot before booking.");
    setBookingInProgress(false);
    return;
  }

  // Find the table ID for the selected time
  const selectedTimeSlot = restaurant.availableTimes.find(
    (t) => t.time === restaurant.selectedTime
  );

  const tableId = selectedTimeSlot?.table_id;
  if (!tableId) {
    console.error("No table ID found for selected time:", restaurant.selectedTime);
    alert("Sorry, table information is missing for the selected time.");
    setBookingInProgress(false);
    return;
  }

  const bookingData = {
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    restaurantAddress: restaurant.city,
    date: formData.date,
    time: restaurant.selectedTime,
    people: parseInt(formData.people),
    tableType: `Table for ${formData.people}`,
    tableId: tableId,
    maps_url: restaurant.maps_url
  };

  console.log("Navigating to /booking-review with data:", bookingData);
  navigate('/booking-review', { state: bookingData });

  // Optional: reset after short delay
  setTimeout(() => setBookingInProgress(false), 1000);
};


    

    // Styles
    const pageStyle = {
        position: 'relative',
    };

    const heroStyle = {
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '0 20px',
        color: '#333',
        overflow: 'hidden'
    };

    const heroBackgroundStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(3px) brightness(0.7)',
        zIndex: -1
    };

    const heroContentStyle = {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '40px',
        borderRadius: '10px',
        maxWidth: '800px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
    };

    const heroTitleStyle = {
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '15px',
        color: '#333'
    };

    const heroSubtitleStyle = {
        fontSize: '20px',
        color: '#666',
        marginBottom: '30px',
        lineHeight: '1.6'
    };

    const buttonStyle = {
        padding: '16px 32px',
        backgroundColor: '#8B0000',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '18px',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        display: 'inline-block'
    };

    const hoverButtonStyle = {
        backgroundColor: '#6B0000',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
    };

    const sectionStyle = {
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto'
    };

    const sectionTitleStyle = {
        fontSize: '36px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '40px',
        color: '#333',
        position: 'relative',
        paddingBottom: '15px'
    };

    const titleUnderlineStyle = {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80px',
        height: '3px',
        backgroundColor: '#8B0000'
    };

    const featuredGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '30px',
        margin: '0 auto'
    };

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer'
    };

    const cardHoverStyle = {
        transform: 'translateY(-10px)',
        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)'
    };

    const cardImageStyle = {
        width: '100%',
        height: '200px',
        objectFit: 'cover'
    };

    const cardContentStyle = {
        padding: '20px'
    };

    const cuisineTagStyle = {
        display: 'inline-block',
        padding: '5px 10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '20px',
        fontSize: '12px',
        marginBottom: '10px'
    };

    const ratingStyle = {
        color: '#FFD700',
        marginBottom: '10px',
        fontSize: '18px'
    };

    const locationStyle = {
        color: '#666',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px'
    };

    const cardButtonStyle = {
        backgroundColor: '#8B0000',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontWeight: 'bold',
        width: '100%',
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
        backgroundColor: '#8B0000',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        width: '100%',
        fontSize: '16px',
        marginTop: '10px'
    };

    const timeButtonStyle = {
        padding: '8px 16px',
        margin: '0 5px 10px 0',
        backgroundColor: '#8B0000',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease'
    };

    const howItWorksStyle = {
        backgroundColor: 'white',
        padding: '80px 20px'
    };

    const stepContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        maxWidth: '1200px',
        margin: '0 auto'
    };

    const stepStyle = {
        flex: '1 1 300px',
        margin: '20px',
        textAlign: 'center'
    };

    const stepNumberStyle = {
        display: 'inline-block',
        width: '60px',
        height: '60px',
        lineHeight: '60px',
        backgroundColor: '#8B0000',
        color: 'white',
        borderRadius: '50%',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '20px'
    };

    const testimonialSectionStyle = {
        backgroundColor: '#f5f5f5',
        padding: '80px 20px'
    };

    const testimonialStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        margin: '20px',
        position: 'relative'
    };

    const quoteStyle = {
        fontSize: '80px',
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: '#f0f0f0',
        fontFamily: 'Georgia, serif',
        lineHeight: '1'
    };

    const resultsContainerStyle = {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px'
    };

    // Render different views based on user role
    if (user && user.role === 'Admin') {
        return (
            <div style={pageStyle}>
                <section style={heroStyle}>
                    <div style={heroBackgroundStyle}></div>
                    <div style={heroContentStyle}>
                        <h1 style={heroTitleStyle}>Hello Admin, Welcome Back!</h1>
                        <p style={heroSubtitleStyle}>
                            Manage restaurant approvals, view analytics, and monitor platform activity from your admin dashboard.
                        </p>
                        <Link
                            to="/admin"
                            style={{
                                ...buttonStyle,
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                            onMouseOver={(e) => {
                                Object.assign(e.currentTarget.style, hoverButtonStyle);
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#8B0000';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            Go to Admin Dashboard
                        </Link>
                    </div>
                </section>
            </div>
        );
    }

    if (user && user.role === 'RestaurantManager') {
        return (
            <div style={pageStyle}>
                <section style={heroStyle}>
                    <div style={heroBackgroundStyle}></div>
                    <div style={heroContentStyle}>
                        <h1 style={heroTitleStyle}>Welcome, Restaurant Manager!</h1>
                        <p style={heroSubtitleStyle}>
                            Manage your restaurant listings, update availability, and track reservations all in one place.
                        </p>
                        <Link
                            to="/manager"
                            style={{
                                ...buttonStyle,
                                textDecoration: 'none',
                                display: 'inline-block'
                            }}
                            onMouseOver={(e) => {
                                Object.assign(e.currentTarget.style, hoverButtonStyle);
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#8B0000';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </section>
            </div>
        );
    }

    // Customer view or non-logged in user
    if (user) {
        // Logged in customer
        return (
            <div style={pageStyle}>
                {!showSearchForm ? (
                    <>
                        {/* Hero Section */}
                        <section style={heroStyle}>
                            <div style={heroBackgroundStyle}></div>
                            <div style={heroContentStyle}>
                                <h1 style={heroTitleStyle}>
                                    Welcome Back, {user.name || 'Friend'}!
                                </h1>
                                <p style={heroSubtitleStyle}>
                                    Let's explore restaurants near you. Find and book your perfect dining experience.
                                </p>
                                <button
                                    style={buttonStyle}
                                    onClick={handleReserveTable}
                                    onMouseOver={(e) => {
                                        Object.assign(e.currentTarget.style, hoverButtonStyle);
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = '#8B0000';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    Reserve a Table
                                </button>
                            </div>
                        </section>

                        {/* Featured Restaurants Section */}
                        <section style={sectionStyle}>
                            <h2 style={sectionTitleStyle}>
                                Featured Restaurants
                                <div style={titleUnderlineStyle}></div>
                            </h2>
                            
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>Loading featured restaurants...</div>
                            ) : (
                                <div style={featuredGridStyle}>
                                    {featuredRestaurants.map((restaurant) => (
                                        <div 
                                            key={restaurant.id} 
                                            style={cardStyle}
                                            onMouseOver={(e) => {
                                                Object.assign(e.currentTarget.style, cardHoverStyle);
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                                            }}
                                        >
                                            <img 
                                                src={restaurant.image} 
                                                alt={restaurant.name} 
                                                style={cardImageStyle}
                                            />
                                            <div style={cardContentStyle}>
                                                <div style={cuisineTagStyle}>{restaurant.cuisine}</div>
                                                <h3 style={{ margin: '10px 0' }}>{restaurant.name}</h3>
                                                <div style={ratingStyle}>
                                                    {'★'.repeat(Math.floor(restaurant.rating))}
                                                    {restaurant.rating % 1 >= 0.5 ? '½' : ''}
                                                    {'☆'.repeat(5 - Math.ceil(restaurant.rating))}
                                                    <span style={{ color: '#666', fontSize: '14px', marginLeft: '5px' }}>
                                                        {restaurant.rating}
                                                    </span>
                                                </div>
                                                <div style={locationStyle}>
                                                    <span style={{ marginRight: '5px' }}>📍</span> {restaurant.city}
                                                </div>
                                                <p style={{ margin: '0 0 20px 0', color: '#666' }}>
                                                    {restaurant.description}
                                                </p>
                                                <button 
                                                    style={cardButtonStyle}
                                                    onClick={handleReserveTable}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6B0000'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8B0000'}
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                ) : (
                    // Show search form for logged in customers
                    <div style={{ padding: '40px 20px' }}>
                        {!showResults ? (
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
                        ) : (
                            // Show search results
                            <div style={resultsContainerStyle}>
                                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
                                    Available Restaurants for {formData.people} people on {
                                        new Date(formData.date).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })
                                    }
                                </h2>
                                
                                {loading ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>Searching for available tables...</div>
                                ) : (
                                    <>
                                        {searchResults.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                                <p>No restaurants available for your search criteria.</p>
                                                <button
                                                    style={{
                                                        ...buttonStyle,
                                                        marginTop: '20px'
                                                    }}
                                                    onClick={() => setShowResults(false)}
                                                >
                                                    Try Another Search
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                                    <button
                                                        style={{
                                                            ...buttonStyle,
                                                            padding: '10px 20px',
                                                            backgroundColor: '#555'
                                                        }}
                                                        onClick={() => setShowResults(false)}
                                                    >
                                                        Modify Search
                                                    </button>
                                                </div>
                                                
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                                    {searchResults.map(restaurant => renderRestaurantCard(restaurant))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
    // Non-logged in user - landing page with extra sections
    return (
        <div style={pageStyle}>
            {/* Hero Section */}
            <section style={heroStyle}>
                <div style={heroBackgroundStyle}></div>
                <div style={heroContentStyle}>
                    <h1 style={heroTitleStyle}>Welcome to BookTable</h1>
                    <p style={heroSubtitleStyle}>
                        The easiest way to discover and reserve tables at your favorite restaurants. 
                        Find the perfect dining experience for any occasion.
                    </p>
                    <button
                        style={buttonStyle}
                        onClick={handleReserveTable}
                        onMouseOver={(e) => {
                            Object.assign(e.currentTarget.style, hoverButtonStyle);
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#8B0000';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Reserve a Table
                    </button>
                </div>
            </section>

            {/* Featured Restaurants Section */}
            <section style={sectionStyle}>
                <h2 style={sectionTitleStyle}>
                    Featured Restaurants
                    <div style={titleUnderlineStyle}></div>
                </h2>
                
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading featured restaurants...</div>
                ) : (
                    <div style={featuredGridStyle}>
                        {featuredRestaurants.map((restaurant) => (
                            <div 
                                key={restaurant.id} 
                                style={cardStyle}
                                onMouseOver={(e) => {
                                    Object.assign(e.currentTarget.style, cardHoverStyle);
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                <img 
                                    src={restaurant.image} 
                                    alt={restaurant.name} 
                                    style={cardImageStyle}
                                />
                                <div style={cardContentStyle}>
                                    <div style={cuisineTagStyle}>{restaurant.cuisine}</div>
                                    <h3 style={{ margin: '10px 0' }}>{restaurant.name}</h3>
                                    <div style={ratingStyle}>
                                        {'★'.repeat(Math.floor(restaurant.rating))}
                                        {restaurant.rating % 1 >= 0.5 ? '½' : ''}
                                        {'☆'.repeat(5 - Math.ceil(restaurant.rating))}
                                        <span style={{ color: '#666', fontSize: '14px', marginLeft: '5px' }}>
                                            {restaurant.rating}
                                        </span>
                                    </div>
                                    <div style={locationStyle}>
                                        <span style={{ marginRight: '5px' }}>📍</span> {restaurant.city}
                                    </div>
                                    <p style={{ margin: '0 0 20px 0', color: '#666' }}>
                                        {restaurant.description}
                                    </p>
                                    <button 
                                        style={cardButtonStyle}
                                        onClick={handleReserveTable}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#6B0000'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8B0000'}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            {/* How It Works Section - Only for non-logged in users */}
            <section style={howItWorksStyle}>
                <h2 style={sectionTitleStyle}>
                    How It Works
                    <div style={titleUnderlineStyle}></div>
                </h2>
                <div style={stepContainerStyle}>
                    <div style={stepStyle}>
                        <div style={stepNumberStyle}>1</div>
                        <h3>Search</h3>
                        <p>Find restaurants by location, cuisine, or availability</p>
                    </div>
                    <div style={stepStyle}>
                        <div style={stepNumberStyle}>2</div>
                        <h3>Reserve</h3>
                        <p>Choose your preferred date, time, and party size</p>
                    </div>
                    <div style={stepStyle}>
                        <div style={stepNumberStyle}>3</div>
                        <h3>Enjoy</h3>
                        <p>Receive confirmation and enjoy your dining experience</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section - Only for non-logged in users */}
            <section style={testimonialSectionStyle}>
                <h2 style={sectionTitleStyle}>
                    What Our Users Say
                    <div style={titleUnderlineStyle}></div>
                </h2>
                <div style={stepContainerStyle}>
                    <div style={testimonialStyle}>
                        <div style={quoteStyle}>"</div>
                        <p style={{ position: 'relative', zIndex: 1 }}>
                            BookTable made finding a last-minute anniversary dinner so easy! We got a table at our favorite restaurant despite it being a busy Saturday night.
                        </p>
                        <p style={{ fontWeight: 'bold', marginBottom: 0 }}>- Sarah J.</p>
                    </div>
                    <div style={testimonialStyle}>
                        <div style={quoteStyle}>"</div>
                        <p style={{ position: 'relative', zIndex: 1 }}>
                            As a foodie who loves trying new restaurants, this app has been a game-changer. The recommendations are always spot-on!
                        </p>
                        <p style={{ fontWeight: 'bold', marginBottom: 0 }}>- David M.</p>
                    </div>
                </div>
            </section>
            {/* Call to Action Section */}
            <section style={{
                backgroundColor: '#f9f9f9',
                padding: '60px 20px',
                textAlign: 'center'
            }}>
                <h2 style={sectionTitleStyle}>
                    Ready to Find Your Perfect Table?
                    <div style={titleUnderlineStyle}></div>
                </h2>
                <p style={{ maxWidth: '600px', margin: '0 auto 30px auto', fontSize: '18px' }}>
                    Join thousands of diners who book with BookTable every day
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <Link 
                        to="/register" 
                        style={{
                            ...buttonStyle,
                            textDecoration: 'none',
                            backgroundColor: '#4CAF50'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#388E3C';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#4CAF50';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Sign Up
                    </Link>
                    <Link 
                        to="/login" 
                        style={{
                            ...buttonStyle,
                            textDecoration: 'none',
                            backgroundColor: '#2196F3'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#1976D2';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#2196F3';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        Login
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;