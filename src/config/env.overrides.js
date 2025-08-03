// Mapea variables de entorno Vite a tu estructura de config
export default function envOverrides(env = import.meta.env) {
  const out = {};

  // API
  if (env.VITE_API_URL) out.api = { ...(out.api || {}), baseURL: env.VITE_API_URL };
  if (env.VITE_API_TIMEOUT_MS) out.api = { ...(out.api || {}), timeoutMs: Number(env.VITE_API_TIMEOUT_MS) };

  // OTP
  if (env.VITE_OTP_LENGTH) out.otp = { length: Number(env.VITE_OTP_LENGTH) };

  // App / i18n
  if (env.VITE_DEFAULT_LANG) out.app = { ...(out.app || {}), defaultLang: env.VITE_DEFAULT_LANG };

  // UI
  if (env.VITE_THEME) out.ui = { ...(out.ui || {}), theme: env.VITE_THEME };

  // Features
  if (env.VITE_ENABLE_REMOTE_CONFIG) {
    out.features = { ...(out.features || {}), enableRemoteConfig: env.VITE_ENABLE_REMOTE_CONFIG === 'true' };
  }

  return out;
}
