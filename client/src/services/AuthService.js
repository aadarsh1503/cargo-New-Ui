import axios from 'axios';

// Ensure your backend is running on the correct port (e.g., 5000)
import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({
    baseURL: API_BASE_URL,
});

/**
 * Logs a user in.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<AxiosResponse<any>>} The axios response promise.
 */
export const login = (username, password) => {
    return api.post('/login', { username, password });
};

/**
 * Signs up a new user.
 * The backend defaults the role to 'user', but we can be explicit.
 * For an admin panel, you might want to create admins separately.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<AxiosResponse<any>>} The axios response promise.
 */
export const signup = (username, password) => {
    return api.post('/signup', { username, password, role: 'admin' }); // Signing up as admin
};