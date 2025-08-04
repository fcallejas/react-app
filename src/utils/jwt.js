// File: src/utils/jwt.js
export function getJwtExpMs(token) {
  try {
    const [, payload] = token.split('.');
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof json.exp === 'number') {
      return json.exp * 1000; // ms
    }
  } catch { /* noop */ }
  return null;
}
