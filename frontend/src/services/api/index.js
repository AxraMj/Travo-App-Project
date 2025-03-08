import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure base URL - update this with your actual backend URL
const API_URL = 'http://192.168.31.117:5000'; // Use your IP address from server.js

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API services
export const postsAPI = {
  getAllPosts: async () => {
    try {
      const response = await api.get('/api/posts');
      return response.data;
    } catch (error) {
      console.error('API Error - getAllPosts:', error);
      throw error;
    }
  },

  getUserPosts: async (userId) => {
    try {
      const response = await api.get(`/api/posts/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getUserPosts:', error);
      throw error;
    }
  },

  createPost: async (postData) => {
    try {
      const response = await api.post('/api/posts', postData);
      return response.data;
    } catch (error) {
      console.error('API Error - createPost:', error);
      throw error;
    }
  }
};

export const authAPI = {
  // ... your existing auth API methods
};

export default api;

export { postsAPI } from './posts';
export { default as api } from './config'; 