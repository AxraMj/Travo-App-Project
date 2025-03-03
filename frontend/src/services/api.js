import axios from 'axios';

// Example: if your IP is 192.168.1.5
const API_URL = 'http://192.168.31.117:5000/api';  // Replace with YOUR IP

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add timeout
});

// Add error logging
api.interceptors.request.use(
  config => {
    console.log('Making request to:', config.url);
    return config;
  },
  error => {
    console.log('Request error:', error);
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    try {
      // Log the URL we're trying to reach
      console.log('Attempting to connect to:', API_URL + '/auth/register');
      
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      // More detailed error logging
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
}; 