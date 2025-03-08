import api from './config';

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('API Error - login:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('API Error - register:', error);
      throw error;
    }
  },

  // Add more auth-related endpoints as needed
}; 