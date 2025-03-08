import api from './config';

export const profileAPI = {
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/api/profiles/${userId}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getProfile:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/api/profiles/update', profileData);
      return response.data;
    } catch (error) {
      console.error('API Error - updateProfile:', error);
      throw error;
    }
  },

  updateStats: async (statsData) => {
    try {
      const response = await api.put('/api/profiles/stats', statsData);
      return response.data;
    } catch (error) {
      console.error('API Error - updateStats:', error);
      throw error;
    }
  }
}; 