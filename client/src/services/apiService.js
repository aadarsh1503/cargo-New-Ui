// src/services/apiService.js
import axios from 'axios';

import { API_BASE_URL } from '../config/apiConfig';

const apiService = axios.create({
    baseURL: API_BASE_URL,
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