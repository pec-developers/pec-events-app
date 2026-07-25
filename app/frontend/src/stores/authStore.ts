import { create } from 'zustand';
import { authApi } from '../api/auth';
import type { LoginRequest, RegisterRequest, UserResponse } from '../api/types/auth.types';

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  accessToken: localStorage.getItem('accessToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      
      const userObj: UserResponse = {
        userId: response.userId,
        name: response.name,
        email: response.email,
        role: response.role,
        department: response.department,
        registrationNumber: response.registrationNumber,
      };

      const token = response.accessToken || '';
      
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      localStorage.setItem('user', JSON.stringify(userObj));

      set({
        user: userObj,
        accessToken: token || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Login failed',
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      
      const userObj: UserResponse = {
        userId: response.userId,
        name: response.name,
        email: response.email,
        role: response.role,
        department: response.department,
        registrationNumber: response.registrationNumber,
      };

      const token = response.accessToken || '';
      
      if (token) {
        localStorage.setItem('accessToken', token);
      }
      localStorage.setItem('user', JSON.stringify(userObj));

      set({
        user: userObj,
        accessToken: token || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error: err.message || 'Registration failed',
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.logout();
    } catch (err) {
      // Log error but proceed to clear client-side state
      console.error('Logout request failed on backend:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const userObj = await authApi.getMe();
      localStorage.setItem('user', JSON.stringify(userObj));
      set({
        user: userObj,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      // Session is invalid or expired
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
