import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Example: if your IP is 192.168.1.5
const API_URL = 'http://192.168.31.117:5000/api';  // Replace with YOUR IP

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Add request interceptor to automatically add token
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // You might want to add navigation to login screen here
    }
    return Promise.reject(error);
  }
);

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
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Error getting auth header:', error);
    throw error;
  }
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
      const response = await api.post('/guides', guideData);
      return response.data;
    } catch (error) {
      console.error('Guide creation error:', error);
      throw error.response?.data?.message || 'Failed to create guide';
    }
  },

  getGuides: async () => {
    try {
      const response = await api.get('/guides');
      return response.data;
    } catch (error) {
      console.error('Get guides error:', error);
      throw error.response?.data?.message || 'Failed to fetch guides';
    }
  },

  getUserGuides: async (userId) => {
    try {
      const response = await api.get(`/guides/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user guides error:', error);
      throw error.response?.data?.message || 'Failed to fetch guides';
    }
  },

  deleteGuide: async (guideId) => {
    try {
      const response = await api.delete(`/guides/${guideId}`);
      return response.data;
    } catch (error) {
      console.error('Delete guide error:', error);
      if (error.response) {
        throw error.response.data.message;
      } else if (error.request) {
        throw 'Network error - please check your connection';
      } else {
        throw 'Failed to delete guide';
      }
    }
  }
};

export const profileAPI = {
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/profiles/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error.response?.data?.message || 'Failed to fetch profile';
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/profiles/update', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data?.message || 'Failed to update profile';
    }
  },

  updateStats: async (stats) => {
    try {
      const response = await api.put('/profiles/stats', { stats });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Post APIs
export const postAPI = {
  createPost: async (postData) => {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      console.error('Post creation error:', error);
      throw error.response?.data?.message || 'Failed to create post';
    }
  },

  getAllPosts: async () => {
    const response = await api.get('/posts');
    return response.data;
  },

  getUserPosts: async (userId) => {
    const response = await api.get(`/posts/user/${userId}`);
    return response.data;
  },

  likePost: async (postId) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  },

  addComment: async (postId, text) => {
    const response = await api.post(`/posts/${postId}/comment`, { text });
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  }
}; 