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
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS || 15000)
});

export default api;
