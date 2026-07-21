// src/api/axiosInstance.ts
import axios from 'axios';

// 1. Backend port used by Docker (ecommerce_backend container)
const BACKEND_PORT = 5731;

// 2. Safely get the current browser hostname (handles SSR environments too)
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

// 3. Determine base URL depending on where the app is being accessed from
let BASE_URL: string;

if (hostname.includes('nexcuscart.net') || hostname.includes('vercel.app')) {
  // Production (AWS EKS or Vercel)
  BASE_URL = 'https://nexcuscart.net';
} else {
  // Local + LAN (Docker)
  BASE_URL = `http://${hostname}:${BACKEND_PORT}`;
}
// 4. Create axios instance
const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

// Debug log — remove once confirmed working
console.log(`🚀 API is pointing to: ${BASE_URL}/api`);

// 5. Request interceptor — attach auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    console.log(`🌐 [axios] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// 6. Response interceptor — handle auth errors
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