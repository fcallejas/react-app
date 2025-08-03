// File: src/App.jsx
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { IntlProvider } from 'react-intl';

import messagesEs from './i18n/es';
import messagesEn from './i18n/en';

import Login from './pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './routes/PrivateRoute';

const messages = {
  es: messagesEs,
  en: messagesEn
};

export default function App() {
  const defaultLang = localStorage.getItem('lang') || 'es';
  const [locale, setLocale] = useState(defaultLang);

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <Routes>
        <Route path="/login" element={<Login onLanguageChange={setLocale} />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </IntlProvider>
  );
}
