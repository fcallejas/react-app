import { Navigate, useLocation } from 'react-router-dom';

/**
 * Ruta protegida que redirige al login si no hay token.
 * Incluye el idioma actual como query param.
 */
export default function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  const lang = localStorage.getItem('lang') || 'es'; // usa lang persistido
  const location = useLocation(); // para saber de dónde viene

  return token
    ? children
    : <Navigate to={`/login?lang=${lang}`} state={{ from: location }} replace />;
}
