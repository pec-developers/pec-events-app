import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should authenticate user on successful login', async () => {
    await useAuthStore.getState().login({
      email: 'student@pec.edu',
      password: 'password123',
    });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe('student@pec.edu');
    expect(state.user?.role).toBe('STUDENT');
    expect(state.error).toBeNull();
  });

  it('should set error state on failed login', async () => {
    try {
      await useAuthStore.getState().login({
        email: 'invalid@pec.edu',
        password: 'wrongpassword',
      });
    } catch (err) {
      // Expected
    }

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.error).toBe('Invalid email or password.');
  });

  it('should load active session on checkSession', async () => {
    await useAuthStore.getState().checkSession();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.user?.email).toBe('test@pec.edu');
  });

  it('should clear authentication state on logout', async () => {
    // Set authenticated state first
    useAuthStore.setState({
      user: {
        userId: '123',
        name: 'John',
        email: 'test@pec.edu',
        role: 'STUDENT',
        department: 'CSE',
        registrationNumber: 'PEC-100234',
      },
      isAuthenticated: true,
    });

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
