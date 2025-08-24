// src/services/apiService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Or your production URL

const apiService = axios.create({
    baseURL: API_URL,
});

// The magic interceptor that authenticates EVERY request made with this service
apiService.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiService;