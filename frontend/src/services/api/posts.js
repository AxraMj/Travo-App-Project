import api from './config';

export const postsAPI = {
  createPost: async (postData) => {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      console.error('API Error - createPost:', error);
      throw error;
    }
  },

  getAllPosts: async () => {
    try {
      const response = await api.get('/posts');
      return response.data;
    } catch (error) {
      console.error('API Error - getAllPosts:', error);
      throw error;
    }
  },

  getUserPosts: async (userId) => {
    try {
      const response = await api.get(`/posts/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('API Error - getUserPosts:', error);
      throw error;
    }
  },

  likePost: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('API Error - likePost:', error);
      throw error;
    }
  },

  addComment: async (postId, text) => {
    try {
      const response = await api.post(`/posts/${postId}/comment`, { text });
      return response.data;
    } catch (error) {
      console.error('API Error - addComment:', error);
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('API Error - deletePost:', error);
      throw error;
    }
  }
}; 