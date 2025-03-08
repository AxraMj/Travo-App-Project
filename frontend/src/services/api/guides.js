import api from './config';

export const guidesAPI = {
  getAllGuides: async () => {
    try {
      const response = await api.get('/api/guides');
      return response.data;
    } catch (error) {
      console.error('API Error - getAllGuides:', error);
      throw error;
    }
  },

  getUserGuides: async (userId) => {
    try {
      const response = await api.get(`/api/guides/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getUserGuides:', error);
      throw error;
    }
  },

  createGuide: async (guideData) => {
    try {
      const response = await api.post('/api/guides', guideData);
      return response.data;
    } catch (error) {
      console.error('API Error - createGuide:', error);
      throw error;
    }
  },

  likeGuide: async (guideId) => {
    try {
      const response = await api.post(`/api/guides/${guideId}/like`);
      return response.data;
    } catch (error) {
      console.error('API Error - likeGuide:', error);
      throw error;
    }
  },

  dislikeGuide: async (guideId) => {
    try {
      const response = await api.post(`/api/guides/${guideId}/dislike`);
      return response.data;
    } catch (error) {
      console.error('API Error - dislikeGuide:', error);
      throw error;
    }
  },

  deleteGuide: async (guideId) => {
    try {
      const response = await api.delete(`/api/guides/${guideId}`);
      return response.data;
    } catch (error) {
      console.error('API Error - deleteGuide:', error);
      throw error;
    }
  }
}; 