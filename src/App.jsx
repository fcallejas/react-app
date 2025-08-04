// File: src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route,Navigate,useNavigate  } from 'react-router-dom';
import { IntlProvider } from 'react-intl';

import messagesEs from './i18n/es';
import messagesEn from './i18n/en';

import Login from './pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './routes/PrivateRoute';

import useIdleSession from './hooks/useIdleSession';

const messages = {
  es: messagesEs,
  en: messagesEn
};

export default function App() {
  const defaultLang = localStorage.getItem('lang') || 'es';
  const [locale, setLocale] = useState(defaultLang);

  const navigate = useNavigate();
  const { WarningModal, forceLogout } = useIdleSession({
    minutes: Number(import.meta.env.VITE_SESSION_INACTIVITY_MINUTES || 15),
    warningSeconds: Number(import.meta.env.VITE_SESSION_WARNING_SECONDS || 60),
    onLogout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login?lang=' + (localStorage.getItem('lang') || 'es'), { replace: true });
    }
  });

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
     {WarningModal}
      <Routes>
        <Route path="/login" element={<Login onLanguageChange={setLocale} />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        {/* Fallback 404 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </IntlProvider>
  );
}
