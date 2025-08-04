// src/routes/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function PrivateRoute() {
  const token = localStorage.getItem('token');
  const lang = localStorage.getItem('lang') || 'es';
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to={`/login?lang=${lang}`}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
