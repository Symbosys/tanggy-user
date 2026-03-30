import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetToLogin } from '../navigation/NavigationService';

const api = axios.create({
  // baseURL: 'https://api.mintafresh.com/api/v1/minta-fresh',
  baseURL: 'http://192.168.1.5:4000/api/v1/minta-fresh',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Attach token before each request
api.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);
// 🔐 Catch 401 Responses globally
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to Login
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userId');
      resetToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;
