import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Ajouter automatiquement le token admin si disponible
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password });

// Projets
export const getProjects = () => api.get('/projects');
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// Analytics
export const trackVisit = (sessionId, page) => api.post('/analytics/visit', { sessionId, page });
export const trackLeave = (sessionId, timeSpent) => api.put('/analytics/leave', { sessionId, timeSpent });
export const getStats = () => api.get('/analytics/stats');

// CV
export const downloadCV = () => `${API_BASE_URL}/cv/download`;
export const uploadCV = (formData) => api.post('/cv/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});