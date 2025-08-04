// File: src/hooks/useRecaptcha.js
import { useEffect, useRef, useState } from 'react';

function injectScript(siteKey) {
  return new Promise((resolve, reject) => {
    if (window.grecaptcha) return resolve(window.grecaptcha);
    const id = 'recaptcha-v3-script';
    if (document.getElementById(id)) {
      // Si ya existe, espera a que grecaptcha esté listo
      const interval = setInterval(() => {
        if (window.grecaptcha) { clearInterval(interval); resolve(window.grecaptcha); }
      }, 50);
      setTimeout(() => { clearInterval(interval); reject(new Error('grecaptcha not ready')); }, 5000);
      return;
    }
    const s = document.createElement('script');
    s.id = id;
    s.async = true;
    s.defer = true;
    s.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    s.onload = () => resolve(window.grecaptcha);
    s.onerror = () => reject(new Error('Failed to load reCAPTCHA script'));
    document.head.appendChild(s);
  });
}

export default function useRecaptcha(siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  const [isReady, setIsReady] = useState(false);
  const keyRef = useRef(siteKey);

  useEffect(() => {
    if (!keyRef.current) return;
    let mounted = true;
    injectScript(keyRef.current)
      .then((grecaptcha) => grecaptcha.ready(() => { if (mounted) setIsReady(true); }))
      .catch(() => setIsReady(false));
    return () => { mounted = false; };
  }, []);

  const execute = async (action = 'submit') => {
    if (!keyRef.current || !window.grecaptcha) return null;
    try {
      return await window.grecaptcha.execute(keyRef.current, { action });
    } catch {
      return null;
    }
  };

  return { isReady, execute };
}
