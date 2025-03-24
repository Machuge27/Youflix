import api from './api';
import { setToken } from '../utils/storage';

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('accounts/login/', { 
        username, 
        password 
      });
      
      // Store tokens
      setToken(response.data.access, response.data.refresh);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Login failed' };
    }
  },

  async register(userData) {
    try {
      const response = await api.post('accounts/register/', userData);
      
      // Store tokens
      setToken(response.data.access, response.data.refresh);
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Registration failed' };
    }
  },

  async getUserProfile() {
    try {
      const response = await api.get('accounts/profile/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Failed to fetch profile' };
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.patch('accounts/profile/update/', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { detail: 'Profile update failed' };
    }
  },

  logout() {
    // Remove tokens and redirect
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }
};