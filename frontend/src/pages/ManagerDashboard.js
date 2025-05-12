import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMyRestaurants, getRestaurantById } from '../api';
import './ManagerDashboard.css';

const ManagerDashboard = () => {
  const [myRestaurants, setMyRestaurants] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) {
      fetchRestaurants();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const fetchRestaurants = async () => {
    try {
      const baseList = await getMyRestaurants();

      // Enrich with photo_url using detailed fetch
      const enriched = await Promise.all(
        baseList.map(async (r) => {
          try {
            const fullDetails = await getRestaurantById(r.id);
            return {
              ...r,
              photo_url: fullDetails.photo_url || null,
            };
          } catch (e) {
            console.error(`Failed to fetch photo for restaurant ${r.id}`, e);
            return { ...r, photo_url: null };
          }
        })
      );

      setMyRestaurants(enriched);
    } catch (err) {
      setError('❌ Failed to fetch your restaurants.');
    }
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h1 className="manager-title">My Restaurants</h1>
        <button
          className="add-restaurant-btn"
          onClick={() => navigate('/manager/add')}
        >
          + Add New Restaurant
        </button>
      </div>

      {error && <div className="manager-error">{error}</div>}

      {myRestaurants.length === 0 ? (
        <p style={{ fontStyle: 'italic', textAlign: 'center' }}>
          You haven’t added any restaurants yet. Click "Add New Restaurant" to get started.
        </p>
      ) : (
        myRestaurants.map((r) => (
          <div key={r.id} className="restaurant-card">
            <h3>
              {r.name}{' '}
              <span className={`status-${r.status}`}>({r.status})</span>
            </h3>

            {r.photo_url && (
              <img
                src={r.photo_url}
                alt={`${r.name} photo`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '180px',
                  borderRadius: '6px',
                  marginTop: '10px',
                  objectFit: 'cover',
                }}
              />
            )}

            <p><strong>Cuisine:</strong> {r.cuisine}</p>
            <p><strong>City:</strong> {r.city}</p>

            <button
              className="edit-restaurant-btn"
              onClick={() => navigate(`/manager/edit/${r.id}`)}
            >
              Edit Details
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default ManagerDashboard;
