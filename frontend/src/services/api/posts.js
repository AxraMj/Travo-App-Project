import api from './config';

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
  },

  likePost: async (postId) => {
    const response = await api.post(`/api/posts/${postId}/like`);
    return response.data;
  },

  addComment: async (postId, comment) => {
    const response = await api.post(`/api/posts/${postId}/comment`, { text: comment });
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/api/posts/${postId}`);
    return response.data;
  }
}; 