import axios from 'axios';
import { setupInterceptors } from './interceptor';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Apply interceptors
setupInterceptors(apiClient);

export const getImageUrl = (path: string | null | undefined) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Extract base URL from API URL (e.g. http://localhost:5000/api -> http://localhost:5000)
  const base = baseURL.replace(/\/api(\/v1)?\/?$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};
