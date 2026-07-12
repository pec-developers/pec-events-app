import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

export const useLogin = () => {
  const loginFn = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (email: string, password?: string, expectedRoleGroup?: 'student' | 'faculty' | 'coordinator' | 'spoc' | 'admin') => {
    setSuccess(false);
    try {
      await loginFn({ email, password, expectedRoleGroup });
      setSuccess(true);
      return true;
    } catch (err) {
      return false;
    }
  };

  return { handleLogin, isLoading, error, success };
};

export const useRegister = () => {
  const registerFn = useAuthStore((state) => state.register);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (payload: {
    registrationNumber: string;
    email: string;
    phoneNumber?: string;
    name: string;
    password?: string;
    role?: string;
  }) => {
    setSuccess(false);
    try {
      await registerFn(payload);
      setSuccess(true);
      return true;
    } catch (err) {
      return false;
    }
  };

  return { handleRegister, isLoading, error, success };
};
