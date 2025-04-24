// src/pages/Register.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import { AuthContext } from '../AuthContext';

const Register = () => {
    const [userData, setUserData] = useState({ name: '', email: '', password: '', role: 'Customer' });
    const [error, setError] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = e => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const response = await registerUser(userData);
            login(response.data);
            setError(null);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h1 className="page-title">Register</h1>
            <form onSubmit={handleSubmit} className="booking-form">
                <input type="text" name="name" placeholder="Name" value={userData.name} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={userData.email} onChange={handleChange} required />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={userData.password}
                    onChange={handleChange}
                    required
                />
                <select name="role" value={userData.role} onChange={handleChange}>
                    <option value="Customer">Customer</option>
                    <option value="RestaurantManager">Restaurant Manager</option>
                    <option value="Admin">Admin</option>
                </select>
                <button type="submit" className="submit-btn">Register</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default Register;
