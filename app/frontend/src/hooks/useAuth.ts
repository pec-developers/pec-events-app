import { useAuthStore } from '../stores/authStore';
import type { RegisterRequest } from '../api/types/auth.types';

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      await login({ email, password });
      return true;
    } catch {
      return false;
    }
  };

  return {
    handleLogin,
    isLoading,
    error,
    clearError,
  };
};

export const useRegister = () => {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const handleRegister = async (data: RegisterRequest): Promise<boolean> => {
    try {
      await register(data);
      return true;
    } catch {
      return false;
    }
  };

  return {
    handleRegister,
    isLoading,
    error,
    clearError,
  };
};

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    logout,
    checkAuth,
    clearError,
  };
};
