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
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    const requestUrl = error.config?.url || '';

    if (error.response?.status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }

    const silent = ['/auth/login', '/auth/register'].some((path) => requestUrl.includes(path));
    if (!silent) toast.error(message);
    return Promise.reject(error);
  },
);

export default api;
