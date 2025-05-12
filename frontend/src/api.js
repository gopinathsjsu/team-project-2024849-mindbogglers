import axios from 'axios';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE, // ✅ Uses env variable now
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
        // Remove empty strings from params
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v !== '')
        );

        const response = await instance.get('/restaurants/availability', {
            params: cleanParams
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};



export const getRestaurantReviews = async (id) => {
  const res = await fetch(`http://localhost:8000/restaurants/${id}/reviews`);
  if (!res.ok) {
    console.error("Failed to fetch reviews:", res.status);
    throw new Error('Failed to fetch reviews');
  }
  const data = await res.json();
  console.log("Fetched reviews:", data);
  return data;
};


export const cancelReservation = async (reservationId) => {
    try {
        const response = await instance.delete(`/restaurants/reservations/${reservationId}/cancel`);
        return response.data;
    } catch (error) {
        console.error('Error cancelling reservation:', error.response?.data || error.message);
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

export const addRestaurant = async (restaurantData) => {
    try {
        const response = await instance.post('/manager/restaurants', restaurantData);
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

export const uploadPhoto = async (restaurantId, formData) => {
    try {
        const response = await instance.post(
            `/manager/restaurants/${restaurantId}/photos`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
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

export const fetchReservationAnalytics = getAnalytics;


export const getMyRestaurants = async () => {
    try {
        const response = await instance.get('/manager/my-restaurants');
        return response.data;
    } catch (error) {
        throw error;
    }
};


// In api.js
export const createReservation = async (restaurantId, bookingData) => {
    try {
        const response = await instance.post(`/restaurants/${restaurantId}/book`, bookingData);
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