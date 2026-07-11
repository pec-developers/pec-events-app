import { create } from 'zustand';
import { 
  UserResponse, 
  LoginRequest, 
  RegisterRequest, 
  loginUser, 
  registerUser, 
  logoutUser, 
  getCurrentUser 
} from '../api/auth';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: UserResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginUser(payload);
      set({ 
        user: {
          userId: response.userId,
          name: response.name,
          email: response.email,
          role: response.role,
          department: response.department,
          registrationNumber: response.registrationNumber
        }, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await registerUser(payload);
      set({ 
        user: {
          userId: response.userId,
          name: response.name,
          email: response.email,
          role: response.role,
          department: response.department,
          registrationNumber: response.registrationNumber
        }, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (err: any) {
      const message = err.response?.data?.error || err.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logoutUser();
    } catch (err) {
      // Proceed with local logout cleanup even if server request fails
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  checkSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
