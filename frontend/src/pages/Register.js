import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import { AuthContext } from '../AuthContext';
import axios from 'axios';

const Register = () => {
    const [userData, setUserData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'Customer'
    });
    const [errorMessage, setErrorMessage] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = e => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            console.log('Sending registration data:', userData);
            const response = await registerUser(userData);
            console.log('Registration response:', response);

            // After registration, attempt to login
            await login({
                email: userData.email,
                password: userData.password
            });

            setErrorMessage('');
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);

            // Safely extract error message as a string
            if (typeof err === 'object') {
                if (err.message) {
                    setErrorMessage(err.message);
                } else if (err.msg) {
                    setErrorMessage(err.msg);
                } else {
                    setErrorMessage('Registration failed. Please try again.');
                }
            } else if (typeof err === 'string') {
                setErrorMessage(err);
            } else {
                setErrorMessage('An unknown error occurred');
            }
        }
    };

    return (
        <div className="container">
            <h1 className="page-title">Register</h1>
            <form onSubmit={handleSubmit} className="booking-form">
                <input
                    type="text"
                    name="full_name"
                    placeholder="Full Name"
                    value={userData.full_name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                />
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
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default Register;