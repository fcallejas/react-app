// File: src/hooks/useIdleSession.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { Modal } from 'antd';
import api from '../utils/api';

/**
 * Control de inactividad con advertencia y opción de mantener sesión.
 * @param {object} options { minutes, warningSeconds, onLogout }
 */
export default function useIdleSession({ minutes = 15, warningSeconds = 60, onLogout }) {
  const timeoutMs = minutes * 60 * 1000;
  const warnAtMs = timeoutMs - warningSeconds * 1000;

  const warnTimer = useRef(null);
  const logoutTimer = useRef(null);

  const [visible, setVisible] = useState(false);

  const handleAutoLogout = useCallback(() => {
    setVisible(false);
    clearTimeout(warnTimer.current);
    clearTimeout(logoutTimer.current);
    onLogout?.();
  }, [onLogout]);

  const resetTimers = useCallback(() => {
    clearTimeout(warnTimer.current);
    clearTimeout(logoutTimer.current);

    warnTimer.current = setTimeout(() => setVisible(true), warnAtMs);
    logoutTimer.current = setTimeout(() => handleAutoLogout(), timeoutMs);
  }, [warnAtMs, timeoutMs, handleAutoLogout]);

  const handleActivity = useCallback(() => {
    if (!visible) resetTimers();
  }, [visible, resetTimers]);

  const keepAlive = useCallback(async () => {
    try {
      const { data } = await api.post('/auth/keep-alive');
      localStorage.setItem('token', data.token);
      setVisible(false);
      resetTimers();
    } catch {
      handleAutoLogout();
    }
  }, [resetTimers, handleAutoLogout]);

  useEffect(() => {
    const events = ['click', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, handleActivity));
    resetTimers();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearTimeout(warnTimer.current);
      clearTimeout(logoutTimer.current);
    };
  }, [handleActivity, resetTimers]);

  const WarningModal = (
    <Modal
      open={visible}
      title="Sesión por expirar"
      onOk={keepAlive}
      onCancel={handleAutoLogout}
      okText="Mantener sesión"
      cancelText="Cerrar sesión"
      centered
      maskClosable={false}
    >
      <p>¿Deseas mantener tu sesión activa? Se cerrará automáticamente si no respondes.</p>
    </Modal>
  );

  return { WarningModal, keepAlive, forceLogout: handleAutoLogout };
}
