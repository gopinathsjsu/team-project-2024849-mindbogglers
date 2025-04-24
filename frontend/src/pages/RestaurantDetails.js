// src/pages/RestaurantDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurantDetails } from '../api';

const RestaurantDetails = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await getRestaurantDetails(id);
                setRestaurant(response.data);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchDetails();
    }, [id]);

    if (error) return <p>{error}</p>;
    if (!restaurant) return <p>Loading...</p>;

    return (
        <div className="container">
            <h1 className="page-title">{restaurant.name}</h1>
            <p className="cuisine">Cuisine: {restaurant.cuisine}</p>
            <p>Address: {restaurant.address}</p>
            <p>Contact: {restaurant.contact}</p>
            <p>Description: {restaurant.description}</p>
            <div>
                <h3>Reviews</h3>
                {restaurant.reviews && restaurant.reviews.length ? (
                    restaurant.reviews.map((review, index) => (
                        <div key={index}>
                            <p>{review.comment} - {review.rating} stars</p>
                        </div>
                    ))
                ) : (
                    <p>No reviews available.</p>
                )}
            </div>
            <div>
                <h3>Location</h3>
                <iframe
                    width="600"
                    height="450"
                    style={{ border: 0, width: '100%', maxWidth: '600px' }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(restaurant.address)}`}
                ></iframe>
            </div>
        </div>
    );
};

export default RestaurantDetails;
