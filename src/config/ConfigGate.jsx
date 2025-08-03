// File: src/config/ConfigGate.jsx
import { useEffect, useMemo } from 'react';
import { IntlProvider } from 'react-intl';
import Splash from '../components/Splash';
import useConfig from '../hooks/useConfig';
import messagesEs from '../i18n/es';
import messagesEn from '../i18n/en';

const MESSAGES = { es: messagesEs, en: messagesEn };

export default function ConfigGate({ children }) {
  const { config, loading } = useConfig();

  // Calcula lang SIEMPRE, usando fallbacks seguros cuando no hay config aún
  const urlLang = useMemo(() => {
    try {
      return new URLSearchParams(window.location.search).get('lang');
    } catch {
      return null;
    }
  }, []);

  const storedLang = useMemo(() => {
    try {
      return localStorage.getItem('lang');
    } catch {
      return null;
    }
  }, []);

  const lang = useMemo(() => {
    const base = (urlLang || storedLang || config?.app?.defaultLang || 'es').toLowerCase();
    return base === 'en' ? 'en' : 'es'; // limita a soportados si quieres
  }, [urlLang, storedLang, config]);

  // Sincroniza localStorage si vino ?lang
  useEffect(() => {
    if (urlLang && urlLang !== storedLang) {
      try {
        localStorage.setItem('lang', urlLang);
      } catch {}
    }
  }, [urlLang, storedLang]);

  // Memoiza mensajes SIEMPRE (aunque se muestre Splash)
  const localeMessages = useMemo(() => MESSAGES[lang] || MESSAGES.es, [lang]);

  // Ahora decide qué renderizar, PERO después de llamar hooks
  if (loading || !config) {
    return <Splash />; // ya no rompe el orden de hooks
  }

  return (
    <IntlProvider locale={lang} messages={localeMessages}>
      {children}
    </IntlProvider>
  );
}
