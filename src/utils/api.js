import axios from 'axios';
import { readLocalOverrides } from '../config/loader';
import defaults from '../config/defaults.json';
import envOverrides from '../config/env.overrides';

// Construcción sin React (para instanciar axios)
function buildBaseURL() {
  let cfg = { ...defaults };
  cfg = { ...cfg, ...envOverrides() };
  const local = readLocalOverrides();
  if (local?.api?.baseURL) cfg.api.baseURL = local.api.baseURL;
  return cfg.api.baseURL || 'http://localhost:7245/api';
}

const api = axios.create({
  baseURL: buildBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000),
  withCredentials: false
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Cierre de sesión global en 401
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const lang = localStorage.getItem('lang') || 'es';
      // Redirige al login (si no estás ya allí)
      if (!location.pathname.includes('/login')) {
        window.location.href = `/login?lang=${lang}`;
      }
    }
    return Promise.reject(err);
  }
);

export default api;
