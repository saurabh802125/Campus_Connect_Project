import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
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

// Library API calls
export const libraryAPI = {
  getLibraries: async () => {
    const response = await api.get('/library');
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
    const response = await api.get(`/skills/search?skill=${skill}`);
    return response.data;
  },
  getAllUsers: async () => {
    const response = await api.get('/skills/users');
    return response.data;
  }
};

export default api;