import api from './api';

const videoService = {
  async saveVideo(videoData) {
    try {
      const response = await api.post('videos/save/', videoData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to save video' };
    }
  },

  async getVideos(filters = {}) {
    try {
      const response = await api.get('mark/', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch videos' };
    }
  },

  async getVideoById(videoId) {
    try {
      const response = await api.get(`videos/${videoId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch video' };
    }
  },

  async updateVideoProgress(videoId, progressData) {
    try {
      const response = await api.patch(`videos/${videoId}/progress/`, progressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to update video progress' };
    }
  },

  async deleteVideo(videoId) {
    try {
      await api.delete(`videos/${videoId}/`);
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to delete video' };
    }
  }
};

export default videoService;