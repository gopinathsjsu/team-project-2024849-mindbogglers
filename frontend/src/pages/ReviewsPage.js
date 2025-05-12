import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestaurantReviews, getRestaurantById } from '../api';

const ReviewsPage = () => {
  const { id } = useParams(); // /reviews/:id
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        console.log("🔍 Fetching restaurant and reviews for ID:", id);

        const [restaurantData, reviewData] = await Promise.all([
          getRestaurantById(id),
          getRestaurantReviews(id)
        ]);

        setRestaurant(restaurantData);
        setReviews(reviewData);

        console.log("🏠 Restaurant:", restaurantData);
        console.log("📝 Reviews:", reviewData);

      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError('Failed to load reviews or restaurant info.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading reviews...</div>;
  }

  if (error) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: '20px',
          padding: '10px 20px',
          backgroundColor: '#8B0000',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        ← Back
      </button>

      <h2 style={{ marginBottom: '20px' }}>
        Reviews for <em>{restaurant?.name || 'Restaurant'}</em>
      </h2>

      {reviews.length === 0 ? (
        <p>No reviews yet for this restaurant.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.map((review) => (
            <div
              key={review.review_id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '15px',
                backgroundColor: '#fdfdfd',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}
            >
              <strong style={{ color: '#FFD700', fontSize: '18px' }}>
                ⭐ {review.rating}
              </strong>
              <p style={{ margin: '10px 0', fontSize: '16px' }}>
                {review.comment || 'No comment provided.'}
              </p>
              <small style={{ color: '#555' }}>
                — {review.user_name || 'Anonymous'}{review.date ? ` on ${review.date}` : ''}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
