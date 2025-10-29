// src/services/gvsApiService.js

import axios from 'axios';

// The API endpoint for your public offers list
import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
    baseURL: `${API_BASE_URL}/excels`,
});


export const getOffers = () => api.get('/list');