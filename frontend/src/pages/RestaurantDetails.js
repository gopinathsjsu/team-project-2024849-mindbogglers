import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurantDetails, addReview } from '../api';
import { AuthContext } from '../AuthContext';
import './RestaurantDetails.css';

const RestaurantDetails = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await getRestaurantDetails(id);
                setRestaurant(response.data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Failed to load restaurant details');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to leave a review');
            return;
        }
        try {
            await addReview(id, newReview);
            const response = await getRestaurantDetails(id);
            setRestaurant(response.data);
            setNewReview({ rating: 5, comment: '' });
        } catch (err) {
            setError('Failed to submit review: ' + err.message);
        }
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!restaurant) return <div className="not-found">Restaurant not found</div>;

    return (
        <div className="restaurant-details-container">
            <div className="restaurant-header">
                <h1 className="restaurant-name">{restaurant.name}</h1>
                <div className="restaurant-meta">
                    <span className="cuisine-tag">{restaurant.cuisine}</span>
                    <div className="restaurant-rating">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < restaurant.rating ? "star filled" : "star"}>★</span>
                        ))}
                        <span className="rating-text">({restaurant.rating || 'No ratings yet'})</span>
                    </div>
                    {restaurant.total_bookings !== undefined && (
                        <span className="bookings-today">{restaurant.total_bookings} bookings today</span>
                    )}
                </div>
            </div>

            <div className="restaurant-info-section">
                <div className="info-col">
                    <div className="info-card">
                        <h3>About</h3>
                        <p className="restaurant-description">{restaurant.description || 'No description available.'}</p>
                        <div className="contact-info">
                            <p><strong>Address:</strong> {restaurant.address || 'Not available'}</p>
                            <p><strong>Contact:</strong> {restaurant.contact || 'Not available'}</p>
                            <p><strong>Hours:</strong> {restaurant.opening_hours || 'Not specified'}</p>
                        </div>
                    </div>

                    <div id="reviews" className="reviews-section">
                        <h3>Customer Reviews</h3>
                        {restaurant.reviews?.length > 0 ? (
                            <div className="reviews-list">
                                {restaurant.reviews.map((review, index) => (
                                    <div key={index} className="review-card">
                                        <div className="review-header">
                                            <div className="rating">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={i < review.rating ? "star filled" : "star"}>★</span>
                                                ))}
                                            </div>
                                            <div className="reviewer">{review.user_name || 'Anonymous'}</div>
                                        </div>
                                        <p className="review-text">{review.comment}</p>
                                        {review.date && (
                                            <p className="review-date">
                                                {new Date(review.date).toLocaleString(undefined, {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="no-reviews">No reviews yet. Be the first to leave one!</p>
                        )}

                        {user && (
                            <div className="add-review-section">
                                <h4>Leave a Review</h4>
                                <form onSubmit={handleReviewSubmit} className="review-form">
                                    <div className="rating-selector">
                                        <label htmlFor="rating">Your Rating:</label>
                                        <div className="star-rating">
                                            {[...Array(5)].map((_, index) => {
                                                const ratingValue = index + 1;
                                                return (
                                                    <label key={index}>
                                                        <input 
                                                            type="radio" 
                                                            name="rating" 
                                                            value={ratingValue} 
                                                            onClick={() => setNewReview({...newReview, rating: ratingValue})}
                                                            style={{display: 'none'}}
                                                        />
                                                        <span 
                                                            className={ratingValue <= newReview.rating ? "star filled" : "star"}
                                                            style={{cursor: 'pointer'}}
                                                        >
                                                            ★
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="comment-field">
                                        <label htmlFor="review-comment">Your Review:</label>
                                        <textarea 
                                            id="review-comment"
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                            placeholder="Share your experience at this restaurant..."
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="submit-review-btn">Submit Review</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                <div className="map-section">
                    <h3>Location</h3>
                    <div className="map-container">
                        {restaurant.maps_url ? (
                            <a href={restaurant.maps_url} target="_blank" rel="noopener noreferrer" className="view-map-link">
                                📍 View on Google Maps
                            </a>
                        ) : (
                            <p>Location not available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetails;
