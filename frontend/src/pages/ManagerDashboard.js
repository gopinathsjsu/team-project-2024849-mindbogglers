// src/pages/ManagerDashboard.js
import React, { useState, useEffect } from 'react';
import { addRestaurantListing, getManagerRestaurants } from '../api';

const ManagerDashboard = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        contact: '',
        hours: '',
        availableTimes: '',
        tableSizes: '',
        description: '',
        photos: [] // image upload handling to be implemented
    });
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await getManagerRestaurants();
                setRestaurants(data.data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchRestaurants();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addRestaurantListing(formData);
            setMessage('Restaurant listing added successfully!');
            setError(null);
            // Optionally refresh restaurant list here
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h1 className="page-title">Restaurant Manager Panel</h1>
            {error && <p>{error}</p>}
            {message && <p>{message}</p>}
            <h2 className="page-title" style={{ fontSize: '1.3rem' }}>Add New Restaurant Listing</h2>
            <form onSubmit={handleSubmit} className="booking-form">
                <input type="text" name="name" placeholder="Restaurant Name" value={formData.name} onChange={handleChange} required />
                <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
                <input type="text" name="contact" placeholder="Contact Info" value={formData.contact} onChange={handleChange} required />
                <input type="text" name="hours" placeholder="Operating Hours" value={formData.hours} onChange={handleChange} required />
                <input type="text" name="availableTimes" placeholder="Available Booking Times" value={formData.availableTimes} onChange={handleChange} required />
                <input type="text" name="tableSizes" placeholder="Table Sizes" value={formData.tableSizes} onChange={handleChange} required />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required />
                {/* Implement photo upload below */}
                <button type="submit" className="submit-btn">Add Listing</button>
            </form>
            <h2 className="page-title" style={{ fontSize: '1.3rem' }}>Your Restaurant Listings</h2>
            <div className="cards-grid">
                {restaurants.map(r => (
                    <div className="card" key={r.id}>
                        <h3>{r.name}</h3>
                        <p>{r.address}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagerDashboard;
