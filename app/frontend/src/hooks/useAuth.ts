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

export const useForgotPassword = () => {
  const forgotPasswordFn = useAuthStore((state) => state.forgotPassword);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [success, setSuccess] = useState(false);

  const handleForgotPassword = async (identity: string, channel: 'EMAIL' | 'SMS') => {
    setSuccess(false);
    try {
      await forgotPasswordFn({ identity, channel });
      setSuccess(true);
      return true;
    } catch (err) {
      return false;
    }
  };

  return { handleForgotPassword, isLoading, error, success };
};

export const useResetPassword = () => {
  const resetPasswordFn = useAuthStore((state) => state.resetPassword);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (sessionToken: string, otp: string, newPassword?: string) => {
    setSuccess(false);
    try {
      await resetPasswordFn({ sessionToken, otp, newPassword: newPassword || '' });
      setSuccess(true);
      return true;
    } catch (err) {
      return false;
    }
  };

  return { handleResetPassword, isLoading, error, success };
};
