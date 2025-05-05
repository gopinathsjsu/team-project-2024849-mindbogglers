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
            email: credentials.email,
            password: credentials.password
        });
        
        // Store token in localStorage
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            
            // Store user ID if available
            if (response.data.user_id) {
                localStorage.setItem('userId', response.data.user_id);
            }
        }
        
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await instance.post('/users/register', userData);
        
        // Store token in localStorage after registration
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
            
            // Store user ID if available
            if (response.data.user_id) {
                localStorage.setItem('userId', response.data.user_id);
            }
        }
        
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

// Updated bookTable function
export const bookTable = async (bookingData) => {
    try {
        console.log('API bookTable called with:', bookingData);
        
        // First ensure we have the proper authentication
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token is missing. Please log in.');
        }
        
        // Ensure instance has the latest token
        instance.defaults.headers['Authorization'] = `Bearer ${token}`;
        
        // Check if restaurantId is provided
        if (!bookingData.restaurantId) {
            throw new Error('Restaurant ID is required for booking');
        }
        
        // Make the API call
        const response = await instance.post(
            `/restaurants/${bookingData.restaurantId}/book`, 
            bookingData
        );
        
        console.log('Booking API response:', response.data);
        return response.data;
    } catch (error) {
        console.error('BookTable API error:', error);
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

// New direct method to get restaurant by ID
export const getRestaurantById = async (id) => {
    try {
        console.log(`Fetching restaurant with ID: ${id}`);
        const response = await instance.get(`/restaurants/${id}`);
        console.log('API response:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Error fetching restaurant with ID ${id}:`, error);
        throw error;
    }
};

// Restaurant details - MODIFIED to use search endpoint
export const getRestaurantDetails = async (id) => {
    try {
        // First try using the direct method
        try {
            return await getRestaurantById(id);
        } catch (directError) {
            console.error('Direct endpoint failed, trying search endpoint as fallback');
            
            // If direct method fails, try using the search endpoint
            const response = await instance.get('/restaurants/search', { 
                params: { restaurant_id: id } 
            });
            
            // Check if we got results
            if (Array.isArray(response.data) && response.data.length > 0) {
                const data = response.data[0];
                
                // Format the address
                return {
                    ...data,
                    address: {
                        street: '',  // Street info not available from search
                        city: data.city || '',
                        state: data.state || '',
                        zipCode: data.zip_code || ''
                    },
                    contactEmail: data.email || '',
                    contact: data.contact || data.phone || ''
                };
            } else {
                // If search doesn't return results, try the availability endpoint
                console.error('Search endpoint failed, using availability as fallback');
                
                const availabilityResponse = await instance.get('/restaurants/availability', {
                    params: {
                        date: new Date().toISOString().split('T')[0],
                        time: '19:00',
                        people: 2
                    }
                });
                
                const restaurant = availabilityResponse.data.find(r => r.restaurant_id == id);
                
                if (restaurant) {
                    return {
                        id: restaurant.restaurant_id,
                        name: restaurant.restaurant_name,
                        cuisine: restaurant.cuisine,
                        cost_rating: restaurant.cost_rating,
                        rating: restaurant.rating,
                        city: restaurant.city,
                        address: {
                            street: '',
                            city: restaurant.city || '',
                            state: '',
                            zipCode: ''
                        }
                    };
                }
                
                throw new Error('Restaurant not found');
            }
        }
    } catch (error) {
        console.error('Error fetching restaurant details:', error);
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