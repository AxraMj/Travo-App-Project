import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Add token handling
const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

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

  createGuide: async (guideData) => {
    const response = await api.post('/guides', guideData);
    return response.data;
  },

  likeGuide: async (guideId) => {
    const response = await api.post(`/guides/${guideId}/like`);
    return response.data;
  },

  dislikeGuide: async (guideId) => {
    const response = await api.post(`/guides/${guideId}/dislike`);
    return response.data;
  },

  getGuides: async () => {
    const response = await api.get('/guides');
    return response.data;
  },

  updateProfile: async (profileData) => {
    try {
      const config = await getAuthHeader();
      
      // Only handle image upload if there's a new file:// image
      let imageUrl = profileData.profileImage;
      if (profileData.profileImage && profileData.profileImage.startsWith('file://')) {
        try {
          const base64Image = await FileSystem.readAsStringAsync(
            profileData.profileImage, 
            { encoding: FileSystem.EncodingType.Base64 }
          );
          imageUrl = `data:image/jpeg;base64,${base64Image}`;
        } catch (error) {
          console.error('Error processing image:', error);
          // Don't throw, just keep the existing image
          imageUrl = user?.profileImage || null;
        }
      }

      const response = await api.put('/auth/profile', {
        ...profileData,
        profileImage: imageUrl,
      }, config);

      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data?.message || 'Failed to update profile';
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

export const guideAPI = {
  createGuide: async (guideData) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token for guide creation:', token);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Create a new instance for this specific request
      const apiInstance = axios.create({
        baseURL: API_URL,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('Creating guide with data:', {
        text: guideData.text,
        category: guideData.category
      });

      const response = await apiInstance.post('/guides', guideData);
      console.log('Guide created successfully:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Guide creation error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });

      // Throw a more specific error message
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 400) {
        throw new Error(error.response.data.message || 'Invalid guide data');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to create guide');
      }
    }
  },

  getGuides: async () => {
    try {
      const config = await getAuthHeader();
      const response = await api.get('/guides', config);
      return response.data;
    } catch (error) {
      console.error('Get guides error:', error);
      throw error.response?.data?.message || 'Failed to fetch guides';
    }
  },

  getUserGuides: async (userId) => {
    try {
      const config = await getAuthHeader();
      const response = await api.get(`/guides/user/${userId}`, config);
      return response.data;
    } catch (error) {
      console.error('Get user guides error:', error);
      throw error.response?.data?.message || 'Failed to fetch user guides';
    }
  }
};

export const profileAPI = {
  getProfile: async (userId) => {
    try {
      const config = await getAuthHeader();
      const response = await api.get(`/profiles/${userId}`, config);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error.response?.data || error);
      throw error.response?.data?.message || 'Failed to fetch profile';
    }
  },

  updateProfile: async (profileData) => {
    try {
      const config = await getAuthHeader();
      
      // Handle image upload if there's a new image
      let imageUrl = profileData.profileImage;
      if (profileData.profileImage && profileData.profileImage.startsWith('file://')) {
        const formData = new FormData();
        formData.append('image', {
          uri: profileData.profileImage,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
        
        try {
          const uploadResponse = await api.post('/upload', formData, {
            ...config,
            headers: {
              ...config.headers,
              'Content-Type': 'multipart/form-data',
            },
          });
          imageUrl = uploadResponse.data.url;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          imageUrl = profileData.profileImage;
        }
      }

      // Update the endpoint to match the route in your backend
      const response = await api.put('/profiles/update', {  // Changed from '/profiles' to '/profiles/update'
        ...profileData,
        profileImage: imageUrl,
      }, config);

      return response.data;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error);
      throw error.response?.data?.message || 'Failed to update profile';
    }
  },

  updateStats: async (stats) => {
    try {
      const config = await getAuthHeader();
      const response = await api.put('/profiles/stats', { stats }, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 