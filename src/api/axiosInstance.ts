// src/api/axiosInstance.ts
import axios from 'axios';

// 1. Backend port for local Docker development ONLY
const BACKEND_PORT = 5731;

// 2. Get current hostname safely
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

// 3. Determine base URL
let BASE_URL: string;

if (import.meta.env.VITE_BACKEND_URL) {
  // Best practice: Read directly from environment variable if configured
  BASE_URL = import.meta.env.VITE_BACKEND_URL;
} else if (hostname === 'localhost' || hostname === '127.0.0.1') {
  // Local Docker development
  BASE_URL = `http://${hostname}:${BACKEND_PORT}`;
} else {
  // Kubernetes / EKS Production (uses standard ingress port 80/443)
  BASE_URL = 'https://nexcuscart.net'; 
  // OR dynamically: BASE_URL = `${window.location.protocol}//${hostname}`;
}

// 4. Create axios instance
const axiosInstance = axios.create({
  baseURL: `${BASE_URL.replace(/\/$/, '')}/api`,
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