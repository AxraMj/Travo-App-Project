import axios from 'axios';
import * as FileSystem from 'expo-file-system';

// Example: if your IP is 192.168.1.5
const API_URL = 'http://192.168.31.117:5000/api';  // Replace with YOUR IP

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Add timeout
});

// Add request/response interceptors for better debugging
api.interceptors.request.use(
  config => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data
    });
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  response => {
    console.log('API Response:', response.data);
    return response;
  },
  error => {
    console.error('Response Error:', error.response || error);
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData) => {
    try {
      console.log('Starting registration process...');
      
      // Handle profile image
      let imageData = null;
      if (userData.profileImage) {
        try {
          const base64Image = await FileSystem.readAsStringAsync(
            userData.profileImage, 
            { encoding: FileSystem.EncodingType.Base64 }
          );
          imageData = `data:image/jpeg;base64,${base64Image}`;
        } catch (error) {
          console.error('Error processing image:', error);
          throw new Error('Failed to process profile image');
        }
      }

      // Prepare registration data
      const registrationData = {
        ...userData,
        profileImage: imageData
      };

      console.log('Sending registration request...');
      const response = await api.post('/auth/register', registrationData);
      console.log('Registration successful');
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        throw error.response.data.message || 'Registration failed';
      }
      throw error.message || 'Registration failed';
    }
  },

  login: async (credentials) => {
    try {
      console.log('Attempting to login:', API_URL + '/auth/login');
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Login failed. Please try again.';
    }
  },

  requestPasswordReset: async (data) => {
    try {
      console.log('Requesting password reset:', data);
      const response = await api.post('/auth/request-reset', data);
      console.log('Reset request response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Reset request error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Failed to process request';
    }
  },

  resetPassword: async (data) => {
    try {
      console.log('Resetting password:', data);
      const response = await api.post('/auth/reset-password', data);
      console.log('Reset password response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error.response?.data || error.message);
      throw error.response?.data?.message || 'Failed to reset password';
    }
  },
};

export const postsAPI = {
  getPosts: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/posts`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserPosts: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/posts/user/${userId}`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 