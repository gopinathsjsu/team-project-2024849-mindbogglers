import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getRestaurantById,
  updateRestaurant,
  uploadPhoto,
  addTable
} from '../api';
import './ManagerDashboard.css';

const EditRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [tableSize, setTableSize] = useState('');
  const [availableTimes, setAvailableTimes] = useState('');

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const data = await getRestaurantById(id);
        setRestaurant(data);
        setPhotoPreview(data.photo_url || null);
      } catch (err) {
        setError('Failed to load restaurant details.');
      }
    };

    fetchRestaurant();
  }, [id]);

  const handleInputChange = (field, value) => {
    setRestaurant(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdate = async () => {
    try {
      await updateRestaurant(id, restaurant);
      setSuccess('✅ Restaurant updated successfully!');
      setTimeout(() => navigate('/manager'), 1500);
    } catch (err) {
      setError('❌ Failed to update restaurant.');
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    try {
      const formData = new FormData();
      formData.append('file', photoFile);
      formData.append('description', 'Main image');
      await uploadPhoto(id, formData);
      setSuccess('📸 Photo uploaded successfully!');
    } catch (err) {
      setError('❌ Photo upload failed.');
    }
  };

  const handleAddTable = async () => {
    try {
      if (!tableSize || !availableTimes) {
        setError('Table size and available times are required.');
        return;
      }

      await addTable(id, {
        size: parseInt(tableSize),
        available_times: availableTimes.split(',').map(t => t.trim())
      });

      setSuccess('🪑 Table added successfully!');
      setTableSize('');
      setAvailableTimes('');
    } catch (err) {
      setError('❌ Failed to add table.');
    }
  };

  if (!restaurant) return <div className="manager-container">Loading...</div>;

  return (
    <div className="manager-container">
      <h1 className="manager-title">Edit Restaurant</h1>
      {success && <div className="manager-success">{success}</div>}
      {error && <div className="manager-error">{error}</div>}

      {/* Restaurant Info */}
      <div className="manager-form">
        <input
          placeholder="Name"
          value={restaurant.name || ''}
          onChange={e => handleInputChange('name', e.target.value)}
        />
        <input
          placeholder="Address"
          value={restaurant.address || ''}
          onChange={e => handleInputChange('address', e.target.value)}
        />
        <input
          placeholder="City"
          value={restaurant.city || ''}
          onChange={e => handleInputChange('city', e.target.value)}
        />
        <input
          placeholder="State"
          value={restaurant.state || ''}
          onChange={e => handleInputChange('state', e.target.value)}
        />
        <input
          placeholder="ZIP Code"
          value={restaurant.zip_code || ''}
          onChange={e => handleInputChange('zip_code', e.target.value)}
        />
        <input
          type="email"
          placeholder="Contact Email"
          value={restaurant.contact_email || ''}
          onChange={e => handleInputChange('contact_email', e.target.value)}
        />
        <input
          placeholder="Contact Phone"
          value={restaurant.contact_phone || ''}
          onChange={e => handleInputChange('contact_phone', e.target.value)}
        />
        <input
          placeholder="Cuisine"
          value={restaurant.cuisine || ''}
          onChange={e => handleInputChange('cuisine', e.target.value)}
        />
        <input
          type="number"
          min="1"
          max="5"
          placeholder="Cost Rating"
          value={restaurant.cost_rating || ''}
          onChange={e => handleInputChange('cost_rating', parseInt(e.target.value))}
        />
        <input
          placeholder="Opening Time (e.g. 10:00)"
          value={restaurant.hours_open || ''}
          onChange={e => handleInputChange('hours_open', e.target.value)}
        />
        <input
          placeholder="Closing Time (e.g. 22:00)"
          value={restaurant.hours_close || ''}
          onChange={e => handleInputChange('hours_close', e.target.value)}
        />
        <textarea
          placeholder="Description"
          value={restaurant.description || ''}
          onChange={e => handleInputChange('description', e.target.value)}
          style={{ resize: 'vertical' }}
        />
        <button onClick={handleUpdate}>Save Changes</button>
      </div>

      {/* Photo Upload */}
      <div className="manager-form">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files[0])}
        />
        <button onClick={handlePhotoUpload}>Upload New Photo</button>

        {photoPreview && (
          <img
            src={photoPreview}
            alt="Restaurant"
            style={{ marginTop: '1rem', maxHeight: '180px', borderRadius: '6px', objectFit: 'cover' }}
          />
        )}
      </div>

      {/* Table Section */}
      <div className="manager-form" style={{ marginTop: '2rem' }}>
        <h3>Add Table</h3>
        <input
          type="number"
          placeholder="Table Size (e.g. 2)"
          value={tableSize}
          onChange={(e) => setTableSize(e.target.value)}
        />
        <input
          type="text"
          placeholder="Available Times (e.g. 18:00,19:00)"
          value={availableTimes}
          onChange={(e) => setAvailableTimes(e.target.value)}
        />
        <button onClick={handleAddTable}>Add Table</button>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'left' }}>
        <button className="back-button" onClick={() => navigate('/manager')}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default EditRestaurant;
