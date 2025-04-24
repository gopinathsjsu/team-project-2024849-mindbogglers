import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api';
import { AuthContext } from '../AuthContext';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = e => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(credentials);
            login(response.data);
            setError(null);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h1 className="page-title">Login</h1>
            <form onSubmit={handleSubmit} className="booking-form">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                />
                <button type="submit" className="submit-btn">Login</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
};

export default Login;
