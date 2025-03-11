import api from './config';

export const videosAPI = {
  createVideo: async (videoData) => {
    try {
      console.log('Creating video with data:', videoData);
      const response = await api.post('/videos', videoData);
      return response.data;
    } catch (error) {
      console.error('API Error - createVideo:', error);
      throw error;
    }
  },

  getAllVideos: async () => {
    try {
      const response = await api.get('/videos');
      return response.data;
    } catch (error) {
      console.error('API Error - getAllVideos:', error);
      throw error;
    }
  },

  getUserVideos: async (userId) => {
    try {
      const response = await api.get(`/videos/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getUserVideos:', error);
      throw error;
    }
  },

  likeVideo: async (videoId) => {
    try {
      const response = await api.post(`/videos/${videoId}/like`);
      return response.data;
    } catch (error) {
      console.error('API Error - likeVideo:', error);
      throw error;
    }
  },

  addComment: async (videoId, commentData) => {
    try {
      const response = await api.post(`/videos/${videoId}/comment`, commentData);
      return response.data;
    } catch (error) {
      console.error('API Error - addComment:', error);
      throw error;
    }
  },

  deleteVideo: async (videoId) => {
    try {
      const response = await api.delete(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('API Error - deleteVideo:', error);
      throw error;
    }
  },

  incrementViews: async (videoId) => {
    try {
      const response = await api.post(`/videos/${videoId}/view`);
      return response.data;
    } catch (error) {
      console.error('API Error - incrementViews:', error);
      throw error;
    }
  }
}; 