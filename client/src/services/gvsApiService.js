// src/services/gvsApiService.js

import axios from 'axios';

// The API endpoint for your public offers list
const API_URL = 'https://gvs-cargo-dynamic.onrender.com/api/excels'; // Or your production URL

const api = axios.create({
    baseURL: API_URL,
});


export const getOffers = () => api.get('/list');