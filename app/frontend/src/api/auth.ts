import client from './client';

export interface RegisterRequest {
  registrationNumber: string;
  email: string;
  phoneNumber?: string;
  name: string;
  password?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface ForgotPasswordRequest {
  identity: string;
  channel: 'EMAIL' | 'SMS';
}

export interface ResetPasswordRequest {
  sessionToken: string;
  otp: string;
  newPassword?: string;
}

export interface AuthResponse {
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  registrationNumber: string | null;
  accessToken?: string;
}

export interface UserResponse {
  userId: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  registrationNumber: string | null;
}

export const registerUser = async (payload: RegisterRequest): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/api/auth/register', payload);
  return data;
};

export const loginUser = async (payload: LoginRequest): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/api/auth/login', payload);
  return data;
};

export const logoutUser = async (): Promise<void> => {
  await client.post('/api/auth/logout');
};

export const forgotPassword = async (payload: ForgotPasswordRequest): Promise<void> => {
  await client.post('/api/auth/password/forgot', payload);
};

export const resetPassword = async (payload: ResetPasswordRequest): Promise<void> => {
  await client.post('/api/auth/password/reset', payload);
};

export const getCurrentUser = async (): Promise<UserResponse> => {
  const { data } = await client.get<UserResponse>('/api/auth/me');
  return data;
};
