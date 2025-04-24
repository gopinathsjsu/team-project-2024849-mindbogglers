import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="brand">BookTable</Link>
            <div className="nav-links">
                <Link to="/">Home</Link>
                {user ? (
                    <>
                        {user.role === 'Customer' && (
                            <>
                                <Link to="/my-reservations">My Reservations</Link>
                            </>
                        )}
                        {user.role === 'RestaurantManager' && (
                            <Link to="/manager">Manager Dashboard</Link>
                        )}
                        {user.role === 'Admin' && (
                            <Link to="/admin">Admin Dashboard</Link>
                        )}
                        <span className="user-info">
                            {user.full_name || user.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="logout-btn"
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