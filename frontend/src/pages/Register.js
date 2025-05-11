import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api';
import { AuthContext } from '../AuthContext';
import PasswordRequirements from '../components/PasswordRequirements';
import './Register.css'; // ⬅️ Add a CSS file to style this properly

const Register = () => {
    const [userData, setUserData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'Customer'
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerUser(userData);
            await login({ email: userData.email, password: userData.password });
            navigate('/');
        } catch (err) {
            if (typeof err === 'string') setErrorMessage(err);
            else setErrorMessage(err.message || 'Registration failed.');
        }
    };

    return (
        <div className="register-container">
            <form className="register-card" onSubmit={handleSubmit}>
                <h2 className="form-title">Register</h2>

                <label>Full Name</label>
                <input
                    type="text"
                    name="full_name"
                    value={userData.full_name}
                    onChange={handleChange}
                    required
                />

                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                />

                <label>Password</label>
                <div className="password-wrapper">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={userData.password}
                        onChange={handleChange}
                        required
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? '🙈' : '👁️'}
                    </button>
                </div>

                <PasswordRequirements password={userData.password} />

                <label>Role:</label>
                <select name="role" value={userData.role} onChange={handleChange}>
                    <option value="Customer">Customer</option>
                    <option value="RestaurantManager">Restaurant Manager</option>
                    <option value="Admin">Admin</option>
                </select>

                <button type="submit" className="register-btn">Register</button>

                {errorMessage && <p className="error-msg">{errorMessage}</p>}
            </form>
        </div>
    );
};

export default Register;
