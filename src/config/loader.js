import defaults from './defaults.json';
import envOverrides from './env.overrides';

const LS_KEY = 'APP_CONFIG_OVERRIDES';

// merge profundo simple
function deepMerge(target, source) {
  const out = Array.isArray(target) ? [...target] : { ...target };
  if (!source) return out;
  for (const [k, v] of Object.entries(source)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = deepMerge(out[k] || {}, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// lee overrides locales
function readLocalOverrides() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// guarda overrides locales
export function writeLocalOverrides(obj) {
  localStorage.setItem(LS_KEY, JSON.stringify(obj || {}));
}

// carga potencial config remota
async function fetchRemoteConfig() {
  try {
    const res = await fetch('/api/config'); // si lo habilitas en el backend
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

// carga completa con prioridades
export async function loadConfig() {
  let cfg = { ...defaults };

  // 1) ENV
  cfg = deepMerge(cfg, envOverrides());

  // 2) REMOTE (opcional, controlado por feature flag)
  if (cfg?.features?.enableRemoteConfig) {
    const remote = await fetchRemoteConfig();
    cfg = deepMerge(cfg, remote);
  }

  // 3) LOCAL STORAGE OVERRIDES
  cfg = deepMerge(cfg, readLocalOverrides());

  return cfg;
}

export { LS_KEY, deepMerge, readLocalOverrides };
