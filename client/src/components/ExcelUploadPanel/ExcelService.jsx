import axios from 'axios';

const API_URL = 'https://gvs-cargo-dynamic.onrender.com/api/excels';

// Create a new Axios instance
const api = axios.create({
    baseURL: API_URL,
});

// ===================================================================
// ✨ THE FIX: Add the Request Interceptor
// This is the missing piece. It automatically adds the auth adminToken to
// every request made with the `api` instance.
// ===================================================================
api.interceptors.request.use(
    (config) => {
        const adminToken = localStorage.getItem('adminToken');
     
        if (adminToken) {
            // This will correctly create "Authorization: Bearer eyJ..."
            config.headers['Authorization'] = `Bearer ${adminToken}`;
        }
        return config;
    },
    (error) => {
        // Handle any request errors
        return Promise.reject(error);
    }
);


// Your exported functions below will now automatically be authenticated.
// NO OTHER CHANGES ARE NEEDED IN THIS FILE.

export const getFiles = () => api.get('/list');

export const uploadFile = (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('excelFile', file);
    return api.post('/upload', formData, {
        onUploadProgress,
    });
};

export const processFile = (id) => api.post(`/process/${id}`);

export const renameFile = (id, newName) => api.put(`/rename/${id}`, { newName });

export const deleteFile = (id) => api.delete(`/delete/${id}`);