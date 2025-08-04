// File: src/hooks/useIdleSession.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, message, Statistic } from 'antd';
import { useIntl } from 'react-intl';
import api from '../utils/api';

const { Timer } = Statistic;

function getJwtExpMs(token) {
  try {
    if (!token) return null;
    const [, payload] = token.split('.');
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(base64));
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

export default function useIdleSession({
  minutes = 15,
  warningSeconds = 60,
  expBufferSeconds = 60,
  onLogout,
  enabled // opcional: si no lo pasas, se infiere con el token
}) {
  const intl = useIntl();

  // Timers y deadlines
  const warnTimer = useRef(null);
  const logoutTimer = useRef(null);
  const logoutAtRef = useRef(null);

  // UI
  const [visible, setVisible] = useState(false);
  const [deadline, setDeadline] = useState(null); // ← para Statistic.Countdown

  const isEnabled = (() => {
    if (typeof enabled === 'boolean') return enabled;
    return !!localStorage.getItem('token');
  })();

  const clearTimers = () => {
    clearTimeout(warnTimer.current);
    clearTimeout(logoutTimer.current);
    warnTimer.current = null;
    logoutTimer.current = null;
  };

  const handleAutoLogout = useCallback(() => {
    setVisible(false);
    setDeadline(null);
    clearTimers();
    onLogout?.();
  }, [onLogout]);

  const scheduleTimers = useCallback(() => {
    clearTimers();

    if (!isEnabled) {
      // sin token: no modal, no timers
      setVisible(false);
      setDeadline(null);
      logoutAtRef.current = null;
      return;
    }

    const now = Date.now();
    const token = localStorage.getItem('token');
    const expMs = getJwtExpMs(token);

    // Inactividad
    const timeoutMs = minutes * 60 * 1000;
    const warnAtMs = timeoutMs - warningSeconds * 1000;

    // Expiración JWT (con buffer visual)
    let expTimeoutDelta = Infinity;
    let expWarnDelta = Infinity;
    if (expMs && expMs > now) {
      expTimeoutDelta = expMs - now;
      expWarnDelta = Math.max(0, expTimeoutDelta - expBufferSeconds * 1000);
    }

    // Siguientes eventos
    const nextWarnDelta = Math.min(warnAtMs, expWarnDelta);
    const nextTimeoutDelta = Math.min(timeoutMs, expTimeoutDelta);

    if (nextTimeoutDelta <= 0) {
      handleAutoLogout();
      return;
    }

    // Deadline real de auto-logout
    const target = now + nextTimeoutDelta;
    logoutAtRef.current = target;

    // Mostrar modal al momento de advertencia
    warnTimer.current = setTimeout(() => {
      setDeadline(target);   // ← fija el objetivo del Countdown
      setVisible(true);
    }, Math.max(0, nextWarnDelta));

    // Cerrar sesión efectivamente al timeout
    logoutTimer.current = setTimeout(() => handleAutoLogout(), Math.max(0, nextTimeoutDelta));
  }, [isEnabled, minutes, warningSeconds, expBufferSeconds, handleAutoLogout]);

  const handleActivity = useCallback(() => {
    if (!isEnabled) return;
    if (!visible) scheduleTimers();
  }, [visible, scheduleTimers, isEnabled]);

  const keepAlive = useCallback(async () => {
    try {
      const lang = localStorage.getItem('lang') || 'es';
      const { data } = await api.post('/auth/keep-alive', { lang });
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      message.success(data?.message || intl.formatMessage({ id: 'session.refreshed' }));
      setVisible(false);
      setDeadline(null);
      scheduleTimers(); // reprograma con nuevo JWT
    } catch {
      message.warning(intl.formatMessage({ id: 'session.expired' }));
      handleAutoLogout();
    }
  }, [scheduleTimers, handleAutoLogout, intl]);

  // Sync entre pestañas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') scheduleTimers();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [scheduleTimers]);

  // Montaje: listeners de actividad y timers
  useEffect(() => {
    const events = ['click', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    scheduleTimers();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearTimers();
    };
  }, [handleActivity, scheduleTimers]);

  // Fail-safe: si visible pero ya no hay token, oculta modal
  useEffect(() => {
    if (visible && !isEnabled) {
      setVisible(false);
      setDeadline(null);
    }
  }, [visible, isEnabled]);

  const WarningModal = (
    <Modal
      open={visible}
      title={intl.formatMessage({ id: 'session.title' })}
      onOk={keepAlive}
      onCancel={handleAutoLogout}
      okText={intl.formatMessage({ id: 'session.keep' })}
      cancelText={intl.formatMessage({ id: 'session.logout' })}
      centered
      maskClosable={false}
    >
      <p>{intl.formatMessage({ id: 'session.message' })}</p>
      {deadline && (
        <p style={{ fontWeight: 600 }}>
          {intl.formatMessage({ id: 'session.countdown' }, { s: '' })}
          {/* CountDown controla el tick */}
          <Timer type="countdown"
            key={deadline}              // fuerza reinicio si cambia
            value={deadline}
            //format="s"
            valueStyle={{ fontWeight: 700 }}
            onFinish={handleAutoLogout} // por si el timeout externo se perdiera
          />
        </p>
      )}
    </Modal>
  );

  return { WarningModal, keepAlive, forceLogout: handleAutoLogout };
}
