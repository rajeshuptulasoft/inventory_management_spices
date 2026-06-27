import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const isAuthRoute = (url = '') =>
  url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/register');

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const shouldRefresh =
      error.response?.status === 401 &&
      !original._retry &&
      !isAuthRoute(original.url) &&
      localStorage.getItem('accessToken');

    if (shouldRefresh) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      } else {
        localStorage.removeItem('accessToken');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
