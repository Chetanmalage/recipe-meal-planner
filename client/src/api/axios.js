import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
    } catch {
      localStorage.removeItem('user');
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;
    const requestUrl = error.config?.url || '';
    const message = !error.response
      ? "We couldn't reach the kitchen. Check your connection and try again."
      : status >= 500
        ? 'Something went wrong on our side. Please try again shortly.'
        : status === 404
          ? "We couldn't find that recipe or item."
          : status === 429
            ? 'Please wait a moment before trying again.'
            : backendMessage || 'Please try again.';

    if (error.response?.status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }

    const silent = ['/auth/login', '/auth/register', '/auth/google'].some((path) => requestUrl.includes(path));
    const readHandledInline = (window.location.pathname === '/' && requestUrl.includes('/recipes'))
      || window.location.pathname.startsWith('/recipe/');
    if (!silent && !readHandledInline && error.code !== 'ERR_CANCELED') toast.error(message);
    return Promise.reject(error);
  },
);

export default api;
