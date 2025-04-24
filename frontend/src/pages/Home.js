
import React, { useState } from 'react';
import { searchRestaurants } from '../api';
import { Link } from 'react-router-dom';


const Home = () => {
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        people: '',
        city: '',
        state: '',
        zip: ''
    });
    const [restaurants, setRestaurants] = useState([]);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const data = await searchRestaurants(formData);
            setRestaurants(data.data || []); // expecting an array of restaurant objects
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container hero">
            <h1 className="page-title">Search for Restaurants</h1>
            <form onSubmit={handleSearch} className="search-container ">
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                <input type="time" name="time" value={formData.time} onChange={handleChange} required />
                <input type="number" name="people" placeholder="# of People" value={formData.people} onChange={handleChange} required />
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
                <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} />
                <input type="text" name="zip" placeholder="Zip Code" value={formData.zip} onChange={handleChange} />
                <button type="submit">Search</button>
            </form>
            {error && <p>{error}</p>}
            <div className="cards-grid">
                {restaurants.map(restaurant => (
                    <div className="card" key={restaurant.id}>
                        <h3>{restaurant.name}</h3>
                        <p className="cuisine">Cuisine: {restaurant.cuisine}</p>
                        <p>Cost Rating: {restaurant.costRating}</p>
                        <p>Reviews: {restaurant.reviews} (Rating: {restaurant.rating})</p>
                        <p className="booked-today">Booked Today: {restaurant.timesBooked}</p>
                        <div>
                            {restaurant.availableTimes.map((time, index) => (
                                <Link key={index} to={`/booking?restaurantId=${restaurant.id}&time=${time}`}>
                                    <button className="view-details-btn">{time}</button>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
