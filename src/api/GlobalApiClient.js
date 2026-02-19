import axios from 'axios';

// Create axios instance for the entire application
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simple, reliable 401 handler
const handle401 = () => {
  console.log('🔐 401 detected - cleaning up and redirecting...');
  
  // Clear all localStorage
  const keysToRemove = [
    'authToken', 'token', 'userData', 'user', 'isAuthenticated',
    'businessToken', 'refreshToken', 'userSession', 'persist:root',
    'tokenExpiresAt', 'tokenExpiresIn', 'tokenType', 'error'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Force reload to login page
  window.location.href = '/login';
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - simplified
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🚨 401 UNAUTHORIZED - Logging out immediately');
      handle401();
    }
    return Promise.reject(error);
  }
);

export default apiClient;