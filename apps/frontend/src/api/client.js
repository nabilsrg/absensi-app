import axios from 'axios';
import { getToken } from '../auth/session.js';

const AUTH_BASE = import.meta.env.VITE_AUTH_API_BASE_URL || 'http://localhost:3001';
const ATTENDANCE_BASE =
  import.meta.env.VITE_ATTENDANCE_API_BASE_URL || 'http://localhost:3002';
const HR_BASE = import.meta.env.VITE_HR_API_BASE_URL || 'http://localhost:3003';

function resolveBase(url = '') {
  if (url.startsWith('/auth') || url.startsWith('/me')) return AUTH_BASE;
  if (url.startsWith('/attendance')) return ATTENDANCE_BASE;
  if (url.startsWith('/hr')) return HR_BASE;
  return AUTH_BASE;
}

export const api = axios.create();

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.baseURL && typeof config.url === 'string') {
    config.baseURL = resolveBase(config.url);
  }
  return config;
});
