import { create } from 'zustand';
import {
  type UserResponse,
  type LoginRequest,
  type RegisterRequest,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  getSPOCs,
  createSPOC,
  updateSPOC,
  deleteSPOC,
  getCoordinators,
  createCoordinator,
  updateCoordinator,
  deleteCoordinator,
  getDeptUsers,
  createDeptUser,
  updateDeptUser,
  deleteDeptUser
} from '../api/auth';

interface AuthState {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  spocs: UserResponse[];
  coordinators: UserResponse[];
  deptUsers: UserResponse[];

  setUser: (user: UserResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;

  fetchSPOCs: () => Promise<void>;
  createSPOC: (payload: { name: string; email: string; department: string; password?: string }) => Promise<void>;
  updateSPOC: (userId: string, payload: { name: string; email: string; department: string; password?: string }) => Promise<void>;
  deleteSPOC: (userId: string) => Promise<void>;

  fetchCoordinators: (department: string) => Promise<void>;
  createCoordinator: (payload: { name: string; email: string; department: string; role: 'STUDENT_COORDINATOR' | 'FACULTY_COORDINATOR'; registrationNumber: string; password?: string }) => Promise<void>;
  updateCoordinator: (userId: string, payload: { name: string; email: string; role: 'STUDENT_COORDINATOR' | 'FACULTY_COORDINATOR'; registrationNumber: string; password?: string }) => Promise<void>;
  deleteCoordinator: (userId: string) => Promise<void>;

  fetchDeptUsers: (department: string) => Promise<void>;
  createDeptUser: (payload: { name: string; email: string; department: string; role: 'STUDENT' | 'FACULTY'; registrationNumber: string; password?: string }) => Promise<void>;
  updateDeptUser: (userId: string, payload: { name: string; email: string; role: 'STUDENT' | 'FACULTY'; registrationNumber: string; password?: string }) => Promise<void>;
  deleteDeptUser: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  spocs: [],
  coordinators: [],
  deptUsers: [],

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
      if (response.accessToken) {
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
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
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
      set({ user: null, isAuthenticated: false, isLoading: false, error: null, spocs: [], coordinators: [], deptUsers: [] });
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
  },

  // Admin SPOC CRUD actions
  fetchSPOCs: async () => {
    set({ isLoading: true, error: null });
    try {
      const spocs = await getSPOCs();
      set({ spocs, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch SPOCs', isLoading: false });
    }
  },

  createSPOC: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await createSPOC(payload);
      const spocs = await getSPOCs();
      set({ spocs, isLoading: false });
    } catch (err: any) {
      const message = err.message || 'Failed to create SPOC';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateSPOC: async (userId, payload) => {
    set({ isLoading: true, error: null });
    try {
      await updateSPOC(userId, payload);
      const spocs = await getSPOCs();
      set({ spocs, isLoading: false });
    } catch (err: any) {
      const message = err.message || 'Failed to update SPOC';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  deleteSPOC: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteSPOC(userId);
      const spocs = await getSPOCs();
      set({ spocs, isLoading: false });
    } catch (err: any) {
      const message = err.message || 'Failed to delete SPOC';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  // SPOC Coordinators CRUD actions
  fetchCoordinators: async (department) => {
    set({ isLoading: true, error: null });
    try {
      const coordinators = await getCoordinators(department);
      set({ coordinators, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch coordinators', isLoading: false });
    }
  },

  createCoordinator: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await createCoordinator(payload);
      const coordinators = await getCoordinators(payload.department);
      set({ coordinators, isLoading: false });
    } catch (err: any) {
      const message = err.message || 'Failed to create coordinator';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateCoordinator: async (userId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const activeUser = get().user;
      const dept = activeUser?.department || 'CSE';
      await updateCoordinator(userId, payload);
      const coordinators = await getCoordinators(dept);
      set({ coordinators, isLoading: false });
    } catch (err: any) {
      const message = err.message || 'Failed to update coordinator';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  deleteCoordinator: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const activeUser = get().user;
      const dept = activeUser?.department || 'CSE';
      await deleteCoordinator(userId);
      const coordinators = await getCoordinators(dept);
      set({ coordinators, isLoading: false });
    } catch (err: any) {
      const message = err.message || 'Failed to delete coordinator';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  // SPOC Students & Faculty CRUD actions
  fetchDeptUsers: async (department) => {
    set({ isLoading: true, error: null });
    try {
      const deptUsers = await getDeptUsers(department);
      set({ deptUsers, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch users', isLoading: false });
    }
  },

  createDeptUser: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await createDeptUser(payload);
      const deptUsers = await getDeptUsers(payload.department);
      set({ deptUsers, isLoading: false });
    } catch (err: any) {
      const message = err.message || 'Failed to create user';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateDeptUser: async (userId, payload) => {
    set({ isLoading: true, error: null });
    try {
      const activeUser = get().user;
      const dept = activeUser?.department || 'CSE';
      await updateDeptUser(userId, payload);
      const deptUsers = await getDeptUsers(dept);
      set({ deptUsers, isLoading: false });
    } catch (err: any) {
      const message = err.message || 'Failed to update user';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  deleteDeptUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const activeUser = get().user;
      const dept = activeUser?.department || 'CSE';
      await deleteDeptUser(userId);
      const deptUsers = await getDeptUsers(dept);
      set({ deptUsers, isLoading: false });
    } catch (err: any) {
      const message = err.message || 'Failed to delete user';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  }
}));
