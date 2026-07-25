import { describe, it, expect } from 'vitest';
import { authApi } from '../auth';

describe('authApi', () => {
  it('should successfully log in a user', async () => {
    const response = await authApi.login({
      email: 'john@pec.edu',
      password: 'password123',
    });

    expect(response.userId).toBe('11111111-1111-1111-1111-111111111111');
    expect(response.name).toBe('John Doe');
    expect(response.email).toBe('john@pec.edu');
    expect(response.accessToken).toBe('mock-access-token');
  });

  it('should fail to log in with invalid credentials', async () => {
    await expect(
      authApi.login({
        email: 'invalid@pec.edu',
        password: 'wrongpassword',
      })
    ).rejects.toThrow('Invalid email or password.');
  });

  it('should successfully register a user', async () => {
    const response = await authApi.register({
      name: 'Jane Doe',
      email: 'jane@pec.edu',
      registrationNumber: 'PEC-100235',
      password: 'password123',
    });

    expect(response.userId).toBe('11111111-1111-1111-1111-111111111111');
    expect(response.name).toBe('Jane Doe');
    expect(response.email).toBe('jane@pec.edu');
  });

  it('should successfully log out', async () => {
    const response = await authApi.logout();
    expect(response.message).toBe('Logged out successfully');
  });

  it('should successfully get the active user details', async () => {
    const response = await authApi.getMe();
    expect(response.userId).toBe('11111111-1111-1111-1111-111111111111');
    expect(response.name).toBe('John Doe');
  });
});
