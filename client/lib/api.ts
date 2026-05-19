import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({ baseURL: '' });

api.interceptors.request.use((config) => {
  const token = Cookies.get('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const apiAuth = {
  login: (email: string, password: string) => api.post('/api/auth/login', { email, password }),
  verify: () => api.get('/api/auth/verify'),
};

export const apiProducts = {
  list: (params?: object) => api.get('/api/products', { params }),
  get: (id: string) => api.get(`/api/products/${id}`),
  create: (data: object) => api.post('/api/products', data),
  update: (id: string, data: object) => api.put(`/api/products/${id}`, data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
};

export const apiAI = {
  analyze: (imageUrl: string) => api.post('/api/ai/analyze', { imageUrl }),
  generateDescription: (product: object) => api.post('/api/ai/description', product),
  generateTags: (product: object) => api.post('/api/ai/tags', product),
};

export default api;
