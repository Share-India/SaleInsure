import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userString) {
        const user = JSON.parse(userString);
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
