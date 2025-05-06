import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ReserveConfirmation = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sendEmail, setSendEmail] = useState(true);
    const [sendSMS, setSendSMS] = useState(false);
    
    useEffect(() => {
        if (!location.state) {
            // If no state was passed, redirect to home
            navigate('/');
            return;
        }
        
        const { restaurantId, date, time, people, tableId } = location.state;
        
        // In a real app, this would be an API call to get restaurant details
        // For now, we'll simulate it with mock data
        const fetchRestaurantDetails = async () => {
            setLoading(true);
            try {
                // Simulate API call
                const mockRestaurants = [
                    {
                        id: 1,
                        name: "Italian Delight",
                        address: "San Francisco, CA 94105",
                        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600&h=350",
                    },
                    {
                        id: 2,
                        name: "Sushi Heaven",
                        address: "San Jose, CA 95113",
                        image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&q=80&w=600&h=350",
                    },
                    {
                        id: 3,
                        name: "Taco Palace",
                        address: "Santa Clara, CA 95050",
                        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600&h=350",
                    },
                    {
                        id: 4,
                        name: "Golden Dragon",
                        address: "Oakland, CA 94612",
                        image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?auto=format&fit=crop&q=80&w=600&h=350",
                    },
                    {
                        id: 5,
                        name: "Parisian Bistro",
                        address: "San Francisco, CA 94102",
                        image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=600&h=350",
                    },
                    {
                        id: 6,
                        name: "Curry House",
                        address: "Palo Alto, CA 94301",
                        image: "https://images.unsplash.com/photo-1585937421612-70a008356c36?auto=format&fit=crop&q=80&w=600&h=350",
                    },
                    {
                        id: 7,
                        name: "Tandoori Flames",
                        address: "San Francisco, CA 94105",
                        image: "https://images.unsplash.com/photo-1585937421612-70a008356c36?auto=format&fit=crop&q=80&w=600&h=350",
                    }
                ];
                
                const found = mockRestaurants.find(r => r.id.toString() === restaurantId.toString());
                if (found) {
                    setRestaurant({
                        ...found,
                        reservationDate: new Date(date),
                        reservationTime: time,
                        people: people,
                        tableId: tableId,
                        tableNumber: "Table #15" // In a real app, this would be dynamic
                    });
                } else {
                    // If restaurant not found, use default
                    setRestaurant({
                        id: restaurantId,
                        name: "Restaurant #" + restaurantId,
                        address: "San Francisco, CA 94105",
                        reservationDate: new Date(date),
                        reservationTime: time,
                        people: people,
                        tableId: tableId,
                        tableNumber: "Table #15"
                    });
                }
            } catch (error) {
                console.error("Error fetching restaurant details:", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchRestaurantDetails();
    }, [location.state, navigate]);
    
    const handleSendConfirmation = () => {
        // In a real app, this would send a confirmation email/SMS
        alert(`Confirmation ${sendEmail ? 'email' : ''}${sendEmail && sendSMS ? ' and ' : ''}${sendSMS ? 'SMS' : ''} sent!`);
    };
    
    // Update the handleAddToCalendar function in ReserveConfirmation.js

    const handleAddToCalendar = () => {
        // Create Google Calendar event URL
        const eventTitle = encodeURIComponent(`Reservation at ${restaurant.name}`);
        const eventLocation = encodeURIComponent(restaurant.address);
        const eventDescription = encodeURIComponent(`Table reservation for ${restaurant.people} people at ${restaurant.tableNumber}`);
        
        // Format the date and time for Google Calendar
        const startDate = new Date(restaurant.reservationDate);
        const [hours, minutes] = restaurant.reservationTime.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes), 0);
        
        // End time (assuming 2 hours for a meal)
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 2);
        
        // Format dates for Google Calendar URL
        const formatDateForGCal = (date) => {
            return date.toISOString().replace(/-|:|\.\d+/g, '');
        };
        
        const startDateFormatted = formatDateForGCal(startDate);
        const endDateFormatted = formatDateForGCal(endDate);
        
        // Create Google Calendar URL
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startDateFormatted}/${endDateFormatted}&details=${eventDescription}&location=${eventLocation}&sf=true&output=xml`;
        
        // Open Google Calendar in a new tab
        window.open(googleCalendarUrl, '_blank');
    };
    
    const handleCancelBooking = () => {
        // In a real app, this would cancel the booking
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            alert('Reservation cancelled!');
            navigate('/');
        }
    };
    
    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '80vh' 
            }}>
                <p>Loading reservation details...</p>
            </div>
        );
    }
    
    if (!restaurant) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '80vh',
                textAlign: 'center',
                padding: '0 20px'
            }}>
                <h2>Reservation Not Found</h2>
                <p>We couldn't find the reservation details. Please try again.</p>
                <Link 
                    to="/"
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#8B0000',
                        color: 'white',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        marginTop: '20px'
                    }}
                >
                    Return to Home
                </Link>
            </div>
        );
    }
    
    // Format date for display
    const formattedDate = restaurant.reservationDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Format time for display (from 24h to 12h format)
    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        return `${hour > 12 ? hour - 12 : hour}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
    };
    
    // Convert 24h time format to military time format for display
    const timeForDisplay = () => {
        const [hours, minutes] = restaurant.reservationTime.split(':');
        return `${hours}:${minutes}`;
    };
    
    return (
        <div style={{ 
            maxWidth: '700px', 
            margin: '40px auto', 
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid #eee',
                paddingBottom: '20px'
            }}>
                <h1 style={{ margin: 0, fontSize: '32px' }}>Booking Confirmation</h1>
                <div style={{ 
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '50px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <span style={{ marginRight: '5px' }}>✓</span> Confirmed
                </div>
            </div>
            
            <h2 style={{ color: '#0066cc', fontSize: '28px', margin: '20px 0' }}>{restaurant.name}</h2>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
                <div style={{ flex: '1 1 40%', minWidth: '250px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '10px', fontSize: '20px' }}>📅</span>
                            <div>
                                <strong>Date:</strong> {formattedDate}
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '10px', fontSize: '20px' }}>⏰</span>
                            <div>
                                <strong>Time:</strong> {timeForDisplay()}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style={{ flex: '1 1 40%', minWidth: '250px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '10px', fontSize: '20px' }}>👥</span>
                            <div>
                                <strong>Party Size:</strong> {restaurant.people} people
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '10px', fontSize: '20px' }}>🪑</span>
                            <div>
                                <strong>Table:</strong> {restaurant.tableNumber}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{ 
                backgroundColor: '#f8f8f8', 
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '30px'
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '24px', marginRight: '10px', color: '#e74c3c' }}>📍</span>
                    <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{restaurant.address}</div>
                        <a 
                            href="#" 
                            style={{ color: '#0066cc', textDecoration: 'none' }}
                            onClick={(e) => { e.preventDefault(); alert('Map view would open here'); }}
                        >
                            View on Map
                        </a>
                    </div>
                </div>
            </div>
            
            <div style={{ 
                backgroundColor: '#f8f8f8', 
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '30px'
            }}>
                <h3 style={{ margin: '0 0 15px 0' }}>Send confirmation to:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input 
                            type="checkbox" 
                            checked={sendEmail} 
                            onChange={() => setSendEmail(!sendEmail)}
                            style={{ marginRight: '10px' }}
                        />
                        <span style={{ fontSize: '18px' }}>📧</span>
                        <span style={{ marginLeft: '5px' }}>Email (your registered email)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                        <input 
                            type="checkbox" 
                            checked={sendSMS} 
                            onChange={() => setSendSMS(!sendSMS)}
                            style={{ marginRight: '10px' }}
                        />
                        <span style={{ fontSize: '18px' }}>📱</span>
                        <span style={{ marginLeft: '5px' }}>SMS</span>
                    </label>
                </div>
                
                <button 
                    onClick={handleSendConfirmation}
                    style={{
                        backgroundColor: '#0066cc',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 15px',
                        marginTop: '15px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Send Confirmation
                </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Cancellation Policy:</h3>
                <p style={{ margin: 0 }}>Free cancellation up to 2 hours before your reservation.</p>
            </div>
            
            <div style={{ 
                display: 'flex', 
                gap: '15px',
                justifyContent: 'space-between',
                marginTop: '30px'
            }}>
                <button 
                    onClick={handleAddToCalendar}
                    style={{
                        flex: 1,
                        backgroundColor: '#4ab5ce',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '12px 15px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Add to Calendar
                </button>
                
                <button 
                    onClick={handleCancelBooking}
                    style={{
                        flex: 1,
                        backgroundColor: 'white',
                        color: '#e74c3c',
                        border: '1px solid #e74c3c',
                        borderRadius: '4px',
                        padding: '12px 15px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Cancel Booking
                </button>
            </div>
        </div>
    );
};

export default ReserveConfirmation;