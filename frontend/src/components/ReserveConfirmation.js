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
        // If no booking info was passed in navigation state, redirect to home
        if (!location.state) {
            navigate('/');
            return;
        }

        const { restaurantId, date, time, people, tableId } = location.state;

        // Simulated API to fetch restaurant details (could be replaced with real API call)
        const fetchRestaurantDetails = async () => {
            setLoading(true);
            try {
                const mockRestaurants = [ /* array of sample restaurants */ ];

                const found = mockRestaurants.find(r => r.id.toString() === restaurantId.toString());

                if (found) {
                    setRestaurant({
                        ...found,
                        reservationDate: new Date(date),
                        reservationTime: time,
                        people,
                        tableId,
                        tableNumber: "Table #15" // In a real app, this would be dynamic
                    });
                } else {
                    // Fallback if no match found
                    setRestaurant({
                        id: restaurantId,
                        name: "Restaurant #" + restaurantId,
                        address: "San Francisco, CA 94105",
                        reservationDate: new Date(date),
                        reservationTime: time,
                        people,
                        tableId,
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

    // Simulate sending confirmation via email or SMS
    const handleSendConfirmation = () => {
        alert(`Confirmation ${sendEmail ? 'email' : ''}${sendEmail && sendSMS ? ' and ' : ''}${sendSMS ? 'SMS' : ''} sent!`);
    };

    // Open a pre-filled Google Calendar event for this reservation
    const handleAddToCalendar = () => {
        const eventTitle = encodeURIComponent(`Reservation at ${restaurant.name}`);
        const eventLocation = encodeURIComponent(restaurant.address);
        const eventDescription = encodeURIComponent(`Table reservation for ${restaurant.people} people at ${restaurant.tableNumber}`);

        const startDate = new Date(restaurant.reservationDate);
        const [hours, minutes] = restaurant.reservationTime.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes), 0);

        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 2); // Assume 2-hour reservation

        const formatDateForGCal = (date) => date.toISOString().replace(/-|:|\.\d+/g, '');

        const startDateFormatted = formatDateForGCal(startDate);
        const endDateFormatted = formatDateForGCal(endDate);

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startDateFormatted}/${endDateFormatted}&details=${eventDescription}&location=${eventLocation}&sf=true&output=xml`;

        window.open(googleCalendarUrl, '_blank');
    };

    // Handle cancel action with confirmation and redirection
    const handleCancelBooking = () => {
        if (window.confirm('Are you sure you want to cancel this reservation?')) {
            alert('Reservation cancelled!');
            navigate('/');
        }
    };

    // While data is loading
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <p>Loading reservation details...</p>
            </div>
        );
    }

    // If restaurant info could not be loaded
    if (!restaurant) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', textAlign: 'center', padding: '0 20px' }}>
                <h2>Reservation Not Found</h2>
                <p>We couldn't find the reservation details. Please try again.</p>
                <Link to="/" style={{ padding: '10px 20px', backgroundColor: '#8B0000', color: 'white', borderRadius: '4px', textDecoration: 'none', marginTop: '20px' }}>
                    Return to Home
                </Link>
            </div>
        );
    }

    // Format readable display date and time
    const formattedDate = restaurant.reservationDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const timeForDisplay = () => {
        const [hours, minutes] = restaurant.reservationTime.split(':');
        return `${hours}:${minutes}`;
    };

    // Render the confirmation UI
    return (
        <div style={{ maxWidth: '700px', margin: '40px auto', padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                <h1 style={{ margin: 0, fontSize: '32px' }}>Booking Confirmation</h1>
                <div style={{ backgroundColor: '#4CAF50', color: 'white', padding: '8px 16px', borderRadius: '50px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '5px' }}>✓</span> Confirmed
                </div>
            </div>

            {/* Restaurant name */}
            <h2 style={{ color: '#0066cc', fontSize: '28px', margin: '20px 0' }}>{restaurant.name}</h2>

            {/* Reservation details: date, time, people, table */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
                {/* Left column */}
                <div style={{ flex: '1 1 40%', minWidth: '250px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <strong>Date:</strong> {formattedDate}
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <strong>Time:</strong> {timeForDisplay()}
                    </div>
                </div>

                {/* Right column */}
                <div style={{ flex: '1 1 40%', minWidth: '250px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <strong>Party Size:</strong> {restaurant.people} people
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <strong>Table:</strong> {restaurant.tableNumber}
                    </div>
                </div>
            </div>

            {/* Address and map link */}
            <div style={{ backgroundColor: '#f8f8f8', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{restaurant.address}</div>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Map view would open here'); }} style={{ color: '#0066cc', textDecoration: 'none' }}>
                    View on Map
                </a>
            </div>

            {/* Confirmation options */}
            <div style={{ backgroundColor: '#f8f8f8', padding: '15px', borderRadius: '8px', marginBottom: '30px' }}>
                <h3>Send confirmation to:</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label>
                        <input type="checkbox" checked={sendEmail} onChange={() => setSendEmail(!sendEmail)} style={{ marginRight: '10px' }} />
                        Email (your registered email)
                    </label>
                    <label>
                        <input type="checkbox" checked={sendSMS} onChange={() => setSendSMS(!sendSMS)} style={{ marginRight: '10px' }} />
                        SMS
                    </label>
                </div>
                <button onClick={handleSendConfirmation} style={{ backgroundColor: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', padding: '10px 15px', marginTop: '15px', fontWeight: 'bold' }}>
                    Send Confirmation
                </button>
            </div>

            {/* Policy and final actions */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Cancellation Policy:</h3>
                <p>Free cancellation up to 2 hours before your reservation.</p>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-between', marginTop: '30px' }}>
                <button onClick={handleAddToCalendar} style={{ flex: 1, backgroundColor: '#4ab5ce', color: 'white', border: 'none', borderRadius: '4px', padding: '12px 15px', fontWeight: 'bold' }}>
                    Add to Calendar
                </button>
                <button onClick={handleCancelBooking} style={{ flex: 1, backgroundColor: 'white', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '4px', padding: '12px 15px', fontWeight: 'bold' }}>
                    Cancel Booking
                </button>
            </div>
        </div>
    );
};

export default ReserveConfirmation;
