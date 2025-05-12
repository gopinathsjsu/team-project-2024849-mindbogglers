import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRestaurant } from '../api';
import './ManagerDashboard.css';

const AddRestaurant = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    cuisine: '',
    cost_rating: 1,
    city: '',
    state: '',
    zip_code: '',
    rating: 0,
    description: '',
    contact_phone: '',
    contact_email: '',
    hours_open: '',
    hours_close: '',
    address: ''
  });

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      await addRestaurant(formData);
      setSuccess('✅ Restaurant submitted for approval!');
      setFormData({
        name: '', cuisine: '', cost_rating: 1, city: '', state: '',
        zip_code: '', rating: 0, description: '', contact_phone: '', contact_email: '',
        hours_open: '', hours_close: '', address: ''
      });
      setTimeout(() => navigate('/manager', { state: { refresh: true } }), 1500);
    } catch (err) {
      setError('❌ Failed to submit restaurant.');
    }
  };

  return (
    <div className="manager-container">
      <h1 className="manager-title">➕ Add New Restaurant</h1>
      {success && <div className="manager-success">{success}</div>}
      {error && <div className="manager-error">{error}</div>}

      <div className="manager-form">
        <input placeholder="Name" value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })} />
        <input placeholder="Cuisine" value={formData.cuisine}
          onChange={e => setFormData({ ...formData, cuisine: e.target.value })} />
        <input placeholder="Cost Rating (1–5)" type="number" min="1" max="5"
          value={formData.cost_rating}
          onChange={e => setFormData({ ...formData, cost_rating: parseInt(e.target.value) })} />
        <input placeholder="City" value={formData.city}
          onChange={e => setFormData({ ...formData, city: e.target.value })} />
        <input placeholder="State" value={formData.state}
          onChange={e => setFormData({ ...formData, state: e.target.value })} />
        <input placeholder="ZIP Code" value={formData.zip_code}
          onChange={e => setFormData({ ...formData, zip_code: e.target.value })} />
        <input placeholder="Initial Rating (0–5)" type="number" min="0" max="5"
          value={formData.rating}
          onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })} />
        <textarea placeholder="Short Description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })} />
        <input placeholder="Contact Number"
          value={formData.contact_phone}
          onChange={e => setFormData({ ...formData, contact_phone: e.target.value })} />
        <input placeholder="Email Address"
          value={formData.contact_email}
          onChange={e => setFormData({ ...formData, contact_email: e.target.value })} />
        <input placeholder="Opening Time (e.g. 10AM)"
          value={formData.hours_open}
          onChange={e => setFormData({ ...formData, hours_open: e.target.value })} />
        <input placeholder="Closing Time (e.g. 10PM)"
          value={formData.hours_close}
          onChange={e => setFormData({ ...formData, hours_close: e.target.value })} />
        <input placeholder="Street Address"
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })} />

        <button onClick={handleSubmit}>Submit for Approval</button>
        <button onClick={() => navigate('/manager')} style={{ marginTop: '10px', backgroundColor: '#6c757d' }}>
          ⬅ Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default AddRestaurant;
