import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';

const API_BASE_URL = process.env.BASE_URL || 'https://mrsgrace.pythonanywhere.com/';
// const API_BASE_URL = 'http://192.168.100.6:8000/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid, logout user
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;