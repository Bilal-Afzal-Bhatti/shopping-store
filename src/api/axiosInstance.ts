// src/api/axiosInstance.ts
import axios from 'axios';
const isDev = import.meta.env.DEV;

// Define your URLs clearly
const LOCAL_API = "http://192.168.18.40:5173"; // Your local backend IP/Port
const VITE_API_BASE_URL = "https://shoppingstore-backend.vercel.app"; // Your Vercel backend

// Automatically choose the base
const BASE = isDev ? LOCAL_API : VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: `${BASE}/api`, 
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