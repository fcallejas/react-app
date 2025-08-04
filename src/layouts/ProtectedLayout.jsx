// src/layouts/ProtectedLayout.jsx
import { Outlet, useNavigate } from 'react-router-dom';
import useIdleSession from '../hooks/useIdleSession.jsx';

export default function ProtectedLayout() {
  const navigate = useNavigate();

  const { WarningModal } = useIdleSession({
    minutes: Number(import.meta.env.VITE_SESSION_INACTIVITY_MINUTES || 15),
    warningSeconds: Number(import.meta.env.VITE_SESSION_WARNING_SECONDS || 60),
    expBufferSeconds: Number(import.meta.env.VITE_JWT_EXP_BUFFER_SECONDS || 60),
    onLogout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const lang = localStorage.getItem('lang') || 'es';
      navigate(`/login?lang=${lang}`, { replace: true });
    },
    enabled: !!localStorage.getItem('token'),
  });

  return (
    <>
      {WarningModal}
      <Outlet />
    </>
  );
}
