import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Don't set Content-Type for FormData - let axios auto-detect
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Authentication API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
};

// Routes API
export const routesAPI = {
  getAll: () => api.get('/routes'),
  getById: (id) => api.get(`/routes/${id}`),
  create: (data) => api.post('/routes', data),
  update: (id, data) => api.patch(`/routes/${id}`, data),
  delete: (id) => api.delete(`/routes/${id}`)
};

// Schedules API
export const schedulesAPI = {
  getByRoute: (routeId) => api.get(`/schedules/route/${routeId}`),
  create: (data) => api.post('/schedules', data),
  update: (id, data) => api.patch(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`)
};

// Reports API
export const reportsAPI = {
  getAll: (params) => api.get('/reports', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  create: (formData) => api.post('/reports', formData),
  getUserReports: () => api.get('/reports/user/my-reports'),
  updateStatus: (id, status) => api.patch(`/reports/${id}/status`, { status }),
  delete: (id) => api.delete(`/reports/${id}`)
};

// Monitoring API
export const monitoringAPI = {
  getAll: () => api.get('/monitoring'),
  getByRoute: (routeId) => api.get(`/monitoring/route/${routeId}`),
  getByVehicle: (vehicleId) => api.get(`/monitoring/vehicle/${vehicleId}`),
  updateVehicle: (data) => api.post('/monitoring/update', data)
};

export default api;
