import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api';
import { AuthContext } from '../AuthContext';
import './Login.css'; // ✅ Add a new CSS file

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(credentials);
            login(response); // Sets user in context
            setError(null);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2 className="login-title">Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={credentials.email}
                        onChange={handleChange}
                        className="login-input"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={credentials.password}
                        onChange={handleChange}
                        className="login-input"
                        required
                    />
                    <button type="submit" className="login-btn">Login</button>
                </form>

                {error && <p className="error-text">{error}</p>}

                <p className="login-footer">
                    New to BookTable?{' '}
                    <Link to="/register" className="register-link">
                        Create an account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
