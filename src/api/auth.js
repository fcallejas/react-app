// File: src/api/auth.js
import api from './axios';

/**
 * Devuelve el idioma actual desde localStorage o por defecto 'es'.
 */
const getLang = () => localStorage.getItem('lang') || 'es';

/**
 * Realiza el inicio de sesión enviando usuario, contraseña y el idioma.
 */
export const login = async ({ username, password,recaptchaToken }) => {
  const lang = getLang();
  const response = await api.post('/auth/login', { username, password, lang,recaptchaToken });
  return response.data;
};

/**
 * Verifica el código OTP y envía el idioma actual.
 */
export const verify2FA = async ({ userId, code }) => {
  const lang = getLang();
  const response = await api.post('/auth/verify2fa', { userId, code, lang });
  return response.data;
};

