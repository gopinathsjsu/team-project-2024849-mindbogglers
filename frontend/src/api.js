// src/api.js
import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:3000/api', // Updated to 3000 since the app is on port 3000
    headers: {
        'Content-Type': 'application/json',
    },
});

// Axios interceptor for centralized error handling
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            return Promise.reject({
                status: error.response.status,
                message: error.response.data.message || 'An error occurred',
            });
        }
        return Promise.reject({ message: 'Network Error' });
    }
);

// API functions

// Search restaurants
export const searchRestaurants = async (searchParams) => {
    try {
        const response = await instance.post('/restaurants/search', searchParams);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Book a table
export const bookTable = async (bookingData) => {
    try {
        const response = await instance.post('/bookings', bookingData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
    try {
        const response = await instance.delete(`/bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Login a user
export const loginUser = async (credentials) => {
    try {
        const response = await instance.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Register a user
export const registerUser = async (userData) => {
    try {
        const response = await instance.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Dashboard Analytics for Admins
export const getDashboardAnalytics = async () => {
    try {
        const response = await instance.get('/dashboard/analytics');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// List pending restaurants awaiting approval
export const getPendingRestaurants = async () => {
    try {
        const response = await instance.get('/restaurants/pending');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Approve a restaurant (Admin)
export const approveRestaurant = async (restaurantId) => {
    try {
        const response = await instance.put(`/restaurants/approve/${restaurantId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Remove a restaurant (Admin)
export const removeRestaurant = async (restaurantId) => {
    try {
        const response = await instance.delete(`/restaurants/${restaurantId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get restaurants owned by the Restaurant Manager
export const getManagerRestaurants = async () => {
    try {
        const response = await instance.get('/manager/restaurants');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Add or update a restaurant listing (Restaurant Manager)
export const addRestaurantListing = async (data) => {
    try {
        const response = await instance.post('/manager/restaurants', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get details for a specific restaurant
export const getRestaurantDetails = async (id) => {
    try {
        const response = await instance.get(`/restaurants/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};
