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

// ===== AUTH =====
export const login = (email, password) => api.post('/auth/login', { email, password });

// ===== PROJETS =====
export const getProjects = () => api.get('/projects');
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// ===== ANALYTICS =====
export const trackVisit = (sessionId, page) => api.post('/analytics/visit', { sessionId, page });
export const trackLeave = (sessionId, timeSpent) => api.put('/analytics/leave', { sessionId, timeSpent });
export const getStats = () => api.get('/analytics/stats');

// ===== PROFIL =====
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const uploadPhoto = (formData) => api.post('/profile/photo', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deletePhoto = () => api.delete('/profile/photo');
export const updateSkills = (skills) => api.put('/profile/skills', { skills });
export const updateExperiences = (experiences) => api.put('/profile/experiences', { experiences });
export const updateFormations = (formations) => api.put('/profile/formations', { formations });
export const updateContacts = (contacts) => api.put('/profile/contacts', { contacts });

// ===== CV =====
export const downloadCV = () => `${API_BASE_URL}/profile/cv/download`;

// Export default pour utilisation directe (api.post, api.get, etc.)
export default api;