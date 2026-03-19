import axios from 'axios';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api/v1').replace(/\/$/, '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

function readCookie(name: string): string | undefined {
  const part = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  if (!part) return undefined;
  return decodeURIComponent(part.slice(name.length + 1));
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('moda_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const method = (config.method ?? 'get').toLowerCase();
  if (!['get', 'head', 'options'].includes(method)) {
    const csrfToken = readCookie('csrf_token');
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken;
    }
  }
  return config;
});
