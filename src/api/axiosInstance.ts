// src/api/axiosInstance.ts
import axios from 'axios';

const BASE = 
  import.meta.env.VITE_API_BASE_URL||
  import.meta.env.VITE_API_FALLBACK_1   ||
  import.meta.env.VITE_API_FALLBACK_2   ;

const axiosInstance = axios.create({
  baseURL: `${BASE}/api`,   // → http://192.168.18.40:5000/api
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    // ✅ log every request so you can see exact URL being hit
    console.log(`🌐 [axios] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;