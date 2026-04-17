import axios from 'axios';

// Determine base URL dynamically based on environment
const baseURL = import.meta.env.MODE === 'development' 
  ? 'http://192.168.18.40:5173' 
  : import.meta.env.VITE_API_BASE_URL || 'https://shoppingstore-backend.vercel.app';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL,
  timeout: 10000, // 10 seconds
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Optionally add authorization token or other custom headers here
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized, 500 Server Error)
    if (error.response?.status === 401) {
      console.error('Unauthorized, logging out...');
      // Implement logout logic here, e.g., clear localStorage & redirect
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
