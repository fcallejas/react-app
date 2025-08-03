// File: src/hooks/useAuth.js

import { useMutation } from '@tanstack/react-query';
import { login, verify2FA } from '../api/auth';

/**
 * Hook personalizado para manejar autenticación y verificación 2FA.
 */
export default function useAuth() {
  // Login (primer paso)
  const loginMutation = useMutation({
    mutationFn: login
  });

  // Verificación de código OTP
  const verifyMutation = useMutation({
    mutationFn: verify2FA,
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  });

  return {
    // Métodos asincrónicos con try/catch
    loginAsync: loginMutation.mutateAsync,
    verify2FAAsync: verifyMutation.mutateAsync,

    // Métodos básicos si prefieres usar callbacks
    login: loginMutation.mutate,
    verify2FA: verifyMutation.mutate,

    // Indicadores de carga y errores
    isLoading: loginMutation.isLoading,
    isVerifying: verifyMutation.isLoading,
    loginError: loginMutation.error,
    verifyError: verifyMutation.error
  };
}
