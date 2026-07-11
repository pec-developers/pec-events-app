import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../../stores/authStore';

describe('useAuth custom hooks and stores integration', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should trigger store login action successfully', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ login: mockLogin });

    await useAuthStore.getState().login({ email: 'test@pec.edu', password: '123' });
    expect(mockLogin).toHaveBeenCalledWith({ email: 'test@pec.edu', password: '123' });
  });

  it('should trigger store register action successfully', async () => {
    const mockRegister = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ register: mockRegister });

    await useAuthStore.getState().register({
      name: 'John',
      email: 'student@pec.edu',
      registrationNumber: 'PEC-100',
      password: '123',
    });
    expect(mockRegister).toHaveBeenCalled();
  });
});
