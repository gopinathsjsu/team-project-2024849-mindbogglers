import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
  // Access user authentication state and logout function from context
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle user logout and redirect to login page
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* App logo or home link */}
      <Link to="/" className="brand">BookTable</Link>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {user ? (
          // Conditional links shown only when a user is logged in
          <>
            {user.role === 'Customer' && (
              <Link to="/my-reservations">My Reservations</Link>
            )}

            {user.role === 'RestaurantManager' && (
              <Link to="/manager">Manager Dashboard</Link>
            )}

            {user.role === 'Admin' && (
              <Link to="/admin">Admin Dashboard</Link>
            )}

            {/* Display user info and logout option */}
            <span className="user-info">
              {user.full_name || user.email}
            </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          // Links shown to guests (not logged in)
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
