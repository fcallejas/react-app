// File: src/main.jsx

import React, { useState, useMemo  } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from 'react-intl';

import 'antd/dist/reset.css'; // ✅ IMPORTANTE: estilos de Ant Design
import messagesEs from './i18n/es';
import messagesEn from './i18n/en';

const messages = {
  es: messagesEs,
  en: messagesEn
};

const queryClient = new QueryClient();

// ✅ Cargar idioma guardado o usar 'es' como predeterminado
//const savedLang = localStorage.getItem('lang') || 'es';

// 🔎 Lee lang de la URL si existe; si no, usa localStorage; si no, 'es'
const urlLang = new URLSearchParams(window.location.search).get('lang');
if (urlLang) localStorage.setItem('lang', urlLang);
const initialLang = urlLang || localStorage.getItem('lang') || 'es';

const Root = () => {
  const [lang, setLang] = useState(initialLang);

  // Esta función puede usarse desde App → Login para cambiar idioma
  const handleLanguageChange = (newLang) => {
    localStorage.setItem('lang', newLang);
    setLang(newLang);
  };

   // Evita re-renders innecesarios de mensajes
  const localeMessages = useMemo(() => messages[lang] || messages.es, [lang]);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <IntlProvider locale={lang} messages={localeMessages}>
            <App onLanguageChange={handleLanguageChange} />
          </IntlProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
