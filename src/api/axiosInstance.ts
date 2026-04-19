// src/api/axiosInstance.ts
import axios from 'axios';
// axiosInstance.ts

// 1. Determine if we are on Vercel or Local
// 'window.location.hostname' tells us exactly where the user is browsing from
const hostname = window.location.hostname;
const isVercel = hostname.includes("vercel.app");

// 2. Define your Backend URLs
// IMPORTANT: Change 5000 to your ACTUAL backend port (check your terminal where backend runs)
const LOCAL_BACKEND_URL = import.meta.env.VITE_API_FALLBACK_1; 
const VERCEL_BACKEND_URL = import.meta.env.VITE_API_BASE_URL;

// 3. Select the correct base based on the current environment
const BASE_URL = isVercel ? VERCEL_BACKEND_URL : LOCAL_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

// Log for debugging (you can remove this later)
console.log(`🚀 API is pointing to: ${BASE_URL}/api`);


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