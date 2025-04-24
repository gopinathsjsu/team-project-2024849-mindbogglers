// src/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, getUserProfile } from './api';

// Create the Auth Context
export const AuthContext = createContext(); // Change to export directly

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Fetch user profile
          const userData = await getUserProfile();
          setUser(userData);
        } catch (err) {
          // Clear invalid token
          localStorage.removeItem('token');
          console.error('Auth validation error:', err);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const data = await apiLogin(credentials);
      
      // Save token to localStorage
      localStorage.setItem('token', data.access_token);
      
      // Get user data
      const userData = await getUserProfile();
      setUser(userData);
      
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

