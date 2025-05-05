// src/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, getUserProfile, registerUser } from './api';

// Create the Auth Context
export const AuthContext = createContext();

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
      let data;
      
      // Check if we received token data directly or need to make API call
      if (credentials.access_token) {
        data = credentials;
      } else {
        data = await apiLogin(credentials);
      }
      
      // Save token to localStorage
      console.log('Login data:', data);
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

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const data = await registerUser(userData);
      
      // Save token to localStorage
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        
        // Get user profile after registration
        const userProfile = await getUserProfile();
        setUser(userProfile);
        return userProfile;
      } else {
        throw new Error('Registration successful but no token received');
      }
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
    register,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};