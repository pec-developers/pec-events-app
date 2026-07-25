import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    localStorage.clear();
  });

  it('should initiate with default null values', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should successfully log in and update store state & localStorage', async () => {
    await useAuthStore.getState().login({
      email: 'john@pec.edu',
      password: 'password123',
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe('John Doe');
    expect(state.accessToken).toBe('mock-access-token');

    expect(localStorage.getItem('accessToken')).toBe('mock-access-token');
    expect(localStorage.getItem('user')).toContain('John Doe');
  });

  it('should handle login error and set error in store', async () => {
    try {
      await useAuthStore.getState().login({
        email: 'invalid@pec.edu',
        password: 'wrongpassword',
      });
    } catch {
      // Ignored for testing state
    }

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.error).toBe('Invalid email or password.');
  });

  it('should successfully register a user and update store state', async () => {
    await useAuthStore.getState().register({
      name: 'Jane Doe',
      email: 'jane@pec.edu',
      registrationNumber: 'PEC-100235',
      password: 'password123',
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe('Jane Doe');
    expect(state.accessToken).toBe('mock-access-token');
  });

  it('should clear states on logout', async () => {
    // Simulate logged in state first
    useAuthStore.setState({
      user: { userId: '1', name: 'John', email: 'john@pec.edu', role: 'STUDENT', registrationNumber: 'PEC-100234' },
      accessToken: 'token',
      isAuthenticated: true,
    });
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('user', JSON.stringify({ userId: '1' }));

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('should verify authentication on checkAuth call', async () => {
    // Simulate stored token
    localStorage.setItem('accessToken', 'mock-access-token');
    useAuthStore.setState({
      accessToken: 'mock-access-token',
      isAuthenticated: true,
    });

    await useAuthStore.getState().checkAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe('John Doe'); // Loaded from /api/auth/me mock
  });
});
