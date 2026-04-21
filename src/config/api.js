/**
 * Centralized API configuration for the application.
 * Points to the production backend URL on Render or localhost for development.
 */

// Use VITE_API_URL if defined, otherwise fallback to localhost:5000/api
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Optional: specific base URL without /api if needed by some services
export const BASE_URL = API_BASE_URL.replace(/\/api$/, '') || 'http://localhost:5000';

export default API_BASE_URL;
