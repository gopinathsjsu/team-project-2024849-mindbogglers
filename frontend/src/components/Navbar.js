// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="brand">BookTable</Link>
            <div className="nav-links">
                <Link to="/">Home</Link>
                {user ? (
                    <>
                        {user.role === 'Customer' && <Link to="/booking">My Bookings</Link>}
                        {user.role === 'RestaurantManager' && <Link to="/manager">Manager Panel</Link>}
                        {user.role === 'Admin' && <Link to="/dashboard">Admin Dashboard</Link>}
                        <button
                            onClick={handleLogout}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
