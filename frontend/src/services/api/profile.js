import api from './config';

export const profileAPI = {
  getProfile: async (userId) => {
    try {
      const response = await api.get(`/profiles/${userId}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getProfile:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/profiles/update', profileData);
      return response.data;
    } catch (error) {
      console.error('API Error - updateProfile:', error);
      throw error;
    }
  },

  updateStats: async (stats) => {
    try {
      const response = await api.put('/profiles/stats', { stats });
      return response.data;
    } catch (error) {
      console.error('API Error - updateStats:', error);
      throw error;
    }
  }
}; 