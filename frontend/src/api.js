import axios from 'axios';

// Update the baseURL to point to your FastAPI backend
const instance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token in requests
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            return Promise.reject({
                status: error.response.status,
                message: error.response.data.detail || 'An error occurred',
            });
        }
        return Promise.reject({ message: 'Network Error' });
    }
);

// Auth API functions
export const login = async (credentials) => {
    try {
        console.log('Logging in with credentials:', credentials.email);
        const response = await instance.post('/users/login', {
            email: credentials.email, // FastAPI uses 'username' for the email field
            password: credentials.password
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await instance.post('/users/register', userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getUserProfile = async () => {
    try {
        const response = await instance.get('/users/me');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Restaurant API functions
export const searchRestaurants = async (params) => {
    try {
        // Convert to query parameters for GET request
        const response = await instance.get('/restaurants/search', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRestaurantAvailability = async (params) => {
    try {
        const response = await instance.get('/restaurants/availability', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRestaurantReviews = async (restaurantId) => {
    try {
        const response = await instance.get(`/restaurants/${restaurantId}/reviews`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const bookTable = async (restaurantId) => {
    try {
        console.log(restaurantId)
        const response = await instance.post(`/restaurants/${restaurantId.restaurantId}/book`, restaurantId);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const cancelReservation = async (reservationId) => {
    try {
        const response = await instance.delete(`/restaurants/cancel/${reservationId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getMyReservations = async () => {
    try {
        const response = await instance.get('/restaurants/my-reservations');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addReview = async (restaurantId, reviewData) => {
    try {
        const response = await instance.post(`/restaurants/${restaurantId}/reviews`, reviewData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Restaurant Manager API functions
export const addRestaurant = async (restaurantData) => {
    try {
        const response = await instance.post('/restaurants/add', restaurantData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateRestaurant = async (restaurantId, restaurantData) => {
    try {
        const response = await instance.put(`/manager/restaurants/${restaurantId}`, restaurantData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addTable = async (restaurantId, tableData) => {
    try {
        const response = await instance.post(`/manager/restaurants/${restaurantId}/tables`, tableData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateTable = async (tableId, tableData) => {
    try {
        const response = await instance.put(`/manager/tables/${tableId}`, tableData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const uploadPhoto = async (restaurantId, photoData) => {
    try {
        const response = await instance.post(`/manager/restaurants/${restaurantId}/photos`, photoData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Admin API functions
export const getPendingApprovals = async () => {
    try {
        const response = await instance.get('/admin/restaurants/pending');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateApprovalStatus = async (approvalId, statusData) => {
    try {
        const response = await instance.put(`/admin/restaurants/${approvalId}/status`, statusData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const removeRestaurant = async (restaurantId) => {
    try {
        const response = await instance.delete(`/admin/restaurants/${restaurantId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getAnalytics = async (timeframe = 'month') => {
    try {
        const response = await instance.get(`/admin/analytics/reservations`, {
            params: { timeframe }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Auth aliases
export const loginUser = login;
export const registerUser = register;

// Reservation alias
export const cancelBooking = cancelReservation;

// Admin aliases
export const getDashboardAnalytics = getAnalytics;
export const getPendingRestaurants = getPendingApprovals;
export const approveRestaurant = updateApprovalStatus;

// Restaurant details alias
export const getRestaurantDetails = (id) => {
    return searchRestaurants({ restaurant_id: id });
};