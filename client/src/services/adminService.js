// Platform-admin API client. Deliberately separate from services/api.js: admin
// auth is a different realm (registry-level token, no tenantCode, no institution
// header, no refresh flow). Token lives under its own localStorage key so it
// never collides with a tenant session.
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV && import.meta.env.VITE_USE_PROXY !== 'false' ? '/api' : 'https://mobius-t071.onrender.com/api');

const adminApi = axios.create({ baseURL, headers: { 'Content-Type': 'application/json' }, timeout: 15000 });

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && !location.pathname.endsWith('/admin/login')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('admin');
      // ?expired=1 → the login page explains the 120-min token quietly ended
      location.assign('/admin/login?expired=1');
    }
    return Promise.reject(err);
  }
);

const adminService = {
  isAuthed: () => !!localStorage.getItem('adminToken'),
  currentAdmin: () => { try { return JSON.parse(localStorage.getItem('admin')); } catch { return null; } },

  login: async (email, password) => {
    const { data } = await adminApi.post('/admin/login', { email, password });
    localStorage.setItem('adminToken', data.accessToken);
    localStorage.setItem('admin', JSON.stringify(data.admin));
    return data.admin;
  },
  logout: () => { localStorage.removeItem('adminToken'); localStorage.removeItem('admin'); },

  listInstitutions: async () => (await adminApi.get('/admin/institutions')).data,
  provision: async (payload) => (await adminApi.post('/admin/institutions', payload)).data,
  setStatus: async (code, isActive) =>
    (await adminApi.patch(`/admin/institutions/${code}/status`, { is_active: isActive })).data,
  // confirm must be re-typed by the admin; the server re-verifies it too.
  deleteInstitution: async (code, confirmCode) =>
    (await adminApi.delete(`/admin/institutions/${code}`, { data: { confirm_code: confirmCode } })).data,
  getConfig: async (code) => (await adminApi.get(`/admin/institutions/${code}/config`)).data,
  patchConfig: async (code, patch) => (await adminApi.patch(`/admin/institutions/${code}/config`, patch)).data,
  finance: async () => (await adminApi.get('/admin/finance')).data,
};

export default adminService;
