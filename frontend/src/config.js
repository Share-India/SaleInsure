// API base URL configuration
// For local development, this defaults to the backend server
// For production, the Vite build will use empty string because Nginx proxies /api and /uploads
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
