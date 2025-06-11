import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors and token cleanup
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If token is invalid or expired, clear it and redirect to login
    if (error.response?.status === 401) {
      const errorData = error.response.data;
      
      // If backend signals to clear token
      if (errorData?.clearToken) {
        localStorage.removeItem('token');
        // Reload page to trigger login screen
        window.location.reload();
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Validate token before storing
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      // Clear any existing corrupted token
      localStorage.removeItem('token');
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Validate token before storing
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      // Clear any existing corrupted token
      localStorage.removeItem('token');
      throw error;
    }
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  updateSkills: async (skills) => {
    const response = await api.put('/auth/skills', { skills });
    return response.data;
  }
};

// Enhanced Library API calls with real-time support
export const libraryAPI = {
  getLibraries: async () => {
    const response = await api.get('/library');
    return response.data;
  },
  
  getLibraryStatus: async (libraryId) => {
    const response = await api.get(`/library/${libraryId}/status`);
    return response.data;
  },
  
  bookSeat: async (libraryId, seatNumber) => {
    const response = await api.post('/library/book', { libraryId, seatNumber });
    return response.data;
  },
  
  leaveSeat: async (bookingId) => {
    const response = await api.delete(`/library/leave/${bookingId}`);
    return response.data;
  },
  
  getBookings: async () => {
    const response = await api.get('/library/bookings');
    return response.data;
  }
};

// Event API calls
export const eventAPI = {
  getEvents: async () => {
    const response = await api.get('/events');
    return response.data;
  },
  
  bookSeat: async (eventId, seatId) => {
    const response = await api.post('/events/book', { eventId, seatId });
    return response.data;
  }
};

// Skill API calls
export const skillAPI = {
  searchUsers: async (skill) => {
    const response = await api.get(`/skills/search?skill=${encodeURIComponent(skill)}`);
    return response.data;
  },
  
  getAllUsers: async () => {
    const response = await api.get('/skills/users');
    return response.data;
  }
};

// Health check API
export const healthAPI = {
  checkStatus: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;