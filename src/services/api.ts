import axios from 'axios';

// Base API configuration
export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  }
});
// Request interceptor: JWT token'ı Authorization header'ına ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('roster_auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

// Generic API service functions
export const apiService = {
  get: <T>(url: string) => api.get<T>(url).then(res => res.data),
  post: <T>(url: string, data?: any) => api.post<T>(url, data).then(res => res.data),
  put: <T>(url: string, data?: any) => api.put<T>(url, data).then(res => res.data),
  delete: (url: string) => api.delete(url).then(res => res.data),
};