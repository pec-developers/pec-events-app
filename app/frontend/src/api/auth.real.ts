import client from './client';
import type {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  UserResponse
} from './auth.types';

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

// Admin endpoints
export const getSPOCs = async (): Promise<UserResponse[]> => {
  const { data } = await client.get<UserResponse[]>('/api/admin/spocs');
  return data;
};

export const createSPOC = async (payload: { name: string; email: string; department: string; password?: string }): Promise<UserResponse> => {
  const { data } = await client.post<UserResponse>('/api/admin/spocs', payload);
  return data;
};

export const updateSPOC = async (userId: string, payload: { name: string; email: string; department: string; password?: string }): Promise<UserResponse> => {
  const { data } = await client.put<UserResponse>(`/api/admin/spocs/${userId}`, payload);
  return data;
};

export const deleteSPOC = async (userId: string): Promise<void> => {
  await client.delete(`/api/admin/spocs/${userId}`);
};

// SPOC - Coordinator endpoints
export const getCoordinators = async (department: string): Promise<UserResponse[]> => {
  const { data } = await client.get<UserResponse[]>(`/api/spoc/coordinators?department=${department}`);
  return data;
};

export const createCoordinator = async (payload: { name: string; email: string; department: string; role: 'STUDENT_COORDINATOR' | 'FACULTY_COORDINATOR'; registrationNumber: string; password?: string }): Promise<UserResponse> => {
  const { data } = await client.post<UserResponse>('/api/spoc/coordinators', payload);
  return data;
};

export const updateCoordinator = async (userId: string, payload: { name: string; email: string; role: 'STUDENT_COORDINATOR' | 'FACULTY_COORDINATOR'; registrationNumber: string; password?: string }): Promise<UserResponse> => {
  const { data } = await client.put<UserResponse>(`/api/spoc/coordinators/${userId}`, payload);
  return data;
};

export const deleteCoordinator = async (userId: string): Promise<void> => {
  await client.delete(`/api/spoc/coordinators/${userId}`);
};

// SPOC - User endpoints
export const getDeptUsers = async (department: string): Promise<UserResponse[]> => {
  const { data } = await client.get<UserResponse[]>(`/api/spoc/users?department=${department}`);
  return data;
};

export const createDeptUser = async (payload: { name: string; email: string; department: string; role: 'STUDENT' | 'FACULTY'; registrationNumber: string; password?: string }): Promise<UserResponse> => {
  const { data } = await client.post<UserResponse>('/api/spoc/users', payload);
  return data;
};

export const updateDeptUser = async (userId: string, payload: { name: string; email: string; role: 'STUDENT' | 'FACULTY'; registrationNumber: string; password?: string }): Promise<UserResponse> => {
  const { data } = await client.put<UserResponse>(`/api/spoc/users/${userId}`, payload);
  return data;
};

export const deleteDeptUser = async (userId: string): Promise<void> => {
  await client.delete(`/api/spoc/users/${userId}`);
};
